import { useState, type ReactNode, type CSSProperties, type ElementType } from 'react';
import { Github, Facebook, Linkedin, MapPin, GraduationCap, Code2, ExternalLink, Mail, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import phanDinhPhungLogo from '../../imports/image.png';
import universityLogo from '../../imports/image-1.png';

const ACCENT = '#C62828';

const skills = [
  'JavaScript', 'Figma', 'Framer', 'HTML/CSS',
  'C++', 'C', 'React', 'Git', 'GitHub',
  'Vibe Code', 'Linux', 'TypeScript', 'Python', 'REST APIs',
];

const hobbies = [
  { icon: '🕺', label: 'Dancing' },
  { icon: '🎵', label: 'Music' },
  { icon: '🎨', label: 'Designing' },
  { icon: '💻', label: 'Vibe Coding' },
  { icon: '🏀', label: 'Basketball' },
  { icon: '💪', label: 'Gym' },
];

const contacts = [
  { label: 'GitHub', href: 'https://github.com/dang-gerous', icon: Github, handle: '@dang-gerous' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/phan-khanh-dang-54a7703a5/', icon: Linkedin, handle: 'Phan Khanh Dang' },
  { label: 'Facebook', href: 'https://www.facebook.com/phan.khanh.ang.101587/', icon: Facebook, handle: 'Phan Khánh Đăng' },
  { label: 'Email', href: 'phankhanhdang2007@gmail.com', icon: Mail, handle: 'phankhanhdang2007@...' },
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

function Chip({ text }: { text: string }) {
  const { theme } = useTheme();
  return (
    <span style={{
      padding: '2px 9px',
      background: theme.isDark ? 'rgba(249,248,243,0.06)' : theme.bg,
      border: `1.5px solid ${theme.border}`,
      borderRadius: '6px', fontSize: '0.67rem', fontWeight: 600, color: theme.text,
    }}>{text}</span>
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

          {/* High school row — with 100% Accepted stat inline */}
          <div style={{ display: 'flex', gap: 10, paddingBottom: 13, borderBottom: `1.5px solid ${theme.isDark ? 'rgba(249,248,243,0.07)' : 'rgba(0,0,0,0.07)'}`, marginBottom: 13, alignItems: 'center' }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0, border: `2px solid ${theme.border}`, background: '#fff', overflow: 'hidden', padding: 3 }}>
              <img src={phanDinhPhungLogo} alt="Phan Dinh Phung HS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '0.84rem', fontWeight: 700, color: theme.text, marginBottom: 2, lineHeight: 1.2 }}>Phan Dinh Phung HS</h3>
              <p style={{ fontSize: '0.68rem', color: theme.muted, marginBottom: 6 }}>High School · Ha Noi</p>
              <span style={{ padding: '2px 8px', background: 'rgba(34,197,94,0.12)', border: '1.5px solid #22C55E', borderRadius: 20, fontSize: '0.62rem', fontWeight: 700, color: '#16a34a' }}>✓ Graduated 2025</span>
            </div>
            {/* 100% Accepted stat sits beside the high school */}
            <InlineStat value="100%" label="Accepted" />
          </div>

          {/* University row — with GPA stat inline */}
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
            {/* GPA stat sits beside the university */}
            <InlineStat value="3.4" label="GPA" accent />
          </div>

          {/* Open to Internships — full width, prominent */}
          <div style={{
            marginTop: 'auto',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '13px 18px',
            background: ACCENT,
            border: `2px solid ${theme.text}`,
            boxShadow: `3px 3px 0 ${theme.text}`,
            borderRadius: 12, color: '#fff',
          }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#fff', display: 'block', flexShrink: 0, animation: 'pulse-dot 1s infinite' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.02em' }}>Open to Internships & Collabs</div>
              <div style={{ fontSize: '0.66rem', opacity: 0.8, marginTop: 2 }}>Available from now · Hanoi or Remote</div>
            </div>
          </div>
        </Card>

        {/* ── 4. Skills card ── row 2, spans cols 1-2 */}
        <Card style={{ gridColumn: '1 / 3', gridRow: '2 / 3' }}>
          <Label><Code2 size={15} /> Tech Skills</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {skills.map(s => (
              <span key={s}
                style={{ padding: '5px 12px', background: theme.isDark ? 'rgba(249,248,243,0.05)' : '#F9F8F3', border: `2px solid ${theme.border}`, borderRadius: 5, fontSize: '0.78rem', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: theme.text, cursor: 'default', transition: 'all 0.15s' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.background = theme.text; el.style.color = theme.bg; el.style.boxShadow = `2px 2px 0 ${ACCENT}`; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.background = theme.isDark ? 'rgba(249,248,243,0.05)' : '#F9F8F3'; el.style.color = theme.text; el.style.boxShadow = 'none'; }}>
                {s}
              </span>
            ))}
          </div>
        </Card>

        {/* ── 5. Hobbies card ── row 2, col 3 */}
        <Card style={{ gridColumn: '3 / 4', gridRow: '2 / 3' }}>
          <Label>✨ Beyond Code</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {hobbies.map(({ icon, label }) => (
              <div key={label}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: theme.isDark ? 'rgba(249,248,243,0.05)' : '#F9F8F3', border: `2px solid ${theme.border}`, borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, color: theme.text, cursor: 'default', transition: 'all 0.15s' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.background = ACCENT; el.style.color = '#fff'; el.style.borderColor = ACCENT; el.style.boxShadow = `2px 2px 0 ${theme.text}`; el.style.transform = 'translate(-1px,-1px)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.background = theme.isDark ? 'rgba(249,248,243,0.05)' : '#F9F8F3'; el.style.color = theme.text; el.style.borderColor = theme.border; el.style.boxShadow = 'none'; el.style.transform = 'none'; }}>
                <span style={{ fontSize: '1rem' }}>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
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
        @media(max-width:860px){
          #hero > div { grid-template-columns: 1fr !important; }
          #hero > div > * { grid-column: 1/2 !important; grid-row: auto !important; }
        }
      `}</style>
    </section>
  );
}
