import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useIsMobile } from '../hooks/useIsMobile';

const ACCENT = '#C62828';
const DARK = '#13101C';
const BG = '#F9F8F3';

const CANVAS_SIZE = 480;
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;
const R = 218;

const PADDLE_SPAN = 0.38;
const PADDLE_SPEED = 0.048;
const WIN_SCORE = 3;

const TOP_PLAYER_COLOR = DARK;
const BOT_PLAYER_COLOR = ACCENT;
const BALL_COLOR = DARK;

function normaliseAngle(a: number) {
  return ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}
function angleDiff(a: number, b: number) {
  return ((b - a) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
}

const TOP_START = normaliseAngle(-Math.PI / 2);
const BOTTOM_START = Math.PI / 2;

interface PressedKeys {
  w: boolean; a: boolean; s: boolean; d: boolean;
  up: boolean; left: boolean; down: boolean; right: boolean;
}

function KeyCap({ label, active, theme }: { label: string; active: boolean; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <div style={{
      width: 44, height: 44,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `2px solid ${active ? ACCENT : theme.border}`,
      boxShadow: active ? `2px 2px 0 ${ACCENT}, 0 0 12px rgba(198,40,40,0.35)` : `2px 2px 0 ${theme.border}`,
      background: active ? ACCENT : theme.card, color: active ? '#FFF' : theme.text,
      fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.85rem',
      borderRadius: 6, transform: active ? 'translate(1px, 1px)' : 'none',
      transition: 'all 0.08s ease', userSelect: 'none', flexShrink: 0,
    }}>
      {label}
    </div>
  );
}

function KeyboardDisplay({ pressed, theme }: { pressed: PressedKeys; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: TOP_PLAYER_COLOR, textAlign: 'center', marginBottom: 12 }}>Player 1</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <KeyCap label="W" active={pressed.w} theme={theme} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <KeyCap label="A" active={pressed.a} theme={theme} />
            <KeyCap label="S" active={pressed.s} theme={theme} />
            <KeyCap label="D" active={pressed.d} theme={theme} />
          </div>
        </div>
        <p style={{ fontSize: '0.68rem', color: theme.muted, textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>A / D to move</p>
      </div>
      <div style={{ width: 80, height: 2, background: `repeating-linear-gradient(90deg, ${theme.border} 0px, ${theme.border} 6px, transparent 6px, transparent 12px)` }} />
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: BOT_PLAYER_COLOR, textAlign: 'center', marginBottom: 12 }}>Player 2</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <KeyCap label="↑" active={pressed.up} theme={theme} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <KeyCap label="←" active={pressed.left} theme={theme} />
            <KeyCap label="↓" active={pressed.down} theme={theme} />
            <KeyCap label="→" active={pressed.right} theme={theme} />
          </div>
        </div>
        <p style={{ fontSize: '0.68rem', color: theme.muted, textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>← / → to move</p>
      </div>
    </div>
  );
}

/* Touch quadrant button for mobile */
function TouchBtn({
  label, color, active, onTouchStart, onTouchEnd,
}: {
  label: string; color: string; active: boolean;
  onTouchStart: () => void; onTouchEnd: () => void;
}) {
  return (
    <button
      onTouchStart={e => { e.preventDefault(); onTouchStart(); }}
      onTouchEnd={e => { e.preventDefault(); onTouchEnd(); }}
      onMouseDown={onTouchStart}
      onMouseUp={onTouchEnd}
      onMouseLeave={onTouchEnd}
      style={{
        flex: 1, height: 52, borderRadius: 10,
        background: active ? color : 'transparent',
        border: `2px solid ${color}`,
        boxShadow: active ? `2px 2px 0 ${DARK}` : 'none',
        color: active ? '#fff' : color,
        fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer',
        touchAction: 'manipulation', userSelect: 'none',
        transition: 'background 0.08s, color 0.08s',
      }}
    >
      {label}
    </button>
  );
}

export function PongSection() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pressedKeys, setPressedKeys] = useState<PressedKeys>({
    w: false, a: false, s: false, d: false,
    up: false, left: false, down: false, right: false,
  });
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'P1' | 'P2' | null>(null);

  const game = useRef({
    state: 'waiting' as 'waiting' | 'playing' | 'scored' | 'gameover',
    ball: { x: CX, y: CY, r: 9, vx: 0, vy: 0, speed: 4.5 },
    paddles: {
      top: { angle: TOP_START, span: PADDLE_SPAN, score: 0, left: false, right: false, color: TOP_PLAYER_COLOR, thickness: 13 },
      bottom: { angle: BOTTOM_START, span: PADDLE_SPAN, score: 0, left: false, right: false, color: BOT_PLAYER_COLOR, thickness: 13 },
    },
    flashTimer: 0,
    scoredSide: null as 'top' | 'bottom' | null,
    animId: 0,
  });

  const startRound = useCallback((toward?: 'top' | 'bottom') => {
    const g = game.current;
    g.paddles.top.angle = TOP_START;
    g.paddles.bottom.angle = BOTTOM_START;
    g.paddles.top.left = g.paddles.top.right = false;
    g.paddles.bottom.left = g.paddles.bottom.right = false;
    g.ball.x = CX; g.ball.y = CY; g.ball.speed = 4.5;
    const dir = toward ?? (g.scoredSide === 'top' ? 'bottom' : 'top');
    const base = dir === 'top' ? -Math.PI / 2 : Math.PI / 2;
    const spread = (Math.random() - 0.5) * Math.PI * 0.55;
    const angle = base + spread;
    g.ball.vx = Math.cos(angle) * g.ball.speed;
    g.ball.vy = Math.sin(angle) * g.ball.speed;
    g.state = 'playing';
  }, []);

  const startGame = useCallback(() => {
    const g = game.current;
    g.paddles.top.score = 0;
    g.paddles.bottom.score = 0;
    g.scoredSide = null;
    g.state = 'playing';
    setStarted(true);
    setGameOver(false);
    setWinner(null);
    startRound('bottom');
  }, [startRound]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Key handlers ──
    const handleKeyDown = (e: KeyboardEvent) => {
      const g = game.current;
      let changed = false;
      switch (e.key) {
        case 'a': case 'A': g.paddles.top.left = true; changed = true; break;
        case 'd': case 'D': g.paddles.top.right = true; changed = true; break;
        case 'ArrowLeft': g.paddles.bottom.left = true; e.preventDefault(); changed = true; break;
        case 'ArrowRight': g.paddles.bottom.right = true; e.preventDefault(); changed = true; break;
        case 'ArrowUp': case 'ArrowDown': case ' ': e.preventDefault(); break;
      }
      if (changed) setPressedKeys({ w: false, a: g.paddles.top.left, s: false, d: g.paddles.top.right, up: false, left: g.paddles.bottom.left, down: false, right: g.paddles.bottom.right });
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const g = game.current;
      switch (e.key) {
        case 'a': case 'A': g.paddles.top.left = false; break;
        case 'd': case 'D': g.paddles.top.right = false; break;
        case 'ArrowLeft': g.paddles.bottom.left = false; break;
        case 'ArrowRight': g.paddles.bottom.right = false; break;
      }
      setPressedKeys({ w: false, a: g.paddles.top.left, s: false, d: g.paddles.top.right, up: false, left: g.paddles.bottom.left, down: false, right: g.paddles.bottom.right });
    };

    // ── Touch handlers (canvas quadrant-based) ──
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      const g = game.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_SIZE / rect.width;
      const scaleY = CANVAS_SIZE / rect.height;

      g.paddles.top.left = false;
      g.paddles.top.right = false;
      g.paddles.bottom.left = false;
      g.paddles.bottom.right = false;

      for (let t = 0; t < e.touches.length; t++) {
        const touch = e.touches[t];
        const cx = (touch.clientX - rect.left) * scaleX;
        const cy = (touch.clientY - rect.top) * scaleY;
        if (cy < CANVAS_SIZE / 2) {
          if (cx < CANVAS_SIZE / 2) g.paddles.top.left = true;
          else g.paddles.top.right = true;
        } else {
          if (cx < CANVAS_SIZE / 2) g.paddles.bottom.left = true;
          else g.paddles.bottom.right = true;
        }
      }
      setPressedKeys({ w: false, a: g.paddles.top.left, s: false, d: g.paddles.top.right, up: false, left: g.paddles.bottom.left, down: false, right: g.paddles.bottom.right });
    };

    const handleTouchEnd = () => {
      const g = game.current;
      g.paddles.top.left = g.paddles.top.right = false;
      g.paddles.bottom.left = g.paddles.bottom.right = false;
      setPressedKeys({ w: false, a: false, s: false, d: false, up: false, left: false, down: false, right: false });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    // ── Update ──
    function update() {
      const g = game.current;
      if (g.state !== 'playing') { if (g.flashTimer > 0) g.flashTimer--; return; }

      if (g.paddles.top.left) g.paddles.top.angle -= PADDLE_SPEED;
      if (g.paddles.top.right) g.paddles.top.angle += PADDLE_SPEED;
      // Player 2 is at the bottom: ← moves toward screen-left (angle increases toward π)
      //                             → moves toward screen-right (angle decreases toward 0)
      if (g.paddles.bottom.left) g.paddles.bottom.angle += PADDLE_SPEED;
      if (g.paddles.bottom.right) g.paddles.bottom.angle -= PADDLE_SPEED;

      g.paddles.top.angle = normaliseAngle(g.paddles.top.angle);
      g.paddles.bottom.angle = normaliseAngle(g.paddles.bottom.angle);

      const halfLimit = Math.PI * 0.85;
      const td = angleDiff(TOP_START, g.paddles.top.angle);
      if (Math.abs(td) > halfLimit) g.paddles.top.angle = normaliseAngle(TOP_START + Math.sign(td) * halfLimit);
      const bd = angleDiff(BOTTOM_START, g.paddles.bottom.angle);
      if (Math.abs(bd) > halfLimit) g.paddles.bottom.angle = normaliseAngle(BOTTOM_START + Math.sign(bd) * halfLimit);

      g.ball.x += g.ball.vx;
      g.ball.y += g.ball.vy;

      const dx = g.ball.x - CX, dy = g.ball.y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist + g.ball.r >= R) {
        const ballAngle = normaliseAngle(Math.atan2(dy, dx));
        let hit = false;
        for (const p of Object.values(g.paddles)) {
          if (Math.abs(angleDiff(p.angle, ballAngle)) < p.span) {
            const nx = dx / dist, ny = dy / dist;
            const dot = g.ball.vx * nx + g.ball.vy * ny;
            g.ball.vx -= 2 * dot * nx;
            g.ball.vy -= 2 * dot * ny;
            const overlap = dist + g.ball.r - R;
            g.ball.x -= nx * overlap;
            g.ball.y -= ny * overlap;
            const spd = Math.sqrt(g.ball.vx ** 2 + g.ball.vy ** 2);
            if (spd < 13) { g.ball.vx *= 1.045; g.ball.vy *= 1.045; }
            if (p.left || p.right) { const spin = p.left ? -0.9 : 0.9; g.ball.vx += -ny * spin; g.ball.vy += nx * spin; }
            hit = true; break;
          }
        }
        if (!hit && dist + g.ball.r >= R + 4) {
          const exitedTop = ballAngle > Math.PI;
          if (exitedTop) { g.paddles.bottom.score++; g.scoredSide = 'bottom'; }
          else { g.paddles.top.score++; g.scoredSide = 'top'; }
          g.flashTimer = 28;
          const won = g.paddles.top.score >= WIN_SCORE || g.paddles.bottom.score >= WIN_SCORE;
          if (won) {
            g.state = 'gameover';
            g.paddles.top.angle = TOP_START;
            g.paddles.bottom.angle = BOTTOM_START;
            const w = g.paddles.top.score >= WIN_SCORE ? 'P1' : 'P2';
            setWinner(w);
            setGameOver(true);
          } else {
            g.state = 'scored';
            setTimeout(() => { if (game.current.state === 'scored') startRound(); }, 1400);
          }
        }
      }
    }

    // ── Draw ──
    function drawOverlay(title: string, subtitle: string, color: string | null) {
      ctx.fillStyle = 'rgba(249,248,243,0.88)';
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 26px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = color || DARK;
      if (color) { ctx.shadowColor = color; ctx.shadowBlur = 18; }
      ctx.fillText(title, CX, subtitle ? CY - 18 : CY);
      ctx.shadowBlur = 0;
      if (subtitle) { ctx.font = '13px "JetBrains Mono", monospace'; ctx.fillStyle = 'rgba(19,16,28,0.45)'; ctx.fillText(subtitle, CX, CY + 20); }
    }

    function draw() {
      const g = game.current;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      if (g.flashTimer > 0) { ctx.fillStyle = 'rgba(19,16,28,0.06)'; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE); }

      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.clip();

      // Touch guide quadrant hints (shown in playing state on mobile)
      if (g.state === 'playing' || g.state === 'scored') {
        ctx.font = '11px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(19,16,28,0.10)';
        ctx.fillText('◄', CX / 2, CY / 2);
        ctx.fillText('►', CX + CX / 2, CY / 2);
        ctx.fillStyle = 'rgba(198,40,40,0.10)';
        ctx.fillText('◄', CX / 2, CY + CY / 2);
        ctx.fillText('►', CX + CX / 2, CY + CY / 2);
      }

      ctx.fillStyle = 'rgba(19,16,28,0.04)';
      ctx.beginPath(); ctx.moveTo(CX, CY); ctx.arc(CX, CY, R, Math.PI, 2 * Math.PI); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(198,40,40,0.04)';
      ctx.beginPath(); ctx.moveTo(CX, CY); ctx.arc(CX, CY, R, 0, Math.PI); ctx.closePath(); ctx.fill();

      ctx.strokeStyle = 'rgba(19,16,28,0.12)'; ctx.lineWidth = 1.5; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(CX - R, CY); ctx.lineTo(CX + R, CY); ctx.stroke();
      ctx.setLineDash([]);

      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold 52px "JetBrains Mono", monospace';
      ctx.fillStyle = TOP_PLAYER_COLOR; ctx.fillText(String(g.paddles.top.score), CX - 60, CY - 60);
      ctx.fillStyle = BOT_PLAYER_COLOR; ctx.fillText(String(g.paddles.bottom.score), CX + 60, CY + 60);
      ctx.font = '11px "JetBrains Mono", monospace'; ctx.fillStyle = 'rgba(19,16,28,0.3)';
      ctx.fillText('A  D', CX - 60, CY - 24); ctx.fillText('← →', CX + 60, CY + 24);

      if (g.state === 'playing' || g.state === 'scored') {
        ctx.fillStyle = BALL_COLOR; ctx.shadowColor = BALL_COLOR; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(g.ball.x, g.ball.y, g.ball.r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      ctx.lineWidth = 5; ctx.lineCap = 'butt';
      ctx.strokeStyle = TOP_PLAYER_COLOR; ctx.shadowColor = 'rgba(19,16,28,0.3)'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(CX, CY, R, Math.PI, 2 * Math.PI); ctx.stroke();
      ctx.strokeStyle = BOT_PLAYER_COLOR; ctx.shadowColor = 'rgba(198,40,40,0.35)'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI); ctx.stroke();
      ctx.shadowBlur = 0;

      for (const p of Object.values(g.paddles)) {
        ctx.strokeStyle = p.color; ctx.lineWidth = p.thickness; ctx.lineCap = 'round';
        ctx.shadowColor = p.color; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.arc(CX, CY, R, p.angle - p.span, p.angle + p.span); ctx.stroke();
        ctx.shadowBlur = 0;
      }

      if (g.state === 'waiting') drawOverlay('CIRCULAR PONG', 'Press Start to play', null);
      else if (g.state === 'scored') { const isTop = g.scoredSide === 'top'; drawOverlay((isTop ? 'P1' : 'P2') + ' SCORES!', '', isTop ? TOP_PLAYER_COLOR : BOT_PLAYER_COLOR); }
      else if (g.state === 'gameover') { const isTop = g.paddles.top.score >= WIN_SCORE; drawOverlay((isTop ? 'P1' : 'P2') + ' WINS!', 'First to 3!', isTop ? TOP_PLAYER_COLOR : BOT_PLAYER_COLOR); }
    }

    function loop() { update(); draw(); game.current.animId = requestAnimationFrame(loop); }
    game.current.animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(game.current.animId);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [startRound]);

  /* ── Shared canvas block ── */
  const canvasBlock = (
    <div style={{ position: 'relative' }}>
      <div style={{
        border: `2px solid ${theme.border}`,
        boxShadow: `6px 6px 0 ${theme.border}`,
        borderRadius: '50%', overflow: 'hidden', lineHeight: 0,
        transition: 'border-color 0.35s, box-shadow 0.35s',
      }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ display: 'block', width: '100%', maxWidth: CANVAS_SIZE, touchAction: 'none' }}
        />
      </div>

      {/* Game Over overlay */}
      {gameOver && winner && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%', background: 'rgba(19,16,28,0.78)', backdropFilter: 'blur(4px)', gap: 14,
        }}>
          <div style={{ fontSize: '3rem', lineHeight: 1 }}>🏆</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.5px', color: winner === 'P1' ? TOP_PLAYER_COLOR : BOT_PLAYER_COLOR, textShadow: `0 0 24px ${winner === 'P1' ? 'rgba(19,16,28,0.6)' : 'rgba(198,40,40,0.7)'}` }}>
            {winner} Wins!
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 700, color: 'rgba(249,248,243,0.6)', padding: '4px 14px', background: 'rgba(249,248,243,0.08)', border: '1.5px solid rgba(249,248,243,0.15)', borderRadius: 20 }}>
            {game.current.paddles.top.score} — {game.current.paddles.bottom.score}
          </div>
          <button onClick={startGame} style={{ marginTop: 4, padding: '10px 28px', background: ACCENT, color: '#fff', border: '2px solid #F9F8F3', boxShadow: '3px 3px 0 #F9F8F3', borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #F9F8F3'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 #F9F8F3'; }}>
            ▶ Play Again
          </button>
        </div>
      )}
    </div>
  );

  return (
    <section id="game" style={{ padding: isMobile ? '40px 0 60px' : '64px 0 80px' }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: ACCENT, marginBottom: 8 }}>
          Mini Game
        </p>
        <h2 style={{ fontSize: isMobile ? '1.7rem' : '2.2rem', fontWeight: 800, letterSpacing: '-1px', color: theme.text, lineHeight: 1.1, transition: 'color 0.35s' }}>
          Play Circular<span style={{ color: ACCENT, marginLeft: 10 }}>Pong</span>
        </h2>
      </div>

      {isMobile ? (
        /* ── Mobile layout ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          {/* Canvas */}
          <div style={{ width: '100%', maxWidth: 420 }}>
            {canvasBlock}
          </div>

          {/* Touch control guide */}
          {started && !gameOver && (
            <div style={{
              width: '100%', maxWidth: 420,
              background: theme.card, border: `2px solid ${theme.border}`,
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: ACCENT, textAlign: 'center' }}>
                Touch Controls
              </p>
              {/* P1 row */}
              <div>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: TOP_PLAYER_COLOR, textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' }}>Player 1 · Top arc</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <TouchBtn label="◄" color={TOP_PLAYER_COLOR} active={pressedKeys.a}
                    onTouchStart={() => { game.current.paddles.top.left = true; setPressedKeys(p => ({ ...p, a: true })); }}
                    onTouchEnd={() => { game.current.paddles.top.left = false; setPressedKeys(p => ({ ...p, a: false })); }} />
                  <TouchBtn label="►" color={TOP_PLAYER_COLOR} active={pressedKeys.d}
                    onTouchStart={() => { game.current.paddles.top.right = true; setPressedKeys(p => ({ ...p, d: true })); }}
                    onTouchEnd={() => { game.current.paddles.top.right = false; setPressedKeys(p => ({ ...p, d: false })); }} />
                </div>
              </div>
              {/* P2 row */}
              <div>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: BOT_PLAYER_COLOR, textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' }}>Player 2 · Bottom arc</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <TouchBtn label="◄" color={BOT_PLAYER_COLOR} active={pressedKeys.left}
                    onTouchStart={() => { game.current.paddles.bottom.left = true; setPressedKeys(p => ({ ...p, left: true })); }}
                    onTouchEnd={() => { game.current.paddles.bottom.left = false; setPressedKeys(p => ({ ...p, left: false })); }} />
                  <TouchBtn label="►" color={BOT_PLAYER_COLOR} active={pressedKeys.right}
                    onTouchStart={() => { game.current.paddles.bottom.right = true; setPressedKeys(p => ({ ...p, right: true })); }}
                    onTouchEnd={() => { game.current.paddles.bottom.right = false; setPressedKeys(p => ({ ...p, right: false })); }} />
                </div>
              </div>
              <p style={{ fontSize: '0.62rem', color: theme.muted, textAlign: 'center', fontStyle: 'italic' }}>
                Or touch canvas quadrants directly · First to {WIN_SCORE} wins
              </p>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            {!started && (
              <button onClick={startGame} style={{ padding: '12px 32px', background: ACCENT, color: '#FFF', border: `2px solid ${theme.text}`, boxShadow: `3px 3px 0 ${theme.text}`, borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                ▶ Start Game
              </button>
            )}
            {started && !gameOver && (
              <button onClick={startGame} style={{ padding: '12px 32px', background: 'transparent', color: theme.text, border: `2px solid ${theme.text}`, boxShadow: `3px 3px 0 ${theme.text}`, borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                ↺ Restart
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── Desktop layout ── */
        <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Canvas + buttons */}
          <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            {canvasBlock}
            <div style={{ display: 'flex', gap: 12 }}>
              {!started && (
                <button onClick={startGame} style={{ padding: '10px 28px', background: ACCENT, color: '#FFF', border: `2px solid ${theme.text}`, boxShadow: `3px 3px 0 ${theme.text}`, borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = `4px 4px 0 ${theme.text}`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `3px 3px 0 ${theme.text}`; }}>
                  ▶ Start Game
                </button>
              )}
              {started && !gameOver && (
                <button onClick={startGame} style={{ padding: '10px 28px', background: 'transparent', color: theme.text, border: `2px solid ${theme.text}`, boxShadow: `3px 3px 0 ${theme.text}`, borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = theme.text; e.currentTarget.style.color = theme.bg; e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = `4px 4px 0 ${ACCENT}`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.text; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `3px 3px 0 ${theme.text}`; }}>
                  ↺ Restart
                </button>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ flex: '1 1 300px', minHeight: 360, background: theme.card, border: `2px solid ${theme.border}`, boxShadow: `4px 4px 0 ${ACCENT}`, borderRadius: 16, padding: '32px 24px', display: 'flex', flexDirection: 'column', transition: 'background 0.35s, border-color 0.35s' }}>
            {gameOver && winner ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 20, textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: ACCENT }}>Game Over</div>
                <div style={{ fontSize: '4rem', lineHeight: 1 }}>🏆</div>
                <div style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.5px', color: winner === 'P1' ? TOP_PLAYER_COLOR : BOT_PLAYER_COLOR, fontFamily: "'Space Grotesk', sans-serif" }}>{winner} Wins!</div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: TOP_PLAYER_COLOR, fontFamily: "'JetBrains Mono', monospace" }}>{game.current.paddles.top.score}</div>
                    <div style={{ fontSize: '0.62rem', color: theme.muted, fontWeight: 600, textTransform: 'uppercase' }}>Player 1</div>
                  </div>
                  <div style={{ fontSize: '1.2rem', color: theme.muted }}>—</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: BOT_PLAYER_COLOR, fontFamily: "'JetBrains Mono', monospace" }}>{game.current.paddles.bottom.score}</div>
                    <div style={{ fontSize: '0.62rem', color: theme.muted, fontWeight: 600, textTransform: 'uppercase' }}>Player 2</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: theme.muted, fontStyle: 'italic' }}>First to {WIN_SCORE} wins!</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: ACCENT, marginBottom: 24, textAlign: 'center' }}>Controls</div>
                <KeyboardDisplay pressed={pressedKeys} theme={theme} />
                {started && <div style={{ marginTop: 'auto', paddingTop: 16, textAlign: 'center', fontSize: '0.7rem', color: theme.muted, fontStyle: 'italic' }}>First to {WIN_SCORE} points wins</div>}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
