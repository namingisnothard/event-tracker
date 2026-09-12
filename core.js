export const AS_OF = '2026-09-12';
export const RANGE_END = '2026-12-31';
export const MONTHS = ['September', 'October', 'November', 'December'];
export const CATEGORIES = {
  music: { label: 'Music', color: '#896ba7', icon: 'music' },
  tennis: { label: 'Tennis', color: '#779245', icon: 'tennis' },
  'table-tennis': { label: 'Table tennis', color: '#4f8b9c', icon: 'paddle' },
  art: { label: 'Art', color: '#b9865d', icon: 'art' },
  design: { label: 'Design', color: '#698e7f', icon: 'design' },
  fashion: { label: 'Fashion', color: '#ae7187', icon: 'fashion' },
  film: { label: 'Film', color: '#7083b1', icon: 'film' },
  literature: { label: 'Books & literature', color: '#9a7352', icon: 'book', keywords:['book','books','literature','poetry','reading','文学','书'] },
  astronomy: { label: 'Astronomy', color: '#6876b0', icon: 'stars', keywords:['astronomy','meteor','stargazing','sky','天文','天文现象','流星'] },
  festival: { label: 'Festivals', color: '#b89445', icon: 'sparkles' },
  technology: { label: 'Tech', color: '#718a96', icon: 'globe' },
  sport: { label: 'More sport', color: '#b77965', icon: 'trophy' }
};
export const isoDate = d => d.toISOString().slice(0, 10);
export const date = s => new Date(`${s}T12:00:00Z`);
export const addDays = (s, n) => { const d = date(s); d.setUTCDate(d.getUTCDate() + n); return isoDate(d); };
export function occursOn(event, day) {
  if (day < AS_OF || day > RANGE_END) return false;
  if (event.dates?.length) return event.dates.includes(day);
  if (event.startDate > day || event.endDate < day) return false;
  if (event.openDates?.includes(day)) return true;
  if (event.closedDates?.includes(day)) return false;
  return !event.closedWeekdays?.includes(date(day).getUTCDay());
}
export function overlapsMonth(event, month) {
  const start = `2026-${String(month + 1).padStart(2, '0')}-01`;
  const end = isoDate(new Date(Date.UTC(2026, month + 1, 0, 12)));
  return event.dates?.length ? event.dates.some(d => d >= start && d <= end && d >= AS_OF) : event.startDate <= end && event.endDate >= start;
}
export function filterEvents(events, filters, saved = []) {
  const q = (filters.search || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return events.filter(e => {
    const text = [e.title, e.city, e.country, e.venue, e.description, ...(e.tags || []), CATEGORIES[e.category]?.label, ...(CATEGORIES[e.category]?.keywords||[])].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const regional=e.geographicScope==='europe-wide';
    const inRegion = !filters.region || regional ||
      (filters.region === 'eu-schengen' && (e.eu || e.schengen)) ||
      (filters.region === 'eu' && e.eu) || (filters.region === 'schengen' && e.schengen);
    return e.endDate >= AS_OF && e.startDate <= RANGE_END &&
      inRegion &&
      (!q || text.includes(q)) && (!filters.country || e.country === filters.country || regional) &&
      (!filters.city || e.city === filters.city || regional) && (!filters.category || e.category === filters.category) &&
      (!filters.publicOnly || e.access !== 'Industry / invitation') && (!filters.savedOnly || saved.includes(e.id));
  }).sort((a,b) => a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title));
}
export function monthDays(month) {
  const first = new Date(Date.UTC(2026, month, 1, 12));
  const offset = (first.getUTCDay() + 6) % 7;
  const length = new Date(Date.UTC(2026, month + 1, 0)).getUTCDate();
  const start = addDays(isoDate(first), -offset);
  return Array.from({ length: Math.ceil((offset + length) / 7) * 7 }, (_, i) => addDays(start, i));
}
export function dateLabel(e, long = false) {
  const options = { day: 'numeric', month: long ? 'long' : 'short', timeZone: 'UTC' };
  if (e.startDate.slice(0,4) !== e.endDate.slice(0,4)) options.year = 'numeric';
  const start = date(e.startDate).toLocaleDateString('en-GB', options);
  if (e.startDate === e.endDate) return start;
  const end = date(e.endDate).toLocaleDateString('en-GB', options);
  return `${start} – ${end}`;
}
const icsEscape = s => String(s || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
function foldLine(line) {
  const lines = []; let part = ''; let bytes = 0;
  for (const char of line) {
    const n = new TextEncoder().encode(char).length;
    if (bytes + n > 74) { lines.push(part); part = ' '; bytes = 1; }
    part += char; bytes += n;
  }
  lines.push(part); return lines.join('\r\n');
}
export function makeICS(events) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Elsewhere//Europe 2026//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Elsewhere · Europe 2026'];
  for (const e of events) {
    let spans;
    const startBound = e.startDate < AS_OF ? AS_OF : e.startDate;
    const endBound = e.endDate > RANGE_END ? RANGE_END : e.endDate;
    if (e.dates?.length) spans = e.dates.filter(d => d >= AS_OF && d <= RANGE_END).map(d => [d, d]);
    else if (e.closedWeekdays?.length || e.closedDates?.length) {
      spans = [];
      for (let day = startBound; day <= endBound; day = addDays(day, 1)) if (occursOn(e, day)) spans.push([day, day]);
    } else spans = startBound <= endBound ? [[startBound, endBound]] : [];
    for (const [start,end] of spans) lines.push('BEGIN:VEVENT', `UID:${e.id}-${start}@elsewhere.local`, 'DTSTAMP:20260912T120000Z', `DTSTART;VALUE=DATE:${start.replaceAll('-', '')}`, `DTEND;VALUE=DATE:${addDays(end, 1).replaceAll('-', '')}`, `SUMMARY:${icsEscape(e.title + (e.scheduleType === 'window' ? ' (tournament window)' : ''))}`, `LOCATION:${icsEscape([e.venue, e.city, e.country].filter(Boolean).join(', '))}`, `DESCRIPTION:${icsEscape([e.description, e.accessNote, e.notes, e.ticketNote, e.scheduleNote].filter(Boolean).join('\n') + '\nAccess: ' + (e.access || 'Check official website') + '\nOfficial details: ' + e.url + '\nDates checked 12 September 2026. ' + (e.geographicScope === 'europe-wide' ? 'Check viewing guidance: weather, moonlight and your location affect visibility.' : 'Check session times and tickets with the organiser.'))}`, `URL:${e.url}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR'); return lines.map(foldLine).join('\r\n') + '\r\n';
}
