import { CITY_COORDINATES } from './geo-data.js';
import { CATEGORIES, dateLabel } from './core.js';

const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function groupEventsByCity(events) {
  const cities = new Map();
  for (const event of events) {
    const key = `${event.city}|${event.country}`;
    if (!cities.has(key)) cities.set(key, { key, city:event.city, country:event.country, isRegional:event.geographicScope==='europe-wide', coordinates:event.geographicScope==='europe-wide'?null:CITY_COORDINATES[key] || null, events:[] });
    cities.get(key).events.push(event);
  }
  return [...cities.values()].sort((a,b)=>Number(b.isRegional)-Number(a.isRegional)||b.events.length-a.events.length || a.city.localeCompare(b.city));
}

const bookmark = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4V4Z"/></svg>';

export function createEventMap(container, { onEvent, onSave, onScope }) {
  container.innerHTML = `<section class="map-explorer" aria-label="Events on a map">
    <div class="map-heading"><div><strong>Good plans, on the map.</strong><span class="map-count-summary" aria-live="polite"></span></div><div class="map-range-switch" aria-label="Map date range"><button data-map-scope="month">This month</button><button data-map-scope="all">Rest of 2026</button></div></div>
    <div class="map-sky-note" hidden></div><div class="map-layout"><div class="map-stage"><div id="event-map" class="event-map" aria-label="Interactive map of European event cities"></div><button class="map-fit small-button" data-map-fit>↗ Fit all cities</button><div class="map-network-note" role="status" hidden></div><div class="map-precision">Markers show city centres</div></div>
    <aside class="map-sidebar" aria-label="Events by city"><div class="map-panel-heading" tabindex="-1"></div><div class="map-city-results"></div></aside></div>
    <div class="map-legend"><span><i class="map-count-example">3</i> Events in a city</span><span class="map-category-legend"></span><span>Choose a marker or a city to explore</span></div>
  </section>`;
  const $ = selector => container.querySelector(selector);
  let groups = [], saved = [], selectedKey = '', scopeLabel = '', previousIds = null, destroyed = false;
  let map = null, markers = new Map(), layer = null, resizeObserver = null;
  const L = window.L;

  if (L) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map = L.map($('#event-map'), { zoomControl:false, scrollWheelZoom:false, minZoom:2, maxZoom:12, zoomSnap:.5, zoomAnimation:!reducedMotion, fadeAnimation:!reducedMotion, markerZoomAnimation:!reducedMotion, maxBounds:[[20,-65],[78,65]], maxBoundsViscosity:.75 }).setView([51,8],4);
    L.control.zoom({position:'bottomleft'}).addTo(map);
    map.attributionControl.setPrefix('<a href="https://leafletjs.com/" target="_blank" rel="noopener">Leaflet</a>');
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, keepBuffer:1, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors · Cities: <a href="https://www.geonames.org/" target="_blank" rel="noopener">GeoNames</a>' }).addTo(map);
    let loadedTiles = 0;
    tiles.on('tileload',()=>{loadedTiles++; if(!destroyed) $('.map-network-note').hidden=true;});
    tiles.on('tileerror',()=>{if(!destroyed && !loadedTiles){$('.map-network-note').textContent='Map tiles are unavailable. You can still explore every city in the list.';$('.map-network-note').hidden=false;}});
    layer = L.layerGroup().addTo(map);
    resizeObserver = new ResizeObserver(()=>{if(!destroyed)map.invalidateSize({pan:false});});
    resizeObserver.observe($('#event-map'));
  } else {
    $('#event-map').innerHTML='<div class="map-load-error">The map could not load. Explore the city list to see all matching events.</div>';
    $('.map-fit').disabled=true;
  }

  function fitCities() {
    if(!map)return;
    const positions=groups.filter(g=>g.coordinates).map(g=>g.coordinates);
    if(positions.length) map.fitBounds(L.latLngBounds(positions),{padding:[50,50],maxZoom:positions.length===1?7:6,animate:false});
    else map.fitBounds([[35,-25],[70,32]],{padding:[24,24],animate:false});
  }
  function selectCity(key, fromList = false, moveFocus = false) {
    selectedKey=key;
    renderSidebar();
    const selectedMarker=markers.get(key);
    new Set(markers.values()).forEach(marker=>marker.getElement()?.classList.toggle('selected',marker===selectedMarker));
    const group=groups.find(g=>g.key===key);
    if(group?.coordinates && map){
      if(fromList) map.setView(group.coordinates,Math.max(map.getZoom(),8),{animate:false});
      markers.get(key)?.openTooltip();
    }
    if(moveFocus)$('[data-map-back]')?.focus({preventScroll:true});
  }
  function renderSidebar() {
    const selected=groups.find(g=>g.key===selectedKey);
    const cityCount=groups.filter(g=>!g.isRegional).length;
    if(selected){
      $('.map-panel-heading').innerHTML=`<button class="map-back" data-map-back>← All places</button><h3>${selected.isRegional?'Under European skies':escape(selected.city)}</h3><p>${selected.isRegional?'Europe-wide viewing windows':escape(selected.country)} · ${selected.events.length} ${selected.events.length===1?'event':'events'} · ${escape(scopeLabel)}</p>`;
      $('.map-city-results').innerHTML=selected.events.map(e=>`<article class="map-event-card"><button class="map-event-open" data-map-event="${escape(e.id)}"><span class="event-category" style="--cat-color:${CATEGORIES[e.category].color}"><span class="category-dot"></span>${escape(CATEGORIES[e.category].label)}</span><h4>${escape(e.title)}</h4><p>${escape(dateLabel(e))}${e.dates?' · selected dates':''}</p><span class="map-event-access">${escape(e.access||'Check official details')}</span></button><button class="icon-button map-save ${saved.includes(e.id)?'is-saved':''}" data-map-save="${escape(e.id)}" aria-label="${saved.includes(e.id)?'Remove':'Save'} ${escape(e.title)}" aria-pressed="${saved.includes(e.id)}">${bookmark}</button></article>`).join('');
    }else{
      $('.map-panel-heading').innerHTML=`<span class="eyebrow">PICK A PLACE</span><h3>${groups.length ? 'Where will you go?' : 'Room for another plan.'}</h3><p>${escape(scopeLabel)} · ${cityCount} ${cityCount===1?'city':'cities'}${groups.some(g=>g.isRegional)?' + Europe-wide skies':''}</p>`;
      $('.map-city-results').innerHTML=groups.length?groups.map(g=>`<button class="map-city-button ${g.isRegional?'map-region-button':''}" data-map-city="${escape(g.key)}" aria-label="Explore ${escape(g.city)}, ${escape(g.country)}, ${g.events.length} ${g.events.length===1?'event':'events'}"><span class="map-city-icon">${g.isRegional?'✦':'↗'}</span><span class="map-city-name"><strong>${escape(g.city)}</strong><span>${g.isRegional?'Astronomy · choose a dark-sky spot':escape(g.country)}</span></span><span class="map-city-count">${g.events.length}</span></button>`).join(''):'<div class="map-empty"><p>No matching events for this date range. Try “Rest of 2026” or change your filters.</p></div>';
    }
  }
  function updateMarkers() {
    if(!map)return;
    layer.clearLayers();markers.clear();
    const clusters=[];
    for(const group of groups.filter(g=>g.coordinates)){
      const point=map.latLngToContainerPoint(group.coordinates);
      const nearby=clusters.find(c=>c.point.distanceTo(point)<44);
      if(nearby)nearby.groups.push(group);
      else clusters.push({point,groups:[group]});
    }
    for(const cluster of clusters){
      const clustered=cluster.groups.length>1;
      const group=cluster.groups[0];
      const clusterEvents=cluster.groups.flatMap(g=>g.events);
      const coordinates=clustered?[cluster.groups.reduce((sum,g)=>sum+g.coordinates[0],0)/cluster.groups.length,cluster.groups.reduce((sum,g)=>sum+g.coordinates[1],0)/cluster.groups.length]:group.coordinates;
      const selected=cluster.groups.some(g=>g.key===selectedKey);
      const colors=[...new Set(clusterEvents.map(e=>CATEGORIES[e.category].color))];
      const ring=`conic-gradient(${colors.map((c,i)=>`${c} ${i*100/colors.length}% ${(i+1)*100/colors.length}%`).join(',')})`;
      const label=clustered?`Zoom into ${clusterEvents.length} events across ${cluster.groups.length} nearby cities`:`Show ${group.events.length} ${group.events.length===1?'event':'events'} in ${group.city}, ${group.country}`;
      const size=clustered?44:36;
      const marker=L.marker(coordinates,{icon:L.divIcon({className:'city-map-marker'+(clustered?' map-cluster-marker':'')+(selected?' selected':''),html:`<span class="map-marker-ring" style="background:${ring}"><span>${clusterEvents.length}</span></span>`,iconSize:[size,size],iconAnchor:[size/2,size/2]}),keyboard:true,title:label,alt:label}).addTo(layer);
      marker.getElement()?.setAttribute('aria-label',label);
      marker.getElement()?.setAttribute('data-event-count',clusterEvents.length);
      marker.getElement()?.setAttribute('data-city-count',cluster.groups.length);
      marker.bindTooltip(clustered?`<strong>${cluster.groups.length} nearby cities · ${clusterEvents.length} events</strong><br>${cluster.groups.slice(0,4).map(g=>escape(g.city)).join(', ')}${cluster.groups.length>4?'…':''}<br>Click to zoom in`:`<strong>${escape(group.city)}</strong><br>${escape(group.country)} · ${group.events.length} ${group.events.length===1?'event':'events'}`,{direction:'top',offset:[0,-size/2],className:'city-map-tooltip'});
      marker.on('click',event=>{
        if(clustered){map.fitBounds(L.latLngBounds(cluster.groups.map(g=>g.coordinates)),{padding:[45,45],maxZoom:Math.min(map.getZoom()+2,12),animate:false});map.getContainer().focus({preventScroll:true});}
        else selectCity(group.key,false,event.originalEvent?.type==='keydown'||event.originalEvent?.detail===0);
      });
      cluster.groups.forEach(g=>markers.set(g.key,marker));
    }
  }
  map?.on('zoomend',updateMarkers);
  function handleClick(event) {
    const b=event.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-map-city'))selectCity(b.dataset.mapCity,true,event.detail===0);
    else if(b.hasAttribute('data-map-back')){const previousKey=selectedKey;selectedKey='';renderSidebar();markers.forEach(m=>{m.closeTooltip();m.getElement()?.classList.remove('selected');});if(event.detail===0)[...container.querySelectorAll('[data-map-city]')].find(el=>el.dataset.mapCity===previousKey)?.focus({preventScroll:true});}
    else if(b.hasAttribute('data-map-event'))onEvent(b.dataset.mapEvent);
    else if(b.hasAttribute('data-map-save'))onSave(b.dataset.mapSave);
    else if(b.hasAttribute('data-map-fit'))fitCities();
    else if(b.hasAttribute('data-map-scope'))onScope(b.dataset.mapScope==='all');
  }
  container.addEventListener('click',handleClick);
  return {
    update(events,options){
      const focusedSaveId=document.activeElement?.dataset.mapSave;
      saved=options.saved;scopeLabel=options.label;groups=groupEventsByCity(events);
      const ids=events.map(e=>e.id).sort().join('|');
      if(!groups.some(g=>g.key===selectedKey))selectedKey='';
      const cityCount=groups.filter(g=>!g.isRegional).length;
      $('.map-count-summary').textContent=`${events.length} ${events.length===1?'event':'events'} · ${cityCount} ${cityCount===1?'city':'cities'}${groups.some(g=>g.isRegional)?' + Europe-wide skies':''}`;
      const skyGroup=groups.find(g=>g.isRegional);
      $('.map-sky-note').hidden=!skyGroup;
      $('.map-sky-note').innerHTML=skyGroup?`<button data-map-city="${escape(skyGroup.key)}">✦ ${skyGroup.events.length} astronomical viewing windows across Europe <span>Explore the night sky ↗</span></button>`:'';
      container.querySelectorAll('[data-map-scope]').forEach(b=>{const active=(b.dataset.mapScope==='all')===options.allMonths;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
      container.querySelector('[data-map-scope="month"]').textContent=options.monthLabel;
      const categories=[...new Set(events.map(e=>e.category))];
      $('.map-category-legend').innerHTML=categories.map(c=>`<span style="--cat-color:${CATEGORIES[c].color}"><i class="category-dot"></i>${escape(CATEGORIES[c].label)}</span>`).join('');
      renderSidebar();updateMarkers();
      if(focusedSaveId){const nextFocus=[...container.querySelectorAll('[data-map-save]')].find(b=>b.dataset.mapSave===focusedSaveId)||$('.map-panel-heading');nextFocus.focus({preventScroll:true});}
      if(ids!==previousIds){fitCities();previousIds=ids;}
    },
    destroy(){destroyed=true;resizeObserver?.disconnect();container.removeEventListener('click',handleClick);map?.remove();container.innerHTML='';}
  };
}
