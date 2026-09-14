'use client';
import React from 'react';
import { Link as RouterLink,useNavigate } from 'react-router-dom';
export function destination(href:string){
 if(href.startsWith('/business/jobs/'))return href.replace('/business/jobs/','/work/jobs/');
 if(href.startsWith('/jobs/'))return href.replace('/jobs/','/work/jobs/');
 if(href.startsWith('/providers/'))return href.replace('/providers/','/provider/');
 return ({'/business':'/dashboard','/business/jobs':'/dashboard?view=jobs','/business/calendar':'/work/calendar','/business/customers':'/work/customers','/business/money':'/work/money','/business/settings':'/work/services','/business/messages':'/messages','/garage':'/work/garage','/guide':'/work/guide','/join':'/signup/provider'} as Record<string,string>)[href]||href;
}
export default function Link({href,...props}:React.AnchorHTMLAttributes<HTMLAnchorElement>&{href:string}){return <RouterLink to={destination(href)} {...props}/>;}
export function useRouter(){const navigate=useNavigate();return {push:(href:string)=>navigate(destination(href))};}
