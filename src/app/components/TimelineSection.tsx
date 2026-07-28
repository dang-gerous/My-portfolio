import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useIsMobile } from '../hooks/useIsMobile';

const ACCENT = '#C62828';

const milestones = [
  { year: '2007', title: 'Born in Vietnam', description: 'Came into the world in Hanoi — the city of peace.', icon: '🍼' },
  { year: '2021', title: 'First Computer', description: 'My big bro surprised me with a Macbook and I immediately fell down the rabbit hole of the internet.', icon: '💻' },
  { year: '2022', title: 'High School', description: 'Entered Phan Dinh Phung HS — discovered math, competitions and problem-solving.', icon: '📚' },
  { year: '2022', title: 'First Code', description: 'Wrote my first lines of C when bored. The gateway was open.', icon: '🐍' },
  { year: '2025', title: 'Graduated HS', description: 'Finished Phan Dinh Phung with strong results. Onto the next chapter.', icon: '🎓' },
  { year: '2025', title: 'University', description: 'Enrolled in Computer Science at PTIT. The real journey begins.', icon: '🏫' },
  { year: '2026', title: 'Building Things', description: 'Started shipping real projects — web apps, games, and this portfolio.', icon: '🛠️' },
];

function SkateboardSVG({ isDark }: { isDark: boolean }) {
  const deck = isDark ? '#F9F8F3' : '#13101C';
  return (
    <svg viewBox="0 0 130 48" width="110" height="40" style={{ display: 'block' }}>
      <path d="M12 16 Q16 10 26 14 L104 14 Q114 10 118 16 L118 24 Q114 28 104 26 L26 26 Q16 28 12 24 Z" fill={deck} />
      <path d="M40 17 L90 17" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="94" y="26" width="16" height="5" rx="2" fill="#555" />
      <rect x="20" y="26" width="16" height="5" rx="2" fill="#555" />
      <circle cx="103" cy="37" r="9" fill={ACCENT} />
      <circle cx="103" cy="37" r="4" fill={deck} />
      <circle cx="103" cy="37" r="1.5" fill="#888" />
      <circle cx="27" cy="37" r="9" fill={ACCENT} />
      <circle cx="27" cy="37" r="4" fill={deck} />
      <circle cx="27" cy="37" r="1.5" fill="#888" />
      <path d="M12 20 L6 12" stroke={deck} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function TimelineSection() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [hovered, setHovered] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const n = milestones.length;
  const pct = (i: number) => (i / (n - 1)) * 100;

  // Close popup when tapping outside on mobile
  useEffect(() => {
    if (!isMobile) return;
    const handler = (e: TouchEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
        setHovered(null);
      }
    };
    document.addEventListener('touchstart', handler);
    return () => document.removeEventListener('touchstart', handler);
  }, [isMobile]);

  return (
    <section id="timeline" ref={sectionRef} style={{ padding: isMobile ? '40px 0' : '64px 0' }}>
      <div style={{ marginBottom: '56px' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: ACCENT, marginBottom: '8px' }}>
          My Journey
        </p>
        <h2 style={{ fontSize: isMobile ? '1.7rem' : '2.2rem', fontWeight: 800, letterSpacing: '-1px', color: theme.text, lineHeight: 1.1, transition: 'color 0.35s' }}>
          A Life on the
          <span style={{ color: ACCENT, borderBottom: `3px solid ${ACCENT}`, paddingBottom: 2, marginLeft: 10 }}>Board</span>
        </h2>
      </div>

      <div style={{ position: 'relative', padding: '0 0 100px', userSelect: 'none' }}>
        {/* Rail */}
        <div style={{ position: 'relative', height: 4, background: theme.border, borderRadius: 2 }}>
          <motion.div
            style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: ACCENT, borderRadius: 2, originX: 0 }}
            animate={{ width: hovered !== null ? `${pct(hovered)}%` : '0%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          />
        </div>

        {/* Skateboard */}
        <motion.div
          style={{ position: 'absolute', top: -44, translateX: '-50%', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}
          animate={{ left: hovered !== null ? `${pct(hovered)}%` : '-70px', opacity: hovered !== null ? 1 : 0, rotateZ: hovered !== null ? 0 : -12 }}
          transition={{ type: 'spring', stiffness: 180, damping: 28 }}
        >
          <SkateboardSVG isDark={theme.isDark} />
        </motion.div>

        {/* Dots + labels + popups */}
        {milestones.map((m, i) => (
          <div key={`${m.year}-${i}`} style={{ position: 'absolute', left: `${pct(i)}%`, top: 0, transform: 'translateX(-50%)' }}>
            <motion.button
              /* Desktop hover */
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
              /* Mobile touch — tap toggles popup */
              onTouchStart={(e) => {
                e.preventDefault();
                setHovered(h => h === i ? null : i);
              }}
              animate={{
                scale: hovered === i ? 1.45 : 1,
                backgroundColor: hovered === i ? ACCENT : theme.text,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: isMobile ? 24 : 18,
                height: isMobile ? 24 : 18,
                borderRadius: '50%',
                border: `3px solid ${theme.text}`,
                display: 'block', cursor: 'pointer', outline: 'none',
                marginTop: isMobile ? -10 : -7,
                position: 'relative', zIndex: 10,
                background: theme.text,
                boxShadow: hovered === i ? '0 0 0 4px rgba(198,40,40,0.25)' : 'none',
                touchAction: 'manipulation',
              }}
            />

            <div style={{ marginTop: 14, textAlign: 'center', transform: 'translateX(-50%)', marginLeft: isMobile ? 12 : 9, width: isMobile ? 38 : 58 }}>
              <span style={{ fontSize: isMobile ? '0.6rem' : '0.72rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: hovered === i ? ACCENT : theme.muted, transition: 'color 0.2s', display: 'block' }}>
                {m.year}
              </span>
            </div>

            <AnimatePresence>
              {hovered === i && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.94 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', top: isMobile ? 72 : 66,
                    /* Keep popup in viewport on mobile — flip for first/last dots */
                    left: i === 0 ? '0%' : i === n - 1 ? 'auto' : '50%',
                    right: i === n - 1 ? '0%' : undefined,
                    transform: i === 0 || i === n - 1 ? 'none' : 'translateX(-50%)',
                    width: isMobile ? 180 : 200,
                    background: theme.card, border: `2px solid ${theme.border}`,
                    boxShadow: `4px 4px 0 ${ACCENT}`,
                    borderRadius: 12, padding: 16, zIndex: 20, pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{m.icon}</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: ACCENT, marginBottom: 4 }}>{m.year}</div>
                  <div style={{ fontSize: '0.87rem', fontWeight: 700, color: theme.text, marginBottom: 6, lineHeight: 1.3 }}>{m.title}</div>
                  <p style={{ fontSize: '0.75rem', color: theme.muted, lineHeight: 1.5 }}>{m.description}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.78rem', color: theme.muted, textAlign: 'center', marginTop: 16, fontStyle: 'italic', transition: 'color 0.35s' }}>
        {isMobile ? 'Tap the dots to skate through time' : 'Hover the dots to skate through time'}
      </p>
    </section>
  );
}
