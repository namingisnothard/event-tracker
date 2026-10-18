# Elsewhere — Europe 2026

[Open the live tracker](https://namingisnothard.github.io/event-tracker/)

A responsive event calendar for 18 October–31 December 2026. The 18 October refresh removes 106 expired listings and adds ten sourced events focused on Nordic countries, Poland, Hungary, Czechia and Greece. The current collection contains 162 listings, including ongoing events; 27 listings in those nine priority countries overlap 18 October–18 November. Each listing retains its own verification date. Historical research is retained outside the published calendar.

Read the [Chinese country-by-country travel guide](TRAVEL-GUIDE-2026.md) and [Germany city guide](GERMANY-2026.md) for dates, official links and itinerary anchors.

## Preview

Requires Node.js 20 or newer. No dependencies to install.

```sh
npm run dev
```

Open http://localhost:3016. Set `PORT` to use another local port.

## Features

- Monday-first calendar, list and interactive map views, October–December navigation.
- City markers with event counts, category colours, zoom/pan and a linked city/event list. Nearby cities group together at overview zoom levels; click a group to zoom in. Map the selected month or all remaining 2026 dates.
- EU/Schengen region, country, dependent city, category, public-access and accent-tolerant search filters.
- All remaining dates in list and map views; a searchable bilingual country/city directory with membership labels, screened cities and unresolved dates kept outside the calendar.
- Event detail dialogs with official sources, venue, access and schedule notes.
- Browser-local shortlist, retained across reloads.
- Download an individual event or all filtered events as an `.ics` calendar.
- Selected concert nights, known exhibition closures and date-range boundaries respected.
- Shareable filter URLs, keyboard-accessible controls, responsive layout.

## Data and maintenance

This is an independently curated snapshot initially researched on 12 September 2026, with heritage and open-day additions checked on 19 September. Each listing retains its own verification date. It is not an exhaustive directory or a live ticket feed. Follow each official link before booking. Invitation-only and mixed-access events have explicit notes.

Research lives in `research-{music,sports,culture,literature,astronomy,country-sweep,heritage,october-focus}.json`. `research-coverage.json` records country membership, screened cities and pending confirmations. To update, verify changes with official sources, update the relevant research file and run:

```sh
node scripts/compile-data.mjs
npm test
npm run build
```

The static deployable output is `dist/`. `SERVE_DIST=1 npm start` serves it locally. Calendar exports clip the planner to 18 October–31 December and use all-day reminders, not unverified performance times. Multi-night shows export separate dates. Long exhibitions with closures export their actual open dates.

Source links and research notes are in [SOURCES.md](SOURCES.md). Fonts use Google Fonts with local fallbacks; illustrative photographs are downloaded from Unsplash and stored under `assets/`.

No account, backend, tracking service or API key is required. Shortlists are local to the browser and device.

## Map

Leaflet 1.9.4 is bundled in `vendor/` with its BSD licence. Map tiles load on demand from OpenStreetMap and require an internet connection; the event and city lists remain available if tiles fail. Attribution is visible on the map. Tiles use normal browser caching; no offline tile download or prefetch is provided.

`geo-data.js` contains approximate city centres from the GeoNames cities500 gazetteer (CC BY 4.0). Markers group events by city and do not represent exact venue positions. Coordinate coverage and filtered grouping are checked in the map tests. Shortlisting preserves the current map position and city selection.

Sky phenomena have `geographicScope: 'europe-wide'`. They remain relevant under any included country/city filter, show “Across Europe” in the calendar, and appear in a separate map panel rather than as venue pins. Their dates represent suggested observing windows; exact peak times, moonlight, required equipment and local visibility are explained in the notes. Search supports “books”, “poetry”, “astronomy” and “天文”.

## GitHub Pages

The site publishes directly from the root of the `main` branch. All runtime assets use relative paths so the app works under `/event-tracker/`. `.nojekyll` keeps the static files unchanged. Push validated source and refreshed `events.json` to update the live site; `dist/` is an optional standalone build and is not committed.
