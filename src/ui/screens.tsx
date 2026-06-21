import { useState } from 'react';
import {
  BUDGETS,
  CITIES,
  ENDINGS,
  ENDING_BY_ID,
  ENGLISH_LEVELS,
  MAJORS,
  ROUTE_BY_ID,
  TRAITS,
  UNIVERSITY_TYPES,
  currentLeadingRoute,
} from '../game';
import type { CharacterConfig, CreationOption, GameState } from '../game';

const FINALE_ENDINGS = ENDINGS.filter((e) => !e.crisis).length;

// ---------------------------------------------------------------- main menu
export function MainMenu({
  onNew,
  onContinue,
  hasSave,
  collectionCount,
}: {
  onNew: () => void;
  onContinue: () => void;
  hasSave: boolean;
  collectionCount: number;
}) {
  return (
    <div className="menu">
      <div className="menu__art" aria-hidden>
        🌧️🎓
      </div>
      <h1 className="menu__title">英伦留学物语</h1>
      <p className="menu__sub">
        你是一名刚落地英国的中国留学生。在雨天、deadline、part-time、小组作业和毕业焦虑里，
        把这一年过成自己想要的样子。
      </p>
      <div className="menu__btns">
        {hasSave ? (
          <button className="pixel-btn pixel-btn--primary" onClick={onContinue}>
            继续游戏
          </button>
        ) : null}
        <button className={`pixel-btn ${hasSave ? 'pixel-btn--ghost' : 'pixel-btn--primary'}`} onClick={onNew}>
          新游戏
        </button>
      </div>
      <p className="menu__foot">
        结局图鉴：{collectionCount} / {FINALE_ENDINGS}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- creation
function OptRow({
  label,
  options,
  value,
  onPick,
  cols = 2,
}: {
  label: string;
  options: CreationOption[];
  value: string;
  onPick: (id: string) => void;
  cols?: 2 | 3;
}) {
  return (
    <div className="field">
      <div className="field__label">{label}</div>
      <div className={`opt-grid${cols === 3 ? ' opt-grid--3' : ''}`}>
        {options.map((o) => {
          const sel = o.id === value;
          return (
            <button key={o.id} className={`opt${sel ? ' opt--selected' : ''}`} onClick={() => onPick(o.id)}>
              <div className={`opt__name${sel ? ' opt__name--sel' : ''}`}>{o.name}</div>
              <div className="opt__desc">{o.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CharacterCreation({
  onConfirm,
  onBack,
}: {
  onConfirm: (config: CharacterConfig) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState('');
  const [city, setCity] = useState(CITIES[1].id);
  const [uni, setUni] = useState(UNIVERSITY_TYPES[1].id);
  const [major, setMajor] = useState(MAJORS[0].id);
  const [budget, setBudget] = useState(BUDGETS[1].id);
  const [english, setEnglish] = useState(ENGLISH_LEVELS[1].id);
  const [traits, setTraits] = useState<string[]>([]);

  const toggleTrait = (id: string) => {
    setTraits((cur) => {
      if (cur.includes(id)) return cur.filter((t) => t !== id);
      if (cur.length >= 3) return cur;
      return [...cur, id];
    });
  };

  const confirm = () => {
    onConfirm({
      playerName: name.trim() || '留学生',
      city,
      universityType: uni,
      major,
      budget,
      englishLevel: english,
      traits,
    });
  };

  return (
    <div className="creation">
      <div className="creation__head">
        <h2>开局设定</h2>
        <p>这些选择会决定你起步时的家底和性格。怎么开局，都有自己的活法。</p>
      </div>

      <div className="field">
        <div className="field__label">名字</div>
        <input
          className="name-input"
          value={name}
          maxLength={12}
          placeholder="给自己起个名字（默认：留学生）"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <OptRow label="城市" options={CITIES} value={city} onPick={setCity} cols={3} />
      <OptRow label="学校类型" options={UNIVERSITY_TYPES} value={uni} onPick={setUni} />
      <OptRow label="专业方向" options={MAJORS} value={major} onPick={setMajor} cols={3} />
      <OptRow label="家庭预算" options={BUDGETS} value={budget} onPick={setBudget} cols={3} />
      <OptRow label="英语基础" options={ENGLISH_LEVELS} value={english} onPick={setEnglish} cols={3} />

      <div className="field">
        <div className="field__label">性格特质（选 1 到 3 个）</div>
        <div className="trait-row">
          {TRAITS.map((t) => {
            const on = traits.includes(t.id);
            return (
              <button
                key={t.id}
                className={`trait-chip ${on ? 'trait-chip--on' : 'trait-chip--off'}`}
                onClick={() => toggleTrait(t.id)}
                title={t.desc}
              >
                {t.name}
              </button>
            );
          })}
        </div>
        <div className="trait-hint">
          {traits.length === 0 ? '至少选一个' : traits.map((id) => TRAITS.find((t) => t.id === id)?.desc).join(' / ')}
        </div>
      </div>

      <div className="sticky-foot">
        <button className="pixel-btn pixel-btn--ghost" onClick={onBack} style={{ flex: '0 0 30%' }}>
          返回
        </button>
        <button className="pixel-btn pixel-btn--primary" onClick={confirm} disabled={traits.length === 0}>
          开始留学 →
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- ending
const TONE_LABEL: Record<string, string> = { good: '圆满', mixed: '五味杂陈', bad: '遗憾', special: '隐藏' };
const TONE_ART: Record<string, string> = { good: '🎓', mixed: '🌧️', bad: '💔', special: '✨' };

export function EndingScreen({
  state,
  collectionCount,
  onReplay,
  onMenu,
}: {
  state: GameState;
  collectionCount: number;
  onReplay: () => void;
  onMenu: () => void;
}) {
  const ending = state.endingId ? ENDING_BY_ID[state.endingId] : undefined;
  if (!ending) return null;
  const route = currentLeadingRoute(state);
  const routeName = route ? ROUTE_BY_ID[route]?.name : '随遇而安';
  const s = state.stats;
  const finalStats: [string, string][] = [
    ['学业', `${s.gpa}`],
    ['英语', `${s.english}`],
    ['履历', `${s.career}`],
    ['社交', `${s.social}`],
    ['存款', `£${s.money}`],
    ['路线', routeName],
  ];

  return (
    <div className="ending">
      <div className={`ending__badge ending__badge--${ending.tone}`}>{TONE_LABEL[ending.tone] ?? '结局'}</div>
      <div className="ending__art" aria-hidden>
        {ending.art ?? TONE_ART[ending.tone] ?? '🎓'}
      </div>
      <h1 className="ending__title">{ending.title}</h1>
      <p className="ending__desc">{ending.desc}</p>
      <p className="ending__quip">{ending.quip}</p>
      <div className="ending__stats">
        {finalStats.map(([k, v]) => (
          <div key={k} className="ending__stat">
            <span>{k}</span>
            <b>{v}</b>
          </div>
        ))}
      </div>
      <p className="collection">
        结局图鉴：{collectionCount} / {FINALE_ENDINGS}，换个活法，结局也不一样。
      </p>
      <div className="menu__btns">
        <button className="pixel-btn pixel-btn--primary" onClick={onReplay}>
          再来一局
        </button>
        <button className="pixel-btn pixel-btn--ghost" onClick={onMenu}>
          回到主菜单
        </button>
      </div>
    </div>
  );
}
