// =============================================================================
// Core type contracts for 英伦留学物语.
//
// The engine is pure data + pure functions. All game CONTENT (events, actions,
// endings, traits) is authored as plain data that conforms to the interfaces
// here, so content can be mass-authored and unit-tested without touching React.
// =============================================================================

/** The twelve tracked player stats. `money` is on a pounds scale; the rest 0-100. */
export type StatKey =
  | 'money'
  | 'energy'
  | 'stress'
  | 'gpa'
  | 'english'
  | 'social'
  | 'career'
  | 'adaptation'
  | 'health'
  | 'visa'
  | 'homesick'
  | 'reputation';

export type Stats = Record<StatKey, number>;

/** A bundle of stat deltas, e.g. { energy: -10, money: 120 }. */
export type Effects = Partial<Record<StatKey, number>>;

/** Flags are arbitrary story/progress markers set by events and actions. */
export type FlagValue = boolean | number | string;

export interface StatMeta {
  key: StatKey;
  label: string; // Chinese display label
  short: string; // 1-2 char label for compact bars
  icon: string; // asset id (falls back to emoji)
  emoji: string; // placeholder glyph until pixel art loads
  min: number;
  max: number;
  /** true => higher is better (gpa); false => higher is worse (stress). */
  higherIsBetter: boolean;
  desc: string;
  /** Below this is a danger zone (e.g. money, health, visa). */
  dangerLow?: number;
  /** Above this is a danger zone (e.g. stress, homesick). */
  dangerHigh?: number;
}

// -----------------------------------------------------------------------------
// Declarative condition DSL — lets data express "when does this trigger" without
// embedding code. Evaluated by `evaluateCondition` in conditions.ts.
// -----------------------------------------------------------------------------
export interface Condition {
  /** stat >= value for every listed stat */
  statGte?: Partial<Stats>;
  /** stat <= value for every listed stat */
  statLte?: Partial<Stats>;
  /** all of these flags must be truthy */
  flagsSet?: string[];
  /** none of these flags may be truthy */
  flagsNotSet?: string[];
  /** flag === exact value (string/number/boolean) */
  flagEquals?: Record<string, FlagValue>;
  /** player must have all listed traits */
  hasTraits?: string[];
  /** player must have at least one listed trait */
  hasAnyTrait?: string[];
  /** time gating (inclusive lower bounds) */
  minWeek?: number;
  minTerm?: number;
  minYear?: number;
  maxYear?: number;
  /** route affinity gating: the named route must be the current leading route */
  leadingRouteIn?: string[];
  /** restrict to specific cities / majors etc. */
  cityIn?: string[];
  majorIn?: string[];
}

// -----------------------------------------------------------------------------
// Traits (开局性格/背景修正)
// -----------------------------------------------------------------------------
export interface Trait {
  id: string;
  name: string;
  desc: string;
  /** one-off stat adjustment applied at character creation */
  startMods?: Effects;
  /** multiplies the magnitude of action effects whose tags match (e.g. {study:1.2}) */
  actionTagMods?: Record<string, number>;
  /** flat additive bonus to weekly action points */
  apMod?: number;
  /** flags set at game start */
  startFlags?: string[];
  /** kind: 'positive' | 'negative' | 'neutral' — for UI tinting only */
  kind?: 'positive' | 'negative' | 'neutral';
}

// -----------------------------------------------------------------------------
// Actions (每回合可主动选择的行动)
// -----------------------------------------------------------------------------
export interface ActionRisk {
  /** 0..1 probability of pulling a random event from `eventPool` after the action */
  chance: number;
  eventPool: string; // matches GameEvent.pool
}

export interface GameAction {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  icon?: string;
  /** action-point cost (usually 1) */
  apCost: number;
  /** base stat effects */
  effects: Effects;
  /** thematic tags, used by traits and routes: study/work/social/rest/career/life/cook/admin/explore */
  tags: string[];
  /** which growth routes this action feeds, with weight */
  routeWeights?: Record<string, number>;
  /** availability gate */
  unlock?: Condition;
  /** optional incidental event chance */
  risk?: ActionRisk;
  /** extra effects applied each time it is repeated within the same week (fatigue) */
  repeatPenalty?: Effects;
  /** flags set when taken */
  setFlags?: Record<string, FlagValue>;
}

// -----------------------------------------------------------------------------
// Events (随机事件)
// -----------------------------------------------------------------------------
export interface Choice {
  text: string;
  resultText: string;
  effects: Effects;
  setFlags?: Record<string, FlagValue>;
  routeWeights?: Record<string, number>;
  /** only show this choice if condition holds (e.g. need money to pay) */
  requires?: Condition;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  /** thematic bucket: study/life/social/career/emotion/crisis */
  category: string;
  /** relative draw weight among eligible events */
  weight: number;
  /** trigger gate */
  cond?: Condition;
  /** event only fires at most once per playthrough */
  oncePerGame?: boolean;
  /** restrict to action-risk pools; '' / undefined = general weekly pool */
  pool?: string;
  rarity?: 'common' | 'uncommon' | 'rare';
  choices: Choice[];
}

// -----------------------------------------------------------------------------
// Endings (多结局)
// -----------------------------------------------------------------------------
export interface Ending {
  id: string;
  title: string;
  desc: string;
  /** one-line humorous sign-off */
  quip: string;
  /** tone bucket, not a pass/fail binary */
  tone: 'good' | 'mixed' | 'bad' | 'special';
  /** higher priority is checked first; first satisfied ending wins */
  priority: number;
  cond: Condition;
  art?: string;
  /** if true, this ending can fire mid-game (crisis); else only at the finale */
  crisis?: boolean;
}

// -----------------------------------------------------------------------------
// Runtime game state
// -----------------------------------------------------------------------------
export interface LogEntry {
  week: number;
  term: number;
  year: number;
  text: string;
  kind: 'action' | 'event' | 'weekly' | 'system' | 'milestone';
}

export type GamePhase =
  | 'menu'
  | 'creating'
  | 'playing' // choosing actions this week
  | 'event' // an event modal is pending
  | 'weekly' // weekly summary screen
  | 'ended';

export interface CharacterConfig {
  playerName: string;
  city: string;
  universityType: string;
  major: string;
  budget: string; // family budget tier id
  englishLevel: string; // english level tier id
  traits: string[];
}

export interface GameState {
  /** save schema version, for migration/invalidColder handling */
  version: number;
  config: CharacterConfig;
  // time
  week: number; // 1..WEEKS_PER_TERM
  term: number; // 1..TERMS_PER_YEAR
  year: number; // 1..MAX_YEARS
  totalWeeks: number; // monotonic counter across the whole game
  // turn economy
  actionPoints: number;
  maxActionPoints: number;
  // stats
  stats: Stats;
  // narrative state
  flags: Record<string, FlagValue>;
  routeScores: Record<string, number>;
  firedEvents: string[]; // ids of once-per-game events already seen
  recentEvents: string[]; // sliding window to avoid repeats
  actionsThisWeek: string[];
  history: LogEntry[];
  unlockedEndings: string[];
  // phase machine
  phase: GamePhase;
  pendingEventId?: string | null;
  endingId?: string | null;
  // deterministic RNG
  rngState: number;
}
