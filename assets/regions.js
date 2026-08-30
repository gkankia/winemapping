/* ═══════════════════════════════════════════════════════════════════════
   THE REGIONS — one entry per wine region, in the order the hub lists them.

   `zones` names the geometry files in zones/ that belong to the region. The
   grouping below was seeded from where each file actually sits: the Kakheti
   files cluster east of longitude 45, Kartli around 44, Imereti and
   Racha-Lechkhumi west of 43.2. Worth checking against the appellations
   themselves before publishing — a file in the wrong list will draw in the
   wrong place and be counted under the wrong heading.

   `page` is null for a region that has no page yet. The hub lists it, draws
   its zones, and does not link it.
   ═══════════════════════════════════════════════════════════════════════ */

const REGIONS = [
  {
    id: 'kakheti',
    name: { en: 'Kakheti', ka: 'კახეთი' },
    page: 'kakheti.html',
    blurb: {
      en: 'The east, and three quarters of what Georgia plants. Twenty microzones '
        + 'along the Alazani and the Iori, between the Caucasus front and the Gombori ridge.',
      ka: 'აღმოსავლეთი და ის, რაც საქართველოს ნარგავების სამ მეოთხედს შეადგენს. '
        + 'ოცი მიკროზონა ალაზნისა და ივრის გასწვრივ, კავკასიონსა და გომბორის ქედს შორის.'
    },
    zones: [
      'ახაშენი', 'ახმეტა-ახმეტის მწვანე', 'ახოები', 'გურჯაანი', 'ვაზისუბანი',
      'ზეგაანი', 'თელიანი', 'კარდენახი', 'კოტეხი', 'მანავი', 'მაღრაანის-ქისი',
      'მუკუზანი', 'ნაფარეული', 'ტიბაანი', 'ქინძმარაული', 'ყვარელი',
      'ყვარელი-ქინძმარაული', 'წარაფი', 'წინანდალი', 'ხაშმი-საფერავი'
    ]
  },
  {
    id: 'kartli',
    name: { en: 'Kartli', ka: 'ქართლი' },
    page: null,
    blurb: {
      en: 'The centre, higher and drier, either side of the Mtkvari.',
      ka: 'ცენტრი — უფრო მაღალი და მშრალი, მტკვრის ორივე ნაპირზე.'
    },
    zones: ['ასურეთული-შალა', 'ატენი-ატენური', 'ბოლნისი-ღვინო', 'ოკამი']
  },
  {
    id: 'imereti',
    name: { en: 'Imereti', ka: 'იმერეთი' },
    page: null,
    blurb: {
      en: 'West of the Likhi range, where the vessels and the method change.',
      ka: 'ლიხის ქედის დასავლეთით, სადაც ჭურჭელიც იცვლება და მეთოდიც.'
    },
    zones: ['ობჩა', 'საზანოს-ოცხანური', 'სვირი']
  },
  {
    id: 'racha-lechkhumi',
    name: { en: 'Racha-Lechkhumi', ka: 'რაჭა-ლეჩხუმი' },
    page: null,
    blurb: {
      en: 'High, small and northern — the naturally semi-sweet wines.',
      ka: 'მაღალი, მცირე და ჩრდილოეთი — ბუნებრივად ნახევრადტკბილი ღვინოები.'
    },
    zones: ['ოყურეში-უსახელოური', 'ტვიში', 'ხვანჭკარა']
  },
  {
    id: 'samegrelo',
    name: { en: 'Samegrelo', ka: 'სამეგრელო' },
    page: null,
    blurb: {
      en: 'The wet west, and the one appellation mapped here so far.',
      ka: 'ნოტიო დასავლეთი და ჯერჯერობით ერთადერთი აქ დატანილი აპელაცია.'
    },
    zones: ['სალხინო-ოჯალეში']
  }
];
