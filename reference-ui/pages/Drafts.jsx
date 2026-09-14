import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, PageCard } from '../components/primitives.jsx';
import { useStore } from '../lib/store.jsx';

export default function Drafts() {
  const nav = useNavigate();
  const { drafts, loadDraft, deleteDraft } = useStore();

  const open = (id) => {
    loadDraft(id);
    nav('/match?view=edit');
  };

  return (
    <PageCard>
      <NotchNav active="mid" />
      <div style={{ padding: '72px 56px 52px' }}>
        <Meta>DRAFTS</Meta>
        <h1 className="tv-title" style={{ margin: '16px 0 0' }}>Requests you have not sent</h1>
        <p className="tv-body" style={{ marginTop: 14, maxWidth: 560 }}>
          Save a job from Match. Open it later, edit the note, and send it when you are ready.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 32, maxWidth: 760 }}>
          {drafts.length === 0 && (
            <Card pad={28}>
              <div style={{ font: '600 16px/1.3 var(--tv-font)' }}>No drafts yet</div>
              <p className="tv-small" style={{ marginTop: 10 }}>
                Describe the job on Match and choose Save as a draft. It lands here on this device.
              </p>
              <Link to="/match"><Pill variant="accent" style={{ marginTop: 18 }}>Describe a job</Pill></Link>
            </Card>
          )}
          {drafts.map((d) => (
            <Card key={d.id} pad={22}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                <div>
                  <div style={{ font: '600 18px/1.2 var(--tv-font)' }}>{d.title || (d.issues || []).join(', ') || 'Untitled job'}</div>
                  <div className="tv-data" style={{ marginTop: 10 }}>
                    {(d.vehicle || 'Vehicle').toUpperCase()} · {(d.when || d.windowId || 'WINDOW').toString().toUpperCase()} · {d.zip || ''}
                  </div>
                  <p className="tv-small" style={{ marginTop: 10 }}>{d.describe || 'No note yet.'}</p>
                  <div className="tv-data" style={{ marginTop: 10 }}>
                    SAVED {d.savedAt ? new Date(d.savedAt).toLocaleString() : 'JUST NOW'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Pill variant="accent" onClick={() => open(d.id)}>Continue this request</Pill>
                <Pill variant="surface" onClick={() => deleteDraft(d.id)}>Delete draft</Pill>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
