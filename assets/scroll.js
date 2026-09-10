/* ═══════════════════════════════════════════════════════════════════════
   The scroll piece. Expects a page that has already defined ZONES (see
   zones.js) and that contains a #stage with #map, the two .plate elements
   and #inset inside it, plus an empty #story alongside.
   ═══════════════════════════════════════════════════════════════════════ */
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yam9uZTkwIiwiYSI6ImNrZ3R6M2FvdTBwbmwycXBibGRqM2w2enYifQ.BxjvFSGqefuC9yFCrXC-nQ';


/* ─── framing ───────────────────────────────────────────────────────── */
const MAP_FOCUS = 0.27;   // where the zone sits across the visible strip
const MAX_ZOOM  = 15.5;   // ceiling for fitBounds on very small zones

// A zoom floor was tried here and taken out again: pushing a wide zone past its
// fit runs it off the frame, and a boundary you cannot see the end of reads as a
// bug rather than as a close-up. The zone is framed whole, and the room it has to
// be framed in is what was widened instead — the picture now takes a strip
// rather than a third of the screen.
//
// Where a zone wants to be closer than its whole outline allows, `zoom:` in the
// manifest says so — extra zoom levels on top of the fit, at the cost of the
// zone's ends running past the frame. It is expressed as a shrunk bounding box
// rather than as a zoom added afterwards, so the padding, the edge bias and the
// label all keep working off one box and cannot disagree about where the zone is.
//
// 0.5 is about 15% off each end; 1.0 halves what is shown.

// A zone rarely has the same proportions as the space it is given: fit a square
// zone into a wide band and it is height-limited, leaving slack across the
// width which fitBounds splits evenly — so the zone lands in the middle with
// empty map either side of it. This pushes it to the edge away from the
// picture, which is where the eye goes to look at it. 1 puts it flush; a little
// under keeps a margin so it does not touch the frame.
const ZONE_EDGE_BIAS = 0.82;
const FIT_INSET = 34;
const FAR_EDGE_INSET = 72;   // margin on the edge the zone is pushed against     // px of breathing room inside the visible band

// The name is set to the left of the zone, so the camera has to leave room for
// it — without this the zone is fitted flush against the left inset and there
// is nowhere for the label to go. Set to 0 to reclaim the space and the label
// falls back to sitting over the imagery.
// The name sits under the zone — or over it, with LABEL_PLACE — rather than
// beside it. Beside cost a gutter the width of the longest name, which pushed
// the zone away from the frame's edge and took that room off the map; above or
// below costs only the height of a line.
const LABEL_PLACE = 'bottom';   // 'bottom' | 'top'
const LABEL_ROOM  = 96;         // px the camera keeps clear on that side
const LABEL_GAP   = 14;         // px between the name and the zone's own edge
const LABEL_EDGE  = 34;         // px the name always keeps from the frame
const LABEL_CLEAR = 14;         // px the name keeps clear of the inset map
// Upscaling a photograph past this is visible as softness, so it is warned
// about. 1.25 rather than 1: a photograph carries no hard edges, and a quarter
// over is still clean.
const PHOTO_UPSCALE_OK = 1.25;

const SIMPLIFY_M = 6;          // vertex-thinning tolerance, metres

/* ─── parcels ────────────────────────────────────────────────────────────
   Optional per zone: a GeoJSON of individual parcel boundaries, each carrying
   the variety planted on it. Loaded only when a reader asks for it.

   Expected properties on each feature:
     variety   string, the grape planted        (required — the colour key)
     name      string, parcel or holding name   (optional)
     area_ha   number, hectares                 (optional — computed if absent)

   Three colours and no more. A parcel map is a choropleth, which means every
   pair of colours can end up adjacent, and on that all-pairs test the reference
   palette's fourth slot collapses: yellow against orange is CVD ΔE 4.8 and 10.6
   even to full colour vision. So the three largest varieties by area are named
   and everything else folds into Other. Verified with the palette validator
   against the dark surface: worst all-pairs CVD ΔE 9.4.
   ─────────────────────────────────────────────────────────────────────── */
// Colour carries the vine, not an arbitrary index: white grapes gold, coloured
// grapes claret. That is viticulture's own primary split, and it is the one the
// register encodes — the module derives a berry colour from each variety name.
//
// Two classes rather than five, for a reason the validator settled. A parcel map
// is a choropleth, so every pair of colours can end up adjacent and all of them
// must separate. Trying to hold white, black, red and pink apart fails there:
// gold against red is CVD dE 5.6 and rose against claret 11.2 to full colour
// vision, both under their floors — red and pink are simply too close to both
// gold and claret once you demand every pair work. Folding red, pink and grey in
// with black is not a compromise either: white versus coloured IS the split, and
// in ახოები red is three rows out of 856. The pair in use clears everything with
// room to spare — CVD dE 19.9 against a floor of 8, normal vision 23.2 against 15.
// Composite encoding: hue says which family, lightness says which vine within
// it. Two things are being shown at once and they are not the same kind of
// thing — family is an identity, rank within a family is an order — so they get
// the two channels that suit them.
//
// Both ramps are stepped for PAPER, not for a dark surface — the legend is
// printed on the page and the earlier gold read at 1.28:1 against it, which is
// no mark at all. Each validates as ordinal against #efe4cc: monotone lightness,
// adjacent gaps over 0.06, single hue (5° and 3° of spread), lightest step clear
// of the paper at 2.44:1 and 2.94:1. And the families never collide: across every
// gold/claret pair the worst separation is dE 11.9 for a deuteranope and 15.2 to
// full colour vision, against floors of 8 and 15. So a reader who cannot tell two
// golds apart can still always tell gold from claret, which is the distinction
// that carries the meaning.
//
// Three steps per family, not more: the darkest is the vine the family is mostly
// planted to, the middle its runner-up, the lightest everything else. Past three
// the steps stop being separable and the ramp starts lying about precision.
const VINE_RAMPS = {
  WHITE:    ['#b08f35', '#8c6c1f', '#5f4711'],   // light -> dark
  COLOURED: ['#b96aa4', '#8f3f77', '#5f2450']
};
const VINE_COLOURS = {
  WHITE:    VINE_RAMPS.WHITE[2],
  COLOURED: VINE_RAMPS.COLOURED[2],
  UNKNOWN:  '#8a8071'    // not a class: the register has not surveyed it
};
const NAMED_PER_FAMILY = 2;   // the rest share the family's lightest step

const COLOURED_BERRIES = ['BLACK', 'RED', 'PINK', 'GRAY'];

// Planting year is a magnitude, not an identity, so it takes a sequential ramp:
// one hue, light to dark, never a spread of hues. Blue, the reference sequential
// hue, keeps it clearly apart from the vine tab's gold and claret. Older is
// darker — the deep end is the oldest planting.
//
// Breaks are cut to the data rather than to round decades. Kakheti's plantings
// are bimodal: a Soviet peak in the 1980s and a replanting boom in the 2010s,
// with the trough of the 1990s between them. These five put each peak in its own
// class instead of splitting one across two.
const YEAR_BREAKS  = [1980, 1995, 2010, 2020];
const YEAR_COLOURS = ['#0d366b', '#154a8a', '#1c5cab', '#2a78d6', '#5598e7'];
// Built from the breaks rather than written out, so the two languages cannot
// drift from the numbers they describe.
const yearLabels = () => [
  t('year.before', YEAR_BREAKS[0]),
  ...YEAR_BREAKS.slice(0, -1).map((b, i) => t('year.range', b, YEAR_BREAKS[i + 1] - 1)),
  t('year.after', YEAR_BREAKS[YEAR_BREAKS.length - 1])
];

// Validated as an ordinal ramp against the paper the legend is printed on
// (#efe4cc), not against a dark chart surface: monotone lightness, every
// adjacent gap over 0.06, single hue at 3° spread, lightest step 2.37:1.
const PARCEL_MODES = ['vine', 'year'];
let parcelMode = 'vine';

const UNRECORDED = /^(TO BE IDENTIFIED|N\/A|UNKNOWN|)$/i;

// Parcels are fetched past the boundary so the zone is not a lone island of
// vineyards in an empty frame — the neighbours give it context. They are drawn
// dimmed and kept out of every number, since they are not in the zone.
// How far past the boundary a parcel may sit and still be drawn for context.
// Measured from the boundary itself, not from the zone's bounding box: a
// rectangle reaches kilometres out at a zone's concave corners and pulls in
// whole villages that have nothing to do with the appellation.
const PARCEL_SKIRT_M = 300;

// The fetch still has to name a rectangle — the cadastre service takes nothing
// else — so it asks for the skirt plus a margin for parcels that straddle it,
// and the boundary test below throws away what the rectangle over-collected.
const PARCEL_FETCH_PAD_M = PARCEL_SKIRT_M + 250;

// Ray casting. Crossings are counted on the half-open edge so a vertex lying on
// the ray is not counted twice.
function pointInRing([px, py], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > py) !== (yj > py) &&
        px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function pointInFC(pt, fc) {
  for (const f of fc.features) {
    const g = f.geometry;
    if (!g || !/Polygon/.test(g.type)) continue;
    const parts = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const rings of parts) {
      if (!pointInRing(pt, rings[0])) continue;
      let inHole = false;
      for (let i = 1; i < rings.length; i++) {
        if (pointInRing(pt, rings[i])) { inHole = true; break; }
      }
      if (!inHole) return true;
    }
  }
  return false;
}

// Vertex mean of the outer ring. A parcel is small enough that the difference
// from a true centroid cannot move it across the boundary in a way that matters.
function roughCentre(f) {
  const g = f.geometry;
  if (!g || !/Polygon/.test(g.type)) return null;
  const ring = (g.type === 'Polygon' ? g.coordinates : g.coordinates[0])[0];
  let x = 0, y = 0;
  for (const p of ring) { x += p[0]; y += p[1]; }
  return [x / ring.length, y / ring.length];
}

const parcelState = {};   // zone id -> { loaded, visible, legend }


/* ─── relief ─────────────────────────────────────────────────────────────
   Two passes, because they are good at different scales.

   The Z.axis shading tileset from the Studio style is the one visible in the
   inset. Its tiles stop at zoom 11, so by the time a zone is framed it is being
   overzoomed eight to twenty-four times; it is also light-on-white shading built
   for a pale basemap, which over dark imagery fogs rather than sculpts. So it is
   used where it is native — the regional view — and faded out as the camera
   closes in.

   From there the DEM hillshade carries the depth. It is sharp at every zoom and
   has separate shadow, highlight and accent colours, so shadow can be pushed
   hard without washing the imagery out.
   ─────────────────────────────────────────────────────────────────────── */
// The page is aged paper, so the map around the zone is toned to match rather
// than left as neutral grey. Ink brown at low opacity over the desaturated
// imagery: enough to warm it, not enough to bury the relief.
const SEPIA_WASH = '#7a5a2e';
const SEPIA_STRENGTH = 0.26;

// Everything outside Georgia is painted out, the way the drawn map on the hub
// does it: the country in relief, the rest blank. Mapbox publishes country
// polygons as a vector tileset, so the fill is every country that is not
// Georgia — no geometry of our own to keep in step with a border.
const COUNTRIES = 'mapbox://mapbox.country-boundaries-v1';

// How far a settlement name outside the zone is taken back. Not zero: the
// surround is still a place, and a reader following a valley out of the zone
// wants to see where it goes. Faint enough that the eye settles inside first.
const PLACE_DIM = 0.45;
const OUTSIDE_FILL = '#ffffff';

// Hydrology follows the same rule as the imagery: grey outside the zone, its own
// colour inside. That is done by order rather than by a second layer — the style
// draws water above everything, so it is moved under the colour patches. Outside
// the boundary it shows as this grey; inside, the patch covers it and the river
// there is the one in the photograph.
const WATER_GREY = '#969a97';

const ZX_SHADE = 'mapbox://jorjone90.4zz23i';   // source id as the style declares it

// [zoom, opacity] — gone before the blur would show
const ZX_SHADE_FADE = [[8, 0.55], [10, 0.45], [11.5, 0.22], [12.5, 0]];

// [zoom, exaggeration] — firmer as the camera closes on a zone
const SHADE_STRENGTH = [[9, 0.7], [12, 0.95], [14, 1.15]];

const SHADE_PAINT = {
  'hillshade-shadow-color':    'rgba(6,10,8,.80)',
  'hillshade-highlight-color': 'rgba(255,250,235,.20)',
  'hillshade-accent-color':    'rgba(18,24,18,.55)'
};

const rampOf = pairs => ['interpolate', ['linear'], ['zoom'], ...pairs.flat()];

/* ─── historical topo, blended into the zone ─────────────────────────────
   Soviet 1:50 000 sheets (1973-1990), served as WMS by the National Agency of
   Public Registry. The upstream sends Access-Control-Allow-Origin: *, so the
   browser can request directly with no proxy.

   The sheets are composited into each zone's colour patch rather than added as
   a map layer, so they appear only where the colour does — inside the boundary,
   fading out with it. Everything outside stays plain b&w imagery.
   ─────────────────────────────────────────────────────────────────────── */
const TOPO = {
  host:   'https://mp.napr.gov.ge',
  ws:     'TOPO_50k_1973-1990',
  layer:  'TOPO_50000_1973_1990',
  format: 'image/jpeg',   // 300 KB against 1.1 MB as PNG; alpha is not needed
                          // here because the patch mask supplies it
  // The service is bandwidth-bound, not render-bound: time-to-first-byte holds
  // near half a second at every size while the transfer runs at roughly 70 KB/s,
  // so cost scales with pixels. Measured: 2210px = 805 KB = 10-13s, 1400px =
  // 389 KB = 5-6s, 900px = 194 KB = 2-3s.
  //
  // 1200 is also the honest ceiling. These are scans of a 1:50 000 sheet, which
  // at 300 dpi carries about 4 m per pixel; over a patch some 3 km across, 1200
  // pixels is 2.8 m per pixel. Asking for 2210 made the server upsample a scan
  // and charged eight seconds for the privilege.
  maxPx:  1200,
  alpha:  0.85,           // how strongly the sheets read through the imagery
  blend:  'multiply'      // 'multiply' keeps satellite texture visible through
                          // the sheets' paper white; 'overlay' and 'soft-light'
                          // are gentler, 'source-over' hides the imagery
};

const R_MERC = 20037508.342789244;
const mercX = lon => lon * R_MERC / 180;
const mercXY = lat => Math.log(Math.tan((90 + lat) * Math.PI / 360)) * R_MERC / Math.PI;

// One GetMap for the whole patch extent, in the projection the patch is already
// in, at the patch's own pixel size — so the sheet lands on the imagery
// pixel-for-pixel with no resampling of our own.
function topoUrl(box, w, h) {
  const q = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetMap',
    LAYERS: TOPO.layer,
    STYLES: '',              // required by this server — omitting it returns 500
    FORMAT: TOPO.format,
    TRANSPARENT: 'TRUE',
    SRS: 'EPSG:3857',
    WIDTH: String(w),
    HEIGHT: String(h),
    BBOX: [mercX(box[0]), mercXY(box[1]), mercX(box[2]), mercXY(box[3])]
            .map(v => v.toFixed(4)).join(',')
  });
  return `${TOPO.host}/${TOPO.ws}/ows?${q}`;
}

/* ─── colour patches ────────────────────────────────────────────────────
   The map is b&w satellite everywhere; each zone gets a full-colour patch
   on top, cut to its own shape with a soft edge. GL JS cannot clip a raster
   layer to a polygon, so the cut is done in pixels: fetch the zone's bbox
   from the Static Images API, mask the canvas with the boundary path, and
   hand the result back as a geo-referenced `image` source.
   ─────────────────────────────────────────────────────────────────────── */
const PATCH_STYLE   = 'mapbox/satellite-v9';
const PATCH_MAX_PX  = 1280;    // Static Images API ceiling per side
const PATCH_PAD     = 0.25;    // bbox margin, as a fraction of the zone
const PATCH_FEATHER = 0.10;    // blur radius, as a fraction of the short side

const ZONE_PURPLE   = '#8f3f77';   // the zone shape in the inset

/* ═══════════════════════════════════════════════════════════════════════
   GEOMETRY HELPERS — no Turf needed
   ═══════════════════════════════════════════════════════════════════════ */

function walk(coords, fn) {
  if (typeof coords[0] === 'number') { fn(coords); return; }
  for (const c of coords) walk(c, fn);
}

function asFC(gj) {
  if (!gj) return { type: 'FeatureCollection', features: [] };
  if (gj.type === 'FeatureCollection') return gj;
  if (gj.type === 'Feature') return { type: 'FeatureCollection', features: [gj] };
  return { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: gj }] };
}

function bboxOf(fc) {
  let w = 180, s = 90, e = -180, n = -90;
  for (const f of fc.features) {
    if (!f.geometry) continue;
    walk(f.geometry.coordinates, ([x, y]) => {
      if (x < w) w = x; if (x > e) e = x;
      if (y < s) s = y; if (y > n) n = y;
    });
  }
  return [[w, s], [e, n]];
}

const unionBox = boxes => [
  [Math.min(...boxes.map(b => b[0][0])), Math.min(...boxes.map(b => b[0][1]))],
  [Math.max(...boxes.map(b => b[1][0])), Math.max(...boxes.map(b => b[1][1]))]
];

// Douglas-Peucker, in metres. An unsimplified boundary runs to thousands of
// vertices — ყვარელი-ქინძმარაული alone is 7,649 — and every one of them is
// walked again for each colour patch's mask path. Thinning the source once,
// at load, keeps the boundary line, the patch mask and the inset on identical
// geometry; simplifying only one of them leaves the white line drifting off
// the edge of the colour.
const M_PER_DEG = 111320;

function simplifyRing(ring, tolM) {
  if (!tolM || ring.length < 5) return ring;
  const kx = M_PER_DEG * Math.cos(ring[0][1] * Math.PI / 180);
  const px = ring.map(([x, y]) => [x * kx, y * M_PER_DEG]);

  const keep = new Uint8Array(ring.length);
  keep[0] = keep[ring.length - 1] = 1;
  const stack = [[0, ring.length - 1]];

  while (stack.length) {
    const [a, b] = stack.pop();
    if (b - a < 2) continue;
    const [ax, ay] = px[a], [bx, by] = px[b];
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let far = -1, worst = tolM;

    for (let i = a + 1; i < b; i++) {
      const [cx, cy] = px[i];
      let d;
      if (len2 === 0) {
        d = Math.hypot(cx - ax, cy - ay);
      } else {
        const t = Math.max(0, Math.min(1, ((cx - ax) * dx + (cy - ay) * dy) / len2));
        d = Math.hypot(cx - (ax + t * dx), cy - (ay + t * dy));
      }
      if (d > worst) { worst = d; far = i; }
    }
    if (far > 0) { keep[far] = 1; stack.push([a, far], [far, b]); }
  }
  const out = ring.filter((_, i) => keep[i]);
  return out.length >= 4 ? out : ring;   // never thin a ring into nothing
}

function simplifyFC(fc, tolM) {
  return {
    ...fc,
    features: fc.features.map(f => {
      const g = f.geometry;
      if (!g || !/Polygon/.test(g.type)) return f;
      const parts = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      const done = parts.map(rings => rings.map(r => simplifyRing(r, tolM)));
      return {
        ...f,
        geometry: g.type === 'Polygon'
          ? { type: 'Polygon', coordinates: done[0] }
          : { type: 'MultiPolygon', coordinates: done }
      };
    })
  };
}

// The picture's side is padded out of the camera's reach, so the zone is fitted
// into what the photograph never covers. The amount is measured off the seam
// itself: draw a shape that dips inward and the camera gives way by exactly
// that much, instead of the zone ending up underneath it.
// Push the zone to the edge away from the picture by spending the leftover
// space as padding on the picture's side. Done as padding rather than as a
// camera offset on purpose: fitBounds recomputes its own zoom, so an offset
// measured beforehand can put the zone past the frame, while padding can only
// ever make it fit more tightly.
function biasedPadding(z, pad, zoom) {
  const side = sideFor(z);
  const vw = window.innerWidth, vh = window.innerHeight;
  const [[w, s], [e, n]] = cameraBox(z);
  const world = 512 * Math.pow(2, zoom);
  const out = { ...pad };
  // Per zone, because how far from the picture a zone wants to sit depends on
  // the picture: a seam that reaches deep on one side leaves the zone looking
  // stranded at the far edge, where a shallow one does not. 0 centres it in the
  // band, 1 puts it flush against the far edge.
  const bias = z && z.edgeBias != null ? Number(z.edgeBias) : ZONE_EDGE_BIAS;

  if (isVerticalSeam(side)) {
    const zonePx = (e - w) / 360 * world;
    const slack = Math.max(0, (vw - pad.left - pad.right) - zonePx);
    out[side] += slack * bias;
  } else {
    const zonePx = (mercY(n) - mercY(s)) / (2 * Math.PI) * world;
    const slack = Math.max(0, (vh - pad.top - pad.bottom) - zonePx);
    out[side] += slack * bias;
  }
  return out;
}

// The box the CAMERA uses, which is not always the zone's own. Everything else —
// the colour patch, the inset, the parcel sweep — stays on z.bbox: this shrinks
// what is framed, not what is drawn.
// Which edge the zone's name sits against. On a vertical seam that is a free
// choice, LABEL_PLACE; on a horizontal one it is not — the name goes to the edge
// the photograph is NOT on, or it lands on top of the picture. cameraPadding()
// already reserved the gutter that way, and placeLabel() used to ignore it.
function labelPlace(z) {
  const side = sideFor(z);
  return isVerticalSeam(side) ? LABEL_PLACE : (side === 'bottom' ? 'top' : 'bottom');
}

function cameraBox(z) {
  const boost = Number(z && z.zoom) || 0;
  if (!boost) return z.bbox;
  const k = Math.pow(2, -boost);
  const [[w, s], [e, n]] = z.bbox;
  const cx = (w + e) / 2, cy = (s + n) / 2;
  const hw = (e - w) / 2 * k, hh = (n - s) / 2 * k;
  return [[cx - hw, cy - hh], [cx + hw, cy + hh]];
}

function cameraPadding(z) {
  const target = z || current;
  const side = sideFor(target);
  const i = FIT_INSET;
  // The edge the zone is pushed against needs more than the others, or a zone
  // that fills the band ends up touching the frame.
  const far = { right: 'left', left: 'right', top: 'bottom', bottom: 'top' }[side];
  const vw = window.innerWidth, vh = window.innerHeight;
  const pad = { top: i, bottom: i, left: i, right: i };
  pad[far] = FAR_EDGE_INSET;

  const reach = seamReach(maskFor(target));
  const clear = MASK_FEATHER_PX * FEATHER_SIGMAS + SEAM_CLEARANCE;
  const fallback = (isVerticalSeam(side) ? vw : vh) * (1 - MAP_FOCUS * 2);

  if (isVerticalSeam(side)) {
    const edge = reach
      ? Math.max(side === 'right' ? reach.minX : 100 - reach.maxX, (1 - PICTURE_MAX_SHARE) * 100)
      : null;
    pad[side] += edge !== null ? Math.max(0, vw - edge / 100 * vw + clear) : fallback;
    // Room for the name, on the axis it now sits on. The far side of the map is
    // left alone, so the zone runs out to the edge of the frame instead of
    // stopping short of a gutter the width of the longest name.
    pad[labelPlace(target)] += LABEL_ROOM;
  } else {
    const edge = reach
      ? Math.max(side === 'bottom' ? reach.minY : 100 - reach.maxY, (1 - PICTURE_MAX_SHARE) * 100)
      : null;
    pad[side] += edge !== null ? Math.max(0, vh - edge / 100 * vh + clear) : fallback;
    pad[labelPlace(target)] += LABEL_ROOM;
  }
  return fitToCanvas(pad, side, vw, vh);
}

// Give the band back its minimum: first out of the label's gutter, which is a
// nicety, and only then out of the clearance, which is the thing protecting the
// zone from the picture. Losing the gutter costs a well-placed name; losing the
// clearance costs the zone, so they are spent in that order.
function fitToCanvas(pad, side, vw, vh) {
  const vertical = isVerticalSeam(side);
  const total = vertical ? vw : vh;
  const [a, b] = vertical ? ['left', 'right'] : ['top', 'bottom'];
  const opposite = { right: 'left', left: 'right', bottom: 'top', top: 'bottom' }[side];

  let band = total - pad[a] - pad[b];
  if (band >= MIN_BAND) return pad;

  const spare = Math.max(0, pad[opposite] - FIT_INSET);
  const give = Math.min(MIN_BAND - band, spare);
  pad[opposite] -= give;
  band += give;

  if (band < MIN_BAND) {
    pad[side] = Math.max(FIT_INSET, pad[side] - (MIN_BAND - band));
    console.warn(
      `the seam reaches too far in for a ${Math.round(total)}px frame — the zone `
      + 'may sit under the edge of the picture. Pull the seam back, or lower '
      + 'MASK_FEATHER_PX.');
  }
  return pad;
}

/* ═══════════════════════════════════════════════════════════════════════
   LOADING — one fetch per zone, in parallel
   ═══════════════════════════════════════════════════════════════════════ */

let map, inset;

Promise.all(ZONES.map(z =>
  fetch(z.file)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(err => { console.warn('Could not load ' + z.file, err); return null; })
)).then(results => {
  if (results.every(r => r === null)) {
    console.error('No zone files loaded. Serve this folder over http (python3 -m http.server) '
                + 'rather than opening the file directly.');
    return;
  }
  init(results);
});

/* ═══════════════════════════════════════════════════════════════════════
   BUILD
   ═══════════════════════════════════════════════════════════════════════ */

let zones = [];

function init(results) {
  zones = ZONES
    .map((def, i) => {
      const fc = simplifyFC(asFC(results[i]), SIMPLIFY_M);
      if (!fc.features.length) return null;   // skip zones that failed to load
      return { ...def, id: 'z' + i, fc, bbox: bboxOf(fc) };
    })
    .filter(Boolean);

  if (!zones.length) return;

  const allBox = unionBox(zones.map(z => z.bbox));

  buildStory();
  buildMap(allBox);
  buildInset(allBox);
}

const emptyFC = () => ({ type: 'FeatureCollection', features: [] });

// One chapter per zone. The flat list is what scrollama indexes into.
let steps = [];

function buildStory() {
  steps = [];
  const html = zones.map(z => {
    const facts = (z.facts || []).map(([label, value]) => `
      <div>
        <div class="fact-label">${pick(label)}</div>
        <div class="fact-value">${pick(value)}</div>
      </div>`).join('');

    // The parcels used to have a chapter of their own, which meant the reader
    // scrolled away from the zone's own card to turn the layer on. The button
    // lives under the facts instead, and the legend opens in place beneath it,
    // so the layer goes on without leaving the card that describes the zone.
    const parcels = z.parcels ? `
        <button type="button" class="parcel-toggle" data-zone="${z.id}" aria-pressed="false">
          <span class="parcel-toggle-label">${t('parcels.show')}</span>
        </button>
        <div class="parcel-legend" id="legend-${z.id}" hidden></div>` : '';

    // The name is on the map now, beside the zone, so the panel does not
    // repeat it — it carries only what the map cannot say.
    const side = sideFor(z);
    steps.push({ zone: z });
    return `<section class="chapter chapter--${side}" id="${z.id}">
      <div class="panel">
        ${pick(z.blurb) ? `<p class="blurb">${pick(z.blurb)}</p>` : ''}
        ${facts ? `<div class="facts">${facts}</div>` : ''}
        ${parcels}
      </div>
    </section>`;
  }).join('');

  const story = document.getElementById('story');
  story.innerHTML = html + '<div id="tail"></div>';

  // Whoever writes the markup raises its case — the same contract renderLegend
  // keeps. It has to be here rather than at the call sites: the chapters are
  // written once the zone shapes have arrived, which is after i18n's own `load`
  // pass has already been and gone, so nothing else would ever uppercase them.
  // Only the language switch used to, via rebuildStory, which is why a fact
  // label came up upper case after a switch and lower case on a plain refresh.
  applyCase(story);

  // #story itself survives a rebuild — only its contents are replaced — so the
  // delegated listener is attached once. Re-attaching per build stacked a second
  // handler on every language switch, and each click then fired twice.
  if (!story.dataset.bound) {
    story.dataset.bound = '1';
    story.addEventListener('click', ev => {
      const toggle = ev.target.closest('.parcel-toggle');
      if (toggle) { toggleParcels(toggle.dataset.zone); return; }

      const tab = ev.target.closest('.parcel-tab');
      if (tab) setParcelMode(tab.dataset.mode, tab.dataset.zone);
    });
  }
}

// The style imports Mapbox Standard, so its roads are not layers we can hide
// by id — they arrive through the import and are driven by config properties.
// This Standard version has no on/off switch for roads (no showRoadsAndTransit
// in its schema), only the three road colours — so they get painted with a
// fully transparent colour, which is what actually removes them.
const NO_PAINT = 'hsla(0, 0%, 0%, 0)';

function hideClutter(m) {
  const cfg = {
    colorRoads: NO_PAINT,
    colorMotorways: NO_PAINT,
    colorTrunks: NO_PAINT,
    showPedestrianRoads: false,
    showRoadLabels: false,
    showPointOfInterestLabels: false,
    showTransitLabels: false,
    showAdminBoundaries: false,
    showLandmarkIcons: false,
    show3dObjects: false,
    show3dBuildings: false,
    show3dTrees: false
  };
  for (const [k, v] of Object.entries(cfg)) {
    try { m.setConfigProperty('basemap', k, v); }
    catch (e) { /* not a Standard-based style — nothing to switch off */ }
  }
}

function buildMap(allBox) {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jorjone90/cmt0iv5hs001101sgcqdrhheh',
    bounds: allBox,
    fitBoundsOptions: { padding: 40 },
    attributionControl: false
  });

  // The camera belongs to the scroll, but hover has to reach the parcels — and
  // `interactive: false` switches off event delivery along with the gestures. So
  // interaction stays on and every handler that would fight the page is turned
  // off by name. No cooperative-gesture prompt appears either, because the
  // wheel is no longer the map's to claim.
  for (const h of ['scrollZoom', 'dragPan', 'dragRotate', 'touchZoomRotate',
                   'doubleClickZoom', 'keyboard', 'touchPitch', 'boxZoom']) {
    if (map[h]) map[h].disable();
  }
  map.setPadding(cameraPadding());

  // 'style.load', not 'load'. The style is missing two sprite images it asks
  // for, and a missing image holds the load event open indefinitely — the whole
  // layer stack was silently never added. Everything below needs the style
  // parsed, which is exactly what style.load means.
  map.on('style.load', () => {
    hideClutter(map);

    // Where our layers go. `slot` was used here and stopped working on the way
    // from GL JS 3.9 to 3.29 — a slotted layer renders nothing against this
    // style, which imports Standard and then draws its own layers over it. An
    // explicit anchor does not depend on how a version reads slots: everything
    // ours goes under the style's first layer, in the order it is added, and the
    // labels the style draws stay on top.
    const styleLayers = map.getStyle().layers;
    const bottomAnchor = styleLayers[0] && styleLayers[0].id;
    const firstSymbol = (styleLayers.find(
      l => l.type === 'symbol' && l.layout && l.layout['text-field']) || {}).id;

    // This is a historical-map basemap: scanned sheets plus a white coverage
    // fill, all of which would sit on top of the imagery we're about to add.
    // Water and the label layers stay — they read fine over satellite.
    for (const id of ['jorjone90-4zz23i', 'jorjone90-dj71hg', 'soviet-topo-1mln',
                      '1922-map', 'soviet-topo-cover-fill',
                      'soviet-topo-cover-outline', 'depth']) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
    }

    // Two DEM sources on purpose. Pointing terrain and a hillshade layer at
    // the same source makes Mapbox serve the hillshade at the terrain's tile
    // resolution, which it warns about — the cost of a second source is
    // memory, the benefit is relief that holds up when zoomed into a zone.
    map.addSource('dem-terrain', {
      type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512, maxzoom: 14
    });
    map.addSource('dem-shade', {
      type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512, maxzoom: 14
    });
    map.setTerrain({ source: 'dem-terrain', exaggeration: 1.15 });

    // 1. the whole world in b&w satellite, underneath everything the style
    //    still draws. -1 saturation is a true desaturation, not a grey wash.
    map.addSource('sat', {
      type: 'raster', url: 'mapbox://mapbox.satellite', tileSize: 256
    });
    map.addLayer({
      id: 'sat-bw', type: 'raster', source: 'sat',
      paint: {
        'raster-saturation': -1,
        'raster-contrast': 0.06,
        'raster-brightness-max': 0.94,
        'raster-fade-duration': 0
      }
    }, bottomAnchor);

    // 2. a sepia wash over the black-and-white, so the surround reads as an old
    //    plate rather than as a modern satellite basemap. Above the imagery and
    //    below the colour patches, which keeps the zone itself true in colour.
    map.addLayer({
      id: 'sepia-wash', type: 'background',
      paint: { 'background-color': SEPIA_WASH, 'background-opacity': SEPIA_STRENGTH }
    }, bottomAnchor);

    // 3. the Studio style's own shading, for the regional read of where the
    //    mountains give way to the valley. Desaturated because it is only
    //    wanted for its light and shade, and faded out past its own maxzoom.
    if (map.getSource(ZX_SHADE)) {
      map.addLayer({
        id: 'zx-shade', type: 'raster', source: ZX_SHADE,
        paint: {
          'raster-opacity': rampOf(ZX_SHADE_FADE),
          'raster-saturation': -1,
          'raster-contrast': 0.15,
          'raster-fade-duration': 0,
          'raster-resampling': 'linear'
        }
      }, bottomAnchor);
    } else {
      console.warn('shading source ' + ZX_SHADE + ' is not in this style');
    }

    // 4. relief over the imagery. Colour patches are inserted just below this
    //    layer, so one hillshade shades the b&w and the colour alike.
    map.addLayer({
      id: 'hillshade', type: 'hillshade', source: 'dem-shade',
      paint: {
        'hillshade-exaggeration': rampOf(SHADE_STRENGTH),
        ...SHADE_PAINT
      }
    }, bottomAnchor);

    // 5. hydrology. Moved below where the colour patches will go, so a river
    //    reads grey through the black-and-white and keeps its colour where a
    //    zone is drawn over it. The move has to happen before any patch is
    //    added, or the patch would land underneath the water again.
    if (map.getLayer('water')) {
      map.setPaintProperty('water', 'fill-color', WATER_GREY);
      map.setPaintProperty('water', 'fill-opacity', 0.9);
      map.moveLayer('water', 'hillshade');
    }
    for (const id of ['waterway', 'waterway-line', 'river']) {
      if (map.getLayer(id)) {
        map.setPaintProperty(id, 'line-color', WATER_GREY);
        map.moveLayer(id, 'hillshade');
      }
    }

    // 6. everything outside the country, in plain white. Above the relief, so
    //    the blank ground stays flat, and below the colour patches, which fall
    //    inside the border anyway.
    //
    //    Only land is covered: the sea carries no country polygon, so the Black
    //    Sea keeps its imagery. Painting the style's water layer white fixed
    //    that and turned the Alazani into a white river through the middle of
    //    Kakheti, which is worse — a zone view shows rivers far more often than
    //    it shows coast.
    map.addSource('countries', { type: 'vector', url: COUNTRIES });
    map.addLayer({
      id: 'outside-georgia', type: 'fill',
      source: 'countries', 'source-layer': 'country_boundaries',
      filter: ['!=', ['get', 'iso_3166_1'], 'GE'],
      paint: { 'fill-color': OUTSIDE_FILL, 'fill-opacity': 1, 'fill-antialias': true }
    }, bottomAnchor);


    map.on('render', placeLabel);
    map.on('render', () => {
      if (current && placeApplied !== current.id) updatePlaceLabels(current);
    });
    markPreview();
    startScroll();

    // Switching language rebuilds the text, never the data: the story markup is
    // regenerated, the visible legend re-rendered from the legend object it
    // already holds, and not one parcel or patch is fetched again.
    onLangChange(rebuildStory);
  });
}

function buildInset(allBox) {
  inset = new mapboxgl.Map({
    container: 'inset',
    style: 'mapbox://styles/jorjone90/cmt0iv5hs001101sgcqdrhheh',
    bounds: allBox,
    fitBoundsOptions: { padding: 16 },
    interactive: false,
    attributionControl: false
  });

  inset.on('style.load', () => {
    hideClutter(inset);
    for (const id of ['soviet-topo-1mln', '1922-map', 'soviet-topo-cover-fill',
                      'soviet-topo-cover-outline', 'depth']) {
      if (inset.getLayer(id)) inset.setLayoutProperty(id, 'visibility', 'none');
    }

    inset.addSource('active', { type: 'geojson', data: emptyFC() });

    // Same reason as the main map: an anchor rather than a slot.
    const insetAnchor = (inset.getStyle().layers.find(
      l => l.type === 'symbol' && l.layout && l.layout['text-field']) || {}).id;

    inset.addLayer({
      id: 'i-active', type: 'fill', source: 'active',
      paint: { 'fill-color': ZONE_PURPLE, 'fill-opacity': .85 }
    }, insetAnchor);
    inset.addLayer({
      id: 'i-active-line', type: 'line', source: 'active',
      paint: { 'line-color': ZONE_PURPLE, 'line-width': 1.8 }
    }, insetAnchor);
  });
}

/* ─── colour patches ────────────────────────────────────────────────── */
const mercY = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
const patchState = {};        // zone id -> 'pending' | 'ready' | 'failed'

function patchBox(bbox) {
  const [[w, s], [e, n]] = bbox;
  const dx = (e - w) * PATCH_PAD, dy = (n - s) * PATCH_PAD;
  return [w - dx, s - dy, e + dx, n + dy];
}

// The static image comes back in Mercator, so its pixel aspect follows
// Mercator y rather than raw degrees. Get this wrong and the mask lands a
// few percent off the imagery — enough to see at the boundary.
function patchSize(box) {
  const wRad = (box[2] - box[0]) * Math.PI / 180;
  const ratio = (mercY(box[3]) - mercY(box[1])) / wRad;
  let W = PATCH_MAX_PX, H = Math.round(W * ratio);
  if (H > PATCH_MAX_PX) { H = PATCH_MAX_PX; W = Math.round(H / ratio); }
  return [Math.max(1, W), Math.max(1, H)];
}

function loadImage(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';   // required to read the canvas back out
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('static image request failed'));
    img.src = url;
  });
}

// The alpha the patch is cut with. Kept as its own canvas because the patch is
// composited twice — once for the imagery, again when the topographic sheet
// arrives — and blurring a 2,000px shape is not something to do twice.
function buildMaskCanvas(z, w, h, toPx) {
  const mask = document.createElement('canvas');
  mask.width = w; mask.height = h;
  const mctx = mask.getContext('2d');
  const blur = Math.round(Math.min(w, h) * PATCH_FEATHER);
  const off = w + blur * 4;

  // The feather comes from a drop shadow, not ctx.filter: filter is missing in
  // Safari before 17, and there it fails by producing exactly the hard cut this
  // technique exists to avoid. The shape is parked off-canvas and only its
  // blurred shadow lands.
  mctx.shadowColor = '#fff';
  mctx.shadowBlur = blur;
  mctx.shadowOffsetX = off;
  mctx.fillStyle = '#fff';
  mctx.beginPath();
  for (const f of z.fc.features) {
    const g = f.geometry;
    if (!g || !/Polygon/.test(g.type)) continue;
    const parts = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const rings of parts) {
      for (const ring of rings) {        // inner rings punch out under evenodd
        ring.forEach((c, i) => {
          const [x, y] = toPx(c);
          i ? mctx.lineTo(x - off, y) : mctx.moveTo(x - off, y);
        });
        mctx.closePath();
      }
    }
  }
  mctx.fill('evenodd');
  return mask;
}

function applyMask(ctx, mask) {
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(mask, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}

const toBlobUrl = cv => new Promise((res, rej) =>
  cv.toBlob(b => b ? res(URL.createObjectURL(b)) : rej(new Error('toBlob failed')), 'image/png'));

async function buildPatch(z) {
  const box = patchBox(z.bbox);
  const [W, H] = patchSize(box);

  // The sheet is fetched alongside the imagery but NOT waited for. It comes off
  // a slow host — seconds, not milliseconds — and blocking the colour on it left
  // the zone black-and-white for the whole download. The imagery paints as soon
  // as it lands and the sheet is blended into the same canvas when it arrives.
  const scale = Math.min(1, TOPO.maxPx / Math.max(W * 2, H * 2));
  const topoPromise = loadImage(topoUrl(box,
      Math.max(1, Math.round(W * 2 * scale)),
      Math.max(1, Math.round(H * 2 * scale))))
    .catch(err => { console.warn('topo sheet failed for ' + z.name, err); return null; });

  const img = await loadImage(
    `https://api.mapbox.com/styles/v1/${PATCH_STYLE}/static/[${box.join(',')}]/`
    + `${W}x${H}@2x?access_token=${mapboxgl.accessToken}&attribution=false&logo=false`
  );

  const cv = document.createElement('canvas');
  cv.width = img.naturalWidth; cv.height = img.naturalHeight;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const y0 = mercY(box[3]), y1 = mercY(box[1]);
  const toPx = ([lon, lat]) => [
    (lon - box[0]) / (box[2] - box[0]) * cv.width,
    (y0 - mercY(lat)) / (y0 - y1) * cv.height
  ];

  // Built once and kept: the second pass, when the sheet lands, re-composites
  // from the untouched imagery and needs the very same alpha.
  const mask = buildMaskCanvas(z, cv.width, cv.height, toPx);
  applyMask(ctx, mask);

  const id = 'patch-' + z.id;
  const coordinates = [[box[0], box[3]], [box[2], box[3]], [box[2], box[1]], [box[0], box[1]]];
  let url = await toBlobUrl(cv);

  map.addSource(id, { type: 'image', url, coordinates });
  map.addLayer({
    id, type: 'raster', source: id,
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': { duration: 900 },
      'raster-fade-duration': 0,
      'raster-resampling': 'linear'
    }
  }, map.getLayer('hillshade') ? 'hillshade' : undefined);

  // Second pass, whenever the sheet turns up. Not awaited: the caller has its
  // colour already and this only deepens it.
  topoPromise.then(async topo => {
    if (!topo || !map.getSource(id)) return;

    // From the imagery again, because the first pass already cut the alpha and
    // multiplying into transparent pixels would darken the feathered edge.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0);

    // Multiply lets the satellite show through the sheet's paper white and
    // darkens where the linework is, which reads as one image rather than two.
    ctx.globalCompositeOperation = TOPO.blend;
    ctx.globalAlpha = TOPO.alpha;
    ctx.drawImage(topo, 0, 0, cv.width, cv.height);
    ctx.globalAlpha = 1;
    applyMask(ctx, mask);

    const next = await toBlobUrl(cv);
    map.getSource(id).updateImage({ url: next, coordinates });
    URL.revokeObjectURL(url);        // the first pass is no longer referenced
    url = next;
  }).catch(err => console.warn('topo blend failed for ' + z.name, err));
}

/* ─── parcel tooltip ────────────────────────────────────────────────────
   A GeoJSON source is turned into tiles internally, and that pipeline
   JSON-encodes any property that is not a scalar. So `varieties` arrives at a
   query result as a string, not the array it was put in as — parsing it back is
   not defensive coding, it is the documented round trip.
   ─────────────────────────────────────────────────────────────────────── */
const tipEl = document.getElementById('parcel-tip');
const boundParcelLayers = new Set();

function parsedVarieties(props) {
  const raw = props.varieties;
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw || '[]'); } catch (err) { return []; }
}

function tipHtml(props) {
  const varieties = parsedVarieties(props);
  const ha = (Number(props.Fartobi_kvm) || 0) / 10000;
  const rows = varieties.map(v => {
    const name = varietyLabel(v.variety, v.varietyKa);
    const share = (Number(v.area) || 0) / 10000;
    const when = v.year ? t('tip.planted', esc(v.year)) : t('tip.noYear');
    return `<div class="tip-row">
        <span class="tip-name">${name}</span>
        <span class="tip-meta">${t('tip.ha', share.toFixed(2))} · ${when}${
          v.training ? ` · ${esc(String(v.training).toLowerCase())}` : ''}</span>
      </div>`;
  }).join('');

  return `
    ${props._inZone ? '' : `<div class="tip-outside">${t('tip.outside')}</div>`}
    <div class="tip-head">${t('tip.ha', ha.toFixed(2))}${
      varieties.length > 1 ? t('tip.varieties', varieties.length) : ''}</div>
    ${rows || `<div class="tip-row"><span class="tip-name">${t('vine.unknown')}</span></div>`}`;
}

function moveTip(point) {
  if (!tipEl) return;
  const stage = document.getElementById('stage');
  const w = stage ? stage.clientWidth : window.innerWidth;
  const h = stage ? stage.clientHeight : window.innerHeight;
  const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
  // flip rather than run off the edge
  const x = point.x + 16 + tw > w ? point.x - 16 - tw : point.x + 16;
  const y = Math.min(Math.max(8, point.y - th / 2), h - th - 8);
  tipEl.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}

let tipDismissBound = false;

function bindTipDismiss() {
  if (tipDismissBound) return;
  tipDismissBound = true;
  // A tap that misses every parcel closes it. Checked by query rather than by
  // listening on the layer, because the general click fires for layer hits too
  // and would close the tooltip in the same gesture that opened it.
  map.on('click', e => {
    const layers = [...boundParcelLayers].filter(id => map.getLayer(id));
    if (!layers.length || !map.queryRenderedFeatures(e.point, { layers }).length) hideTip();
  });
  // The tooltip is pinned to a pixel, so it means nothing once the camera moves.
  map.on('movestart', hideTip);
}

function bindParcelHover(layerId) {
  if (!tipEl || boundParcelLayers.has(layerId)) return;
  boundParcelLayers.add(layerId);
  bindTipDismiss();

  const show = e => {
    const f = e.features && e.features[0];
    if (!f) return;
    tipEl.innerHTML = tipHtml(f.properties || {});
    tipEl.hidden = false;
    moveTip(e.point);
    map.getCanvas().style.cursor = 'crosshair';
  };
  map.on('mousemove', layerId, show);
  map.on('click', layerId, show);          // touch has no hover
  map.on('mouseleave', layerId, () => {
    tipEl.hidden = true;
    map.getCanvas().style.cursor = '';
  });
}

function hideTip() {
  if (tipEl) tipEl.hidden = true;
}

function showPatch(z) {
  for (const other of zones) {
    const id = 'patch-' + other.id;
    if (map.getLayer(id)) {
      map.setPaintProperty(id, 'raster-opacity', other === z ? 1 : 0);
    }
  }
  requestPatch(z).then(() => {
    // the reader may have scrolled on while the request was in flight
    if (current === z && map.getLayer('patch-' + z.id)) {
      map.setPaintProperty('patch-' + z.id, 'raster-opacity', 1);
    }
  });
}

function requestPatch(z) {
  const state = patchState[z.id];
  if (state) return state.promise || Promise.resolve();   // built, building, or broken

  const promise = buildPatch(z)
    .then(() => { patchState[z.id] = { status: 'ready' }; })
    .catch(err => {
      patchState[z.id] = { status: 'failed' };
      console.warn('colour patch failed for ' + z.name, err);
    });
  patchState[z.id] = { status: 'pending', promise };
  return promise;
}

// Only the first zone should ever be waited for. The next one is fetched while
// its predecessor is being read — after it, so the two are not competing for the
// same connection, which on the sheet's host is the scarce thing.
function prefetchNextPatch(i) {
  const next = steps.slice(i + 1).map(st => st.zone).find(z => !patchState[z.id]);
  if (!next) return;
  const active = steps[i] && patchState[steps[i].zone.id];   // not `current`: that is the module's own
  const after = (active && active.promise) || Promise.resolve();
  after.then(() => requestPatch(next));
}

/* ─── parcel layers ─────────────────────────────────────────────────────── */

// Planar shoelace in metres. Over a parcel — hundreds of metres across — the
// error against a geodesic area is far below the precision the source has.
function ringHectares(ring, lat0) {
  const kx = M_PER_DEG * Math.cos(lat0 * Math.PI / 180);
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += (ring[j][0] * kx) * (ring[i][1] * M_PER_DEG)
       - (ring[i][0] * kx) * (ring[j][1] * M_PER_DEG);
  }
  return Math.abs(a / 2) / 10000;
}

function featureHectares(f, lat0) {
  const g = f.geometry;
  if (!g || !/Polygon/.test(g.type)) return 0;
  const parts = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  // outer ring less its holes
  return parts.reduce((sum, rings) => sum + rings.reduce(
    (acc, r, i) => acc + (i === 0 ? ringHectares(r, lat0) : -ringHectares(r, lat0)), 0), 0);
}

// Everything below writes into innerHTML, and variety names come from a public
// service — so they are escaped at the point of formatting rather than trusted.
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ESCAPES[c]);

// Tidy the service's variety names for display: they arrive as
// 'ALEXANDROULI - BLACK', where the suffix is berry colour, not part of the name.
// The two scripts are tagged separately so each takes its own face mid-line.
function varietyLabel(latin, georgian) {
  const name = String(latin || 'Unrecorded').replace(/\s*-\s*[A-Z]+$/, '');
  const titled = name.charAt(0) + name.slice(1).toLowerCase();
  const roman = `<span lang="en">${esc(titled)}</span>`;
  return georgian ? `<span lang="ka">${esc(georgian)}</span> · ${roman}` : roman;
}

// Ranked by the area each variety is DOMINANT over, not by total planted area,
// because dominance is what the fill paints. Ranking one way and colouring the
// other would put a variety in the legend that is nowhere on the map.
function buildLegend(fc) {
  const classes = {
    WHITE:    { key: 'WHITE',    labelKey: 'vine.white',    colour: VINE_COLOURS.WHITE,    parcels: 0, ha: 0, varieties: new Map() },
    COLOURED: { key: 'COLOURED', labelKey: 'vine.coloured', colour: VINE_COLOURS.COLOURED, parcels: 0, ha: 0, varieties: new Map() },
    UNKNOWN:  { key: 'UNKNOWN',  labelKey: 'vine.unknown',  colour: VINE_COLOURS.UNKNOWN,  parcels: 0, ha: 0, varieties: new Map() }
  };
  let mixed = 0, total = 0, inside = 0, context = 0;

  for (const f of fc.features) {
    const pr = f.properties || {};
    // Neighbours are drawn but never counted: a total that quietly included
    // land outside the boundary would be a wrong answer, not a fuller one.
    if (!pr._inZone) { context++; continue; }
    inside++;

    const name = pr.dominantVariety || '';
    const bare = String(name).replace(/\s*-\s*[A-Z]+$/, '').trim();
    const berry = pr.colour;                       // WHITE | BLACK | RED | PINK | GRAY | OTHER
    const cls = UNRECORDED.test(bare) ? classes.UNKNOWN
              : berry === 'WHITE' ? classes.WHITE
              : COLOURED_BERRIES.includes(berry) ? classes.COLOURED
              : classes.UNKNOWN;

    const ha = (Number(pr.Fartobi_kvm) || 0) / 10000 || featureHectares(f, 42);
    if ((pr.nVarieties || 1) > 1) mixed++;
    total += ha;
    cls.parcels += 1;
    cls.ha += ha;
    if (cls !== classes.UNKNOWN) {
      const label = varietyLabel(name, pr.dominantVarietyKa);
      const v = cls.varieties.get(name) || { key: name, label, parcels: 0, ha: 0 };
      v.labelKa = pr.dominantVarietyKa || null;
      v.parcels += 1; v.ha += ha;
      cls.varieties.set(name, v);
    }
  }

  const vineRows = [];
  for (const c of [classes.WHITE, classes.COLOURED, classes.UNKNOWN]) {
    if (!c.parcels) continue;
    const ranked = [...c.varieties.values()].sort((a, b) => b.ha - a.ha);
    const ramp = VINE_RAMPS[c.key];

    // the class itself, as a heading with its own total
    vineRows.push({
      level: 'class', labelKey: c.labelKey, colour: ramp ? ramp[2] : c.colour,
      // the family's whole range in one swatch, so the class line is not just a
      // duplicate of the vine listed under it
      ramp: ramp || null,
      parcels: c.parcels, ha: c.ha, key: c.key
    });
    if (!ramp) continue;

    // darkest step to the vine the family is mostly planted to
    ranked.slice(0, NAMED_PER_FAMILY).forEach((v, i) => {
      vineRows.push({
        level: 'shade', label: v.label, key: v.key,
        colour: ramp[ramp.length - 1 - i], parcels: v.parcels, ha: v.ha
      });
    });

    const rest = ranked.slice(NAMED_PER_FAMILY);
    if (rest.length) {
      vineRows.push({
        level: 'shade', key: null,
        labelKey: 'vine.others', labelArg: rest.length,
        colour: ramp[0],
        parcels: rest.reduce((n, v) => n + v.parcels, 0),
        ha: rest.reduce((n, v) => n + v.ha, 0),
        varieties: rest.map(v => v.label)
      });
    }
  }

  return {
    vine: vineRows,
    year: yearRows(fc),
    total, parcels: inside, context, mixed,
    calls: fc.calls, truncated: fc.truncated
  };
}

// The same parcels, classed by when they were planted. Counted over the same
// in-zone set, so the two tabs always add up to the same total.
function yearRows(fc) {
  const bins = YEAR_COLOURS.map((colour, i) => ({
    binIndex: i, colour, parcels: 0, ha: 0, varieties: []
  }));
  const unknown = {
    labelKey: 'year.unknown', colour: VINE_COLOURS.UNKNOWN,
    parcels: 0, ha: 0, varieties: []
  };

  for (const f of fc.features) {
    const pr = f.properties || {};
    if (!pr._inZone) continue;
    const ha = (Number(pr.Fartobi_kvm) || 0) / 10000 || featureHectares(f, 42);
    const y = pr.year;
    if (y == null) { unknown.parcels++; unknown.ha += ha; continue; }
    let i = 0;
    while (i < YEAR_BREAKS.length && y >= YEAR_BREAKS[i]) i++;
    bins[i].parcels++; bins[i].ha += ha;
  }
  return [...bins, unknown].filter(b => b.parcels);
}

// The module is an ES module and this file is a classic script, so it is pulled
// in on demand. That also keeps its weight off the first paint — nobody who
// never opens a parcel layer pays for it.
let parcelModule = null;
function parcelApi() {
  return parcelModule || (parcelModule = import('../parcels/vineyard-parcels.js'));
}

// Straight off the properties the module derives, so neither fill needs to know
// which varieties or years happen to be present in this zone.
// Recomputed when needed rather than captured: the parcel layers are built long
// after the style loads, and a style change would invalidate a stored id.
function parcelAnchor() {
  const layers = map.getStyle().layers;
  const symbol = layers.find(l => l.type === 'symbol' && l.layout && l.layout['text-field']);
  return symbol && symbol.id;
}

function parcelPaint(mode = parcelMode, legend = null) {
  if (mode === 'year') {
    return ['case',
      ['==', ['get', 'year'], null], VINE_COLOURS.UNKNOWN,
      ['step', ['get', 'year'],
        YEAR_COLOURS[0],
        ...YEAR_BREAKS.flatMap((b, i) => [b, YEAR_COLOURS[i + 1]])]];
  }
  // Anything not named falls through to its family's lightest step, so a zone
  // whose legend has not loaded still paints correctly by family alone.
  const byFamily = ['match', ['get', 'colour'],
    'WHITE', VINE_RAMPS.WHITE[0],
    COLOURED_BERRIES, VINE_RAMPS.COLOURED[0],
    VINE_COLOURS.UNKNOWN];

  const named = (legend ? legend.vine : [])
    .filter(r => r.level === 'shade' && r.key)
    .flatMap(r => [r.key, r.colour]);

  return named.length
    ? ['match', ['get', 'dominantVariety'], ...named, byFamily]
    : byFamily;
}

/* ─── the skirt ──────────────────────────────────────────────────────────
   Distance to the boundary, not to its bounding box. Every segment of the
   zone's rings is dropped into a grid of PARCEL_SKIRT_M cells in local metres,
   so testing a parcel means looking at the nine cells around each of its
   vertices instead of at the whole outline — a zone carries a few thousand
   segments after simplification, and a sweep returns several hundred parcels.

   The cell is exactly the skirt, which is what makes the 3x3 neighbourhood
   sufficient: nothing further than one cell away can be within the limit. */

function buildBoundaryIndex(fc, lat0, cellM) {
  const kx = M_PER_DEG * Math.cos(lat0 * Math.PI / 180);
  const cells = new Map();

  for (const f of fc.features) {
    const g = f.geometry;
    if (!g || !/Polygon/.test(g.type)) continue;
    const parts = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const rings of parts) {
      // Holes count too: a parcel just inside a hole is outside the zone, and
      // the nearest boundary to it is the hole's own edge.
      for (const ring of rings) {
        for (let i = 1; i < ring.length; i++) {
          const seg = [ring[i - 1][0] * kx, ring[i - 1][1] * M_PER_DEG,
                       ring[i][0] * kx, ring[i][1] * M_PER_DEG];
          const i0 = Math.floor(Math.min(seg[0], seg[2]) / cellM);
          const i1 = Math.floor(Math.max(seg[0], seg[2]) / cellM);
          const j0 = Math.floor(Math.min(seg[1], seg[3]) / cellM);
          const j1 = Math.floor(Math.max(seg[1], seg[3]) / cellM);
          for (let a = i0; a <= i1; a++) {
            for (let b = j0; b <= j1; b++) {
              const key = a + ':' + b;
              const bucket = cells.get(key);
              if (bucket) bucket.push(seg); else cells.set(key, [seg]);
            }
          }
        }
      }
    }
  }
  return { kx, cellM, cells };
}

function segDist2(px, py, seg) {
  const [ax, ay, bx, by] = seg;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = px - (ax + t * dx), qy = py - (ay + t * dy);
  return qx * qx + qy * qy;
}

// Tested on the parcel's vertices rather than its centre: a long holding lying
// along the boundary can have its centre well outside the skirt while most of
// it is inside.
function nearBoundary(f, idx, limitM) {
  const g = f.geometry;
  if (!g || !/Polygon/.test(g.type)) return false;
  const parts = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  const lim2 = limitM * limitM;

  for (const rings of parts) {
    for (const p of rings[0]) {
      const x = p[0] * idx.kx, y = p[1] * M_PER_DEG;
      const ci = Math.floor(x / idx.cellM), cj = Math.floor(y / idx.cellM);
      for (let a = -1; a <= 1; a++) {
        for (let b = -1; b <= 1; b++) {
          const segs = idx.cells.get((ci + a) + ':' + (cj + b));
          if (!segs) continue;
          for (const seg of segs) if (segDist2(x, y, seg) <= lim2) return true;
        }
      }
    }
  }
  return false;
}

async function loadParcels(z, onProgress) {
  const { getParcels } = await parcelApi();
  const [[w, s], [e, n]] = z.bbox;

  // Reach past the boundary for context, but not so far that a wide zone turns
  // one request into a long sweep.
  const latScale = Math.cos((s + n) / 2 * Math.PI / 180);
  const padX = PARCEL_FETCH_PAD_M / (M_PER_DEG * latScale);
  const padY = PARCEL_FETCH_PAD_M / M_PER_DEG;

  // Nothing here needs adapting from MapLibre: addSource, setData, promoteId
  // and the expression syntax are the same call for the same result in Mapbox.
  const fc = await getParcels([w - padX, s - padY, e + padX, n + padY], { onProgress });

  // Inside the boundary, or within the skirt of it. Everything else the
  // rectangle happened to catch is dropped here rather than drawn faint: at a
  // concave corner the rectangle reaches far enough out to pick up a
  // neighbouring village's holdings, and those read as context they are not.
  const idx = buildBoundaryIndex(z.fc, (s + n) / 2, PARCEL_SKIRT_M);
  const kept = [];
  for (const f of fc.features) {
    const c = roughCentre(f);
    f.properties._inZone = c ? pointInFC(c, z.fc) : false;
    if (f.properties._inZone || nearBoundary(f, idx, PARCEL_SKIRT_M)) kept.push(f);
  }
  if (kept.length !== fc.features.length) {
    console.info('parcels ' + z.id + ': ' + kept.length + ' of ' + fc.features.length +
                 ' kept (' + (fc.features.length - kept.length) + ' beyond ' +
                 PARCEL_SKIRT_M + 'm of the boundary)');
  }
  fc.features = kept;

  const legend = buildLegend(fc);

  const src = 'parcels-' + z.id;
  if (map.getSource(src)) {
    map.getSource(src).setData(fc);
  } else {
    map.addSource(src, { type: 'geojson', data: fc, promoteId: 'OBJECTID' });
  }

  const colour = parcelPaint(parcelMode, legend);

  if (!map.getLayer(src + '-fill')) {
    map.addLayer({
      id: src + '-fill', type: 'fill', source: src,
      paint: {
        'fill-color': colour,
        // solid inside the boundary; neighbours stay a wash of background
        'fill-opacity': ['case', ['get', '_inZone'], 1, 0.16],
        'fill-opacity-transition': { duration: 450 }
      }
    }, parcelAnchor());
    // A hairline between neighbours: without it two adjacent parcels of the
    // same variety read as one holding.
    map.addLayer({
      id: src + '-line', type: 'line', source: src,
      paint: {
        // A hairline between neighbours: without it two adjacent parcels of the
        // same vine read as one holding. White inside, where the fill is solid
        // and a dark line would just read as a gap; dark outside, where the
        // wash is faint and white would shout.
        'line-color': ['case', ['get', '_inZone'], '#f4ecd8', 'rgba(38,28,16,.8)'],
        'line-width': ['case', ['get', '_inZone'], 0.5, 1],
        'line-opacity': ['case', ['get', '_inZone'], 0.85, 0.35]
      }
    }, parcelAnchor());
    bindParcelHover(src + '-fill');
  } else {
    map.setPaintProperty(src + '-fill', 'fill-color', colour);
  }
  return legend;
}

function renderLegend(z, legend) {
  const el = document.getElementById('legend-' + z.id);
  if (!el) return;
  // One decimal on every hectare figure, always. Switching precision by
  // magnitude — 73 here, 18.2 there — makes a column that sums correctly look
  // like it does not, which is worse than the digit it saves.
  const ha = n => n.toLocaleString(undefined,
    { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const count = n => n.toLocaleString();
  const mixed = legend.mixed ? t('parcels.mixed', legend.mixed) : '';
  // The service caps a request at 2,000 rows and the module quadrants around it.
  // If cells were still full at the recursion limit, parcels are missing, and
  // the reader should be told rather than shown a tidy lie.
  const short = legend.truncated
    ? `<p class="parcel-warn">${t('parcels.truncated')}</p>`
    : '';
  const context = legend.context ? t('parcels.context', legend.context) : '';
  const rows = legend[parcelMode] || legend.vine;
  // Rows carry a key rather than a finished string, so the same legend object
  // re-renders in the other language without refetching a single parcel.
  const years = yearLabels();
  const rowLabel = r => r.labelKey ? t(r.labelKey, r.labelArg)
                      : r.binIndex != null ? years[r.binIndex]
                      : r.label;
  const tabs = PARCEL_MODES.map(m => `
    <button type="button" class="parcel-tab${m === parcelMode ? ' is-on' : ''}"
            data-mode="${m}" data-zone="${z.id}" role="tab"
            aria-selected="${m === parcelMode}">${t('parcels.tab.' + m)}</button>`).join('');

  el.innerHTML = `
    ${short}
    <p class="parcel-summary">${t('parcels.summary', count(legend.parcels), ha(legend.total))}${mixed}${context}</p>
    <div class="parcel-tabs" role="tablist" aria-label="Colour the parcels by">${tabs}</div>
    <table class="parcel-table">
      <thead><tr>
        <th>${t('parcels.col.' + parcelMode)}</th>
        <th class="num">${t('parcels.col.parcels')}</th>
        <th class="num">${t('parcels.col.ha')}</th>
      </tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr class="${r.level === 'shade' ? 'is-shade' : 'is-class'}">
            <td>
              <span class="swatch" style="background:${
                r.ramp ? `linear-gradient(90deg, ${r.ramp.join(', ')})` : r.colour
              }"></span>${rowLabel(r)}
              ${r.varieties && r.varieties.length ? `
                <details class="parcel-varieties">
                  <summary>${t('parcels.whichOnes')}</summary>
                  <ul>${r.varieties.map(v => `<li><span>${v}</span></li>`).join('')}</ul>
                </details>` : ''}
            </td>
            <td class="num">${count(r.parcels)}</td>
            <td class="num">${ha(r.ha)}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <p class="parcel-note">${t('parcels.note' + (parcelMode === 'year' ? 'Year' : 'Vine'))}
      ${t('parcels.source')}</p>`;
  el.hidden = false;
  applyCase(el);               // the legend was just written
}

// The mode is global: switch tab on one zone and the next zone opens the same
// way, which is what a reader who came for planting dates expects.
function setParcelMode(mode, zoneId) {
  if (!PARCEL_MODES.includes(mode) || mode === parcelMode) return;
  parcelMode = mode;
  hideTip();

  for (const z of zones) {
    const id = 'parcels-' + z.id + '-fill';
    const st = parcelState[z.id];
    // the vine paint is per zone, because the named vines differ by zone
    if (map.getLayer(id)) {
      map.setPaintProperty(id, 'fill-color', parcelPaint(mode, st && st.legend));
    }
    if (st && st.legend && (st.visible || z.id === zoneId)) renderLegend(z, st.legend);
  }
}

function setParcelVisibility(z, visible) {
  const src = 'parcels-' + z.id;
  for (const id of [src + '-fill', src + '-line']) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
    }
  }
}

// Parcels belong to the zone whose card turned them on. Scrolling to any other
// zone puts the map back to how it was, so the layer is something the reader
// turns on rather than something that follows them around. The data stays
// cached, so turning it back on is instant.
function hideParcels(except) {
  for (const z of zones) {
    if (z === except) continue;
    const st = parcelState[z.id];
    if (st && st.visible) {
      setParcelVisibility(z, false);
      hideTip();
      st.visible = false;
      const el = document.getElementById('legend-' + z.id);
      if (el) el.hidden = true;
      syncToggle(z);
    }
  }
}

function syncToggle(z) {
  const btn = document.querySelector(`.parcel-toggle[data-zone="${z.id}"]`);
  if (!btn) return;
  const on = !!(parcelState[z.id] && parcelState[z.id].visible);
  btn.setAttribute('aria-pressed', String(on));
  btn.classList.toggle('is-on', on);
  btn.querySelector('.parcel-toggle-label').textContent =
    on ? t('parcels.hide') : t('parcels.show');
}

// The button is the only way the parcels appear: a sweep is seconds of the
// register's time, so it happens when a reader asks for it rather than for every
// zone a scroll passes. Pressing flips whichever way the layer currently is.
function toggleParcels(zoneId) {
  const z = zones.find(x => x.id === zoneId);
  if (!z || !z.parcels) return;
  const st = parcelState[z.id];
  if (st && st.busy) return;
  if (st && st.loaded && st.visible) {
    st.visible = false;
    setParcelVisibility(z, false);
    const el = document.getElementById('legend-' + z.id);
    if (el) el.hidden = true;
    hideTip();
    syncToggle(z);
    // The button is now the only thing that turns the layer on, so it is also
    // the only thing that can hand the map back. Turning the parcels off with
    // a camera the reader dragged puts the zone back in its frame.
    setMapInteractive(false);
    if (current === z) {
      map.fitBounds(cameraBox(z), {
        padding: cameraPadding(z), maxZoom: MAX_ZOOM,
        duration: reduced ? 0 : 900, essential: true
      });
    }
    return;
  }
  showParcels(z);
}

async function showParcels(z) {
  if (!z || !z.parcels) return;
  const st = parcelState[z.id] || (parcelState[z.id] = { loaded: false, visible: false });
  if (st.busy || st.failed) return;

  if (st.loaded) {
    if (st.visible) return;
    st.visible = true;
    setParcelVisibility(z, true);
    const el = document.getElementById('legend-' + z.id);
    if (el) el.hidden = false;
    syncToggle(z);
    setMapInteractive(true);
    return;
  }

  const btn = document.querySelector(`.parcel-toggle[data-zone="${z.id}"]`);
  if (!btn) return;

  st.busy = true;
  btn.classList.add('is-loading');
  const label = btn.querySelector('.parcel-toggle-label');

  // Sweeping is measured at about 2.6s for a 1.8km view and 42s for 14km, so a
  // wide zone is a wait worth announcing before it starts, not after.
  const [[w0, s0], [e0, n0]] = z.bbox;
  const km = (e0 - w0) * 111.32 * Math.cos((s0 + n0) / 2 * Math.PI / 180);
  label.textContent = km > 8 ? t('parcels.loadingWide') : t('parcels.loading');

  try {
    st.legend = await loadParcels(z, ({ calls, rows }) => {
      if (rows) label.textContent = t('parcels.loadingCount', rows.toLocaleString(), calls);
    });
    st.loaded = true; st.visible = true;
    renderLegend(z, st.legend);
    syncToggle(z);
    setMapInteractive(true);
  } catch (err) {
    console.warn('parcels failed for ' + z.name, err);
    st.failed = true;                 // a failed sweep is not retried on every scroll
    label.textContent = t('parcels.unavailable');
    btn.disabled = true;
  } finally {
    st.busy = false;
    btn.classList.remove('is-loading');
  }
}

/* ─── the seam between map and photograph ───────────────────────────────
   The edge is a path, not a gradient, so it can be any shape at all.

   Author it in a 100 x 100 box — x rightwards, y down — and it is scaled to
   whatever the stage measures. Filled area is where the photograph shows;
   everything outside it is map. Any valid path data works, including several
   subpaths, so the photo can arrive in more than one piece.

   The feather is a Gaussian blur applied AFTER the scale, in pixels, so a wide
   viewport does not stretch it into an ellipse.

   A zone can override the shape with `mask:` in its manifest entry.
   ─────────────────────────────────────────────────────────────────────── */
// Which side of the frame the photograph occupies. Everything else follows from
// it: the camera reserves that side, the panel sits over it, and the zone's name
// goes to the far side of the zone, away from the picture.
// A zone can override with `photoSide:` in its manifest entry.
const PHOTO_SIDE = 'right';        // 'right' | 'left' | 'top' | 'bottom'

// Portrait has no room for a side-by-side split, so the two horizontal layouts
// fold onto the nearest vertical one.
const MOBILE_SIDE = { right: 'bottom', left: 'top', bottom: 'bottom', top: 'top' };

// The seam decides how much frame the map gets: the camera reserves everything
// from the seam's deepest point plus the feather, so a shape that wandered to
// 46% left the zone an eighth of the screen to sit in. These keep the wave but
// hold it to the outer third.
const MASK_SHAPES = {
  right:  'M100,0 L58,0 C50,15 62,31 52,47 C44,61 60,77 51,100 L100,100 Z',
  left:   'M0,0 L42,0 C50,15 38,31 48,47 C56,61 40,77 49,100 L0,100 Z',
  bottom: 'M0,100 L0,58 C17,50 31,62 47,52 C63,44 80,60 100,51 L100,100 Z',
  top:    'M0,0 L0,42 C17,50 31,38 47,48 C63,56 80,40 100,49 L100,0 Z'
};

function sideFor(z) {
  const want = sidePreview || (z && z.photoSide) || PHOTO_SIDE;
  return window.matchMedia('(max-width: 720px)').matches
    ? (MOBILE_SIDE[want] || 'bottom')
    : want;
}

const isVerticalSeam = side => side === 'right' || side === 'left';

// How far past the picture's own edge the zone is kept, in pixels, on top of
// the feather. At the path itself the photograph is 50% present — that is what a
// blurred step means — so clearing only to the path still leaves the zone under
// half a picture. The feather is a Gaussian of MASK_FEATHER_PX, and its alpha
// falls to 16% one sigma inside the path, 7% at 1.5, 2% at two.
//
// One sigma, not 1.5. The clearance is charged to the map twice over: it is
// taken off the band, and then the zone is fitted into what is left, so every
// pixel of it is paid for in zoom. At 1.5 the gap read as a margin in its own
// right and nudging a seam threw the camera back a long way; at 1.0 the picture
// is 16% present where the zone begins, which over imagery is a soft edge
// rather than a picture. 62 x 1.0 + 8 = 70px, against 109 before.
// How much of each axis at the frame's edges is left out of the seam's depth
// measurement. See seamReach().
const SEAM_EDGE_TRIM = 12;

const FEATHER_SIGMAS = 1.0;
const SEAM_CLEARANCE = 8;

// However deep a seam is drawn, the picture never takes more than this much of
// the frame. A mask drawn in the studio can reach anywhere — one drawn against
// an older layout reached halfway across — and the zone is the subject: it keeps
// the majority of the frame whatever the picture does.
const PICTURE_MAX_SHARE = 0.60;

// A seam that cuts deep into the frame can ask for more clearance than there is
// room for — padding wider than the canvas makes fitBounds fail outright. Below
// this the padding is walked back rather than allowed to break the camera.
const MIN_BAND = 170;

// The furthest the picture reaches into the frame, in the mask's 0-100 space.
// Sampled along the path rather than read off its control points: a curve's
// bezier handles sit outside the curve, so bounds taken from them over-reserve.
const reachCache = new Map();

function seamReach(path) {
  if (reachCache.has(path)) return reachCache.get(path);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  svg.style.cssText = 'position:absolute;left:-9999px;top:0';
  const el = document.createElementNS(ns, 'path');
  el.setAttribute('d', path);
  svg.appendChild(el);
  document.body.appendChild(svg);

  let out = null;
  try {
    const len = el.getTotalLength();
    if (len) {
      let minX = 100, maxX = 0, minY = 100, maxY = 0;
      for (let i = 0; i <= 240; i++) {
        const pt = el.getPointAtLength(len * i / 240);
        // A seam's deepest point decides how much frame the map gets, so a dip
        // in a corner is charged to the whole band — pull one control point
        // into the corner and the camera jumps back across the entire frame,
        // which is what makes editing a seam feel violent. The outer eighth of
        // each axis is therefore not measured: it is the frame's own margin and
        // the label's gutter, where the zone does not reach anyway.
        const inX = pt.x >= SEAM_EDGE_TRIM && pt.x <= 100 - SEAM_EDGE_TRIM;
        const inY = pt.y >= SEAM_EDGE_TRIM && pt.y <= 100 - SEAM_EDGE_TRIM;
        if (inY) { if (pt.x < minX) minX = pt.x;  if (pt.x > maxX) maxX = pt.x; }
        if (inX) { if (pt.y < minY) minY = pt.y;  if (pt.y > maxY) maxY = pt.y; }
      }
      // A seam entirely inside the trimmed strip leaves the extremes untouched;
      // fall back to the whole path rather than to nonsense.
      out = (maxX >= minX && maxY >= minY) ? { minX, maxX, minY, maxY } : null;
    }
  } catch (err) {
    console.warn('could not measure the seam; falling back to MAP_FOCUS', err);
  }
  document.body.removeChild(svg);
  reachCache.set(path, out);
  return out;
}

// The mask a given zone will actually wear.
function maskFor(z) {
  return maskPreview || (z && z.mask) || MASK_SHAPES[sideFor(z)];
}

const MASK_FEATHER_PX = 62;

// A seam handed over from mask-studio.html for a look at it on the real slides.
// Preview only — nothing is saved, and the manifest is untouched until the path
// is pasted into it.
const maskPreview = new URLSearchParams(location.search).get('mask');
// The studio sends the side along with the seam: a seam drawn for the left with
// the panel still laid out on the right would put the text over bare map.
const sidePreview = new URLSearchParams(location.search).get('side');

function plateMask(path, w, h, blur) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
      `viewBox="0 0 ${w} ${h}">` +
      `<filter id="f" x="-40%" y="-40%" width="180%" height="180%">` +
        `<feGaussianBlur stdDeviation="${blur}"/>` +
      `</filter>` +
      // filter on the outer group so the blur is in stage pixels; the scale
      // lives inside it, where it cannot stretch the feather
      `<g filter="url(#f)">` +
        `<g transform="scale(${(w / 100).toFixed(4)},${(h / 100).toFixed(4)})">` +
          `<path d="${path}" fill="#fff"/>` +
        `</g>` +
      `</g>` +
    `</svg>`;
  return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
}

// Says plainly that what is on screen is not what the manifest holds.
function markPreview() {
  if (!maskPreview || document.getElementById('seam-preview-flag')) return;
  const flag = document.createElement('div');
  flag.id = 'seam-preview-flag';
  flag.textContent = 'seam preview — not saved';
  document.body.appendChild(flag);
}

function applyPlateMask() {
  const stage = document.getElementById('stage');
  if (!stage || !plates[0]) return;
  const w = Math.round(stage.clientWidth);
  const h = Math.round(stage.clientHeight);
  if (!w || !h) return;

  const side = sideFor(current);
  const path = maskFor(current);
  const url = plateMask(path, w, h, MASK_FEATHER_PX);

  // The panel is placed against this: how much of the frame the map keeps, as a
  // percentage. Without it the panel is sized by a guess and overhangs the map
  // whenever the seam moves.
  const reach = seamReach(path);
  if (reach) {
    const raw = !isVerticalSeam(side) ? (side === 'top' ? 100 - reach.maxY : reach.minY)
              : side === 'left' ? 100 - reach.maxX
              : reach.minX;
    const edge = Math.max(raw, (1 - PICTURE_MAX_SHARE) * 100);
    document.documentElement.style.setProperty('--picture-edge', edge.toFixed(2) + '%');
  }

  for (const el of plates) {
    el.style.webkitMaskImage = url;      el.style.maskImage = url;
    el.style.webkitMaskSize = '100% 100%'; el.style.maskSize = '100% 100%';
    el.style.webkitMaskRepeat = 'no-repeat'; el.style.maskRepeat = 'no-repeat';
    el.style.webkitMaskPosition = '0 0'; el.style.maskPosition = '0 0';
  }
}

/* ─── the name on the map ───────────────────────────────────────────────
   An HTML element rather than a symbol layer, for two reasons: it can be set in
   Fraunces at the size the rest of the piece uses, and it sidesteps the question
   of whether the style's glyph stacks carry Georgian.

   It is re-projected on every render, so it tracks the zone through the camera
   move instead of jumping when the move ends.
   ─────────────────────────────────────────────────────────────────────── */
const labelEl = document.getElementById('zone-label');

// The point the name hangs from: the middle of the zone's lower edge, or its
// upper one. Centred on the zone rather than on the frame, so it reads as this
// zone's name and not as a caption for the whole map.
function labelAnchor(z) {
  const [[w, s], [e, n]] = cameraBox(z);
  return [(w + e) / 2, labelPlace(z) === 'top' ? n : s];
}

function placeLabel() {
  if (!labelEl || !current || !map) return;
  const p = map.project(labelAnchor(current));
  const w = labelEl.offsetWidth, h = labelEl.offsetHeight;
  const vw = window.innerWidth, vh = window.innerHeight;
  const side = sideFor(current);

  // The band the camera left for the map. Centring the name on the zone would
  // put it over the photograph whenever the zone sits hard against the seam.
  const pad = cameraPadding(current);
  const lo = Math.max(w / 2 + 12, pad.left + w / 2 + 12);
  const hi = Math.min(vw - w / 2 - 12, vw - pad.right - w / 2 - 12);

  // Aligned to the zone's near edge rather than centred on it, on whichever
  // side the photograph is. With the picture on the left the zone is pushed
  // right, so a name centred under it starts far out and a long one runs into
  // the corner; aligning its near edge with the zone's brings it back towards
  // the picture while still reading as attached to the shape.
  const [[bw, bs], [be, bn]] = cameraBox(current);
  const near = side === 'left'  ? map.project([bw, bs]).x + w / 2
             : side === 'right' ? map.project([be, bn]).x - w / 2
             : p.x;
  let x = hi > lo ? Math.min(Math.max(lo, near), hi) : vw / 2;

  // Vertically it sits just off the zone's own edge, so the name reads as
  // belonging to the shape rather than to the frame — but never closer to the
  // frame than LABEL_EDGE, which is what keeps a zone running past the bottom
  // from carrying its name off with it.
  const place = labelPlace(current);
  let y = place === 'top'
    ? Math.max(h + LABEL_EDGE, p.y - LABEL_GAP)
    : Math.min(vh - LABEL_EDGE, p.y + LABEL_GAP + h);

  // The inset is a fixed corner of the frame that the map knows nothing about,
  // and a long name reaches it. It slides along x first, which keeps the name
  // on the edge it was placed against; only when the band has no room left does
  // it step over the inset vertically instead.
  const box = insetBox();
  if (box) {
    const l = x - w / 2, r = x + w / 2, t = y - h, b = y;
    if (r > box.left - LABEL_CLEAR && l < box.right + LABEL_CLEAR &&
        b > box.top - LABEL_CLEAR && t < box.bottom + LABEL_CLEAR) {
      const goLeft = box.left - LABEL_CLEAR - w / 2;
      const goRight = box.right + LABEL_CLEAR + w / 2;
      if (goLeft >= lo) x = goLeft;
      else if (goRight <= hi) x = goRight;
      else y = Math.max(h + LABEL_EDGE, box.top - LABEL_CLEAR);
    }
  }

  labelEl.style.transform =
    `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -100%)`;
  labelEl.dataset.side = place;
}

// Cached: the inset does not move, but it is placed in CSS and resized by media
// query, so its box is measured rather than assumed — and dropped on resize.
let insetRect = null;
function insetBox() {
  if (insetRect) return insetRect;
  const el = document.getElementById('inset');
  if (!el || !el.offsetWidth) return null;
  insetRect = el.getBoundingClientRect();
  return insetRect;
}

function showLabel(z) {
  if (!labelEl) return;
  labelEl.innerHTML = '';
  // One language at a time: the label used to carry the name and its
  // counterpart on a second line, which meant half of it was always the
  // language the reader had just switched away from.
  const lang = currentLang() === 'ka' && z.native ? 'ka' : 'en';

  // A name may be written across two lines in the manifest. Each line is its
  // own element rather than one string with a <br> in it — textContent, because
  // a zone name is data. Latin names are raised; Georgian ones stay in
  // mkhedruli, which is what the label's face can draw.
  for (const line of zoneLines(z)) {
    const el = document.createElement('span');
    el.className = 'zone-label-name';
    el.lang = lang;
    el.textContent = upperLatinOnly(line);
    labelEl.appendChild(el);
  }

  placeLabel();
  labelEl.classList.add('is-visible');
}

/* ─── photo plates ──────────────────────────────────────────────────── */
const plates = [document.getElementById('plateA'), document.getElementById('plateB')];
let activePlate = 0;
let photoShowing = false;
let photoWanted = null;   // the url the plate is showing, or on its way to showing
// Bumped on every show or hide. A photograph that finishes loading after the
// reader has moved on must not put itself up — without this, scrolling onto the
// parcel chapter while an image is still in flight brings the plate back.
let photoSeq = 0;

// A missing photo 404s once per scroll step otherwise, since each call builds
// a fresh Image. Remembering the failures keeps the console readable while
// zones are still being written.
const deadPhotos = new Set();

// A zone's picture is either a still or a short film: `video:` in the manifest
// wins over `photo:` when both are there. A plate is a CSS background and a
// video cannot be one, so a film gets a <video> child of the same plate — the
// seam is a mask on the plate itself, so it cuts the film exactly as it cuts a
// photograph, feather and all.
const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|$)/i;
const mediaOf = z => (z && (z.video || z.photo)) || null;

// One <video> per plate, made on first use. Muted and playsinline are not
// preferences: without both, a browser refuses to autoplay at all.
function plateVideo(plate) {
  let el = plate.querySelector('video');
  if (el) return el;
  el = document.createElement('video');
  el.muted = true; el.defaultMuted = true;
  el.loop = true; el.autoplay = true;
  el.playsInline = true;
  el.setAttribute('muted', '');
  el.setAttribute('playsinline', '');
  el.preload = 'auto';
  plate.appendChild(el);
  return el;
}

function showPhoto(url) {
  // What the plate is showing, or being asked to show. `photoShowing` only says
  // whether SOME picture is up, which was enough while the parcel chapter took
  // the picture down between zones — now that it does not, scrolling from one
  // zone onto the previous zone's parcel chapter found a picture already up and
  // left the wrong one there.
  photoWanted = url || null;
  if (url && deadPhotos.has(url)) url = null;
  const seq = ++photoSeq;
  const next = plates[1 - activePlate];
  const isVideo = !!url && VIDEO_RE.test(url);

  const swap = () => {
    if (seq !== photoSeq) return;          // superseded while loading
    next.style.backgroundImage = isVideo || !url
      ? (url ? 'none' : 'linear-gradient(135deg, #2a1f16 0%, #55402a 55%, #8a6a3f 100%)')
      : `url("${url}")`;
    next.classList.add('is-visible');
    plates[activePlate].classList.remove('is-visible');
    activePlate = 1 - activePlate;
    photoShowing = true;

    // The plate that just left keeps its film, but stops playing it: a paused
    // video off screen costs nothing, a playing one decodes every frame.
    const gone = plates[1 - activePlate].querySelector('video');
    if (gone) gone.pause();
  };

  if (!url) return swap();

  if (isVideo) {
    const el = plateVideo(next);
    if (el.dataset.src !== url) { el.dataset.src = url; el.src = url; }
    const start = () => {
      checkMediaSize(url, el.videoWidth, el.videoHeight);
      swap();
      // Reduced motion means the first frame, held: the picture is still the
      // picture, it simply does not move.
      if (reduced) el.pause();
      else { const p = el.play(); if (p && p.catch) p.catch(() => {}); }
    };
    if (el.readyState >= 2) start();
    else {
      el.addEventListener('loadeddata', start, { once: true });
      el.addEventListener('error', () => { deadPhotos.add(url); url = null; swap(); }, { once: true });
    }
    return;
  }

  // A still: make sure any film on this plate is out of the way first.
  const stale = next.querySelector('video');
  if (stale) { stale.pause(); stale.removeAttribute('src'); stale.load(); delete stale.dataset.src; }

  const img = new Image();
  img.onload = () => { checkMediaSize(url, img.naturalWidth, img.naturalHeight); swap(); };
  img.onerror = () => { deadPhotos.add(url); url = null; swap(); };   // falls back to the wash
  img.src = url;
}
// A photograph that is too small does not fail — it is simply upscaled, and the
// first anyone knows about it is the pixels on screen. So it is measured on
// load and said out loud instead.
//
// The plate is `inset: 0`: it covers the WHOLE stage and the mask hides the part
// the map wants, so `cover` sizes the image against the full frame, not against
// the strip that ends up visible. A 46%-wide picture still needs a photograph
// that could fill the window.
const sizeWarned = new Set();

function checkMediaSize(url, natW, natH) {
  if (sizeWarned.has(url) || !natW) return;
  const el = plates[0];
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.max(el.clientWidth / natW, el.clientHeight / natH) * dpr;
  if (scale <= PHOTO_UPSCALE_OK) return;
  sizeWarned.add(url);
  const wantW = Math.ceil(natW * scale / 10) * 10;
  const wantH = Math.ceil(natH * scale / 10) * 10;
  console.warn('media ' + url + ' is ' + natW + '×' + natH +
    ', upscaled ' + scale.toFixed(1) + '× to fill this frame at dpr ' + dpr +
    ' — it wants about ' + wantW + '×' + wantH);
}

// A film is not preloaded as an Image; the browser will not reuse it, and a
// wasted download of a few megabytes is worse than a late first frame.
const preload = u => { if (u && !deadPhotos.has(u) && !VIDEO_RE.test(u)) new Image().src = u; };

// Both plates fade off and the map runs full width. Nothing in the scroll calls
// this any more — the photograph stays put on a parcel chapter — but a zone with
// no picture of its own still needs a way to clear the last one.
function hidePhoto() {
  photoSeq++;
  photoWanted = null;
  plates.forEach(el => el.classList.remove('is-visible'));
  photoShowing = false;
}

/* ─── scroll wiring ─────────────────────────────────────────────────── */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let current = null;

// The zone's outline as one Feature, for `within`. The expression takes a
// single Polygon or MultiPolygon, and a zone can arrive as several features.
function zoneAsOne(z) {
  const parts = [];
  for (const f of (z.fc && z.fc.features) || []) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') parts.push(g.coordinates);
    else if (g.type === 'MultiPolygon') parts.push(...g.coordinates);
  }
  if (!parts.length) return null;
  return { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: parts } };
}

// The style's own settlement labels, dimmed where they fall outside the zone.
//
// Standard draws these inside its import, which for a long time meant they were
// out of reach. They are not: an imported layer answers to its qualified id,
// so the style's own type — its font, its size ramp per class, its halo — is
// kept exactly as it is and only the opacity is overridden. Drawing a
// replacement layer here would have meant re-inventing all of that by hand and
// getting it slightly wrong.
// This style carries its own settlement layers on top of the import — same
// source layer, same names — and those are the ones that actually draw. So the
// list is discovered rather than written down: anything drawing `place_label`
// with a settlement id counts, and the import's own qualified ids are the
// fallback for a style that has none of its own.
const PLACE_FALLBACK = [
  'basemap.settlement-major-label',
  'basemap.settlement-minor-label',
  'basemap.settlement-subdivision-label'
];
let placeLayers = null;
let placeApplied = null;   // id of the zone the dimming currently reflects

function placeLabelLayers() {
  if (placeLayers) return placeLayers;
  const found = map.getStyle().layers
    .filter(l => l.type === 'symbol' && l['source-layer'] === 'place_label' &&
                 /settlement/.test(l.id))
    .map(l => l.id);
  placeLayers = found.length ? found : PLACE_FALLBACK;
  return placeLayers;
}

function updatePlaceLabels(z) {
  // Deliberately no deferral machinery here. The style may not be loaded when
  // the first zone arrives, and a zone's geometry may not have landed either —
  // in both cases a paint property set now is silently dropped. So this bails
  // out without recording success, and the render hook below calls it again on
  // the next frame until it takes. Waiting on 'idle' instead proved unreliable:
  // with terrain and a patch still settling it may not fire for seconds.
  if (!map || !map.isStyleLoaded() || !z) return;
  const poly = zoneAsOne(z);
  if (!poly) return;

  for (const id of placeLabelLayers()) {
    if (!map.getLayer(id)) return;
    try {
      map.setPaintProperty(id, 'text-opacity', ['case', ['within', poly], 1, PLACE_DIM]);
      // Outside, the halo does as much of the dimming as the opacity does: a
      // full-strength halo under a faint name keeps the name legible, which is
      // the opposite of what is wanted.
      map.setPaintProperty(id, 'text-halo-width', ['case', ['within', poly], 1.25, 0.6]);
    } catch (e) {
      // Not a Standard-based style, or the layer has been renamed upstream:
      // the names simply stay as the style drew them.
    }
  }
  placeApplied = z.id;
}

/* ─── the parcel chapter's map ───────────────────────────────────────────
   Everywhere else the camera belongs to the scroll. On a parcel chapter it is
   handed to the reader, because the question there — what is planted next to
   what — is one you answer by moving around, and a fixed frame cannot answer it.

   The wheel is deliberately NOT handed over. It is what drives the story, and a
   map that swallows it traps the reader on one slide with no way out but the
   keyboard. Zoom arrives as buttons instead, which is also why the control
   carries no compass: rotation and pitch stay off, so there would be nothing
   for it to reset.  */
const READER_HANDLERS = ['dragPan', 'touchZoomRotate', 'doubleClickZoom', 'boxZoom'];

// Fixed rather than absolute, because the stage it belongs to is sticky: both
// are pinned to the viewport while the chapters scroll past.
function controlHost() {
  let host = document.getElementById('map-controls');
  if (!host) {
    host = document.createElement('div');
    host.id = 'map-controls';
    (document.querySelector('.scrollytelling') || document.body).appendChild(host);
  }
  return host;
}
let navControl = null;
let mapInteractive = false;

function setMapInteractive(on) {
  if (!map || on === mapInteractive) return;
  mapInteractive = on;

  for (const h of READER_HANDLERS) {
    if (map[h]) map[h][on ? 'enable' : 'disable']();
  }

  const stage = document.getElementById('stage');
  if (stage) stage.classList.toggle('is-interactive', on);

  if (on && !navControl) {
    navControl = new mapboxgl.NavigationControl({ showCompass: false, showZoom: true });
    map.addControl(navControl, 'top-right');
    // Out of the stage and into a host of its own. #stage is sticky with a
    // z-index, which makes it a stacking context: nothing inside it can paint
    // above #story, so the panel covered the buttons however high their z-index
    // went. Mapbox does not mind where its control's element lives — the
    // control listens to the map, not to its ancestors.
    const corner = map.getContainer().querySelector('.mapboxgl-ctrl-top-right');
    if (corner) controlHost().appendChild(corner);
  } else if (!on && navControl) {
    map.removeControl(navControl);
    navControl = null;
  }
}

function goTo(i) {
  const step = steps[i];
  if (!step) return;
  const z = step.zone;
  const sameZone = current === z;
  current = z;
  // Now that a zone has one step, this only guards the step re-firing on the
  // same zone — but the guard still earns its place: rebuilding the label would
  // flash it for a zone that has not changed.
  if (!sameZone) showLabel(z);

  // This zone's parcels stay; every other zone's come off the map. The layer is
  // turned on from inside this card now, so arriving at the card — or the step
  // simply re-firing — must not take away what the reader just asked for.
  hideParcels(z);


  showPatch(z);
  updatePlaceLabels(z);
  prefetchNextPatch(i);
  // The inset camera never moves — it stays framed on the whole region and
  // only the highlighted shape changes.
  if (inset && inset.getSource('active')) inset.getSource('active').setData(z.fc);

  if (!sameZone) {
    // cameraForBounds first, so the fit is known before the camera moves: the
    // offset that pushes the zone to the far edge depends on the zoom it lands
    // at, and fitting twice would be two animations for one arrival.
    const pad = cameraPadding(z);
    const box = cameraBox(z);
    const fit = map.cameraForBounds(box, { padding: pad, maxZoom: MAX_ZOOM });

    if (fit) {
      map.fitBounds(box, {
        padding: biasedPadding(z, pad, fit.zoom),
        maxZoom: MAX_ZOOM,
        duration: reduced ? 0 : 2200,
        essential: true
      });
    } else {
      map.fitBounds(box, {
        padding: cameraPadding(z), maxZoom: MAX_ZOOM,
        duration: reduced ? 0 : 2200, essential: true
      });
    }
  }

  // Dragging the map is what reading parcels needs, and there is no parcel
  // chapter to hang that on any more — so it follows the layer itself: free
  // while the parcels are showing, locked otherwise, so a scroll over a zone
  // with nothing drawn on it is never eaten by the map.
  const parcelsOn = !!(parcelState[z.id] && parcelState[z.id].visible);
  const wasFree = mapInteractive;
  setMapInteractive(parcelsOn);
  // A camera the reader dragged stays dragged unless the fit above ran, so put
  // the zone back in its frame when they arrive with the parcels off. Never
  // while they are on: the view is theirs to hold for as long as it is.
  if (wasFree && !parcelsOn && sameZone) {
    map.fitBounds(cameraBox(z), {
      padding: cameraPadding(z), maxZoom: MAX_ZOOM,
      duration: reduced ? 0 : 900, essential: true
    });
  }
  applyPlateMask();                      // the zone may carry its own shape
  if (photoWanted !== mediaOf(z)) showPhoto(mediaOf(z));

  const next = steps[i + 1];
  preload(next && next.zone !== z && mediaOf(next.zone));
}

// Scrollama observes the chapter elements themselves. Rebuilding the story
// replaces them, and the old instance goes on watching nodes that are no longer
// in the document — no step ever enters again and the piece sits on whichever
// zone it was showing. So the instance is kept, and torn down and re-pointed
// whenever the chapters are rebuilt.
let scroller = null;

function attachScroller() {
  if (scroller) scroller.destroy();
  scroller = scrollama();
  scroller.setup({ step: '.chapter', offset: 0.55 })
    .onStepEnter(({ index }) => goTo(index));
}

// Rebuild the text without losing the scroll wiring or the reader's place.
function rebuildStory() {
  const at = current;
  buildStory();                // raises its own case now
  attachScroller();
  if (at) {
    showLabel(at);
    const st = parcelState[at.id];
    if (st && st.legend) {
      renderLegend(at, st.legend);
      if (st.visible) syncToggle(at);
    }
  }
  hideTip();
}

function startScroll() {
  goTo(0);
  attachScroller();

  // The studio hands over the zone it was shaping, so a preview opens on that
  // slide rather than at the top. Chapter ids are 'z' + the manifest index,
  // which is exactly what the studio's dropdown value is.
  const wanted = new URLSearchParams(location.search).get('zone');
  if (wanted !== null) {
    const el = document.getElementById('z' + wanted);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'auto' }));
  }
}

window.addEventListener('resize', () => {
  if (!map) return;
  insetRect = null;          // media-query sized, so it moves with the frame
  map.resize();
  placeLabel();
  applyPlateMask();          // the mask is rendered at stage pixel size
  if (current) {
    // crossing the portrait threshold flips right/left to bottom/top, so the
    // camera's reserved side changes with it
    map.fitBounds(cameraBox(current), { padding: cameraPadding(current), maxZoom: MAX_ZOOM, duration: 0 });
  }
  if (inset) inset.resize();
  map.setPadding(cameraPadding());
});
