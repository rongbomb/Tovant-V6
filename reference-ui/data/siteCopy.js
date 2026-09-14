/** Default public copy. Admin edits live in store.site.pages. */

export const PAGE_KEYS = [
  ['Home', 'home', 'HERO · SECTIONS'],
  ['Find a Pro', 'find', 'SEARCH · EMPTY · MATCH CARD'],
  ['Match', 'match', 'REQUEST · RESULTS'],
  ['Provider page', 'provider', 'PROFILE TEMPLATE'],
  ['Login', 'login', 'SIGN IN'],
  ['Signup', 'signup', 'OWNER OR SHOP'],
  ['Vetting', 'vetting', 'HOW IT WORKS'],
  ['Support', 'support', 'HELP DESK'],
  ['Legal', 'legal', 'TERMS · PRIVACY'],
  ['Careers', 'careers', 'ROLES'],
  ['Press', 'press', 'FACTS'],
  ['Payouts', 'payouts', 'FRIDAY DEPOSITS'],
];

export const PAGE_FIELDS = {
  home: [
    ['headline', 'HEADLINE', true],
    ['subhead', 'SUBHEAD'],
    ['primaryBtn', 'PRIMARY BUTTON'],
    ['secondaryBtn', 'SECONDARY BUTTON'],
    ['usualTitle', 'USUAL JOBS TITLE'],
    ['usualSub', 'USUAL JOBS SUB'],
    ['unsureTitle', 'NOT SURE CARD'],
    ['unsureBody', 'NOT SURE BODY'],
    ['tradesTitle', 'TRADES TITLE'],
    ['tradesSub', 'TRADES SUB'],
    ['historyTitle', 'HISTORY TITLE'],
    ['historyBody', 'HISTORY BODY'],
  ],
  find: [
    ['emptyTitle', 'EMPTY TITLE'],
    ['emptyBody', 'EMPTY BODY'],
    ['matchTitle', 'MATCH CARD TITLE'],
    ['matchBody', 'MATCH CARD BODY'],
  ],
  match: [
    ['headline', 'HEADLINE', true],
    ['lead', 'LEAD'],
    ['next1Title', 'NEXT STEP 1 TITLE'],
    ['next1Body', 'NEXT STEP 1 BODY'],
    ['next2Title', 'NEXT STEP 2 TITLE'],
    ['next2Body', 'NEXT STEP 2 BODY'],
    ['next3Title', 'NEXT STEP 3 TITLE'],
    ['next3Body', 'NEXT STEP 3 BODY'],
  ],
  provider: [
    ['quoteBtn', 'QUOTE BUTTON'],
    ['messageBtn', 'MESSAGE BUTTON'],
    ['aboutTitle', 'ABOUT TITLE'],
  ],
  login: [
    ['title', 'TITLE'],
    ['lead', 'LEAD'],
    ['asideTitle', 'ASIDE TITLE'],
    ['asideBody', 'ASIDE BODY'],
  ],
  signup: [
    ['title', 'TITLE'],
    ['lead', 'LEAD'],
    ['ownerTitle', 'OWNER CARD TITLE'],
    ['ownerBody', 'OWNER CARD BODY'],
    ['providerTitle', 'PROVIDER CARD TITLE'],
    ['providerBody', 'PROVIDER CARD BODY'],
  ],
  vetting: [
    ['title', 'TITLE', true],
    ['lead', 'LEAD'],
  ],
  support: [
    ['title', 'TITLE'],
    ['lead', 'LEAD'],
  ],
  legal: [
    ['title', 'TITLE'],
    ['lead', 'LEAD'],
  ],
  careers: [
    ['title', 'TITLE'],
    ['lead', 'LEAD'],
  ],
  press: [
    ['title', 'TITLE'],
    ['lead', 'LEAD'],
  ],
  payouts: [
    ['title', 'TITLE'],
    ['lead', 'LEAD'],
  ],
};

export const DEFAULT_PAGES = {
  home: {
    headline: 'Every automotive expert, one place.',
    subhead: 'Mechanics, detailers, tint and audio installers, body shops, tire and glass techs. Everyone who touches your car, in one place. Ask once and vetted local pros come back with a written price and what it covers.',
    primaryBtn: 'Get Matched with a Provider',
    secondaryBtn: 'How vetting works',
    usualTitle: 'Book the usual jobs',
    usualSub: 'The most requested jobs this month',
    unsureTitle: "Not sure what's wrong?",
    unsureBody: 'Describe the noise. A vetted tech reads it before anyone quotes a price.',
    tradesTitle: 'Every trade your car needs',
    tradesSub: 'One request reaches the right specialists',
    historyTitle: 'Your service history, in your pocket',
    historyBody: 'Every invoice, photo and mileage note stays with the vehicle. Sell the car and hand the buyer a clean record.',
  },
  find: {
    emptyTitle: 'No shops in this filter',
    emptyBody: 'Widen the distance or send a match request and let vetted pros answer.',
    matchTitle: 'Rather not choose?',
    matchBody: 'Describe the job once. Matched pros send a written price and what it covers.',
  },
  match: {
    headline: 'Describe the job once. We take it to the pros who actually do it.',
    lead: 'Pick the kind of work first. Then choose the services. Tovant builds a fair slate of shops that actually do that work.',
    next1Title: 'We send the request',
    next1Body: 'Only shops that actually do this trade, in the way you asked, see it. Distance is one seat on the slate, not the only one.',
    next2Title: 'Matched shops price it',
    next2Body: 'They answer with a written price, held for 48 hours, and a note on what could change it.',
    next3Title: 'You compare and book',
    next3Body: 'Prices arrive here and on My jobs. Nothing is charged until the work is done.',
  },
  provider: {
    quoteBtn: 'Request a quote',
    messageBtn: 'Message the shop',
    aboutTitle: 'About',
  },
  login: {
    title: 'Welcome back',
    lead: 'Sign in to send requests, read quotes, and run a shop from the same site.',
    asideTitle: 'One request. Every expert worth using.',
    asideBody: 'Owners and shops share the same site. The nav changes with the account so nobody lands in the wrong tools.',
  },
  signup: {
    title: 'Create an account',
    lead: 'Pick the side you are on. You can apply as a provider later from owner settings.',
    ownerTitle: 'I own a car',
    ownerBody: 'Describe a job once, read written prices, and book a time. Nothing is charged until the work is done.',
    providerTitle: 'I run a shop or a van',
    providerBody: 'One account, trade credentials per specialty. You list as soon as the first credential clears.',
  },
  vetting: {
    title: 'One account. Credentials per trade. Live on the first one that clears.',
    lead: 'Requirements are data, not code. Adding a trade or changing a state rule never needs a deploy. Staff verify every document by hand. A provider is never blocked from earning on the slowest credential.',
  },
  support: {
    title: 'We read every note from the Twin Cities pilot',
    lead: 'Jobs, quotes, and payouts stay on the site. Use this page for account trouble, a disputed invoice, or a vetting question.',
  },
  legal: {
    title: 'Terms and privacy',
    lead: 'Plain language for the Twin Cities pilot. The live counsel pack replaces this before paid production traffic.',
  },
  careers: {
    title: 'Hiring in Minneapolis–Saint Paul',
    lead: 'Tovant is a small staff sitting next to the shops we list. Roles are local first. Remote-only seats are not open on this pilot.',
  },
  press: {
    title: 'Facts for the Twin Cities pilot',
    lead: 'Tovant is one place to reach every local automotive expert. Fourteen trades, one request. We do not sell rank.',
  },
  payouts: {
    title: 'Friday deposits, or the owner pays you directly',
    lead: 'Off-platform pay is the default. Shops that turn on Tovant payouts get a Friday deposit for invoiced work. Tovant does not take a cut of the job.',
  },
};

export function mergePages(base = DEFAULT_PAGES, saved = {}) {
  const out = {};
  const keys = new Set([...Object.keys(base), ...Object.keys(saved || {})]);
  keys.forEach((k) => { out[k] = { ...(base[k] || {}), ...(saved?.[k] || {}) }; });
  return out;
}

export function pageCopy(site, key) {
  return { ...DEFAULT_PAGES[key], ...(site?.pages?.[key] || {}) };
}
