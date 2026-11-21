# Neon Dusk — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/AsepXy10/spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/AsepXy10/spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game for the make.fun bounty
[Make the best spot the difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).
Two near-identical pictures side by side, drawn entirely in code — no images, no libraries,
no network. Click the differences in either picture; a neon ring marks every find.

## The game

- **Two scenes, fifteen differences.** Level 1, *Neon Street*: a neon city street at dusk
  (7 differences — the moon, the tower clock, the ramen sign, the taxi, a lit window, a
  bird, the traffic light). Level 2, *Night Market*: a lantern-lit market (8 differences —
  a lantern, the banner emblem, the oranges, the market cat, an awning, a string-light bulb,
  the fish, the steam).
- **A real hunt.** A countdown clock you can feel, a wrong click costs 5 seconds, a hint
  (H) costs 10 seconds and pulses one difference not found yet. Found 3 of 7, 4 to go —
  the counter stays big and centred.
- **Feel.** A satisfying ring-and-check on every find, tiny WebAudio bleeps (no sound
  files), a win screen with stars, and a best score kept between visits.
- **Playable offline** in a desktop browser from its own files: keyboard (Space, P, H, R,
  M) and mouse.

## Screenshots

Four real renders of the game's own code, taken in desktop Chrome at 1280×720:

- `1-play.jpg` — Level 1 mid-game, 3 found, 4 to go (the cover)
- `2-market.jpg` — Level 2 mid-game, 2 found, 6 to go
- `3-start.jpg` — the title screen over a fresh board
- `4-win.jpg` — the win screen, all 7 found

Each is staged deterministically: `game/index.html?shot=play&seed=1` (and `market`,
`start`, `end`) paints the same frame every time — see `shots.json`.

## Files

- `main.ts` — the program the harness runs: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with the vendored make.fun library.
- `serve.ts` — `node serve.ts` serves `game/` on http://localhost:8080 to play it.
- `game/index.html` — the page; `game/src/` holds the game, one job per file:
  `main.js` (boot and loop), `world.js` (state), `render.js` (drawing),
  `scene-street.js` and `scene-market.js` (the two scenes),
  `scene.js` (shared drawing helpers), `input.js`, `audio.js`, `random.js`,
  `config.js`, `shots.js` (the screenshot scenes).
- `vendor/makefun-game.ts` — make.fun's dossier library, copied from the kit unchanged.
- `shots.json` — the screenshot names and the query that stages each one.

## Verify

```sh
node serve.ts        # play it at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # build /output + dossier.json
```
