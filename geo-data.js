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
  "Cologne|Germany": [50.93333, 6.95], // GeoNames 2886242
  "Essen|Germany": [51.45657, 7.01228], // GeoNames 2928810
  "Bremen|Germany": [53.07582, 8.80717], // GeoNames 2944388
  "Lübeck|Germany": [53.86893, 10.68729], // GeoNames 2875601
  "Oldenburg|Germany": [53.14039, 8.21479], // GeoNames 2857458
  "Bonn|Germany": [50.73438, 7.09549], // GeoNames 2946447
  "Heidelberg|Germany": [49.40768, 8.69079], // GeoNames 2907911
  "Karlsruhe|Germany": [49.00937, 8.40444], // GeoNames 2892794
  "Dortmund|Germany": [51.51494, 7.466], // GeoNames 2935517
  "Tübingen|Germany": [48.52266, 9.05222], // GeoNames 2820860
  "Saarbrücken|Germany": [49.23262, 7.00982], // GeoNames 2842647
  "Strasbourg|France": [48.58392, 7.74553], // GeoNames 2973783
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
  "Aarhus|Denmark": [56.15674, 10.21076], // GeoNames 2624652
  "Antwerp|Belgium": [51.22047, 4.40026], // GeoNames 2803138
  "Athens|Greece": [37.98376, 23.72784], // GeoNames 264371
  "Bergen|Norway": [60.39299, 5.32415], // GeoNames 3161732
  "Bordeaux|France": [44.84124, -0.58046], // GeoNames 3031582
  "Bratislava|Slovakia": [48.14816, 17.10674], // GeoNames 3060972
  "Brno|Czechia": [49.19522, 16.60796], // GeoNames 3078610
  "Bruges|Belgium": [51.20892, 3.22424], // GeoNames 2800931
  "Bucharest|Romania": [44.43225, 26.10626], // GeoNames 683506
  "Cork|Ireland": [51.89797, -8.47061], // GeoNames 2965140
  "Dresden|Germany": [51.05089, 13.73832], // GeoNames 2935022
  "Edinburgh|United Kingdom": [55.95206, -3.19648], // GeoNames 2650225
  "Geneva|Switzerland": [46.20222, 6.14569], // GeoNames 2660646
  "Ghent|Belgium": [51.05, 3.71667], // GeoNames 2797656
  "Graz|Austria": [47.06733, 15.44197], // GeoNames 2778067
  "Innsbruck|Austria": [47.26266, 11.39454], // GeoNames 2775220
  "Istanbul|Türkiye": [41.01384, 28.94966], // GeoNames 745044
  "Košice|Slovakia": [48.71441, 21.25802], // GeoNames 724443
  "Larnaca|Cyprus": [34.9221, 33.62794], // GeoNames 146400
  "Lausanne|Switzerland": [46.516, 6.63282], // GeoNames 2659994
  "Leipzig|Germany": [51.33962, 12.37129], // GeoNames 2879139
  "Limassol|Cyprus": [34.68406, 33.03794], // GeoNames 146384
  "Lucerne|Switzerland": [47.05048, 8.30635], // GeoNames 2659811
  "Luxembourg City|Luxembourg": [49.60982, 6.13268], // GeoNames 2960316
  "Madrid|Spain": [40.4165, -3.70256], // GeoNames 3117735
  "Maribor|Slovenia": [46.55583, 15.64593], // GeoNames 3195506
  "Marseille|France": [43.29695, 5.38107], // GeoNames 2995469
  "Nicosia|Cyprus": [35.17284, 33.35397], // GeoNames 146268
  "Oslo|Norway": [59.91273, 10.74609], // GeoNames 3143244
  "Oulu|Finland": [65.01236, 25.46816], // GeoNames 643492
  "Perugia|Italy": [43.1122, 12.38878], // GeoNames 3171180
  "Porto|Portugal": [41.1485, -8.61097], // GeoNames 2735943
  "Riga|Latvia": [56.946, 24.10589], // GeoNames 456172
  "Salzburg|Austria": [47.79941, 13.04399], // GeoNames 2766824
  "Sarajevo|Bosnia and Herzegovina": [43.84864, 18.35644], // GeoNames 3191281
  "Seville|Spain": [37.38283, -5.97317], // GeoNames 2510911
  "Sibiu|Romania": [45.8, 24.15], // GeoNames 667268
  "Sitges|Spain": [41.23506, 1.81193], // GeoNames 3108877
  "Sofia|Bulgaria": [42.69751, 23.32415], // GeoNames 727011
  "Stuttgart|Germany": [48.78232, 9.17702], // GeoNames 2825297
  "Tallinn|Estonia": [59.43696, 24.75353], // GeoNames 588409
  "Thessaloniki|Greece": [40.64072, 22.93493], // GeoNames 734077
  "Tirana|Albania": [41.32744, 19.81866], // GeoNames 3183875
  "Trieste|Italy": [45.64953, 13.77678], // GeoNames 3165185
  "Turku|Finland": [60.45148, 22.26869], // GeoNames 633679
  "Vaduz|Liechtenstein": [47.14151, 9.52154], // GeoNames 3042030
  "Valletta|Malta": [35.89968, 14.5148], // GeoNames 2562305
  "Varna|Bulgaria": [43.21912, 27.91024], // GeoNames 726050
  "Vilnius|Lithuania": [54.68916, 25.2798], // GeoNames 593116
  "Warsaw|Poland": [52.22977, 21.01178], // GeoNames 756135
  "Wrocław|Poland": [51.10286, 17.03006], // GeoNames 3081368
  "Zaragoza|Spain": [41.65606, -0.87734], // GeoNames 3104324
});
