import { useState, useRef, useEffect } from 'react';
import { Search, X, Mail, Coffee } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ALL_ITEMS = [
  { label: 'About Me', id: 'hero' },
  { label: 'Education — PTIT', id: 'hero' },
  { label: 'Phan Dinh Phung High School', id: 'hero' },
  { label: 'Tech Skills', id: 'hero' },
  { label: 'Hobbies', id: 'hero' },
  { label: 'Contacts & Social Links', id: 'hero' },
  { label: 'Timeline — Life Journey', id: 'timeline' },
  { label: 'StudyMate Project', id: 'work' },
  { label: 'My Work & Projects', id: 'work' },
  { label: 'Play Circular Pong', id: 'game' },
  { label: 'Skill: JavaScript', id: 'hero' },
  { label: 'Skill: React', id: 'hero' },
  { label: 'Skill: Python', id: 'hero' },
  { label: 'Skill: TypeScript', id: 'hero' },
  { label: 'Hobby: Dancing', id: 'hero' },
  { label: 'Hobby: Music', id: 'hero' },
  { label: 'Hobby: Basketball', id: 'hero' },
  { label: 'Hobby: Gym', id: 'hero' },
];

export function NavBar() {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length > 0
    ? ALL_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setQuery('');
    setOpen(false);
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    /*
     * CSS grid with `1fr auto 1fr` guarantees the center column (search)
     * is always mathematically centered in the nav, regardless of how
     * wide the left content grows.
     */
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      backgroundColor: theme.bg,
      borderBottom: `2px solid ${theme.border}`,
      padding: '0 28px',
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      height: '56px',
      transition: 'background-color 0.35s, border-color 0.35s',
    }}>

      {/* ── Left cell: PKD. | nav links ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button onClick={() => scrollTo('hero')} style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px',
          color: theme.text, background: 'none', border: 'none',
          cursor: 'pointer', padding: '0 6px', flexShrink: 0,
          transition: 'color 0.35s',
        }}>
          PKD<span style={{ color: theme.accent }}>.</span>
        </button>

        <div style={{ width: 1, height: 22, background: theme.border, opacity: 0.25, margin: '0 4px', flexShrink: 0 }} />

        {[{ label: 'About', id: 'hero' }, { label: 'Timeline', id: 'timeline' }, { label: 'Work', id: 'work' }, { label: 'Game', id: 'game' }].map(({ label, id }) => (
          <NavBtn key={id} label={label} onClick={() => scrollTo(id)} theme={theme} />
        ))}
      </div>

      {/* ── Center cell: search bar — perfectly centered by grid ── */}
      <div ref={wrapRef} style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 14px',
          background: theme.isDark ? 'rgba(249,248,243,0.06)' : '#fff',
          border: `2px solid ${open ? theme.accent : theme.border}`,
          boxShadow: open ? `2px 2px 0 ${theme.accent}` : `2px 2px 0 ${theme.border}`,
          borderRadius: '10px', width: '300px',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}>
          <Search size={14} color={theme.muted} style={{ flexShrink: 0 }} />
          <input
            type="text" placeholder="Search anything..." value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '0.82rem', fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500, color: theme.text, width: '100%',
              caretColor: theme.accent,
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: theme.muted }}>
              <X size={13} />
            </button>
          )}
        </div>

        {open && results.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', width: '320px',
            background: theme.card, border: `2px solid ${theme.border}`,
            boxShadow: `4px 4px 0 ${theme.accent}`,
            borderRadius: '10px', overflow: 'hidden', zIndex: 999,
          }}>
            {results.map((item, i) => (
              <button key={i} onClick={() => scrollTo(item.id)}
                style={{
                  width: '100%', padding: '10px 14px', background: 'transparent', border: 'none',
                  borderBottom: i < results.length - 1 ? `1px solid ${theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none',
                  textAlign: 'left', cursor: 'pointer',
                  fontSize: '0.8rem', fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600, color: theme.text,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = theme.isDark ? 'rgba(255,255,255,0.05)' : '#F9F8F3'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '0.58rem', background: theme.accent, color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, flexShrink: 0 }}>
                  {item.id.toUpperCase()}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right cell: Donate + Contact, far right ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
        <DonateBtn theme={theme} />
        <ContactBtn onClick={() => scrollTo('hero')} theme={theme} />
      </div>
    </nav>
  );
}

function NavBtn({ label, onClick, theme }: { label: string; onClick: () => void; theme: ReturnType<typeof useTheme>['theme'] }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
        fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.07em',
        padding: '5px 10px',
        background: hov ? theme.text : 'transparent',
        border: `2px solid ${hov ? theme.text : 'transparent'}`,
        borderRadius: '6px', color: hov ? theme.bg : theme.text,
        cursor: 'pointer', transition: 'all 0.15s ease', whiteSpace: 'nowrap',
      }}>
      {label}
    </button>
  );
}

function ContactBtn({ onClick, theme }: { onClick: () => void; theme: ReturnType<typeof useTheme>['theme'] }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
        fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.07em',
        padding: '5px 13px',
        background: theme.accent, color: '#fff',
        border: `2px solid ${theme.text}`,
        boxShadow: hov ? `3px 3px 0 ${theme.text}` : `2px 2px 0 ${theme.text}`,
        borderRadius: '6px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '5px',
        transform: hov ? 'translate(-1px,-1px)' : 'none',
        transition: 'all 0.15s ease', whiteSpace: 'nowrap', flexShrink: 0,
      }}>
      <Mail size={12} /> Contact
    </button>
  );
}

function DonateBtn({ theme }: { theme: ReturnType<typeof useTheme>['theme'] }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => window.open('https://www.buymeacoffee.com/', '_blank')}
      style={{
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
        fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.07em',
        padding: '5px 13px',
        background: hov ? '#D97706' : '#F59E0B',
        color: '#13101C',
        border: `2px solid ${theme.text}`,
        boxShadow: hov ? `3px 3px 0 ${theme.text}` : `2px 2px 0 ${theme.text}`,
        borderRadius: '6px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '5px',
        transform: hov ? 'translate(-1px,-1px)' : 'none',
        transition: 'all 0.15s ease', whiteSpace: 'nowrap', flexShrink: 0,
      }}>
      <Coffee size={12} /> Donate
    </button>
  );
}
