export type Workflow = 'appointment' | 'estimate' | 'inspection' | 'dispatch';
export type Role = 'customer' | 'provider' | 'admin';
export type Status = 'requested' | 'awaiting_approval' | 'scheduled' | 'in_progress' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
export type Service = { id: string; name: string; category: string; workflow: Workflow; price: number; duration: number };
export type Provider = { id: string; name: string; area: string; zip: string; distance: number; rating: number; reviews: number; mobile: boolean; radius: number; verified: boolean; accepting: boolean; bio: string; services: Service[]; staff: string[]; buffer: number; open: number; close: number };
export type Customer = { id: string; name: string; email: string; phone: string; providerIds?: string[] };
export type Vehicle = { id: string; customerId: string; year: string; make: string; model: string; mileage: number; vin: string; size: string };
export type Line = { description: string; quantity: number; price: number };
export type Finding = { area: string; condition: string; note: string };
export type Job = { id: string; providerId: string; customerId: string; vehicleId: string; service: Service; status: Status; date: string; time: string; staff: string; address: string; zip: string; notes: string; seller: string; destination: string; total: number; lines: Line[]; approvedAt?: string; paidAt?: string; report: Finding[]; reportPublished: boolean; photos?: {key:string;caption:string;at:string}[]; review?: { rating: number; text: string }; timeline: { at: string; text: string }[]; messages: { id: string; role: Role; text: string; at: string }[] };
export type State = { version: 6; reference?: Record<string,unknown>; providers: Provider[]; customers: Customer[]; vehicles: Vehicle[]; jobs: Job[]; favorites: {customerId:string;providerId:string}[]; tickets: { id: string; customerId: string; subject: string; text: string; status: string; reply: string }[]; blocks: { id: string; providerId: string; date: string; time: string; duration: number; staff: string }[]; drafts: { id: string; customerId:string; providerId: string; serviceId: string; notes: string; vehicleId?:string; date?:string; time?:string; staff?:string; address?:string; zip?:string; seller?:string; destination?:string }[] };
export const categories = ['All services','Mechanics & mobile','Detail & ceramic','Tires & alignment','Brakes & suspension','Body & paint','Tint & wraps','Glass','Audio & electronics','EV & hybrid','Upholstery','Performance','Inspection','Roadside & towing'];
export const workflowNames: Record<Workflow,string> = { appointment:'Instant booking', estimate:'Estimate first', inspection:'Inspection & report', dispatch:'Roadside dispatch' };
export const statusNames: Record<Status,string> = { requested:'New request', awaiting_approval:'Needs approval', scheduled:'Scheduled', in_progress:'In progress', en_route:'En route', arrived:'On site', completed:'Completed', cancelled:'Cancelled' };
export const money = (n: number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2,minimumFractionDigits:0}).format(n);
export const day = (offset = 0) => { const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()); const get=(type:string)=>parts.find(p=>p.type===type)!.value; const d=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+offset); return d.toISOString().slice(0,10); };
export const vehicleName = (v?: Vehicle) => v ? `${v.year} ${v.make} ${v.model}` : 'Vehicle';
export const uid = () => crypto.randomUUID();
export const minutes = (time: string) => { const [h,m] = time.split(':').map(Number); return h*60+m; };
export const totalLines = (lines: Line[]) => Math.round(lines.reduce((s,l)=>s+l.price*l.quantity,0)*100)/100;
export function seed(): State {
  const rows: [string,string,string,string,number,string,Workflow,number,number,boolean][] = [
    ['ridgeline','Ridgeline Auto Care','Lyn-Lake','55408',1.4,'Mechanics & mobile','estimate',120,90,false],
    ['southpaw','Southpaw Detail','Powderhorn','55407',0.7,'Detail & ceramic','appointment',180,120,false],
    ['harlan','Harlan Mobile Service','Longfellow','55406',2.3,'Mechanics & mobile','estimate',120,90,true],
    ['preflight','Preflight Inspections','Mac-Groveland','55105',5.2,'Inspection','inspection',249,120,true],
    ['eastside','Eastside Mobile Tech','Seward','55404',1.8,'Mechanics & mobile','estimate',110,90,true],
    ['rimline','Rimline Tire & Wheel','Roseville','55113',7.4,'Tires & alignment','appointment',95,60,false],
    ['cedarbrake','Cedar Brake & Suspension','Edina','55424',5.8,'Brakes & suspension','estimate',115,90,false],
    ['oakandiron','Oak & Iron Collision','Como','55108',6.2,'Body & paint','estimate',85,60,false],
    ['lumen','Lumen Tint & Wrap','Midway','55104',5.9,'Tint & wraps','estimate',150,120,false],
    ['glasshouse','Glasshouse Auto Glass','Downtown','55401',3.4,'Glass','estimate',99,90,true],
    ['ampco','Amp Co. Audio','West St. Paul','55118',8.1,'Audio & electronics','estimate',110,90,false],
    ['voltshop','Voltshop EV & Hybrid','Bloomington','55425',9.3,'EV & hybrid','estimate',140,90,false],
    ['hideandseek','Hide & Seek Upholstery','Frogtown','55103',6.7,'Upholstery','estimate',95,90,false],
    ['redline','Redline Performance','Eagan','55121',11.2,'Performance','estimate',150,120,false],
    ['washlane','Washlane Mobile Detail','North Loop','55401',3.7,'Detail & ceramic','appointment',160,120,true],
    ['vela','Vela Auto Works','Richfield','55423',5.1,'Mechanics & mobile','estimate',105,90,false],
    ['kestrel','Kestrel Auto Service','Northeast','55413',4.2,'Mechanics & mobile','estimate',115,90,false],
    ['brightline','Brightline Auto Care','Linden Hills','55410',3.2,'Mechanics & mobile','estimate',125,90,false],
    ['northstar','Northstar Roadside','Minneapolis','55407',2.1,'Roadside & towing','dispatch',89,60,true],
  ];
  const providers = rows.map(([id,name,area,zip,distance,category,workflow,price,duration,mobile],i): Provider => ({id,name,area,zip,distance,rating:[4.8,4.9,4.9,4.9,4.6][i%5],reviews:[124,94,312,86,201][i%5],mobile,radius:20,verified:true,accepting:true,buffer:mobile?30:15,open:8,close:18,staff:['Alex','Jordan'],bio:`Independent ${category.toLowerCase()} specialists serving ${area} and the Twin Cities. Clear communication, written pricing and a record of every job.`,services:[{id:`${id}-main`,name:workflow==='estimate'?'Diagnostic consultation':workflow==='inspection'?'Pre-purchase inspection':workflow==='dispatch'?'Roadside assistance':category==='Tires & alignment'?'Wheel alignment':'Complete interior & exterior detail',category,workflow,price,duration},...(category==='Detail & ceramic'?[{id:`${id}-express`,name:'Express exterior detail',category,workflow:'appointment' as Workflow,price:85,duration:60},{id:`${id}-ceramic`,name:'Ceramic coating consultation',category,workflow:'estimate' as Workflow,price:0,duration:45}]:[]),...(category==='Mechanics & mobile'?[{id:`${id}-oil`,name:'Full synthetic oil service',category,workflow:'appointment' as Workflow,price:94,duration:60}]:[])] }));
  const customers = [{id:'sam',name:'Sam Ajavon',email:'sam@example.com',phone:'612-555-0100'},{id:'maya',name:'Maya Chen',email:'maya@example.com',phone:'612-555-0101'},{id:'marcus',name:'Marcus Williams',email:'marcus@example.com',phone:'612-555-0102'}];
  const vehicles = [{id:'audi',customerId:'sam',year:'2021',make:'Audi',model:'Q5',mileage:48250,vin:'',size:'SUV'},{id:'toyota',customerId:'maya',year:'2019',make:'Toyota',model:'RAV4',mileage:68300,vin:'',size:'SUV'},{id:'ford',customerId:'marcus',year:'2020',make:'Ford',model:'F-150',mileage:73400,vin:'',size:'Truck'}];
  const makeJob = (id:string,pid:string,cid:string,vid:string,status:Status,time:string,offset:number): Job => { const p=providers.find(p=>p.id===pid)!; const service={...p.services[0]}; return {id,providerId:pid,customerId:cid,vehicleId:vid,service,status,date:day(offset),time,staff:'Alex',address:'123 Demo Avenue, Minneapolis, MN',zip:'55407',notes:pid==='ridgeline'?'Brake squeal at low speeds. Please inspect front pads and rotors.':'Please message me when the vehicle is ready.',seller:pid==='preflight'?'Taylor, seller · 612-555-0190':'',destination:pid==='northstar'?'Ridgeline Auto Care, Minneapolis':'',total:service.price,lines:[{description:service.name,quantity:1,price:service.price}],report:[],reportPublished:false,timeline:[{at:new Date().toISOString(),text:'Sample job created'}],messages:[]}; };
  const jobs = [makeJob('TV-1001','ridgeline','sam','audi','awaiting_approval','09:00',1),makeJob('TV-1002','ridgeline','maya','toyota','scheduled','09:00',0),makeJob('TV-1003','ridgeline','marcus','ford','in_progress','11:00',0),makeJob('TV-1004','southpaw','sam','audi','scheduled','13:00',2),makeJob('TV-1005','preflight','sam','audi','requested','10:00',3),makeJob('TV-1006','northstar','maya','toyota','requested','15:00',0),makeJob('TV-1007','ridgeline','maya','toyota','completed','09:00',-3),makeJob('TV-1008','ridgeline','marcus','ford','requested','14:00',1)];
  jobs[0].lines=[{description:'Front brake pads',quantity:1,price:145},{description:'Front rotors',quantity:2,price:95},{description:'Labor',quantity:1.5,price:120}]; jobs[0].total=515;
  jobs[0].messages=[{id:'message-seed',role:'provider',text:'Hi Sam, the front pads are worn. I have attached the itemized estimate for your approval. We will only proceed once you approve.',at:new Date().toISOString()}];
  jobs[1].approvedAt=new Date().toISOString();jobs[2].approvedAt=new Date().toISOString(); jobs[6].paidAt=new Date().toISOString(); jobs[6].approvedAt=new Date().toISOString();
  return {version:6,providers,customers,vehicles,jobs,favorites:[{customerId:'sam',providerId:'ridgeline'},{customerId:'sam',providerId:'southpaw'}],tickets:[],blocks:[],drafts:[]};
}

export function available(state: State, provider: Provider, date: string, time: string, duration: number, staff: string, exclude = '', vehicleId = '') {
  const start=minutes(time),end=start+duration+provider.buffer;
  if (Number.isNaN(Date.parse(date+'T12:00:00Z'))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date||Number(time.split(':')[1])>59||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time)||date<day()||!Number.isFinite(start)||start<provider.open*60||end>provider.close*60||!provider.staff.includes(staff)) return false;
  const localTime=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Chicago',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
  if(date===day()&&start<=minutes(localTime)) return false;
  const vehicleBusy=vehicleId&&state.jobs.some(j=>j.id!==exclude&&j.vehicleId===vehicleId&&j.date===date&&['scheduled','in_progress','en_route','arrived'].includes(j.status)&&start<minutes(j.time)+j.service.duration+(state.providers.find(p=>p.id===j.providerId)?.buffer||0)&&end>minutes(j.time));
  if(vehicleBusy)return false;
  const busy=state.jobs.filter(j=>j.id!==exclude&&j.providerId===provider.id&&j.date===date&&j.staff===staff&&['scheduled','in_progress','en_route','arrived'].includes(j.status));
  return !busy.some(j=>start<minutes(j.time)+j.service.duration+provider.buffer&&end>minutes(j.time))&&!state.blocks.some(b=>b.providerId===provider.id&&b.date===date&&b.staff===staff&&start<minutes(b.time)+b.duration&&end>minutes(b.time));
}
export const inspectionAreas = ['Exterior & body','Tires & brakes','Engine & fluids','Electrical & diagnostics','Interior & safety','Road test'];
