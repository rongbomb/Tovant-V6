import React from 'react'
import { useBlocker } from 'react-router-dom'
import { Card, Meta, Pill } from './primitives.jsx'
import { useStore } from '../lib/store.jsx'

export default function LeaveDraftGuard({ dirty, payload, allow }) {
  const { saveNamedDraft, clearScratchDraft } = useStore()
  const blocker = useBlocker(({ nextLocation }) => {
    if (!dirty) return false
    const path = nextLocation.pathname + (nextLocation.search || '')
    if (allow?.(path, nextLocation)) return false
    return true
  })

  React.useEffect(() => {
    if (!dirty) return undefined
    const onLeave = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [dirty])

  if (blocker.state !== 'blocked') return null

  const save = () => {
    saveNamedDraft(payload())
    blocker.proceed()
  }
  const discard = () => {
    clearScratchDraft()
    blocker.proceed()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(16,17,19,.45)', display: 'grid', placeItems: 'center', padding: 32 }}>
      <Card style={{ width: 480, maxWidth: '100%' }}>
        <Meta>UNSAVED REQUEST</Meta>
        <div style={{ font: '600 22px/1.2 var(--tv-font)', marginTop: 12 }}>Save this as a draft before you leave?</div>
        <p className="tv-small" style={{ marginTop: 12 }}>
          If you leave without saving, this request is deleted. Saved drafts live under My jobs.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
          <Pill variant="accent" onClick={save} style={{ minHeight: 48 }}>Save as a draft</Pill>
          <Pill variant="ink" onClick={discard} style={{ minHeight: 48 }}>Delete and leave</Pill>
          <Pill variant="surface" onClick={() => blocker.reset()} style={{ minHeight: 48 }}>Keep editing</Pill>
        </div>
      </Card>
    </div>
  )
}
