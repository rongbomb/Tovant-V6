/** Vetted shops for the Twin Cities pilot. */

export const HOME_POINT = { lat: 44.948, lng: -93.260, zip: '55407', label: 'South Minneapolis' };

const PILOT_ZIPS = [
  '55401', '55402', '55403', '55404', '55405', '55406', '55407', '55408',
  '55409', '55410', '55411', '55412', '55413', '55414', '55415', '55416',
  '55417', '55418', '55419', '55421', '55423', '55424', '55425', '55426',
  '55101', '55102', '55103', '55104', '55105', '55106', '55107', '55108',
  '55113', '55116', '55117', '55118', '55119', '55121', '55124', '55125',
  '55343', '55428',
];

export const FILTER_TRADES = [
  'Mechanics and mobile',
  'Detail and ceramic',
  'Tires and alignment',
  'Brakes and suspension',
  'Body work and paint',
  'Tint and wraps',
  'Glass',
  'Audio and electronics',
  'EV and hybrid',
  'Upholstery',
  'Performance',
  'Inspection',
];

/** Match step 0: pick a work type, then pick services inside it. */
export const MATCH_CATEGORIES = [
  {
    id: 'detailing',
    label: 'Detailing',
    services: ['Interior detail', 'Exterior detail', 'Full detail', 'Ceramic coating', 'Headlight restoration', 'Paint correction'],
  },
  {
    id: 'repairs',
    label: 'Repairs',
    services: ['Oil and filters', 'Brakes and suspension', 'Diagnostics', 'Batteries', 'Check engine light', 'General repair'],
  },
  {
    id: 'tires',
    label: 'Tires & wheels',
    services: ['New tires', 'Alignment', 'Wheel repair', 'Balance and TPMS', 'Flat repair'],
  },
  {
    id: 'tint',
    label: 'Tint & wraps',
    services: ['Window tint', 'Paint protection film', 'Vinyl wrap', 'Chrome delete'],
  },
  {
    id: 'body',
    label: 'Body & paint',
    services: ['Dent repair', 'Collision repair', 'Paint touch-up', 'Bumper work'],
  },
  {
    id: 'glass',
    label: 'Glass',
    services: ['Windshield replacement', 'Chip repair', 'Side glass', 'Rear glass'],
  },
  {
    id: 'audio',
    label: 'Audio & electronics',
    services: ['Stereo install', 'Speakers', 'Backup camera', 'Dash cam', 'Remote start'],
  },
  {
    id: 'ev',
    label: 'EV & hybrid',
    services: ['EV diagnostics', 'Battery health check', 'Charging equipment', 'Hybrid service'],
  },
  {
    id: 'interior',
    label: 'Upholstery',
    services: ['Seat repair', 'Carpet and mats', 'Headliner', 'Leather restoration'],
  },
  {
    id: 'inspection',
    label: 'Inspection',
    services: ['Pre-purchase inspection', 'Safety inspection', 'Emissions check', 'Used car review'],
  },
  {
    id: 'performance',
    label: 'Performance',
    services: ['Tuning', 'Exhaust', 'Intake', 'Suspension upgrade'],
  },
  {
    id: 'unsure',
    label: 'Not sure yet',
    services: [],
  },
];

const SERVICE_TO_TRADES = {
  'Interior detail': ['Detail and ceramic'],
  'Exterior detail': ['Detail and ceramic'],
  'Full detail': ['Detail and ceramic'],
  'Ceramic coating': ['Detail and ceramic'],
  'Headlight restoration': ['Detail and ceramic'],
  'Paint correction': ['Detail and ceramic'],
  'Oil and filters': ['Mechanics and mobile'],
  'Brakes and suspension': ['Brakes and suspension'],
  'Diagnostics': ['Mechanics and mobile'],
  'Batteries': ['Mechanics and mobile'],
  'Check engine light': ['Mechanics and mobile'],
  'General repair': ['Mechanics and mobile'],
  'New tires': ['Tires and alignment'],
  'Alignment': ['Tires and alignment'],
  'Wheel repair': ['Tires and alignment'],
  'Balance and TPMS': ['Tires and alignment'],
  'Flat repair': ['Tires and alignment'],
  'Window tint': ['Tint and wraps'],
  'Paint protection film': ['Tint and wraps'],
  'Vinyl wrap': ['Tint and wraps'],
  'Chrome delete': ['Tint and wraps'],
  'Dent repair': ['Body work and paint'],
  'Collision repair': ['Body work and paint'],
  'Paint touch-up': ['Body work and paint'],
  'Bumper work': ['Body work and paint'],
  'Windshield replacement': ['Glass'],
  'Chip repair': ['Glass'],
  'Side glass': ['Glass'],
  'Rear glass': ['Glass'],
  'Stereo install': ['Audio and electronics'],
  'Speakers': ['Audio and electronics'],
  'Backup camera': ['Audio and electronics'],
  'Dash cam': ['Audio and electronics'],
  'Remote start': ['Audio and electronics'],
  'EV diagnostics': ['EV and hybrid'],
  'Battery health check': ['EV and hybrid'],
  'Charging equipment': ['EV and hybrid'],
  'Hybrid service': ['EV and hybrid'],
  'Seat repair': ['Upholstery'],
  'Carpet and mats': ['Upholstery'],
  'Headliner': ['Upholstery'],
  'Leather restoration': ['Upholstery'],
  'Pre-purchase inspection': ['Inspection'],
  'Safety inspection': ['Inspection'],
  'Emissions check': ['Inspection'],
  'Used car review': ['Inspection'],
  'Tuning': ['Performance'],
  'Exhaust': ['Performance'],
  'Intake': ['Performance'],
  'Suspension upgrade': ['Performance'],
  'Detail and ceramic': ['Detail and ceramic'],
  'Window tint and wraps': ['Tint and wraps'],
  'Body work and paint': ['Body work and paint'],
  'Tires and alignment': ['Tires and alignment'],
  'Glass': ['Glass'],
  'Audio and electronics': ['Audio and electronics'],
  'EV and hybrid': ['EV and hybrid'],
  'Upholstery': ['Upholstery'],
  'Performance': ['Performance'],
  'Inspection': ['Inspection'],
};

export function categoryForService(service) {
  if (!service || service === 'Not sure yet') return MATCH_CATEGORIES.find((c) => c.id === 'unsure');
  return MATCH_CATEGORIES.find((c) => c.services.includes(service)) || null;
}

export function servicesForCategory(categoryId) {
  const cat = MATCH_CATEGORIES.find((c) => c.id === categoryId);
  return cat?.services || [];
}

export const JOB_TO_TRADES = {
  'Mobile oil change': ['Mechanics and mobile'],
  'Detail and ceramic': ['Detail and ceramic'],
  'Brakes and tires': ['Brakes and suspension', 'Tires and alignment'],
};

export const OWNER_ISSUES = [
  'Oil and filters',
  'Brakes and suspension',
  'Tires and alignment',
  'Batteries',
  'Diagnostics',
  'Detail and ceramic',
  'Window tint and wraps',
  'Body work and paint',
  'Glass',
  'Audio and electronics',
  'EV and hybrid',
  'Upholstery',
  'Performance',
  'Inspection',
];

const ISSUE_TO_TRADES = {
  'Oil and filters': ['Mechanics and mobile'],
  'Brakes and suspension': ['Brakes and suspension'],
  'Tires and alignment': ['Tires and alignment'],
  'Batteries': ['Mechanics and mobile'],
  'Diagnostics': ['Mechanics and mobile'],
  'Detail and ceramic': ['Detail and ceramic'],
  'Window tint and wraps': ['Tint and wraps'],
  'Body work and paint': ['Body work and paint'],
  'Glass': ['Glass'],
  'Audio and electronics': ['Audio and electronics'],
  'EV and hybrid': ['EV and hybrid'],
  'Upholstery': ['Upholstery'],
  'Performance': ['Performance'],
  'Inspection': ['Inspection'],
};

export function tradesFromIssues(issues = []) {
  return [...new Set(issues.flatMap((i) => SERVICE_TO_TRADES[i] || ISSUE_TO_TRADES[i] || []))];
}

export function issuesFromTrades(trades = []) {
  return OWNER_ISSUES.filter((issue) => {
    const keys = ISSUE_TO_TRADES[issue] || [issue];
    return trades.some((t) => keys.includes(t));
  });
}

export function issuesForShop(shop) {
  const listed = (shop?.services || []).filter((t) => t && t !== 'Not sure yet');
  if (listed.length) return listed;
  const fromTrades = issuesFromTrades(shop?.trades || []);
  return fromTrades.length ? fromTrades : ['Oil and filters'];
}

export function defaultJobNote(issues = []) {
  if (issues.includes('Not sure yet')) {
    return 'Describe the noise, leak, warning light, or goal. A vetted tech will read it before anyone writes a price.';
  }
  if (issues.some((i) => /detail|ceramic|headlight|paint correction/i.test(i))) {
    return 'Note the package you want, how dirty the car is, and any stains or swirl marks worth seeing in photos.';
  }
  if (issues.some((i) => /tint|wrap|ppf|chrome/i.test(i))) {
    return 'Shade preference, coverage (front two, full car), and any existing film that needs removal.';
  }
  if (issues.includes('Oil and filters') || issues.includes('Diagnostics') || issues.includes('Brakes and suspension') || issues.includes('Check engine light')) {
    return 'Slight rattle on cold starts, goes away after a minute. Due for an oil change either way.';
  }
  return 'Anything the shop should know before they write a price. Sounds, leaks, warning lights, or photos of the area.';
}

export function modeOptionsFor(shop) {
  const both = [
    { value: 'mobile', label: 'Come to me' },
    { value: 'shop', label: "I'll drive in" },
  ];
  if (!shop) return both;
  if (shop.both) return both;
  if (shop.mode === 'Comes to you') return [both[0]];
  if (shop.mode === 'Drop off') return [both[1]];
  return both;
}

export const HOME_TRADE_TO_FILTER = {
  'Mechanics and mobile techs': 'Mechanics and mobile',
  'Detail and ceramic coating': 'Detail and ceramic',
  'Tires, wheels and alignment': 'Tires and alignment',
  'Brakes and suspension': 'Brakes and suspension',
  'Body work and paint': 'Body work and paint',
  'Window tint and wraps': 'Tint and wraps',
  'Audio and electronics': 'Audio and electronics',
  'Glass and windshield': 'Glass',
  'EV and hybrid service': 'EV and hybrid',
  'Upholstery and interior': 'Upholstery',
  'Performance and tuning': 'Performance',
  'Inspection and pre-purchase': 'Inspection',
};

const GEO = {
  harlan: { lat: 44.9482, lng: -93.2268, area: 'Longfellow' },
  vela: { lat: 44.8831, lng: -93.2830, area: 'Richfield' },
  ridgeline: { lat: 44.9486, lng: -93.2884, area: 'Lyn-Lake' },
  kestrel: { lat: 44.9991, lng: -93.2472, area: 'Northeast' },
  brightline: { lat: 44.9242, lng: -93.3201, area: 'Linden Hills' },
  southpaw: { lat: 44.9394, lng: -93.2533, area: 'Powderhorn' },
  lumen: { lat: 44.9628, lng: -93.1674, area: 'Midway' },
  oakandiron: { lat: 44.9820, lng: -93.1502, area: 'Como' },
  rimline: { lat: 45.0061, lng: -93.1566, area: 'Roseville' },
  glasshouse: { lat: 44.9778, lng: -93.2650, area: 'Downtown Minneapolis' },
  ampco: { lat: 44.9102, lng: -93.1018, area: 'West St Paul' },
  voltshop: { lat: 44.8408, lng: -93.2983, area: 'Bloomington' },
  hideandseek: { lat: 44.9637, lng: -93.1229, area: 'Frogtown' },
  preflight: { lat: 44.9341, lng: -93.1670, area: 'Mac-Groveland' },
  redline: { lat: 44.8041, lng: -93.1669, area: 'Eagan' },
  cedarbrake: { lat: 44.8897, lng: -93.3499, area: 'Edina' },
  washlane: { lat: 44.9862, lng: -93.2784, area: 'North Loop' },
  eastside: { lat: 44.9510, lng: -93.2320, area: 'Seward' },
};

function miles(a, b) {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)) * 10) / 10;
}

const BASE = [
  {
    id: 'harlan', name: 'Harlan Mobile Service', mode: 'Comes to you', rating: 4.9, jobCount: 312,
    price: 94, slot: 'Tomorrow 9 AM', laborRate: '$120 / hr',
    badge: 'COMES TO YOU', note: 'Full synthetic and an OEM filter, about 40 minutes in your driveway. He will look at the cold-start rattle while he is there, no charge.',
    short: 'Mobile van based in Longfellow. Photos of the old filter come with the invoice.',
    trades: ['Mechanics and mobile', 'Brakes and suspension'],
    jobTypes: ['Mobile oil change', 'Brakes and tires'],
    zips: ['55406', '55407', '55404', '55417', '55116'],
    loaner: false, ase: true, insured: true, languages: ['English'],
  },
  {
    id: 'vela', name: 'Vela Auto Works', mode: 'Drop off', rating: 4.6, jobCount: 388,
    price: 79, slot: 'Wed 8 AM', laborRate: '$105 / hr',
    badge: 'DROP OFF', note: 'Family shop off 66th in Richfield. Two hour turnaround, and they will put the rattle on a lift while the car is in.',
    short: 'Family shop in Richfield. Same-week drop off, two hour turnaround on most oil and brake jobs.',
    trades: ['Mechanics and mobile', 'Brakes and suspension', 'Tires and alignment'],
    jobTypes: ['Mobile oil change', 'Brakes and tires'],
    zips: ['55423', '55419', '55410', '55424', '55425'],
    loaner: false, ase: true, insured: true, languages: ['English', 'Spanish'],
  },
  {
    id: 'ridgeline', name: 'Ridgeline Auto Care', mode: 'Drop off', rating: 4.8, jobCount: 1204,
    price: 83, slot: 'Wed 8 AM', laborRate: '$118 / hr',
    badge: 'LOANER OFFERED', note: 'Independent shop on Lyndale with a loaner car if you need one. Same day slots most weekdays.',
    short: 'Lyn-Lake independent shop with a loaner. Same day slots most weekdays.',
    trades: ['Mechanics and mobile', 'Tires and alignment', 'Brakes and suspension', 'Inspection'],
    jobTypes: ['Mobile oil change', 'Brakes and tires'],
    zips: ['55408', '55403', '55405', '55409', '55416'],
    loaner: true, ase: true, insured: true, languages: ['English'],
  },
];

const EXTRA = [
  ['kestrel', 'Kestrel Auto', 'Drop off', 4.7, 210, 110, ['Mechanics and mobile', 'Inspection'], ['Mobile oil change'], ['55413', '55418', '55421']],
  ['brightline', 'Bright Line Mobile', 'Comes to you', 4.8, 156, 98, ['Mechanics and mobile', 'EV and hybrid'], ['Mobile oil change'], ['55410', '55416', '55424']],
  ['southpaw', 'Southpaw Detail', 'Drop off', 4.9, 94, 180, ['Detail and ceramic'], ['Detail and ceramic'], ['55407', '55408', '55409']],
  ['lumen', 'Lumen Tint Co', 'Drop off', 4.5, 67, 220, ['Tint and wraps'], ['Detail and ceramic'], ['55104', '55108', '55113']],
  ['oakandiron', 'Oak and Iron Body', 'Drop off', 4.6, 141, 640, ['Body work and paint'], [], ['55108', '55113', '55117']],
  ['rimline', 'Rimline Tire', 'Drop off', 4.4, 502, 310, ['Tires and alignment', 'Brakes and suspension'], ['Brakes and tires'], ['55113', '55421', '55418']],
  ['glasshouse', 'Glasshouse MSP', 'Comes to you', 4.7, 88, 265, ['Glass'], [], ['55401', '55402', '55415']],
  ['ampco', 'Amp Co Audio', 'Drop off', 4.8, 73, 540, ['Audio and electronics'], [], ['55118', '55107', '55116']],
  ['voltshop', 'Volt Shop', 'Drop off', 4.9, 41, 190, ['EV and hybrid', 'Mechanics and mobile'], ['Mobile oil change'], ['55425', '55423', '55437']],
  ['hideandseek', 'Hide and Seek Interiors', 'Drop off', 4.6, 29, 380, ['Upholstery'], [], ['55103', '55104', '55117']],
  ['preflight', 'Preflight Inspections', 'Comes to you', 4.8, 118, 145, ['Inspection', 'Mechanics and mobile'], ['Mobile oil change'], ['55105', '55116', '55102']],
  ['redline', 'Redline Tuning', 'Drop off', 4.5, 36, 420, ['Performance'], [], ['55121', '55124', '55425']],
  ['cedarbrake', 'Cedar Brake Service', 'Drop off', 4.7, 276, 328, ['Brakes and suspension'], ['Brakes and tires'], ['55424', '55410', '55416']],
  ['washlane', 'Wash Lane Ceramic', 'Drop off', 4.8, 155, 195, ['Detail and ceramic'], ['Detail and ceramic'], ['55401', '55403', '55405']],
  ['eastside', 'Eastside Mobile Tech', 'Comes to you', 4.6, 201, 89, ['Mechanics and mobile', 'Tires and alignment'], ['Mobile oil change', 'Brakes and tires'], ['55406', '55404', '55116']],
];

function extraToShop([id, name, mode, rating, jobCount, price, trades, jobList, zips]) {
  return {
    id, name, mode, rating, jobCount, price,
    slot: 'Tomorrow 1 PM', laborRate: `$${100 + (jobCount % 30)} / hr`,
    badge: mode.toUpperCase(),
    note: `${name} covers ${trades[0].toLowerCase()} in this zip. Written price held for 48 hours.`,
    short: `${name} · ${mode}. Written price held for 48 hours.`,
    trades, jobTypes: jobList, zips, loaner: jobCount > 400, ase: rating >= 4.6, insured: true,
    languages: name.includes('Vela') || name.includes('Eastside') ? ['English', 'Spanish'] : ['English'],
    vetted: true,
  };
}

const built = [
  ...BASE.map((p) => ({ ...p, vetted: true })),
  ...EXTRA.map(extraToShop),
];

built.forEach((p) => {
  const g = GEO[p.id];
  if (g) {
    p.lat = g.lat;
    p.lng = g.lng;
    p.area = g.area;
    p.distance = miles(HOME_POINT, g);
  }
  p.services = issuesFromTrades(p.trades);
});

const used = new Set(built.flatMap((p) => p.zips));
const leftover = PILOT_ZIPS.filter((z) => !used.has(z));
leftover.forEach((z, i) => {
  built[i % built.length].zips = [...built[i % built.length].zips, z];
});

export const directory = built;

export function marketCounts(list = directory) {
  const vetted = list.filter((p) => p.vetted);
  const zips = new Set(vetted.flatMap((p) => p.zips));
  return { pros: vetted.length, zips: zips.size };
}

export function tradeCount(tradeLabel, list = directory) {
  const key = HOME_TRADE_TO_FILTER[tradeLabel] || tradeLabel;
  return list.filter((p) => p.vetted && p.trades.includes(key)).length;
}

export function shopsFor({ trade, job, list = directory } = {}) {
  const keys = job ? (JOB_TO_TRADES[job] || [job]) : trade ? [HOME_TRADE_TO_FILTER[trade] || trade] : null;
  if (!keys) return list.filter((p) => p.vetted);
  return list.filter((p) => p.vetted && keys.some((k) => p.trades.includes(k) || (p.jobTypes || []).includes(job)));
}

function shopsForIssues(issues, list = directory) {
  if (!issues?.length || issues.includes('Not sure yet')) return list.filter((p) => p.vetted);
  const trades = tradesFromIssues(issues);
  return list.filter((p) => p.vetted && (
    issues.some((i) => issuesForShop(p).includes(i))
    || trades.some((t) => (p.trades || []).includes(t))
  ));
}

export const TIME_WINDOWS = [
  { id: 'morning', label: 'Morning', slots: ['8 AM', '9 AM', '10 AM'] },
  { id: 'midday', label: 'Mid-day', slots: ['11 AM', '12 PM', '1 PM'] },
  { id: 'afternoon', label: 'Afternoon', slots: ['2 PM', '3 PM', '4 PM'] },
];

export function slotMatchesWhen(slot, when) {
  if (!when || when === 'Any day') return true;
  const s = String(slot || '').toLowerCase();
  if (when === 'Morning') return /8\s*am|9\s*am|10\s*am/.test(s);
  if (when === 'Mid-day') return /11\s*am|12\s*pm|1\s*pm/.test(s);
  if (when === 'Afternoon') return /2\s*pm|3\s*pm|4\s*pm|5\s*pm/.test(s);
  return true;
}

function loadOf(p, load) {
  return load?.[p.id]?.sent || 0;
}

/**
 * Fair slate for a crowded trade (e.g. 30 mobile mechanics).
 * Distance is one seat, not the whole list. Remaining seats go to
 * highest rated, rising (fewer jobs, strong rating), then shops that
 * have received the fewest requests this week.
 */
export function pickMatches(issues, list = directory, { mode, cap = 3, load = {} } = {}) {
  let pool = shopsForIssues(issues, list).filter((p) => p.vetted && p.accepting !== false);
  const mobile = pool.filter((p) => p.mode === 'Comes to you' || p.both);
  const drop = pool.filter((p) => p.mode === 'Drop off' || p.both);
  if (mode === 'mobile' && mobile.length) pool = mobile;
  else if ((mode === 'shop' || mode === 'drop') && drop.length) pool = drop;

  const used = new Set();
  const take = (cmp, role) => {
    const next = pool.filter((p) => !used.has(p.id)).sort(cmp)[0];
    if (!next) return null;
    used.add(next.id);
    return { ...next, matchRole: role };
  };

  const byDist = (a, b) => (a.distance - b.distance) || (b.rating - a.rating);
  const byRate = (a, b) => (b.rating - a.rating) || (a.distance - b.distance);
  const byRising = (a, b) => (a.jobCount - b.jobCount) || (b.rating - a.rating) || (a.distance - b.distance);
  const byFair = (a, b) => (loadOf(a, load) - loadOf(b, load)) || byDist(a, b);
  const score = (p) => {
    const dist = 1 / (1 + (p.distance || 12));
    const rate = (p.rating || 0) / 5;
    const rise = (p.jobCount || 0) < 120 ? 0.12 : 0;
    const rotation = 1 / (1 + loadOf(p, load));
    return dist * 0.32 + rate * 0.36 + rise + rotation * 0.2;
  };
  const byBest = (a, b) => score(b) - score(a);

  const limit = Math.max(1, cap);
  const slate = [];
  const add = (row) => { if (row && slate.length < limit) slate.push(row); };

  add(take(byDist, 'Closest'));
  if (limit >= 2) add(take(byRate, 'Highest rated'));
  if (limit >= 3) add(take(byRising, 'Rising'));
  if (limit >= 4) add(take(byBest, 'Best match'));
  while (slate.length < Math.min(limit, pool.length)) add(take(byFair, 'Next in rotation'));
  return slate;
}
