import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const AS_OF = '2026-09-12';
const RANGE_END = '2026-12-31';
const coverage = JSON.parse(await readFile(new URL('research-coverage.json', ROOT), 'utf8'));
const countryLookup = new Map(coverage.countries.map(country => [country.country, country]));
const OPTIONAL_INPUTS = new Set(['research-literature.json', 'research-astronomy.json']);
const INPUTS = ['research-music.json', 'research-sports.json', 'research-culture.json', 'research-country-sweep.json', 'research-heritage.json', ...OPTIONAL_INPUTS];
const CATEGORIES = new Set(['music', 'tennis', 'table-tennis', 'art', 'design', 'fashion', 'film', 'festival', 'technology', 'sport', 'literature', 'astronomy', 'heritage']);
const CATEGORY_ALIASES = { 'table tennis': 'table-tennis', tabletennis: 'table-tennis', sports: 'sport', tech: 'technology', movies: 'film', films: 'film', festivals: 'festival' };
const COUNTRY_ALIASES = { UK: 'United Kingdom', 'U.K.': 'United Kingdom', Britain: 'United Kingdom', England: 'United Kingdom', Scotland: 'United Kingdom', Turkey: 'Türkiye', 'Czech Republic': 'Czechia', Holland: 'Netherlands' };
const ACCESS = new Set(['Public tickets', 'Free entry', 'Mixed access', 'Industry / invitation', 'Check official tickets', 'Check official details']);
const unique = values => [...new Set(values.filter(value => value !== undefined && value !== null && value !== ''))];
const clean = value => String(value || '').trim();
const list = value => Array.isArray(value) ? value : value ? [value] : [];
const identity = value => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

function checkDate(value, context) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid ISO date in ${context}: ${value}`);
  }
  return value;
}

function checkUrl(value, context) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`Invalid source URL in ${context}: ${value}`);
  return value;
}

function accessLabel(event) {
  const original = clean(event.access);
  if (ACCESS.has(original)) return original;
  if (event.id === 'london-fashion-week-ss27') return 'Mixed access';
  if (event.category === 'fashion' && /invitation|accreditation/i.test(original)) return 'Industry / invitation';
  if (/free public-space|grounds and tents have free admission/i.test(original)) return 'Free entry';
  if (/free locations.*ticketed|access and booking vary|individual programme entries/i.test(original)) return 'Mixed access';
  if (/public tickets|screening tickets|day tickets|conference tickets|conference passes|wristband|required.*tickets|ticketed|main public fair/i.test(original)) return 'Public tickets';
  if (['music', 'tennis', 'table-tennis', 'sport'].includes(event.category)) return 'Check official tickets';
  return 'Check official details';
}

function normalize(raw, file, index) {
  const event = { ...raw };
  const context = `${file}[${index}]`;
  event.id = clean(event.id);
  event.title = clean(event.title || event.name);
  event.url = clean(event.url || event.officialUrl || event.sourceUrl);
  event.country = COUNTRY_ALIASES[clean(event.country)] || clean(event.country);
  event.city = clean(event.city);
  if (event.geographicScope !== 'europe-wide') {
    const scope = countryLookup.get(event.country);
    if (!scope) throw new Error(`Missing country coverage metadata: ${event.country}`);
    event.eu = scope.eu;
    event.schengen = scope.schengen;
    event.tags = unique([...list(event.tags), scope.nameZh]);
  }
  event.category = CATEGORY_ALIASES[clean(event.category).toLowerCase()] || clean(event.category).toLowerCase();
  if (!event.id || !event.title || !event.country || !event.city) throw new Error(`Missing event identity in ${context}`);
  // Distributed sky events have no single city or country. Keep the explicit
  // region intact so filters and maps can distinguish it from a physical place.
  if (event.geographicScope === 'europe-wide') {
    if (event.city !== 'Across Europe' || event.country !== 'Europe-wide') throw new Error(`Europe-wide events must use Across Europe / Europe-wide in ${context}`);
  } else if (event.city === 'Across Europe' || event.country === 'Europe-wide') {
    throw new Error(`Europe-wide events require geographicScope: europe-wide in ${context}`);
  }
  if (!CATEGORIES.has(event.category)) throw new Error(`Unknown category in ${context}: ${event.category}`);
  event.startDate = checkDate(event.startDate, context);
  event.endDate = checkDate(event.endDate || event.startDate, context);
  if (event.endDate < event.startDate) throw new Error(`Reversed date range in ${context}`);
  event.verifiedAt = checkDate(event.verifiedAt || AS_OF, context);
  event.status ||= 'confirmed';
  event.sourceUrls = unique([event.sourceUrl, ...list(event.sourceUrls), ...list(event.additionalSources)]).map(url => checkUrl(url, context));
  if (!event.sourceUrls.length) throw new Error(`Missing research source in ${context}`);
  event.sourceUrl = event.sourceUrls[0];
  checkUrl(event.url, context);
  for (const key of ['dates', 'openDates', 'closedDates']) {
    if (!event[key]) continue;
    if (!Array.isArray(event[key])) throw new Error(`${key} must be an array in ${context}`);
    event[key] = unique(event[key]).map(day => checkDate(day, context)).sort();
    if (event[key].some(day => day < event.startDate || day > event.endDate)) throw new Error(`${key} outside event span in ${context}`);
  }
  if (event.closedWeekdays) {
    if (!Array.isArray(event.closedWeekdays) || event.closedWeekdays.some(day => !Number.isInteger(day) || day < 0 || day > 6)) {
      throw new Error(`closedWeekdays must use JS UTC weekdays (0–6) in ${context}`);
    }
    event.closedWeekdays = unique(event.closedWeekdays.map(String)).map(Number).sort();
  }
  const originalAccess = clean(event.access);
  event.access = accessLabel(event);
  event.accessNote = unique([clean(event.accessNote), originalAccess !== event.access ? originalAccess : '']).join(' ');
  if (!event.accessNote) delete event.accessNote;
  event.researchFiles = unique([...list(event.researchFiles), file]);
  delete event.name;
  delete event.officialUrl;
  delete event.additionalSources;
  return event;
}

function signature(event) {
  return [event.title, event.city, event.country, event.category].map(identity).join('|') + `|${event.startDate}|${event.endDate}`;
}

function mergeDuplicate(previous, incoming) {
  if (signature(previous) !== signature(incoming)) throw new Error(`Conflicting duplicate id: ${incoming.id}`);
  if (Boolean(previous.dates?.length) !== Boolean(incoming.dates?.length)) throw new Error(`Conflicting span and selected-date schedules: ${incoming.id}`);
  const merged = { ...incoming, ...previous };
  for (const field of ['sourceUrls', 'researchFiles', 'tags', 'dates', 'openDates', 'closedDates', 'closedWeekdays', 'alternateIds']) {
    const values = unique([...list(previous[field]), ...list(incoming[field])]);
    if (values.length) merged[field] = values.sort();
  }
  for (const field of ['notes', 'ticketNote', 'accessNote', 'scheduleNote']) {
    const value = unique([clean(previous[field]), clean(incoming[field])]).join(' ');
    if (value) merged[field] = value;
  }
  if (previous.access !== incoming.access) merged.access = 'Mixed access';
  if (previous.id !== incoming.id) merged.alternateIds = unique([...(merged.alternateIds || []), incoming.id]);
  return merged;
}

// A date span is not an assertion of a daily session. Preserve selected dates and
// known closures; the UI clips occurrences to the remaining-year window.
function isRelevant(event) {
  if (event.endDate < AS_OF || event.startDate > RANGE_END) return false;
  return !event.dates?.length || event.dates.some(day => day >= AS_OF && day <= RANGE_END);
}

const files = await Promise.all(INPUTS.map(async file => {
  let source;
  try {
    source = await readFile(new URL(file, ROOT), 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT' && OPTIONAL_INPUTS.has(file)) return null;
    throw error;
  }
  const raw = JSON.parse(source);
  if (!Array.isArray(raw)) throw new Error(`${file} must contain a JSON array`);
  return raw.map((event, index) => normalize(event, file, index));
}));
const byId = new Map();
const bySignature = new Map();
let duplicateCount = 0;
for (const event of files.filter(Boolean).flat()) {
  if (!isRelevant(event)) continue;
  const key = signature(event);
  const existingId = byId.has(event.id) ? event.id : bySignature.get(key);
  if (existingId) {
    byId.set(existingId, mergeDuplicate(byId.get(existingId), event));
    duplicateCount++;
  } else {
    byId.set(event.id, event);
    bySignature.set(key, event.id);
  }
}
const events = [...byId.values()].sort((a, b) => a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title) || a.city.localeCompare(b.city));
const output = new URL('events.json', ROOT);
const lastUpdated = events.reduce((latest, event) => event.verifiedAt > latest ? event.verifiedAt : latest, AS_OF);
await writeFile(output, JSON.stringify({ asOf: AS_OF, lastUpdated, rangeEnd: RANGE_END, coverage, events }, null, 2) + '\n');
console.log(`Compiled ${events.length} events from ${files.filter(Boolean).length} research files (${duplicateCount} duplicates merged).`);
console.log(fileURLToPath(output));
