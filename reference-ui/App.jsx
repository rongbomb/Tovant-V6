import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import './styles/tokens.css';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import FindAPro from './pages/FindAPro.jsx';
import Match from './pages/Match.jsx';
import ProviderPage from './pages/ProviderPage.jsx';
import ProviderDashboard from './pages/ProviderDashboard.jsx';
import OwnerSettings from './pages/OwnerSettings.jsx';
import ProviderSettings from './pages/ProviderSettings.jsx';
import Admin from './pages/Admin.jsx';
import Vetting from './pages/Vetting.jsx';
import OwnerJobs from './pages/OwnerJobs.jsx';
import Signup from './pages/Signup.jsx';
import SignupOwner from './pages/SignupOwner.jsx';
import SignupProvider from './pages/SignupProvider.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Messages from './pages/Messages.jsx';
import Support from './pages/Support.jsx';
import Legal from './pages/Legal.jsx';
import Careers from './pages/Careers.jsx';
import Press from './pages/Press.jsx';
import Payouts from './pages/Payouts.jsx';
import Booked from './pages/Booked.jsx';
import Compare from './pages/Compare.jsx';
import History from './pages/History.jsx';
import Invoice from './pages/Invoice.jsx';
import Drafts from './pages/Drafts.jsx';
import RequestDetail from './pages/RequestDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import CookieBanner from './components/CookieBanner.jsx';
import Work from './pages/Work.jsx';
import DemoControls from './components/DemoControls.jsx';
import { StoreProvider, useStore } from './lib/store.jsx';

const PAGES = [
  ['01', 'Home', '/'],
  ['02', 'Login', '/login'],
  ['03', 'Browse and map', '/find'],
  ['04', 'Match with providers', '/match'],
  ['05', 'Provider profile', '/provider/harlan'],
  ['06', 'Provider dashboard', '/dashboard'],
  ['07', 'Owner settings', '/settings'],
  ['08', 'Provider settings', '/provider-settings'],
  ['09', 'Site admin', '/admin'],
  ['10', 'How vetting works', '/vetting'],
  ['11', 'Owner jobs', '/jobs'],
  ['12', 'Signup', '/signup'],
  ['13', 'Drafts', '/drafts'],
  ['14', 'Admin', '/admin'],
];

function PageIndex() {
  const { pathname } = useLocation();
  const {enterDemo}=useStore();
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '14px 24px 12px', background: 'var(--tv-inverse)', margin: 0 }}>
      {PAGES.map(([n, label, to]) => {
        const base = to.split('?')[0];
        const on = base === '/' ? pathname === '/' : pathname === base || (base !== '/provider-settings' && pathname.startsWith(`${base}/`));
        return (
          <Link key={n} to={to} onClick={()=>{if(to.startsWith('/dashboard')||to==='/provider-settings')enterDemo('provider');else if(to==='/admin')enterDemo('admin');else if(['/settings','/jobs','/drafts'].includes(to))enterDemo('owner');}} style={{
            display: 'flex', gap: 8, alignItems: 'center', padding: '9px 13px', borderRadius: 16,
            background: on ? 'var(--tv-accent)' : 'rgba(255,255,255,.08)',
            color: on ? 'var(--tv-inverse)' : 'rgba(255,255,255,.7)',
          }}>
            <span style={{ font: '600 9.5px/1 var(--tv-mono)', opacity: .7 }}>{n}</span>
            <span style={{ font: '600 12px/1 var(--tv-font)' }}>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell() {
  return (
    <>
      <ScrollToTop />
      <div style={{
        marginTop: 0,
        paddingTop: 'var(--tv-nav-inset-top, 0px)',
        paddingBottom: 'var(--tv-nav-inset-bottom, 0px)',
        paddingLeft: 'var(--tv-nav-inset-left, 0px)',
        paddingRight: 'var(--tv-nav-inset-right, 0px)',
        transition: 'padding .35s var(--tv-ease)',
        position: 'relative',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}>
        <PageIndex />
        <DemoControls />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Outlet />
        </div>
      </div>
      <CookieBanner />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/calendar', element: <Navigate to="/dashboard?view=schedule" replace/> },
      { path: '/dashboard/calendar', element: <Navigate to="/dashboard?view=schedule" replace/> },
      { path: '/business', element: <Navigate to="/dashboard" replace/> },
      { path: '/business/calendar', element: <Navigate to="/dashboard?view=schedule" replace/> },
      { path: '/business/jobs', element: <Navigate to="/dashboard?view=jobs" replace/> },
      { path: '/business/jobs/:id', element: <RequireAuth roles={['provider']}><Work/></RequireAuth> },
      { path: '/business/customers', element: <Navigate to="/work/customers" replace/> },
      { path: '/business/settings', element: <Navigate to="/work/services" replace/> },
      { path: '/business/messages', element: <Navigate to="/messages" replace/> },
      { path: '/business/money', element: <Navigate to="/work/money" replace/> },
      { path: '/work/calendar', element: <RequireAuth roles={['provider']}><Work/></RequireAuth> },
      { path: '/work/customers', element: <RequireAuth roles={['provider']}><Work/></RequireAuth> },
      { path: '/work/money', element: <RequireAuth roles={['provider']}><Work/></RequireAuth> },
      { path: '/work/services', element: <RequireAuth roles={['provider']}><Work/></RequireAuth> },
      { path: '/work/garage', element: <RequireAuth roles={['owner']}><Work/></RequireAuth> },
      { path: '/work/jobs/:id', element: <RequireAuth roles={['owner','provider']}><Work/></RequireAuth> },
      { path: '/work/messages', element: <RequireAuth roles={['owner','provider']}><Work/></RequireAuth> },
      { path: '/work/guide', element: <Work/> },
      { path: '/guide', element: <Navigate to="/work/guide" replace/> },
      { path: '/garage', element: <Navigate to="/work/garage" replace/> },
      { path: '/jobs/:id', element: <RequireAuth roles={['owner']}><Work/></RequireAuth> },

      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      { path: '/signup/owner', element: <SignupOwner /> },
      { path: '/signup/provider', element: <SignupProvider /> },
      { path: '/reset', element: <ResetPassword /> },
      { path: '/find', element: <FindAPro /> },
      { path: '/match', element: <Match /> },
      { path: '/provider/:id', element: <ProviderPage /> },
      { path: '/dashboard', element: <RequireAuth roles={['provider']}><ProviderDashboard /></RequireAuth> },
      { path: '/dashboard/request/:id', element: <RequireAuth roles={['provider']}><RequestDetail /></RequireAuth> },
      { path: '/jobs', element: <RequireAuth roles={['owner']}><OwnerJobs /></RequireAuth> },
      { path: '/drafts', element: <RequireAuth roles={['owner']}><Drafts /></RequireAuth> },
      { path: '/booked', element: <RequireAuth roles={['owner']}><Booked /></RequireAuth> },
      { path: '/history', element: <RequireAuth roles={['owner']}><History /></RequireAuth> },
      { path: '/invoice/:id', element: <RequireAuth roles={['owner']}><Invoice /></RequireAuth> },
      { path: '/compare', element: <Compare /> },
      { path: '/messages', element: <RequireAuth roles={['owner', 'provider']}><Messages /></RequireAuth> },
      { path: '/settings', element: <RequireAuth roles={['owner']}><OwnerSettings /></RequireAuth> },
      { path: '/provider-settings', element: <RequireAuth roles={['provider']}><ProviderSettings /></RequireAuth> },
      { path: '/admin', element: <RequireAuth roles={['admin']}><Admin /></RequireAuth> },
      { path: '/vetting', element: <Vetting /> },
      { path: '/support', element: <Support /> },
      { path: '/legal', element: <Legal /> },
      { path: '/privacy', element: <Legal /> },
      { path: '/cookies', element: <Legal /> },
      { path: '/careers', element: <Careers /> },
      { path: '/press', element: <Press /> },
      { path: '/payouts', element: <Payouts /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return (
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  );
}
