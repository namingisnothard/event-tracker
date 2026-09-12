/**
 * Approximate city-center points in [latitude, longitude] order, not venue locations.
 * Source: GeoNames cities500 gazetteer, retrieved 2026-09-12.
 * https://download.geonames.org/export/dump/cities500.zip
 * GeoNames data: CC BY 4.0, https://www.geonames.org/.
 * Original decimal precision is retained; it does not imply venue-level accuracy.
 * Each row includes its GeoNames ID for traceability.
 * Europe-wide events intentionally have no coordinate or artificial map pin.
 */
export const CITY_COORDINATES = Object.freeze({
  "Aldeburgh|United Kingdom": [52.15492, 1.60215], // GeoNames 2657557
  "Amsterdam|Netherlands": [52.37403, 4.88969], // GeoNames 2759794
  "Barcelona|Spain": [41.38879, 2.15899], // GeoNames 3128760
  "Basel|Switzerland": [47.55839, 7.57327], // GeoNames 2661604
  "Belgrade|Serbia": [44.80401, 20.46513], // GeoNames 792680
  "Berlin|Germany": [52.52437, 13.41053], // GeoNames 2950159
  "Bologna|Italy": [44.49381, 11.33875], // GeoNames 3181928
  "Brussels|Belgium": [50.85045, 4.34878], // GeoNames 2800866
  "Budapest|Hungary": [47.49835, 19.04045], // GeoNames 3054643
  "Cheltenham|United Kingdom": [51.90006, -2.07972], // GeoNames 2653261
  "Copenhagen|Denmark": [55.67594, 12.56553], // GeoNames 2618425
  "Dublin|Ireland": [53.33306, -6.24889], // GeoNames 2964574
  "Düsseldorf|Germany": [51.22319, 6.77927], // GeoNames 2934246
  "Eindhoven|Netherlands": [51.44083, 5.47778], // GeoNames 2756253
  "Frankfurt|Germany": [50.11552, 8.68417], // GeoNames 2925533
  "Gothenburg|Sweden": [57.70716, 11.96679], // GeoNames 2711537
  "Hamburg|Germany": [53.55073, 9.99302], // GeoNames 2911298
  "Helsinki|Finland": [60.16952, 24.93545], // GeoNames 658225
  "Iași|Romania": [47.16667, 27.6], // GeoNames 675810
  "Katowice|Poland": [50.2597, 19.02173], // GeoNames 3096472
  "Kraków|Poland": [50.06143, 19.93658], // GeoNames 3094802
  "Linz|Austria": [48.30639, 14.28611], // GeoNames 2772400
  "Lisbon|Portugal": [38.72509, -9.1498], // GeoNames 2267057
  "Ljubljana|Slovenia": [46.05108, 14.50513], // GeoNames 3196359
  "London|United Kingdom": [51.50853, -0.12574], // GeoNames 2643743
  "Lucca|Italy": [43.84369, 10.50447], // GeoNames 3174530
  "Lyon|France": [45.74906, 4.84789], // GeoNames 2996944
  "Manchester|United Kingdom": [53.48095, -2.23743], // GeoNames 2643123
  "Milan|Italy": [45.46427, 9.18951], // GeoNames 3173435
  "Montpellier|France": [43.61093, 3.87635], // GeoNames 2992166
  "Montreuil|France": [48.86415, 2.44322], // GeoNames 2992090 — Montreuil, Île-de-France
  "Munich|Germany": [48.13743, 11.57549], // GeoNames 2867714
  "Nuremberg|Germany": [49.45421, 11.07752], // GeoNames 2861650
  "Paris|France": [48.85341, 2.3488], // GeoNames 2988507
  "Portimão|Portugal": [37.13856, -8.53775], // GeoNames 2264456
  "Prague|Czechia": [50.08804, 14.42076], // GeoNames 3067696
  "Reykjavík|Iceland": [64.13548, -21.89541], // GeoNames 3413829
  "Rome|Italy": [41.89193, 12.51133], // GeoNames 3169070
  "San Sebastián|Spain": [43.31283, -1.97499], // GeoNames 3110044
  "Segovia|Spain": [40.94808, -4.11839], // GeoNames 3109256
  "Spielberg|Austria": [47.21667, 14.78333], // GeoNames 2764812 — Spielberg bei Knittelfeld, Styria
  "Stockholm|Sweden": [59.32938, 18.06871], // GeoNames 2673730
  "Turin|Italy": [45.07049, 7.68682], // GeoNames 3165524
  "Utrecht|Netherlands": [52.09083, 5.12222], // GeoNames 2745912
  "Valencia|Spain": [39.47391, -0.37966], // GeoNames 2509954
  "Venice|Italy": [45.43713, 12.33265], // GeoNames 3164603
  "Vienna|Austria": [48.20849, 16.37208], // GeoNames 2761369
  "Wigtown|United Kingdom": [54.86783, -4.44489], // GeoNames 2633932
  "Zagreb|Croatia": [45.81444, 15.97798], // GeoNames 3186886
  "Zurich|Switzerland": [47.36667, 8.55], // GeoNames 2657896
  "Óbidos|Portugal": [39.36055, -9.1567], // GeoNames 2265485
});
