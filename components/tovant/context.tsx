'use client';
import { createContext,useContext } from 'react';
import type { State, Role } from '@/lib/tovant/model';
import type { Action } from '@/lib/tovant/actions';
export type DemoContext = { state:State; role:Role; customerId:string; setCustomerId:(id:string)=>void; setRole:(role:Role)=>void; providerId:string; setProviderId:(id:string)=>void; busy:boolean; requestReset:()=>void; upload:(file:File,caption:string,jobId:string,providerId:string)=>Promise<boolean>; act:(type:Action['type'],data?:Record<string,unknown>,jobId?:string,providerId?:string)=>Promise<boolean> };
export const Demo=createContext<DemoContext|null>(null);
export function useDemo(){const c=useContext(Demo);if(!c)throw new Error('Demo context missing');return c;}
