/* ═══════════════════════════════════════════════════════════════════════
   THE MANIFEST — one entry per microzone, in scroll order.
   This is the only file to edit when adding a zone: geometry, photograph,
   copy, data. Everything else is machinery.

   TRANSLATION
   Any piece of copy — blurb, parcelNote, and both halves of a fact — takes
   either a plain string, meaning the same text in both languages:

       blurb: 'Reads the same either way.'

   or an object keyed by language:

       blurb: {
         en: 'One or two sentences.',
         ka: 'ერთი-ორი წინადადება.'
       }

   A missing side falls back to the other rather than leaving an empty panel,
   so a half-translated zone reads as unfinished instead of broken. Names are
   separate: `name` is the Latin one and `native` the Georgian, and the piece
   leads with whichever matches the current language.
   ═══════════════════════════════════════════════════════════════════════ */

   const ZONES = [

    {
      name:   'Akhasheni',              // heading
      native: 'ახაშენი',                      // optional second line, e.g. Georgian
      file:   'zones/ახაშენი.geojson',
      // Extra zoom levels on top of the fit, at the cost of the zone's ends
      // running past the frame. Akhasheni is 17km on its long axis and its fit is
      // width-limited, so framed whole it sits small. 0.5 is about 15% off each
      // end; 1.0 would halve what is shown.
      zoom:   1.2,
      photo:  'img/alazani.svg',      // missing file → gradient fallback
      // Optional. A short film in place of the photograph — .mp4, .webm, .mov or
      // .m4v — cut by the same seam, feather and all. It wins over `photo:` when
      // both are set, so the still can stay as the fallback. Muted and looping;
      // under prefers-reduced-motion it holds its first frame instead of playing.
      // video: 'img/akhasheni.mp4',
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
  
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      // The mask above closes along the top edge, so the picture belongs there —
      // which puts the map in the band beneath it. 'left' with a top-shaped seam
      // left the camera reserving the wrong side of the frame.
      mask: 'M0,0 L0,42.00 C0.55,48.47 0.35,79.13 3.3,80.84 C6.25,82.55 5.98,59.16 17.69,52.24 C29.39,45.32 66.16,39.21 73.55,39.34 C80.93,39.46 59.61,53.83 62,53 C64.39,52.17 81.58,35.03 87.91,34.36 C94.25,33.7 97.99,46.56 100,49 L100,0 Z',
      photoSide: 'top',
      // How far down the band the zone is pushed, away from the picture. The
      // default (0.82) puts it near the foot of the frame, which under a
      // deep-reaching top seam reads as stranded; this brings it back up towards
      // the middle. 0 would centre it exactly.
      edgeBias: 0.3,
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ახაშენი წითელი, ბუნებრივად ნახევრადტკბილი ღვინოა. ღვინო ხასიათდება მუქი ლალისფერი შეფერვით, ჰარმონიული, ხავედორვანი სიტკბოთი, ხილის ტონებით და ჯიშური არომატით. ყურძნის  მოსავალი 1 ჰექტარ ვენახზე არ უნდა აღემატებოდეს 10 ტონას. ღვინის გამოსავალი არ უნდა აღემატებოდეს 650 ლიტრს  ერთი ტონა ყურძნიდან.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [
          { 
            en: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M12 2v4"/><circle cx="12" cy="8" r="2"/><circle cx="8" cy="11" r="2"/><circle cx="16" cy="11" r="2"/><circle cx="10" cy="15" r="2"/><circle cx="14" cy="15" r="2"/><circle cx="12" cy="19" r="2"/></svg>', 
            ka: 'ჯიშები' 
          }, 
          '—'
        ]
      ],
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
    },
    {
      name:   'Akhoebi',              // heading
      native: 'ახოები',                      // optional second line, e.g. Georgian
      file:   'zones/ახოები.geojson',
      photo:  'img/vazi.svg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'left',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      name:   'Gurjaani',              // heading
      native: 'გურჯაანი',                      // optional second line, e.g. Georgian
      file:   'zones/გურჯაანი.geojson',
      video:  'img/video-1.mp4',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      mask: 'M100,0 L30.42,0 C36.29,11.81 58.77,58.5 65.67,70.86 C72.57,83.21 72.62,72.35 71.83,74.14 C71.04,75.93 65.07,83.64 60.93,81.61 C56.79,79.59 47.82,62.6 47,62 C46.18,61.4 55.33,71.67 56,78 C56.67,84.33 51.83,96.33 51,100 L100,100 Z',
      photoSide: 'right',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      name:   'Vazisubani',              // heading
      native: 'ვაზისუბანი',                      // optional second line, e.g. Georgian
      file:   'zones/ვაზისუბანი.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'right',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      name:   'Zegaani',              // heading
      native: 'ზეგაანი',                      // optional second line, e.g. Georgian
      file:   'zones/ზეგაანი.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'left',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      name:   'Teliani',              // heading
      native: 'თელიანი',                      // optional second line, e.g. Georgian
      file:   'zones/თელიანი.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'left',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      name:   'Kardenakhi',              // heading
      native: 'კარდენახი',                      // optional second line, e.g. Georgian
      file:   'zones/კარდენახი.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'left',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      name:   'Kotekhi',              // heading
      native: 'კოტეხი',                      // optional second line, e.g. Georgian
      file:   'zones/კოტეხი.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'left',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      name:   'Manavi',              // heading
      native: 'მანავი',                      // optional second line, e.g. Georgian
      file:   'zones/მანავი.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'left',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      name:   'Magraani Kisi',              // heading
      native: 'მაღრაანის ქისი',                      // optional second line, e.g. Georgian
      file:   'zones/მაღრაანის-ქისი.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'left',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      name:   'Mukuzani',              // heading
      native: 'მუკუზანი',                      // optional second line, e.g. Georgian
      file:   'zones/მუკუზანი.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'left',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },  
    {
      name:   'Napareuli',              // heading
      native: 'ნაფარეული',                      // optional second line, e.g. Georgian
      file:   'zones/ნაფარეული.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'left',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      name:   'Tibaani',              // heading
      native: 'ტიბაანი',                      // optional second line, e.g. Georgian
      file:   'zones/ტიბაანი.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'left',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      // A name can be written across two lines with <br> (or a newline): an
      // appellation that carries its municipality above it. Both languages have
      // to say so, or the name breaks in one and not the other.
      name:   'Kvareli<br>Kindzmarauli',
      native: 'ყვარელი<br>ქინძმარაული',
      file:   'zones/ყვარელი-ქინძმარაული.geojson',
      photo:  'img/ყვარელი.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'right',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      // A name can be written across two lines with <br> (or a newline): an
      // appellation that carries its municipality above it. Both languages have
      // to say so, or the name breaks in one and not the other.
      name:   'Khashmi',
      native: 'ხაშმი',
      file:   'zones/ხაშმი-საფერავი.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'right',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      // A name can be written across two lines with <br> (or a newline): an
      // appellation that carries its municipality above it. Both languages have
      // to say so, or the name breaks in one and not the other.
      name:   'Tsarapi',
      native: 'წარაფი',
      file:   'zones/წარაფი.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'right',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
    {
      // A name can be written across two lines with <br> (or a newline): an
      // appellation that carries its municipality above it. Both languages have
      // to say so, or the name breaks in one and not the other.
      name:   'Tsinandali',
      native: 'წინანდალი',
      file:   'zones/წინანდალი.geojson',
      photo:  'img/ახოები.jpg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      parcels: true,
      parcelNote: {
        en: 'One or two sentences on the parcels here — how many holdings, '
          + 'what is planted, how far back the plantings go.',
        ka: 'ერთი-ორი წინადადება აქაურ ნაკვეთებზე — რამდენი მეურნეობაა, '
          + 'რა არის დარგული, რამდენად ძველია ნარგავები.'
      },
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'right',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: 'One or two sentences. Delete the key to omit.',
        ka: 'ერთი-ორი წინადადება. წაშალეთ გასაღები, თუ არ გჭირდებათ.'
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [{ en: 'Grapes', ka: 'ჯიშები' }, '—'],
        [{ en: 'Style',  ka: 'სტილი'  }, '—'],
        [{ en: 'Region', ka: 'რეგიონი' }, '—'],
        [{ en: 'Vines',  ka: 'ვაზები' }, '—']
      ]
    },
  
  
  ];
  