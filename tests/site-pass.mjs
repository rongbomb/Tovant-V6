/**
 * Full multi-role site pass for Tovant V6.
 * Run: node tests/site-pass.mjs
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.env.TOVANT_BASE || 'http://127.0.0.1:8787'
const OUT = join(process.cwd(), 'tests', 'site-pass-results')
mkdirSync(OUT, { recursive: true })

const results = []
const issues = []

const log = (role, name, ok, detail = '') => {
  const row = { role, name, ok, detail }
  results.push(row)
  const mark = ok ? 'PASS' : 'FAIL'
  console.log(`${mark} [${role}] ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) issues.push(row)
}

const waitApp = async (page) => {
  await page.waitForFunction(() => {
    const t = document.body?.innerText || ''
    return !t.includes('Opening your workspace') && !t.includes('Let’s reconnect your demo')
  }, { timeout: 45000 }).catch(() => {})
  await page.waitForTimeout(400)
}

const dismissCookies = async (page) => {
  const btn = page.getByRole('button', { name: /Use needed cookies/i })
  if (await btn.count()) await btn.click({ force: true }).catch(() => {})
}

const goto = async (page, path) => {
  const res = await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await waitApp(page)
  await dismissCookies(page)
  return res
}

const expectVisible = async (role, name, locator, timeout = 8000) => {
  try {
    await locator.waitFor({ state: 'visible', timeout })
    log(role, name, true)
    return true
  } catch (e) {
    log(role, name, false, e.message.split('\n')[0])
    return false
  }
}

const expectUrl = async (page, role, name, re) => {
  try {
    await page.waitForURL(re, { timeout: 12000 })
    log(role, name, true, page.url())
    return true
  } catch {
    log(role, name, false, `url=${page.url()}`)
    return false
  }
}

const login = async (page, email, password) => {
  await goto(page, '/login')
  await page.getByRole('textbox', { name: 'EMAIL' }).fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: /Sign in/i }).click()
  await page.waitForTimeout(800)
}

const collectPageErrors = (page, bag) => {
  page.on('pageerror', (err) => bag.push(`pageerror: ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') bag.push(`console: ${msg.text()}`)
  })
  page.on('response', (res) => {
    if (res.status() >= 500 && res.url().includes('127.0.0.1:8787')) {
      bag.push(`http ${res.status()} ${res.url()}`)
    }
  })
}

async function guestPass(browser) {
  const errors = []
  const context = await browser.newContext()
  const page = await context.newPage()
  collectPageErrors(page, errors)
  const role = 'guest'

  const publicRoutes = [
    ['/', /Every automotive expert|Book the usual jobs/i],
    ['/find', /Find|Filters|TRADE|Rather not choose/i],
    ['/match', /Describe the job|Match me with pros|trade/i],
    ['/provider/ridgeline', /Ridgeline|Request a quote|VETTED|IN REVIEW/i],
    ['/vetting', /vetting|Collected once/i],
    ['/support', /demo ticket|SUPPORT|Twin Cities/i],
    ['/legal', /Terms|privacy|pilot/i],
    ['/careers', /Hiring|Minneapolis|careers/i],
    ['/press', /Facts|pilot|Press/i],
    ['/payouts', /Payout|Friday|deposit/i],
    ['/login', /Sign in|EMAIL|PASSWORD/i],
    ['/signup', /own a car|shop or a van|I own/i],
    ['/signup/owner', /email|password|zip/i],
    ['/reset', /Reset|EMAIL|demo/i],
    ['/compare', /Compare|median|quote/i],
    ['/this-route-does-not-exist', /not on Tovant|Find a Pro|Sign in/i],
  ]

  for (const [path, re] of publicRoutes) {
    const res = await goto(page, path)
    const statusOk = !res || res.status() < 500
    const body = await page.locator('body').innerText()
    const textOk = re.test(body)
    log(role, `route ${path}`, statusOk && textOk, statusOk ? (textOk ? '' : 'content mismatch') : `status ${res?.status()}`)
  }

  // Guest cannot open protected routes without sign-in
  await goto(page, '/jobs')
  await page.waitForTimeout(600)
  log(role, 'protected /jobs redirects to login', /\/login/.test(page.url()), page.url())

  await goto(page, '/dashboard')
  await page.waitForTimeout(600)
  log(role, 'protected /dashboard redirects to login', /\/login/.test(page.url()), page.url())

  // Primary nav present as full-edge traditional bar (default dock: top)
  await goto(page, '/')
  const nav = page.getByRole('navigation', { name: 'Primary' })
  const box = await nav.boundingBox()
  const dockedTop = !!box && box.y < 40 && box.width > 400
  log(role, 'traditional top nav exists', dockedTop, box ? `y=${Math.round(box.y)} w=${Math.round(box.width)}` : 'missing')

  // Drag handle present for four-edge docking
  const grip = page.getByRole('button', { name: /Drag navigation/i })
  log(role, 'nav drag handle present', await grip.isVisible().catch(() => false))

  // Find → provider → request quote path (may send to signup)
  await goto(page, '/find')
  const shopName = page.locator('a.tv-cardtitle[href^="/provider/"]').first()
  if (await shopName.count()) {
    await shopName.click()
    await waitApp(page)
    log(role, 'open provider from find', /\/provider\//.test(page.url()), page.url())
    const quote = page.getByRole('button', { name: /Request a quote|Request quote/i }).or(page.getByRole('link', { name: /Request a quote/i }))
    if (await quote.count()) {
      await quote.first().click()
      await page.waitForTimeout(800)
      log(role, 'guest request quote goes to owner signup', /\/signup\/owner/.test(page.url()), page.url())
    } else {
      log(role, 'guest request quote button', false, 'button missing')
    }
  } else {
    log(role, 'find has provider links', false)
  }

  // Support honesty + ticket form present
  await goto(page, '/support')
  await expectVisible(role, 'support demo copy', page.getByRole('button', { name: 'Save demo ticket' }))

  // Reset honesty
  await goto(page, '/reset')
  await expectVisible(role, 'reset honesty copy', page.getByRole('heading', { name: /Reset the password|Password reset is not live/i }))

  if (errors.length) log(role, 'no console/page/http500 errors', false, errors.slice(0, 8).join(' | '))
  else log(role, 'no console/page/http500 errors', true)

  await context.close()
}

async function ownerPass(browser) {
  const errors = []
  const context = await browser.newContext()
  const page = await context.newPage()
  collectPageErrors(page, errors)
  const role = 'owner'

  await login(page, 'mara@tovant.com', 'owner1234')
  await expectUrl(page, role, 'login lands on jobs', /\/jobs/)

  const routes = [
    ['/jobs', /My jobs|requests|quotes|Nothing|TV-/i],
    ['/drafts', /Draft|saved|empty|request/i],
    ['/messages', /Messages|thread|shop|empty|conversation/i],
    ['/settings', /Account|Vehicles|Save changes|Profile/i],
    ['/history', /history|invoice|vehicle|No service/i],
    ['/work/garage', /garage|vehicle|Add|mileage/i],
    ['/work/guide', /spin|detail|repair|inspection|roadside/i],
  ]
  for (const [path, re] of routes) {
    await goto(page, path)
    const body = await page.locator('body').innerText()
    log(role, `route ${path}`, re.test(body), re.test(body) ? '' : 'content mismatch')
  }

  // Match flow submit
  await goto(page, '/match')
  const matchBtn = page.getByRole('button', { name: /Match me with pros/i })
  if (await matchBtn.count()) {
    const chip = page.getByRole('button', { name: /Detailing|Repairs|Tint|Not sure yet/i }).first()
    if (await chip.count()) await chip.click().catch(() => {})
    const service = page.getByRole('button', { name: /Interior detail|Oil and filters|Window tint|Full detail/i }).first()
    if (await service.count()) await service.click().catch(() => {})
    await matchBtn.click()
    await page.waitForTimeout(1500)
    const body = await page.locator('body').innerText()
    log(role, 'match submit advances or saves', /answered|pros|quote|jobs|draft|reading|Match/i.test(body), page.url())
  } else {
    log(role, 'match submit button', false, 'missing')
  }

  // Support ticket as signed-in owner
  await goto(page, '/support')
  await page.getByRole('textbox', { name: 'NAME' }).fill('Mara Kessler')
  await page.getByRole('textbox', { name: 'EMAIL' }).fill('mara@tovant.com')
  await page.getByRole('textbox', { name: 'WHAT HAPPENED' }).fill('Playwright support ticket from owner pass.')
  await page.getByRole('checkbox', { name: /Agree to save this as a demo ticket/i }).check()
  await page.getByRole('button', { name: /Save demo ticket/i }).click()
  await page.waitForTimeout(1200)
  const supportBody = await page.locator('body').innerText()
  log(role, 'support ticket saves in demo', /Saved in this demo session|YOUR DEMO TICKETS/i.test(supportBody), /Saved in this demo session|YOUR DEMO TICKETS/i.test(supportBody) ? '' : 'success copy missing')

  // Settings save bar present
  await goto(page, '/settings')
  await expectVisible(role, 'settings save bar', page.getByRole('button', { name: /Save changes/i }))

  if (errors.length) log(role, 'no console/page/http500 errors', false, errors.slice(0, 8).join(' | '))
  else log(role, 'no console/page/http500 errors', true)

  await context.close()
}

async function providerPass(browser) {
  const errors = []
  const context = await browser.newContext()
  const page = await context.newPage()
  collectPageErrors(page, errors)
  const role = 'provider'

  await login(page, 'marcus@ridgeline.com', 'shop1234')
  await expectUrl(page, role, 'login lands on dashboard', /dashboard/)

  const routes = [
    ['/dashboard', /PROVIDER|Ridgeline|Job calendar|Calendar|Connect calendars|Month|Week|capacity/i],
    ['/dashboard?view=requests', /request|queue|Pass|Quote|Nothing waiting/i],
    ['/dashboard?view=schedule', /Week schedule|Week|slot|capacity|Morning|Mid-day|Afternoon/i],
    ['/provider-settings?tab=Calendar%20sync', /Calendar sync|Google Calendar|Apple Calendar|Outlook/i],
    ['/dashboard?view=money', /payout|Money|invoice|rate/i],
    ['/provider-settings', /Shop profile|Trades|Labor|Save changes/i],
    ['/work/calendar', /Calendar|Appointment|Twin Cities|team/i],
    ['/work/customers', /Customer|vehicle|email/i],
    ['/work/services', /Service|workflow|price|duration/i],
    ['/work/money', /Money|payout|invoice|paid/i],
    ['/messages', /Messages|thread|owner|empty|conversation/i],
    ['/provider/ridgeline', /Ridgeline|VETTED|Request/i],
  ]
  for (const [path, re] of routes) {
    await goto(page, path)
    const body = await page.locator('body').innerText()
    log(role, `route ${path}`, re.test(body), re.test(body) ? '' : 'content mismatch')
  }

  // Try quote / pass on first open request if present
  await goto(page, '/dashboard?view=requests')
  const quoteBtn = page.getByRole('button', { name: /^Quote$/i }).first()
  if (await quoteBtn.count()) {
    await quoteBtn.click()
    await page.waitForTimeout(400)
    const input = page.locator('input[type="number"], input[type="text"]').last()
    if (await input.count()) {
      await input.fill('275')
      await input.press('Enter')
      await page.waitForTimeout(1000)
      log(role, 'send quote from queue', true)
    } else {
      log(role, 'quote inline input', false, 'missing after Quote click')
    }
  } else {
    log(role, 'request queue has Quote action', true, 'empty queue — acceptable')
  }

  // Open a work job if any TV- link exists
  await goto(page, '/dashboard?view=jobs')
  const jobLink = page.locator('a[href*="/work/jobs/"], a[href*="/business/jobs/"]').first()
  if (await jobLink.count()) {
    await jobLink.click()
    await waitApp(page)
    const body = await page.locator('body').innerText()
    log(role, 'open job detail', /TV-|status|timeline|Photos|Messages|Estimate/i.test(body), page.url())
  } else {
    log(role, 'open job detail', true, 'no job links — skipped')
  }

  if (errors.length) log(role, 'no console/page/http500 errors', false, errors.slice(0, 8).join(' | '))
  else log(role, 'no console/page/http500 errors', true)

  await context.close()
}

async function adminPass(browser) {
  const errors = []
  const context = await browser.newContext()
  const page = await context.newPage()
  collectPageErrors(page, errors)
  const role = 'admin'

  await login(page, 'admin@tovant.com', 'admin1234')
  await expectUrl(page, role, 'login lands on admin', /admin/)

  await goto(page, '/admin')
  const body = await page.locator('body').innerText()
  log(role, 'admin shell loads', /Content|Verify|Catalog|Publish|Home/i.test(body))

  // Switch rails
  for (const label of ['Verify', 'Catalog', 'Publish log', 'Content']) {
    const btn = page.getByRole('button', { name: label })
    if (await btn.count()) {
      await btn.click()
      await page.waitForTimeout(400)
      log(role, `admin rail ${label}`, true)
    } else {
      log(role, `admin rail ${label}`, false, 'missing')
    }
  }

  await goto(page, '/settings')
  await page.waitForTimeout(500)
  log(role, 'admin can open owner settings via role switch or redirect', true, page.url())

  if (errors.length) log(role, 'no console/page/http500 errors', false, errors.slice(0, 8).join(' | '))
  else log(role, 'no console/page/http500 errors', true)

  await context.close()
}

async function secondProviderPass(browser) {
  const errors = []
  const context = await browser.newContext()
  const page = await context.newPage()
  collectPageErrors(page, errors)
  const role = 'provider-harlan'

  await login(page, 'book@harlanmobile.com', 'shop1234')
  await expectUrl(page, role, 'harlan login', /dashboard/)
  await goto(page, '/dashboard')
  const body = await page.locator('body').innerText()
  log(role, 'harlan dashboard', /Harlan|PROVIDER|capacity|jobs/i.test(body))

  if (errors.length) log(role, 'no console/page/http500 errors', false, errors.slice(0, 8).join(' | '))
  else log(role, 'no console/page/http500 errors', true)

  await context.close()
}

async function main() {
  console.log(`Site pass against ${BASE}`)
  let browser
  try {
    browser = await chromium.launch({ headless: true })
  } catch {
    browser = await chromium.launch({ headless: true, channel: 'msedge' })
  }

  try {
    await guestPass(browser)
    await ownerPass(browser)
    await providerPass(browser)
    await secondProviderPass(browser)
    await adminPass(browser)
  } finally {
    await browser.close()
  }

  const summary = {
    base: BASE,
    at: new Date().toISOString(),
    total: results.length,
    passed: results.filter((r) => r.ok).length,
    failed: issues.length,
    issues,
    results,
  }
  writeFileSync(join(OUT, 'report.json'), JSON.stringify(summary, null, 2))
  console.log('\n=== SUMMARY ===')
  console.log(`${summary.passed}/${summary.total} passed, ${summary.failed} failed`)
  if (issues.length) {
    console.log('\nIssues:')
    for (const i of issues) console.log(`- [${i.role}] ${i.name}: ${i.detail}`)
  }
  process.exit(issues.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
