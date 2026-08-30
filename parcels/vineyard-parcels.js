/**
 * Vineyard Cadaster 2025 — polygon geometry + attributes. Nothing else.
 *
 * Layer   NSDI_GIS.DBO.Vineyard_Cadaster_2025 (220,578 rows, MEPA ArcGIS 11.4)
 * Native  EPSG:32638. Output here is WGS84 GeoJSON, ready for MapLibre.
 *
 * Three facts this file exists to work around:
 *
 *  1. /query returns "geometry": null. /identify does not. So identify is the
 *     geometry endpoint. It is NOT generalized — vertex counts are identical at
 *     imageDisplay 400/1200/4000 and with maxAllowableOffset=0.
 *
 *  2. identify caps at 2000 rows and ignores resultOffset. Views holding more
 *     are swept by splitting the envelope into quadrants until every cell comes
 *     back under the cap.
 *
 *  3. A row is not a parcel. 841 rows in one sample were 315 distinct polygons —
 *     one row per grape variety planted in the parcel, with Fartobi_kvm being
 *     that variety's share. Summed shares match the polygon area to a median of
 *     0.5%. Rows are dissolved into one feature per polygon, carrying every
 *     variety row in `varieties[]`.
 *
 * CORS on this host is allow-listed to nsdi.gov.ge, so requests go over JSONP.
 * No proxy needed, no build step, no dependencies.
 */

export const SERVICE =
  'https://gisserver.mepa.gov.ge/arcgis/rest/services/NSDI/Vineyard_Cadaster_2025/MapServer';

export const CAP = 2000;                                    // service maxRecordCount
export const BOUNDS = [40.27863, 41.12729, 46.75325, 43.33637];

/* -------------------------------------------------------------------- JSONP */

let seq = 0;
export function jsonp(url, params, { timeout = 60000 } = {}) {
  return new Promise((resolve, reject) => {
    const cb = `__vp_${Date.now().toString(36)}_${seq++}`;
    const s = document.createElement('script');
    const done = (fn, arg) => { clearTimeout(t); delete window[cb]; s.remove(); fn(arg); };
    const t = setTimeout(() => done(reject, new Error('timeout')), timeout);
    window[cb] = (d) => d?.error
      ? done(reject, new Error(`${d.error.code}: ${d.error.message}`))
      : done(resolve, d);
    s.onerror = () => done(reject, new Error('request failed'));
    s.src = `${url}?${new URLSearchParams({ ...params, f: 'json', callback: cb })}`;
    document.head.appendChild(s);
  });
}

/* -------------------------------------------------------------- projections */

const R = 6378137, D = 180 / Math.PI;
const unmerc = (x, y) => [(x / R) * D, (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * D];
export const lngLatToMerc = (lon, lat) =>
  [(R * lon) / D, R * Math.log(Math.tan(Math.PI / 4 + lat / (2 * D)))];

/* ------------------------------------------------------- Esri rings -> GeoJSON */

const area = (r) => {
  let s = 0;
  for (let i = 0; i < r.length - 1; i++) s += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1];
  return s / 2;
};
const inRing = ([px, py], r) => {
  let hit = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};

/**
 * Esri flattens every part into one `rings` array, exteriors clockwise and holes
 * counter-clockwise. GeoJSON needs them nested and wound the other way.
 * Every parcel observed here was a single clockwise ring, but the general case
 * is handled because nothing guarantees that holds layer-wide.
 */
export function ringsToGeoJSON(rings, project = (p) => p) {
  const closed = rings
    .map((r) => {
      const c = r.map((p) => [p[0], p[1]]);
      const a = c[0], z = c[c.length - 1];
      if (a[0] !== z[0] || a[1] !== z[1]) c.push([a[0], a[1]]);
      return c;
    })
    .filter((c) => c.length >= 4);
  if (!closed.length) return null;

  const outers = [], holes = [];
  for (const c of closed) (area(c) < 0 ? outers : holes).push(c);
  if (!outers.length) outers.push(...holes.splice(0));

  const parts = outers.map((o) => [o]);
  for (const h of holes) {
    let best = -1, small = Infinity;
    for (let i = 0; i < outers.length; i++) {
      if (!inRing(h[0], outers[i])) continue;
      const a = Math.abs(area(outers[i]));
      if (a < small) { small = a; best = i; }
    }
    (best >= 0 ? parts[best] : parts[parts.push([]) - 1]).push(h);
  }

  const wind = (part) => part.map((ring, i) => {
    const a = area(ring);
    const r = (i === 0 ? a < 0 : a > 0) ? [...ring].reverse() : ring;   // RFC7946: CCW exterior
    return r.map(project);
  });

  return parts.length === 1
    ? { type: 'Polygon', coordinates: wind(parts[0]) }
    : { type: 'MultiPolygon', coordinates: parts.filter((p) => p.length).map(wind) };
}

/* ------------------------------------------------------------------ identify */

const asEnvelope = (b) => Array.isArray(b)
  ? (() => {                                  // [w, s, e, n] in lng/lat
      const [x0, y0] = lngLatToMerc(b[0], b[1]);
      const [x1, y1] = lngLatToMerc(b[2], b[3]);
      return { xmin: x0, ymin: y0, xmax: x1, ymax: y1 };
    })()
  : b;                                        // already {xmin,ymin,xmax,ymax} in 3857

async function identify(env, layerDefs) {
  const r = await jsonp(`${SERVICE}/identify`, {
    geometry: JSON.stringify({ ...env, spatialReference: { wkid: 3857 } }),
    geometryType: 'esriGeometryEnvelope',
    sr: '3857',                               // 4326 works but is 6x slower
    layers: 'all',
    tolerance: '1',
    mapExtent: `${env.xmin},${env.ymin},${env.xmax},${env.ymax}`,
    imageDisplay: '1200,1200,96',
    returnGeometry: 'true',
    ...(layerDefs ? { layerDefs: JSON.stringify(layerDefs) } : {}),
  });
  return r.results ?? [];
}

const quads = ({ xmin, ymin, xmax, ymax }) => {
  const mx = (xmin + xmax) / 2, my = (ymin + ymax) / 2, p = (xmax - xmin) * 0.01;
  return [
    { xmin: xmin - p, ymin: ymin - p, xmax: mx + p, ymax: my + p },
    { xmin: mx - p, ymin: ymin - p, xmax: xmax + p, ymax: my + p },
    { xmin: xmin - p, ymin: my - p, xmax: mx + p, ymax: ymax + p },
    { xmin: mx - p, ymin: my - p, xmax: xmax + p, ymax: ymax + p },
  ];
};

/* ------------------------------------------------------------------ dissolve */

const ringKey = (rings) => rings
  .map((r) => `${r.length}|${r[0][0].toFixed(2)},${r[0][1].toFixed(2)}`)
  .join(';');

const colourOf = (v) => {
  const m = /-\s*([A-Z]+)$/.exec(v ?? '');
  const s = m ? m[1] : 'OTHER';
  return ['WHITE', 'BLACK', 'RED', 'PINK', 'GRAY'].includes(s) ? s : 'OTHER';
};

function toFeatures(results, dissolve) {
  const project = (p) => { const [lo, la] = unmerc(p[0], p[1]); return [+lo.toFixed(7), +la.toFixed(7)]; };

  if (!dissolve) {
    return results.map((r) => {
      const g = ringsToGeoJSON(r.geometry?.rings ?? [], project);
      if (!g) return null;
      const a = r.attributes, y = Number(a.Gashenebis_tseli);
      return { type: 'Feature', id: Number(a.OBJECTID), geometry: g,
        properties: { ...a, OBJECTID: Number(a.OBJECTID),
          Fartobi_kvm: Number(a.Fartobi_kvm) || 0,
          year: y > 1900 ? y : null, colour: colourOf(a.Jishi_ENG) } };
    }).filter(Boolean);
  }

  const groups = new Map();
  for (const r of results) {
    const rings = r.geometry?.rings;
    if (!rings?.length) continue;
    const k = ringKey(rings);
    if (!groups.has(k)) groups.set(k, { rings, rows: [] });
    groups.get(k).rows.push(r.attributes);
  }

  const out = [];
  for (const { rings, rows } of groups.values()) {
    const g = ringsToGeoJSON(rings, project);
    if (!g) continue;
    const varieties = rows.map((a) => ({
      variety: a.Jishi_ENG, varietyKa: a.Jishi_GEO,
      area: Number(a.Fartobi_kvm) || 0,
      year: Number(a.Gashenebis_tseli) > 1900 ? Number(a.Gashenebis_tseli) : null,
      training: a.Vazis_formireba_ENG,
      objectId: Number(a.OBJECTID),
    })).sort((x, y) => y.area - x.area);

    const top = varieties[0], f = rows[0];
    const years = varieties.map((v) => v.year).filter((y) => y != null);
    out.push({
      type: 'Feature', id: top.objectId, geometry: g,
      properties: {
        OBJECTID: top.objectId,
        objectIds: varieties.map((v) => v.objectId),
        Region_ENG: f.Region_ENG, Region_GEO: f.Region_GEO,
        Municipaliteti_ENG: f.Municipaliteti_ENG, Municipaliteti_GEO: f.Municipaliteti_GEO,
        Sektori_ENG: f.Sektori_ENG, Microzone_ENG: f.Microzone_ENG,
        Mortskva_ENG: f.Mortskva_ENG, Kvartali: f.Kvartali, Sektoris_kodi: f.Sektoris_kodi,
        varieties,
        nVarieties: varieties.length,
        dominantVariety: top.variety,
        dominantVarietyKa: top.varietyKa,
        Fartobi_kvm: varieties.reduce((s, v) => s + v.area, 0),   // parcel total
        year: top.year ?? (years.length ? Math.min(...years) : null),
        colour: colourOf(top.variety),
      },
    });
  }
  return out;
}

/* ---------------------------------------------------------------- public API */

/**
 * Every parcel polygon intersecting `bounds`, with its attributes.
 *
 * @param {[number,number,number,number]|object} bounds  [w,s,e,n] lng/lat, or a 3857 envelope
 * @param {object}   [opts]
 * @param {boolean}  [opts.dissolve=true]  one feature per polygon (false = one per variety row)
 * @param {number}   [opts.maxDepth=4]     quadrant recursion limit
 * @param {number}   [opts.cap=CAP]        a full page means the cell was truncated
 * @param {object}   [opts.layerDefs]      e.g. {0: "Jishi_ENG LIKE '%- BLACK'"}
 * @param {function} [opts.onProgress]     ({depth, calls, rows}) per sweep level
 * @returns {Promise<{type:'FeatureCollection', features:Array, rows:number, calls:number, truncated:boolean}>}
 */
export async function getParcels(bounds, {
  dissolve = true, maxDepth = 4, cap = CAP, layerDefs = null, onProgress,
} = {}) {
  const byId = new Map();
  let level = [asEnvelope(bounds)], depth = 0, calls = 0;

  while (level.length && depth <= maxDepth) {
    const batches = await Promise.all(level.map((c) => identify(c, layerDefs)));
    calls += level.length;
    const next = [];
    for (let i = 0; i < batches.length; i++) {
      for (const r of batches[i]) byId.set(Number(r.attributes.OBJECTID), r);
      if (batches[i].length >= cap) next.push(...quads(level[i]));
    }
    onProgress?.({ depth, calls, rows: byId.size });
    level = next;
    depth++;
  }

  const results = [...byId.values()];
  return {
    type: 'FeatureCollection',
    features: toFeatures(results, dissolve),
    rows: results.length,
    calls,
    truncated: level.length > 0,      // hit maxDepth with cells still capped
  };
}

/**
 * Keep a MapLibre GeoJSON source loaded with the parcels in view.
 * Returns { remove(), reload(), setLayerDefs(defs) }.
 */
export function bindToMap(map, {
  sourceId = 'parcels', minZoom = 12, pad = 0.15, debounce = 400,
  dissolve = true, layerDefs = null, onState = () => {}, ...rest
} = {}) {
  let gen = 0, lastEnv = null, lastZoom = null, defs = layerDefs, timer = null;

  const envOf = (p) => {
    const b = map.getBounds();
    const [x0, y0] = lngLatToMerc(b.getWest(), b.getSouth());
    const [x1, y1] = lngLatToMerc(b.getEast(), b.getNorth());
    const dx = (x1 - x0) * p, dy = (y1 - y0) * p;
    return { xmin: x0 - dx, ymin: y0 - dy, xmax: x1 + dx, ymax: y1 + dy };
  };
  const inside = (o, i) => o && i.xmin >= o.xmin && i.ymin >= o.ymin &&
                                i.xmax <= o.xmax && i.ymax <= o.ymax;
  const set = (features) => map.getSource(sourceId)?.setData({ type: 'FeatureCollection', features });

  async function load(force) {
    const z = map.getZoom();
    if (z < minZoom) { set([]); lastEnv = null; onState({ status: 'zoomed-out', zoom: z, minZoom }); return; }

    const env = envOf(pad);
    const steady = lastZoom != null && Math.abs(z - lastZoom) <= 0.4;
    if (!force && steady && inside(lastEnv, envOf(0))) return;

    const mine = ++gen;
    const t0 = performance.now();
    onState({ status: 'loading', zoom: z });
    try {
      const fc = await getParcels(env, {
        dissolve, layerDefs: defs, ...rest,
        onProgress: (p) => mine === gen && onState({ status: 'loading', ...p, zoom: z }),
      });
      if (mine !== gen) return;                       // a newer view superseded this one
      set(fc.features);
      lastEnv = env; lastZoom = z;
      onState({ status: 'ready', parcels: fc.features.length, rows: fc.rows,
                calls: fc.calls, truncated: fc.truncated, zoom: z,
                ms: Math.round(performance.now() - t0) });
    } catch (e) {
      if (mine === gen) onState({ status: 'error', message: e.message, zoom: z });
    }
  }

  const schedule = () => { clearTimeout(timer); timer = setTimeout(() => load(false), debounce); };

  if (!map.getSource(sourceId))
    map.addSource(sourceId, { type: 'geojson', promoteId: 'OBJECTID',
      data: { type: 'FeatureCollection', features: [] } });
  map.on('moveend', schedule);
  map.on('zoomend', schedule);
  load(true);

  return {
    remove() { clearTimeout(timer); map.off('moveend', schedule); map.off('zoomend', schedule); gen++; },
    reload() { lastEnv = null; lastZoom = null; return load(true); },
    setLayerDefs(d) { defs = d; lastEnv = null; lastZoom = null; return load(true); },
  };
}

/* ------------------------------------------------------------ paint presets */

export const FILL_BY_GRAPE = ['match', ['get', 'colour'],
  'WHITE', '#d6b254', 'BLACK', '#5c1a36', 'RED', '#c44a4a',
  'PINK', '#e096aa', 'GRAY', '#9696a0', '#7d7570'];

export const FILL_BY_YEAR = ['case', ['==', ['get', 'year'], null], '#5b5560',
  ['step', ['get', 'year'], '#45143c', 1991, '#8c2d4a', 2006, '#c96d50', 2016, '#f0c578']];

export const FILL_BY_SIZE = ['interpolate', ['linear'], ['get', 'Fartobi_kvm'],
  0, '#ede2c7', 500, '#ceb37a', 2000, '#9e6c4e', 10000, '#542034'];
