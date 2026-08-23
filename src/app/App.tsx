import { useEffect, useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { NavBar } from './components/NavBar';
import { HeroSection } from './components/HeroSection';
import { TimelineSection } from './components/TimelineSection';
import { WorkSection } from './components/WorkSection';
import { PongSection } from './components/PongSection';
import { Footer } from './components/Footer';
import { PullCord } from './components/PullCord';
import { AudioPlayer } from './components/AudioPlayer';
import { useIsMobile } from './hooks/useIsMobile';

function Divider() {
  const { theme } = useTheme();
  return (
    <div style={{
      height: '2px',
      background: `repeating-linear-gradient(90deg, ${theme.border} 0px, ${theme.border} 12px, transparent 12px, transparent 24px)`,
      opacity: theme.isDark ? 0.25 : 0.13,
      margin: '0 0 16px 0',
    }} />
  );
}

function BackToTop() {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [hov, setHov] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title="Back to top"
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 200,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: hov ? '#C62828' : theme.card,
        border: `2px solid ${theme.border}`,
        boxShadow: hov ? `3px 3px 0 #C62828` : `3px 3px 0 ${theme.border}`,
        color: hov ? '#fff' : theme.text,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: hov ? 'translate(-1px,-1px)' : 'none',
        transition: 'all 0.15s ease',
      }}
    >
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function AppInner() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  // Set favicon dynamically
  useEffect(() => {
    const existing = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    const link = existing ?? document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = 'https://drive.google.com/uc?export=view&id=1pors27F1PHFhl7SRKyf8nYgg9-LvFCjf';
    if (!existing) document.head.appendChild(link);
  }, []);

  return (
    <div style={{
      fontFamily: "'Space Grotesk', sans-serif",
      backgroundColor: theme.bg,
      color: theme.text,
      minHeight: '100vh',
      transition: 'background-color 0.35s ease, color 0.35s ease',
    }}>
      <NavBar />
      <PullCord />

      {/* Floating audio player — bottom left */}
      <div style={{
        position: 'fixed',
        bottom: 28,
        left: isMobile ? 16 : 28,
        zIndex: 200,
      }}>
        <AudioPlayer />
      </div>

      <BackToTop />

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 40px',
        boxSizing: 'border-box',
      }}>
        <section id="hero-wrapper" style={{ scrollMarginTop: 56 }}>
          <HeroSection />
        </section>
        <Divider />
        <section id="sub-hero" style={{ scrollMarginTop: 56 }}>
          <TimelineSection />
        </section>
        <Divider />
        <section id="projects" style={{ scrollMarginTop: 56 }}>
          <WorkSection />
        </section>
        <Divider />
        <PongSection />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
