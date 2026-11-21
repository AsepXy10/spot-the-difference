// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps (several in a slow frame, none in a fast one), and the renderer paints what is there.
// The game moves between six screens: title, play, paused, level clear, win and time up.
//
// ?seed=N fixes the hint order. ?shot=start|play|market|end|over (with &seed=N) stages that
// scene instead of running the loop, paints it twice and sets window.__shotReady for a
// screenshot. ?level=2 opens straight into the second scene (from the level-clear screen).

import { BEST_KEY, LEVELS, STEP } from './config.js';
import { createRandom } from './random.js';
import { createAudio } from './audio.js';
import { createWorld } from './world.js';
import {
  ACTION_CONFIRM,
  ACTION_HINT,
  ACTION_MUTE,
  ACTION_PAUSE,
  ACTION_RESTART,
  createInput,
} from './input.js';
import {
  HINT_BUTTON,
  SCREEN_CLEAR,
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_WIN,
  SOUND_BUTTON,
  createRenderer,
} from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);
const levelParam = Number.parseInt(params.get('level') ?? '', 10);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const audio = createAudio();
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world, scene.screen, scene.best, false, 0);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let muted = false;
  let accumulator = 0;
  let last = performance.now();
  let elapsed = 0;

  // Screen readers (and anyone watching the page's text) hear the screen changes and each find.
  function announce(message) {
    status.textContent = message;
  }

  function startGame(levelIndex = 0) {
    world.reset();
    world.startLevel(levelIndex);
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce(`Playing. Level ${levelIndex + 1}, ${world.differences().length} differences.`);
  }

  function finishLevel() {
    const bonus = world.levelBonus();
    world.state.score += bonus;
    if (world.state.level.index + 1 < LEVELS.length) {
      screen = SCREEN_CLEAR;
      announce(`Level clear. Time bonus ${bonus}.`);
    } else {
      screen = SCREEN_WIN;
      if (world.state.score > best) {
        best = world.state.score;
        saveBest(best);
      }
      announce(`You found them all. Score ${world.state.score}. Best ${best}.`);
    }
  }

  function endGame() {
    screen = SCREEN_OVER;
    announce(`Time's up. You found ${world.foundCount()} of ${world.differences().length}.`);
  }

  function handleClick(field) {
    audio.unlock();
    // The hint and sound buttons live in the bottom bar.
    if (
      field.x >= HINT_BUTTON.x && field.x <= HINT_BUTTON.x + HINT_BUTTON.width &&
      field.y >= HINT_BUTTON.y && field.y <= HINT_BUTTON.y + HINT_BUTTON.height
    ) {
      if (screen === SCREEN_PLAY) useHint();
      return;
    }
    if (
      field.x >= SOUND_BUTTON.x && field.x <= SOUND_BUTTON.x + SOUND_BUTTON.width &&
      field.y >= SOUND_BUTTON.y && field.y <= SOUND_BUTTON.y + SOUND_BUTTON.height
    ) {
      muted = audio.toggleMute();
      return;
    }
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN) {
      startGame();
      return;
    }
    if (screen === SCREEN_CLEAR) {
      startGame(world.state.level.index + 1);
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    // Which picture was clicked, and where inside it?
    for (const panel of [{ x: 24, y: 76 }, { x: 672, y: 76 }]) {
      if (field.x >= panel.x && field.x <= panel.x + 584 && field.y >= panel.y && field.y <= panel.y + 520) {
        const result = world.clickAt(field.x - panel.x, field.y - panel.y);
        if (result.kind === 'found') {
          audio.play('find');
          renderer.flashFound(result.id);
          announce(`Found ${result.id}. ${world.remaining()} to go.`);
          if (result.done) finishLevel();
        } else {
          audio.play('wrong');
          announce('Not there. Five seconds lost.');
        }
        return;
      }
    }
  }

  function useHint() {
    const target = world.useHint();
    if (target !== null) {
      audio.play('hint');
      announce('Hint: look at the pulsing ring.');
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) muted = audio.toggleMute();
    if (actions & ACTION_RESTART && (screen === SCREEN_PLAY || screen === SCREEN_OVER)) {
      startGame(world.state.level.index);
      return;
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) useHint();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN)) {
      startGame();
    } else if (actions & ACTION_CONFIRM && screen === SCREEN_CLEAR) {
      startGame(world.state.level.index + 1);
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function step() {
    if (screen !== SCREEN_PLAY) return;
    if (world.step(STEP)) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    elapsed += dt;
    handleActions();
    for (const click of input.takeClicks()) handleClick(renderer.toField(click.x, click.y));
    if (screen === SCREEN_PLAY) {
      accumulator += dt;
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world, screen, best, muted, elapsed);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Neon Dusk. Spot the difference. Press Space or click to start.');
  if (Number.isInteger(levelParam) && levelParam >= 1 && levelParam <= LEVELS.length) {
    startGame(levelParam - 1);
  }
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
