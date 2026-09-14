export const DEMO_ACCOUNTS = [
  {
    role: 'owner',
    name: 'Mara Kessler',
    email: 'mara@tovant.com',
    password: 'owner1234',
    sub: 'Car owner in South Minneapolis',
  },
  {
    role: 'provider',
    name: 'Marcus Harlan',
    email: 'marcus@ridgeline.com',
    password: 'shop1234',
    shopId: 'ridgeline',
    shop: 'Ridgeline Auto Care',
    sub: 'Shop owner, Lyn-Lake',
  },
  {
    role: 'admin',
    name: 'Sam Ortega',
    email: 'admin@tovant.com',
    password: 'admin1234',
    sub: 'Tovant staff',
  },
  {
    role: 'provider',
    name: 'Marcus Harlan',
    email: 'book@harlanmobile.com',
    password: 'shop1234',
    shopId: 'harlan',
    shop: 'Harlan Mobile Service',
    sub: 'Mobile van, Longfellow',
  },
];

function allAccounts(extras = []) {
  return [...DEMO_ACCOUNTS, ...extras];
}

export async function findAccount(email, password, extras = []) {
  const e = String(email || '').trim().toLowerCase();
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('tovant-demo:'+password)))).map(v=>v.toString(16).padStart(2,'0')).join('');
  const registered = extras.find((a) => a.email.toLowerCase() === e && (a.password === password||a.passwordHash===hash));
  if (registered) return registered;
  return DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === e && a.password === password) || null;
}

export function emailTaken(email, extras = []) {
  const e = String(email || '').trim().toLowerCase();
  return allAccounts(extras).some((a) => a.email.toLowerCase() === e);
}
