import { z } from 'zod';
import { available, categories, inspectionAreas, seed, totalLines, uid, type State, type Role, type Status, type Job } from './model';
const str=z.string().trim().max(2000); const short=z.string().trim().min(1).max(150);
const line=z.object({description:short,quantity:z.number().positive().max(1000),price:z.number().nonnegative().max(100000)});
export const actionSchema=z.object({type:z.enum(['book','transition','estimate','message','report','review','pay','reschedule','vehicle','favorite','provider','service','block','ticket','ticket_reply','verify','draft','delete_draft','new_customer','onboard','unblock','photo','reference','profile','register_owner','reset']),role:z.enum(['customer','provider','admin']),actor:short,providerId:str.optional(),jobId:str.optional(),data:z.record(z.unknown()).default({})});
export type Action=z.infer<typeof actionSchema>;
const fail=(text:string): never=>{throw new Error(text);};
export function applyAction(original:State,raw:unknown):State {
  const a=actionSchema.parse(raw); const s:State=structuredClone(original);const d=a.data; const now=new Date().toISOString();
  const p=s.providers.find(p=>p.id===a.providerId); const j=s.jobs.find(j=>j.id===a.jobId);
  const requireRole=(role:Role)=>{if(a.role!==role)fail('This action belongs to the '+role+' workspace.');};
  const requireJob=():Job=>{if(!j)fail('Job not found.');if(a.role==='customer'&&j!.customerId!==a.actor)fail('This job belongs to another customer.');if(a.role==='provider'&&j!.providerId!==a.providerId)fail('This job belongs to another business.');return j!;};
  const log=(job:Job,text:string)=>job.timeline.push({at:now,text});
  if(a.role==='customer'&&!s.customers.some(c=>c.id===a.actor))fail('Choose an existing demo customer.');
  if(a.type==='reset')return seed();
  if(a.type==='reference'){s.reference=z.record(z.unknown()).parse(d.snapshot);return s;}
  if(a.type==='register_owner'){
    const v=z.object({id:short,name:short,email:z.string().email().max(150),phone:str.default('')}).parse(d);
    if(s.customers.some(c=>c.id===v.id||c.email.toLowerCase()===v.email.toLowerCase()))fail('That email already exists. Sign in instead.');
    s.customers.push({...v,providerIds:[]});
    if(d.vehicle){const car=z.object({year:z.string().regex(/^\d{4}$/),make:short,model:short,mileage:z.number().int().nonnegative()}).parse(d.vehicle);s.vehicles.push({...car,id:uid(),customerId:v.id,vin:'',size:'Sedan'});}
  }
  if(a.type==='profile'){
    requireRole('customer');const v=z.object({name:short,email:z.string().email().max(150),phone:str}).parse(d);
    if(s.customers.some(c=>c.id!==a.actor&&c.email.toLowerCase()===v.email.toLowerCase()))fail('That email belongs to another demo customer.');
    Object.assign(s.customers.find(c=>c.id===a.actor)!,v);
    if(d.vehicles){const rows=z.array(z.object({year:z.string().regex(/^\d{4}$/),make:short,model:short,mileage:z.number().int().nonnegative()})).max(30).parse(d.vehicles);
      const existing=s.vehicles.filter(v=>v.customerId===a.actor);const selected=rows.map(v=>{const old=existing.find(o=>o.year===v.year&&o.make===v.make&&o.model===v.model);return {...old,...v,id:old?.id||uid(),customerId:a.actor,vin:old?.vin||'',size:old?.size||'Sedan'};});
      const removed=existing.filter(v=>!selected.some(n=>n.id===v.id));if(removed.some(v=>s.jobs.some(j=>j.vehicleId===v.id)))fail('A vehicle with service records cannot be removed.');
      s.vehicles=[...s.vehicles.filter(v=>v.customerId!==a.actor),...selected];
    }
  }
  if(a.type==='new_customer'){
    requireRole('provider');if(!p)fail('Provider not found.');
    const v=z.object({name:short,email:z.string().email().max(150),phone:short,year:z.string().regex(/^\d{4}$/),make:short,model:short}).parse(d);
    if(s.customers.some(c=>c.email.toLowerCase()===v.email.toLowerCase()))fail('A customer with this email already exists. Choose them in New booking.');
    const id=uid();s.customers.push({id,name:v.name,email:v.email,phone:v.phone,providerIds:[p!.id]});s.vehicles.push({id:uid(),customerId:id,year:v.year,make:v.make,model:v.model,mileage:0,vin:'',size:'Sedan'});
  }
  if(a.type==='onboard'){
    const v=z.object({id:short.optional(),name:short,area:short,zip:z.string().regex(/^(554|551|553)\d{2}$/),mobile:z.boolean(),category:z.string().refine(c=>categories.slice(1).includes(c),'Choose a listed service category'),workflow:z.enum(['appointment','estimate','inspection','dispatch']),serviceName:short,price:z.number().nonnegative().max(100000),duration:z.number().int().min(15).max(600)}).parse(d);
    if(s.providers.some(p=>p.name.toLowerCase()===v.name.toLowerCase()))fail('A business with this name already exists.');
    const id=v.id||uid();if(s.providers.some(p=>p.id===id))fail('This business address already exists.');s.providers.push({id,name:v.name,area:v.area,zip:v.zip,distance:0,rating:0,reviews:0,mobile:v.mobile,radius:20,verified:false,accepting:true,bio:'A new independent automotive business in the Twin Cities.',services:[{id:uid(),name:v.serviceName,category:v.category,workflow:v.workflow,price:v.price,duration:v.duration}],staff:['Owner'],buffer:v.mobile?30:15,open:8,close:18});
  }
  if(a.type==='unblock'){requireRole('provider');s.blocks=s.blocks.filter(b=>!(b.id===d.id&&b.providerId===a.providerId));}

  if(a.type==='favorite'){requireRole('customer');if(!p)fail('Provider not found.');s.favorites=s.favorites.some(f=>f.providerId===p!.id&&f.customerId===a.actor)?s.favorites.filter(f=>!(f.providerId===p!.id&&f.customerId===a.actor)):[...s.favorites,{providerId:p!.id,customerId:a.actor}];}
  if(a.type==='book'){
    if(a.role==='admin')fail('Use the customer or provider workspace to create a job.');
    if(!p||!p.accepting||!p.verified)fail('This business is not taking requests.');
    const b=z.object({serviceId:short,customerId:short,vehicleId:short,date:short,time:short,staff:short,address:str,zip:z.string().regex(/^\d{5}$/),notes:str,seller:str,destination:str,draftId:str.optional(),requestOnly:z.boolean().optional()}).parse(d);
    const service=p!.services.find(v=>v.id===b.serviceId);if(!service)fail('Choose an available service.');
    if(a.role==='customer'&&b.customerId!==a.actor)fail('Choose your own customer account.');
    if(!s.vehicles.some(v=>v.id===b.vehicleId&&v.customerId===b.customerId))fail('Choose a vehicle belonging to this customer.');
    if(!/^(554|551|553)/.test(b.zip))fail('The demo currently serves the Twin Cities pilot area.');
    if(p!.mobile&&(b.zip!=='55407'&&b.zip!==p!.zip))fail('Mobile coverage in this demo supports ZIP 55407 and the business home ZIP only.');
    if(p!.mobile&&b.zip==='55407'&&p!.distance>p!.radius)fail('This address is outside the provider’s configured demo service radius.');
    if(p!.mobile&&!b.address.trim())fail('Enter the service address.');
    if(service!.workflow==='inspection'&&!b.seller.trim())fail('Add a seller or vehicle access contact.');
    if(service!.workflow==='dispatch'&&!b.destination.trim())fail('Add a destination or write “On-site assistance”.');
    if(!available(s,p!,b.date,b.time,service!.duration,b.staff,'',b.vehicleId))fail('That time is unavailable. Choose another date, time or team member.');
    if(b.draftId)s.drafts=s.drafts.filter(v=>!(v.id===b.draftId&&v.customerId===a.actor));
    const id='TV-'+uid().slice(0,8).toUpperCase();
    s.jobs.unshift({id,providerId:p!.id,customerId:b.customerId,vehicleId:b.vehicleId,service:{...service!},status:service!.workflow==='appointment'&&!b.requestOnly?'scheduled':'requested',date:b.date,time:b.time,staff:b.staff,address:b.address,zip:b.zip,notes:b.notes,seller:b.seller,destination:b.destination,total:service!.price,lines:[{description:service!.name,quantity:1,price:service!.price}],report:[],reportPublished:false,timeline:[{at:now,text:service!.workflow==='appointment'&&!b.requestOnly?'Appointment booked':'Request submitted; time is tentative'}],messages:[]});
  }
  if(a.type==='transition'){
    const j=requireJob(); const next=z.enum(['requested','awaiting_approval','scheduled','in_progress','en_route','arrived','completed','cancelled']).parse(d.status) as Status;
    if(['completed','cancelled'].includes(j.status))fail('This job is already closed.');
    if(next==='cancelled'){if(['in_progress','arrived','en_route'].includes(j.status))fail('Work has started. Contact the provider to resolve this job.');if(a.role==='admin')fail('Use the job participant workspace.');j.status=next;log(j,`${a.role==='customer'?'Customer':'Provider'} cancelled the job: ${str.parse(d.reason||'No reason supplied')}`);}
    else {
      const provider=s.providers.find(p=>p.id===j.providerId)!;
      if(j.status==='awaiting_approval'&&next==='scheduled'){requireRole('customer');if(!available(s,provider,j.date,j.time,j.service.duration,j.staff,j.id,j.vehicleId))fail('The proposed appointment is no longer available. Ask the provider to reschedule.');j.approvedAt=now;}
      else {requireRole('provider'); const allowed: Partial<Record<Status,Status[]>>={requested:j.service.workflow==='estimate'?[]:['scheduled'],scheduled:provider.mobile?['en_route']:['in_progress'],en_route:['arrived'],arrived:j.service.workflow==='dispatch'?['completed']:['in_progress'],in_progress:['completed']};if(!allowed[j.status]?.includes(next))fail('This workflow cannot move to that stage.');if(j.service.workflow==='estimate'&&next==='in_progress'&&!j.approvedAt)fail('Customer approval is required before work starts.');if(next==='scheduled'&&!available(s,provider,j.date,j.time,j.service.duration,j.staff,j.id,j.vehicleId))fail('Scheduling conflict. Choose another time.');if(next==='completed'&&j.service.workflow==='inspection'&&!j.reportPublished)fail('Publish the inspection report before completing this job.');}
      j.status=next;log(j,next==='scheduled'&&j.approvedAt?'Customer approved the estimate and appointment':`Job moved to ${next.replaceAll('_',' ')}`);
    }
  }
  if(a.type==='estimate'){requireRole('provider');const j=requireJob();if(j.service.workflow!=='estimate'||!['requested','awaiting_approval'].includes(j.status))fail('An estimate can only be sent before work is authorized.');const lines=z.array(line).min(1).max(30).parse(d.lines);j.lines=lines;j.total=totalLines(lines);j.status='awaiting_approval';delete j.approvedAt;log(j,'Itemized estimate sent for customer approval');}
  if(a.type==='photo'){const j=requireJob();if(a.role==='admin')fail('Use a job participant workspace.');if((j.photos||[]).length>=12)fail('This demo supports up to 12 photos per job.');const v=z.object({key:short,caption:short}).parse(d);j.photos=[...(j.photos||[]),{...v,at:now}];log(j,'Photo added: '+v.caption);}
  if(a.type==='message'){const j=requireJob();if(a.role==='admin')fail('Use a participant workspace to send messages.');j.messages.push({id:uid(),role:a.role,text:short.max(2000).parse(d.text),at:now});}
  if(a.type==='report'){requireRole('provider');const j=requireJob();if(j.service.workflow!=='inspection'||j.status!=='in_progress')fail('Start the inspection before recording findings.');j.report=z.array(z.object({area:short,condition:z.enum(['Good','Attention','Urgent','Not inspected']),note:str})).length(6).parse(d.findings);if(!inspectionAreas.every(area=>j.report.some(f=>f.area===area&&f.note.trim().length>0)))fail('Record a note for all six inspection areas.');j.reportPublished=true;log(j,'Inspection report published to the customer');}
  if(a.type==='review'){requireRole('customer');const j=requireJob();if(j.status!=='completed'||j.review)fail('Reviews are available once per completed job.');j.review=z.object({rating:z.number().int().min(1).max(5),text:short.max(1000)}).parse(d);const provider=s.providers.find(p=>p.id===j.providerId)!;provider.rating=Math.round(((provider.rating*provider.reviews+j.review.rating)/(provider.reviews+1))*10)/10;provider.reviews++;log(j,'Customer review submitted');}
  if(a.type==='pay'){requireRole('provider');const j=requireJob();if(j.status!=='completed'||j.paidAt)fail('Only an unpaid completed job can be marked paid.');j.paidAt=now;log(j,'Provider recorded direct payment (demo ledger)');}
  if(a.type==='reschedule'){const j=requireJob();if(['completed','cancelled','in_progress','arrived','en_route'].includes(j.status))fail('This job cannot be rescheduled.');if(a.role==='admin')fail('Use a participant workspace.');const b=z.object({date:short,time:short,staff:short}).parse(d);const p=s.providers.find(p=>p.id===j.providerId)!;if(!available(s,p,b.date,b.time,j.service.duration,b.staff,j.id,j.vehicleId))fail('That time conflicts with another appointment or working hours.');Object.assign(j,b);if(a.role==='provider'&&j.service.workflow==='estimate'&&j.approvedAt){delete j.approvedAt;j.status='awaiting_approval';log(j,'Provider changed the approved appointment; customer approval required again');}log(j,'Appointment changed to '+b.date+' at '+b.time);}
  if(a.type==='vehicle'){requireRole('customer');const v=z.object({year:z.string().regex(/^\d{4}$/),make:short,model:short,mileage:z.number().int().nonnegative().max(2000000),vin:z.string().trim().max(17),size:z.enum(['Sedan','SUV','Truck','Van'])}).parse(d);if(Number(v.year)<1900||Number(v.year)>new Date().getUTCFullYear()+2)fail('Enter a valid vehicle year.');s.vehicles.push({...v,id:uid(),customerId:a.actor});}
  if(a.type==='provider'){requireRole('provider');if(!p)fail('Provider not found.');Object.assign(p!,z.object({name:short,bio:short.max(1000),accepting:z.boolean(),buffer:z.number().int().min(0).max(120),radius:z.number().int().min(1).max(100),open:z.number().int().min(0).max(23),close:z.number().int().min(1).max(24),staff:z.array(short).min(1).max(10)}).parse(d));if(p!.open>=p!.close)fail('Closing time must be after opening time.');if(new Set(p!.staff).size!==p!.staff.length)fail('Team member names must be unique.');if(s.jobs.some(j=>j.providerId===p!.id&&!['completed','cancelled'].includes(j.status)&&!p!.staff.includes(j.staff)))fail('Reassign active jobs before removing a team member.');}
  if(a.type==='service'){requireRole('provider');if(!p)fail('Provider not found.');const v=z.object({id:str.optional(),name:short,category:z.string().refine(c=>categories.slice(1).includes(c),'Choose a listed service category'),workflow:z.enum(['appointment','estimate','inspection','dispatch']),price:z.number().nonnegative().max(100000),duration:z.number().int().min(15).max(600)}).parse(d);const existing=p!.services.findIndex(vv=>vv.id===v.id);if(existing>=0)p!.services[existing]={...v,id:v.id!};else p!.services.push({...v,id:uid()});}
  if(a.type==='block'){requireRole('provider');if(!p)fail('Provider not found.');const v=z.object({date:short,time:short,duration:z.number().int().min(15).max(600),staff:short}).parse(d);if(!available(s,p!,v.date,v.time,v.duration,v.staff))fail('That block overlaps a booking or is outside working hours.');s.blocks.push({...v,id:uid(),providerId:p!.id});}
  if(a.type==='ticket'){requireRole('customer');const v=z.object({subject:short,text:short.max(2000)}).parse(d);s.tickets.push({...v,id:uid(),customerId:a.actor,status:'Open',reply:''});}
  if(a.type==='ticket_reply'){requireRole('admin');const t=s.tickets.find(t=>t.id===d.id);if(!t)fail('Ticket not found.');t!.reply=short.max(2000).parse(d.reply);t!.status='Resolved';}
  if(a.type==='verify'){requireRole('admin');if(!p)fail('Provider not found.');p!.verified=z.boolean().parse(d.verified);}
  if(a.type==='draft'){requireRole('customer');if(!p)fail('Provider not found.');const draft=z.object({id:str.optional(),serviceId:short,notes:str,vehicleId:str.optional(),date:str.optional(),time:str.optional(),staff:str.optional(),address:str.optional(),zip:str.optional(),seller:str.optional(),destination:str.optional()}).parse(d);const record={...draft,id:draft.id||uid(),customerId:a.actor,providerId:p!.id};const index=s.drafts.findIndex(v=>v.id===record.id&&v.customerId===a.actor);if(index>=0)s.drafts[index]=record;else s.drafts.push(record);}
  if(a.type==='delete_draft'){requireRole('customer');s.drafts=s.drafts.filter(v=>!(v.id===d.id&&v.customerId===a.actor));}
  return s;
}
