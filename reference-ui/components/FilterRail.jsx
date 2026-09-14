import React from 'react';
import { Card, Meta, Chip, Slider } from './primitives.jsx';
import { FILTER_TRADES } from '../data/directory.js';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';

const HOW = ['Comes to you', 'Drop off'];
const WHEN = ['Any day', 'Morning', 'Mid-day', 'Afternoon'];
const RATING = [['Any', 0], ['4.5+', 4.5], ['4.8+', 4.8]];

export default function FilterRail({ onMatch, selectedTrades, onTradesChange, onFiltersChange }) {
  const { site } = useStore();
  const copy = pageCopy(site, 'find');
  const [trades, setTrades] = React.useState(() => (Array.isArray(selectedTrades) ? selectedTrades : []));
  const [how, setHow] = React.useState(['Comes to you', 'Drop off']);
  const [when, setWhen] = React.useState('Any day');
  const [rating, setRating] = React.useState(0);
  const [distance, setDistance] = React.useState(60);

  React.useEffect(() => {
    if (Array.isArray(selectedTrades)) setTrades(selectedTrades);
  }, [selectedTrades]);

  React.useEffect(() => {
    onFiltersChange?.({
      trades, how, when, rating,
      miles: Math.max(2, Math.round(distance / 5)),
    });
  }, [trades, how, when, rating, distance]);

  const toggleTrade = (t) => {
    const next = trades.includes(t) ? trades.filter((x) => x !== t) : [...trades, t];
    setTrades(next);
    onTradesChange?.(next);
  };
  const toggleHow = (h) => setHow((s) => {
    const next = s.includes(h) ? s.filter((x) => x !== h) : [...s, h];
    return next.length ? next : s;
  });
  const reset = () => {
    setTrades([]);
    setHow(['Comes to you', 'Drop off']);
    setWhen('Any day');
    setRating(0);
    setDistance(100);
    onTradesChange?.([]);
  };

  return (
    <div style={{ width: 212, flex: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card dark pad={20}>
        <div style={{ font: '600 14.5px/1.3 var(--tv-font)', color: '#fff' }}>{copy.matchTitle}</div>
        <p style={{ font: '400 12.5px/1.5 var(--tv-font)', color: 'rgba(255,255,255,.6)', margin: '10px 0 0' }}>
          {copy.matchBody}
        </p>
        <button type="button" onClick={onMatch} style={{
          border: 0, background: 'none', padding: 0, marginTop: 16, minHeight: 44,
          cursor: 'pointer', font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent)',
        }}>
          Match me with pros →
        </button>
      </Card>

      <Card pad={18}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ font: '600 15px/1 var(--tv-font)' }}>Filters</div>
          <button onClick={reset} style={{ border: 0, background: 'none', cursor: 'pointer', font: '600 11.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Reset</button>
        </div>

        <Meta style={{ marginTop: 18 }}>TRADE</Meta>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {FILTER_TRADES.map((t) => (
            <Chip key={t} on={trades.includes(t)} onClick={() => toggleTrade(t)}
              style={{ padding: '8px 10px', font: '600 11.5px/1.2 var(--tv-font)', whiteSpace: 'normal', textAlign: 'left' }}>
              {t}
            </Chip>
          ))}
        </div>

        <Meta style={{ marginTop: 20 }}>HOW</Meta>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {HOW.map((h) => <Chip key={h} on={how.includes(h)} onClick={() => toggleHow(h)}>{h}</Chip>)}
        </div>

        <div style={{ marginTop: 20 }}>
          <Slider label="DISTANCE" value={`${Math.max(2, Math.round(distance / 5))} MI`} pct={distance} onChange={setDistance} />
        </div>

        <Meta style={{ marginTop: 20 }}>RATING</Meta>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {RATING.map(([label, n]) => <Chip key={label} on={rating === n} onClick={() => setRating(n)}>{label}</Chip>)}
        </div>

        <Meta style={{ marginTop: 20 }}>WHEN</Meta>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {WHEN.map((w) => <Chip key={w} on={when === w} onClick={() => setWhen(w)}>{w}</Chip>)}
        </div>
      </Card>
    </div>
  );
}
