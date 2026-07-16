// ============================================================
//  CIRCULAR PONG — pong.js
//  Top player = BLUE (A / D)  |  Bottom player = RED (← / →)
//  - Wider circle (R = 295)
//  - Paddles reset to start position after each point
//  - Reads light/dark mode from body.light-mode class
//  - Touch buttons only on mobile, keyboard hints only on desktop
// ============================================================

const canvas = document.getElementById('pongCanvas');
const ctx    = canvas.getContext('2d');

const W  = canvas.width  = 640;
const H  = canvas.height = 640;
const CX = W / 2;
const CY = H / 2;
const R  = 295;

// ── Starting angles (reset after each point) ─────────────────
const TOP_START    = normaliseAngle(-Math.PI / 2);  // 270° — top
const BOTTOM_START = Math.PI / 2;                   // 90°  — bottom

// ── Themes ───────────────────────────────────────────────────
const THEME = {
  dark: {
    bg:         '#0a0a0f',
    tintBlue:   'rgba(58,127,255,0.07)',
    tintRed:    'rgba(255,58,58,0.07)',
    divider:    'rgba(255,255,255,0.12)',
    ball:       '#ffffff',
    flash:      'rgba(255,255,255,0.12)',
    scoreLabel: 'rgba(255,255,255,0.30)',
    overlayBg:  'rgba(0,0,0,0.62)',
    overlayTxt: 'rgba(255,255,255,0.50)',
  },
  light: {
    bg:         '#f0f0f8',
    tintBlue:   'rgba(58,127,255,0.10)',
    tintRed:    'rgba(255,58,58,0.10)',
    divider:    'rgba(0,0,0,0.15)',
    ball:       '#111111',
    flash:      'rgba(0,0,0,0.08)',
    scoreLabel: 'rgba(0,0,0,0.35)',
    overlayBg:  'rgba(240,240,248,0.75)',
    overlayTxt: 'rgba(0,0,0,0.45)',
  },
};

// Player colours — same in both modes
const BLUE = '#3a7fff';
const RED  = '#ff3a3a';

// ── Device detection ─────────────────────────────────────────
// True on phones/tablets, false on desktop/laptop
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

function getTheme() {
  return document.body.classList.contains('light-mode') ? THEME.light : THEME.dark;
}

// ── Ball ─────────────────────────────────────────────────────
const ball = { x: CX, y: CY, r: 9, vx: 0, vy: 0, speed: 4.5 };

// ── Paddles ──────────────────────────────────────────────────
const PADDLE_SPAN  = 0.38;
const PADDLE_SPEED = 0.048;

const paddles = {
  top: {
    angle: TOP_START,
    span: PADDLE_SPAN, score: 0,
    left: false, right: false,
    color: BLUE, label: 'A  D', thickness: 13,
  },
  bottom: {
    angle: BOTTOM_START,
    span: PADDLE_SPAN, score: 0,
    left: false, right: false,
    color: RED, label: '←  →', thickness: 13,
  },
};

// ── Game state ────────────────────────────────────────────────
let state = 'waiting', flashTimer = 0, scoredSide = null;
const WIN_SCORE = 7;

// ── Touch zones ──────────────────────────────────────────────
const touchZones = {
  topLeft:     () => ({ x: W * 0.05, y: H * 0.18, w: W * 0.30, h: H * 0.14 }),
  topRight:    () => ({ x: W * 0.65, y: H * 0.18, w: W * 0.30, h: H * 0.14 }),
  bottomLeft:  () => ({ x: W * 0.05, y: H * 0.68, w: W * 0.30, h: H * 0.14 }),
  bottomRight: () => ({ x: W * 0.65, y: H * 0.68, w: W * 0.30, h: H * 0.14 }),
};

function pointInZone(px, py, zone) {
  return px >= zone.x && px <= zone.x + zone.w &&
         py >= zone.y && py <= zone.y + zone.h;
}

// ── Keyboard listeners ────────────────────────────────────────
document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'a': case 'A':  paddles.top.left     = true;  break;
    case 'd': case 'D':  paddles.top.right    = true;  break;
    case 'ArrowLeft':    paddles.bottom.left  = true;  e.preventDefault(); break;
    case 'ArrowRight':   paddles.bottom.right = true;  e.preventDefault(); break;
    case 'ArrowUp':
    case 'ArrowDown':
    case ' ':            e.preventDefault();           break;
  }
});
document.addEventListener('keyup', e => {
  switch (e.key) {
    case 'a': case 'A':  paddles.top.left     = false; break;
    case 'd': case 'D':  paddles.top.right    = false; break;
    case 'ArrowLeft':    paddles.bottom.left  = false; break;
    case 'ArrowRight':   paddles.bottom.right = false; break;
  }
});

// ── Touch listeners ───────────────────────────────────────────
function getCanvasPos(touch) {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;
  return {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top)  * scaleY,
  };
}

function applyTouches(e) {
  paddles.top.left     = false;
  paddles.top.right    = false;
  paddles.bottom.left  = false;
  paddles.bottom.right = false;
  for (const touch of e.touches) {
    const { x, y } = getCanvasPos(touch);
    if (pointInZone(x, y, touchZones.topLeft()))     paddles.top.left     = true;
    if (pointInZone(x, y, touchZones.topRight()))    paddles.top.right    = true;
    if (pointInZone(x, y, touchZones.bottomLeft()))  paddles.bottom.left  = true;
    if (pointInZone(x, y, touchZones.bottomRight())) paddles.bottom.right = true;
  }
}

canvas.addEventListener('touchstart', e => { e.preventDefault(); applyTouches(e); }, { passive: false });
canvas.addEventListener('touchmove',  e => { e.preventDefault(); applyTouches(e); }, { passive: false });
canvas.addEventListener('touchend',   e => {
  e.preventDefault();
  applyTouches(e);
  if (e.touches.length === 0) {
    paddles.top.left = paddles.top.right = false;
    paddles.bottom.left = paddles.bottom.right = false;
  }
}, { passive: false });

// ── Buttons ───────────────────────────────────────────────────
const startBtn   = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

startBtn.addEventListener('click', () => {
  resetScores();
  scoredSide = null;
  startRound('bottom');
  startBtn.classList.add('hidden');
  restartBtn.classList.remove('hidden');
});

restartBtn.addEventListener('click', () => {
  resetScores();
  scoredSide = null;
  startRound('bottom');
});

function resetScores() {
  paddles.top.score    = 0;
  paddles.bottom.score = 0;
}

function resetPaddles() {
  paddles.top.angle    = TOP_START;
  paddles.bottom.angle = BOTTOM_START;
  paddles.top.left  = paddles.top.right  = false;
  paddles.bottom.left = paddles.bottom.right = false;
}

// ── Helpers ───────────────────────────────────────────────────
function angleDiff(a, b) {
  return ((b - a) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
}
function normaliseAngle(a) {
  return ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}
function resetBall(toward) {
  ball.x = CX; ball.y = CY;
  ball.speed = 4.5;
  const base   = toward === 'top' ? -Math.PI / 2 : Math.PI / 2;
  const spread = (Math.random() - 0.5) * Math.PI * 0.55;
  const angle  = base + spread;
  ball.vx = Math.cos(angle) * ball.speed;
  ball.vy = Math.sin(angle) * ball.speed;
}
function startRound(toward) {
  resetPaddles();
  resetBall(toward || (scoredSide === 'top' ? 'bottom' : 'top'));
  state = 'playing';
}
function checkWin() {
  if (paddles.top.score    >= WIN_SCORE) return 'top';
  if (paddles.bottom.score >= WIN_SCORE) return 'bottom';
  return null;
}

// ── Update ────────────────────────────────────────────────────
function update() {
  if (state !== 'playing') { if (flashTimer > 0) flashTimer--; return; }

  if (paddles.top.left)     paddles.top.angle    -= PADDLE_SPEED;
  if (paddles.top.right)    paddles.top.angle    += PADDLE_SPEED;
  if (paddles.bottom.left)  paddles.bottom.angle -= PADDLE_SPEED;
  if (paddles.bottom.right) paddles.bottom.angle += PADDLE_SPEED;

  paddles.top.angle    = normaliseAngle(paddles.top.angle);
  paddles.bottom.angle = normaliseAngle(paddles.bottom.angle);

  const halfLimit = Math.PI * 0.85;

  let td = angleDiff(TOP_START, paddles.top.angle);
  if (Math.abs(td) > halfLimit)
    paddles.top.angle = normaliseAngle(TOP_START + Math.sign(td) * halfLimit);

  let bd = angleDiff(BOTTOM_START, paddles.bottom.angle);
  if (Math.abs(bd) > halfLimit)
    paddles.bottom.angle = normaliseAngle(BOTTOM_START + Math.sign(bd) * halfLimit);

  ball.x += ball.vx;
  ball.y += ball.vy;

  const dx   = ball.x - CX, dy = ball.y - CY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist + ball.r >= R) {
    const ballAngle = normaliseAngle(Math.atan2(dy, dx));
    let hit = false;

    for (const p of Object.values(paddles)) {
      if (Math.abs(angleDiff(p.angle, ballAngle)) < p.span) {
        const nx  = dx / dist, ny = dy / dist;
        const dot = ball.vx * nx + ball.vy * ny;
        ball.vx  -= 2 * dot * nx;
        ball.vy  -= 2 * dot * ny;

        const overlap = (dist + ball.r) - R;
        ball.x -= nx * overlap;
        ball.y -= ny * overlap;

        const spd = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
        if (spd < 13) { ball.vx *= 1.045; ball.vy *= 1.045; }

        if (p.left || p.right) {
          const spin = p.left ? -0.9 : 0.9;
          ball.vx += -ny * spin;
          ball.vy +=  nx * spin;
        }
        hit = true; break;
      }
    }

    if (!hit && dist + ball.r >= R + 4) {
      const exitedTop = ballAngle > Math.PI;
      if (exitedTop) { paddles.bottom.score++; scoredSide = 'bottom'; }
      else           { paddles.top.score++;    scoredSide = 'top';    }

      flashTimer = 28;
      const winner = checkWin();
      if (winner) {
        state = 'gameover';
        resetPaddles();
      } else {
        state = 'scored';
        setTimeout(() => { if (state === 'scored') startRound(); }, 1400);
      }
    }
  }
}

// ── Draw ──────────────────────────────────────────────────────
function draw() {
  const T = getTheme();

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, W, H);

  if (flashTimer > 0) {
    ctx.fillStyle = T.flash;
    ctx.fillRect(0, 0, W, H);
  }

  // Clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.clip();

  // Half tints
  ctx.fillStyle = T.tintBlue;
  ctx.beginPath();
  ctx.moveTo(CX, CY);
  ctx.arc(CX, CY, R, Math.PI, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = T.tintRed;
  ctx.beginPath();
  ctx.moveTo(CX, CY);
  ctx.arc(CX, CY, R, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  // Divider
  ctx.strokeStyle = T.divider;
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  ctx.moveTo(CX - R, CY);
  ctx.lineTo(CX + R, CY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Scoreboard
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.font         = 'bold 60px monospace';

  ctx.shadowColor = BLUE;
  ctx.shadowBlur  = 20;
  ctx.fillStyle   = BLUE;
  ctx.fillText(paddles.top.score, CX - 70, CY - 70);
  ctx.shadowBlur  = 0;

  ctx.shadowColor = RED;
  ctx.shadowBlur  = 20;
  ctx.fillStyle   = RED;
  ctx.fillText(paddles.bottom.score, CX + 70, CY + 70);
  ctx.shadowBlur  = 0;

  // Key labels — desktop only
  if (!isTouchDevice) {
    ctx.font      = '13px monospace';
    ctx.fillStyle = T.scoreLabel;
    ctx.fillText(paddles.top.label,    CX - 70, CY - 28);
    ctx.fillText(paddles.bottom.label, CX + 70, CY + 28);
  }

  // Ball
  if (state === 'playing' || state === 'scored') {
    ctx.fillStyle   = T.ball;
    ctx.shadowColor = T.ball;
    ctx.shadowBlur  = 16;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore(); // end clip

  // Arena border — blue top arc, red bottom arc
  ctx.lineWidth = 4;
  ctx.lineCap   = 'butt';

  ctx.strokeStyle = BLUE;
  ctx.shadowColor = BLUE;
  ctx.shadowBlur  = 16;
  ctx.beginPath();
  ctx.arc(CX, CY, R, Math.PI, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = RED;
  ctx.shadowColor = RED;
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Paddles
  for (const p of Object.values(paddles)) {
    ctx.strokeStyle = p.color;
    ctx.lineWidth   = p.thickness;
    ctx.lineCap     = 'round';
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 20;
    ctx.beginPath();
    ctx.arc(CX, CY, R, p.angle - p.span, p.angle + p.span);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Overlays
  ctx.textBaseline = 'middle';
  if (state === 'waiting') {
    drawOverlay(T, 'CIRCULAR PONG', 'Press Start to play', null);
  } else if (state === 'scored') {
    const isTop = scoredSide === 'top';
    drawOverlay(T, (isTop ? 'BLUE' : 'RED') + ' SCORES!', '', isTop ? BLUE : RED);
  } else if (state === 'gameover') {
    const isTop = paddles.top.score >= WIN_SCORE;
    drawOverlay(T, (isTop ? 'BLUE' : 'RED') + ' WINS!', 'Press Restart', isTop ? BLUE : RED);
  }

  // Touch buttons — mobile only
  drawTouchButtons(T);
}

// ── Overlay ───────────────────────────────────────────────────
function drawOverlay(T, title, subtitle, color) {
  ctx.fillStyle = T.overlayBg;
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.fill();

  ctx.font         = 'bold 32px monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = color || T.ball;
  ctx.shadowColor  = color || T.ball;
  ctx.shadowBlur   = 20;
  ctx.fillText(title, CX, subtitle ? CY - 18 : CY);
  ctx.shadowBlur   = 0;

  if (subtitle) {
    ctx.font      = '15px monospace';
    ctx.fillStyle = T.overlayTxt;
    ctx.fillText(subtitle, CX, CY + 20);
  }
}

// ── Touch buttons — mobile only ───────────────────────────────
function drawTouchButtons(T) {
  if (!isTouchDevice) return;  // skip entirely on desktop

  const zones = [
    { zone: touchZones.topLeft(),     label: '◀', color: BLUE },
    { zone: touchZones.topRight(),    label: '▶', color: BLUE },
    { zone: touchZones.bottomLeft(),  label: '◀', color: RED  },
    { zone: touchZones.bottomRight(), label: '▶', color: RED  },
  ];

  for (const { zone, label, color } of zones) {
    ctx.fillStyle   = `${color}22`;
    ctx.strokeStyle = `${color}88`;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.roundRect(zone.x, zone.y, zone.w, zone.h, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle    = color;
    ctx.font         = 'bold 22px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, zone.x + zone.w / 2, zone.y + zone.h / 2);
  }
}

// ── Loop ──────────────────────────────────────────────────────
function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();
