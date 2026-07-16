import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

const ACCENT = '#C62828';
const DARK = '#13101C';
const BG = '#F9F8F3';

// ── Canvas / game constants ──────────────────────────────────
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

// ── Key display ───────────────────────────────────────────────
interface PressedKeys {
  w: boolean; a: boolean; s: boolean; d: boolean;
  up: boolean; left: boolean; down: boolean; right: boolean;
}

function KeyCap({
  label, active, wide = false, theme,
}: {
  label: string; active: boolean; wide?: boolean; theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <div style={{
      width: wide ? 90 : 44, height: 44,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `2px solid ${active ? ACCENT : theme.border}`,
      boxShadow: active ? `2px 2px 0 ${ACCENT}, 0 0 12px rgba(198,40,40,0.35)` : `2px 2px 0 ${theme.border}`,
      background: active ? ACCENT : theme.card,
      color: active ? '#FFF' : theme.text,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700, fontSize: '0.85rem', borderRadius: '6px',
      transform: active ? 'translate(1px, 1px)' : 'none',
      transition: 'all 0.08s ease', userSelect: 'none', flexShrink: 0,
    }}>
      {label}
    </div>
  );
}

function KeyboardDisplay({ pressed, theme }: { pressed: PressedKeys; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      {/* Player 1 */}
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: TOP_PLAYER_COLOR, textAlign: 'center', marginBottom: '12px' }}>
          Player 1
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <KeyCap label="W" active={pressed.w} theme={theme} />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <KeyCap label="A" active={pressed.a} theme={theme} />
            <KeyCap label="S" active={pressed.s} theme={theme} />
            <KeyCap label="D" active={pressed.d} theme={theme} />
          </div>
        </div>
        <p style={{ fontSize: '0.68rem', color: theme.muted, textAlign: 'center', marginTop: '8px', fontStyle: 'italic' }}>
          A / D to move
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: '80px', height: '2px', background: `repeating-linear-gradient(90deg, ${theme.border} 0px, ${theme.border} 6px, transparent 6px, transparent 12px)` }} />

      {/* Player 2 */}
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: BOT_PLAYER_COLOR, textAlign: 'center', marginBottom: '12px' }}>
          Player 2
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <KeyCap label="↑" active={pressed.up} theme={theme} />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <KeyCap label="←" active={pressed.left} theme={theme} />
            <KeyCap label="↓" active={pressed.down} theme={theme} />
            <KeyCap label="→" active={pressed.right} theme={theme} />
          </div>
        </div>
        <p style={{ fontSize: '0.68rem', color: theme.muted, textAlign: 'center', marginTop: '8px', fontStyle: 'italic' }}>
          ← / → to move
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function PongSection() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pressedKeys, setPressedKeys] = useState<PressedKeys>({
    w: false, a: false, s: false, d: false,
    up: false, left: false, down: false, right: false,
  });
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'P1' | 'P2' | null>(null);

  // All mutable game state lives in a single ref object to avoid closure issues
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

    g.ball.x = CX;
    g.ball.y = CY;
    g.ball.speed = 4.5;

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
        case 'ArrowUp': e.preventDefault(); break;
        case 'ArrowDown': e.preventDefault(); break;
        case ' ': e.preventDefault(); break;
      }
      if (changed) {
        setPressedKeys({
          w: false,
          a: g.paddles.top.left,
          s: false,
          d: g.paddles.top.right,
          up: false,
          left: g.paddles.bottom.left,
          down: false,
          right: g.paddles.bottom.right,
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const g = game.current;
      switch (e.key) {
        case 'a': case 'A': g.paddles.top.left = false; break;
        case 'd': case 'D': g.paddles.top.right = false; break;
        case 'ArrowLeft': g.paddles.bottom.left = false; break;
        case 'ArrowRight': g.paddles.bottom.right = false; break;
      }
      setPressedKeys({
        w: false,
        a: g.paddles.top.left,
        s: false,
        d: g.paddles.top.right,
        up: false,
        left: g.paddles.bottom.left,
        down: false,
        right: g.paddles.bottom.right,
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // ── Update logic ──
    function update() {
      const g = game.current;
      if (g.state !== 'playing') {
        if (g.flashTimer > 0) g.flashTimer--;
        return;
      }

      if (g.paddles.top.left) g.paddles.top.angle -= PADDLE_SPEED;
      if (g.paddles.top.right) g.paddles.top.angle += PADDLE_SPEED;
      if (g.paddles.bottom.left) g.paddles.bottom.angle -= PADDLE_SPEED;
      if (g.paddles.bottom.right) g.paddles.bottom.angle += PADDLE_SPEED;

      g.paddles.top.angle = normaliseAngle(g.paddles.top.angle);
      g.paddles.bottom.angle = normaliseAngle(g.paddles.bottom.angle);

      const halfLimit = Math.PI * 0.85;
      const td = angleDiff(TOP_START, g.paddles.top.angle);
      if (Math.abs(td) > halfLimit)
        g.paddles.top.angle = normaliseAngle(TOP_START + Math.sign(td) * halfLimit);

      const bd = angleDiff(BOTTOM_START, g.paddles.bottom.angle);
      if (Math.abs(bd) > halfLimit)
        g.paddles.bottom.angle = normaliseAngle(BOTTOM_START + Math.sign(bd) * halfLimit);

      g.ball.x += g.ball.vx;
      g.ball.y += g.ball.vy;

      const dx = g.ball.x - CX;
      const dy = g.ball.y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist + g.ball.r >= R) {
        const ballAngle = normaliseAngle(Math.atan2(dy, dx));
        let hit = false;

        for (const p of Object.values(g.paddles)) {
          if (Math.abs(angleDiff(p.angle, ballAngle)) < p.span) {
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = g.ball.vx * nx + g.ball.vy * ny;
            g.ball.vx -= 2 * dot * nx;
            g.ball.vy -= 2 * dot * ny;

            const overlap = dist + g.ball.r - R;
            g.ball.x -= nx * overlap;
            g.ball.y -= ny * overlap;

            const spd = Math.sqrt(g.ball.vx ** 2 + g.ball.vy ** 2);
            if (spd < 13) { g.ball.vx *= 1.045; g.ball.vy *= 1.045; }

            if (p.left || p.right) {
              const spin = p.left ? -0.9 : 0.9;
              g.ball.vx += -ny * spin;
              g.ball.vy += nx * spin;
            }
            hit = true;
            break;
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
            setTimeout(() => {
              if (game.current.state === 'scored') startRound();
            }, 1400);
          }
        }
      }
    }

    // ── Draw logic ──
    function drawOverlay(title: string, subtitle: string, color: string | null) {
      ctx.fillStyle = 'rgba(249,248,243,0.88)';
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 26px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color || DARK;
      if (color) { ctx.shadowColor = color; ctx.shadowBlur = 18; }
      ctx.fillText(title, CX, subtitle ? CY - 18 : CY);
      ctx.shadowBlur = 0;

      if (subtitle) {
        ctx.font = '13px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(19,16,28,0.45)';
        ctx.fillText(subtitle, CX, CY + 20);
      }
    }

    function draw() {
      const g = game.current;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Background
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Flash effect
      if (g.flashTimer > 0) {
        ctx.fillStyle = 'rgba(19,16,28,0.06)';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }

      // Clip to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.clip();

      // Half tints
      ctx.fillStyle = 'rgba(19,16,28,0.04)';
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, Math.PI, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(198,40,40,0.04)';
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, 0, Math.PI);
      ctx.closePath();
      ctx.fill();

      // Divider
      ctx.strokeStyle = 'rgba(19,16,28,0.12)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(CX - R, CY);
      ctx.lineTo(CX + R, CY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Scores
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 52px "JetBrains Mono", monospace';

      ctx.fillStyle = TOP_PLAYER_COLOR;
      ctx.fillText(String(g.paddles.top.score), CX - 60, CY - 60);

      ctx.fillStyle = BOT_PLAYER_COLOR;
      ctx.fillText(String(g.paddles.bottom.score), CX + 60, CY + 60);

      // Score labels
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(19,16,28,0.3)';
      ctx.fillText('A  D', CX - 60, CY - 24);
      ctx.fillText('← →', CX + 60, CY + 24);

      // Ball
      if (g.state === 'playing' || g.state === 'scored') {
        ctx.fillStyle = BALL_COLOR;
        ctx.shadowColor = BALL_COLOR;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(g.ball.x, g.ball.y, g.ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore(); // end clip

      // Arena border arcs
      ctx.lineWidth = 5;
      ctx.lineCap = 'butt';

      // Top arc — dark player
      ctx.strokeStyle = TOP_PLAYER_COLOR;
      ctx.shadowColor = 'rgba(19,16,28,0.3)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(CX, CY, R, Math.PI, 2 * Math.PI);
      ctx.stroke();

      // Bottom arc — red player
      ctx.strokeStyle = BOT_PLAYER_COLOR;
      ctx.shadowColor = 'rgba(198,40,40,0.35)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Paddles
      for (const p of Object.values(g.paddles)) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.thickness;
        ctx.lineCap = 'round';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(CX, CY, R, p.angle - p.span, p.angle + p.span);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Overlays
      if (g.state === 'waiting') {
        drawOverlay('CIRCULAR PONG', 'Press Start to play', null);
      } else if (g.state === 'scored') {
        const isTop = g.scoredSide === 'top';
        drawOverlay((isTop ? 'P1' : 'P2') + ' SCORES!', '', isTop ? TOP_PLAYER_COLOR : BOT_PLAYER_COLOR);
      } else if (g.state === 'gameover') {
        const isTop = g.paddles.top.score >= WIN_SCORE;
        drawOverlay((isTop ? 'P1' : 'P2') + ' WINS!', 'Press Restart', isTop ? TOP_PLAYER_COLOR : BOT_PLAYER_COLOR);
      }
    }

    // ── Game loop ──
    function loop() {
      update();
      draw();
      game.current.animId = requestAnimationFrame(loop);
    }

    game.current.animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(game.current.animId);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [startRound]);

  return (
    <section id="game" style={{ padding: '64px 0 80px' }}>
      {/* Section header */}
      <div style={{ marginBottom: '48px' }}>
        <p style={{
          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.15em', color: ACCENT, marginBottom: '8px',
        }}>
          Mini Game
        </p>
        <h2 style={{
          fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-1px',
          color: theme.text, lineHeight: 1.1, transition: 'color 0.35s',
        }}>
          Play Circular
          <span style={{ color: ACCENT, marginLeft: '10px' }}>Pong</span>
        </h2>
      </div>

      {/* Game layout: canvas left, keys right */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Left: game canvas + controls */}
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          {/* Canvas wrapper — Game Over overlay is positioned on top */}
          <div style={{ position: 'relative' }}>
            <div style={{
              border: `2px solid ${theme.border}`,
              boxShadow: `6px 6px 0 ${theme.border}`,
              borderRadius: '50%',
              overflow: 'hidden',
              lineHeight: 0,
              transition: 'border-color 0.35s, box-shadow 0.35s',
            }}>
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                style={{ display: 'block', maxWidth: '100%', touchAction: 'none' }}
              />
            </div>

            {/* Game Over overlay — centred over the canvas circle */}
            {gameOver && winner && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(19,16,28,0.78)',
                backdropFilter: 'blur(4px)',
                gap: '14px',
              }}>
                {/* Trophy */}
                <div style={{ fontSize: '3rem', lineHeight: 1 }}>🏆</div>

                {/* Winner label */}
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.5px',
                  color: winner === 'P1' ? TOP_PLAYER_COLOR : BOT_PLAYER_COLOR,
                  textShadow: `0 0 24px ${winner === 'P1' ? 'rgba(19,16,28,0.6)' : 'rgba(198,40,40,0.7)'}`,
                }}>
                  {winner} Wins!
                </div>

                {/* Score */}
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.85rem', fontWeight: 700,
                  color: 'rgba(249,248,243,0.6)',
                  padding: '4px 14px',
                  background: 'rgba(249,248,243,0.08)',
                  border: '1.5px solid rgba(249,248,243,0.15)',
                  borderRadius: '20px',
                }}>
                  {game.current.paddles.top.score} — {game.current.paddles.bottom.score}
                </div>

                {/* Play again button */}
                <button onClick={startGame} style={{
                  marginTop: '4px',
                  padding: '10px 28px',
                  background: ACCENT, color: '#fff',
                  border: '2px solid #F9F8F3',
                  boxShadow: '3px 3px 0 #F9F8F3',
                  borderRadius: '8px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: '0.9rem',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #F9F8F3'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 #F9F8F3'; }}
                >
                  ▶ Play Again
                </button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {!started && (
              <button onClick={startGame}
                style={{
                  padding: '10px 28px', background: ACCENT, color: '#FFF',
                  border: `2px solid ${theme.text}`, boxShadow: `3px 3px 0 ${theme.text}`,
                  borderRadius: '8px', fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = `4px 4px 0 ${theme.text}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `3px 3px 0 ${theme.text}`; }}
              >
                ▶ Start Game
              </button>
            )}
            {started && !gameOver && (
              <button onClick={startGame}
                style={{
                  padding: '10px 28px', background: 'transparent', color: theme.text,
                  border: `2px solid ${theme.text}`, boxShadow: `3px 3px 0 ${theme.text}`,
                  borderRadius: '8px', fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = theme.text; e.currentTarget.style.color = theme.bg; e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = `4px 4px 0 ${ACCENT}`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.text; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `3px 3px 0 ${theme.text}`; }}
              >
                ↺ Restart
              </button>
            )}
          </div>
        </div>

        {/* Right: controls / game-over summary panel */}
        <div style={{
          flex: '1 1 300px', minHeight: '360px',
          background: theme.card, border: `2px solid ${theme.border}`,
          boxShadow: `4px 4px 0 ${ACCENT}`, borderRadius: '16px',
          padding: '32px 24px', display: 'flex', flexDirection: 'column',
          transition: 'background 0.35s, border-color 0.35s',
        }}>
          {gameOver && winner ? (
            /* Game over summary in side panel */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: ACCENT }}>
                Game Over
              </div>
              <div style={{ fontSize: '4rem', lineHeight: 1 }}>🏆</div>
              <div style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.5px', color: winner === 'P1' ? TOP_PLAYER_COLOR : BOT_PLAYER_COLOR, fontFamily: "'Space Grotesk', sans-serif" }}>
                {winner} Wins!
              </div>
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
              <div style={{ fontSize: '0.72rem', color: theme.muted, fontStyle: 'italic' }}>
                First to {WIN_SCORE} wins!
              </div>
            </div>
          ) : (
            <>
              <div style={{
                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.12em', color: ACCENT, marginBottom: '24px', textAlign: 'center',
              }}>
                Controls
              </div>
              <KeyboardDisplay pressed={pressedKeys} theme={theme} />
              {started && (
                <div style={{ marginTop: 'auto', paddingTop: 16, textAlign: 'center', fontSize: '0.7rem', color: theme.muted, fontStyle: 'italic' }}>
                  First to {WIN_SCORE} points wins
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
