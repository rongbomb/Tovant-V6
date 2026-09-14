import React from 'react';
import {useDemo} from '../../components/tovant/context';
import {useBridge} from './bridge';
import { directory, HOME_POINT, tradesFromIssues, issuesForShop } from '../data/directory.js';
import { toISODate, addDays, windowFromSlot } from './schedule.js';
import { emailTaken } from '../data/accounts.js';
import { DEFAULT_PAGES, mergePages } from '../data/siteCopy.js';
import {
  adminHeroBlocks, adminGlobalText, adminTradeRows, trades as seedTrades,
  openRequests, todaySlots, laborRates, revenueByMonth,
  ownerNotifications, cards, vehicles, week,
} from '../data/mock.js';

const KEY = 'tovant.v5.5.store';

function shopSlug(name) {
  const s = String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return s || `shop-${Date.now()}`;
}

function shopFromSignup(fields, shopId) {
  const services = (fields.trades || []).filter((t) => t && t !== 'Not sure yet');
  const trades = tradesFromIssues(services);
  const how = fields.how || '';
  const both = /both/i.test(how);
  const mobile = /mobile|come to/i.test(how);
  return {
    id: shopId,
    name: fields.shop.trim(),
    mode: both ? 'Comes to you' : mobile ? 'Comes to you' : 'Drop off',
    both,
    rating: 0,
    jobCount: 0,
    price: 0,
    slot: 'This week',
    laborRate: '$120 / hr',
    badge: 'IN REVIEW',
    note: `${fields.shop.trim()} is in staff review. The listing goes live once credentials clear.`,
    short: 'In review. Live once credentials clear.',
    trades: trades.length ? trades : ['Mechanics and mobile'],
    services: services.length ? services : ['Oil and filters'],
    jobTypes: [],
    zips: [fields.zip || HOME_POINT.zip],
    loaner: false,
    ase: false,
    insured: !!fields.gl,
    languages: ['English'],
    vetted: false,
    pending: true,
    lat: HOME_POINT.lat + 0.008,
    lng: HOME_POINT.lng + 0.012,
    area: 'Twin Cities',
    distance: 1.2,
  };
}

function primaryVehicle(owner) {
  const list = owner?.vehicles || [];
  const row = list.find((v) => v[3]) || list[0];
  return row ? `${row[0]} · ${row[2]}` : '2021 Audi Q5 · 41,208 mi';
}

const SEED_JOBS = [
  ...todaySlots.map(([time, car, job], i) => ({
    id: `job-${i + 1}`,
    time, car, job,
    status: i === 0 ? 'in_progress' : 'scheduled',
    mode: 'IN SHOP',
    date: toISODate(new Date()),
    window: windowFromSlot(time),
  })),
  { id: 'job-5', time: '9:00', car: '2019 Mazda CX-5', job: 'Battery', status: 'scheduled', mode: 'MOBILE', date: addDays(toISODate(new Date()), 1), window: 'morning' },
  { id: 'job-6', time: '2:00', car: '2017 BMW 328i', job: 'Inspection', status: 'scheduled', mode: 'IN SHOP', date: addDays(toISODate(new Date()), 2), window: 'afternoon' },
];

const SEED_PAYOUTS = [
  { id: 'p1', week: 'This Friday', amount: 8420, status: 'cleared', jobs: 26 },
  { id: 'p2', week: 'Last Friday', amount: 7610, status: 'cleared', jobs: 22 },
  { id: 'p3', week: 'Aug 29', amount: 6980, status: 'cleared', jobs: 19 },
];

const SEED_QUEUE = [
  { id: 'v1', shop: 'Harlan Mobile Service', credential: 'government_id', detail: 'Minnesota DL · selfie match', state: 'in_review', submitted: '2 hr ago' },
  { id: 'v2', shop: 'Harlan Mobile Service', credential: 'background_check', detail: 'FCRA consent recorded', state: 'submitted', submitted: '2 hr ago' },
  { id: 'v3', shop: 'Southpaw Detail', credential: 'work_portfolio', detail: 'Open-tier detailing proof of work', state: 'submitted', submitted: '5 hr ago' },
  { id: 'v4', shop: 'Cedar Brake Service', credential: 'ase_certification', detail: 'ASE A5 Brakes', state: 'in_review', submitted: '1 day ago' },
  { id: 'v5', shop: 'Volt Shop', credential: 'general_liability', detail: '$1M · expires Nov 2027', state: 'submitted', submitted: '1 day ago' },
];

const QUOTE_TEMPLATES = [
  { name: 'Oil and filter', price: 89 },
  { name: 'Brake inspection', price: 149 },
  { name: 'Diagnostic', price: 120 },
  { name: 'Tire rotation', price: 45 },
];

function defaults() {
  const site = {
      headline: adminHeroBlocks[0][1],
      subhead: adminHeroBlocks[1][1],
      primaryBtn: 'Get Matched with a Provider',
      secondaryBtn: 'How vetting works',
      badge: '',
      footer: adminGlobalText[0][1],
      quoteDisclaimer: adminGlobalText[1][1],
      paymentNote: adminGlobalText[2][1],
      tradesOnHome: Object.fromEntries(seedTrades.map(([t]) => [t, adminTradeRows.find((r) => r[0] === t)?.[2] !== false])),
      images: { hero: '', community: '' },
      pages: DEFAULT_PAGES,
    };
  return {
    site,
    draft: null,
    publishLog: [{ at: Date.now() - 2 * 60 * 60 * 1000, by: 'marcus@tovant.com', note: 'Initial publish', snapshot: site }],
    dashboard: {
      shop: 'Ridgeline Auto Care',
      queue: openRequests.map((r) => ({ ...r, status: 'open', shopId: 'ridgeline' })),
      sentQuotes: [],
      jobs: SEED_JOBS,
      capacity: { jobsPerDay: 6, mobileSlots: 2, accepting: true },
      rates: laborRates.map(([n, v, sub]) => ({ name: n, value: v, sub })),
      payouts: SEED_PAYOUTS,
      revenue: revenueByMonth,
      autoQuote: false,
      quoteTemplates: QUOTE_TEMPLATES,
      holds: [],
    },
    session: { role: 'guest', email: '', name: '', shopId: '', photo: '' },
    requestDraft: null,
    drafts: [],
    ownerRequests: [],
    verifyQueue: SEED_QUEUE,
    bookings: [],
    lastBooking: null,
    accounts: [],
    messages: [
      {
        id: 'harlan',
        shopId: 'harlan',
        shop: 'Harlan Mobile Service',
        peer: 'Mara Kessler',
        lines: [
          { from: 'owner', body: 'The rattle is only on cold starts. Can you look while you do the oil?', at: Date.now() - 54 * 60000 },
          { from: 'shop', body: 'Yes. I will send a photo of the belt if it looks cracked. The written price stays the oil and filter unless you approve more.', at: Date.now() - 48 * 60000 },
        ],
      },
    ],
    blocked: [],
    shops: directory,
    compareIds: [],
    matchLoad: {},
    notifications: openRequests.map((r) => ({
      id: `n-seed-${r.id}`,
      shopId: 'ridgeline',
      kind: 'request',
      title: 'New request',
      body: `${r.car} · ${r.job}`,
      to: `/dashboard/request/${r.id}`,
      read: false,
      at: Date.now() - r.id * 60000,
    })),
    owner: {
      name: 'Mara Kessler',
      email: 'mara.k@gmail.com',
      phone: '(612) 555 0148',
      home: '3521 38th Ave S, Minneapolis 55406',
      work: '80 S 8th St, Minneapolis 55402',
      notes: 'Alley parking off 38th. Gate code 4417 if the front is locked.',
      textOnly: true,
      notif: ownerNotifications.map(([, , on]) => on),
      cards,
      vehicles,
    },
    provider: {
      name: 'Harlan Mobile Service',
      owner: 'Marcus Harlan',
      phone: '(612) 555 0912',
      email: 'book@harlanmobile.com',
      about: 'Two vans, three ASE-certified techs, and published labor rates. Mobile maintenance only: oil, filters, brakes, batteries and diagnostics at your home or office. Anything needing a lift gets referred out with no markup.',
      how: 'Mobile van, I come to the customer',
      radius: '12 miles from 55407',
      tripFee: false,
      trades: ['Oil and filters', 'Brakes and suspension', 'Batteries', 'Diagnostics'],
      days: week.map(([, , on]) => on),
      payoutMail: true,
      autoQuote: false,
      jobsPerDay: 6,
      team: [
        ['Marcus Harlan', 'Owner · ASE Master'],
        ['Ana Ruiz', 'Mobile tech · ASE A4 A5'],
        ['Eli Cho', 'Mobile tech · ASE A1 A8'],
      ],
    },
  };
}


function applySends(s, shopList, extras = {}) {
  const draft = {
    vehicle: primaryVehicle(s.owner),
    zip: HOME_POINT.zip,
    issues: ['Oil and filters'],
    describe: '',
    mode: 'mobile',
    when: 'Morning',
    sentTo: [],
    ...(s.requestDraft || {}),
    ...extras,
  };
  const sentTo = [...(draft.sentTo || [])];
  const items = [];
  const notes = [];
  const load = { ...(s.matchLoad || {}) };
  shopList.forEach((shop, i) => {
    if (!shop || sentTo.includes(shop.id)) return;
    sentTo.push(shop.id);
    const id = `${Date.now()}-${i}-${shop.id}`;
    items.push({
      id,
      status: 'open',
      ago: 'just now',
      shopId: shop.id,
      shop: shop.name,
      car: draft.vehicle,
      job: Array.isArray(draft.issues) ? draft.issues.join(', ') : draft.issues,
      note: draft.describe,
      mode: draft.mode,
      when: draft.when,
      slot: draft.slot,
      zip: draft.zip,
      photos: draft.photos || [],
      ownerName: s.owner?.name || 'Owner',
      address: draft.mode === 'shop' ? 'Drop off at the shop' : (s.owner?.home || ''),
      phone: s.owner?.phone || '',
      median: shop.price || 240,
      distance: `${shop.distance} mi`,
    });
    notes.push({
      id: `n-${id}`,
      shopId: shop.id,
      kind: 'request',
      title: 'New request',
      body: `${draft.vehicle} · ${Array.isArray(draft.issues) ? draft.issues.join(', ') : draft.issues}`,
      to: `/dashboard/request/${id}`,
      read: false,
      at: Date.now(),
    });
    load[shop.id] = { sent: (load[shop.id]?.sent || 0) + 1, lastAt: Date.now() };
  });
  return {
    ...s,
    requestDraft: { ...draft, sentTo },
    ownerRequests: [...items, ...s.ownerRequests],
    dashboard: { ...s.dashboard, queue: [...items, ...s.dashboard.queue] },
    notifications: [...notes, ...(s.notifications || [])],
    matchLoad: load,
  };
}

const Ctx = React.createContext(null);

export function StoreProvider({ children }) {
  const demo=useDemo();
  const [state, setState] = React.useState(()=>demo.state.reference||defaults());
  const initial=React.useRef(true);
  const latest=React.useRef(demo);latest.current=demo;
  React.useEffect(()=>{
    if(initial.current){initial.current=false;return;}
    let cancelled=false;
    const timer=setTimeout(async()=>{
      while(latest.current.busy&&!cancelled)await new Promise(r=>setTimeout(r,100));
      if(!cancelled)await latest.current.act('reference',{snapshot:state});
    },500);
    return ()=>{cancelled=true;clearTimeout(timer);};
  },[state]);

  const patch = (fn) => setState((s) => fn(s));

  const api = {
    state,
    session: state.session || { role: 'guest' },
    requestDraft: state.requestDraft,
    drafts: state.drafts || [],
    matchLoad: state.matchLoad || {},
    ownerRequests: state.ownerRequests || [],
    bookings: state.bookings || [],
    lastBooking: state.lastBooking || null,
    messages: state.messages || [],
    blocked: state.blocked || [],
    accounts: state.accounts || [],
    shops: state.shops?.length ? state.shops : directory,
    compareIds: state.compareIds || [],
    site: state.draft && state.preview ? state.draft : state.site,
    draft: state.draft || state.site,
    preview: !!state.preview,

    setDraft(partial) {
      patch((s) => ({ ...s, draft: { ...(s.draft || s.site), ...partial } }));
    },
    setPageCopy(pageId, key, value) {
      const HOME = { headline: 1, subhead: 1, primaryBtn: 1, secondaryBtn: 1 };
      const GLOBAL = { footer: 1, quoteDisclaimer: 1, paymentNote: 1 };
      patch((s) => {
        const draft = { ...(s.draft || s.site) };
        draft.pages = mergePages(DEFAULT_PAGES, draft.pages);
        draft.pages[pageId] = { ...(draft.pages[pageId] || {}), [key]: value };
        if (pageId === 'home' && HOME[key]) draft[key] = value;
        if (GLOBAL[key]) draft[key] = value;
        return { ...s, draft };
      });
    },
    publish() {
      patch((s) => {
        const next = s.draft || s.site;
        return {
          ...s,
          site: { ...next, pages: mergePages(DEFAULT_PAGES, next.pages) },
          draft: null,
          preview: false,
          publishLog: [{
            at: Date.now(), by: 'marcus@tovant.com', note: 'Published from admin', snapshot: next,
          }, ...s.publishLog].slice(0, 40),
        };
      });
    },
    revertPublish(at) {
      patch((s) => {
        const row = s.publishLog.find((r) => r.at === at && r.snapshot);
        if (!row) return s;
        return {
          ...s,
          site: row.snapshot,
          draft: null,
          preview: false,
          publishLog: [{ at: Date.now(), by: 'marcus@tovant.com', note: 'Reverted to earlier publish', snapshot: row.snapshot }, ...s.publishLog].slice(0, 40),
        };
      });
    },
    setPreview(on) {
      patch((s) => ({ ...s, preview: on, draft: s.draft || s.site }));
    },
    discardDraft() {
      patch((s) => ({ ...s, draft: null, preview: false }));
    },

    passRequest(id, reason) {
      patch((s) => ({
        ...s,
        dashboard: { ...s.dashboard, queue: s.dashboard.queue.filter((r) => r.id !== id) },
        ownerRequests: (s.ownerRequests || []).map((r) => (r.id === id ? { ...r, status: 'passed', passReason: reason || '' } : r)),
        notifications: (s.notifications || []).map((n) => (
          String(n.to || '').includes(String(id)) ? { ...n, read: true } : n
        )),
      }));
    },
    sendQuote(id, price) {
      patch((s) => {
        const row = s.dashboard.queue.find((r) => r.id === id);
        if (!row || !price) return s;
        const quoted = { ...row, price: Number(price), sentAt: Date.now(), status: 'quoted' };
        return {
          ...s,
          dashboard: {
            ...s.dashboard,
            queue: s.dashboard.queue.filter((r) => r.id !== id),
            sentQuotes: [quoted, ...s.dashboard.sentQuotes],
          },
          ownerRequests: (s.ownerRequests || []).map((r) => (
            r.id === id ? { ...r, price: Number(price), status: 'quoted', quotedAt: Date.now() } : r
          )),
          notifications: (s.notifications || []).map((n) => (
            String(n.to || '').includes(String(id)) ? { ...n, read: true } : n
          )),
        };
      });
    },
    setCapacity(capacity) {
      patch((s) => ({ ...s, dashboard: { ...s.dashboard, capacity: { ...s.dashboard.capacity, ...capacity } } }));
    },
    toggleHold(date, window) {
      patch((s) => {
        const holds = s.dashboard.holds || [];
        const next = holds.some((h) => h.date === date && h.window === window)
          ? holds.filter((h) => !(h.date === date && h.window === window))
          : [...holds, { id: `h-${Date.now()}`, date, window }];
        return { ...s, dashboard: { ...s.dashboard, holds: next } };
      });
    },
    setRates(rates) {
      patch((s) => ({ ...s, dashboard: { ...s.dashboard, rates } }));
    },
    setAutoQuote(autoQuote) {
      patch((s) => ({ ...s, dashboard: { ...s.dashboard, autoQuote } }));
    },
    advanceJob(id) {
      const order = ['scheduled', 'in_progress', 'ready', 'completed'];
      patch((s) => ({
        ...s,
        dashboard: {
          ...s.dashboard,
          jobs: s.dashboard.jobs.map((j) => {
            if (j.id !== id) return j;
            const i = order.indexOf(j.status);
            return { ...j, status: order[Math.min(i + 1, order.length - 1)] };
          }),
        },
      }));
    },
    bookRequest(id, extras = {}) {
      let booking = null;
      patch((s) => {
        const row = (s.ownerRequests || []).find((r) => r.id === id);
        if (!row) return s;
        booking = {
          id: `b-${Date.now()}`,
          shop: row.shop,
          shopId: row.shopId,
          vehicle: row.car,
          job: row.job,
          slot: extras.slot || row.when || 'TBD',
          mode: (row.mode || 'mobile').toUpperCase() === 'SHOP' ? 'DROP OFF' : 'MOBILE',
          price: row.price,
        };
        return {
          ...s,
          ownerRequests: s.ownerRequests.map((r) => (r.id === id ? { ...r, status: 'booked' } : r)),
          bookings: [booking, ...s.bookings],
          lastBooking: booking,
          dashboard: {
            ...s.dashboard,
            jobs: [
              { id: `job-${Date.now()}`, time: booking.slot, car: booking.vehicle, job: booking.job, status: 'scheduled', mode: booking.mode, date: extras.date || toISODate(new Date()), window: windowFromSlot(booking.slot) },
              ...s.dashboard.jobs,
            ],
          },
        };
      });
      return booking;
    },
    login(account) {
      patch((s) => {
        const shop = account.shopId ? (s.shops || []).find((p) => p.id === account.shopId) : null;
        const how = shop?.both
          ? 'Both, depending on the job'
          : shop?.mode === 'Comes to you'
            ? 'Mobile van, I come to the customer'
            : shop
              ? 'Drop off at the shop'
              : s.provider.how;
        return {
          ...s,
          session: {
            role: account.role,
            email: account.email,
            name: account.name,
            shopId: account.shopId || '',
            shop: account.shop || '',
            photo: account.role === 'owner' ? (s.owner.photo || '') : (s.provider.photo || ''),
          },
          dashboard: account.shop ? { ...s.dashboard, shop: account.shop } : s.dashboard,
          provider: shop
            ? { ...s.provider, name: shop.name, trades: issuesForShop(shop), how, email: account.email }
            : s.provider,
          owner: account.role === 'owner'
            ? { ...s.owner, name: account.name, email: account.email }
            : s.owner,
        };
      });
    },
    logout() {
      patch((s) => ({ ...s, session: { role: 'guest', email: '', name: '', shopId: '', photo: '' } }));
    },
    registerOwner(fields) {
      let result = { ok: true };
      const e = String(fields.email).trim().toLowerCase();
      patch((s) => {
        const existing = (s.accounts || []).find((a) => a.email === e);
        if (existing) {
          if (existing.password === fields.password) {
            result = { ok: true };
            return { ...s, session: { role: 'owner', email: existing.email, name: existing.name, shopId: '' } };
          }
          result = { ok: false, error: 'That email already has an account. Sign in instead.' };
          return s;
        }
        if (emailTaken(e, s.accounts || [])) {
          result = { ok: false, error: 'That email already has an account. Sign in instead.' };
          return s;
        }
        const account = {
          role: 'owner',
          name: fields.name.trim(),
          email: e,
          password: fields.password,
        };
        const vehicle = fields.vehicle?.trim();
        return {
          ...s,
          accounts: [...(s.accounts || []), account],
          session: { role: 'owner', email: account.email, name: account.name, shopId: '' },
          owner: {
            ...s.owner,
            name: account.name,
            email: account.email,
            phone: fields.phone || s.owner.phone,
            home: fields.zip ? `${fields.zip}` : s.owner.home,
            vehicles: vehicle
              ? [[vehicle, `MN · ${fields.zip || '55407'}`, 'Mileage later', true], ...(s.owner.vehicles || []).map((v) => [v[0], v[1], v[2], false])]
              : s.owner.vehicles,
          },
        };
      });
      return result;
    },
    registerProvider(fields) {
      let result = { ok: true };
      const e = String(fields.email).trim().toLowerCase();
      patch((s) => {
        const shop = fields.shop.trim();
        const shopId = shopSlug(shop);
        const existing = (s.accounts || []).find((a) => a.email === e);
        if (existing && existing.password !== fields.password && (s.session?.email || '').toLowerCase() !== e) {
          result = { ok: false, error: 'That email already has an account. Sign in instead.' };
          return s;
        }
        if (!existing && emailTaken(e, s.accounts || []) && (s.session?.email || '').toLowerCase() !== e) {
          result = { ok: false, error: 'That email already has an account. Sign in instead.' };
          return s;
        }
        const account = {
          role: 'provider',
          name: fields.name.trim(),
          email: e,
          password: fields.password,
          shop,
          shopId,
          pending: true,
        };
        const now = Date.now();
        const creds = [
          { id: `v-${now}-id`, shop, credential: 'government_id', detail: `${fields.name.trim()} · Minnesota DL`, state: 'submitted', submitted: 'just now' },
          { id: `v-${now}-bg`, shop, credential: 'background_check', detail: 'FCRA consent recorded', state: 'submitted', submitted: 'just now' },
          { id: `v-${now}-gl`, shop, credential: 'general_liability', detail: fields.gl || '$1M general liability', state: 'submitted', submitted: 'just now' },
        ];
        const accounts = existing
          ? (s.accounts || []).map((a) => (a.email === e ? { ...a, ...account } : a))
          : [...(s.accounts || []), account];
        return {
          ...s,
          accounts,
          session: { role: 'provider', email: account.email, name: account.name, shopId, shop },
          dashboard: { ...s.dashboard, shop },
          provider: {
            ...s.provider,
            name: shop,
            owner: fields.name.trim(),
            email: account.email,
            phone: fields.phone || s.provider.phone,
            about: fields.about || s.provider.about,
            how: fields.how || s.provider.how,
            radius: fields.radius || s.provider.radius,
            trades: fields.trades?.length ? fields.trades : s.provider.trades,
          },
          verifyQueue: existing ? s.verifyQueue : [...creds, ...(s.verifyQueue || [])],
          shops: (s.shops || directory).some((p) => p.id === shopId)
            ? s.shops
            : [...(s.shops || directory), shopFromSignup(fields, shopId)],
        };
      });
      return result;
    },
    sendMessage(shopId, shopName, body, from = 'owner', peer = '') {
      if ((state.blocked || []).includes(shopId)) return { ok: false, error: 'This conversation is blocked. Unblock it in Privacy to write again.' };
      const line = { from, body, at: Date.now() };
      patch((s) => {
        const threads = s.messages || [];
        const existing = threads.find((t) => t.id === shopId);
        if (!existing) {
          return {
            ...s,
            messages: [{
              id: shopId, shopId, shop: shopName, peer: peer || (from === 'owner' ? s.owner?.name : s.provider?.owner),
              unread: from === 'owner' ? 'shop' : 'owner',
              lines: [line],
            }, ...threads],
          };
        }
        return {
          ...s,
          messages: threads.map((t) => (t.id === shopId
            ? { ...t, unread: from === 'owner' ? 'shop' : 'owner', lines: [...t.lines, line] }
            : t)),
        };
      });
      return { ok: true };
    },
    markThreadRead(id) {
      patch((s) => ({
        ...s,
        messages: (s.messages || []).map((t) => (t.id === id ? { ...t, unread: '' } : t)),
      }));
    },
    clearScratchDraft() {
      patch((s) => {
        const d = s.requestDraft;
        if (d?.sentTo?.length || d?.saved) return s;
        return { ...s, requestDraft: null };
      });
    },
    deleteAccount() {
      patch((s) => {
        const email = (s.session?.email || '').toLowerCase();
        const role = s.session?.role;
        const shopId = s.session?.shopId;
        return {
          ...s,
          accounts: (s.accounts || []).filter((a) => a.email !== email),
          session: { role: 'guest', email: '', name: '', shopId: '', photo: '' },
          owner: role === 'owner' ? { ...s.owner, name: '', email: '', phone: '', photo: '', vehicles: [], cards: [], notes: '' } : s.owner,
          drafts: role === 'owner' ? [] : s.drafts,
          requestDraft: role === 'owner' ? null : s.requestDraft,
          messages: (s.messages || []).filter((t) => (role === 'provider' ? t.shopId !== shopId : t.peer !== s.owner?.name)),
          shops: role === 'provider' ? (s.shops || []).filter((p) => p.id !== shopId) : s.shops,
          blocked: [],
        };
      });
    },
    blockUser(id) {
      patch((s) => ({ ...s, blocked: [...new Set([...(s.blocked || []), id])] }));
    },
    unblockUser(id) {
      patch((s) => ({ ...s, blocked: (s.blocked || []).filter((x) => x !== id) }));
    },
    saveDraft(draft) {
      patch((s) => ({
        ...s,
        requestDraft: {
          vehicle: '2021 Audi Q5 · 41,208 mi',
          zip: '55407',
          sentTo: [],
          ...(s.requestDraft || {}),
          ...draft,
        },
      }));
    },
    saveNamedDraft(draft) {
      const id = draft.id || `d-${Date.now()}`;
      const row = {
        id,
        savedAt: Date.now(),
        title: Array.isArray(draft.issues) ? draft.issues.join(', ') : (draft.issues || 'Untitled job'),
        saved: true,
        ...draft,
      };
      patch((s) => {
        const list = s.drafts || [];
        const exists = list.some((d) => d.id === id);
        return {
          ...s,
          requestDraft: { ...(s.requestDraft || {}), ...row },
          drafts: exists ? list.map((d) => (d.id === id ? { ...d, ...row } : d)) : [row, ...list],
        };
      });
      return id;
    },
    loadDraft(id) {
      patch((s) => {
        const row = (s.drafts || []).find((d) => d.id === id);
        if (!row) return s;
        return { ...s, requestDraft: { ...row, sentTo: row.sentTo || [] } };
      });
    },
    deleteDraft(id) {
      patch((s) => ({ ...s, drafts: (s.drafts || []).filter((d) => d.id !== id) }));
    },
    markNotificationsRead(shopId) {
      patch((s) => ({
        ...s,
        notifications: (s.notifications || []).map((n) => (
          !shopId || n.shopId === shopId ? { ...n, read: true } : n
        )),
      }));
    },
    unreadCount() {
      const shopId = state.session?.shopId;
      return (state.notifications || []).filter((n) => !n.read && (!shopId || n.shopId === shopId)).length;
    },
    sendToShop(shop, extras = {}) {
      patch((s) => applySends(s, [shop], extras));
    },
    sendToShops(shopList, extras = {}) {
      patch((s) => applySends(s, shopList, extras));
    },
    setOwner(partial) {
      patch((s) => ({
        ...s,
        owner: { ...s.owner, ...partial },
        session: partial.photo !== undefined ? { ...s.session, photo: partial.photo } : s.session,
      }));
    },
    setProvider(partial) {
      patch((s) => {
        const provider = { ...s.provider, ...partial };
        const shopId = s.session?.shopId;
        const services = (provider.trades || []).filter((t) => t && t !== 'Not sure yet');
        const mapped = tradesFromIssues(services);
        const how = provider.how || '';
        const both = /both/i.test(how);
        const mobile = /mobile|come to/i.test(how);
        return {
          ...s,
          provider,
          session: partial.photo !== undefined ? { ...s.session, photo: partial.photo } : s.session,
          shops: shopId
            ? (s.shops || []).map((p) => (p.id !== shopId ? p : {
              ...p,
              name: provider.name || p.name,
              services,
              trades: mapped.length ? mapped : p.trades,
              both,
              mode: both ? p.mode : mobile ? 'Comes to you' : /drop/i.test(how) ? 'Drop off' : p.mode,
            }))
            : s.shops,
        };
      });
    },
    decideCredential(id, outcome, reason) {
      patch((s) => {
        const row = (s.verifyQueue || []).find((v) => v.id === id);
        return {
          ...s,
          verifyQueue: s.verifyQueue.map((v) => (v.id === id ? { ...v, state: outcome, reason, reviewedAt: Date.now() } : v)),
          shops: outcome === 'verified' && row
            ? (s.shops || directory).map((p) => (p.name === row.shop ? { ...p, vetted: true, pending: false, badge: p.mode?.toUpperCase() || 'VETTED' } : p))
            : s.shops,
        };
      });
    },
    toggleCompare(id) {
      patch((s) => {
        const ids = s.compareIds || [];
        return { ...s, compareIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id].slice(-3) };
      });
    },
    clearCompare() {
      patch((s) => ({ ...s, compareIds: [] }));
    },
    addTrade(label) {
      patch((s) => {
        const draft = { ...(s.draft || s.site) };
        draft.tradesOnHome = { ...draft.tradesOnHome, [label]: true };
        return { ...s, draft };
      });
    },
    setTradeOnHome(label, on) {
      patch((s) => {
        const draft = { ...(s.draft || s.site) };
        draft.tradesOnHome = { ...draft.tradesOnHome, [label]: on };
        return { ...s, draft };
      });
    },
    unpublishedCount() {
      const d = state.draft;
      if (!d) return 0;
      return Object.keys(d).filter((k) => JSON.stringify(d[k]) !== JSON.stringify(state.site[k])).length;
    },
  };

  const bridged=useBridge(api);
  return <Ctx.Provider value={bridged}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useStore requires StoreProvider');
  return ctx;
}
