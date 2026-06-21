import { useMemo, useState } from 'react';
import { availableActions } from '../game';
import type { GameState } from '../game';
import { useGame } from '../store';
import {
  LOCATIONS,
  LOCATION_BY_ID,
  ZONE_HOME,
  ZONE_LABEL,
  actionsAtLocation,
} from './locations';
import type { Zone } from './locations';

type NodeStatus = 'open' | 'locked' | 'dim';

// Bottom sheet listing the actions you can do at the location you walked to.
function LocationSheet({
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
  const availSet = useMemo(() => new Set(availableActions(state).map((a) => a.id)), [state]);
  const here = actionsAtLocation(locId);
  const open = here.filter((a) => availSet.has(a.id));
  const locked = here.filter((a) => !availSet.has(a.id));

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="loc-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="loc-sheet__head">
          <span className="loc-sheet__ico" aria-hidden>
            {loc?.emoji}
          </span>
          <span className="loc-sheet__name">{loc?.name}</span>
          <span className="loc-sheet__ap">行动点 {state.actionPoints}</span>
        </div>
        <div className="loc-sheet__list">
          {open.length === 0 ? <div className="loc-sheet__empty">这周这里暂时没什么可做的。</div> : null}
          {open.map((a) => (
            <button
              key={a.id}
              className="pixel-btn loc-action"
              disabled={state.actionPoints <= 0}
              onClick={() => {
                act(a.id);
                onClose();
              }}
            >
              <span className="loc-action__ico" aria-hidden>
                {a.emoji}
              </span>
              <span className="loc-action__body">
                <span className="loc-action__name">
                  {a.name}
                  {a.apCost > 1 ? <span className="loc-action__cost"> · {a.apCost} 点</span> : null}
                </span>
                <span className="loc-action__desc">{a.desc}</span>
              </span>
            </button>
          ))}
          {locked.length > 0 ? (
            <div className="loc-sheet__locked">还没解锁：{locked.map((a) => a.name).join('、')}</div>
          ) : null}
        </div>
        <button className="pixel-btn pixel-btn--ghost loc-sheet__close" onClick={onClose}>
          关上
        </button>
      </div>
    </div>
  );
}

export function MapScene({ state }: { state: GameState }) {
  const [zone, setZone] = useState<Zone>('campus');
  const [playerNode, setPlayerNode] = useState<string>('dorm');
  const [openLoc, setOpenLoc] = useState<string | null>(null);
  const [toast, setToast] = useState<string>('');

  const availSet = useMemo(() => new Set(availableActions(state).map((a) => a.id)), [state]);
  const outOfAp = state.actionPoints <= 0;

  function statusOf(locId: string): NodeStatus {
    const here = actionsAtLocation(locId);
    const hasOpen = here.some((a) => availSet.has(a.id));
    if (outOfAp) return 'dim';
    if (hasOpen) return 'open';
    if (here.length > 0) return 'locked';
    return 'dim';
  }

  function switchZone(z: Zone) {
    if (z === zone) return;
    setZone(z);
    setPlayerNode(ZONE_HOME[z]);
    setOpenLoc(null);
  }

  function tapNode(locId: string) {
    if (outOfAp) {
      setToast('这周行动点用完了，去宿舍睡一觉推进到下一周吧。');
      window.setTimeout(() => setToast(''), 2200);
      return;
    }
    setPlayerNode(locId); // the sprite walks over (cosmetic, CSS transition)
    setOpenLoc(locId); // open the location menu right away
  }

  const nodes = LOCATIONS.filter((l) => l.zone === zone);
  const player = LOCATION_BY_ID[playerNode];
  const playerInZone = player?.zone === zone;

  return (
    <div className="map">
      <div className="map__zones">
        {(['campus', 'town'] as Zone[]).map((z) => (
          <button
            key={z}
            className={`zone-tab${z === zone ? ' zone-tab--on' : ''}`}
            onClick={() => switchZone(z)}
          >
            {ZONE_LABEL[z]}
          </button>
        ))}
        <span className="map__hint">{outOfAp ? '行动点用完了' : '点地点，走过去做事'}</span>
      </div>

      <div className={`map__stage map__stage--${zone}`}>
        {nodes.map((l) => {
          const st = statusOf(l.id);
          return (
            <button
              key={l.id}
              className={`map-node map-node--${st}`}
              style={{ left: `${l.x}%`, top: `${l.y}%` }}
              onClick={() => tapNode(l.id)}
            >
              <span className="map-node__ico" aria-hidden>
                {st === 'locked' ? '🔒' : l.emoji}
              </span>
              <span className="map-node__name">{l.name}</span>
            </button>
          );
        })}

        {playerInZone ? (
          <div className="map-player" style={{ left: `${player.x}%`, top: `${player.y}%` }} aria-hidden>
            🧑
          </div>
        ) : null}

        {toast ? <div className="map-toast">{toast}</div> : null}
      </div>

      {openLoc ? <LocationSheet state={state} locId={openLoc} onClose={() => setOpenLoc(null)} /> : null}
    </div>
  );
}
