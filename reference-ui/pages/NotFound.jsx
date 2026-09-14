import React from 'react';
import { Link } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Pill, PageCard } from '../components/primitives.jsx';

export default function NotFound() {
  return (
    <PageCard>
      <NotchNav />
      <div style={{ padding: '72px 56px 28px', maxWidth: 640 }}>
        <h1 className="tv-h1" style={{ margin: 0 }}>That page is not on Tovant.</h1>
        <p className="tv-body" style={{ marginTop: 16 }}>
          The Twin Cities pilot is nine product surfaces plus signup, jobs, and the company pages in the footer. Use Find a Pro or sign in.
        </p>
        <Card style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/"><Pill variant="ink">Home</Pill></Link>
            <Link to="/find"><Pill variant="surface">Find a Pro</Pill></Link>
            <Link to="/login"><Pill variant="surface">Sign in</Pill></Link>
          </div>
        </Card>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
