import type { Zone } from './locations';

// Animated ambience layers on the map stage: drifting clouds + a shimmering
// "flowing" river on the town map + a per-city signature landmark (London Eye
// turning, Bristol balloon, Edinburgh flag, Oxbridge punt, others get birds).
// Pure CSS/SVG motion over the dusk diorama; sits behind the building nodes.
// All animation is disabled under prefers-reduced-motion via the global rule.

function FerrisWheel() {
  // London Eye: the wheel spins; capsules hang and stay upright.
  const spokes = Array.from({ length: 10 });
  const r = 30;
  return (
    <svg className="amb-landmark amb-landmark--ferris" viewBox="0 0 80 90" width="80" height="90" aria-hidden>
      <line x1="40" y1="36" x2="34" y2="86" stroke="#2a3251" strokeWidth="2" />
      <line x1="40" y1="36" x2="46" y2="86" stroke="#2a3251" strokeWidth="2" />
      <g className="amb-ferris-spin" style={{ transformOrigin: '40px 36px' }}>
        <circle cx="40" cy="36" r={r} fill="none" stroke="#f4b04a" strokeWidth="1.6" />
        <circle cx="40" cy="36" r={r - 5} fill="none" stroke="#f4b04a" strokeWidth="0.8" opacity="0.6" />
        {spokes.map((_, i) => {
          const a = (i / spokes.length) * Math.PI * 2;
          return <line key={i} x1="40" y1="36" x2={40 + Math.cos(a) * r} y2={36 + Math.sin(a) * r} stroke="#d8902a" strokeWidth="0.9" opacity="0.8" />;
        })}
        {spokes.map((_, i) => {
          const a = (i / spokes.length) * Math.PI * 2;
          return <circle key={`c${i}`} cx={40 + Math.cos(a) * r} cy={36 + Math.sin(a) * r} r="2.4" fill="#ffd98a" stroke="#d8902a" strokeWidth="0.5" />;
        })}
      </g>
      <circle cx="40" cy="36" r="3" fill="#d8902a" />
      <path d="M30 86 L50 86 L46 82 L34 82 Z" fill="#2a3251" />
    </svg>
  );
}

function Balloon() {
  return (
    <svg className="amb-landmark amb-landmark--balloon" viewBox="0 0 40 56" width="40" height="56" aria-hidden>
      <g className="amb-balloon-float">
        <path d="M20 4 C8 4 4 14 4 22 C4 30 12 36 20 38 C28 36 36 30 36 22 C36 14 32 4 20 4 Z" fill="#e07a4a" stroke="#b85d36" strokeWidth="1" />
        <path d="M20 4 C16 10 16 32 20 38" stroke="#f4c8a0" strokeWidth="1" fill="none" opacity="0.7" />
        <path d="M28 4 C30 12 28 32 24 38" stroke="#c75d36" strokeWidth="1" fill="none" opacity="0.6" />
        <line x1="14" y1="37" x2="17" y2="46" stroke="#7a5a3a" strokeWidth="0.7" />
        <line x1="26" y1="37" x2="23" y2="46" stroke="#7a5a3a" strokeWidth="0.7" />
        <rect x="16" y="46" width="8" height="6" rx="1" fill="#8a5a32" stroke="#5e3d22" strokeWidth="0.6" />
      </g>
    </svg>
  );
}

function Flag() {
  return (
    <svg className="amb-landmark amb-landmark--flag" viewBox="0 0 40 50" width="40" height="50" aria-hidden>
      <line x1="8" y1="6" x2="8" y2="48" stroke="#cdd3e8" strokeWidth="1.6" />
      <circle cx="8" cy="6" r="1.8" fill="#f4b04a" />
      <path className="amb-flag-wave" d="M8 9 L34 11 L34 23 L8 21 Z" fill="#5b6fb0" stroke="#3a4a86" strokeWidth="0.6" />
    </svg>
  );
}

function Punt() {
  // a flat boat drifting across the river band
  return (
    <svg className="amb-landmark amb-landmark--punt" viewBox="0 0 56 24" width="56" height="24" aria-hidden>
      <g className="amb-punt-drift">
        <path d="M6 14 L50 14 L46 20 L10 20 Z" fill="#7a5a3a" stroke="#4e3a22" strokeWidth="0.8" />
        <line x1="40" y1="14" x2="46" y2="2" stroke="#cdb38a" strokeWidth="1.2" />
        <circle cx="22" cy="11" r="2.4" fill="#2a3251" />
        <ellipse className="amb-punt-wake" cx="28" cy="21" rx="22" ry="2" fill="#9fb6d8" opacity="0.25" />
      </g>
    </svg>
  );
}

function Tram() {
  // Manchester: a yellow tram glides across on its overhead wire.
  return (
    <svg className="amb-landmark amb-landmark--tram" viewBox="0 0 72 30" width="72" height="30" aria-hidden>
      <g className="amb-tram-drift">
        <line x1="8" y1="5" x2="58" y2="5" stroke="#5a6488" strokeWidth="0.8" />
        <line x1="33" y1="5" x2="33" y2="12" stroke="#8a93b8" strokeWidth="0.8" />
        <rect x="8" y="12" width="48" height="12" rx="2" fill="#f2c94c" stroke="#c79b2e" strokeWidth="1" />
        <rect x="8" y="12" width="48" height="4" rx="2" fill="#e3a92c" />
        <rect x="12" y="16" width="6" height="5" fill="#bfe0ef" />
        <rect x="21" y="16" width="6" height="5" fill="#bfe0ef" />
        <rect x="30" y="16" width="6" height="5" fill="#bfe0ef" />
        <rect x="39" y="16" width="6" height="5" fill="#bfe0ef" />
        <rect x="47" y="16" width="6" height="5" fill="#bfe0ef" />
        <circle cx="18" cy="25" r="2" fill="#2a3251" />
        <circle cx="46" cy="25" r="2" fill="#2a3251" />
      </g>
    </svg>
  );
}

function CanalBoat() {
  // Birmingham: a painted narrowboat drifts along the canal.
  return (
    <svg className="amb-landmark amb-landmark--boat" viewBox="0 0 72 26" width="72" height="26" aria-hidden>
      <g className="amb-boat-drift">
        <path d="M4 14 L64 14 L60 22 L8 22 Z" fill="#2e5a3a" stroke="#1d3a25" strokeWidth="0.8" />
        <rect x="14" y="8" width="40" height="7" rx="1.5" fill="#a23a3a" stroke="#6e2626" strokeWidth="0.7" />
        <circle cx="34" cy="11.5" r="2.4" fill="#f4d36a" stroke="#c79b2e" strokeWidth="0.5" />
        <rect x="18" y="9.5" width="4" height="4" fill="#f4d36a" opacity="0.8" />
        <rect x="46" y="9.5" width="4" height="4" fill="#f4d36a" opacity="0.8" />
        <ellipse className="amb-boat-wake" cx="34" cy="23" rx="28" ry="2" fill="#9fb6d8" opacity="0.22" />
      </g>
    </svg>
  );
}

function Leaves() {
  // Sheffield: the greenest city; autumn leaves drift down.
  const leaves = [
    { c: '#e0883a', x: 8 }, { c: '#c9622e', x: 26 }, { c: '#d9a23a', x: 44 }, { c: '#b8542a', x: 62 }, { c: '#e0a64a', x: 34 },
  ];
  return (
    <svg className="amb-landmark amb-landmark--leaves" viewBox="0 0 80 70" width="80" height="70" aria-hidden>
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x} 0)`}>
          <path className={`amb-leaf amb-leaf--${i}`} d="M0 -4 C4 -4 5 0 0 4 C-5 0 -4 -4 0 -4 Z" fill={l.c} />
        </g>
      ))}
    </svg>
  );
}

function Birds() {
  return (
    <svg className="amb-landmark amb-landmark--birds" viewBox="0 0 60 30" width="60" height="30" aria-hidden>
      <g className="amb-birds-drift" fill="none" stroke="#cdd3e8" strokeWidth="1.4" strokeLinecap="round" opacity="0.7">
        <path className="amb-bird-flap" d="M6 14 Q10 9 14 14 Q18 9 22 14" />
        <path className="amb-bird-flap amb-bird-flap--b" d="M26 8 Q29 4 32 8 Q35 4 38 8" />
        <path className="amb-bird-flap" d="M40 16 Q43 12 46 16 Q49 12 52 16" />
      </g>
    </svg>
  );
}

function landmarkFor(city: string, zone: Zone) {
  switch (city) {
    case 'london':
      return <FerrisWheel />;
    case 'bristol':
      return <Balloon />;
    case 'edinburgh':
      return <Flag />;
    case 'cambridge':
    case 'oxford':
      return zone === 'town' ? <Punt /> : <Birds />;
    case 'manchester':
      return zone === 'town' ? <Tram /> : <Birds />;
    case 'birmingham':
      return zone === 'town' ? <CanalBoat /> : <Birds />;
    case 'sheffield':
      return <Leaves />;
    default:
      return <Birds />;
  }
}

// a few warm window glints twinkling in the skyline band, on every map
function WindowGlints() {
  const spots = [
    { left: '12%', top: '14%', d: '0s' }, { left: '24%', top: '9%', d: '-1.4s' },
    { left: '38%', top: '17%', d: '-2.6s' }, { left: '63%', top: '11%', d: '-0.8s' },
    { left: '78%', top: '15%', d: '-3.1s' }, { left: '88%', top: '8%', d: '-1.9s' },
  ];
  return (
    <div className="amb-glints" aria-hidden>
      {spots.map((s, i) => (
        <span key={i} className="amb-glint" style={{ left: s.left, top: s.top, animationDelay: s.d }} />
      ))}
    </div>
  );
}

export function MapAmbience({ city, zone }: { city: string; zone: Zone }) {
  return (
    <div className="map-amb" aria-hidden>
      <span className="amb-cloud amb-cloud--1" />
      <span className="amb-cloud amb-cloud--2" />
      <span className="amb-cloud amb-cloud--3" />
      {zone === 'town' ? <span className="amb-river" /> : null}
      <WindowGlints />
      <div className={`amb-landmark-slot amb-landmark-slot--${city}`}>{landmarkFor(city, zone)}</div>
    </div>
  );
}
