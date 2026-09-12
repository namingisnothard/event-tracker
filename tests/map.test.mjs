import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CITY_COORDINATES } from '../geo-data.js';
import { groupEventsByCity } from '../map-view.js';
import { filterEvents, overlapsMonth } from '../core.js';
const {events}=JSON.parse(await readFile(new URL('../events.json',import.meta.url)));

test('every event maps to a valid European city centre',()=>{
  for(const e of events){
    if(e.geographicScope==='europe-wide')continue;
    const point=CITY_COORDINATES[`${e.city}|${e.country}`];
    assert.ok(point,`${e.city}, ${e.country} is missing coordinates`);
    assert.equal(point.length,2);
    assert.ok(point.every(Number.isFinite));
    assert.ok(point[0]>=35 && point[0]<=70);
    assert.ok(point[1]>=-25 && point[1]<=35);
  }
  const spielberg=CITY_COORDINATES['Spielberg|Austria'];
  assert.ok(spielberg[0]>47 && spielberg[0]<47.5 && spielberg[1]>14.5 && spielberg[1]<15);
});
test('map grouping counts events once, not once per performance date',()=>{
  const groups=groupEventsByCity(events);
  assert.equal(groups.filter(g=>!g.isRegional).length,new Set(events.filter(e=>e.geographicScope!=='europe-wide').map(e=>`${e.city}|${e.country}`)).size);
  assert.ok(groups.filter(g=>!g.isRegional).length>=40);
  assert.equal(groups.reduce((n,g)=>n+g.events.length,0),events.length);
  assert.equal(groups.find(g=>g.city==='Düsseldorf').events.length,1);
  assert.ok(groups.every(g=>g.events.every(e=>`${e.city}|${e.country}`===g.key)));
});
test('map groups only the supplied month, location and shortlist results',()=>{
  const selected=filterEvents(events,{country:'France',category:'table-tennis'}).filter(e=>overlapsMonth(e,9));
  const groups=groupEventsByCity(selected);
  assert.equal(groups.length,1);assert.equal(groups[0].city,'Montpellier');
  assert.equal(groups[0].events[0].id,'wtt-montpellier-2026');
  const shortlist=groupEventsByCity(filterEvents(events,{savedOnly:true},['bigbang-paris','bigbang-london']));
  assert.equal(shortlist.length,2);
  assert.deepEqual(groupEventsByCity([]),[]);
});

test('Europe-wide astronomy stays separate from pinned cities',()=>{
  const sky={id:'meteor',title:'Meteor shower',city:'Across Europe',country:'Europe-wide',geographicScope:'europe-wide',category:'astronomy',startDate:'2026-12-13',endDate:'2026-12-14'};
  const filtered=filterEvents([sky],{country:'France',city:'Paris',search:'天文'});
  assert.equal(filtered.length,1);
  const [group]=groupEventsByCity(filtered);
  assert.equal(group.isRegional,true);assert.equal(group.coordinates,null);
  assert.equal(filterEvents([sky],{category:'literature'}).length,0);
});
