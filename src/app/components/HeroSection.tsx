import { useState, useEffect, useRef, type ReactNode, type CSSProperties, type ElementType } from 'react';
import { Github, Facebook, Linkedin, MapPin, GraduationCap, ExternalLink, Mail, User, Terminal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import phanDinhPhungLogo from '../../imports/image.png';
import universityLogo from '../../imports/image-1.png';

const ACCENT = '#C62828';

// ── Smart Stack gallery images (replace IDs with your actual Google Drive file IDs) ──
// The folder: https://drive.google.com/drive/folders/19gG0-Fg-kzP4UAotKNx2C-VzFpuJ5VTN
// Add your Drive file IDs below — each gives a direct image URL
const GALLERY_IMAGES = [
  { src: '../../imports/coffeejob.JPG', caption: 'my used-to-be sidequest ' },
  { src: '../../imports/ball.png', caption: 'Hooping w my boi ' },
  { src: '../../imports/food.png', caption: 'my fav food ' },
  { src: '../../imports/grafiti.png', caption: 'fav pic' },
  { src: '../../imports/cat.png', caption: 'my lazy cat' },
];

const SKILL_CATEGORIES = [
  { prefix: 'frontend', color: '#22d3ee', skills: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS'] },
  { prefix: 'design  ', color: '#a78bfa', skills: ['Figma', 'Framer'] },
  { prefix: 'backend ', color: '#34d399', skills: ['Supabase', 'Node.js', 'REST APIs'] },
  { prefix: 'systems ', color: '#fb923c', skills: ['C', 'C++', 'MacOS'] },
  { prefix: 'tools   ', color: '#f472b6', skills: ['Git', 'GitHub',] },
];

const contacts = [
  { label: 'GitHub', href: 'https://github.com/dang-gerous', icon: Github, handle: '@dang-gerous' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/phan-khanh-dang-54a7703a5/', icon: Linkedin, handle: 'Phan Khanh Dang' },
  { label: 'Facebook', href: 'https://www.facebook.com/phan.khanh.ang.101587/', icon: Facebook, handle: 'Phan Khánh Đăng' },
  { label: 'Email', href: 'phankhanhdang2007@gmail.com', icon: Mail, handle: 'phankhanhdang07@...' },
];

/* ── Atoms ─────────────────────────────────────────────────── */

function Card({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) {
  const { theme } = useTheme();
  return (
    <div style={{
      background: theme.card, border: `2px solid ${theme.border}`,
      boxShadow: `4px 4px 0 ${theme.border}`, borderRadius: '16px', padding: '22px',
      transition: 'background 0.35s, border-color 0.35s, box-shadow 0.35s',
      ...style,
    }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '7px',
      fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: ACCENT, marginBottom: '14px',
    }}>
      {children}
    </div>
  );
}

function InlineStat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  const { theme } = useTheme();
  return (
    <div style={{
      padding: '6px 11px', textAlign: 'center', flexShrink: 0,
      background: accent ? ACCENT : (theme.isDark ? 'rgba(249,248,243,0.05)' : theme.bg),
      border: `2px solid ${accent ? ACCENT : theme.border}`,
      boxShadow: `2px 2px 0 ${theme.border}`, borderRadius: '10px',
      color: accent ? '#fff' : theme.text, transition: 'all 0.35s',
      minWidth: 52,
    }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.56rem', fontWeight: 700, opacity: 0.75, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ContactLink({ href, icon: Icon, label, handle }: { href: string; icon: ElementType; label: string; handle: string }) {
  const { theme } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 14px',
        background: hov ? theme.text : (theme.isDark ? 'rgba(249,248,243,0.04)' : theme.bg),
        border: `2px solid ${theme.border}`,
        boxShadow: hov ? `3px 3px 0 ${ACCENT}` : `2px 2px 0 ${theme.border}`,
        borderRadius: '8px', color: hov ? theme.bg : theme.text,
        textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600,
        transition: 'all 0.15s ease', transform: hov ? 'translate(-1px,-1px)' : 'none',
        flex: '1 1 auto', minWidth: '145px',
      }}>
      <Icon size={15} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.58rem', opacity: 0.5, fontWeight: 500, lineHeight: 1 }}>{label}</div>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{handle}</div>
      </div>
      <ExternalLink size={11} style={{ opacity: 0.3, flexShrink: 0 }} />
    </a>
  );
}

/* ── Terminal Tech Skills ────────────────────────────────────── */

function TerminalSkills() {
  const { theme } = useTheme();
  const [lines, setLines] = useState<number>(0);
  const [cursor, setCursor] = useState(true);

  // Animate lines appearing one by one
  useEffect(() => {
    if (lines >= SKILL_CATEGORIES.length + 2) return;
    const t = setTimeout(() => setLines(l => l + 1), lines === 0 ? 300 : 260);
    return () => clearTimeout(t);
  }, [lines]);

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(id);
  }, []);

  const termBg = theme.isDark ? '#0d0b14' : '#1a1625';

  return (
    <div style={{
      background: termBg,
      border: `2px solid ${theme.isDark ? 'rgba(249,248,243,0.12)' : 'rgba(0,0,0,0.3)'}`,
      boxShadow: 'none',
      borderRadius: '12px',
      overflow: 'hidden',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 14px',
        background: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
          <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'block' }} />
        ))}
        <span style={{ marginLeft: 8, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          dang@portfolio ~ skills
        </span>
      </div>

      {/* Terminal body */}
      <div style={{ padding: '14px 18px 16px', minHeight: 160 }}>
        {/* Prompt line */}
        {lines >= 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: '0.76rem' }}>
            <span style={{ color: '#22d3ee', fontWeight: 700 }}>❯</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>skills</span>
            <span style={{ color: '#a78bfa' }}>--list</span>
            <span style={{ color: '#34d399' }}>--verbose</span>
          </div>
        )}

        {/* Skill category rows */}
        {SKILL_CATEGORIES.slice(0, Math.max(0, lines - 1)).map((cat, i) => (
          <div key={cat.prefix} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            marginBottom: 5, fontSize: '0.72rem',
            animation: 'termLine 0.2s ease',
          }}>
            <span style={{ color: '#fb923c', minWidth: 8 }}>›</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', minWidth: 70 }}>{cat.prefix}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: 4 }}>:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {cat.skills.map(skill => (
                <span key={skill} style={{
                  color: cat.color,
                  background: `${cat.color}18`,
                  border: `1px solid ${cat.color}40`,
                  borderRadius: 4, padding: '1px 7px',
                  fontSize: '0.68rem', fontWeight: 600,
                  cursor: 'default',
                  transition: 'all 0.12s',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget;
                    el.style.background = `${cat.color}35`;
                    el.style.borderColor = cat.color;
                    el.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget;
                    el.style.background = `${cat.color}18`;
                    el.style.borderColor = `${cat.color}40`;
                    el.style.transform = 'none';
                  }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Cursor line */}
        {lines > 0 && (
          <div style={{ display: 'flex', gap: 8, fontSize: '0.76rem', marginTop: 8 }}>
            <span style={{ color: '#22d3ee', fontWeight: 700 }}>❯</span>
            <span style={{
              display: 'inline-block', width: 7, height: 14,
              background: cursor ? 'rgba(255,255,255,0.7)' : 'transparent',
              borderRadius: 1, verticalAlign: 'text-bottom',
              transition: 'background 0.1s',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── iOS Smart Stack Gallery ─────────────────────────────────── */

function SmartStack() {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = GALLERY_IMAGES.length;

  const goTo = (idx: number) => {
    setActiveIndex(((idx % total) + total) % total);
    setDragOffset(0);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setDragStartX(e.clientX);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragOffset(e.clientX - dragStartX);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragOffset < -50) goTo(activeIndex + 1);
    else if (dragOffset > 50) goTo(activeIndex - 1);
    else setDragOffset(0);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Label>✨ Beyond Code</Label>

      {/* Card stack */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 160,
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        {GALLERY_IMAGES.map((img, i) => {
          const offset = ((i - activeIndex + total) % total);
          const normOffset = offset > total / 2 ? offset - total : offset;

          // Only render nearby cards
          if (Math.abs(normOffset) > 2) return null;

          const isActive = normOffset === 0;
          const scale = isActive ? 1 : 1 - Math.abs(normOffset) * 0.06;
          const translateY = isActive ? 0 : Math.abs(normOffset) * 6;
          const translateX = isActive
            ? (dragging ? dragOffset : 0)
            : normOffset * 8;
          const zIndex = 10 - Math.abs(normOffset);
          const opacity = 1 - Math.abs(normOffset) * 0.25;
          const rotate = normOffset * 1.5 + (isActive && dragging ? dragOffset * 0.03 : 0);

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 14,
                overflow: 'hidden',
                zIndex,
                transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                transition: dragging && isActive ? 'none' : 'transform 0.38s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
                opacity,
                border: `2px solid ${theme.border}`,
                boxShadow: isActive
                  ? `0 8px 32px rgba(0,0,0,0.22)`
                  : `0 4px 12px rgba(0,0,0,0.12)`,
              }}
            >
              <img
                src={img.src}
                alt={img.caption}
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {isActive && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '20px 14px 12px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  color: '#fff',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.76rem', fontWeight: 600,
                  letterSpacing: '0.01em',
                }}>
                  {img.caption}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dot indicators + swipe hint */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, marginTop: 10,
      }}>
        {GALLERY_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: activeIndex === i ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background: activeIndex === i ? ACCENT : theme.border,
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </div>
      <p style={{
        textAlign: 'center', fontSize: '0.58rem',
        color: theme.muted, marginTop: 5, fontStyle: 'italic',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        swipe or drag ←→
      </p>
    </div>
  );
}

/* ── Main section ──────────────────────────────────────────── */

export function HeroSection() {
  const { theme } = useTheme();

  return (
    <section id="hero" style={{ padding: '72px 0 64px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr 1fr',
        gridTemplateRows: 'auto auto auto',
        gap: '16px',
      }}>

        {/* ── 1. Profile card ── row 1 only, col 1 */}
        <div style={{
          gridColumn: '1 / 2', gridRow: '1 / 2',
          background: theme.profileCard,
          border: `2px solid ${theme.border}`,
          boxShadow: `4px 4px 0 ${ACCENT}`,
          borderRadius: '20px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          transition: 'background 0.35s, border-color 0.35s',
        }}>
          <div style={{ flex: '1 1 0', overflow: 'hidden', position: 'relative', minHeight: '180px' }}>
            <img src="https://github.com/dang-gerous.png" alt="Phan Khanh Dang"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: `linear-gradient(to bottom, transparent, ${theme.profileCard})` }} />
          </div>
          <div style={{ flex: '0 0 auto', padding: '14px 18px 18px', background: theme.profileCard, transition: 'background 0.35s' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.4px', color: '#F9F8F3', marginBottom: 2, lineHeight: 1.15 }}>
              Phan Khanh Dang
            </h1>
            <p style={{ color: ACCENT, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
              CS Student & Developer
            </p>
            <div style={{ borderTop: '1px solid rgba(249,248,243,0.1)', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(249,248,243,0.4)', fontSize: '0.68rem' }}>
                <MapPin size={10} /><span>Hanoi, Vietnam 🇻🇳</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'block', boxShadow: '0 0 5px #22C55E' }} />
                <span style={{ fontSize: '0.58rem', color: 'rgba(249,248,243,0.35)', fontWeight: 600 }}>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. About Me card ── row 1, col 2 */}
        <Card style={{ gridColumn: '2 / 3', gridRow: '1 / 2', display: 'flex', flexDirection: 'column' }}>
          <Label><User size={15} /> About Me</Label>
          <p style={{ fontSize: '0.83rem', color: theme.text, lineHeight: 1.72, marginBottom: 14 }}>
            Hey there! I'm Dang — a CS student from Hanoi who's passionate about building things that live on the Internet.
          </p>
          <p style={{ fontSize: '0.78rem', color: theme.muted, lineHeight: 1.65, marginBottom: 16 }}>
            I enjoy crafting clean UIs, exploring new tech stacks, and occasionally beating my friends at basketball. I'm building side projects that keep me up at night — in the best way possible.
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
            {['🎯 Detail-oriented', '🚀 Fast learner', '🤝 Team player', '☕ Coffee-powered'].map(tag => (
              <span key={tag} style={{
                padding: '4px 10px',
                background: theme.isDark ? 'rgba(249,248,243,0.05)' : theme.bg,
                border: `1.5px solid ${theme.border}`,
                borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, color: theme.muted,
              }}>{tag}</span>
            ))}
          </div>
        </Card>

        {/* ── 3. Education card ── row 1, col 3 */}
        <Card style={{ gridColumn: '3 / 4', gridRow: '1 / 2', display: 'flex', flexDirection: 'column' }}>
          <Label><GraduationCap size={15} /> Education</Label>

          <div style={{ display: 'flex', gap: 10, paddingBottom: 13, borderBottom: `1.5px solid ${theme.isDark ? 'rgba(249,248,243,0.07)' : 'rgba(0,0,0,0.07)'}`, marginBottom: 13, alignItems: 'center' }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0, border: `2px solid ${theme.border}`, background: '#fff', overflow: 'hidden', padding: 3 }}>
              <img src={phanDinhPhungLogo} alt="Phan Dinh Phung HS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '0.84rem', fontWeight: 700, color: theme.text, marginBottom: 2, lineHeight: 1.2 }}>Phan Dinh Phung HS</h3>
              <p style={{ fontSize: '0.68rem', color: theme.muted, marginBottom: 6 }}>High School · Ha Noi</p>
              <span style={{ padding: '2px 8px', background: 'rgba(34,197,94,0.12)', border: '1.5px solid #22C55E', borderRadius: 20, fontSize: '0.62rem', fontWeight: 700, color: '#16a34a' }}>✓ Graduated 2025</span>
            </div>
            <InlineStat value="100%" label="Accepted" />
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0, border: `2px solid ${theme.border}`, background: '#fff', overflow: 'hidden', padding: 3 }}>
              <img src={universityLogo} alt="PTIT University" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '0.84rem', fontWeight: 700, color: theme.text, marginBottom: 2, lineHeight: 1.2 }}>B.Sc. Computer Science</h3>
              <p style={{ fontSize: '0.68rem', color: theme.muted, marginBottom: 6 }}>PTIT · Hanoi</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {['📅 2025 — 2030', '🎓 2nd Year'].map(t => (
                  <span key={t} style={{
                    padding: '2px 9px',
                    background: theme.isDark ? '#2a2540' : theme.bg,
                    border: `1.5px solid ${theme.border}`,
                    borderRadius: '6px', fontSize: '0.67rem', fontWeight: 600, color: theme.text,
                  }}>{t}</span>
                ))}
              </div>
            </div>
            <InlineStat value="3.4" label="GPA" accent />
          </div>

          <div style={{
            marginTop: 'auto',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '13px 18px',
            background: ACCENT,
            border: `2px solid ${theme.text}`,
            boxShadow: `3px 3px 0 ${theme.text}`,
            borderRadius: 12, color: '#fff',
          }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', display: 'block', flexShrink: 0, animation: 'pulse-dot 1s infinite', boxShadow: '0 0 6px #22c55e' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.02em' }}>Open to Internships & Collabs</div>
              <div style={{ fontSize: '0.66rem', opacity: 0.8, marginTop: 2 }}>Available from now · Hanoi or Remote</div>
            </div>
          </div>
        </Card>

        {/* ── 4. Terminal Tech Skills ── row 2, spans cols 1-2 */}
        <Card style={{ gridColumn: '1 / 3', gridRow: '2 / 3', padding: '22px 22px 18px' }}>
          <Label><Terminal size={15} /> Tech Skills</Label>
          <TerminalSkills />
        </Card>

        {/* ── 5. iOS Smart Stack Gallery ── row 2, col 3 */}
        <Card style={{ gridColumn: '3 / 4', gridRow: '2 / 3', display: 'flex', flexDirection: 'column', minHeight: 260, padding: '22px 22px 14px' }}>
          <SmartStack />
        </Card>

        {/* ── 6. Contacts ── row 3, full width */}
        <Card style={{ gridColumn: '1 / 4', gridRow: '3 / 4', boxShadow: `4px 4px 0 ${ACCENT}` }}>
          <Label>Find Me Online</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {contacts.map(c => <ContactLink key={c.label} {...c} />)}
          </div>
        </Card>

      </div>

      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        @keyframes termLine { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        @media(max-width:860px){
          #hero > div { grid-template-columns: 1fr !important; }
          #hero > div > * { grid-column: 1/2 !important; grid-row: auto !important; }
        }
      `}</style>
    </section>
  );
}
