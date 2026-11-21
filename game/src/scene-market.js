// Level 2: Night Market — a lantern-lit market at night, drawn entirely in code. The same
// function paints both panels; `variant` 0 is the left picture, 1 is the right, and the eight
// differences below are the only places the two ever disagree. Panel coordinates are 584 by
// 520; the caller translates to the panel first.

import { drawCat, drawFish, drawLantern, drawStars, glow, verticalGradient } from './scene.js';

/** The eight differences, in panel coordinates: where they are and how wide a click counts. */
export const MARKET_DIFFERENCES = [
  { id: 'lantern', x: 150, y: 118, r: 24, label: 'a paper lantern' },
  { id: 'banner', x: 292, y: 212, r: 26, label: 'the stall banner' },
  { id: 'oranges', x: 90, y: 388, r: 30, label: 'the oranges' },
  { id: 'cat', x: 500, y: 430, r: 30, label: 'the market cat' },
  { id: 'awning', x: 482, y: 166, r: 30, label: 'an awning' },
  { id: 'bulb', x: 350, y: 88, r: 14, label: 'a string-light bulb' },
  { id: 'fish', x: 292, y: 415, r: 30, label: 'the fish' },
  { id: 'steam', x: 212, y: 330, r: 26, label: 'the steam' },
];

/** The string light's wire: a quadratic from (0, 40) through (292, 110) to (584, 40). */
function wirePoint(t) {
  return {
    x: 584 * t,
    y: (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 110 + t * t * 40,
  };
}

function drawStringLights(ctx, variant) {
  ctx.strokeStyle = '#0d0a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.quadraticCurveTo(292, 110, 584, 40);
  ctx.stroke();
  for (let i = 1; i <= 9; i += 1) {
    const t = i / 10;
    const p = wirePoint(t);
    ctx.strokeStyle = '#0d0a1a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, p.y + 8);
    ctx.stroke();
    const isDifference = i === 6;
    const lit = isDifference ? variant === 0 : true;
    if (lit) glow(ctx, p.x, p.y + 14, 16, '#ffd166', 0.6);
    ctx.fillStyle = lit ? '#ffd166' : 'rgba(255,255,255,0.16)';
    ctx.beginPath();
    ctx.arc(p.x, p.y + 14, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLanternRow(ctx, variant) {
  // Three lanterns hang from the wire by short strings.
  const lanterns = [
    { x: 150, color: variant === 0 ? '#ff5d5d' : '#ffc93c' },
    { x: 300, color: '#ff5d5d' },
    { x: 450, color: '#ffc93c' },
  ];
  for (const lantern of lanterns) {
    const t = lantern.x / 584;
    const wire = wirePoint(t);
    ctx.strokeStyle = '#0d0a1a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(lantern.x, wire.y);
    ctx.lineTo(lantern.x, 98);
    ctx.stroke();
    drawLantern(ctx, lantern.x, 118, 20, lantern.color);
  }
}

function drawStripedAwning(ctx, x, y, width, height, colorA, colorB) {
  const stripes = 10;
  for (let i = 0; i < stripes; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? colorA : colorB;
    ctx.fillRect(x + (i * width) / stripes, y, width / stripes + 1, height);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(x, y + height - 5, width, 5);
  // Scalloped edge.
  ctx.fillStyle = colorA;
  for (let i = 0; i < stripes; i += 2) {
    ctx.beginPath();
    ctx.arc(x + ((i + 0.5) * width) / stripes, y + height, width / stripes / 2, 0, Math.PI);
    ctx.fill();
  }
}

function drawStall(ctx, x, width, awningA, awningB) {
  // Posts and counter.
  ctx.fillStyle = '#2a1d12';
  ctx.fillRect(x, 182, 8, 288);
  ctx.fillRect(x + width - 8, 182, 8, 288);
  drawStripedAwning(ctx, x - 6, 150, width + 12, 32, awningA, awningB);
  // Warm glow from inside the stall.
  ctx.fillStyle = '#3d2a16';
  ctx.fillRect(x + 8, 182, width - 16, 218);
  glow(ctx, x + width / 2, 300, 130, '#ffb347', 0.25);
  ctx.fillStyle = '#6b4a26';
  ctx.fillRect(x + 8, 400, width - 16, 70);
  ctx.fillStyle = '#8a6238';
  ctx.fillRect(x + 8, 400, width - 16, 8);
}

function drawFruitStand(ctx, variant) {
  drawStall(ctx, 20, 170, '#ff5d5d', '#fdf3d0');
  // A pile of oranges on the counter: three on the left, two on the right.
  const oranges = variant === 0
    ? [[74, 388], [98, 384], [112, 392]]
    : [[74, 388], [112, 392]];
  for (const [ox, oy] of oranges) {
    glow(ctx, ox, oy, 20, '#ff9f1c', 0.35);
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.arc(ox, oy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f7d4f';
    ctx.beginPath();
    ctx.ellipse(ox + 4, oy - 12, 5, 2.5, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // A basket of greens beside them.
  ctx.fillStyle = '#8a6238';
  ctx.beginPath();
  ctx.arc(150, 392, 16, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#2f7d4f';
  ctx.beginPath();
  ctx.arc(142, 384, 7, 0, Math.PI * 2);
  ctx.arc(156, 382, 7, 0, Math.PI * 2);
  ctx.arc(150, 376, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawCrab(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#e8493f';
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e8493f';
  ctx.lineWidth = 2;
  for (const side of [-1, 1]) {
    for (const leg of [-6, 0, 6]) {
      ctx.beginPath();
      ctx.moveTo(side * 10, leg);
      ctx.lineTo(side * 18, leg - 4);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(side * 12, -4);
    ctx.lineTo(side * 20, -12);
    ctx.stroke();
    ctx.fillStyle = '#e8493f';
    ctx.beginPath();
    ctx.arc(side * 21, -13, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#101018';
  ctx.beginPath();
  ctx.arc(-4, -3, 1.8, 0, Math.PI * 2);
  ctx.arc(4, -3, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFishStall(ctx, variant) {
  drawStall(ctx, 200, 190, '#37e6d4', '#fdf3d0');
  // The banner: a fish emblem on the left, a crab on the right.
  ctx.fillStyle = '#fdf3d0';
  ctx.fillRect(252, 186, 80, 52);
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 3;
  ctx.strokeRect(252, 186, 80, 52);
  if (variant === 0) drawFish(ctx, 292, 212, 40, '#2a7f9e', true);
  else drawCrab(ctx, 292, 212, 1.1);
  // A steaming pot on the counter's edge: steam only in the left picture.
  ctx.fillStyle = '#3a3f4a';
  ctx.beginPath();
  ctx.arc(212, 388, 14, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#565b66';
  ctx.fillRect(196, 374, 32, 6);
  if (variant === 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const [sx, phase] of [[204, 0], [212, 1.2], [220, 2.4]]) {
      ctx.beginPath();
      for (let i = 0; i <= 8; i += 1) {
        const yy = 372 - i * 8;
        const xx = sx + Math.sin(i * 0.9 + phase) * 5;
        if (i === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
    }
  }
  // Fish on ice, facing left or right.
  ctx.fillStyle = '#cfe8f5';
  ctx.beginPath();
  ctx.roundRect(232, 400, 120, 34, 6);
  ctx.fill();
  drawFish(ctx, 292, 415, 56, '#7fb3d5', variant === 1);
  drawFish(ctx, 258, 428, 34, '#a8c8dc', variant === 0);
}

function drawSnackStall(ctx, variant) {
  // The right stall's awning: red and white on the left, blue and white on the right.
  drawStall(ctx, 400, 164, variant === 0 ? '#ff5d5d' : '#3b82f6', '#fdf3d0');
  // Jars of snacks on the counter.
  const jars = [[430, 388, '#ffc93c'], [462, 388, '#ff5fa2'], [494, 388, '#37e6d4']];
  for (const [jx, jy, color] of jars) {
    glow(ctx, jx, jy, 18, color, 0.3);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.roundRect(jx - 13, jy - 16, 26, 32, 6);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(jx, jy + 4, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2a5e';
    ctx.fillRect(jx - 13, jy - 20, 26, 6);
  }
  // The market cat, on a crate beside the stall — only in the left picture.
  if (variant === 0) {
    ctx.fillStyle = '#4a3421';
    ctx.fillRect(486, 452, 34, 18);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.strokeRect(486, 452, 34, 18);
    drawCat(ctx, 503, 452, 0.9);
  }
}

/** Paint the market, variant 0 for the left picture and 1 for the right. */
export function drawNightMarket(ctx, variant, time = 0) {
  verticalGradient(ctx, 0, 0, 584, 200, '#141033', '#3a1c5c');
  ctx.fillStyle = '#1a0f2e';
  ctx.fillRect(0, 470, 584, 50);
  drawStars(ctx, time);
  drawStringLights(ctx, variant);
  drawLanternRow(ctx, variant);
  drawFruitStand(ctx, variant);
  drawFishStall(ctx, variant);
  drawSnackStall(ctx, variant);
  // Warm reflections of the lanterns on the ground.
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = '#ff5d5d';
  ctx.fillRect(140, 478, 24, 30);
  ctx.fillStyle = '#ffc93c';
  ctx.fillRect(290, 480, 24, 26);
  ctx.fillStyle = '#37e6d4';
  ctx.fillRect(440, 478, 24, 30);
  ctx.globalAlpha = 1;
}
