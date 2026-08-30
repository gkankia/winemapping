# Wine Geography of Georgia

A hub page with a country map, and one page per wine region. Each regional page
is an article that hands over to a full-screen scroll map partway down, then
returns to prose. Kakheti is the first; the others are listed on the hub as
their boundaries arrive.

## Run it

```
python3 -m http.server
```

Then open `http://localhost:8000/`. It has to be served — opening the files
directly fails, because browsers block `fetch()` of local files and no zone
geometry loads.

## Pages

```
index.html                 the hub: intro, country map, region list
kakheti.html               Kakheti: prose -> scroll map -> prose
notes.html                 notes index
notes/*.html               individual notes
about.html                 method, data, zone table, colophon
wine-zones-map.html        the scroll piece alone, full screen
mask-studio.html           tool: draw the map / photograph seam
```

## Regions

`assets/regions.js` is the region manifest — one entry per wine region, naming
the geometry files in `zones/` that belong to it and the page that covers it.

The hub map is built from that: a still image of Georgia with **every** mapped
zone drawn over it, from the same GeoJSON the regional pages use, so the hub
cannot fall out of step with them. Colour is the region; the label carries its
name and how many zones it holds. A region with `page: null` is listed and drawn
but not linked.

Adding a region means dropping its boundaries in `zones/`, listing them in
`regions.js`, and — when there is one — pointing `page` at it. The current
grouping was seeded from where each file actually falls (Kakheti east of
longitude 45, Kartli around 44, Imereti and Racha-Lechkhumi west of 43.2) and is
worth checking against the appellations themselves.

Labels are decluttered after layout: Samegrelo and Racha-Lechkhumi land almost
on top of each other at country scale, so an overlapping label is pushed down
while keeping its horizontal position, and still points at the right place.

## Structure

```
assets/zones.js            THE MANIFEST — the only file to edit to add a zone
assets/scroll.js           the map machinery (shared by both map pages)
assets/scroll.css          the sticky stage and story panels
assets/site.css            tokens, article column, nav, cards, footer
zones/                     one .geojson per microzone
parcels/                   optional: one .geojson of parcels per microzone
img/                       one photograph per microzone
```

## Why the first zone takes a moment

Each zone's colour is assembled from two downloads. The satellite frame comes
off a CDN in about 1.3s. The topographic sheet comes off the NAPR host, which is
bandwidth-bound rather than render-bound: time-to-first-byte holds near half a
second at any size, then the transfer runs at roughly 70 KB/s. So the sheet's
cost is its pixel count, measured at 2210px = 805 KB = 10-13s, 1400px = 389 KB =
5-6s, 900px = 194 KB = 2-3s.

Three things follow, all of them in `TOPO` and `buildPatch()`:

- **The sheet is capped at 1200px.** That is not a compromise — a 1:50 000 sheet
  scanned at 300 dpi carries about 4 m per pixel, and 1200px over a 3 km patch is
  2.8 m per pixel. Asking for 2210 made the server upsample a scan and charged
  eight extra seconds for it.
- **The colour does not wait for the sheet.** The imagery paints as soon as it
  lands; the sheet is blended into the same canvas in a second pass and swapped
  in with `updateImage()`. Previously both were awaited together, so the zone sat
  in black-and-white for the whole sheet download.
- **The next zone is fetched while the current one is read**, after it rather
  than beside it, so the two are not competing for the sheet host's one slow
  connection.

## Parcel layers

Set `parcels: true` on a zone and it gets a second chapter with a button that
draws its vineyard parcels. There is no file to prepare: `parcels/vineyard-parcels.js`
fetches them live from the NAPR cadastre for the zone's extent.

The module is used unmodified. It was written against MapLibre, but everything
it touches — `addSource`, `getSource().setData()`, `getBounds()`,
`on('moveend')`, `promoteId`, and the whole expression syntax — is the same call
for the same result in Mapbox GL JS v3. Only `parcels/demo.html` is
MapLibre-specific (the `maplibregl` global, `NavigationControl`, `Popup`), and
that is its own standalone demo.

It is an ES module and `scroll.js` is a classic script, so it is pulled in with a
dynamic `import()` on first use — nobody who never opens a parcel layer pays for
it.

Colouring is the piece's own: **white grapes gold, coloured grapes claret**, a
neutral for what the register has not surveyed — viticulture's own split, taken
from the berry colour the module derives per variety. Two classes rather than
five because a parcel map is a choropleth and every pair of colours must
separate; white/black/red/pink fails that (gold vs red is CVD ΔE 5.6, rosé vs
claret 11.2 to full colour vision), while the pair in use clears it at 19.9 and
23.2. Each class names its varieties in the table, so colour is never the only
identity.

Parcels are fetched past the boundary for context, drawn dimmed, and tested
against the zone polygon before they count towards anything. The service answers
with everything intersecting a rectangle, so this matters: ახოები's bbox returns
752 parcels but only 528 are inside the boundary — counting the rectangle
overstates the zone by 46%.

**Context reaches 300 m from the boundary, not from the bounding box**
(`PARCEL_SKIRT_M`). A rectangle drawn round an irregular appellation reaches
kilometres out at its concave corners and pulls in whole villages that have
nothing to do with it: measured over the fetch rectangle, 54% of ახაშენი and 69%
of გურჯაანი falls outside that 300 m skirt. The request still names a rectangle,
because the cadastre service takes nothing else — it asks for the skirt plus a
250 m margin for parcels that straddle it — and what the rectangle
over-collected is dropped on arrival.

Distance is measured to the boundary itself. Every segment of the zone's rings,
holes included, goes into a grid of 300 m cells in local metres, so testing a
parcel means looking at the nine cells around each of its vertices rather than
at the whole outline. Vertices rather than the centre, because a long holding
lying along the boundary can have its centre outside the skirt while most of it
is inside. Checked against brute force over 3 000 random probes on a
2 678-segment zone: no disagreements, and 800 parcel tests take 2 ms.

Two tabs in the panel recolour the same parcels: **Vine** (gold for white
grapes, claret for coloured, stepped by shade within each family — darkest is
the vine that family is mostly planted to) and **Planted** (a sequential blue ramp by year, oldest
darkest, breaks at 1980/1995/2010/2020 cut to the bimodal shape of the data).
The mode is global, so switching on one zone carries to the next. Both tabs
count the same in-zone set — verified to agree at 528 parcels and 132.7 ha on
ახოები.

The photograph stays up on a parcel chapter, and the camera does not move
between a zone and its parcels: the chapter is the same view with more drawn on
it, so nothing about the frame changes when you reach it.

The layer clears whenever you scroll off its chapter; the fetched data stays
cached, so switching it back on costs nothing. Hovering a parcel shows its
varieties, areas, planting years and training; on touch, a tap does the same and
a tap on empty ground closes it.

Note that the map runs with interaction *enabled* but every gesture handler
disabled by name (`scrollZoom`, `dragPan`, `touchZoomRotate`, …). `interactive:
false` would switch off event delivery along with the gestures, and hover would
never reach a layer.

**On a parcel chapter the camera is handed to the reader** — `setMapInteractive()`
turns `dragPan`, `touchZoomRotate`, `doubleClickZoom` and `boxZoom` back on and
adds a zoom control; scrolling off the chapter turns them off again and removes
it. Three deliberate choices:

- **The wheel is never handed over.** It is what drives the story, and a map that
  swallows it traps the reader on one slide. Zoom arrives as buttons instead —
  which is also why the control carries no compass: rotation and pitch stay off,
  so there would be nothing to reset.
- **The control is added and removed, not shown and hidden**, so nothing of it
  can be tabbed to while the camera belongs to the scroll. It fades in, because a
  control that appears in a corner reads as a fault.
- **Leaving the chapter puts the zone back in its frame.** Scrolling up from the
  parcels to the zone's own chapter is a *same-zone* move, so it skips the fit
  that a zone change would do — without a re-fit, a camera the reader had dragged
  would simply stay dragged.

## Adding a zone

1. Drop the boundary in `zones/` and the photograph in `img/`.
2. Add an entry to `ZONES` in `assets/zones.js`. Only `name` and `file` are
   required; `native`, `photo`, `blurb` and `facts` are all optional, and a
   missing photograph falls back to a gradient wash.

### Framing a zone closer

A zone is framed whole by default. Where that leaves it small — a long thin
appellation whose fit is limited by its own width, Akhasheni at 17km being the
case in point — `zoom:` adds levels on top of the fit, at the cost of the zone's
ends running past the frame. **0.5 is about 15% off each end; 1.0 halves what is
shown.**

It is implemented as a shrunk bounding box (`cameraBox()`), not as a zoom added
after the fit: the padding, the edge bias and the name all measure the zone, and
this way they measure the same box and cannot disagree about where it is. Only
the camera sees it — the colour patch, the inset and the parcel sweep all stay
on the zone's true extent.

Zones whose files fail to load are skipped with a console warning, and the
`01 / 09` counter reflects only the zones that actually loaded — so a partially
filled manifest renders correctly.

## The map / photograph seam

The photograph can take any of the four sides of the frame — `PHOTO_SIDE` in
`assets/scroll.js`, or `photoSide:` on a zone. `'top'` puts the picture above and
the map in the band beneath it; `'bottom'` is its mirror. **`photoSide` and the
zone's `mask:` have to name the same side** — a top-shaped seam with
`photoSide: 'left'` has the camera reserving one edge while the picture covers
another.

A horizontal split costs a wide zone its size: the band it leaves is short, so an
east-west appellation is fitted to the band's height rather than its width. Left
or right suits those; top or bottom suits a compact or north-south zone. Everything follows from it: the
camera reserves that side, the panel sits over it, and the zone is fitted hard
against the opposite edge rather than centred in what is left. In portrait,
right folds to bottom and left to top.

The zone's name goes to the frame's top or bottom (`LABEL_PLACE`), just off the
zone's own edge and never closer to the frame than `LABEL_EDGE`. Horizontally it
aligns to the zone's *near* edge — the one facing the photograph — rather than
centring on it: with the picture on the left the zone is pushed right, so a name
centred under it starts far out and a long one runs into the corner. It stays
inside the map band, so it never rides over the photograph, and it steps clear
of the inset map, sliding along x first and moving vertically only when the band
has no room left. Checked across all seven zones and both photo sides: no
overlap with the inset, nothing off-frame.

The edge between map and photograph is an SVG path, not a gradient, so it can be
any shape. `MASK_SHAPES` holds one default per side, authored in a 100 x 100 box
(x rightwards, y down) and scaled to the stage; filled area is where the
photograph shows. Any zone can override with a `mask:` entry.

The feather is applied after the scale, in pixels, so it stays circular on wide
screens instead of stretching into an ellipse. `MASK_FEATHER_PX` sets it.

**The photograph never covers the zone.** The camera measures how far the seam
actually reaches into the frame — sampled along the path, not read off its
control points — and reserves that much plus a clearance for the feather.

That clearance is `FEATHER_SIGMAS` times the feather plus `SEAM_CLEARANCE`. At
the path itself the picture is 50% present, one sigma in it is 16%, at 1.5 under
7%. It was 1.5 and came back to **1.0**, because the clearance is charged to the
map twice over: it is taken off the band, and then the zone is fitted into what
is left, so every pixel of it is paid for again in zoom. At 1.5 the gap read as a
margin in its own right and nudging a seam threw the camera a long way back. The
sum is now 62 x 1.0 + 8 = **70px**, against 109 before — on a 28%-deep top seam
at 1900 x 1020 that is 462px of band instead of 423px.

If a seam reaches so far in that no room is left, the label gutter is surrendered
first and the clearance only after that, with a console warning — `MIN_BAND` is
the floor, because padding wider than the canvas makes `fitBounds` fail outright.

## Settlement names

Names that fall inside the zone read at full strength; names outside recede to
`PLACE_DIM` with a thinner halo — the same figure/ground split the imagery
already makes, carried into the type.

Nothing about the labels' own styling changes: they are the style's own layers,
with only `text-opacity` and `text-halo-width` overridden per feature by a
`within` expression against the zone's outline. `within` takes one Polygon or
MultiPolygon, so `zoneAsOne()` merges a zone's features into a single one.

Three things about this were not obvious, and each cost a render to find:

- **The layers are the style's own, not the import's.** Standard's copies answer
  to qualified ids (`basemap.settlement-minor-label`) and accept paint overrides
  without complaint — but this style carries its own `settlement-*` layers on
  top, and those are what draw. Setting paint on the import's copies succeeds
  silently and changes nothing. `placeLabelLayers()` therefore discovers them:
  any symbol layer drawing `place_label` with a settlement id, with the
  qualified ids as the fallback.
- **A paint property set before the style loads is dropped**, and so is one set
  before the zone's geometry has landed. Both happen on the first zone.
- **Waiting on `idle` is not reliable** — with terrain and a patch still
  settling it may not fire for seconds, and `goTo()` does not come round again
  until the reader scrolls. So `updatePlaceLabels()` bails out without recording
  success and a render hook retries it until it takes, guarded by the id of the
  zone the dimming currently reflects.

### Drawing one

You do not write path data by hand. Open `mask-studio.html` and drag the seam:

- pick a zone and it previews the real photograph against that zone's satellite
- click the dashed seam to add a point, double-click anywhere, or press *Add
  point*; alt-click a point to remove it
- the two end points stay pinned to their edges so the shape always closes
- presets (wave, straight, diagonal, arc, notch) are starting points, not limits
- the feather slider previews `MASK_FEATHER_PX`; it is not part of the path
- the dashed band shows where the zone will be fitted: the camera measures how
  far your seam reaches in and keeps the zone clear of it, so a seam that cuts
  deep leaves the zone less room. The band turns orange when the seam asks for
  more than the frame can give, and says so when a seam is drawn deeper than the
  picture's `PICTURE_MAX_SHARE` — past that the camera behaves as if the seam
  stopped at the cap, and the picture covers part of the zone
- **the studio's band is a transcription of `cameraPadding()`, not a paraphrase**
  — `FIT_INSET`, `FAR_EDGE_INSET`, `LABEL_PLACE`, `LABEL_ROOM`, `MIN_BAND`,
  `FEATHER_SIGMAS`, `SEAM_CLEARANCE` and `PICTURE_MAX_SHARE` are copied from
  `scroll.js` at the top of the file. Change one there and change it here, or
  the studio draws a band the piece never uses
- **Test on the slides** opens `wine-zones-map.html?mask=…&zone=…` in a new tab: the real
  piece, on the zone you were shaping, using the seam you just drew. It is a
  preview and says so on screen — nothing is written until you paste the path
  into the manifest.

Copy the path it prints and paste it into the zone's `mask:` entry, or into
`MASK_SHAPE` to change every zone at once.

## A film instead of a photograph

`video:` on a zone takes a short film — `.mp4`, `.webm`, `.mov`, `.m4v` — in
place of the still. It wins over `photo:` when both are set, so the still can
stay as the fallback.

```js
photo: 'img/akhasheni.jpg',
video: 'img/akhasheni.mp4',
```

The seam cuts it exactly as it cuts a photograph, feather and all: a plate is a
CSS background and a video cannot be one, so the film goes in as a `<video>`
child of the same plate, and the mask is on the plate.

- **Muted, looping, `playsinline`.** Not preferences — without all three a
  browser refuses to autoplay, and the plate would sit black.
- **Under `prefers-reduced-motion` it holds its first frame** rather than
  playing. The picture is still the picture; it simply does not move.
- **The plate that scrolls away pauses.** A paused video off screen costs
  nothing; a playing one decodes every frame behind the map.
- **Films are not preloaded.** The next zone's still is fetched a chapter ahead,
  but a wasted download of several megabytes is worse than a late first frame.
- Sizing is the same as for a still — see below — and the same warning fires
  when the file is smaller than the frame it has to fill.

## Photograph quality

The plate is `inset: 0` — it covers the **whole stage**, and the mask hides the
part the map wants. So `background-size: cover` sizes the photograph against the
full window, not against the strip that ends up visible: a picture occupying 46%
of the frame still needs a photograph that could fill the window on its own.

What that means in pixels, for a 1920-wide window:

| Device pixel ratio | Frame in device px | 3:2 photograph |
|---|---|---|
| 1 (older desktop) | 1920 x 1080 | 1920 x 1280 — the floor |
| 2 (Retina, most laptops) | 3840 x 2160 | **3840 x 2560** — crisp |
| compromise | — | 2560 x 1707, 1.5x on Retina, invisible on a photograph |

Anything below that is not an error — it is simply upscaled, and the first
anyone knows is the pixels on screen. So `checkPhotoSize()` measures every
photograph as it loads and says so:

```
photo img/ახოები.jpg is 393×272, upscaled 4.8× to fill this frame
at dpr 1 — it wants about 1900×1320
```

The threshold is `PHOTO_UPSCALE_OK` (1.25). A photograph carries no hard edges,
so a quarter over reads as clean.

Beyond size: JPEG at quality 80–85, progressive, sRGB, EXIF stripped — about
0.8–1.8 MB at 3840px. Only one photograph is on screen at a time and the next is
preloaded one ahead, so that weight buys sharpness rather than a wait.

Composition follows from `cover` too. On a wide frame a portrait photograph is
scaled to the frame's *width* and loses its top and bottom; the visible strip is
one edge of it, not its centre. Frame the subject towards the side the picture
takes, and prefer landscape at roughly 3:2.

## The mark

The map signs itself with `img/zaxis-logo-white.svg`, bottom-left of the stage,
and Mapbox's own wordmark is hidden. Two shadows rather than a plate behind it:
which corner the photograph occupies changes per zone, so bottom-left is dark
imagery on one slide and sunlit vine on the next, and a tight shadow holds the
letterforms against the pale case while a soft one seats it on the dark.

Note that hiding the Mapbox wordmark is only permitted under a plan that waives
the attribution requirement. Worth checking against the account's terms before
this is public.

## Cache

Every local asset is loaded with a `?v=` stamp — `assets/site.css?v=20260827a`
and so on. Without it the filenames never change, and a browser will happily
serve yesterday's stylesheet against today's markup: the symptom is a page that
half-updates, most visibly both languages showing at once because the fresh HTML
carries the Georgian blocks while the cached CSS has no rule to hide them.

**Bump the stamp whenever you edit anything in `assets/`.** One find-and-replace
across the seven pages; the value is arbitrary, it only has to change.

## Languages

English and Georgian, switched from the button in the header. The choice is
remembered per browser, and a first visit follows the browser's own preference —
a Georgian reader does not land on English and have to hunt for the switch.

Two halves:

- **Page prose** ships in the markup in both languages, paired by `lang`
  attributes, and `site.css` hides the inactive one. Switching costs nothing and
  English shows correctly before the script runs. Prose left untagged shows in
  *both* languages, which is the honest state while a page is only written in
  one — the `.lang-pending` notice says so, in the language that is missing.
- **Runtime strings** — buttons, table headings, the legend, the zone label —
  live in `assets/i18n.js` as one table per language, and the piece calls `t()`.
  Switching rebuilds the text and re-renders the legend from the object it
  already holds: not one parcel or patch is fetched again.

### Translating zone copy

The manifest's copy — `blurb`, `parcelNote`, and either half of a `facts`
pair — takes a plain string when the text is the same in both languages, or an
object keyed by language:

```js
blurb: 'Reads the same either way.',

parcelNote: {
  en: 'How many holdings, what is planted, how far back it goes.',
  ka: 'რამდენი მეურნეობაა, რა არის დარგული, რამდენად ძველია ნარგავები.'
},

facts: [[{ en: 'Grapes', ka: 'ჯიშები' }, 'Rkatsiteli']]
```

A missing side falls back to the other rather than leaving an empty panel, so a
half-translated zone reads as unfinished instead of broken. Switching language
re-renders the chapters from the manifest — nothing is refetched.

Zone names never translate; which one *leads* does. In Georgian the manifest's
`native` leads with the Latin name beneath, and the other way round in English.

### Typography

**Google Sans, everywhere** — all text, both scripts, menus included. One token,
`--font`, in `assets/site.css`. Code keeps IBM Plex Mono (`--font-mono`).

The Georgian files in `fonts/` are no longer used. They stay in the repo in case
you want them back.

Georgian headings and zone names are set upper case, which means Mtavruli:
the browser maps mkhedruli to U+1C90 and up. Google Sans covers that block.
Small caps and italics stay off for Georgian.

## Unfinished copy

Anything still to be written is marked with `<span class="todo">` and renders
highlighted, so placeholder text can't be mistaken for finished text. Search for
`todo` to find what's outstanding.
