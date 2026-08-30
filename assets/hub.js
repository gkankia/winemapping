/* ═══════════════════════════════════════════════════════════════════════
   The hub's region list.

   The country map itself is a drawn map in img/ — relief, hatched vineyard
   areas, its own labels — so nothing is generated over it. Its projection and
   extent are not published anywhere, and pins placed on it would be guesses;
   the list below it carries the names, the counts and the links instead.
   ═══════════════════════════════════════════════════════════════════════ */

// Region colours, matched to the swatches in the list. Kakheti takes the
// piece's own claret; the rest are stepped around it.
const REGION_COLOURS = {
  kakheti:            '#8f3f77',
  kartli:             '#8c6c1f',
  imereti:            '#1c5cab',
  'racha-lechkhumi':  '#5e6b2a',
  samegrelo:          '#9c5426'
};

/** The list under the map, which is also the table view of it. */
function buildRegionList() {
  const host = document.getElementById('region-list');
  if (!host) return;
  host.innerHTML = REGIONS.map(r => {
    const colour = REGION_COLOURS[r.id] || '#8f3f77';
    const count = r.zones.length;
    const inner = `
      <span class="region-swatch" style="background:${colour}"></span>
      <span class="region-body">
        <span class="region-name">${pick(r.name)}</span>
        <span class="region-blurb">${pick(r.blurb)}</span>
      </span>`;
    // The count and the not-yet note travel together, because in the grid they
    // sit on a line of their own under the blurb rather than beside it.
    const meta = soon => `<span class="region-meta">
        <span class="region-count">${t('hub.zones', count)}</span>
        ${soon ? `<span class="region-soon">${t('hub.soon')}</span>` : ''}
      </span>`;
    return r.page
      ? `<a class="region-row" href="${r.page}" data-region="${r.id}">${inner}${meta(false)}</a>`
      : `<div class="region-row is-quiet" data-region="${r.id}">${inner}${meta(true)}</div>`;
  }).join('');
  applyCase(host);
}

// The drawn map is lettered, so there is one per language rather than one with
// a caption doing the work.
function setCountryMap() {
  const img = document.getElementById('country-map-image');
  if (!img) return;
  const next = `img/wine-geography-${currentLang()}.png`;
  if (!img.getAttribute('src').endsWith(next)) img.setAttribute('src', next);
}

function buildHub() {
  setCountryMap();
  buildRegionList();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', buildHub);
} else {
  buildHub();
}

// Rebuilding the list is enough on a language switch: the map's own labels are
// redrawn with it, and the imagery has no words on it.
onLangChange(buildHub);
