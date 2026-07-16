import { Github, Linkedin, Facebook } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ACCENT = '#C62828';

export function Footer() {
  const { theme } = useTheme();
  const footerBg = theme.isDark ? '#0d0b14' : '#13101C';
  const textFaint = 'rgba(249,248,243,0.35)';
  const textMuted = 'rgba(249,248,243,0.5)';
  const borderFaint = 'rgba(249,248,243,0.1)';
  const iconMuted = 'rgba(249,248,243,0.7)';
  const iconBorder = 'rgba(249,248,243,0.2)';

  return (
    <footer style={{
      borderTop: `2px solid ${theme.border}`,
      backgroundColor: footerBg,
      color: '#F9F8F3',
      padding: '48px 40px 32px',
      fontFamily: "'Space Grotesk', sans-serif",
      transition: 'background-color 0.35s, border-color 0.35s',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px',
      }}>
        {/* Branding */}
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-1px', marginBottom: '8px' }}>
            PKD<span style={{ color: ACCENT }}>.</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: textMuted, maxWidth: '260px', lineHeight: 1.6 }}>
            CS student, builder, and occasional skater/dancer/baller from Vietnam.
          </p>
        </div>

        {/* Social links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: ACCENT }}>
            Find Me At
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { href: 'https://github.com/dang-gerous', icon: Github, label: 'GitHub' },
              { href: 'https://www.linkedin.com/in/phan-khanh-dang-54a7703a5/', icon: Linkedin, label: 'LinkedIn' },
              { href: 'https://www.facebook.com/phan.khanh.ang.101587/', icon: Facebook, label: 'Facebook' },
            ].map(({ href, icon: Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                style={{
                  width: '40px', height: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${iconBorder}`, borderRadius: '8px',
                  color: iconMuted, textDecoration: 'none', transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.borderColor = ACCENT;
                  el.style.color = ACCENT;
                  el.style.background = 'rgba(198,40,40,0.1)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.borderColor = iconBorder;
                  el.style.color = iconMuted;
                  el.style.background = 'transparent';
                }}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{
        maxWidth: '1200px', margin: '32px auto 0',
        paddingTop: '24px', borderTop: `1px solid ${borderFaint}`,
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '8px',
        fontSize: '0.78rem', color: textFaint,
      }}>
        <span>© 2026 Phan Khanh Dang. All rights reserved.</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Made with <span style={{ color: ACCENT }}>♥</span> & ☕
        </span>
      </div>
    </footer>
  );
}
