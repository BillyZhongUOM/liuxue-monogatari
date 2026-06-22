import { useEffect } from 'react';
import type { GameState } from '../game';
import { WEEKS_PER_TERM } from '../game';
import { useNotify } from './notifyStore';
import { assetUrl } from './theme';

// iOS-style phone: a drop-down notification banner after each action, and a
// summonable lock screen showing the whole feed. Notifications come from the
// game history via PhoneManager. UI-only.

const APP_META: Record<string, { name: string; emoji: string; tint: string }> = {
  chat: { name: '消息', emoji: '💬', tint: '#4aa86a' },
  mail: { name: '邮件', emoji: '✉️', tint: '#5b8bd0' },
  bank: { name: '账单管家', emoji: '💳', tint: '#d8902a' },
  school: { name: '学院通知', emoji: '🎓', tint: '#c0504a' },
  system: { name: '系统', emoji: '⚙️', tint: '#7a7f9c' },
  moments: { name: '今天的你', emoji: '📷', tint: '#d97a3a' },
};
function meta(app: string) {
  return APP_META[app] ?? { name: '通知', emoji: '📱', tint: '#7a7f9c' };
}

function AppIcon({ app, size }: { app: string; size: number }) {
  const url = assetUrl(`app-${app}`);
  const m = meta(app);
  return (
    <span
      className="phone-appicon"
      style={{ width: size, height: size, background: url ? undefined : m.tint }}
      aria-hidden
    >
      {url ? <img src={url} alt="" width={size} height={size} /> : <span style={{ fontSize: size * 0.56 }}>{m.emoji}</span>}
    </span>
  );
}

// ----------------------------------------------------------------- banner
export function PhoneBanner() {
  const banner = useNotify((s) => s.banner);
  const clearBanner = useNotify((s) => s.clearBanner);
  const openPhone = useNotify((s) => s.openPhone);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => clearBanner(), 3800);
    return () => window.clearTimeout(t);
  }, [banner, clearBanner]);

  if (!banner) return null;
  const m = meta(banner.app);
  return (
    <button className="phone-banner" onClick={openPhone}>
      <AppIcon app={banner.app} size={34} />
      <span className="phone-banner__body">
        <span className="phone-banner__top">
          <span className="phone-banner__app">{banner.title || m.name}</span>
          <span className="phone-banner__time">现在</span>
        </span>
        <span className="phone-banner__text">{banner.body}</span>
      </span>
    </button>
  );
}

// ----------------------------------------------------------------- lock screen
export function PhoneScreen({ state }: { state: GameState | null }) {
  const open = useNotify((s) => s.phoneOpen);
  const close = useNotify((s) => s.closePhone);
  const items = useNotify((s) => s.items);
  if (!open) return null;

  const dateLine = state
    ? `第 ${state.year} 年 · 第 ${state.term} 学期 · 第 ${state.week}/${WEEKS_PER_TERM} 周`
    : '留学生活';
  const wallpaper = assetUrl('phone-wallpaper');
  const feed = [...items].reverse();

  return (
    <div className="phone-backdrop" onClick={close}>
      <div
        className="phone-device"
        style={wallpaper ? { backgroundImage: `url(${wallpaper})` } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="phone-statusbar">
          <span>20:24</span>
          <span className="phone-notch" aria-hidden />
          <span className="phone-statusbar__right" aria-hidden>
            <span>•••</span>
            <span>📶</span>
            <span>🔋</span>
          </span>
        </div>
        <div className="phone-clock" aria-hidden>
          <div className="phone-clock__time">20:24</div>
          <div className="phone-clock__date">{dateLine}</div>
        </div>
        <div className="phone-feed">
          {feed.length === 0 ? (
            <div className="phone-empty">暂时没有新消息。出门做点事，手机就热闹了。</div>
          ) : (
            feed.map((n) => (
              <div key={n.id} className="phone-notif">
                <AppIcon app={n.app} size={30} />
                <div className="phone-notif__body">
                  <div className="phone-notif__top">
                    <span className="phone-notif__app">{n.title || meta(n.app).name}</span>
                    <span className="phone-notif__week">第 {n.week} 周</span>
                  </div>
                  <div className="phone-notif__text">{n.body}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <button className="phone-close" onClick={close}>
          收起手机
        </button>
      </div>
    </div>
  );
}
