# Portfolio Redesign Plan

## Context

The app has been restored to a clean baseline. All components compile without errors.
The user wants 10 features implemented while keeping all other existing components unchanged.
Google Drive files cannot be fetched directly — stubs will be used for favicon, QR code, and moments photos; user swaps the real files in later by dropping them into `src/imports/`.

---

## ⚠️ Google Drive Assets — Action Required from User

| Feature          | Drive Link                                 | File to drop into `src/imports/`  |
| ---------------- | ------------------------------------------ | --------------------------------- |
| Favicon          | `1pors27F1PHFhl7SRKyf8nYgg9-LvFCjf`        | `favicon.png`                     |
| QR Code (Donate) | `1AANkUw9tMop--lJISNnIN4_VdpzMKqCs`        | `qr-code.png`                     |
| Music file       | `1ZQqB1UlbWR4Mpk_MB7dGcGaJMLzTlpcu`        | `music.mp3` (or `.ogg`)           |
| Moments photos   | folder `19gG0-Fg-kzP4UAotKNx2C-VzFpuJ5VTN` | `moment-1.jpg`, `moment-2.jpg`, … |

Stubs are implemented now; swapping the real files requires only changing the import path/src value.

---

## Files Modified

| File                                 | What changes                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `src/app/App.tsx`                    | Favicon injection, go-to-top button, MusicPlayer import                          |
| `src/app/components/NavBar.tsx`      | Remove ContactBtn; Donate → QR dropdown (DonateDrop)                             |
| `src/app/components/HeroSection.tsx` | Hero + Sub-hero breakdown; Tech Skills redesign; Moments Slider replaces Hobbies |
| `src/app/components/WorkSection.tsx` | StudyMate: Beta badge, green progress bar at 72%, YouTube demo link              |
| `src/app/components/PongSection.tsx` | Fix Player 2 direction: swap `+=`/`-=` for `paddles.bottom` angle in `update()`  |
| `src/app/components/MusicPlayer.tsx` | NEW — HTML5 `<audio>` music player widget                                        |

---

## Feature Details

### 1. Favicon — `App.tsx`

Inject `<link rel="icon">` via `useEffect` (no `index.html` in Figma Make):

```tsx
useEffect(() => {
  let link = document.querySelector<HTMLLinkElement>(
    'link[rel="icon"]',
  );
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  // Stub: red "P" SVG — replace with: import fav from '../imports/favicon.png'; link.href = fav;
  link.href = `data:image/svg+xml,...`;
}, []);
```

### 2. StudyMate Beta — `WorkSection.tsx`

- Status badge: "In Progress" + Loader2 → "✦ Beta" with green colors (`#16a34a`)
- Progress bar: 45% → 72%, green gradient, milestone "Beta" highlighted
- Add **Watch Demo** button: `<a href="https://www.youtube.com/watch?v=47_aPGzQ9Hg&t=1s" target="_blank">▶ Watch Demo</a>` styled like GitHub button but red

### 3. Donate → QR Dropdown — `NavBar.tsx`

- Replace `DonateBtn` with `DonateDrop` component
- Toggle `open` state on click; close on outside mousedown
- Dropdown panel: QR code `<img>` (stub until file uploaded) + italic "Thanks for supporting Dang ❤️" text
- Desktop: `position: absolute, right: 0, top: 100% + 8px`; Mobile: `position: relative, marginTop: 8`
- Remove `ContactBtn` component and all its usages (desktop right rail + mobile menu)
- Remove `Mail` from lucide import (was only used by ContactBtn)
- Add `ChevronDown` to lucide import

### 4. Hero + Sub-hero Breakdown — `HeroSection.tsx`

Split the single bento grid into two clearly distinct zones:

**Part A — Hero** (top, `id="hero"`):

- Flex row: Profile card (left, 220px fixed) + [About Me card + Contact Links card stacked] (right)
- Profile card: photo, name, role, location, online dot, "Open to Internships" badge
- Contact links move here (replacing bottom contacts card)

**Part B — Sub-hero** (`id="hero-sub"`, slightly inset panel with subtle border):

- Row 1 grid: `1fr 1.6fr` → Education card | Moments Slider
- Row 2: Tech Skills card (full width)
- Mobile: all stacks to 1 column

### 5. Go-to-top Button — `App.tsx`

```tsx
function GoToTopBtn() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { window.addEventListener('scroll', () => setVisible(scrollY > 300)); }, []);
  if (!visible) return null;
  return <button onClick={() => scrollTo({top:0, behavior:'smooth'})} style={{ position:'fixed', bottom:24, right:24, zIndex:200, ... }}><ArrowUp /></button>;
}
```

Neon-brutalism style: ACCENT background, 2px border, 3px offset shadow. Mobile: 40×40px; Desktop: 46×46px.

### 6. Music Player — NEW `MusicPlayer.tsx`

Uses HTML5 `<audio>` element (not YouTube IFrame) for seamless control.

```tsx
const src =
  "https://drive.google.com/uc?export=download&id=1ZQqB1UlbWR4Mpk_MB7dGcGaJMLzTlpcu";
// OR: import musicSrc from '../../imports/music.mp3'; (after user uploads file)
const audioRef = useRef<HTMLAudioElement>(null);
const toggle = () =>
  isPlaying
    ? audioRef.current?.pause()
    : audioRef.current?.play();
```

UI: Fixed bottom-left widget, collapsed to a `♫ Play Music` pill by default. Expanding shows:

- Album art (gradient placeholder), track title, waveform bars animation
- Play/Pause button (ACCENT color, 44px circle)
- Decorative progress line
- Auto-loops (`<audio loop>`)

Note: Google Drive direct links require the file to be shared as "Anyone with link". Once user uploads `music.mp3` to `src/imports/`, change `src` to `import musicSrc from '../../imports/music.mp3'`.

### 7. Fix Player 2 Direction — `PongSection.tsx`

**Bug**: Bottom paddle starts at `π/2` (6 o'clock). `angle -= PADDLE_SPEED` moves toward 3 o'clock (right), but ArrowLeft should move left (toward 9 o'clock = `angle +=`).

**Fix** — swap two lines in `update()`:

```tsx
// Before (wrong):
if (g.paddles.bottom.left)
  g.paddles.bottom.angle -= PADDLE_SPEED;
if (g.paddles.bottom.right)
  g.paddles.bottom.angle += PADDLE_SPEED;
// After (correct):
if (g.paddles.bottom.left)
  g.paddles.bottom.angle += PADDLE_SPEED;
if (g.paddles.bottom.right)
  g.paddles.bottom.angle -= PADDLE_SPEED;
```

Touch button/canvas quadrant controls are already wired to the same flags, so they're fixed automatically.

### 8. Moments Slider — `HeroSection.tsx`

Uses `embla-carousel-react` (already in `package.json`).

```tsx
import useEmblaCarousel from "embla-carousel-react";
const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
```

- Full-bleed images with dark gradient caption overlay
- Left/right arrow buttons (absolute positioned)
- Dot indicators (active dot is wider pill, ACCENT color)
- Auto-advances every 4s via `setInterval`
- Stubs: 4 Unsplash placeholder images; real photos replace after upload

### 9. Remove Contact Button — `NavBar.tsx`

- Remove `<ContactBtn ... />` from desktop right rail
- Remove `<ContactBtn ... />` from mobile slide-down menu
- Delete `ContactBtn` function definition
- Remove `Mail` from lucide import line

### 10. Tech Skills Redesign — `HeroSection.tsx`

Replace flat chip list with **categorized terminal layout**:

```
// Languages      → amber chips with left amber border
// Frameworks     → cyan chips with left cyan border
// Tools          → green chips with left green border
// Design         → purple chips with left purple border
```

Each chip: JetBrains Mono, `› skillname`, colored left border (3px), subtle bg tint, glow on hover.

```ts
const skillCategories = [
  {
    label: "// Languages",
    color: "#CA8A04",
    skills: ["JavaScript", "TypeScript", "C++", "C", "Python"],
  },
  {
    label: "// Frameworks",
    color: "#0891B2",
    skills: ["React", "HTML/CSS", "REST APIs"],
  },
  {
    label: "// Tools",
    color: "#16A34A",
    skills: ["Git", "GitHub", "Linux", "Vibe Code"],
  },
  {
    label: "// Design",
    color: "#7C3AED",
    skills: ["Figma", "Framer"],
  },
];
```

---

## Mobile Optimization

All new components check `useIsMobile()` (existing hook in `src/app/hooks/useIsMobile.ts`):

- Hero: flex-row → flex-column; profile card goes horizontal (photo + text side by side)
- Sub-hero grid: `1fr 1.6fr` → `1fr`
- Music widget: pill only on mobile, no expanded panel
- Go-to-top: 40×40px, bottom-right 16px from edge
- Donate dropdown: `position: relative` (inline) not absolute

---

## Verification

1. **Pong P2**: Play → press ← arrow → bottom paddle moves left ✓
2. **StudyMate**: Scroll to Work → green "Beta" badge, 72% bar, red "Watch Demo" link ✓
3. **Donate**: Click Donate → QR panel appears; click outside → closes ✓
4. **Contact button**: Not visible in desktop nav or mobile hamburger ✓
5. **Hero sections**: Two visually distinct zones; profile photo prominent at top ✓
6. **Skills**: Terminal-style categories visible, hover glow works ✓
7. **Moments**: Swipe left/right; auto-advances; dots update ✓
8. **Music**: Click ♫ Play Music → audio starts; click Pause → stops ✓
9. **Go-to-top**: Scroll 300px → button appears; click → scrolls to top ✓
10. **Mobile**: All sections stack correctly at ≤768px ✓