import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { occursOn, overlapsMonth, monthDays, filterEvents, makeICS, CATEGORIES, AS_OF } from '../core.js';
const {events} = JSON.parse(await readFile(new URL('../events.json',import.meta.url)));

test('collection has valid, unique, sourced events across every category',()=>{
  assert.equal(new Set(events.map(e=>e.id)).size,events.length);
  assert.ok(events.length>=60);
  for(const e of events){
    assert.ok(e.title && e.city && e.country && CATEGORIES[e.category]);
    assert.ok(e.startDate<=e.endDate && e.endDate>=AS_OF && e.startDate<='2026-12-31');
    assert.match(e.sourceUrl,/^https:\/\//);assert.match(e.url,/^https:\/\//);
    for(const d of e.dates||[])assert.ok(d>=e.startDate && d<=e.endDate);
  }
  assert.ok(!events.some(e=>e.endDate<AS_OF));
});
test('Selected concert nights do not include breaks and export individually',()=>{
  const e=events.find(e=>e.id==='niall-horan-dublin');
  assert.ok(occursOn(e,'2026-11-09'));assert.ok(!occursOn(e,'2026-11-11'));assert.ok(!occursOn(e,'2026-10-05'));
  assert.equal(makeICS([e]).match(/BEGIN:VEVENT/g).length,4);
  assert.ok(!makeICS([e]).includes('DTSTART;VALUE=DATE:20261111'));
});
test('ongoing Biennale respects Monday closure and special opening',()=>{
  const e=events.find(e=>e.id==='venice-biennale-arte-2026');
  assert.ok(occursOn(e,'2026-10-18'));assert.ok(!occursOn(e,'2026-10-19'));assert.ok(occursOn(e,'2026-11-16'));
  assert.ok(!overlapsMonth(e,8));assert.ok(!overlapsMonth(e,11));
  const ics=makeICS([e]);assert.ok(!ics.includes('DTSTART;VALUE=DATE:20260914'));assert.ok(ics.includes('DTSTART;VALUE=DATE:20261116'));
});
test('filters combine location, category, public access, accent tolerant search and shortlist',()=>{
  assert.ok(filterEvents(events,{country:'Germany',city:'Düsseldorf',category:'music'}).every(e=>e.city==='Düsseldorf'&&e.category==='music'));
  assert.ok(filterEvents(events,{search:'Celeste'}).some(e=>e.id==='clinamen-athens-2026'));
  assert.ok(!filterEvents(events,{publicOnly:true}).some(e=>e.access==='Industry / invitation'));
  assert.equal(filterEvents(events,{savedOnly:true},['athens-marathon-2026']).length,1);
  assert.equal(filterEvents(events,{search:'no-such-event-98765'}).length,0);
  assert.ok(filterEvents(events,{country:'France',city:'London'}).every(e=>e.geographicScope==='europe-wide'));
});
test('Monday-first calendar handles boundaries and cross-month events',()=>{
  assert.equal(monthDays(8)[0],'2026-08-31');assert.equal(monthDays(8).length,35);
  assert.equal(monthDays(10).length,42);assert.equal(monthDays(11).at(-1),'2027-01-03');
  const e=events.find(e=>e.id==='wtt-montpellier-2026');assert.ok(overlapsMonth(e,9));assert.ok(overlapsMonth(e,10));
  assert.ok(!occursOn(e,'2026-11-02'));
});
test('ICS uses exclusive end dates and clips the preview range',()=>{
  const e=events.find(e=>e.id==='world-darts-2026-27');const ics=makeICS([e]);
  assert.ok(ics.includes('DTEND;VALUE=DATE:20270101'));
  assert.ok(ics.includes('(tournament window)'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.ok(ics.split('\r\n').every(line=>new TextEncoder().encode(line).length<=75));
  const one=makeICS([{id:'special',title:'Café, art; music',startDate:'2026-10-18',endDate:'2026-10-18',description:'A\nB',url:'https://example.org',city:'Paris'}]);
  assert.ok(one.includes('DTEND;VALUE=DATE:20261019'));assert.ok(one.includes('Café\\, art\\; music'));
});

test('EU and Schengen scopes preserve distinct memberships and region-wide skies',async()=>{
  const {coverage}=JSON.parse(await readFile(new URL('../events.json',import.meta.url)));
  assert.equal(coverage.countries.filter(c=>c.eu).length,27);
  assert.equal(coverage.countries.filter(c=>c.schengen).length,29);
  const union=coverage.countries.filter(c=>c.eu||c.schengen);
  assert.equal(union.length,31);
  for(const e of events.filter(e=>e.eu||e.schengen)) assert.ok(union.some(c=>c.country===e.country));
  const countries=region=>new Set(filterEvents(events,{region}).filter(e=>e.geographicScope!=='europe-wide').map(e=>e.country));
  for(const c of ['Cyprus','Ireland']){assert.ok(countries('eu').has(c));assert.ok(!countries('schengen').has(c));}
  for(const c of ['Norway','Switzerland','Iceland']){assert.ok(!countries('eu').has(c));assert.ok(countries('schengen').has(c));}
  assert.ok(!countries('eu-schengen').has('United Kingdom'));
  assert.equal(countries('eu-schengen').size, new Set(events.filter(e=>e.eu||e.schengen).map(e=>e.country)).size);
  assert.equal(filterEvents(events,{region:'schengen',country:'Norway'}).filter(e=>e.geographicScope==='europe-wide').length,events.filter(e=>e.geographicScope==='europe-wide').length);
  assert.ok(!events.some(e=>e.title==='Festival de Otoño'||e.title==='Strasbourg Capitale de Noël'));
});
test('new public fair and festival windows exclude previews and retain cross-year ends',async()=>{
  const {dateLabel}=await import('../core.js');
  for(const [id,preview,opening] of [['luxembourg-art-week-2026','2026-11-19','2026-11-20']]){
    const e=events.find(e=>e.id===id);assert.ok(!occursOn(e,preview));assert.ok(occursOn(e,opening));
  }
  const e=events.find(e=>e.id==='tallinn-christmas-2026');
  assert.equal(e.endDate,'2027-01-06');assert.match(dateLabel(e),/2027/);
  assert.ok(occursOn(e,'2026-12-31'));assert.ok(!occursOn(e,'2027-01-01'));
  assert.ok(makeICS([e]).includes('DTEND;VALUE=DATE:20270101'));
});

test('October refresh removes expired events and respects remaining schedules',()=>{
  assert.equal(AS_OF,'2026-10-18');
  assert.ok(!events.some(e=>e.id==='backstreet-boys-dusseldorf'));
  for(const e of events){
    assert.ok(e.endDate>=AS_OF);
    assert.ok(!occursOn(e,'2026-10-17'));
    assert.ok(!makeICS([e]).includes('DTSTART;VALUE=DATE:202609'));
  }
  const installation=events.find(e=>e.id==='clinamen-athens-2026');
  assert.ok(occursOn(installation,'2026-10-18'));
  assert.ok(!occursOn(installation,'2026-10-19'));
  assert.ok(!occursOn(installation,'2026-10-20'));
  const jazz=events.find(e=>e.id==='jazztopad-wroclaw-2026');
  assert.ok(occursOn(jazz,'2026-11-16'));
  assert.ok(!occursOn(jazz,'2026-11-17'));
  assert.ok(occursOn(jazz,'2026-11-18'));
});
