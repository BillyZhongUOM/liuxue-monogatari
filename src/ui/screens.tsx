import { useState } from 'react';
import {
  BUDGETS,
  CITIES,
  CITY_SCHOOLS,
  ENDINGS,
  ENDING_BY_ID,
  ENGLISH_LEVELS,
  MAJORS,
  ROUTE_BY_ID,
  TIER_LABEL,
  TRAITS,
  UNIVERSITY_TYPES,
  currentLeadingRoute,
} from '../game';
import type { CharacterConfig, CreationOption, GameState } from '../game';
import { assetUrl } from './theme';

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

// ---------------------------------------------------------------- creation (random roll)
const NAME_POOL = ['小林', '阿哲', '子瑜', '大壮', '一帆', '悠悠', '晓彤', '点点', 'momo', '阿 May', 'Vivian', 'Leo', 'Mike', 'Cindy', 'Kevin', 'Tony'];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(list: CreationOption[]): CreationOption {
  const total = list.reduce((s, o) => s + (o.weight ?? 1), 0);
  let r = Math.random() * total;
  for (const o of list) {
    r -= o.weight ?? 1;
    if (r <= 0) return o;
  }
  return list[list.length - 1];
}

function optById(list: CreationOption[], id: string): CreationOption | undefined {
  return list.find((o) => o.id === id);
}

function rollConfig(): CharacterConfig {
  // City first (weighted; 牛津/剑桥 are rare), then a school the city can actually have.
  const city = weightedPick(CITIES);
  const schoolIds = CITY_SCHOOLS[city.id] ?? UNIVERSITY_TYPES.map((u) => u.id);
  const schools = schoolIds.map((id) => optById(UNIVERSITY_TYPES, id)).filter(Boolean) as CreationOption[];
  const uni = pickRandom(schools);

  const n = 1 + Math.floor(Math.random() * 3); // 1 to 3 traits
  const pool = [...TRAITS];
  const traits: string[] = [];
  for (let i = 0; i < n && pool.length; i++) {
    traits.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0].id);
  }
  return {
    playerName: pickRandom(NAME_POOL),
    city: city.id,
    universityType: uni.id,
    major: pickRandom(MAJORS).id,
    budget: pickRandom(BUDGETS).id,
    englishLevel: pickRandom(ENGLISH_LEVELS).id,
    traits,
  };
}

const TIER_RANK: Record<string, number> = { common: 0, rare: 1, epic: 2, legend: 3 };

function startTier(config: CharacterConfig): 'legend' | 'epic' | 'rare' | 'common' {
  return optById(UNIVERSITY_TYPES, config.universityType)?.tier ?? 'common';
}

function startDifficulty(config: CharacterConfig): number {
  let d = optById(UNIVERSITY_TYPES, config.universityType)?.difficulty ?? 3;
  if (config.budget === 'tight') d += 1;
  if (config.budget === 'comfortable') d -= 1;
  if (config.englishLevel === 'just_passed') d += 1;
  if (config.englishLevel === 'fluent') d -= 1;
  return Math.max(1, Math.min(5, d));
}

// Random start each new game: the player rolls an identity (reroll until happy),
// only the name is editable. Keeps every run different and replayable.
export function CharacterCreation({
  onConfirm,
  onBack,
}: {
  onConfirm: (config: CharacterConfig) => void;
  onBack: () => void;
}) {
  const [config, setConfig] = useState<CharacterConfig>(rollConfig);
  const tier = startTier(config);
  const diff = startDifficulty(config);

  const rows = [
    { label: '城市', opt: optById(CITIES, config.city) },
    { label: '学校', opt: optById(UNIVERSITY_TYPES, config.universityType) },
    { label: '专业', opt: optById(MAJORS, config.major) },
    { label: '家境', opt: optById(BUDGETS, config.budget) },
    { label: '英语', opt: optById(ENGLISH_LEVELS, config.englishLevel) },
  ];

  return (
    <div className="creation">
      <div className="creation__head">
        <h2>🎲 开局抽签</h2>
        <p>命运给你发了一手牌。不满意就重抽，每一把都是不一样的留学人生。</p>
      </div>

      <div className="field">
        <div className="field__label">名字（可以改）</div>
        <input
          className="name-input"
          value={config.playerName}
          maxLength={12}
          onChange={(e) => setConfig((c) => ({ ...c, playerName: e.target.value }))}
        />
      </div>

      <div className="field">
        <div className={`roll-banner roll-banner--${tier}`}>
          <span className="roll-tier">{TIER_LABEL[tier]}开局</span>
          <span className="roll-diff">
            难度 <b>{'★'.repeat(diff)}</b>
            <span className="roll-diff__off">{'★'.repeat(5 - diff)}</span>
          </span>
        </div>
        <div className="roll-card">
          {rows.map((r) => (
            <div key={r.label} className="roll-row">
              <span className="roll-row__k">{r.label}</span>
              <span className="roll-row__v">{r.opt?.name}</span>
              <span className="roll-row__d">{r.opt?.desc}</span>
            </div>
          ))}
          <div className="roll-row roll-row--traits">
            <span className="roll-row__k">性格</span>
            <span className="roll-traits">
              {config.traits.map((id) => {
                const t = TRAITS.find((x) => x.id === id);
                return (
                  <span key={id} className="trait-chip trait-chip--on" title={t?.desc}>
                    {t?.name}
                  </span>
                );
              })}
            </span>
          </div>
          <div className="roll-traits__desc">
            {config.traits.map((id) => TRAITS.find((t) => t.id === id)?.desc).join(' ')}
          </div>
        </div>
      </div>

      <div className="sticky-foot">
        <button className="pixel-btn pixel-btn--ghost" onClick={onBack} style={{ flex: '0 0 22%' }}>
          返回
        </button>
        <button className="pixel-btn" onClick={() => setConfig(rollConfig())} style={{ flex: '0 0 32%' }}>
          🎲 重抽
        </button>
        <button className="pixel-btn pixel-btn--primary" onClick={() => onConfirm(config)}>
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
      {(() => {
        const art = assetUrl(ending.art ?? ending.id);
        return art ? (
          <img className="ending__art-img" src={art} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <div className="ending__art" aria-hidden>
            {TONE_ART[ending.tone] ?? '🎓'}
          </div>
        );
      })()}
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
