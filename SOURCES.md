# Elsewhere · Europe 2026 research

This is a curated preview of major travel-worthy events, checked on **12 September 2026**, covering the remaining year through **31 December 2026**. It is not an exhaustive European event directory or a live ticket inventory.

## Sources and updating

- `research-music.json`, `research-sports.json`, `research-culture.json`, `research-literature.json` and `research-astronomy.json` retain the researched records. Each includes a dated verification field and source links.
- Sources prioritise organisers, governing bodies, venues, official ticket sellers and public tourism/city listings. `sourceUrls` in the compiled data preserves the evidence; `url` opens the official event or ticket information.
- Run `node scripts/compile-data.mjs` after editing the research records. This validates dates and links, normalizes names, country/category/access fields, merges exact duplicates and writes `events.json` in chronological order. It does not refresh websites automatically.

## Interpreting the calendar

- Date ranges are inclusive and refer to local event dates. A festival or tournament span may include rest days or different sessions; consult the organiser's daily programme. Tennis entries identify qualifying days in their notes.
- Concert residencies use explicit `dates` arrays where shows are on selected nights. Those dates must not be interpreted as a continuous run.
- Events already underway, such as Venice Biennale, and events ending in January 2027 retain their full published spans. Only occurrences inside the remaining-2026 window belong in the calendar preview.
- Known closures use `closedWeekdays` (Sunday = 0, Monday = 1) and exceptional `openDates`. [Venice Biennale practical information](https://www.labiennale.org/en/art/2026/information) confirms Monday closures, with 16 November the exception relevant to this preview. Individual pavilions can have additional restrictions.
- A listed date is not confirmation of ticket availability, a particular participant or guaranteed public entry. Ticket notes and event-specific access details remain attached to the record.

## Access and date choices

- [Paris Fashion Week](https://www.fhcm.paris/en/news/pfwr-fraudulent-solicitations) official shows require invitations from the fashion houses; FHCM does not sell show tickets. Milan Fashion Week is also treated as industry access. [London Fashion Week's schedule](https://londonfashionweek.co.uk/schedule) identifies selected public pop-ups alongside invitation-only shows.
- [Frieze London and Masters](https://www.frieze.com/fairs/frieze-london-frieze-masters/visitor-information) is shown on its public ticket dates, 15–18 October. The 14 October invitation preview is excluded.
- [Rome Film Fest's 4 September update](https://www.romacinemafest.it/it/un-giorno-in-piu-per-la-festa-2026/) moves opening day to 13 October. The latest announcement takes precedence over older site blocks showing 14 October.
- Multi-venue events use the principal city for filtering. Venue text preserves suburban locations such as Nanterre/La Défense, Saint-Denis, Décines-Charpieu and Cheste.
- Selected tour stops are individual recommendations; the dataset does not claim to include every European date of a tour. Programme changes, cancellations and ticket availability require checking the linked official source before booking travel.

## Literature and the night sky

- Literature includes book fairs, poetry, translation, independent publishing and children's books. Frankfurt uses its public dates of 9–11 October; trade-only days are explained in the notes. Booking details for FÓLIO and FILIT remain explicitly subject to their published programmes.
- Astronomy sources include Royal Observatory Greenwich and Spain's National Astronomical Observatory, with links per record. Meteor entries show suggested viewing nights rather than a guaranteed spectacle or an exact timed performance. Equipment and moonlight caveats are retained.
- Nine phenomena use an explicit Europe-wide geographic scope. They apply under country/city filters and are separated from city markers on the map. Two public astronomy programmes have actual city locations and access notes.
- Map city centres come from the GeoNames cities500 gazetteer, licensed CC BY 4.0. Leaflet and OpenStreetMap attribution are visible on the map. Coordinates locate cities, not venues or a recommended observation site.
