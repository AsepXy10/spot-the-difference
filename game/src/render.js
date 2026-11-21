// Drawing only: the world's state and the current screen in, pixels out. The 1280x720
// playfield is scaled to fit the window and centred, the margin filled with the backdrop
// colour. The two pictures are painted from the same scene function, variant 0 on the left
// and variant 1 on the right, then the markers, the HUD and the panels over them.

import { FIELD, PALETTE, PANEL_A, PANEL_B } from './config.js';
import { drawNeonStreet } from './scene-street.js';
import { drawNightMarket } from './scene-market.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

/** The hint button's rectangle, in field coordinates, so the loop can click it. */
export const HINT_BUTTON = { x: 24, y: 632, width: 200, height: 48 };
/** The sound button's rectangle, in field coordinates. */
export const SOUND_BUTTON = { x: 1056, y: 632, width: 200, height: 48 };

const SCENE_DRAW = [drawNeonStreet, drawNightMarket];

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** Stars for a win: three when more than a minute is left, two past twenty seconds, else one. */
function starsFor(timeLeft) {
  if (timeLeft > 60) return '★★★';
  if (timeLeft > 20) return '★★☆';
  return '★☆☆';
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  let flash = null;
  let now = 0;

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  /** Canvas CSS pixels to field coordinates. */
  function toField(cssX, cssY) {
    const ratio = window.devicePixelRatio || 1;
    return {
      x: (cssX * ratio - view.x) / view.scale,
      y: (cssY * ratio - view.y) / view.scale,
    };
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align = 'left', weight = 'normal') {
    const key = `${weight}:${size}`;
    if (!fonts.has(key)) fonts.set(key, `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`);
    context.font = fonts.get(key);
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  function roundRect(x, y, width, height, radius) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
  }

  function drawPanel(panel, variant, levelIndex, state, time) {
    context.save();
    context.beginPath();
    context.rect(panel.x, panel.y, panel.width, panel.height);
    context.clip();
    context.translate(panel.x, panel.y);
    SCENE_DRAW[levelIndex](context, variant, time);
    context.restore();
    // Frame.
    context.strokeStyle = PALETTE.panelFrame;
    context.lineWidth = 3;
    context.strokeRect(panel.x, panel.y, panel.width, panel.height);
    // The picture's letter chip, top-left inside the frame.
    context.fillStyle = PALETTE.panelLabel;
    roundRect(panel.x + 10, panel.y + 10, 34, 34, 8);
    context.fill();
    text(variant === 0 ? 'A' : 'B', panel.x + 27, panel.y + 35, 22, PALETTE.text, 'center', 'bold');
    // Found markers: a neon ring and a check, on both pictures at once.
    for (const d of state.differences) {
      if (!state.level.found.has(d.id)) continue;
      const cx = panel.x + d.x;
      const cy = panel.y + d.y;
      const pop = flash !== null && flash.id === d.id ? 1 + 0.25 * Math.max(0, 1 - (now - flash.at) / 0.3) : 1;
      context.save();
      context.shadowColor = PALETTE.found;
      context.shadowBlur = 12;
      context.strokeStyle = PALETTE.found;
      context.lineWidth = 4;
      context.beginPath();
      context.arc(cx, cy, (d.r + 6) * pop, 0, Math.PI * 2);
      context.stroke();
      context.restore();
      context.strokeStyle = '#0d2812';
      context.lineWidth = 5;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(cx - 9, cy);
      context.lineTo(cx - 2, cy + 8);
      context.lineTo(cx + 11, cy - 8);
      context.stroke();
      context.strokeStyle = PALETTE.found;
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(cx - 9, cy);
      context.lineTo(cx - 2, cy + 8);
      context.lineTo(cx + 11, cy - 8);
      context.stroke();
    }
    // The hint's pulsing ring, on both pictures.
    if (state.level.hintTarget !== null) {
      const d = state.level.hintTarget;
      const pulse = 1 + 0.18 * Math.sin(now * 6);
      const cx = panel.x + d.x;
      const cy = panel.y + d.y;
      context.save();
      context.globalAlpha = 0.65 + 0.35 * Math.sin(now * 6);
      context.strokeStyle = PALETTE.neonGold;
      context.lineWidth = 4;
      context.setLineDash([10, 7]);
      context.beginPath();
      context.arc(cx, cy, (d.r + 10) * pulse, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }
    // Wrong-click marks, fading.
    for (const mark of state.level.wrongMarks) {
      const alpha = Math.max(0, mark.timeLeft / 0.5);
      const cx = panel.x + mark.x;
      const cy = panel.y + mark.y;
      context.save();
      context.globalAlpha = alpha;
      context.strokeStyle = PALETTE.wrong;
      context.lineWidth = 4;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(cx - 8, cy - 8);
      context.lineTo(cx + 8, cy + 8);
      context.moveTo(cx + 8, cy - 8);
      context.lineTo(cx - 8, cy + 8);
      context.stroke();
      context.restore();
    }
  }

  function drawHud(state, screen) {
    context.fillStyle = PALETTE.hud;
    context.fillRect(0, 0, FIELD.width, 64);
    context.fillStyle = PALETTE.hudLine;
    context.fillRect(0, 64, FIELD.width, 2);
    if (screen === SCREEN_TITLE) {
      text('NEON DUSK', FIELD.width / 2, 42, 30, PALETTE.text, 'center', 'bold');
      return;
    }
    text('NEON DUSK', 24, 30, 26, PALETTE.text, 'left', 'bold');
    text(`Level ${state.level.index + 1} · ${state.sceneName}`, 24, 54, 15, PALETTE.muted);
    // The counter: the heart of the game, big and centred.
    const found = state.level.found.size;
    const total = state.differences.length;
    const left = total - found;
    text(`FOUND ${found}/${total}`, FIELD.width / 2 - 8, 34, 28, PALETTE.text, 'right', 'bold');
    text(left === 0 ? 'ALL FOUND!' : `${left} TO GO`, FIELD.width / 2 + 8, 34, 28, left === 0 ? PALETTE.found : PALETTE.accent, 'left', 'bold');
    // The clock, with a bar that drains as time runs out.
    const seconds = state.level.timeLeft;
    const totalSeconds = state.levelTotal;
    const low = seconds <= 30;
    text(formatTime(seconds), FIELD.width - 24, 30, 28, low ? PALETTE.timerLow : PALETTE.text, 'right', 'bold');
    const barWidth = 190;
    const barX = FIELD.width - 24 - barWidth;
    context.fillStyle = '#241b45';
    roundRect(barX, 40, barWidth, 10, 5);
    context.fill();
    context.fillStyle = low ? PALETTE.timerLow : PALETTE.timerGood;
    roundRect(barX, 40, Math.max(0, (barWidth * seconds) / totalSeconds), 10, 5);
    context.fill();
    text(`SCORE ${state.score}`, FIELD.width - 24, 62, 14, PALETTE.muted, 'right');
  }

  function drawBottomBar(state, muted) {
    // Hint button.
    const hints = state.level.hintsLeft;
    context.fillStyle = hints > 0 ? PALETTE.button : '#1a1430';
    roundRect(HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.width, HINT_BUTTON.height, 10);
    context.fill();
    context.strokeStyle = hints > 0 ? PALETTE.buttonEdge : '#33265e';
    context.lineWidth = 2;
    context.stroke();
    text(hints > 0 ? `HINT (H)  ×${hints}` : 'NO HINTS LEFT', HINT_BUTTON.x + HINT_BUTTON.width / 2, HINT_BUTTON.y + 31, 19, hints > 0 ? PALETTE.text : PALETTE.muted, 'center', 'bold');
    // The message line: what just happened.
    if (state.level.messageTimeLeft > 0) {
      text(state.level.message, FIELD.width / 2, 664, 20, PALETTE.accent, 'center');
    } else {
      text('Click a difference in either picture', FIELD.width / 2, 664, 20, PALETTE.muted, 'center');
    }
    // Sound button.
    context.fillStyle = PALETTE.button;
    roundRect(SOUND_BUTTON.x, SOUND_BUTTON.y, SOUND_BUTTON.width, SOUND_BUTTON.height, 10);
    context.fill();
    context.strokeStyle = PALETTE.buttonEdge;
    context.lineWidth = 2;
    context.stroke();
    text(muted ? 'SOUND OFF (M)' : 'SOUND ON (M)', SOUND_BUTTON.x + SOUND_BUTTON.width / 2, SOUND_BUTTON.y + 31, 19, PALETTE.text, 'center', 'bold');
  }

  function drawOverlay(title, lines, prompt, accent) {
    context.fillStyle = PALETTE.overlay;
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    text(title, FIELD.width / 2, 300, 64, accent ?? PALETTE.text, 'center', 'bold');
    let y = 360;
    for (const line of lines) {
      text(line, FIELD.width / 2, y, 24, PALETTE.text, 'center');
      y += 38;
    }
    text(prompt, FIELD.width / 2, y + 22, 22, PALETTE.accent, 'center', 'bold');
  }

  /** Paint one frame. `time` is seconds since the game started, for twinkles and pulses. */
  function draw(world, screen, best, muted, t) {
    now = t;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    const state = {
      level: world.state.level,
      score: world.state.score,
      differences: world.differences(),
      sceneName: world.sceneName(),
      levelTotal: world.levelSeconds(),
    };
    drawHud(state, screen);
    drawPanel(PANEL_A, 0, world.state.level.index, state, t);
    drawPanel(PANEL_B, 1, world.state.level.index, state, t);
    drawBottomBar(state, muted);
    if (screen === SCREEN_TITLE) {
      drawOverlay('NEON DUSK', [
        'Spot the Difference',
        `Two pictures. ${state.differences.length} differences. One dusk street.`,
        'Click a difference in either picture — a ring marks every find.',
        'H costs 10 seconds for a hint. A wrong click costs 5.',
      ], 'Press Space or click to start', PALETTE.neonPink);
      text(`Best score ${best}`, FIELD.width / 2, 520, 20, PALETTE.muted, 'center');
    } else if (screen === SCREEN_PAUSED) {
      drawOverlay('PAUSED', ['The clock is waiting for you.'], 'Press P to resume', null);
    } else if (screen === SCREEN_CLEAR) {
      drawOverlay('LEVEL CLEAR!', [
        `${state.sceneName} complete — every difference found.`,
        `Time bonus +${world.levelBonus()}`,
        `Score ${world.state.score}`,
      ], 'Press Space for the next scene', PALETTE.found);
    } else if (screen === SCREEN_WIN) {
      drawOverlay('YOU FOUND THEM ALL!', [
        `${starsFor(world.state.level.timeLeft)}`,
        `Score ${world.state.score}   ·   Best ${best}`,
        'Two scenes, fifteen differences, one sharp eye.',
      ], 'Press Space to play again', PALETTE.neonGold);
    } else if (screen === SCREEN_OVER) {
      const found = state.level.found.size;
      drawOverlay("TIME'S UP", [
        `You found ${found} of ${state.differences.length} differences.`,
        'The street keeps its secrets — this time.',
      ], 'Press Space to try again', PALETTE.wrong);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return {
    draw,
    toField,
    /** Light up the ring of a difference just found, for its pop animation. */
    flashFound(id) {
      flash = { id, at: now };
    },
  };
}
