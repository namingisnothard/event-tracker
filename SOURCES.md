# Elsewhere · Europe 2026 research

This is a curated preview of major travel-worthy events, checked on **12 September 2026**, covering the remaining year through **31 December 2026**. It is not an exhaustive European event directory or a live ticket inventory.

## Sources and updating

- `research-music.json`, `research-sports.json`, `research-culture.json`, `research-literature.json`, `research-astronomy.json` and `research-country-sweep.json` retain the researched records. Each includes a dated verification field and source links.
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

## Country-by-country expansion

The September 12 country sweep adds 122 events, bringing the collection to 218 listings: 209 physical events in 115 cities across 36 countries, plus nine Europe-wide sky entries. `research-coverage.json` records the initial city screen and five unresolved candidates. This is a selective first pass across major cities, not a claim that every listed city has been exhaustively searched. Earlier records retain their earlier source research.

The prioritised union comprises all 27 EU countries and four additional Schengen countries. Membership labels follow the [Council of the EU's Schengen overview](https://www.consilium.europa.eu/en/policies/schengen-area/). The country directory distinguishes the union, EU-only and Schengen-only filters and shows other destinations separately. Every country in the 31-country union now has a dated listing.

Public dates exclude the Luxembourg Art Week invitation preview and the DesignBlok press preview. Oulu's entry uses the four-day Lumo Light Festival rather than the broader art/technology festival. Barcolana uses the main regatta day, not an assumed full surrounding programme. Bruges Winter Glow retains its published umbrella season into February 2027; its individual attractions and Christmas markets have different operating periods. Athens Marathon notes that race registration is sold out, while spectating is a separate option.

Strasbourg Christmas, Vaduz Christmas, Nicosia International Festival and Skopje Jazz remain pending where current sources lack exact confirmed 2026 dates. Madrid's Festival de Otoño remains pending because the two tourism pages disagree on the end date. Their exact sources and reasons appear in `research-coverage.json`, the country directory and the [Chinese travel guide](TRAVEL-GUIDE-2026.md). They are excluded from event counts and calendar exports.

A Strasbourg follow-up adds six previously missed listings: Musica, Bibliothèques Idéales, FEFFS, FORMAT(S), Augenblick and Résonances. FORMAT(S) uses its 10–11 October graphic fair weekend rather than treating the whole exhibition season as daily opening. Résonances uses the organiser’s 6–9 November dates; the city listing contains a conflicting final session on November 10. Strasbourg Christmas dates remain unconfirmed on the official Christmas site.

The Saarbrücken/Frankfurt follow-up adds ten listings. Saarbrücken Christkindl-Markt excludes the documented closure on 22 November and describes the later Bahnhofstraße-only dates separately. Oktoberkirmes uses the dated city event page corroborated by the tourism office (25 September–4 October), rather than the inconsistent general highlights page. Frankfurt Design Assembly records only 14 November at Paulskirche; the wider 11–14 November Design Policy Days spans several cities and has separate access requirements.

The wider German-city follow-up adds 30 events, bringing Germany to 54 listings across 20 cities. New coverage prioritises Hamburg and Leipzig alongside ten newly geocoded destinations. Public fair dates are distinguished from separately ticketed or free opening evenings: ART COLOGNE uses 6–8 November with its November 5 vernissage explained; GRASSIMESSE uses 23–25 October with the October 22 free evening explained. Leipzig Jazz Days uses the organiser’s current 17–25 October dates, and Dresden Jazz Days uses the current 2 October–29 November series. Tollwood’s separate New Year’s Eve party is excluded from its winter-festival window. The [German city guide](GERMANY-2026.md) includes date combinations and all German listings.

The Paris Design Week follow-up adds its 10–19 September city festival. Factory runs only 10–14 September and requires free registration. The Chinese guide records three associated exhibitions separately as itinerary notes, including Multiples’ Sunday/Monday closures and Souvenances’ extension through September 20; these do not extend the umbrella festival or add duplicate festival counts. Sources: [organiser](https://www.maison-objet.com/en/paris-design-week) and the linked Paris city event pages.
