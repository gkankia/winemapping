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

   const grapeIcon = '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px; margin-right: 4px;"><path d="M12 2v4"/><circle cx="12" cy="8" r="2"/><circle cx="8" cy="11" r="2"/><circle cx="16" cy="11" r="2"/><circle cx="10" cy="15" r="2"/><circle cx="14" cy="15" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
   const terrainIcon = '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px; margin-right: 4px;"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="M4.14 15.08 9 11l4 4"/></svg>';

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
      // Optional. Puts a button at the foot of this zone's card that draws its
      // vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.

      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The camera and the
      // zone's name follow it. In portrait, right folds to bottom and left
      // folds to top.
      //
      // Optional. `panelSide:` — where the text card stands, taking the same
      // four values. Unset it follows the photograph, which is how every zone
      // read before the two were separated; set it to compose the card against
      // the picture instead of on top of it:
      //
      //     photoSide: 'right',   panelSide: 'left',
      //
      // The camera reserves the card's room wherever it lands, so the zone is
      // not framed underneath it — which means a card moved off the picture
      // costs the map some width, and a tight frame will zoom out to pay for it.
      // The mask above closes along the top edge, so the picture belongs there —
      // which puts the map in the band beneath it. 'left' with a top-shaped seam
      // left the camera reserving the wrong side of the frame.
      mask: 'M0,0 L0,42.00 C0.55,48.47 0.35,79.13 3.3,80.84 C6.25,82.55 5.98,59.16 17.69,52.24 C29.39,45.32 66.16,39.21 73.55,39.34 C80.93,39.46 59.61,53.83 62,53 C64.39,52.17 81.58,35.03 87.91,34.36 C94.25,33.7 97.99,46.56 100,49 L100,0 Z',
      photoSide: 'top',
      panelSide: 'right',
      // How far down the band the zone is pushed, away from the picture. The
      // default (0.82) puts it near the foot of the frame, which under a
      // deep-reaching top seam reads as stranded; this brings it back up towards
      // the middle. 0 would centre it exactly.
      edgeBias: 0.3,
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: `The Akhasheni micro-zone is located in Inner Kakheti, along the middle reaches of the Alazani River, and encompasses the slopes adjacent to the forests of the Tsiv-Gombori Ridge.
        The villages included in the micro-zone are Zegaani, Akhasheni, Chumlaki, and Kitaani, as well as a portion of the Gurjaani district territory.
        Akhasheni is a naturally semi-sweet red wine. It is characterized by a dark ruby color, a harmonious and velvety sweetness, fruity notes, and a distinct varietal aroma.`,
        ka: `ახაშენის მიკროზონა მდებარეობს შიდა კახეთში, მდ. ალაზნის შუა წელში და მოიცავს ცივ-გომბორის ქედის ტყისპირა კალთების გაგრძელებას. 
        მიკროზონაში შემავალი სოფლებია: ზეგაანი, ახაშენი, ჩუმლაყი და ყიტაანი. აგრეთვე, გურჯაანის რაიონული ტერიტორიის ნაწილი.
        ახაშენი წითელი, ბუნებრივად ნახევრადტკბილი ღვინოა. ღვინო ხასიათდება მუქი ლალისფერი შეფერვით, ჰარმონიული, ხავედორვანი სიტკბოთი, ხილის ტონებით და ჯიშური არომატით.`
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [
          { en: `${grapeIcon} Vine`, ka: `${grapeIcon} ვაზი` }, 
          { en: 'Saperavi', ka: 'საფერავი' }
        ],
        [
          { en: `${terrainIcon} Terrain`, ka: `${terrainIcon} რელიეფი` }, 
          { en: '350-700 meters A.S.L', ka: '350-700 მეტრი ზღვის დონიდან' }
        ]
      ],
      parcels: true,
      parcelNote: {
        en: '',
        ka: ''
      }
    },
    {
      name:   'Akhoebi',              // heading
      native: 'ახოები',                      // optional second line, e.g. Georgian
      file:   'zones/ახოები.geojson',
      photo:  'img/vazi.svg',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      
      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'left',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: `The Akhoebi microzone is located within the administrative territory of Kardenakhi village in the Gurjaani Municipality, along the right bank of the Alazani River.
        "Akhoebi" is a dark red dry wine with an impeccable character—full-bodied, extract-rich, velvety, and harmonious, featuring the distinct varietal aroma characteristic of this geographical area. 
        Upon aging, it develops a pronounced bouquet with fruity notes. 
        Grapes processing and winemaking are permitted only within the Kakheti zone, whereas bottling is allowed outside the Kakheti zone as well, provided it takes place within the territory of Georgia.`,
        ka: `ახოების მიკროზონა მდებაროებს გურჯაანის მუნიციპალიტეტის სოფელ კარდენახის ადმინისტრაციულ ტერიტორიაზე, მდინარე ალაზნის მარჯვენა სანაპიროზე. 
        "ახოები" მუქი შეფერილობის, წითელი მშრალი ღვინოა, უზადო, გემოზე სავსე, ექსტრაქტული, ხავერდოვანი, ჰარმონიული, ამ გეოგრაფიული არეალისთვის დამახასიათებელი ჯიშური არომატით. 
        დავარგებისას უვითარდება მკვეთრად გამოხატული ბუკეტი ხილის ტონებით. ყურძნის გადამუშავება და ღვინის დამზადება დასაშვებია მხოლოდ კახეთის ზონის ფარგლებში, ხოლო ჩამოსხმა კახეთის ზონის 
        ფარგლებს გარეთაც, მხოლოდ საქართველოს ტერიტორიაზე.`
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [
          { en: `${grapeIcon} Vine`, ka: `${grapeIcon} ვაზი` }, 
          { en: 'Saperavi / Budeshuri Saperavi', ka: 'საფერავი / ბუდეშური საფერავი' }
        ],
        [
          { en: `${terrainIcon} Terrain`, ka: `${terrainIcon} რელიეფი` }, 
          { en: '350-750 meters A.S.L', ka: '350-750 მეტრი ზღვის დონიდან' }
        ]
      ],
      parcels: true,
      parcelNote: {
        en: '',
        ka: ''
      }
    },
    {
      name:   'Gurjaani',              // heading
      native: 'გურჯაანი',                      // optional second line, e.g. Georgian
      file:   'zones/გურჯაანი.geojson',
      video:  'img/video-1.mp4',      // missing file → gradient fallback
      // Optional. Adds a second chapter for this zone with a button that draws
      // its vineyard parcels, fetched live from the NAPR register for the zone's
      // own extent. No file to prepare — set it to true and the zone has parcels.
      

      // Optional. Which side of the frame this zone's photograph takes:
      // 'right' (the default), 'left', 'top' or 'bottom'. The panel, the camera
      // and the zone's name all follow it. In portrait, right folds to bottom and
      // left folds to top.
      photoSide: 'right',
      // Optional. The shape of the seam between map and photograph for this zone,
      // as an SVG path in a 100x100 box (x right, y down). Filled area is photo.
      // Omit to use MASK_SHAPE, the default in scroll.js.
      blurb: {
        en: `The Gurjaani microzone is located along the middle reaches of the Alazani River, on its right bank. 
        It encompasses the foothills bordering the forested slopes of the northeastern incline of the Tsiv-Gombori Ridge, as well as the Alazani Plain stretching to the Alazani Canal.
        "Gurjaani" is a white, light straw-colored dry wine with an impeccable, delicate, soft, and refined aroma and taste, featuring a characteristic varietal aroma and notes of field flowers. 
        This wine can be produced exclusively from the Rkatsiteli grape variety grown within this micro-zone, though up to 15% of Kakhuri Mtsvane grapes grown in the same micro-zone may also be used in its production.
        The wine "Gurjaani" has been produced since 1887.`,
        ka: `გურჯაანის მიკროზონა მდებარეობს მდინარე ალაზნის შუა წელში, მარჯვენა სანაპიროზე და მოიცავს ცივ-გომბორის ქედის
        ჩრდილო-აღმოსავლეთი დაქანების ტყიან კალთებზე მიბჯენილ მთისწინებს და ალაზნის დაბლობს ალაზნის არხამდე.
        "გურჯაანი" თეთრი, ღია ჩალისფერი მშრალი ღვინოა, ხოლო არომატი და გემო უზადო, ნაზი, რბილი, დახვეწილი, დამახასიათებელი ჯიშური არომატით,
        მინდვრის ყვავილების ტონებით. ეს ღვინო შეიძლება დამზადდეს მხოლოდ ამ მიკროზონაში მოყვანილი რქაწითელის ჯიშის ყურძნიდან.
        მის დასამზადებლად, დასაშვებია 15%-მდე, იმავე მიკროზონაში მოყვანილი კახური მწვანე ჯიშის ყურძნის გამოყენებაც. 
        ღვინო "გურჯაანი" მზადდება 1887 წლიდან.`
      },
      // [label, value] — any number, two per row. Either half may be a
      // { en, ka } object; a bare string is used in both languages.
      facts: [
        [
          { en: `${grapeIcon} Vine`, ka: `${grapeIcon} ვაზი` }, 
          { en: 'Rkatsiteli / Kakhuri Mtsvane', ka: 'რქაწითელი / კახური მწვანი' }
        ],
        [
          { en: `${terrainIcon} Terrain`, ka: `${terrainIcon} რელიეფი` }, 
          { en: '350-700 meters A.S.L', ka: '350-700 მეტრი ზღვის დონიდან' }
        ]
      ],
      parcels: true,
      parcelNote: {
        en: '',
        ka: ''
      }
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
  