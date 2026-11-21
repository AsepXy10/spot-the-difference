// Level 1: Neon Street — a neon city street at dusk, drawn entirely in code. The same
// function paints both panels; `variant` 0 is the left picture, 1 is the right, and the seven
// differences below are the only places the two ever disagree. Panel coordinates are 584 by
// 520; the caller translates to the panel first.

import { drawBird, drawCat, drawNeonText, drawSkyline, drawStars, glow, verticalGradient } from './scene.js';

/** The seven differences, in panel coordinates: where they are and how wide a click counts. */
export const STREET_DIFFERENCES = [
  { id: 'moon', x: 90, y: 70, r: 34, label: 'the moon' },
  { id: 'clock', x: 413, y: 140, r: 36, label: 'the tower clock' },
  { id: 'sign', x: 115, y: 318, r: 38, label: 'the ramen sign' },
  { id: 'car', x: 470, y: 448, r: 48, label: 'the taxi' },
  { id: 'window', x: 466, y: 251, r: 20, label: 'a lit window' },
  { id: 'bird', x: 500, y: 90, r: 22, label: 'a bird' },
  { id: 'light', x: 250, y: 374, r: 26, label: 'the traffic light' },
];

const SKYLINE = [
  { id: 'b1', x: 0, width: 90, height: 110, color: '#241a3d' },
  { id: 'b2', x: 92, width: 80, height: 150, color: '#1d1533' },
  { id: 'b3', x: 174, width: 100, height: 95, color: '#261c42' },
  { id: 'b4', x: 276, width: 90, height: 170, color: '#1a1229' },
  { id: 'b5', x: 448, width: 70, height: 130, color: '#221839' },
  { id: 'b6', x: 520, width: 64, height: 100, color: '#1d1533' },
];

/** Windows that glow, as "building:col,row" — the same in both pictures except the one difference. */
const LIT_WINDOWS = new Set(['b1:0,1', 'b1:1,2', 'b2:1,0', 'b2:0,3', 'b3:2,2', 'b4:0,3', 'b4:1,1', 'b5:0,0', 'b6:0,1']);

function drawMoon(ctx, variant) {
  glow(ctx, 90, 70, 64, '#ffe9a8', 0.5);
  ctx.fillStyle = '#ffedb8';
  if (variant === 0) {
    ctx.beginPath();
    ctx.arc(90, 70, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(214, 164, 90, 0.55)';
    ctx.beginPath();
    ctx.arc(80, 62, 5, 0, Math.PI * 2);
    ctx.arc(100, 78, 3.5, 0, Math.PI * 2);
    ctx.arc(96, 58, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // A half moon: only the right half of the disc.
    ctx.beginPath();
    ctx.arc(90, 70, 28, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fill();
  }
}

function drawClockTower(ctx, variant) {
  // Tower body, rising above the skyline.
  ctx.fillStyle = '#1a1229';
  ctx.fillRect(380, 90, 66, 240);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(380, 90, 66, 3);
  // A small roof and a blinking beacon.
  ctx.fillStyle = '#0b0716';
  ctx.beginPath();
  ctx.moveTo(374, 90);
  ctx.lineTo(413, 62);
  ctx.lineTo(452, 90);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ff5d5d';
  ctx.beginPath();
  ctx.arc(413, 58, 3, 0, Math.PI * 2);
  ctx.fill();
  // The clock face.
  glow(ctx, 413, 140, 52, '#ffe9a8', 0.35);
  ctx.fillStyle = '#fdf3d0';
  ctx.beginPath();
  ctx.arc(413, 140, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2a1f52';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(413, 140, 34, 0, Math.PI * 2);
  ctx.stroke();
  for (let hour = 0; hour < 12; hour += 1) {
    const angle = (hour / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.fillStyle = '#2a1f52';
    ctx.beginPath();
    ctx.arc(413 + Math.cos(angle) * 27, 140 + Math.sin(angle) * 27, hour % 3 === 0 ? 2.6 : 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  // Hands: 7:05 on the left, 7:25 on the right.
  const minutes = variant === 0 ? 5 : 25;
  const minuteAngle = (minutes / 60) * Math.PI * 2 - Math.PI / 2;
  const hourAngle = ((7 + minutes / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = '#2a1f52';
  ctx.lineCap = 'round';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(413, 140);
  ctx.lineTo(413 + Math.cos(hourAngle) * 17, 140 + Math.sin(hourAngle) * 17);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(413, 140);
  ctx.lineTo(413 + Math.cos(minuteAngle) * 26, 140 + Math.sin(minuteAngle) * 26);
  ctx.stroke();
  ctx.fillStyle = '#2a1f52';
  ctx.beginPath();
  ctx.arc(413, 140, 3.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawRamenShop(ctx, variant) {
  // Shop front, low against the street.
  ctx.fillStyle = '#2b1d47';
  ctx.fillRect(20, 300, 190, 170);
  ctx.fillStyle = '#3a2a5e';
  ctx.fillRect(20, 300, 190, 10);
  // Striped awning.
  for (let i = 0; i < 10; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#ff5fa2' : '#fdf3d0';
    ctx.fillRect(20 + i * 19, 338, 19, 26);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(20, 360, 190, 4);
  // Warm window with a cook's silhouette and hanging lanterns.
  ctx.fillStyle = '#ffca6b';
  glow(ctx, 115, 415, 70, '#ffb347', 0.35);
  ctx.fillStyle = '#ffca6b';
  ctx.fillRect(44, 380, 142, 66);
  ctx.fillStyle = '#1a1229';
  ctx.beginPath();
  ctx.arc(115, 430, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(104, 440, 22, 6);
  ctx.fillStyle = '#ff5fa2';
  ctx.beginPath();
  ctx.arc(60, 392, 7, 0, Math.PI * 2);
  ctx.arc(170, 392, 7, 0, Math.PI * 2);
  ctx.fill();
  // The neon sign: RAMEN on the left, RANEN on the right.
  drawNeonText(ctx, variant === 0 ? 'RAMEN' : 'RANEN', 36, 320, 30, '#ff5fa2', '#ff2e88');
}

function drawTrafficLight(ctx, variant) {
  ctx.fillStyle = '#14101f';
  ctx.fillRect(247, 350, 6, 120);
  ctx.fillStyle = '#1c1626';
  ctx.beginPath();
  ctx.arc(250, 352, 4, 0, Math.PI * 2);
  ctx.fill();
  // The lamp head.
  ctx.fillStyle = '#221a33';
  ctx.beginPath();
  ctx.roundRect(236, 348, 28, 62, 8);
  ctx.fill();
  const lamps = [
    { y: 360, color: '#ff5d5d', on: variant === 1 },
    { y: 379, color: '#ffc93c', on: false },
    { y: 398, color: '#7cf29c', on: variant === 0 },
  ];
  for (const lamp of lamps) {
    if (lamp.on) glow(ctx, 250, lamp.y, 18, lamp.color, 0.6);
    ctx.fillStyle = lamp.on ? lamp.color : 'rgba(255,255,255,0.14)';
    ctx.beginPath();
    ctx.arc(250, lamp.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCar(ctx, variant) {
  const body = variant === 0 ? '#2dd4bf' : '#e879f9';
  const dark = variant === 0 ? '#0f766e' : '#a21caf';
  glow(ctx, 470, 448, 70, body, 0.28);
  // Body and roof.
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(398, 432, 146, 30, 10);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(424, 432);
  ctx.lineTo(438, 408);
  ctx.lineTo(500, 408);
  ctx.lineTo(516, 432);
  ctx.closePath();
  ctx.fill();
  // Windows.
  ctx.fillStyle = '#bfe9ff';
  ctx.beginPath();
  ctx.moveTo(442, 430);
  ctx.lineTo(452, 412);
  ctx.lineTo(470, 412);
  ctx.lineTo(470, 430);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(476, 412);
  ctx.lineTo(496, 412);
  ctx.lineTo(508, 430);
  ctx.lineTo(476, 430);
  ctx.closePath();
  ctx.fill();
  // Headlight, taillight and wheels.
  ctx.fillStyle = '#fff8c0';
  ctx.beginPath();
  ctx.arc(540, 446, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff5d5d';
  ctx.beginPath();
  ctx.arc(402, 446, 5, 0, Math.PI * 2);
  ctx.fill();
  for (const wx of [428, 512]) {
    ctx.fillStyle = '#14101f';
    ctx.beginPath();
    ctx.arc(wx, 464, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d7dbe4';
    ctx.beginPath();
    ctx.arc(wx, 464, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = dark;
  ctx.fillRect(398, 458, 146, 4);
}

function drawStreetProps(ctx) {
  // Streetlamp with a warm cone of light.
  ctx.fillStyle = '#14101f';
  ctx.fillRect(348, 300, 5, 170);
  ctx.fillStyle = '#1c1626';
  ctx.beginPath();
  ctx.arc(350, 296, 6, 0, Math.PI * 2);
  ctx.fill();
  glow(ctx, 350, 300, 44, '#ffd166', 0.5);
  ctx.fillStyle = 'rgba(255, 209, 102, 0.10)';
  ctx.beginPath();
  ctx.moveTo(350, 300);
  ctx.lineTo(312, 470);
  ctx.lineTo(388, 470);
  ctx.closePath();
  ctx.fill();
  // Palm tree at the right edge.
  ctx.strokeStyle = '#3a2a1e';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(562, 470);
  ctx.quadraticCurveTo(556, 400, 566, 340);
  ctx.stroke();
  ctx.strokeStyle = '#2f7d4f';
  ctx.lineWidth = 6;
  for (const [dx, dy] of [[-26, -18], [-12, -30], [6, -32], [22, -22], [30, -8], [-30, -4]]) {
    ctx.beginPath();
    ctx.moveTo(566, 340);
    ctx.quadraticCurveTo(566 + dx * 0.6, 340 + dy * 0.6, 566 + dx, 340 + dy);
    ctx.stroke();
  }
  // A cat on a crate by the lamp.
  ctx.fillStyle = '#4a3421';
  ctx.fillRect(296, 452, 34, 18);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.strokeRect(296, 452, 34, 18);
  drawCat(ctx, 313, 452, 0.9);
  // Wet-road neon reflections.
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#ff5fa2';
  ctx.fillRect(60, 480, 26, 34);
  ctx.fillStyle = '#37e6d4';
  ctx.fillRect(420, 482, 30, 30);
  ctx.fillStyle = '#ffc93c';
  ctx.fillRect(330, 484, 22, 26);
  ctx.globalAlpha = 1;
}

/** Paint the street, variant 0 for the left picture and 1 for the right. */
export function drawNeonStreet(ctx, variant, time = 0) {
  verticalGradient(ctx, 0, 0, 584, 330, '#2b1b4e', '#c65a6b');
  drawStars(ctx, time);
  drawMoon(ctx, variant);
  drawSkyline(ctx, 584, 330, SKYLINE, variant === 0 ? new Set([...LIT_WINDOWS, 'b5:0,1']) : LIT_WINDOWS);
  drawClockTower(ctx, variant);
  // The street itself.
  ctx.fillStyle = '#1c1626';
  ctx.fillRect(0, 330, 584, 190);
  ctx.fillStyle = '#241a33';
  ctx.fillRect(0, 330, 584, 6);
  ctx.fillStyle = '#3a2a5e';
  for (let x = 20; x < 584; x += 90) ctx.fillRect(x, 500, 46, 4);
  drawRamenShop(ctx, variant);
  drawTrafficLight(ctx, variant);
  drawStreetProps(ctx);
  drawCar(ctx, variant);
  // The extra bird only flies in the right picture.
  drawBird(ctx, 200, 90, 1);
  drawBird(ctx, 330, 70, 0.9);
  if (variant === 1) drawBird(ctx, 500, 90, 1);
}
