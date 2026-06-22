import { create } from 'zustand';

// Phone notifications. The game's history log is the source: PhoneManager turns
// each new LogEntry into a notification here, the banner shows the newest, and the
// lock screen (the 📱 button) shows the whole feed. UI-only; never touches the engine.
export interface Notif {
  id: number;
  app: string; // app id -> icon asset app-<id> + colour
  title: string;
  body: string;
  week: number;
}

interface NotifStore {
  items: Notif[];
  banner: Notif | null; // the newest, shown briefly as a drop-down banner
  unread: number;
  phoneOpen: boolean;
  push: (n: Omit<Notif, 'id'>) => void;
  seed: (ns: Omit<Notif, 'id'>[]) => void; // fill the feed from backlog, no banner
  clearBanner: () => void;
  openPhone: () => void;
  closePhone: () => void;
  reset: () => void;
}

let seq = 1;

export const useNotify = create<NotifStore>((set, get) => ({
  items: [],
  banner: null,
  unread: 0,
  phoneOpen: false,
  push: (n) => {
    const notif: Notif = { ...n, id: seq++ };
    const open = get().phoneOpen;
    set((s) => ({
      items: [...s.items, notif].slice(-40),
      banner: open ? null : notif,
      unread: open ? 0 : s.unread + 1,
    }));
  },
  seed: (ns) => set({ items: ns.map((n) => ({ ...n, id: seq++ })).slice(-40), banner: null }),
  clearBanner: () => set({ banner: null }),
  openPhone: () => set({ phoneOpen: true, unread: 0, banner: null }),
  closePhone: () => set({ phoneOpen: false }),
  reset: () => set({ items: [], banner: null, unread: 0, phoneOpen: false }),
}));
