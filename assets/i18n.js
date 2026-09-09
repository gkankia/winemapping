/* ═══════════════════════════════════════════════════════════════════════
   Language.

   Page prose ships in both languages in the markup, paired by `lang`
   attributes, and the stylesheet hides the inactive one — so switching is
   instant and the page reads correctly before this file has even run.

   What lives here is the other half: strings the script writes at runtime
   (buttons, table headings, the legend) and the zone names, which come from
   the manifest rather than the markup.

   The choice is remembered per browser. A first visit follows the browser's
   own preference, so a Georgian reader arriving from a Georgian search does
   not land on English and have to hunt for the switch.
   ═══════════════════════════════════════════════════════════════════════ */

const STRINGS = {
  en: {
    'nav.map': 'The map', 'nav.notes': 'Notes', 'nav.about': 'About',
    'parcels.show': 'Show parcels',
    'parcels.hide': 'Hide parcels',
    'parcels.loading': 'Loading…',
    'parcels.loadingWide': 'Loading — wide zone, this takes a while…',
    'parcels.loadingCount': (n, c) => `Loading… ${n} parcels, ${c} request${c === 1 ? '' : 's'}`,
    'parcels.unavailable': 'Parcel service unavailable',
    'parcels.tab.vine': 'Vine',
    'parcels.tab.year': 'Planted',
    'parcels.col.vine': 'Vine',
    'parcels.col.year': 'Planted',
    'parcels.col.parcels': 'Parcels',
    'parcels.col.ha': 'Hectares',
    'parcels.summary': (p, h) => `${p} parcels · ${h} ha`,
    'parcels.mixed': n => ` · ${n} with more than one variety`,
    'parcels.context': n => ` · ${n} neighbouring parcels shown, not counted`,
    'parcels.truncated': 'Too dense to sweep completely at this extent — some parcels are missing.',
    'parcels.noteVine': 'Hue is the family — gold for white grapes, claret for coloured. Within each, the darkest shade is the vine it is mostly planted to.',
    'parcels.noteYear': 'Coloured by planting year, oldest darkest. A parcel takes the year of its main variety.',
    'parcels.source': 'Boundaries and attributes from the NAPR vineyard register, fetched live.',
    'parcels.whichOnes': 'see more...',
    'vine.white': 'White grapes',
    'vine.coloured': 'Coloured grapes',
    'vine.unknown': 'Not yet surveyed',
    'vine.others': n => `${n} other ${n === 1 ? 'variety' : 'varieties'}`,
    'year.unknown': 'Year not recorded',
    'year.before': y => `Before ${y}`,
    'year.range': (a, b) => `${a}–${b}`,
    'year.after': y => `${y} onwards`,
    'tip.outside': 'outside the microzone',
    'tip.ha': h => `${h} ha`,
    'tip.varieties': n => ` · ${n} varieties`,
    'tip.planted': y => `planted ${y}`,
    'tip.noYear': 'year not recorded',
    'chapter.parcels': 'parcels',
    'parcels.default': 'Individual parcel boundaries and the variety planted on each.',
    'seam.preview': 'seam preview — not saved',
    'nav.regions': 'Regions',
    'hub.zones': n => `${n} ${n === 1 ? 'zone' : 'zones'} mapped`,
    'hub.soon': 'no page yet',
    'hub.mapNote': 'Georgia\'s vineyard areas, hatched. The regions below are '
                 + 'covered one page at a time.'
  },
  ka: {
    'nav.map': 'რუკა', 'nav.notes': 'ჩანაწერები', 'nav.about': 'პროექტის შესახებ',
    'parcels.show': 'ნაკვეთების ჩვენება',
    'parcels.hide': 'ნაკვეთების დამალვა',
    'parcels.loading': 'იტვირთება…',
    'parcels.loadingWide': 'იტვირთება — დიდი ზონაა, ცოტა ხანს გასტანს…',
    'parcels.loadingCount': (n, c) => `იტვირთება… ${n} ნაკვეთი, ${c} მოთხოვნა`,
    'parcels.unavailable': 'ნაკვეთების სერვისი მიუწვდომელია',
    'parcels.tab.vine': 'ჯიში',
    'parcels.tab.year': 'დარგვის წელი',
    'parcels.col.vine': 'ჯიში',
    'parcels.col.year': 'დარგვის წელი',
    'parcels.col.parcels': 'ნაკვეთი',
    'parcels.col.ha': 'ჰექტარი',
    'parcels.summary': (p, h) => `${p} ნაკვეთი · ${h} ჰა`,
    'parcels.mixed': n => ` · ${n} ერთზე მეტი ჯიშით`,
    'parcels.context': n => ` · მეზობელი ${n} ნაკვეთი ნაჩვენებია, აღრიცხვის გარეშე`,
    'parcels.truncated': 'ამ მასშტაბში ნაკვეთები ძალიან ხშირია — ნაწილი აკლია.',
    'parcels.noteVine': 'ფერი ოჯახს აღნიშნავს — ოქროსფერი თეთრი ყურძნისთვის, ღვინისფერი შეფერილისთვის. თითოეულში ყველაზე მუქი ის ჯიშია, რომლითაც ნაკვეთი ძირითადად დარგულია.',
    'parcels.noteYear': 'ფერი დარგვის წელს აღნიშნავს — რაც უფრო მუქია, მით ძველია. ნაკვეთს ძირითადი ჯიშის წელი აქვს.',
    'parcels.source': 'საზღვრები და ატრიბუტები საჯარო რეესტრის ვენახების რეგისტრიდან, პირდაპირ.',
    'parcels.whichOnes': 'მეტი...',
    'vine.white': 'თეთრი ყურძენი',
    'vine.coloured': 'შეფერილი ყურძენი',
    'vine.unknown': 'ჯერ არ არის აღწერილი',
    'vine.others': n => `კიდევ ${n} ჯიში`,
    'year.unknown': 'წელი უცნობია',
    'year.before': y => `${y}-მდე`,
    'year.range': (a, b) => `${a}–${b}`,
    'year.after': y => `${y}-იდან`,
    'tip.outside': 'მიკროზონის გარეთ',
    'tip.ha': h => `${h} ჰა`,
    'tip.varieties': n => ` · ${n} ჯიში`,
    'tip.planted': y => `დარგულია ${y}`,
    'tip.noYear': 'წელი უცნობია',
    'chapter.parcels': 'ნაკვეთები',
    'parcels.default': 'ცალკეული ნაკვეთების საზღვრები და თითოეულზე დარგული ჯიში.',
    'seam.preview': 'ნაპირის გადახედვა — არ არის შენახული',
    'nav.regions': 'რეგიონები',
    'hub.zones': n => `დატანილია ${n} ზონა`,
    'hub.soon': 'გვერდი ჯერ არ არის',
    'hub.mapNote': 'საქართველოს ვენახების არეალები, დაშტრიხული. ქვემოთ ჩამოთვლილი '
                 + 'რეგიონები თანდათან, თითო გვერდად ემატება.'
  }
};

// Printed once, so the version on screen can be checked against the version on
// disk without guesswork. Bump it with the ?v= stamps.
const BUILD = '20260831h';

const LANGS = ['en', 'ka'];
const STORE = 'winemapping.lang';

function initialLang() {
  // An explicit ?lang= wins over everything: it makes a link shareable in one
  // language and gives a way to check a page without clearing storage.
  const asked = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(asked)) return asked;
  try {
    const saved = localStorage.getItem(STORE);
    if (LANGS.includes(saved)) return saved;
  } catch (err) { /* private window: fall through to the browser's own idea */ }
  return (navigator.languages || [navigator.language || 'en'])
    .some(l => String(l).toLowerCase().startsWith('ka')) ? 'ka' : 'en';
}

let lang = initialLang();

/** A string, or the result of one that takes arguments. */
function t(key, ...args) {
  const table = STRINGS[lang] || STRINGS.en;
  const val = key in table ? table[key] : STRINGS.en[key];
  if (val === undefined) return key;              // visible, rather than blank
  return typeof val === 'function' ? val(...args) : val;
}

const currentLang = () => lang;

/**
 * Manifest content in the current language.
 *
 * A field may be a plain string, which means "the same in both" — a number, a
 * name, anything that does not translate — or an object keyed by language:
 *
 *   blurb: 'Same either way.'
 *   blurb: { en: 'One or two sentences.', ka: 'ერთი-ორი წინადადება.' }
 *
 * A missing translation falls back to the other language rather than to an
 * empty panel: half-translated content should read as unfinished, not broken.
 */
function pick(value) {
  if (value == null) return '';
  if (typeof value !== 'object') return String(value);
  return value[lang] || value.en || value.ka || '';
}

/** Zone names never translate — but which one is shown does. */
function zoneName(z) {
  return (lang === 'ka' && z.native) ? z.native : z.name;
}

/* A name may be written across two lines — 'ყვარელი<br>ქინძმარაული', an
   appellation that carries its municipality above it. The manifest may say so
   with <br> or with a newline; both mean the same thing here.

   The marker is never handed to innerHTML. A zone name is data, and data that
   reaches innerHTML is an injection waiting to happen the day a name arrives
   from somewhere other than this repo — so it is split here and each line gets
   its own element with textContent. */
const NAME_BREAK = /\s*(?:<br\s*\/?>|\n)\s*/i;

function zoneLines(z) {
  return zoneName(z).split(NAME_BREAK).filter(Boolean);
}

/** The same name on one line, for anywhere that takes plain text. */
function zoneNameFlat(z) {
  return zoneLines(z).join(' ');
}

const langListeners = [];
const onLangChange = fn => langListeners.push(fn);

function setLang(next) {
  if (!LANGS.includes(next) || next === lang) return;
  lang = next;
  applyLang();
  langListeners.forEach(fn => fn(lang));
}

/* ─── upper case ────────────────────────────────────────────────────────
   Done here, not in CSS, because `text-transform: uppercase` cannot be used on
   a page that contains Georgian: Chrome maps mtavruli BACK to mkhedruli when it
   applies the transform. Setting mtavruli in the markup and then asking CSS to
   uppercase it produces lower-case Georgian — which is exactly the bug this
   replaces.

   So the stylesheets carry no uppercase rule at all, and the text is uppercased
   here for both scripts: toUpperCase() gives capitals for Latin and mtavruli for
   Georgian. Idempotent, so re-running after a rebuild changes nothing.
   ─────────────────────────────────────────────────────────────────────── */
const UPPERCASED = [
  'h1.title', '.prose h2', '.prose h3', '.card-title', '.studio-head h1',
  '.eyebrow', '.byline', '.card-meta', '.site-nav a', '.site-foot-in',
  'table.zones th', '.parcel-summary', '.fact-label', '.parcel-tab',
  '.wordmark', '.row label', '.btn'
].join(', ');

// The zone label is set in Kupiura, which has mkhedruli but no mtavruli. Upper
// casing a Georgian name there would drop the label into a fallback face, so
// only Latin names are raised.
const GEORGIAN = /[\u10A0-\u10FF\u1C90-\u1CBF\u2D00-\u2D2F]/;
const upperLatinOnly = str => GEORGIAN.test(str) ? str : String(str).toUpperCase();

function applyCase(root) {
  const scope = root || document;
  if (!scope.querySelectorAll) return;
  for (const el of scope.querySelectorAll(UPPERCASED)) {
    // only this element's own text, so nested spans keep their own rules
    for (const node of el.childNodes) {
      if (node.nodeType !== 3 || !node.nodeValue.trim()) continue;
      const up = node.nodeValue.toUpperCase();
      if (up !== node.nodeValue) node.nodeValue = up;
    }
  }
}

function applyLang() {
  const root = document.documentElement;
  root.lang = lang;
  root.dataset.lang = lang;
  try { localStorage.setItem(STORE, lang); } catch (err) { /* nothing to do */ }
  document.querySelectorAll('.lang-switch button').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  applyCase();
}

function buildSwitch(floating) {
  const wrap = document.createElement('div');
  wrap.className = floating ? 'lang-switch is-floating' : 'lang-switch';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', 'Language / ენა');
  for (const [code, label] of [['en', 'EN'], ['ka', 'ქარ']]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.lang = code;
    b.lang = code;
    b.textContent = label;
    b.addEventListener('click', () => setLang(code));
    wrap.appendChild(b);
  }
  return wrap;
}

// The switch is built here rather than repeated in seven files. A page with no
// header nav — the full-screen map — gets a floating one instead, so there is
// no page where the language cannot be changed.
function mountLangSwitch() {
  const navs = document.querySelectorAll('.site-nav');
  if (navs.length) {
    for (const nav of navs) {
      if (!nav.querySelector('.lang-switch')) nav.appendChild(buildSwitch(false));
    }
  } else if (!document.querySelector('.lang-switch')) {
    document.body.appendChild(buildSwitch(true));
  }
  applyLang();
  reportFonts();
  console.info(`winemapping build ${BUILD} · language ${lang}`);
}

/* ─── which faces actually arrived ──────────────────────────────────────
   "The fonts are not loading" is a question the page can answer about itself.
   After the browser settles, each face is checked and anything missing is named
   in the console — a remote family that 404'd, a local file served from the
   wrong path, a name that does not match the @font-face. Silent fallback is the
   normal behaviour of CSS and the reason this is worth reporting at all.
   ─────────────────────────────────────────────────────────────────────── */
const FACES = [
  ['Google Sans', '1em "Google Sans"', 'everything, Latin and Georgian'],
  ['IBM Plex Mono', '500 1em "IBM Plex Mono"', 'code']
];

function reportFonts() {
  if (!document.fonts || !document.fonts.check) return;
  document.fonts.ready.then(() => {
    const missing = FACES.filter(([name, spec]) => {
      const probe = 'Aa';
      return !document.fonts.check(spec, probe);
    });
    if (!missing.length) return;
    console.warn(
      'These faces did not load, so their text is falling back:\n' +
      missing.map(([n, , use]) => `  · ${n} (${use})`).join('\n') +
      '\nA local file means a path or MIME problem under fonts/; a remote one ' +
      'means the Google Fonts request did not include it.');
  });
}

// Scripts at the end of <body> run before DOMContentLoaded, but a deferred or
// re-injected copy can run after it — in which case the event never comes and
// the switch would never mount. Check the state instead of trusting the event.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountLangSwitch);
} else {
  mountLangSwitch();
}

// Anything that arrived after the first pass — a late stylesheet, markup added
// by another script — gets caught here.
window.addEventListener('load', () => applyCase());
