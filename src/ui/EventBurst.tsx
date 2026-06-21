import { useEffect } from 'react';
import { eventSkin } from './theme';

// A short, unmissable pixel burst when an event arrives, so the player always
// registers that something happened. Overlay only (pointer-events:none) so the
// event modal beneath stays usable; auto-dismisses after ~750ms. The skin colour
// and glyph come from the event category. Hidden entirely under reduced-motion.
export function EventBurst({ category, onDone }: { category: string; onDone: () => void }) {
  const skin = eventSkin(category);
  useEffect(() => {
    const t = window.setTimeout(onDone, 750);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div className="burst" style={{ ['--skin' as string]: skin.color }} aria-hidden>
      <div className="burst__flash" />
      <div className="burst__ring" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="burst__shard" style={{ ['--rot' as string]: `${i * 45}deg` }} />
      ))}
      <div className="burst__core">
        <span className="burst__glyph">
          {skin.emoji}
          <span className="burst__bang">!</span>
        </span>
        <span className="burst__kicker">{skin.kicker}</span>
      </div>
    </div>
  );
}
