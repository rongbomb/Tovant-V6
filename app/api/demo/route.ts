import { env } from 'cloudflare:workers';
import { applyAction } from '@/lib/tovant/actions';
import { seed } from '@/lib/tovant/model';
import { ZodError } from 'zod';
const headers={'Cache-Control':'no-store','Content-Type':'application/json'};
function db(){if(!env.DB)throw new Error('Demo storage is unavailable.');return env.DB;}
function session(request:Request){const id=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('tovant_demo='))?.split('=')[1];return id&&/^[0-9a-f-]{36}$/.test(id)?id:null;}
function demoCookie(id:string,request:Request){
  const secure=new URL(request.url).protocol==='https:'?'; Secure':'';
  return `tovant_demo=${id}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=2592000`;
}
export async function GET(request:Request){
  try { let id=session(request);let row=id?await db().prepare('SELECT state, revision FROM demo_sessions WHERE id = ?').bind(id).first<{state:string;revision:number}>():null;
    const fresh=!row;if(!row){id=crypto.randomUUID();row={state:JSON.stringify(seed()),revision:0};await db().prepare('INSERT INTO demo_sessions (id,state,revision,updated_at) VALUES (?,?,?,?)').bind(id,row.state,0,new Date().toISOString()).run();}
    return Response.json({state:JSON.parse(row.state),revision:row.revision},{headers:{...headers,...(fresh?{'Set-Cookie':demoCookie(id!,request)}:{})}});
  }catch(error){console.error('Demo load failed',error);return Response.json({error:'We could not load your demo. Please retry.'},{status:503,headers});}
}
export async function POST(request:Request){
  try {const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Invalid origin.'},{status:403,headers});
    const id=session(request);if(!id)return Response.json({error:'Reload the demo before saving.'},{status:401,headers});
    if(Number(request.headers.get('content-length')||0)>4500000)return Response.json({error:'Request too large.'},{status:413,headers});
    const raw=await request.text();if(raw.length>4500000)return Response.json({error:'Request too large.'},{status:413,headers});
    const body=JSON.parse(raw);if(body.action?.type==='photo')return Response.json({error:'Use the photo upload form.'},{status:400,headers});const row=await db().prepare('SELECT state, revision FROM demo_sessions WHERE id = ?').bind(id).first<{state:string;revision:number}>();
    if(!row)return Response.json({error:'Your demo session expired. Reload to start again.'},{status:401,headers});
    if(body.revision!==row.revision)return Response.json({error:'Another tab changed this demo. Reload and try again.',state:JSON.parse(row.state),revision:row.revision},{status:409,headers});
    if(body.action?.type==='reference'){
      const snapshot=body.action.data?.snapshot;
      for(const account of snapshot?.accounts||[]){if(account.password){account.passwordHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('tovant-demo:'+account.password)))).map(v=>v.toString(16).padStart(2,'0')).join('');delete account.password;}}
    }
    const next=applyAction(JSON.parse(row.state),body.action);const revision=row.revision+1;
    const result=await db().prepare('UPDATE demo_sessions SET state = ?, revision = ?, updated_at = ? WHERE id = ? AND revision = ?').bind(JSON.stringify(next),revision,new Date().toISOString(),id,row.revision).run();
    if(result.meta.changes!==1)return Response.json({error:'Another change arrived first. Reload and try again.'},{status:409,headers});
    return Response.json({state:next,revision},{headers});
  }catch(error){if(error instanceof ZodError)return Response.json({error:error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')},{status:400,headers});if(error instanceof Error&&!/D1|SQLITE|binding/i.test(error.message))return Response.json({error:error.message},{status:400,headers});console.error('Demo save failed',error);return Response.json({error:'We could not save this change. Your form is still available; please retry.'},{status:503,headers});}
}
