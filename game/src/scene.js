// The drawing helpers both scenes share: sky gradients, stars, buildings, neon signs and
// the small props that make a street worth studying. Every helper draws in the panel's own
// coordinates (the caller translates to the panel first), and nothing here uses randomness at
// draw time, so the same scene always paints the same picture.

/** Fill a rectangle with a vertical gradient from `top` to `bottom`. */
export function verticalGradient(ctx, x, y, width, height, top, bottom) {
  const gradient = ctx.createLinearGradient(x, y, x, y + height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
}

/** A soft round glow: a radial gradient that fades to transparent. */
export function glow(ctx, x, y, radius, color, alpha = 0.55) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Fixed stars for a panel: the same positions every frame, so screenshots are stable. */
export const STARS = [
  [30, 26], [120, 44], [210, 20], [300, 52], [390, 30], [470, 48], [540, 24],
  [70, 80], [170, 66], [260, 84], [350, 62], [440, 88], [520, 70],
  [110, 108], [230, 118], [330, 104], [480, 116], [40, 130], [560, 130],
];

export function drawStars(ctx, twinkle = 0) {
  for (let i = 0; i < STARS.length; i += 1) {
    const [x, y] = STARS[i];
    // A slow twinkle, fixed at 0 for screenshots: even stars breathe, odd stars hold.
    const alpha = i % 2 === 0 ? 0.55 + 0.35 * Math.sin(twinkle * 0.9 + i) : 0.85;
    ctx.globalAlpha = Math.max(0.2, Math.min(1, alpha));
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath();
    ctx.arc(x, y, i % 5 === 0 ? 2.2 : 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** A row of dark buildings with a window grid; `lit` names the windows that glow, as "col,row". */
export function drawSkyline(ctx, width, baseY, buildings, lit) {
  for (const building of buildings) {
    ctx.fillStyle = building.color;
    ctx.fillRect(building.x, baseY - building.height, building.width, building.height);
    // A rooftop rim and an antenna on the taller ones.
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(building.x, baseY - building.height, building.width, 3);
    if (building.height > 120) {
      ctx.fillStyle = '#0b0716';
      ctx.fillRect(building.x + building.width / 2 - 1, baseY - building.height - 18, 2, 18);
      ctx.fillStyle = '#ff5d5d';
      ctx.beginPath();
      ctx.arc(building.x + building.width / 2, baseY - building.height - 20, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Windows: 16 wide, 22 tall, 26 apart, starting 10 in from each edge.
    const cols = Math.floor((building.width - 20) / 26);
    const rows = Math.floor((building.height - 16) / 30);
    for (let col = 0; col < cols; col += 1) {
      for (let row = 0; row < rows; row += 1) {
        const wx = building.x + 10 + col * 26;
        const wy = baseY - building.height + 10 + row * 30;
        const key = `${building.id}:${col},${row}`;
        if (lit.has(key)) {
          ctx.fillStyle = '#ffd166';
          glow(ctx, wx + 8, wy + 11, 16, '#ffb347', 0.35);
          ctx.fillStyle = '#ffd166';
          ctx.fillRect(wx, wy, 16, 22);
        } else {
          ctx.fillStyle = 'rgba(255, 244, 200, 0.10)';
          ctx.fillRect(wx, wy, 16, 22);
        }
      }
    }
  }
}

/** Blocky neon sign text: letters with a glow halo, drawn one letter at a time. */
export function drawNeonText(ctx, text, x, y, size, color, glowColor) {
  ctx.save();
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 14;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.85;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** A simple bird: two curved wings, drawn as arcs. */
export function drawBird(ctx, x, y, scale, color = '#14101f') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 9 * scale, y);
  ctx.quadraticCurveTo(x - 4 * scale, y - 7 * scale, x, y);
  ctx.quadraticCurveTo(x + 4 * scale, y - 7 * scale, x + 9 * scale, y);
  ctx.stroke();
  ctx.restore();
}

/** A round paper lantern with a top and bottom cap and a warm glow. */
export function drawLantern(ctx, x, y, radius, color) {
  glow(ctx, x, y, radius * 2.1, color, 0.4);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 1.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 20, 20, 0.55)';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 0.82, (radius * 1.12) * Math.abs(i) * 0.32 + radius * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#3d1a05';
  ctx.fillRect(x - radius * 0.3, y - radius * 1.12 - 4, radius * 0.6, 5);
  ctx.fillRect(x - radius * 0.3, y + radius * 1.12 - 1, radius * 0.6, 5);
}

/** A fish, facing left or right, drawn as an ellipse, tail and eye. */
export function drawFish(ctx, x, y, length, color, facingRight) {
  const dir = facingRight ? 1 : -1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, length / 2, length / 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-length / 2 + 2, 0);
  ctx.lineTo(-length / 2 - length / 4, -length / 5);
  ctx.lineTo(-length / 2 - length / 4, length / 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#101018';
  ctx.beginPath();
  ctx.arc(length / 4, -length / 20, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A sitting cat silhouette, tail curled around its paws. */
export function drawCat(ctx, x, y, scale, color = '#14101f') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  // Body and haunches.
  ctx.beginPath();
  ctx.ellipse(0, -12, 13, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head with two ears.
  ctx.beginPath();
  ctx.arc(2, -34, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-6, -40);
  ctx.lineTo(-4, -50);
  ctx.lineTo(0, -42);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6, -42);
  ctx.lineTo(10, -50);
  ctx.lineTo(12, -40);
  ctx.closePath();
  ctx.fill();
  // Tail curled along the ground.
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-11, 2);
  ctx.quadraticCurveTo(-24, 4, -20, -8);
  ctx.stroke();
  ctx.restore();
}
