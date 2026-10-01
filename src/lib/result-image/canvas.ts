type Ctx = CanvasRenderingContext2D;

export function roundRectPath(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** 右上だけを斜めに切り落とした角丸矩形 */
export function chamferPath(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  cut: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - cut, y);
  ctx.lineTo(x + w, y + cut);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function starPath(ctx: Ctx, cx: number, cy: number, outer: number) {
  const inner = outer * 0.45;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
}

export function trackedWidth(ctx: Ctx, text: string, tracking: number) {
  const chars = Array.from(text);
  return (
    chars.reduce((sum, char) => sum + ctx.measureText(char).width, 0) +
    tracking * Math.max(0, chars.length - 1)
  );
}

/**
 * Canvas の letterSpacing は Safari の対応が遅れているため、
 * 小さなラベル用に1文字ずつ配置して字間を再現する。
 */
export function fillTracked(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  tracking: number,
  align: "left" | "right" | "center" = "left",
) {
  const width = trackedWidth(ctx, text, tracking);
  let cursor =
    align === "left" ? x : align === "right" ? x - width : x - width / 2;
  const previousAlign = ctx.textAlign;
  ctx.textAlign = "left";
  for (const char of Array.from(text)) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + tracking;
  }
  ctx.textAlign = previousAlign;
  return width;
}

export function ellipsize(ctx: Ctx, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }
  const chars = Array.from(text);
  while (chars.length > 1) {
    chars.pop();
    const candidate = `${chars.join("")}…`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      return candidate;
    }
  }
  return "…";
}

/** 最大サイズから縮めて収まるフォントサイズを探し、それでも溢れたら省略する */
export function fitText(
  ctx: Ctx,
  text: string,
  maxWidth: number,
  fontAt: (size: number) => string,
  maxSize: number,
  minSize: number,
) {
  for (let size = maxSize; size >= minSize; size -= 0.5) {
    ctx.font = fontAt(size);
    if (ctx.measureText(text).width <= maxWidth) {
      return { text, size };
    }
  }
  ctx.font = fontAt(minSize);
  return { text: ellipsize(ctx, text, maxWidth), size: minSize };
}

/** object-fit: cover 相当で画像を描画する */
export function drawImageCover(
  ctx: Ctx,
  image: CanvasImageSource & { width: number; height: number },
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ratio = Math.max(w / image.width, h / image.height);
  const sw = w / ratio;
  const sh = h / ratio;
  const sx = (image.width - sw) / 2;
  const sy = (image.height - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

export function fnv1a(input: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
