export const trades = [
  ['Mechanics and mobile techs', 184], ['Detail and ceramic coating', 96],
  ['Tires, wheels and alignment', 71], ['Brakes and suspension', 112],
  ['Body work and paint', 38], ['Window tint and wraps', 44],
  ['Audio and electronics', 29], ['Glass and windshield', 33],
  ['EV and hybrid service', 21], ['Upholstery and interior', 18],
  ['Performance and tuning', 26], ['Inspection and pre-purchase', 52],
]

export const popularJobs = [
  ['Mobile oil change', 'FROM $89 · 45 MIN'],
  ['Detail and ceramic', 'FROM $180 · 3 HR'],
  ['Brakes and tires', 'FROM $310 · SHOP'],
]

export const matchSteps = ['Describe the job', 'Match with pros', 'Compare prices', 'Book a time']

export const openRequests = [
  {
    id: 1, car: '2021 Audi Q5 · 41,208 mi', job: 'Oil change', distance: '3.4 mi', ago: '7 min ago', median: 102,
    note: 'Slight rattle on cold starts, goes away after a minute. Due for an oil change either way.',
    mode: 'mobile', when: 'Morning · 9 AM', zip: '55407', ownerName: 'Mara Kessler',
    address: '3521 38th Ave S, Minneapolis 55406', phone: '(612) 555 0148',
  },
  {
    id: 2, car: '2019 Ford F-150 · 78,400 mi', job: 'Front brakes', distance: '2.0 mi', ago: '22 min ago', median: 338,
    note: 'Soft pedal after a long highway run. No grinding. Wants the job at the house Saturday if it fits.',
    mode: 'mobile', when: 'Afternoon · 2 PM', zip: '55406', ownerName: 'Theo Ruiz',
    address: '3812 28th Ave S, Minneapolis 55406', phone: '(612) 555 0194',
  },
  {
    id: 3, car: '2020 Honda CR-V · 52,110 mi', job: 'Check engine light', distance: '5.1 mi', ago: '41 min ago', median: 135,
    note: 'Light came on after a cold start yesterday. Car still drives. Photos of the dash are attached.',
    mode: 'shop', when: 'Mid-day · 12 PM', zip: '55408', ownerName: 'Priya Shah',
    address: 'Drop off at the shop', phone: '(651) 555 0110',
  },
  {
    id: 4, car: '2023 Tesla Model 3 · 18,900 mi', job: 'Four tires', distance: '1.8 mi', ago: '1 hr ago', median: 688,
    note: 'Factory tires at 4/32. Prefers a quiet touring tire. Loaner if the car stays overnight.',
    mode: 'shop', when: 'Morning · 8 AM', zip: '55403', ownerName: 'Owen Kole',
    address: 'Drop off at the shop', phone: '(612) 555 0177',
  },
]

export const todaySlots = [
  ['8:00', '2018 Subaru Outback', 'Oil and filter'],
  ['9:30', '2021 Audi Q5', 'Brake fluid'],
  ['11:00', '2016 Toyota Tacoma', 'Diagnostics'],
  ['1:30', '2022 Kia Telluride', 'Four tires'],
]

export const revenueByMonth = [42, 58, 51, 66, 74, 61, 88, 79, 92, 84, 96, 71]

export const communityRowA = [
  ['Dana W. · Q5 · ceramic coat', 320], ['Theo R. · F-150 · lift and tires', 260],
  ['Priya S. · Model 3 · driveway service', 300], ['Marcus H. · shop day, two vans out', 240],
  ['Lena B. · Bronco · tint and wrap', 280], ['Owen K. · 911 · brake refresh', 260],
]
export const communityRowB = [
  ['Sam T. · Tacoma · alignment', 280], ['Iris N. · Civic · glass swap', 240],
  ['Cole D. · Charger · audio build', 320], ['Ava M. · CX-5 · detail before resale', 260],
  ['Nate P. · Sprinter · fleet oil day', 300], ['Rae F. · Miata · suspension', 240],
]

export const vehicles = [
  ['2021 Audi Q5', 'MN · KLM 4471', '41,208 mi', true],
  ['2016 Toyota Tacoma', 'MN · BRT 9902', '128,540 mi', false],
]

export const cards = [
  ['Visa ending 4412', 'EXPIRES 07/28', true],
  ['Amex ending 1009', 'EXPIRES 11/27', false],
]

export const ownerNotifications = [
  ['New quotes', 'Text and push when a matched pro sends a price.', true],
  ['Arrival updates', 'When a mobile tech leaves the shop and when they arrive.', true],
  ['Extra work approvals', 'Photo, price and a yes or no before anything proceeds.', true],
  ['Maintenance reminders', 'Based on mileage and the factory interval for each vehicle.', true],
  ['Deals and offers from pros', 'Occasional offers from shops you have used.', false],
]

export const laborRates = [
  ['Standard labor, per hour', '$120', 'BILLED IN 15 MINUTE INCREMENTS · AREA MEDIAN $118'],
  ['Diagnostic labor, flat', '$120', 'CREDITED BACK IF THE REPAIR IS BOOKED · MEDIAN $135'],
  ['Trip charge inside the ring', 'None', 'TWIN CITIES ZIP CODES, NO TRIP FEE'],
]

export const week = [
  ['MON', '8:00 AM to 5:00 PM', true], ['TUE', '8:00 AM to 5:00 PM', true],
  ['WED', '8:00 AM to 5:00 PM', true], ['THU', '8:00 AM to 5:00 PM', true],
  ['FRI', '8:00 AM to 2:00 PM', true], ['SAT', '9:00 AM to 1:00 PM', true],
  ['SUN', 'Closed', false],
]

export const adminHeroBlocks = [
  ['HEADLINE', 'Every automotive expert, one place.', 'DRAFT', true],
  ['SUBHEAD', 'Mechanics, detailers, tint and audio installers, body shops, tire and glass techs. Everyone who touches your car, in one place. Ask once and vetted local pros come back with a written price and what it covers.', 'PUBLISHED', false],
]

export const adminGlobalText = [
  ['FOOTER TAGLINE', 'Minneapolis–Saint Paul · hello@tovant.com', 'PUBLISHED'],
  ['QUOTE DISCLAIMER', 'Quotes are held for 48 hours. Work beyond the quote needs your approval first.', 'PUBLISHED'],
  ['PAYMENT NOTE', 'Nothing is charged until the work is done.', 'PUBLISHED'],
]

export const adminTradeRows = [
  ['Mechanics and mobile techs', '184', true, '1'],
  ['Detail and ceramic coating', '96', true, '2'],
  ['Tires, wheels and alignment', '71', true, '3'],
  ['Body work and paint', '38', true, '4'],
  ['Performance and tuning', '26', false, '11'],
]
