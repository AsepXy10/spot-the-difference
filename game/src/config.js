// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical
// area; the renderer scales it to the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** The two picture panels, in field coordinates. */
export const PANEL_A = { x: 24, y: 76, width: 584, height: 520 };
export const PANEL_B = { x: 672, y: 76, width: 584, height: 520 };

/** The levels, easiest first: seconds on the clock, hints per level, finds to win. */
export const LEVELS = [
  { name: 'Neon Street', seconds: 150, hints: 3 },
  { name: 'Night Market', seconds: 180, hints: 3 },
];

/** Points for a find, and the win bonus per second left on the clock. */
export const SCORE = { find: 100, winPerSecond: 10, hintCostSeconds: 10, wrongCostSeconds: 5 };

/** How long a hint pulse lasts, and how far a click may be from a difference to count. */
export const HINT_SECONDS = 2.5;
export const CLICK_TOLERANCE = 12;
/** How long a wrong-click mark stays on screen, in seconds. */
export const WRONG_SECONDS = 0.5;

export const PALETTE = {
  backdrop: '#0d0a1a',
  hud: '#17122b',
  hudLine: '#2c2350',
  panelFrame: '#3b2d6b',
  panelLabel: '#241b45',
  text: '#f4eefc',
  muted: '#a99ecb',
  accent: '#ffd166',
  neonPink: '#ff5fa2',
  neonCyan: '#37e6d4',
  neonGold: '#ffc93c',
  found: '#7cf29c',
  wrong: '#ff5d5d',
  timerGood: '#7cf29c',
  timerLow: '#ff5d5d',
  button: '#2a1f52',
  buttonEdge: '#6b52c9',
  overlay: 'rgba(10, 6, 26, 0.72)',
  panelShade: 'rgba(10, 6, 26, 0.55)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'neon-dusk.best';
