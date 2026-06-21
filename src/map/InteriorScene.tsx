import { useMemo } from 'react';
import { availableActions } from '../game';
import type { GameState } from '../game';
import { useGame } from '../store';
import { assetUrl } from '../ui/theme';
import { LOCATION_BY_ID, actionsAtLocation } from './locations';

// You walk into a building and ENTER its interior: a full 2.5D scene with the
// location's available actions surfaced as a themed call-out panel. Replaces the
// old on-map bottom sheet. Falls back to a styled panel if the art is absent.
export function InteriorScene({
  state,
  locId,
  onClose,
}: {
  state: GameState;
  locId: string;
  onClose: () => void;
}) {
  const act = useGame((s) => s.act);
  const loc = LOCATION_BY_ID[locId];
  const bg = assetUrl(`interior-${locId}`);
  const availSet = useMemo(() => new Set(availableActions(state).map((a) => a.id)), [state]);
  const here = actionsAtLocation(locId);
  const open = here.filter((a) => availSet.has(a.id));
  const locked = here.filter((a) => !availSet.has(a.id));
  const out = state.actionPoints <= 0;

  return (
    <div className={`interior${bg ? '' : ' interior--noart'}`} style={bg ? { backgroundImage: `url(${bg})` } : undefined}>
      <div className="interior__scrim" />
      <div className="interior__top">
        <button className="pixel-btn pixel-btn--ghost" onClick={onClose}>
          ← 出门
        </button>
        <span className="interior__name">
          {loc?.emoji} {loc?.name}
        </span>
        <span className="interior__ap">行动 {state.actionPoints}</span>
      </div>

      <div className="interior__callout">
        <div className="interior__hint">{out ? '行动点用完了，出门回宿舍睡一觉推进到下一周。' : '在这里可以做点什么？'}</div>
        <div className="interior__actions">
          {open.length === 0 ? <div className="interior__empty">这周这里暂时没什么可做的。</div> : null}
          {open.map((a) => (
            <button key={a.id} className="pixel-btn interior-action" disabled={out} onClick={() => act(a.id)}>
              <span className="interior-action__ico" aria-hidden>
                {a.emoji}
              </span>
              <span className="interior-action__body">
                <span className="interior-action__name">
                  {a.name}
                  {a.apCost > 1 ? <span className="interior-action__cost"> · {a.apCost} 点</span> : null}
                </span>
                <span className="interior-action__desc">{a.desc}</span>
              </span>
            </button>
          ))}
          {locked.length > 0 ? (
            <div className="interior__locked">还没解锁：{locked.map((a) => a.name).join('、')}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
