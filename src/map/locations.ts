import { ACTIONS } from '../data';
import type { GameAction } from '../game';

// Map nodes for the 游戏发展国-style overworld. Pure presentation data: the engine
// has no concept of "location" — actions just carry a `location` tag and the map
// groups them.
//
// Coordinates are authored on a LOGICAL GRID (col/row + footprint w/h) so the 15
// node positions are reproducible and shared across all 8 per-city grounds (the
// terrain image is a neutral backdrop, never a layout source). The renderer still
// reads percentages, so we derive x/y once at module load:
//   x = footprint horizontal centre, y = footprint FEET line (bottom edge).
// This keeps the robust percentage rendering (no aspect-lock, scales 320-430px)
// while giving a single grid source of truth a future PixiJS layer can reuse.
export type Zone = 'campus' | 'town';

// Logical authoring grid (never a pixel grid).
const COLS = 12;
const ROWS = 14;

export interface MapLocation {
  id: string;
  name: string;
  emoji: string;
  zone: Zone;
  col: number;
  row: number;
  w: number;
  h: number;
  x: number; // derived: footprint-centre, 0..100 percent
  y: number; // derived: feet line (footprint bottom), 0..100 percent
}

type GridNode = Omit<MapLocation, 'x' | 'y'>;

// Reserved safe play-band: footprint-centre x in [12,88], feet y in [26,86].
// The regenerated terrain keeps river/stairs/castle in the top strip + side
// gutters only, so every node lands on the flat central band.
const GRID: GridNode[] = [
  // --- campus (compact, warm quad) ---
  { id: 'career', name: '职业中心', emoji: '💼', zone: 'campus', col: 1, row: 2, w: 2, h: 2 },
  { id: 'library', name: '图书馆', emoji: '📚', zone: 'campus', col: 5, row: 1, w: 2, h: 2 },
  { id: 'lecture', name: '教学楼', emoji: '🏛️', zone: 'campus', col: 9, row: 2, w: 2, h: 2 },
  { id: 'dorm', name: '宿舍', emoji: '🛏️', zone: 'campus', col: 1, row: 8, w: 2, h: 2 },
  { id: 'gym', name: '健身房', emoji: '🏋️', zone: 'campus', col: 5, row: 9, w: 2, h: 2 },
  { id: 'society', name: '社团楼', emoji: '🎉', zone: 'campus', col: 9, row: 8, w: 2, h: 2 },
  // --- town (spread out, cooler 3x3 city block) ---
  { id: 'market', name: '中超', emoji: '🛒', zone: 'town', col: 1, row: 2, w: 2, h: 2 },
  { id: 'town', name: '城中心', emoji: '🏙️', zone: 'town', col: 5, row: 2, w: 2, h: 2 },
  { id: 'work', name: '打工', emoji: '🧾', zone: 'town', col: 9, row: 2, w: 2, h: 2 },
  { id: 'mall', name: '商场', emoji: '🛍️', zone: 'town', col: 1, row: 5, w: 2, h: 2 },
  { id: 'station', name: '火车站', emoji: '🚉', zone: 'town', col: 5, row: 5, w: 2, h: 2 },
  { id: 'nightlife', name: '夜店', emoji: '🪩', zone: 'town', col: 9, row: 5, w: 2, h: 2 },
  { id: 'clinic', name: '医院', emoji: '🏥', zone: 'town', col: 1, row: 8, w: 2, h: 2 },
  { id: 'bank', name: '银行', emoji: '🏦', zone: 'town', col: 5, row: 8, w: 2, h: 2 },
  { id: 'park', name: '公园', emoji: '🌳', zone: 'town', col: 9, row: 8, w: 2, h: 2 },
];

const pct = (v: number) => Math.round(v * 10) / 10;

export const LOCATIONS: MapLocation[] = GRID.map((g) => ({
  ...g,
  x: pct(((g.col + g.w / 2) / COLS) * 100),
  y: pct(((g.row + g.h) / ROWS) * 100),
}));

export const LOCATION_BY_ID: Record<string, MapLocation> = Object.fromEntries(
  LOCATIONS.map((l) => [l.id, l]),
);

export const ZONE_LABEL: Record<Zone, string> = { campus: '校园', town: '城市' };
export const ZONE_HOME: Record<Zone, string> = { campus: 'dorm', town: 'town' };

/** All actions authored for a given location (regardless of unlock state). */
export function actionsAtLocation(locId: string): GameAction[] {
  return ACTIONS.filter((a) => a.location === locId);
}
