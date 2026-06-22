import { useEffect, useMemo, useRef, useState } from 'react';
import {
  EVENT_BY_ID,
  ROUTE_BY_ID,
  WEEKS_PER_TERM,
  availableActions,
  currentLeadingRoute,
  evaluateCondition,
} from '../game';
import type { Effects, GameState } from '../game';
import { useGame } from '../store';
import { AudioPanel } from './AudioPanel';
import { useNotify } from './notifyStore';
import { MapScene } from '../map/MapScene';
import { ChapterBanner } from './ChapterBanner';
import { EventBurst } from './EventBurst';
import { FxChips, SceneStrip, StatHud } from './bits';
import { eventSkin, statDelta } from './theme';

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
  const openPhone = useNotify((s) => s.openPhone);
  const unread = useNotify((s) => s.unread);
  const dots = [];
  for (let i = 0; i < state.maxActionPoints; i++) {
    dots.push(<span key={i} className={`ap-dot${i < state.actionPoints ? ' ap-dot--full' : ''}`} />);
  }
  return (
    <div className="topbar">
      <button className="pixel-btn pixel-btn--ghost topbar__btn" onClick={toMenu} aria-label="菜单">
        ≡
      </button>
      <button
        className="pixel-btn pixel-btn--ghost topbar__btn"
        onClick={onToggleView}
        aria-label="切换视图"
      >
        {view === 'map' ? '📋' : '🗺️'}
      </button>
      <AudioPanel />
      <button
        className="pixel-btn pixel-btn--ghost topbar__btn phone-btn"
        onClick={openPhone}
        aria-label="手机"
      >
        📱
        {unread > 0 ? <span className="phone-btn__badge">{unread > 9 ? '9+' : unread}</span> : null}
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

// Two-step so a choice has a visible consequence: pick -> see the outcome (result
// text + what changed) -> 继续 commits. The engine only changes on resolve(); the
// reveal reads the chosen choice's data (event effects are not trait-scaled, so
// chosen.effects is exactly what will apply).
function EventModal({ state }: { state: GameState }) {
  const resolve = useGame((s) => s.resolve);
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => {
    setPicked(null);
  }, [state.pendingEventId]);

  const ev = state.pendingEventId ? EVENT_BY_ID[state.pendingEventId] : undefined;
  if (!ev) return null;
  const skin = eventSkin(ev.category);
  const choices = ev.choices
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => evaluateCondition(c.requires, state));
  const chosen = picked !== null ? ev.choices[picked] : null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal modal--call" style={{ ['--skin' as string]: skin.color }}>
        <div className="call__head">
          <span className="call__avatar" aria-hidden>
            {skin.emoji}
            <span className="call__bang">!</span>
          </span>
          <div className="call__head-tx">
            <div className="call__kicker">{skin.kicker}</div>
            <h2 className="modal__title">{ev.title}</h2>
          </div>
        </div>
        <div className="call__body">
          {chosen ? (
            <div className="reveal">
              <p className="reveal__text">{chosen.resultText}</p>
              <div className="reveal__fx">
                <span className="reveal__fx-label">这一下</span>
                <FxChips fx={chosen.effects} />
              </div>
              <button className="pixel-btn pixel-btn--primary reveal__go" onClick={() => resolve(picked!)}>
                继续 →
              </button>
            </div>
          ) : (
            <>
              <p className="modal__desc">{ev.description}</p>
              <div className="choice-list">
                {choices.map(({ c, idx }) => (
                  <button key={idx} className="pixel-btn choice" onClick={() => setPicked(idx)}>
                    <span>{c.text}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Floats the stat changes from the action you just took, so every tap visibly
// does something.
function DeltaToast({ fx }: { fx: Effects }) {
  return (
    <div className="delta-toast">
      <FxChips fx={fx} />
    </div>
  );
}

function WeeklySummary({ state, delta }: { state: GameState; delta: Effects }) {
  const cont = useGame((s) => s.continueWeekly);
  const line = [...state.history].reverse().find((e) => e.kind === 'weekly')?.text ?? '新的一周开始了。';
  const milestone = [...state.history].reverse().find((e) => e.kind === 'milestone');
  const showMilestone = milestone && state.week === 1;
  const hasDelta = Object.keys(delta).length > 0;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal modal--call" style={{ ['--skin' as string]: 'var(--amber)' }}>
        <div className="call__head">
          <span className="call__avatar" aria-hidden>
            📅
          </span>
          <div className="call__head-tx">
            <div className="call__kicker">周末结算</div>
            <h2 className="modal__title">第 {state.year} 年 · 第 {state.term} 学期</h2>
          </div>
        </div>
        <div className="call__body">
          <p className="modal__desc">{line}</p>
          {hasDelta ? (
            <div className="weekly__delta">
              <span className="weekly__delta-label">本周自然变化</span>
              <FxChips fx={delta} />
            </div>
          ) : null}
          {showMilestone ? <p className="weekly__line">{milestone!.text}</p> : null}
          <button className="pixel-btn pixel-btn--primary" onClick={cont} style={{ width: '100%' }}>
            继续
          </button>
        </div>
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

  // Consequence feedback: diff the previous state to surface what an action did
  // (delta toast), what the week did (weekly chips), and to fire the event burst.
  // UI-only; the engine never learns about any of this.
  const prev = useRef<GameState | null>(null);
  const counter = useRef(0);
  const [actionToast, setActionToast] = useState<{ key: number; fx: Effects } | null>(null);
  const [weeklyDelta, setWeeklyDelta] = useState<Effects>({});
  const [burst, setBurst] = useState<{ key: number; category: string } | null>(null);

  useEffect(() => {
    const p = prev.current;
    if (p) {
      const sameWeek = p.totalWeeks === state.totalWeeks;
      if (p.phase === 'playing' && state.phase === 'playing' && sameWeek) {
        const d = statDelta(p.stats, state.stats);
        if (Object.keys(d).length) {
          counter.current += 1;
          setActionToast({ key: counter.current, fx: d });
        }
      }
      if (state.phase === 'weekly' && p.phase !== 'weekly') {
        setWeeklyDelta(statDelta(p.stats, state.stats));
      }
      if (state.phase === 'event' && p.phase !== 'event') {
        const ev = state.pendingEventId ? EVENT_BY_ID[state.pendingEventId] : undefined;
        counter.current += 1;
        setBurst({ key: counter.current, category: ev?.category ?? '' });
      }
    }
    prev.current = state;
  }, [state]);

  useEffect(() => {
    if (!actionToast) return;
    const t = window.setTimeout(() => setActionToast(null), 1600);
    return () => window.clearTimeout(t);
  }, [actionToast]);

  // keep the action area in view when a new week starts
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [state.totalWeeks]);

  return (
    <>
      <TopBar state={state} view={view} onToggleView={() => setView((v) => (v === 'map' ? 'list' : 'map'))} />
      <ChapterBanner state={state} />
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

      {actionToast ? <DeltaToast key={actionToast.key} fx={actionToast.fx} /> : null}
      {state.phase === 'event' ? <EventModal state={state} /> : null}
      {burst && state.phase === 'event' ? (
        <EventBurst key={burst.key} category={burst.category} onDone={() => setBurst(null)} />
      ) : null}
      {state.phase === 'weekly' ? <WeeklySummary state={state} delta={weeklyDelta} /> : null}
    </>
  );
}
