// The game's state: which level, which differences are found, the clock, the score and the
// hints. No drawing here and no input here — this is the data the renderer paints and the
// loop advances.

import { LEVELS, SCORE } from './config.js';
import { STREET_DIFFERENCES } from './scene-street.js';
import { MARKET_DIFFERENCES } from './scene-market.js';

/** The levels in order, each with its scene's differences. */
export const SCENES = [
  { name: LEVELS[0].name, differences: STREET_DIFFERENCES },
  { name: LEVELS[1].name, differences: MARKET_DIFFERENCES },
];

/** A fresh level's state. */
function freshLevel(index) {
  return {
    index,
    found: new Set(),
    timeLeft: LEVELS[index].seconds,
    hintsLeft: LEVELS[index].hints,
    hintTarget: null,
    hintTimeLeft: 0,
    wrongMarks: [],
    message: '',
    messageTimeLeft: 0,
  };
}

export function createWorld(random) {
  const state = {
    level: freshLevel(0),
    score: 0,
    totalFound: 0,
    best: 0,
    random,
  };

  function differences() {
    return SCENES[state.level.index].differences;
  }

  function foundCount() {
    return state.level.found.size;
  }

  function remaining() {
    return differences().length - foundCount();
  }

  /** The current scene's name, for the HUD. */
  function sceneName() {
    return SCENES[state.level.index].name;
  }

  /** The current level's clock, in seconds. */
  function levelSeconds() {
    return LEVELS[state.level.index].seconds;
  }

  function reset() {
    state.level = freshLevel(0);
    state.score = 0;
    state.totalFound = 0;
  }

  function startLevel(index) {
    state.level = freshLevel(index);
  }

  /** A click in panel coordinates (x, y) of the scene: returns what happened. */
  function clickAt(x, y) {
    const list = differences();
    for (let i = 0; i < list.length; i += 1) {
      const d = list[i];
      if (state.level.found.has(d.id)) continue;
      const dx = x - d.x;
      const dy = y - d.y;
      if (dx * dx + dy * dy <= (d.r + 12) * (d.r + 12)) {
        state.level.found.add(d.id);
        state.score += SCORE.find;
        state.totalFound += 1;
        state.level.message = `Found ${d.label}!`;
        state.level.messageTimeLeft = 1.6;
        return { kind: 'found', id: d.id, done: remaining() === 0 };
      }
    }
    // A miss costs time and leaves a red mark where the player clicked.
    state.level.timeLeft = Math.max(0, state.level.timeLeft - SCORE.wrongCostSeconds);
    state.level.wrongMarks.push({ x, y, timeLeft: 0.5 });
    state.level.message = 'Not there — 5 seconds lost.';
    state.level.messageTimeLeft = 1.6;
    return { kind: 'wrong' };
  }

  /** Spend a hint: point at one difference not found yet, for a few seconds, at a time cost. */
  function useHint() {
    if (state.level.hintsLeft <= 0) return null;
    const open = differences().filter((d) => !state.level.found.has(d.id));
    if (open.length === 0) return null;
    const target = open[Math.floor(state.random() * open.length)];
    state.level.hintsLeft -= 1;
    state.level.timeLeft = Math.max(0, state.level.timeLeft - SCORE.hintCostSeconds);
    state.level.hintTarget = target;
    state.level.hintTimeLeft = 2.5;
    state.level.message = 'Hint: look at the pulsing ring.';
    state.level.messageTimeLeft = 2;
    return target;
  }

  /** Advance the clock and the fading marks by `dt` seconds; returns true when time runs out. */
  function step(dt) {
    state.level.timeLeft = Math.max(0, state.level.timeLeft - dt);
    if (state.level.hintTimeLeft > 0) {
      state.level.hintTimeLeft -= dt;
      if (state.level.hintTimeLeft <= 0) state.level.hintTarget = null;
    }
    if (state.level.messageTimeLeft > 0) state.level.messageTimeLeft -= dt;
    for (const mark of state.level.wrongMarks) mark.timeLeft -= dt;
    state.level.wrongMarks = state.level.wrongMarks.filter((m) => m.timeLeft > 0);
    return state.level.timeLeft <= 0;
  }

  /** The win bonus for finishing a level with time to spare. */
  function levelBonus() {
    return Math.round(state.level.timeLeft) * SCORE.winPerSecond;
  }

  return {
    state,
    differences,
    sceneName,
    levelSeconds,
    foundCount,
    remaining,
    reset,
    startLevel,
    clickAt,
    useHint,
    step,
    levelBonus,
  };
}
