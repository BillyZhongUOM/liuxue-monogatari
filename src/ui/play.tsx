import { useEffect, useMemo, useRef, useState } from 'react';
import {
  EVENT_BY_ID,
  ROUTE_BY_ID,
  WEEKS_PER_TERM,
  availableActions,
  currentLeadingRoute,
  evaluateCondition,
} from '../game';
import type { GameState } from '../game';
import { useGame } from '../store';
import { MapScene } from '../map/MapScene';
import { SceneStrip, StatHud } from './bits';

// pick a scene id + caption from the current calendar position
function sceneFor(state: GameState): { artId: string; caption: string } {
  const w = state.week;
  const t = state.term;
  if (state.totalWeeks < 1) return { artId: 'scene-arrival', caption: '落地第一周' };
  if (w >= WEEKS_PER_TERM - 1) return { artId: 'scene-library', caption: '期末周 · 图书馆' };
  if (t === 1) return { artId: 'scene-campus-rain', caption: '雨季校园' };
  if (t === 2) return { artId: 'scene-dorm', caption: '宿舍日常' };
  return { artId: 'scene-career-fair', caption: '求职季' };
}

function TopBar({
  state,
  view,
  onToggleView,
}: {
  state: GameState;
  view: 'map' | 'list';
  onToggleView: () => void;
}) {
  const toMenu = useGame((s) => s.toMenu);
  const dots = [];
  for (let i = 0; i < state.maxActionPoints; i++) {
    dots.push(<span key={i} className={`ap-dot${i < state.actionPoints ? ' ap-dot--full' : ''}`} />);
  }
  return (
    <div className="topbar">
      <button className="pixel-btn pixel-btn--ghost" style={{ padding: '6px 9px' }} onClick={toMenu} aria-label="菜单">
        ≡
      </button>
      <button
        className="pixel-btn pixel-btn--ghost"
        style={{ padding: '6px 9px' }}
        onClick={onToggleView}
        aria-label="切换视图"
      >
        {view === 'map' ? '📋' : '🗺️'}
      </button>
      <div className="topbar__time">
        第 <b>{state.year}</b> 年 · T<b>{state.term}</b> · <b>{state.week}</b>/{WEEKS_PER_TERM} 周
      </div>
      <div className="ap">
        {dots}
      </div>
    </div>
  );
}

function ActionGrid({ state }: { state: GameState }) {
  const act = useGame((s) => s.act);
  const actions = useMemo(() => availableActions(state), [state]);
  const out = state.actionPoints <= 0;
  return (
    <div className="actions">
      {actions.map((a) => (
        <button
          key={a.id}
          className="pixel-btn action-card"
          disabled={out}
          onClick={() => act(a.id)}
        >
          <span className="action-card__top">
            <span className="action-card__ico" aria-hidden>
              {a.emoji}
            </span>
            <span className="action-card__name">{a.name}</span>
          </span>
          <span className="action-card__desc">{a.desc}</span>
        </button>
      ))}
    </div>
  );
}

function LogFeed({ state }: { state: GameState }) {
  const recent = state.history.slice(-6).reverse();
  return (
    <div className="log">
      <div className="section-label">最近发生</div>
      {recent.map((e, i) => (
        <div key={i} className="log__entry">
          {e.kind === 'milestone' || e.kind === 'event' ? <b>· </b> : '· '}
          {e.text}
        </div>
      ))}
    </div>
  );
}

function EventModal({ state }: { state: GameState }) {
  const resolve = useGame((s) => s.resolve);
  const ev = state.pendingEventId ? EVENT_BY_ID[state.pendingEventId] : undefined;
  if (!ev) return null;
  const choices = ev.choices
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => evaluateCondition(c.requires, state));
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal__kicker">突发事件</div>
        <h2 className="modal__title">{ev.title}</h2>
        <p className="modal__desc">{ev.description}</p>
        <div className="choice-list">
          {choices.map(({ c, idx }) => (
            <button key={idx} className="pixel-btn choice" onClick={() => resolve(idx)}>
              <span>{c.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeeklySummary({ state }: { state: GameState }) {
  const cont = useGame((s) => s.continueWeekly);
  const line = [...state.history].reverse().find((e) => e.kind === 'weekly')?.text ?? '新的一周开始了。';
  const milestone = [...state.history].reverse().find((e) => e.kind === 'milestone');
  const showMilestone = milestone && state.week === 1;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal__kicker">周末结算</div>
        <h2 className="modal__title">第 {state.year} 年 · 第 {state.term} 学期</h2>
        <p className="modal__desc">{line}</p>
        {showMilestone ? <p className="weekly__line">{milestone!.text}</p> : null}
        <button className="pixel-btn pixel-btn--primary" onClick={cont} style={{ width: '100%' }}>
          继续
        </button>
      </div>
    </div>
  );
}

export function PlayScreen({ state }: { state: GameState }) {
  const advance = useGame((s) => s.advance);
  const [view, setView] = useState<'map' | 'list'>('map');
  const scene = sceneFor(state);
  const route = currentLeadingRoute(state);
  const routeName = route ? ROUTE_BY_ID[route]?.name : undefined;
  const out = state.actionPoints <= 0;
  const scrollRef = useRef<HTMLDivElement>(null);

  // keep the action area in view when a new week starts
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [state.totalWeeks]);

  return (
    <>
      <TopBar state={state} view={view} onToggleView={() => setView((v) => (v === 'map' ? 'list' : 'map'))} />
      {view === 'map' ? (
        <div className="map-wrap">
          <MapScene state={state} />
          <StatHud stats={state.stats} />
        </div>
      ) : (
        <div className="scroll" ref={scrollRef}>
          <SceneStrip artId={scene.artId} caption={scene.caption} route={routeName} />
          <StatHud stats={state.stats} />
          <div className="section-label">这周做点什么（每件事消耗 1 点行动）</div>
          <ActionGrid state={state} />
          <LogFeed state={state} />
        </div>
      )}
      <div className="bottom-bar">
        <button
          className={`pixel-btn ${out ? 'pixel-btn--primary' : 'pixel-btn--ghost'}`}
          onClick={advance}
        >
          {out ? '进入下周 →' : `提前进入下周（剩 ${state.actionPoints} 行动）`}
        </button>
      </div>

      {state.phase === 'event' ? <EventModal state={state} /> : null}
      {state.phase === 'weekly' ? <WeeklySummary state={state} /> : null}
    </>
  );
}
