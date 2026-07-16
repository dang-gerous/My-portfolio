import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Github, ExternalLink, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ACCENT = '#C62828';

export function WorkSection() {
  const { theme } = useTheme();
  const barRef = useRef<HTMLDivElement>(null);
  const inView = useInView(barRef, { once: true, margin: '-60px' });
  const [dots, setDots] = useState('.');

  // Animated dots for the "updating" text
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 600);
    return () => clearInterval(id);
  }, []);

  const tags = ['React', 'Node.js', 'JavaScript', 'Figma', 'Supabase'];

  return (
    <section id="work" style={{ padding: '64px 0' }}>
      {/* Section header */}
      <div style={{ marginBottom: '48px' }}>
        <p style={{
          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.15em', color: ACCENT, marginBottom: '8px',
        }}>
          My Work
        </p>
        <h2 style={{
          fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-1px',
          color: theme.text, lineHeight: 1.1,
          transition: 'color 0.3s',
        }}>
          Projects &amp;
          <span style={{ color: ACCENT, marginLeft: '10px' }}>Builds</span>
        </h2>
      </div>

      {/* StudyMate Card */}
      <div style={{
        background: theme.card,
        border: `2px solid ${theme.border}`,
        boxShadow: theme.shadow(),
        borderRadius: '18px',
        padding: '28px 32px',
        transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {/* Left: info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.8rem' }}>📖</span>
              <h3 style={{
                fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.5px',
                color: theme.text, transition: 'color 0.3s',
              }}>
                StudyMate
              </h3>
            </div>
            <p style={{
              fontSize: '0.88rem', color: theme.muted, lineHeight: 1.6,
              maxWidth: '480px', transition: 'color 0.3s',
            }}>
              A collaborative platfrom where students find their perfect study partners and crush academic goals.
            </p>
          </div>

          {/* Right: status badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '6px 14px',
              background: 'rgba(234,179,8,0.12)',
              border: '2px solid #ca8a04',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#ca8a04',
              whiteSpace: 'nowrap',
            }}>
              <Loader2 size={12} style={{ animation: 'spin 2s linear infinite' }} />
              In Progress
            </div>
            <a
              href="https://github.com/CrossNO2/Studymate"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: 'transparent',
                border: `2px solid ${theme.border}`,
                boxShadow: `2px 2px 0 ${theme.border}`,
                borderRadius: '8px',
                color: theme.text,
                textDecoration: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.background = theme.text;
                el.style.color = theme.bg;
                el.style.boxShadow = `3px 3px 0 ${ACCENT}`;
                el.style.transform = 'translate(-1px, -1px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.background = 'transparent';
                el.style.color = theme.text;
                el.style.boxShadow = `2px 2px 0 ${theme.border}`;
                el.style.transform = 'none';
              }}
            >
              <Github size={13} />
              GitHub
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Tech tags */}
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {tags.map(tag => (
            <span key={tag} style={{
              padding: '3px 10px',
              background: theme.isDark ? 'rgba(249,248,243,0.06)' : theme.bg,
              border: `1.5px solid ${theme.border}`,
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              color: theme.text,
              transition: 'all 0.3s',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Progress bar */}
        <div ref={barRef}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Development Progress
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem',
              fontWeight: 700,
              color: ACCENT,
            }}>
              45%
            </span>
          </div>

          {/* Track */}
          <div style={{
            height: '12px',
            background: theme.isDark ? 'rgba(249,248,243,0.08)' : '#e9e9e9',
            border: `2px solid ${theme.border}`,
            borderRadius: '6px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Fill */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: inView ? '45%' : 0 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${ACCENT}, #ef5350)`,
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Shimmer */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                  width: '60%',
                }}
              />
            </motion.div>
          </div>

          {/* Milestone markers */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '6px',
            fontSize: '0.62rem',
            fontFamily: "'JetBrains Mono', monospace",
            color: theme.muted,
            fontWeight: 600,
          }}>
            {['Concept', 'MVP', 'Beta', 'Launch'].map((m, i) => (
              <span key={m} style={{ color: i === 1 ? ACCENT : undefined }}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Coming soon text */}
      <div style={{
        marginTop: '32px',
        textAlign: 'center',
        padding: '20px',
        borderTop: `1px solid ${theme.isDark ? 'rgba(249,248,243,0.08)' : 'rgba(19,16,28,0.08)'}`,
        borderBottom: `1px solid ${theme.isDark ? 'rgba(249,248,243,0.08)' : 'rgba(19,16,28,0.08)'}`,
      }}>
        <p style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: theme.text,
          marginBottom: '6px',
          transition: 'color 0.3s',
        }}>
          ✨ More builds loading{dots}
        </p>
        <p style={{
          fontSize: '0.8rem',
          color: theme.muted,
          lineHeight: 1.6,
          transition: 'color 0.3s',
        }}>
          This space grows as I do. New projects drop regularly — check back soon.
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
