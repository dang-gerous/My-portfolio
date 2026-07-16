import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const CORD_REST = 90;
const CORD_PULLED = 136;
const SWING_RADIUS = 260;
const MAX_ANGLE = 42;

export function PullCord() {
  const { theme, toggle } = useTheme();
  const [angle, setAngle] = useState(0);
  const [cordLen, setCordLen] = useState(CORD_REST);
  const [showHint, setShowHint] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const cordRef = useRef(CORD_REST);
  const cordTargetRef = useRef(CORD_REST);
  const rafRef = useRef(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      const mx = rect.left + rect.width / 2;
      const my = rect.top + rect.height / 2;
      const dx = e.clientX - mx;
      const dy = e.clientY - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < SWING_RADIUS) {
        const inf = Math.pow(1 - dist / SWING_RADIUS, 0.5);
        targetAngleRef.current = (dx / SWING_RADIUS) * MAX_ANGLE * inf;
      } else {
        targetAngleRef.current = 0;
      }
    };

    const tick = () => {
      // angle lerp
      angleRef.current += (targetAngleRef.current - angleRef.current) * 0.1;
      setAngle(angleRef.current);
      // cord length lerp
      cordRef.current += (cordTargetRef.current - cordRef.current) * 0.13;
      setCordLen(cordRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleClick = () => {
    cordTargetRef.current = CORD_PULLED;
    toggle();
    setTimeout(() => { cordTargetRef.current = CORD_REST; }, 320);
  };

  const isOn = theme.isDark;

  // SVG total height = cord + bulb body
  const BULB_H = 54;
  const svgH = cordLen + BULB_H;
  const CX = 19; // horizontal center of SVG (width=38)

  return (
    <div style={{ position: 'fixed', right: 28, top: 56, zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Fixed ceiling mount */}
      <div ref={mountRef} style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          width: 22, height: 8,
          background: 'linear-gradient(to bottom, #8a8a8a, #5e5e5e)',
          borderRadius: '3px 3px 0 0',
          boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
        }} />
        <div style={{ position: 'absolute', top: 2, left: 4, width: 3, height: 3, borderRadius: '50%', background: '#333' }} />
        <div style={{ position: 'absolute', top: 2, right: 4, width: 3, height: 3, borderRadius: '50%', background: '#333' }} />
        {/* small nub that overlaps the SVG top */}
        <div style={{ width: 6, height: 6, background: '#5e5e5e', borderRadius: '0 0 3px 3px', margin: '0 auto' }} />
      </div>

      {/* Rotating assembly — single SVG so cord is always intact */}
      <div
        onClick={handleClick}
        onMouseEnter={() => setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
        style={{
          transformOrigin: 'top center',
          transform: `rotate(${angle}deg)`,
          cursor: 'pointer',
          willChange: 'transform',
          marginTop: -3, // overlap mount nub to eliminate gap
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <svg
          width={38}
          height={svgH}
          viewBox={`0 0 38 ${svgH}`}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            {/* Square source → blocky halo matches pixel aesthetic */}
            <filter id="pxGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="8" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── Pixel cord ── alternating dark/medium segments */}
          {Array.from({ length: Math.ceil(cordLen / 4) }).map((_, i) => (
            <rect key={i} x={CX - 2} y={i * 4} width={4}
              height={Math.min(4, cordLen - i * 4)}
              fill={i % 2 === 0 ? '#6e6e6e' : '#4a4a4a'} />
          ))}

          {/* ── Square glow halo (on state) ── */}
          {isOn && (
            <rect x={CX - 18} y={cordLen + 14} width={36} height={28}
              fill="#FFD600" opacity={0.35} filter="url(#pxGlow)" />
          )}

          {/* ── Striped metal socket ── black outline + 6 alternating stripe rows */}
          {/* Top border */}
          <rect x={13} y={cordLen + 0} width={12} height={2} fill="#222" />
          {/* 6 stripe rows */}
          {[0, 1, 2, 3, 4, 5].map(si => (
            <g key={`s${si}`}>
              <rect x={13} y={cordLen + 2 + si * 2} width={2} height={2} fill="#222" />
              <rect x={15} y={cordLen + 2 + si * 2} width={8} height={2}
                fill={si % 2 === 0 ? '#AAAAAA' : '#777777'} />
              <rect x={23} y={cordLen + 2 + si * 2} width={2} height={2} fill="#222" />
            </g>
          ))}
          {/* Bottom border / glass junction */}
          <rect x={12} y={cordLen + 14} width={14} height={2} fill="#222" />

          {/* ── Glass globe ── black outline → orange rim → yellow fill */}
          {([
            [12, 14], [11, 16], [10, 18], [10, 18], [10, 18],
            [11, 16], [12, 14], [13, 12], [14, 10],
            [15,  8], [16,  6], [17,  4],
          ] as Array<[number, number]>).map(([ox, ow], i) => {
            const gy = cordLen + 16 + i * 2;
            return (
              <g key={`gl${i}`}>
                {/* Black outline */}
                <rect x={ox} y={gy} width={ow} height={2} fill="#222" />
                {/* Orange rim (inset 2 px each side) */}
                {ow > 4 && (
                  <rect x={ox + 2} y={gy} width={ow - 4} height={2}
                    fill={isOn ? '#FF8C00' : '#848484'}
                    style={{ transition: 'fill 0.35s' }} />
                )}
                {/* Yellow fill (inset 2 px more) */}
                {ow > 8 && (
                  <rect x={ox + 4} y={gy} width={ow - 8} height={2}
                    fill={isOn ? '#FFD600' : '#C0C0C0'}
                    style={{ transition: 'fill 0.35s' }} />
                )}
              </g>
            );
          })}

          {/* ── White glass highlight (top-left corner) ── */}
          <rect x={13} y={cordLen + 18} width={4} height={2}
            fill="#FFFFFF" opacity={isOn ? 0.75 : 0.5} />
          <rect x={13} y={cordLen + 20} width={2} height={2}
            fill="#FFFFFF" opacity={isOn ? 0.5 : 0.3} />

          {/* ── Pixel filament (arch shape: top bar + two legs + stem) ── */}
          {/* Top bar of arch */}
          <rect x={16} y={cordLen + 24} width={6} height={2}
            fill={isOn ? '#FFF9C4' : '#888'} style={{ transition: 'fill 0.35s' }} />
          {/* Left leg */}
          <rect x={16} y={cordLen + 26} width={2} height={2}
            fill={isOn ? '#FFF9C4' : '#777'} style={{ transition: 'fill 0.35s' }} />
          {/* Right leg */}
          <rect x={20} y={cordLen + 26} width={2} height={2}
            fill={isOn ? '#FFF9C4' : '#777'} style={{ transition: 'fill 0.35s' }} />
          {/* Stem */}
          <rect x={18} y={cordLen + 28} width={2} height={2}
            fill={isOn ? '#FFF9C4' : '#777'} style={{ transition: 'fill 0.35s' }} />
        </svg>
      </div>

      {/* Tooltip */}
      {showHint && (
        <div style={{
          position: 'absolute', right: 50, top: 60,
          background: theme.isDark ? '#F9F8F3' : '#13101C',
          color: theme.isDark ? '#13101C' : '#F9F8F3',
          padding: '5px 10px', borderRadius: '6px',
          fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap',
          fontFamily: "'Space Grotesk', sans-serif",
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          pointerEvents: 'none', letterSpacing: '0.05em',
        }}>
          {isOn ? '☀️ Light mode' : '🌙 Dark mode'}
        </div>
      )}
    </div>
  );
}
