// The screenshot scenes behind ?shot=start|play|market|end. Each one sets the world to a
// fixed state — no simulation, no randomness — so the frame is what a real game really looks
// like and the same seed always gives the same frame. The parent takes the screenshots from
// these states on a desktop browser; see shots.json for the names and queries.

import { SCREEN_CLEAR, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

/**
 * Set the world to the named scene and return the screen to draw over it and the best score
 * to show. `start` is the title screen over a fresh board; `play` is mid-game with three
 * differences found and four still to go; `market` is the second scene mid-game with two
 * found; `end` is the win screen with every difference of the first scene found.
 */
export function stageShot(name, world) {
  if (name === 'play') {
    world.reset();
    world.startLevel(0);
    // Three finds, spread across the picture: the moon, the clock and the taxi.
    for (const id of ['moon', 'clock', 'car']) world.state.level.found.add(id);
    world.state.score = 300;
    world.state.level.timeLeft = 112;
    world.state.level.message = 'Found the taxi!';
    world.state.level.messageTimeLeft = 99;
    return { screen: SCREEN_PLAY, best: 1250 };
  }
  if (name === 'market') {
    world.reset();
    world.startLevel(1);
    // Two finds in the night market: the lantern and the fish.
    for (const id of ['lantern', 'fish']) world.state.level.found.add(id);
    world.state.score = 950;
    world.state.level.timeLeft = 138;
    world.state.level.message = 'Found the fish!';
    world.state.level.messageTimeLeft = 99;
    return { screen: SCREEN_PLAY, best: 1250 };
  }
  if (name === 'end') {
    world.reset();
    world.startLevel(0);
    for (const d of world.differences()) world.state.level.found.add(d.id);
    world.state.score = 1420;
    world.state.level.timeLeft = 38;
    return { screen: SCREEN_WIN, best: 1420 };
  }
  if (name === 'over') {
    world.reset();
    world.startLevel(0);
    for (const id of ['moon', 'sign']) world.state.level.found.add(id);
    world.state.score = 200;
    world.state.level.timeLeft = 0;
    return { screen: SCREEN_OVER, best: 1250 };
  }
  world.reset();
  return { screen: SCREEN_TITLE, best: 1250 };
}
