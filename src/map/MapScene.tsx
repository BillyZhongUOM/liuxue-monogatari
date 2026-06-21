import { useEffect, useMemo, useState } from 'react';
import { availableActions } from '../game';
import type { GameState } from '../game';
import { useGame } from '../store';
import { isUnlocked, setRain } from '../audio/sound';
import { assetUrl } from '../ui/theme';
import { InteriorScene } from './InteriorScene';
import {
  LOCATIONS,
  LOCATION_BY_ID,
  ZONE_HOME,
  ZONE_LABEL,
  actionsAtLocation,
} from './locations';
import type { Zone } from './locations';

type NodeStatus = 'open' | 'locked' | 'dim';

// Decoration layer: trees / lampposts / benches tucked into the gaps left by the
// staggered building layout for depth. Purely cosmetic, sits behind the building
// layer (zIndex below). Positions are picked to fill the open patches between the
// irregular node positions without crowding any building.
const DECO_SPOTS: Record<Zone, { x: number; y: number; a: string; s: number }[]> = {
  campus: [
    { x: 57, y: 47, a: 'deco-tree-autumn', s: 50 },
    { x: 30, y: 57, a: 'deco-tree-green', s: 44 },
    { x: 67, y: 39, a: 'deco-lamppost', s: 30 },
    { x: 51, y: 64, a: 'deco-tree-autumn', s: 42 },
  ],
  town: [
    { x: 30, y: 44, a: 'deco-lamppost', s: 30 },
    { x: 66, y: 32, a: 'deco-tree-green', s: 40 },
    { x: 38, y: 59, a: 'deco-bench', s: 38 },
    { x: 70, y: 63, a: 'deco-tree-green', s: 44 },
  ],
};

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

  // dusk rain bed plays on campus only; the town zone stays dry (visual + audio)
  useEffect(() => {
    if (isUnlocked()) setRain(zone === 'campus');
  }, [zone]);

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
  const ground = assetUrl(`ground-${zone}-${state.config.city}`) ?? assetUrl(`ground-${zone}`);
  const skyline = assetUrl(`skyline-${state.config.city}`);
  const charImg = assetUrl(`char-student-${state.config.gender ?? 'female'}`) ?? assetUrl('char-student');

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

      <div
        className={`map__stage map__stage--${zone}`}
        style={ground ? { backgroundImage: `url(${ground})` } : undefined}
      >
        {skyline ? <img className="map-skyline" src={skyline} alt="" aria-hidden /> : null}

        {DECO_SPOTS[zone].map((d, i) => {
          const img = assetUrl(d.a);
          return img ? (
            <img
              key={i}
              className="map-deco map-deco__img"
              src={img}
              style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.s}px`, height: `${d.s}px`, zIndex: Math.round(d.y * 10) - 5 }}
              alt=""
              aria-hidden
            />
          ) : null;
        })}

        {nodes.map((l) => {
          const st = statusOf(l.id);
          const bImg = assetUrl(`building-${l.id}`);
          return (
            <button
              key={l.id}
              className={`map-node map-node--${st}`}
              style={{ left: `${l.x}%`, top: `${l.y}%`, zIndex: Math.round(l.y * 10) }}
              onClick={() => tapNode(l.id)}
            >
              <span className="map-node__art">
                {bImg ? (
                  <img className="map-node__img" src={bImg} alt="" />
                ) : (
                  <span className="map-node__ico" aria-hidden>
                    {l.emoji}
                  </span>
                )}
                {st === 'locked' ? (
                  <span className="map-node__lock" aria-hidden>
                    🔒
                  </span>
                ) : null}
              </span>
              <span className="map-node__name">{l.name}</span>
            </button>
          );
        })}

        {playerInZone ? (
          <div
            className="map-player"
            style={{ left: `${player.x}%`, top: `${player.y}%`, zIndex: Math.round(player.y * 10) + 5 }}
            aria-hidden
          >
            {charImg ? <img className="map-player__img" src={charImg} alt="" /> : '🧑'}
          </div>
        ) : null}

        {toast ? <div className="map-toast">{toast}</div> : null}
      </div>

      {openLoc ? <InteriorScene state={state} locId={openLoc} onClose={() => setOpenLoc(null)} /> : null}
    </div>
  );
}
