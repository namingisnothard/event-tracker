import { AS_OF, RANGE_END, MONTHS, CATEGORIES, date, occursOn, overlapsMonth, filterEvents, monthDays, dateLabel, makeICS } from './core.js';
import { createEventMap, groupEventsByCity } from './map-view.js';

const paths = {
  compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"/>',
  bookmark:'<path d="M6 4h12v17l-6-4-6 4V4Z"/>',
  music:'<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/>',
  tennis:'<ellipse cx="14" cy="9" rx="6" ry="8" transform="rotate(38 14 9)"/><path d="m9 15-6 7M9 6l8 6M7 10l7 6M11 3l8 6"/>',
  paddle:'<path d="M18 3a7 7 0 0 1 0 10c-2 2-5 3-7 2l-6 7-3-3 7-6C4 5 12-2 18 3Z"/><path d="m6 7 11 9"/><circle cx="20" cy="21" r="2"/>',
  art:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 16 5-5 5 6 4-4 4 4"/><circle cx="15" cy="8" r="2"/>',
  design:'<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  landmark:'<path d="m3 8 9-5 9 5H3ZM5 10v8M10 10v8M14 10v8M19 10v8M3 21h18"/>',
  fashion:'<path d="M10 5a2 2 0 0 1 4 0c0 2-2 2-2 4v2L3 17v3h18v-3l-9-6"/>',
  film:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4M7 12h10"/>',
  sparkles:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4M18 4h4"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  trophy:'<path d="M7 3h10v5c0 7-10 7-10 0V3ZM12 14v6M7 21h10M7 5H3v3c0 3 3 4 5 4M17 5h4v3c0 3-3 4-5 4"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  'chevron-down':'<path d="m7 10 5 5 5-5"/>',
  'chevron-left':'<path d="m14 6-6 6 6 6"/>',
  'chevron-right':'<path d="m10 6 6 6-6 6"/>',
  reset:'<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
  list:'<path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1"/>',
  map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5ZM9 3v16M15 5v16"/>',
  book:'<path d="M12 6c-3-3-7-3-10-2v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2ZM12 6v15"/>',
  stars:'<path d="M19 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10ZM18 2v6M15 5h6"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  external:'<path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>',
  check:'<path d="m5 12 4 4L19 6"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.sparkles}</svg>`;
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
const $ = s => document.querySelector(s);
const escape = s => String(s ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const safeUrl = s => { try { const u = new URL(s); return u.protocol === 'https:' ? escape(u.href) : '#'; } catch { return '#'; } };
const params = new URLSearchParams(location.search);
const now = new Date();
const TODAY = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
const checkedLabel = value => date(value).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
let saved = [];
try { const s = JSON.parse(localStorage.getItem('elsewhere-shortlist-v1') || '[]'); if (Array.isArray(s)) saved = s.filter(x => typeof x === 'string'); } catch { /* A disabled store still allows a session shortlist. */ }
const state = { month: Math.min(11, Math.max(8, Number(params.get('month') || 9) - 1)), view: ['list','map'].includes(params.get('view')) ? params.get('view') : 'calendar', mapAll:params.get('range')==='all', region:['eu-schengen','eu','schengen'].includes(params.get('region'))?params.get('region'):'', search: params.get('q') || '', country: params.get('country') || '', city: params.get('city') || '', category: CATEGORIES[params.get('category')] ? params.get('category') : '', publicOnly: params.get('public') === '1', savedOnly: params.get('saved') === '1' };
if (!Number.isFinite(state.month)) state.month = 8;
let events = [], filtered = [], coverage = null, lastUpdated = AS_OF, toastTimer;
let mapView = null;
const dialog = $('#detail-dialog');
const categoryHTML = e => `<span class="event-category" style="--cat-color:${CATEGORIES[e.category].color}"><span class="category-dot"></span>${escape(CATEGORIES[e.category].label)}</span>`;
const shortTitle = e => e.scheduleType === 'window' ? 'World darts · window' : ({ 'backstreet-boys-dusseldorf':'Backstreet Boys', 'celine-dion-paris':'Céline Dion', 'bigbang-paris':'BIGBANG', 'bigbang-london':'BIGBANG', 'european-open-brussels-2026':'European Open', 'european-table-tennis-2026':'European TT Championships', 'venice-biennale-arte-2026':'Venice Biennale', 'bfi-london-film-festival-2026':'BFI London Film Festival', 'milan-fashion-week-ss27':'Milan Fashion Week', 'paris-fashion-week-ss27':'Paris Fashion Week', 'london-fashion-week-ss27':'London Fashion Week' }[e.id] || e.title.split(' · ')[0]);
const imageFor = e => e.category === 'literature' ? 'books' : e.category === 'astronomy' ? 'sky' : e.category === 'music' ? 'music' : ['tennis','table-tennis','sport'].includes(e.category) ? 'tennis' : 'art';
const locationLabel = e => e.geographicScope==='europe-wide'?'Across Europe':`${e.city}, ${e.country}`;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2900); }
function updateURL() {
  const p = new URLSearchParams();
  if (state.month !== 8) p.set('month', state.month + 1);
  if (state.view !== 'calendar') p.set('view', state.view);
  if (state.view !== 'calendar' && state.mapAll) p.set('range','all');
  for (const [key,value] of Object.entries({q:state.search,region:state.region,country:state.country,city:state.city,category:state.category,public:state.publicOnly?'1':'',saved:state.savedOnly?'1':''})) if (value) p.set(key,value);
  history.replaceState(null, '', location.pathname + (p.size ? `?${p}` : ''));
}
function setFilters(patch, jump = true) {
  Object.assign(state, patch);
  filtered = filterEvents(events, state, saved);
  if (jump && filtered.length && !filtered.some(e => overlapsMonth(e, state.month))) {
    const month = [8,9,10,11].find(m => filtered.some(e => overlapsMonth(e,m)));
    if (month !== undefined) state.month = month;
  }
  render();
}
function resetFilters() { setFilters({search:'',region:'',country:'',city:'',category:'',publicOnly:false,savedOnly:false,mapAll:false}); }
function renderNav() {
  $('#category-nav').innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => `<button class="category-button ${state.category === key ? 'active' : ''}" data-category="${key}" aria-pressed="${state.category === key}">${icon(cat.icon)}<span>${cat.label}</span><span class="category-count">${events.filter(e=>e.category===key).length}</span></button>`).join('');
  $('#saved-count').textContent = saved.length;
  document.querySelectorAll('[data-nav]').forEach(b => b.classList.toggle('active', (b.dataset.nav === 'saved') === state.savedOnly));
  $('#active-categories').innerHTML = `<button class="filter-chip ${!state.category?'active':''}" data-category="" aria-pressed="${!state.category}">All events</button>` + Object.entries(CATEGORIES).filter(([key])=>key !== 'technology' && key !== 'sport').map(([key,cat])=>`<button class="filter-chip ${state.category===key?'active':''}" data-category="${key}" aria-pressed="${state.category===key}" style="--cat-color:${cat.color}"><span class="category-dot"></span>${cat.label === 'Table tennis' ? 'WTT & more' : cat.label}</button>`).join('') + (['technology','sport'].includes(state.category) ? `<button class="filter-chip active" data-category="${state.category}">${CATEGORIES[state.category].label}</button>`:'');
}
function renderSelects() {
  const locatedEvents=filterEvents(events,{region:state.region}).filter(e=>e.geographicScope!=='europe-wide');
  const countries = [...new Set(locatedEvents.map(e => e.country))].sort();
  if (state.country && !countries.includes(state.country)) state.country = '';
  const cities = [...new Set(locatedEvents.filter(e => !state.country || e.country === state.country).map(e=>e.city))].sort();
  if (state.city && !cities.includes(state.city)) state.city = '';
  $('#country').innerHTML = '<option value="">All countries</option>' + countries.map(c=>`<option value="${escape(c)}">${escape(c)}</option>`).join('');
  $('#city').innerHTML = '<option value="">All cities</option>' + cities.map(c=>`<option value="${escape(c)}">${escape(c)}</option>`).join('');
  $('#country').value = state.country; $('#city').value = state.city; $('#search').value = state.search; $('#public-only').checked = state.publicOnly;
}
function renderFeatured() {
  const picks = ['backstreet-boys-dusseldorf','laver-cup-2026','art-basel-paris-2026'].map(id=>events.find(e=>e.id===id)).filter(Boolean);
  const labels = ['A little nostalgia, live','Rivalry at its finest','An art-filled autumn'];
  $('#featured-grid').innerHTML = picks.map((e,i)=>`<article class="featured-card"><img src="./assets/${imageFor(e)}.jpg" alt="" width="600" height="350"><button class="featured-open" data-event="${e.id}" aria-label="View ${escape(e.title)}"><span class="feature-tag">${icon(CATEGORIES[e.category].icon)}${labels[i].toUpperCase()}</span><h3>${escape(shortTitle(e))}</h3><span class="feature-meta">${icon('pin')}${escape(e.city)}<span class="meta-dot">·</span>${escape(dateLabel(e))}${e.dates?' · selected nights':''}</span><span class="featured-arrow">↗</span></button><button class="feature-save ${saved.includes(e.id)?'is-saved':''}" data-save="${e.id}" aria-label="${saved.includes(e.id)?'Remove':'Save'} ${escape(shortTitle(e))}" aria-pressed="${saved.includes(e.id)}">${icon('bookmark')}</button></article>`).join('');
}
function orderedDayEvents(day) {
  return filtered.filter(e=>occursOn(e,day)).sort((a,b)=>{
    const priority = e => (e.dates?.includes(day) || e.startDate === day ? -1000 : 0) + (date(e.endDate)-date(e.startDate))/86400000;
    return priority(a)-priority(b) || a.title.localeCompare(b.title);
  });
}
function renderCalendar(monthEvents) {
  if (!filtered.length) return emptyState();
  return (!monthEvents.length ? `<div class="result-message">No matching events this month. Try another month above.</div>`:'') + `<div class="calendar-scroll-hint">Scroll sideways to see the full week <span aria-hidden="true">↔</span></div><div class="calendar-scroll" role="region" aria-label="Monthly calendar" tabindex="0"><div class="weekday-row">${['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-grid">${monthDays(state.month).map(day=>{
    const d = date(day); const outside = d.getUTCMonth() !== state.month; const past = day < AS_OF; const dayEvents = !outside ? orderedDayEvents(day) : [];
    return `<div class="day-cell ${outside?'outside':''} ${past?'past':''} ${day===TODAY?'today':''} ${[0,6].includes(d.getUTCDay())?'weekend':''}"><div class="day-heading">${day===TODAY?'<span class="today-label">Today</span>':''}<button class="day-number" ${outside || past?'disabled':''} data-day="${day}" aria-label="${d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})}, ${dayEvents.length} events">${d.getUTCDate()}</button></div>${dayEvents.slice(0,3).map(e=>`<button class="calendar-event" data-event="${e.id}" title="${escape(e.title)} · ${escape(locationLabel(e))}" aria-label="${escape(e.title)} in ${escape(locationLabel(e))} on ${day}" style="--cat-color:${CATEGORIES[e.category].color}"><span class="calendar-event-body"><span class="calendar-event-content">${escape(shortTitle(e))}</span><span class="calendar-event-location">${escape(locationLabel(e))}</span></span>${e.startDate !== day && !e.dates?'<span class="continuation" aria-hidden="true">↔</span>':''}</button>`).join('')}${dayEvents.length>3?`<button class="more-events" data-day="${day}">+${dayEvents.length-3} more</button>`:''}</div>`;
  }).join('')}</div></div>`;
}
function emptyState(monthOnly = false) {
  return `<div class="empty-state"><span>✳</span><h3>${state.savedOnly && !saved.length?'A little room for possibility.':'Nothing on the calendar. Yet.'}</h3><p>${state.savedOnly && !saved.length?'Tap the bookmark on an event to start your shortlist.':monthOnly?'Try another month to find your next great plan.':'Try a different search, place, or category.'}</p><button class="small-button" data-reset>Explore all events ${icon('external')}</button></div>`;
}
function renderList(monthEvents) {
  if (!monthEvents.length) return emptyState(filtered.length>0);
  return `<div class="event-list">${monthEvents.map(e=>{
    const first = e.dates?.filter(d=>(state.mapAll || Number(d.slice(5,7))===state.month+1) && d>=AS_OF)[0] || (e.startDate < AS_OF ? AS_OF : e.startDate);
    return `<article class="event-row"><div class="event-date"><strong>${date(first).getUTCDate()}</strong><span>${date(first).toLocaleDateString('en-GB',{month:'short',timeZone:'UTC'})}</span></div><button class="event-row-main" data-event="${e.id}">${categoryHTML(e)}<h4>${escape(e.title)}</h4><p>${escape(dateLabel(e))} · ${escape(e.city)}${e.dates?' · selected dates':''}${e.access==='Industry / invitation'?' · Invitation only':''}</p></button><div class="row-location">${escape(e.city)}<span>${escape(e.country)}</span></div><button class="icon-button row-save ${saved.includes(e.id)?'is-saved':''}" data-save="${e.id}" aria-label="${saved.includes(e.id)?'Remove':'Save'} ${escape(e.title)}" aria-pressed="${saved.includes(e.id)}">${icon('bookmark')}</button></article>`;
  }).join('')}</div>`;
}
function renderCoverage() {
  if (!coverage) return;
  const q=$('#coverage-search').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const located=events.filter(e=>e.geographicScope!=='europe-wide');
  const countries=coverage.countries.filter(c=>[c.country,c.nameZh,...c.screenedCities,...located.filter(e=>e.country===c.country).map(e=>e.city)].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q));
  $('#coverage-summary').textContent=`${new Set(located.map(e=>e.city+'|'+e.country)).size} cities with events`;
  $('#coverage-grid').innerHTML=countries.map(c=>{
    const selected=located.filter(e=>e.country===c.country);
    const cities=[...new Set(selected.map(e=>e.city))].sort();
    const pending=coverage.pending.filter(p=>p.country===c.country);
    const badge=c.eu&&c.schengen?'EU · Schengen':c.eu?'EU · outside Schengen':c.schengen?'Schengen · outside EU':'Other Europe';
    return `<details class="country-card" ${q?'open':''}><summary><span><strong>${escape(c.nameZh)} <span>${escape(c.country)}</span></strong><small>${badge}</small></span><b>${selected.length}<small> events</small></b></summary><div class="country-body"><p class="screened-cities" lang="zh">初筛／已有来源覆盖：${escape(c.screenedCities.join('、'))}</p>${cities.map(city=>`<section class="country-city"><h3>${escape(city)}</h3>${selected.filter(e=>e.city===city).map(e=>`<button class="country-event" data-event="${escape(e.id)}"><span>${escape(e.title)}</span><small>${escape(dateLabel(e))}</small></button>`).join('')}</section>`).join('')}${!selected.length?'<p lang="zh">本轮未确认可入日历的活动；不代表该国没有活动。</p>':''}${pending.length?`<div class="country-pending"><h3 lang="zh">待确认 · 不在日历中</h3>${pending.map(p=>`<p><a href="${safeUrl(p.url)}" target="_blank" rel="noopener noreferrer">${escape(p.city)} · ${escape(p.title)} ↗</a><br><span lang="zh">${escape(p.reason)}</span>${p.additionalUrl?` <a href="${safeUrl(p.additionalUrl)}" target="_blank" rel="noopener noreferrer">另一官方页面 ↗</a>`:''}</p>`).join('')}</div>`:''}</div></details>`;
  }).join('')||'<p lang="zh">没有匹配的国家或城市。</p>';
}
function render() {
  renderSelects(); filtered = filterEvents(events,state,saved);
  renderNav(); renderFeatured();
  const monthEvents = filtered.filter(e=>overlapsMonth(e,state.month));
  const showAllMapDates=state.view!=='calendar' && state.mapAll;
  $('#region').value=state.region;
  $('#all-dates').checked=showAllMapDates;
  const mapEvents=showAllMapDates?filtered:monthEvents;
  $('#event-count').textContent = events.length;
  $('#country-count').textContent = new Set(events.filter(e=>e.geographicScope!=='europe-wide').map(e=>e.country)).size;
  $('#explorer-title').textContent = state.savedOnly ? 'Your personal shortlist' : 'Your next great plan';
  $('#result-count').textContent = state.view==='map'?`${mapEvents.length} events · ${groupEventsByCity(mapEvents).filter(g=>!g.isRegional).length} cities · ${showAllMapDates?'rest of 2026':'this month'}`:`${showAllMapDates?filtered.length:monthEvents.length} ${showAllMapDates?'across Sep–Dec':'this month'} · ${filtered.length} ${state.savedOnly?'saved':'matching'} in 2026`;
  $('#month-title').innerHTML = `${showAllMapDates?'Sep – Dec':MONTHS[state.month-8]} <span>2026</span>`;
  $('#month-tabs').innerHTML = MONTHS.map((m,i)=>`<button class="month-tab ${state.month===i+8&&!showAllMapDates?'active':''}" data-month="${i+8}" aria-label="${m} 2026" aria-pressed="${state.month===i+8&&!showAllMapDates}">${m.slice(0,3)}</button>`).join('');
  $('#previous-month').disabled = showAllMapDates || state.month===8; $('#next-month').disabled = showAllMapDates || state.month===11;
  $('#export-button').disabled = !filtered.length;
  $('#export-button').title = `Export all ${filtered.length} matching events, September–December 2026`;
  for (const view of ['calendar','list','map']) { $(`#${view}-view`).classList.toggle('active',state.view===view); $(`#${view}-view`).setAttribute('aria-pressed',state.view===view); }
  if(state.view==='map'){
    if(!mapView)mapView=createEventMap($('#results'),{onEvent:showEvent,onSave:saveEvent,onScope:all=>setFilters({mapAll:all},false)});
    mapView.update(mapEvents,{saved,label:showAllMapDates?'Sep–Dec 2026':`${MONTHS[state.month-8]} 2026`,allMonths:state.mapAll,monthLabel:MONTHS[state.month-8]});
  }else{
    mapView?.destroy();mapView=null;
    $('#results').innerHTML = state.view==='calendar'?renderCalendar(monthEvents):renderList(mapEvents);
  }
  updateURL();
}
function saveEvent(id) {
  const existed = saved.includes(id); saved = existed ? saved.filter(x=>x!==id) : [...saved,id];
  let persisted = true;
  try { localStorage.setItem('elsewhere-shortlist-v1',JSON.stringify(saved)); } catch { persisted=false; }
  render();
  if (dialog.open && dialog.dataset.event === id) showEvent(id);
  toast(existed?'Removed from your shortlist':persisted?'A good plan. Saved to your shortlist.':'Saved for this visit. Browser storage is unavailable.');
}
function openDialog(html) { dialog.innerHTML=html; if (!dialog.open) dialog.showModal(); }
const closeButton = `<button class="modal-close" data-close aria-label="Close dialog">${icon('close')}</button>`;
function showEvent(id) {
  const e=events.find(e=>e.id===id); if(!e)return;
  dialog.dataset.event = id;
  const allNotes=[e.accessNote,e.notes,e.ticketNote,e.scheduleNote].filter(Boolean);
  const sourceLinks=[...new Set([e.sourceUrl,...(e.sourceUrls||[])].filter(Boolean))];
  openDialog(`${closeButton}<div class="modal-hero"><img src="./assets/${imageFor(e)}.jpg" alt=""><span class="photo-label">Editorial imagery · Unsplash</span></div><div class="modal-content">${categoryHTML(e)}<h2>${escape(e.title)}</h2><div class="modal-meta"><div>${icon('calendar')}<span>${escape(dateLabel(e,true))}${e.endDate>'2026-12-31'?' · continues into 2027':' · 2026'}</span></div><div>${icon('pin')}<span>${escape(e.venue)}<br>${escape(locationLabel(e))}</span></div></div><p class="modal-description">${escape(e.description)}</p>${e.dates?.length?`<p class="show-dates"><strong>Scheduled dates:</strong> ${e.dates.map(d=>date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'})).join(' · ')}</p>`:''}<div class="access-note"><strong>${escape(e.access||'Check official tickets')}</strong>${allNotes.length?`<br>${allNotes.map(escape).join('<br>')}`:''}<br>${e.geographicScope==='europe-wide'?'Check the viewing guidance; cloud, moonlight and your location affect visibility.':'Check individual session times and current availability with the organiser.'}</div><div class="modal-actions"><a class="primary-button" href="${safeUrl(e.url)}" target="_blank" rel="noopener noreferrer">${e.geographicScope==='europe-wide'?'Viewing guide & source':'Official event & tickets'} ${icon('external')}</a><button class="small-button ${saved.includes(e.id)?'is-saved':''}" data-save="${e.id}">${icon('bookmark')}${saved.includes(e.id)?'Saved':'Save event'}</button><button class="small-button" data-export="${e.id}" aria-label="Add ${escape(e.title)} to calendar">${icon('calendar')} Add to calendar</button></div><div class="source-line"><span>${sourceLinks.map((url,i)=>`<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${i?'Additional source':'Official source'} ↗</a>`).join(' · ')}</span><span>Checked ${escape(checkedLabel(e.verifiedAt || AS_OF))}</span></div></div>`);
}
function showDay(day) {
  delete dialog.dataset.event;
  const dayEvents=orderedDayEvents(day);
  openDialog(`${closeButton}<div class="modal-content about-content"><span class="eyebrow">A DAY OF POSSIBILITIES</span><h2>${date(day).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'})}</h2><p class="modal-subtitle">${dayEvents.length} events matching your filters.</p>${dayEvents.length?dayEvents.map(e=>`<div class="day-event"><button data-event="${e.id}">${categoryHTML(e)}<h4>${escape(e.title)}</h4><p>${escape(locationLabel(e))} · ${escape(e.access)}</p></button><button class="icon-button ${saved.includes(e.id)?'is-saved':''}" data-save="${e.id}" aria-label="${saved.includes(e.id)?'Remove':'Save'} ${escape(e.title)}">${icon('bookmark')}</button></div>`).join(''):'<p class="modal-description">Leave a little room for wandering. Or try another date.</p>'}</div>`);
  dialog.dataset.day=day;
}
function showAbout() {
  delete dialog.dataset.event; delete dialog.dataset.day;
  openDialog(`${closeButton}<div class="modal-content about-content"><span class="eyebrow">THE ELSEWHERE FIELD NOTES</span><h2>A considered collection.<br>An open invitation.</h2><p class="modal-description">${events.length} handpicked events across ${new Set(events.filter(e=>e.geographicScope!=='europe-wide').map(e=>e.country)).size} European countries, covering 12 September to 31 December 2026. Major stages, sporting occasions, and art worth travelling for.</p><ul><li>Each event links to an official organiser, venue, federation or city source. Latest additions were checked on <strong>${escape(checkedLabel(lastUpdated))}</strong>; each listing shows its own verification date.</li><li>This is a curated snapshot, not a complete directory or a live ticket feed. Ticket availability and schedules can change.</li><li>Concert residencies use their actual performance dates. Festival and exhibition ranges may have varying opening hours; check individual programmes.</li><li>Fashion weeks may need industry accreditation or invitations. The “Public access only” filter excludes invitation-only listings; mixed-access events can still have restricted sessions.</li><li>Sky phenomena are listed as Europe-wide viewing windows. They remain visible when you filter by a country or city and appear separately from city markers on the map. Clear skies and suitable local conditions are needed.</li><li>Your shortlist is saved in this browser. Export downloads an .ics file for Apple Calendar, Google Calendar or Outlook. Calendar dates are all-day planning reminders.</li></ul><p class="modal-subtitle">Photographs are illustrative editorial images from Unsplash; they do not depict the listed events or expected night-sky views.</p></div>`);
}
function downloadCalendar(selection) {
  if(!selection.length)return;
  const blob=new Blob([makeICS(selection)],{type:'text/calendar;charset=utf-8'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=selection.length===1?`elsewhere-${selection[0].id}.ics`:'elsewhere-europe-2026.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast(`Exported ${selection.length} ${selection.length===1?'event':'events'} to your calendar file.`);
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(button?.hasAttribute('data-save')) { saveEvent(button.dataset.save); if(dialog.open && dialog.dataset.day && !dialog.dataset.event)showDay(dialog.dataset.day); return; }
  if(button?.hasAttribute('data-event')) { delete dialog.dataset.day; showEvent(button.dataset.event);return; }
  if(button?.hasAttribute('data-day')) {showDay(button.dataset.day);return;}
  if(button?.hasAttribute('data-close')){dialog.close();return;}
  if(button?.hasAttribute('data-category')){setFilters({category:button.dataset.category===state.category?'':button.dataset.category});$('#sidebar').classList.remove('open');return;}
  if(button?.hasAttribute('data-month')){setFilters({month:Number(button.dataset.month),mapAll:false},false);return;}
  if(button?.hasAttribute('data-reset')){resetFilters();return;}
  if(button?.hasAttribute('data-export')){downloadCalendar(events.filter(e=>e.id===button.dataset.export));return;}
  if(button?.hasAttribute('data-nav')){setFilters({savedOnly:button.dataset.nav==='saved'});$('#sidebar').classList.remove('open');$('#calendar-section').scrollIntoView({behavior:'smooth'});return;}
  if($('#sidebar').classList.contains('open') && !event.target.closest('.sidebar') && !event.target.closest('#menu-button'))$('#sidebar').classList.remove('open');
});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$('#search').addEventListener('input',e=>setFilters({search:e.target.value}));
$('#country').addEventListener('change',e=>setFilters({country:e.target.value,city:''}));
$('#city').addEventListener('change',e=>setFilters({city:e.target.value}));
$('#region').addEventListener('change',e=>setFilters({region:e.target.value,country:'',city:''}));
$('#all-dates').addEventListener('change',e=>setFilters({mapAll:e.target.checked,view:state.view==='calendar'&&e.target.checked?'list':state.view},false));
$('#coverage-search').addEventListener('input',renderCoverage);
$('#public-only').addEventListener('change',e=>setFilters({publicOnly:e.target.checked}));
$('#reset-button').addEventListener('click',resetFilters);
$('#previous-month').addEventListener('click',()=>setFilters({month:Math.max(8,state.month-1)},false));
$('#next-month').addEventListener('click',()=>setFilters({month:Math.min(11,state.month+1)},false));
$('#today-button').addEventListener('click',()=>setFilters({month:Math.min(11,Math.max(8,Number(TODAY.slice(5,7))-1)),mapAll:false},false));
$('#calendar-view').addEventListener('click',()=>setFilters({view:'calendar'},false));
$('#list-view').addEventListener('click',()=>setFilters({view:'list'},false));
$('#map-view').addEventListener('click',()=>setFilters({view:'map'},false));
$('#top-shortlist').addEventListener('click',()=>{setFilters({savedOnly:!state.savedOnly});$('#calendar-section').scrollIntoView({behavior:'smooth'});});
$('#export-button').addEventListener('click',()=>downloadCalendar(filtered));
$('#about-button').addEventListener('click',showAbout); $('#sources-button').addEventListener('click',showAbout);
$('#menu-button').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menu-button').setAttribute('aria-expanded',String(open));});
new MutationObserver(()=>$('#menu-button').setAttribute('aria-expanded',String($('#sidebar').classList.contains('open')))).observe($('#sidebar'),{attributes:true,attributeFilter:['class']});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)&&!dialog.open){e.preventDefault();$('#search').focus();}if(e.key==='Escape')$('#sidebar').classList.remove('open');});
try {
  const response=await fetch('./events.json');if(!response.ok)throw Error('Could not load events');
  const data=await response.json();events=data.events;coverage=data.coverage;lastUpdated=data.lastUpdated||data.asOf;
  $('#collection-updated').textContent=`Independently curated · Updated ${checkedLabel(lastUpdated)}`;
  $('#today-label').textContent=`Today, ${checkedLabel(TODAY)}`;
  renderCoverage();
  saved=saved.filter(id=>events.some(e=>e.id===id));
  render();
}catch(error){$('#results').innerHTML='<div class="empty-state"><h3>The calendar needs a moment.</h3><p>Event data could not be loaded. Reload the page to try again.</p></div>';$('#featured-grid').innerHTML='';$('#result-count').textContent='Could not load events';console.error(error);}
