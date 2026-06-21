import { useState } from 'react';
import { STAT_META_BY_KEY } from '../game';
import type { Effects, StatKey, Stats } from '../game';
import { STAT_COLORS, assetUrl, effectChips, isDanger, statFraction } from './theme';

// Vital signs the player must watch (all have a danger threshold) vs. the
// growth stats that build quietly toward endings (shown on demand).
const PRIMARY_STATS: StatKey[] = ['money', 'energy', 'stress', 'health', 'gpa', 'homesick'];
const SECONDARY_STATS: StatKey[] = ['english', 'social', 'career', 'adaptation', 'visa', 'reputation'];

export function StatBar({ statKey, value }: { statKey: StatKey; value: number }) {
  const meta = STAT_META_BY_KEY[statKey];
  const danger = isDanger(statKey, value);
  const shown = statKey === 'money' ? `£${value}` : `${value}`;
  return (
    <div className={`stat${danger ? ' stat--danger' : ''}`} title={meta.desc}>
      <span className="stat__label">{meta.label}</span>
      <span className="stat__bar">
        <span
          className="stat__fill"
          style={{ width: `${statFraction(statKey, value) * 100}%`, ['--c' as string]: STAT_COLORS[statKey] }}
        />
      </span>
      <span className="stat__val">{shown}</span>
    </div>
  );
}

export function StatHud({ stats }: { stats: Stats }) {
  const [open, setOpen] = useState(false);
  const keys = open ? [...PRIMARY_STATS, ...SECONDARY_STATS] : PRIMARY_STATS;
  return (
    <div className="hud-wrap">
      <div className="hud">
        {keys.map((k) => (
          <StatBar key={k} statKey={k} value={stats[k]} />
        ))}
      </div>
      <button className="hud-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? '收起其余状态 ▴' : '更多状态 ▾'}
      </button>
    </div>
  );
}

export function FxChips({ fx }: { fx: Effects | undefined }) {
  const chips = effectChips(fx);
  if (chips.length === 0) return null;
  return (
    <span className="fx">
      {chips.map((c, i) => (
        <span key={i} className={`fx__chip ${c.good ? 'fx__chip--up' : 'fx__chip--down'}`}>
          {c.text}
        </span>
      ))}
    </span>
  );
}

export function SceneStrip({ artId, caption, route }: { artId: string; caption: string; route?: string }) {
  const url = assetUrl(artId);
  return (
    <div className="scene">
      {url ? (
        <img
          className="scene__art"
          src={url}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <div className="scene__rain" aria-hidden />
      <div className="scene__cap">
        {caption}
        {route ? <span className="scene__route"> · {route}</span> : null}
      </div>
    </div>
  );
}
