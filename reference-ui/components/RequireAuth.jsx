import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';

/** Protects a route. Guests go to sign-in. Wrong roles switch to a demo persona for exploration. */
export default function RequireAuth({ roles, children }) {
  const { session, enterDemo } = useStore();
  const loc = useLocation();
  const role = session?.role || 'guest';
  const allowed = roles.includes(role) || role === 'admin';

  React.useEffect(() => {
    if (!allowed && role !== 'guest') enterDemo(roles[0]);
  }, [allowed, role, roles.join(',')]);

  if (role === 'guest') {
    const next = `${loc.pathname}${loc.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (!allowed) {
    return <div className="tv-body" style={{ padding: 60 }}>Opening demo workspace…</div>;
  }

  return children;
}
