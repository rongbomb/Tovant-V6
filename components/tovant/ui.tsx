'use client';
import type { ReactNode, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Inbox } from 'lucide-react';
import { statusNames,type Status } from '@/lib/tovant/model';
export {Button,Input,Textarea};
export function Field({label,children,hint}:{label:string;children:ReactNode;hint?:string}){return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>;}
export function Choice({value,onChange,options,name,label}:{value:string;onChange?:(value:string)=>void;options:(string|{value:string;label:string})[];name?:string;label?:string}){return <Select value={value} onValueChange={onChange} name={name}><SelectTrigger aria-label={label||name} className="choice"><SelectValue/></SelectTrigger><SelectContent>{options.map(v=>{const o=typeof v==='string'?{value:v,label:v}:v;return <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>;})}</SelectContent></Select>;}
export function Modal({open,onClose,title,description,children,wide=false}:{open:boolean;onClose:()=>void;title:string;description?:string;children:ReactNode;wide?:boolean}){return <Dialog open={open} onOpenChange={o=>!o&&onClose()}><DialogContent className={`modal ${wide?'wide':''}`}><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description||'Review the details below.'}</DialogDescription></DialogHeader>{children}</DialogContent></Dialog>;}
export function StatusBadge({status}:{status:Status}){return <span className={`status ${status}`}>{statusNames[status]}</span>;}
export function Empty({title,text,action}:{title:string;text:string;action?:ReactNode}){return <div className="empty"><Inbox size={32}/><h3>{title}</h3><p>{text}</p>{action}</div>;}
export function Heading({eyebrow,title,text,action}:{eyebrow?:string;title:string;text?:string;action?:ReactNode}){return <div className="page-heading"><div>{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{text&&<p className="muted">{text}</p>}</div>{action}</div>;}
export function Stat({label,value,detail}:{label:string;value:string|number;detail?:string}){return <div className="stat"><p>{label}</p><strong>{value}</strong>{detail&&<small>{detail}</small>}</div>;}
export const formValues=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();return Object.fromEntries(new FormData(e.currentTarget));};
export function download(name:string,text:string,type='text/plain'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
export function csv(rows:(string|number)[][]){return rows.map(r=>r.map(v=>'"'+String(v).replace(/^[=+@-]/,"'").replaceAll('"','""')+'"').join(',')).join('\r\n');}
