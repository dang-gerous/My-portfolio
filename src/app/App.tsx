import { ThemeProvider, useTheme } from './context/ThemeContext';
import { NavBar } from './components/NavBar';
import { HeroSection } from './components/HeroSection';
import { TimelineSection } from './components/TimelineSection';
import { WorkSection } from './components/WorkSection';
import { PongSection } from './components/PongSection';
import { Footer } from './components/Footer';
import { PullCord } from './components/PullCord';

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

function AppInner() {
  const { theme } = useTheme();
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

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        <HeroSection />
        <Divider />
        <TimelineSection />
        <Divider />
        <WorkSection />
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
