import { STAT_METAS, STAT_META_BY_KEY } from '../game';
import type { Effects, StatKey, Stats } from '../game';
import { STAT_COLORS, assetUrl, effectChips, isDanger, statFraction } from './theme';

export function StatBar({ statKey, value }: { statKey: StatKey; value: number }) {
  const meta = STAT_META_BY_KEY[statKey];
  const danger = isDanger(statKey, value);
  const shown = statKey === 'money' ? `£${value}` : `${value}`;
  return (
    <div className={`stat${danger ? ' stat--danger' : ''}`} title={meta.desc}>
      <span className="stat__ico" aria-hidden>
        {meta.emoji}
      </span>
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
  return (
    <div className="hud">
      {STAT_METAS.map((m) => (
        <StatBar key={m.key} statKey={m.key} value={stats[m.key]} />
      ))}
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
