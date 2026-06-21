import { ACTIONS } from '../data';
import type { GameAction } from '../game';

// Map nodes for the 游戏发展国-style overworld. Pure presentation data: the engine
// has no concept of "location" — actions just carry a `location` tag and the map
// groups them. Coordinates are percentages within the map area so they scale to
// any screen width.
export type Zone = 'campus' | 'town';

export interface MapLocation {
  id: string;
  name: string;
  emoji: string;
  zone: Zone;
  x: number; // 0..100 percent
  y: number; // 0..100 percent
}

export const LOCATIONS: MapLocation[] = [
  // --- campus (close together, warm) ---
  { id: 'career', name: '职业中心', emoji: '💼', zone: 'campus', x: 20, y: 30 },
  { id: 'library', name: '图书馆', emoji: '📚', zone: 'campus', x: 50, y: 20 },
  { id: 'lecture', name: '教学楼', emoji: '🏛️', zone: 'campus', x: 80, y: 33 },
  { id: 'dorm', name: '宿舍', emoji: '🛏️', zone: 'campus', x: 22, y: 74 },
  { id: 'gym', name: '健身房', emoji: '🏋️', zone: 'campus', x: 50, y: 80 },
  { id: 'society', name: '社团楼', emoji: '🎉', zone: 'campus', x: 79, y: 74 },
  // --- town (spread out, colder, costs more to reach) ---
  { id: 'market', name: '中超', emoji: '🛒', zone: 'town', x: 18, y: 22 },
  { id: 'town', name: '城中心', emoji: '🏙️', zone: 'town', x: 50, y: 26 },
  { id: 'work', name: '打工', emoji: '🧾', zone: 'town', x: 82, y: 22 },
  { id: 'mall', name: '商场', emoji: '🛍️', zone: 'town', x: 20, y: 50 },
  { id: 'station', name: '火车站', emoji: '🚉', zone: 'town', x: 50, y: 52 },
  { id: 'nightlife', name: '夜店', emoji: '🪩', zone: 'town', x: 80, y: 50 },
  { id: 'clinic', name: '医院', emoji: '🏥', zone: 'town', x: 20, y: 80 },
  { id: 'bank', name: '银行', emoji: '🏦', zone: 'town', x: 50, y: 80 },
  { id: 'park', name: '公园', emoji: '🌳', zone: 'town', x: 82, y: 80 },
];

export const LOCATION_BY_ID: Record<string, MapLocation> = Object.fromEntries(
  LOCATIONS.map((l) => [l.id, l]),
);

export const ZONE_LABEL: Record<Zone, string> = { campus: '校园', town: '城市' };
export const ZONE_HOME: Record<Zone, string> = { campus: 'dorm', town: 'town' };

/** All actions authored for a given location (regardless of unlock state). */
export function actionsAtLocation(locId: string): GameAction[] {
  return ACTIONS.filter((a) => a.location === locId);
}
