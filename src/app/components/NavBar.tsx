import { useState, useRef, useEffect } from 'react';
import { Search, X, Coffee, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useIsMobile } from '../hooks/useIsMobile';

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

const NAV_LINKS = [
  { label: 'About', id: 'hero' },
  { label: 'Timeline', id: 'timeline' },
  { label: 'Work', id: 'work' },
  { label: 'Game', id: 'game' },
];

const QR_URL = '../imports/qrbank.png';

export function NavBar() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length > 0
    ? ALL_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setQuery('');
    setOpen(false);
    setMenuOpen(false);
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  const navBase: React.CSSProperties = {
    position: 'sticky', top: 0, zIndex: 100,
    backgroundColor: theme.bg,
    borderBottom: `2px solid ${theme.border}`,
    transition: 'background-color 0.35s, border-color 0.35s',
  };

  /* ── Mobile layout ─────────────────────────────────────────── */
  if (isMobile) {
    return (
      <nav style={navBase}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56, padding: '0 20px' }}>
          <button onClick={() => scrollTo('hero')} style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px',
            color: theme.text, background: 'none', border: 'none',
            cursor: 'pointer', padding: 0,
          }}>
            PKD<span style={{ color: theme.accent }}>.</span>
          </button>
          <button
            onClick={() => setMenuOpen(m => !m)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text, padding: 6, display: 'flex', alignItems: 'center' }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Slide-down menu */}
        {menuOpen && (
          <div style={{
            borderTop: `2px solid ${theme.border}`,
            padding: '16px 20px 20px',
            display: 'flex', flexDirection: 'column', gap: '14px',
            backgroundColor: theme.bg,
          }}>
            {/* Search bar */}
            <div ref={wrapRef} style={{ position: 'relative' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 14px',
                background: theme.isDark ? 'rgba(249,248,243,0.06)' : '#fff',
                border: `2px solid ${open ? theme.accent : theme.border}`,
                boxShadow: open ? `2px 2px 0 ${theme.accent}` : `2px 2px 0 ${theme.border}`,
                borderRadius: 10, transition: 'border-color 0.15s, box-shadow 0.15s',
              }}>
                <Search size={14} color={theme.muted} style={{ flexShrink: 0 }} />
                <input
                  type="text" placeholder="Search anything..." value={query}
                  onChange={e => { setQuery(e.target.value); setOpen(true); }}
                  onFocus={() => setOpen(true)}
                  style={{
                    border: 'none', outline: 'none', background: 'transparent',
                    fontSize: '0.85rem', fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 500, color: theme.text, width: '100%', caretColor: theme.accent,
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
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  background: theme.card, border: `2px solid ${theme.border}`,
                  boxShadow: `4px 4px 0 ${theme.accent}`,
                  borderRadius: 10, overflow: 'hidden', zIndex: 999,
                }}>
                  {results.map((item, i) => (
                    <button key={i} onClick={() => scrollTo(item.id)}
                      style={{
                        width: '100%', padding: '11px 14px', background: 'transparent', border: 'none',
                        borderBottom: i < results.length - 1 ? `1px solid ${theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none',
                        textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem',
                        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: theme.text,
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = theme.isDark ? 'rgba(255,255,255,0.05)' : '#F9F8F3'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ fontSize: '0.58rem', background: theme.accent, color: '#fff', padding: '1px 5px', borderRadius: 3, fontWeight: 700, flexShrink: 0 }}>
                        {item.id.toUpperCase()}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nav links */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {NAV_LINKS.map(({ label, id }) => (
                <NavBtn key={id} label={label} onClick={() => scrollTo(id)} theme={theme} />
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: theme.border, opacity: 0.3 }} />

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <DonateBtn theme={theme} />
            </div>
          </div>
        )}
      </nav>
    );
  }

  /* ── Desktop layout ────────────────────────────────────────── */
  return (
    <nav style={{
      ...navBase,
      padding: '0 28px',
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      height: '56px',
    }}>
      {/* Left: PKD. + nav links */}
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
        {NAV_LINKS.map(({ label, id }) => (
          <NavBtn key={id} label={label} onClick={() => scrollTo(id)} theme={theme} />
        ))}
      </div>

      {/* Center: search */}
      <div ref={wrapRef} style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
          background: theme.isDark ? 'rgba(249,248,243,0.06)' : '#fff',
          border: `2px solid ${open ? theme.accent : theme.border}`,
          boxShadow: open ? `2px 2px 0 ${theme.accent}` : `2px 2px 0 ${theme.border}`,
          borderRadius: 10, width: 300,
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
              fontWeight: 500, color: theme.text, width: '100%', caretColor: theme.accent,
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
            position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', width: 320,
            background: theme.card, border: `2px solid ${theme.border}`,
            boxShadow: `4px 4px 0 ${theme.accent}`,
            borderRadius: 10, overflow: 'hidden', zIndex: 999,
          }}>
            {results.map((item, i) => (
              <button key={i} onClick={() => scrollTo(item.id)}
                style={{
                  width: '100%', padding: '10px 14px', background: 'transparent', border: 'none',
                  borderBottom: i < results.length - 1 ? `1px solid ${theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none',
                  textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: theme.text,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = theme.isDark ? 'rgba(255,255,255,0.05)' : '#F9F8F3'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '0.58rem', background: theme.accent, color: '#fff', padding: '1px 5px', borderRadius: 3, fontWeight: 700, flexShrink: 0 }}>
                  {item.id.toUpperCase()}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Donate only */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
        <DonateBtn theme={theme} />
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
        borderRadius: 6, color: hov ? theme.bg : theme.text,
        cursor: 'pointer', transition: 'all 0.15s ease', whiteSpace: 'nowrap',
      }}>
      {label}
    </button>
  );
}

function DonateBtn({ theme }: { theme: ReturnType<typeof useTheme>['theme'] }) {
  const [hov, setHov] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setPopoverOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => setPopoverOpen(p => !p)}
        style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
          fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.07em',
          padding: '5px 13px',
          background: popoverOpen ? '#D97706' : (hov ? '#D97706' : '#F59E0B'),
          color: '#13101C',
          border: `2px solid ${theme.text}`,
          boxShadow: (hov || popoverOpen) ? `3px 3px 0 ${theme.text}` : `2px 2px 0 ${theme.text}`,
          borderRadius: 6, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5,
          transform: (hov || popoverOpen) ? 'translate(-1px,-1px)' : 'none',
          transition: 'all 0.15s ease', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
        <Coffee size={12} /> Donate
      </button>

      {popoverOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          background: theme.card,
          border: `2px solid ${theme.border}`,
          boxShadow: `6px 6px 0 #F59E0B`,
          borderRadius: 16, padding: '20px',
          zIndex: 999, minWidth: 220,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          animation: 'fadeSlideIn 0.18s ease',
        }}>
          <div style={{
            width: 160, height: 160,
            border: `2px solid ${theme.border}`,
            borderRadius: 10, overflow: 'hidden',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src={QR_URL}
              alt="Donation QR Code"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={e => { (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.buymeacoffee.com/'; }}
            />
          </div>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '0.82rem', fontWeight: 600,
            color: theme.text, textAlign: 'center', lineHeight: 1.5,
            margin: 0,
          }}>
            Thanks for supporting Dang <span style={{ color: '#C62828' }}>&lt;3</span>
          </p>
          <div style={{
            width: '100%', height: 1,
            background: theme.border, opacity: 0.3,
          }} />
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.62rem', color: theme.muted, textAlign: 'center', margin: 0,
          }}>
            Scan to donate ☕
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
