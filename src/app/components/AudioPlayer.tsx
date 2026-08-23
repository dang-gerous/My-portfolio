import { useRef, useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

// Google Drive audio — direct streaming URL
const AUDIO_SRC = '/03. Wtf Bby I_m Lit.m4a';

export function AudioPlayer() {
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hov, setHov] = useState(false);
  const rafRef = useRef<number>(0);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => { setPlaying(false); setProgress(0); };
    const onTimeUpdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const circumference = 2 * Math.PI * 16;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 14px 8px 8px',
      background: theme.card,
      border: `2px solid ${theme.border}`,
      boxShadow: playing
        ? `3px 3px 0 #C62828`
        : `2px 2px 0 ${theme.border}`,
      borderRadius: 40,
      transition: 'box-shadow 0.2s ease, border-color 0.35s',
      userSelect: 'none',
    }}>
      <audio ref={audioRef} src={AUDIO_SRC} preload="none" />

      {/* Circular progress + play button */}
      <button
        onClick={togglePlay}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        title={playing ? 'Pause' : 'Play'}
        style={{
          position: 'relative',
          width: 40, height: 40,
          background: 'none', border: 'none',
          cursor: 'pointer', padding: 0,
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width={40} height={40} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx={20} cy={20} r={16} fill="none" stroke={theme.isDark ? 'rgba(249,248,243,0.1)' : 'rgba(19,16,28,0.1)'} strokeWidth={3} />
          {/* Progress arc */}
          {playing && (
            <circle
              cx={20} cy={20} r={16}
              fill="none"
              stroke="#C62828"
              strokeWidth={3}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.3s linear' }}
            />
          )}
        </svg>

        {/* Icon in center */}
        <div style={{
          width: 28, height: 28,
          background: hov ? theme.text : (playing ? '#C62828' : theme.text),
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s ease',
          zIndex: 1,
        }}>
          {playing ? (
            /* Pause icon */
            <svg width={10} height={12} viewBox="0 0 10 12" fill="none">
              <rect x={0} y={0} width={3.5} height={12} rx={1.5} fill={theme.bg} />
              <rect x={6.5} y={0} width={3.5} height={12} rx={1.5} fill={theme.bg} />
            </svg>
          ) : (
            /* Play icon — slightly offset right to look centered */
            <svg width={10} height={12} viewBox="0 0 10 12" fill="none" style={{ marginLeft: 1 }}>
              <path d="M0 0L10 6L0 12V0Z" fill={theme.bg} />
            </svg>
          )}
        </div>
      </button>

      {/* Label */}
      <div>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '0.72rem', fontWeight: 700,
          color: theme.text,
          lineHeight: 1.2,
          transition: 'color 0.35s',
        }}>
          {playing ? 'Now Playing' : 'My Playlist'}
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.6rem', color: theme.muted,
          lineHeight: 1,
          marginTop: 2,
          transition: 'color 0.35s',
        }}>
          {playing ? '♪ vibing...' : 'tap to play'}
        </div>
      </div>
    </div>
  );
}
