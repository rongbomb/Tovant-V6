import React from 'react';
import {useLocation,useParams,Link} from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import {PageCard,Pill} from '../components/primitives.jsx';
import {useDemo} from '../../components/tovant/context';
import {Calendar,Customers,Money,BusinessSettings} from '../../components/tovant/business';
import {JobDetail,Jobs,Messages} from '../../components/tovant/jobs';
import {Garage,Guide} from '../../components/tovant/customer';
export default function Work(){const {pathname}=useLocation();const {id}=useParams();const {role}=useDemo();let content=id?<JobDetail key={id} id={id}/>:pathname.endsWith('/calendar')?<Calendar/>:pathname.endsWith('/customers')?<Customers/>:pathname.endsWith('/money')?<Money/>:pathname.endsWith('/services')?<BusinessSettings/>:pathname.endsWith('/garage')?<Garage/>:pathname.endsWith('/messages')?<Messages/>:pathname.endsWith('/guide')?<Guide/>:<Jobs/>;return <PageCard><NotchNav active={role==='provider'?'dash':'mid'}/><div className="v6-tools" style={{padding:'40px'}}>{content}</div></PageCard>;}
