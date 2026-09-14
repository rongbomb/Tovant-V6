import React from 'react'
import SegmentedControl from './SegmentedControl.jsx'
import { Card, Meta, Chip, Field, Placeholder } from './primitives.jsx'
import { TIME_WINDOWS } from '../data/directory.js'

export default function JobRequestForm({
  framed = true,
  categories = [],
  categoryId = '',
  onCategory,
  issueOptions = [],
  issues = [],
  onToggleIssue,
  vehicle,
  onVehicle,
  zip,
  onZip,
  describe,
  onDescribe,
  photos = [],
  onAddPhoto,
  onRemovePhoto,
  mode,
  onMode,
  modeOptions,
  windowId,
  onWindow,
  slot,
  onSlot,
}) {
  const windowRow = TIME_WINDOWS.find((w) => w.id === windowId) || TIME_WINDOWS[0]
  const how = modeOptions?.length
    ? modeOptions
    : [{ value: 'mobile', label: 'Come to me' }, { value: 'shop', label: "I'll drive in" }]
  const selected = categories.find((c) => c.id === categoryId)
  const useHierarchy = categories.length > 0
  const showServices = Boolean(selected && selected.services?.length)
  const unsure = categoryId === 'unsure'

  const addPhoto = (file) => {
    if (!file || !onAddPhoto) return
    const reader = new FileReader()
    reader.onload = () => onAddPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const servicePicker = useHierarchy ? (
    <>
      <Meta>WHAT KIND OF WORK</Meta>
      <p className="tv-small" style={{ marginTop: 10 }}>
        Start with the type of shop you need. The list below updates to match.
      </p>
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 14 }}>
        {categories.map((c) => (
          <Chip
            key={c.id}
            type="button"
            on={categoryId === c.id}
            onClick={() => onCategory?.(c.id)}
            aria-pressed={categoryId === c.id}
          >
            {c.label}
          </Chip>
        ))}
      </div>

      {showServices && (
        <>
          <Meta style={{ marginTop: 26 }}>WHICH SERVICES</Meta>
          <p className="tv-small" style={{ marginTop: 10 }}>
            Pick one or more for {selected.label.toLowerCase()}. Pros who do this work see the request.
          </p>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 14 }}>
            {issueOptions.map((t) => (
              <Chip key={t} type="button" on={issues.includes(t)} onClick={() => onToggleIssue?.(t)} aria-pressed={issues.includes(t)}>
                {t}
              </Chip>
            ))}
          </div>
        </>
      )}

      {unsure && (
        <p className="tv-small" style={{ marginTop: 18 }}>
          Describe the noise or problem below. We still send it to vetted pros who can sort it out.
        </p>
      )}

      {!categoryId && (
        <p className="tv-small" style={{ marginTop: 18, color: 'var(--tv-muted)' }}>
          Choose a work type to see services.
        </p>
      )}
    </>
  ) : (
    <>
      <Meta>WHAT DOES THE CAR NEED</Meta>
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 14 }}>
        {issueOptions.map((t) => (
          <Chip key={t} type="button" on={issues.includes(t)} onClick={() => onToggleIssue?.(t)} aria-pressed={issues.includes(t)}>
            {t}
          </Chip>
        ))}
      </div>
    </>
  )

  const need = (
    <>
      {servicePicker}
      <div style={{ display: 'flex', gap: 18, marginTop: 26 }}>
        <div style={{ flex: 1 }}><Field label="VEHICLE" value={vehicle} onChange={onVehicle} /></div>
        <div style={{ flex: 1 }}><Field label="ZIP CODE" value={zip} onChange={onZip} /></div>
      </div>
      <div style={{ marginTop: 22 }}>
        <Field label="ANYTHING WORTH KNOWING" value={describe} onChange={onDescribe} multiline />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
        {photos.map((src, i) => (
          <button
            key={i}
            type="button"
            aria-label="Remove media"
            onClick={() => onRemovePhoto?.(i)}
            style={{ padding: 0, border: 0, background: 'none', cursor: 'pointer' }}
          >
            {String(src).startsWith('data:video')
              ? <video src={src} style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 'var(--tv-r-input)' }} />
              : <img src={src} alt="" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 'var(--tv-r-input)' }} />}
          </button>
        ))}
        {photos.length < 3 && (
          <label style={{ width: 96, height: 96, cursor: 'pointer' }}>
            <input type="file" accept="image/*,video/*" hidden onChange={(e) => addPhoto(e.target.files?.[0])} />
            <Placeholder label="ADD MEDIA" style={{ width: 96, height: 96, borderRadius: 'var(--tv-r-input)' }} />
          </label>
        )}
      </div>
    </>
  )

  const when = (
    <>
      <Meta>HOW AND WHEN</Meta>
      <div style={{ marginTop: 14 }}>
        {how.length > 1
          ? <SegmentedControl value={mode} onChange={onMode} options={how} />
          : <div style={{ font: '600 14px/1.4 var(--tv-font)' }}>{how[0]?.label}</div>}
      </div>
      <Meta style={{ marginTop: 22 }}>TIME WINDOW</Meta>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {TIME_WINDOWS.map((w) => (
          <Chip key={w.id} type="button" on={windowId === w.id} onClick={() => onWindow?.(w.id)}>{w.label}</Chip>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        {windowRow.slots.map((sl) => (
          <Chip key={sl} type="button" on={slot === sl} onClick={() => onSlot?.(sl)}>{sl}</Chip>
        ))}
      </div>
      <p className="tv-small" style={{ marginTop: 16 }}>
        {mode === 'mobile'
          ? `A vetted tech comes to ${zip}. No trip fee inside the Twin Cities ring.`
          : 'You drop the car at the shop. Loaners are marked on each shop page.'}
      </p>
    </>
  )

  if (!framed) {
    return (
      <div>
        {need}
        <div style={{ marginTop: 22 }}>{when}</div>
      </div>
    )
  }

  return (
    <>
      <Card>{need}</Card>
      <Card>{when}</Card>
    </>
  )
}
