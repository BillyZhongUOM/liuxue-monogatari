import { useEffect, useRef } from 'react';
import type { LogEntry } from '../game';
import { useGame } from '../store';
import { useNotify } from './notifyStore';

// Turns the game's history log into phone notifications. Reads game state
// read-only; never dispatches. The engine never learns about it.
const APP_BY_KIND: Record<LogEntry['kind'], string> = {
  action: 'moments',
  event: 'chat',
  weekly: 'bank',
  milestone: 'school',
  system: 'system',
};
const TITLE_BY_APP: Record<string, string> = {
  moments: '今天的你',
  chat: '消息',
  bank: '账单管家',
  school: '学院通知',
  system: '系统',
};

function toNotif(e: LogEntry): { app: string; title: string; body: string; week: number } {
  let app = APP_BY_KIND[e.kind] ?? 'system';
  let title = TITLE_BY_APP[app];
  let body = e.text;
  // event log lines read 【标题】正文 -> render as a chat message from that sender
  const m = body.match(/^【(.+?)】(.*)$/);
  if (m) {
    app = 'chat';
    title = m[1];
    body = m[2].trim();
  }
  return { app, title, body, week: e.week };
}

export function PhoneManager() {
  const state = useGame((s) => s.state);
  const histLen = state?.history.length ?? 0;
  const seenLen = useRef(-1);

  useEffect(() => {
    if (!state) {
      seenLen.current = -1;
      useNotify.getState().reset();
      return;
    }
    const h = state.history;
    if (seenLen.current < 0 || h.length < seenLen.current) {
      // first sight of this game (or a new game): seed the recent backlog quietly
      useNotify.getState().seed(h.slice(-6).map(toNotif));
      seenLen.current = h.length;
      return;
    }
    for (let i = seenLen.current; i < h.length; i++) {
      useNotify.getState().push(toNotif(h[i]));
    }
    seenLen.current = h.length;
  }, [state, histLen]);

  return null;
}
