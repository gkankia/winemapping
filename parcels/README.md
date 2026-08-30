# Vineyard parcel polygons + attributes

One file, no dependencies, no build step: `vineyard-parcels.js`.

```js
import { getParcels } from './vineyard-parcels.js';

const fc = await getParcels([43.03, 42.54, 43.05, 42.56]);   // [w, s, e, n] lng/lat
// -> GeoJSON FeatureCollection, WGS84, polygons + attributes
```

Or bound to a map, reloading as the view moves:

```js
import { bindToMap, FILL_BY_GRAPE } from './vineyard-parcels.js';

const parcels = bindToMap(map, { minZoom: 12 });   // creates the 'parcels' source
map.addLayer({ id: 'fill', type: 'fill', source: 'parcels',
               paint: { 'fill-color': FILL_BY_GRAPE, 'fill-opacity': 0.75 } });
```

`bindToMap` creates the source, so add your layers **after** it.

## What comes back

```json
{ "type": "Feature", "id": 90274,
  "geometry": { "type": "Polygon", "coordinates": [[[43.0401876, 42.5498336], …]] },
  "properties": {
    "OBJECTID": 90274, "objectIds": [90274, 90275],
    "Region_ENG": "Racha-Lechkhumi", "Region_GEO": "რაჭა-ლეჩხუმი",
    "Municipaliteti_ENG": "Ambrolauri", "Sektori_ENG": "…",
    "Microzone_ENG": "Racha, Khvanchkara", "Mortskva_ENG": "NO",
    "Kvartali": 13, "Sektoris_kodi": "…",
    "varieties": [
      { "variety": "ALEXANDROULI - BLACK", "varietyKa": "ალექსანდროული",
        "area": 477, "year": 2016, "training": "GUYOT", "objectId": 90274 },
      { "variety": "MUJURETULI - BLACK", "varietyKa": "მუჯურეთული",
        "area": 300, "year": 2016, "training": "GUYOT", "objectId": 90275 }
    ],
    "nVarieties": 2, "dominantVariety": "ALEXANDROULI - BLACK",
    "Fartobi_kvm": 777, "year": 2016, "colour": "BLACK"
  }}
```

Geometry is WGS84, RFC 7946 winding (CCW exterior), holes nested correctly.

## Why the file is 340 lines instead of 20

Three things the service does that you have to work around.

**`/query` returns `"geometry": null`.** For every row, in every format. `/identify` doesn't, so
identify is the geometry endpoint. It is not generalized: vertex counts are identical at
`imageDisplay` 400 / 1200 / 4000 and with `maxAllowableOffset=0`.

**identify caps at 2000 rows and ignores `resultOffset`** — you get the same 2000 back. So a
dense view is swept by splitting the envelope into quadrants until every cell returns under the
cap. `getParcels` does this automatically and reports `calls` and `truncated`.

**A row is not a parcel.** 841 rows in one sample were only **315 distinct polygons** — each
parcel carries one row per grape variety planted in it, and `Fartobi_kvm` is that variety's
share, not the parcel area. Summed shares match the polygon area to a median of 0.5%. Left
undissolved you overdraw every parcel 2.7x, translucent fills go muddy, and clicks pick an
arbitrary variety. Rows are dissolved into one feature per polygon with all variety rows in
`varieties[]`. Pass `{ dissolve: false }` for one feature per row instead.

Requests go over JSONP because CORS on this host is allow-listed to `nsdi.gov.ge`. That needs no
proxy and no server of your own.

## Speed

Measured against the live service in the densest part of Kakheti:

| view | parcels | calls | wall |
|---|---:|---:|---:|
| 1.8 km | 315 | 1 | 2.6 s |
| 5 km | 2,963 | 5 | ~19 s |
| 14 km | 7,289 | 17 | ~42 s |

One call is comfortable, which is roughly z14 and closer in Kakheti and z12–13 elsewhere. That's
why `minZoom` defaults to 12. Sweeping a wide view works but isn't interactive.

Sweeps recover 98.9% of a 5 km view and 99.9% of a 14 km view. The shortfall is always tiny
parcels straddling a cell edge — identify drops features whose centroid falls outside the
envelope (all 24 missing from one test had centroids outside the box, areas 20–1,105 m²). More
cells means more edges, so the sweep splits as little as it can.

## Options

```js
getParcels(bounds, {
  dissolve: true,     // false = one feature per variety row
  cap: 2000,          // service maxRecordCount; a full page means truncated
  maxDepth: 4,        // quadrant recursion limit
  layerDefs: { 0: "Jishi_ENG LIKE '%- BLACK'" },   // SQL filter, server-side
  onProgress: ({ depth, calls, rows }) => {},
})
```

`bindToMap(map, opts)` takes the same options plus `sourceId`, `minZoom`, `pad`, `debounce`,
`onState`, and returns `{ remove(), reload(), setLayerDefs(defs) }`. It caches on a padded box so
small pans cost no requests, invalidates on zoom change, and discards responses superseded by a
newer view.

Exported paint presets: `FILL_BY_GRAPE`, `FILL_BY_YEAR`, `FILL_BY_SIZE`.

## Files

| file | |
|---|---|
| `vineyard-parcels.js` | the module |
| `demo.html` | map, hover, popups, colour modes, GeoJSON download — serve it, don't open as `file://` |
