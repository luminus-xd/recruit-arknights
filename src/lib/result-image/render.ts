import type { Operator } from "@/types/recruit";

import {
  chamferPath,
  drawImageCover,
  fillTracked,
  fitText,
  fnv1a,
  mulberry32,
  roundRectPath,
  starPath,
  trackedWidth,
} from "@/lib/result-image/canvas";
import type { Guarantee } from "@/lib/result-image/guarantee";
import {
  PALETTES,
  withAlpha,
  type Palette,
  type ResultImageTheme,
} from "@/lib/result-image/theme";

export interface ResultImageGroup {
  combination: string[];
  operators: Operator[];
  guarantee: Guarantee | null;
}

export interface ResultImageInput {
  selectedTags: string[];
  groups: ResultImageGroup[];
  generatedAt: Date;
  siteLabel: string;
  /** 表示モードなどの補足。ヘッダーに小さく表示する */
  note?: string;
}

export interface ResultImageOptions {
  theme: ResultImageTheme;
  showNames: boolean;
}

export interface RenderedResultImage {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

type Ctx = CanvasRenderingContext2D;

const WIDTH = 1080;
const PAD = 72;
const CONTENT = WIDTH - PAD * 2;

const CARD_PAD = 26;
const CARD_GAP = 18;
const CARD_RADIUS = 14;
const CARD_CUT = 22;

const INNER_X = PAD + CARD_PAD;
const INNER_W = CONTENT - CARD_PAD * 2;
const SIDE_GAP = 20;
const TAG_LINE = 36;
const BADGE_H = 36;
/** 見出しを左に置いた時、グリッドが何行までならサイドレイアウトにするか */
const SIDE_MAX_ROWS = 2;

const CHIP_H = 54;
const CHIP_GAP = 10;

const STATS_H = 132;

/** 書き出し解像度。iOS Safari の Canvas 面積上限(約1677万px)を超えないよう調整する */
const TARGET_SCALE = 2;
const MAX_PIXELS = 16_000_000;
const MAX_EDGE = 16_000;

const ELITE_TAG_RARITY: Record<string, number> = {
  上級エリート: 6,
  エリート: 5,
};

/* ------------------------------------------------------------------ */
/* Assets                                                              */
/* ------------------------------------------------------------------ */

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();

function loadImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) {
    return cached;
  }

  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}

function resolveFontFamily() {
  const style = getComputedStyle(document.body);
  return [
    style.getPropertyValue("--font-inter").trim(),
    style.getPropertyValue("--font-biz").trim(),
    '"Hiragino Sans"',
    '"Noto Sans JP"',
    "system-ui",
    "sans-serif",
  ]
    .filter(Boolean)
    .join(", ");
}

async function ensureFonts(family: string, text: string) {
  if (!document.fonts) {
    return;
  }
  const sample = Array.from(new Set(Array.from(text))).join("");
  await Promise.allSettled(
    [500, 600, 700, 800].map((weight) =>
      document.fonts.load(`${weight} 32px ${family}`, sample),
    ),
  );
  await document.fonts.ready;
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

interface ChipLayout {
  tag: string;
  index: number;
  x: number;
  y: number;
  w: number;
}

interface TileLayout {
  operator: Operator;
  x: number;
  y: number;
}

interface CardLayout {
  group: ResultImageGroup;
  index: number;
  y: number;
  h: number;
  /** side: 見出しを左列に置く / stacked: 見出しを上に置きグリッドを全幅にする */
  mode: "side" | "stacked";
  badgeW: number;
  tagXs: number[];
  tiles: TileLayout[];
}

/**
 * カード内は共通のカラムグリッドで組む。サイドレイアウトでは
 * 先頭の headerColumns 列を見出しに充てるため、どちらのモードでも
 * タイルの大きさと縦の通りが揃う。
 */
interface GridSpec {
  columns: number;
  headerColumns: number;
  gap: number;
  step: number;
  tileSize: number;
  rowH: number;
  rowGap: number;
}

function createGridSpec(showNames: boolean): GridSpec {
  const columns = showNames ? 8 : 12;
  const gap = showNames ? 12 : 10;
  const step = (INNER_W + gap) / columns;
  const tileSize = step - gap;
  return {
    columns,
    headerColumns: showNames ? 2 : 3,
    gap,
    step,
    tileSize,
    rowH: showNames ? tileSize + 54 : tileSize,
    rowGap: showNames ? 14 : gap,
  };
}

function sideHeaderWidth(grid: GridSpec) {
  return grid.headerColumns * grid.step - SIDE_GAP * 2;
}

interface Layout {
  height: number;
  metaY: number;
  titleY: number;
  subtitleY: number;
  tagsLabelY: number;
  chips: ChipLayout[];
  statsY: number;
  cards: CardLayout[];
  emptyY: number | null;
  footerY: number;
  grid: GridSpec;
}

class Typography {
  constructor(private readonly family: string) {}

  font(weight: number, size: number) {
    return `${weight} ${size}px ${this.family}`;
  }
}

function measureBadge(ctx: Ctx, type: Typography, guarantee: Guarantee | null) {
  if (!guarantee) {
    return 0;
  }
  ctx.font = type.font(700, 18);
  const numeral = ctx.measureText(String(guarantee.rarity)).width;
  ctx.font = type.font(700, 15);
  const label = ctx.measureText(guarantee.label).width;
  return 14 + 15 + 5 + numeral + 6 + label + 16;
}

function computeLayout(
  ctx: Ctx,
  type: Typography,
  input: ResultImageInput,
  options: ResultImageOptions,
): Layout {
  let y = 76;
  const metaY = y + 12;
  y += 30;

  const titleY = y + 40 + 96;
  const subtitleY = titleY + 54;
  y = subtitleY + 58;

  const tagsLabelY = y + 12;
  y += 30;

  const chips: ChipLayout[] = [];
  let chipX = PAD;
  let chipY = y;
  input.selectedTags.forEach((tag, index) => {
    ctx.font = type.font(600, 13);
    const indexW = trackedWidth(ctx, String(index + 1).padStart(2, "0"), 1);
    ctx.font = type.font(700, 24);
    const w = 20 + indexW + 12 + ctx.measureText(tag).width + 22;
    if (chipX + w > PAD + CONTENT && chipX > PAD) {
      chipX = PAD;
      chipY += CHIP_H + CHIP_GAP;
    }
    chips.push({ tag, index, x: chipX, y: chipY, w });
    chipX += w + CHIP_GAP;
  });
  y = chips.length > 0 ? chipY + CHIP_H + 44 : y + 8;

  const statsY = y;
  y += STATS_H + 52;

  const grid = createGridSpec(options.showNames);
  const sideColumns = grid.columns - grid.headerColumns;

  const cards: CardLayout[] = input.groups.map((group, index) => {
    const badgeW = measureBadge(ctx, type, group.guarantee);
    const count = group.operators.length;

    // 横並びにした時のタグ位置。全幅に収まらない場合はサイドに逃がす
    ctx.font = type.font(700, 27);
    const plusW = 40;
    const tagXs: number[] = [];
    let cursor = 0;
    group.combination.forEach((tag, i) => {
      cursor += i > 0 ? plusW : 0;
      tagXs.push(cursor);
      cursor += ctx.measureText(tag).width;
    });
    const fitsInline = cursor + (badgeW > 0 ? 20 + badgeW : 0) <= INNER_W;

    const mode =
      Math.ceil(count / sideColumns) <= SIDE_MAX_ROWS || !fitsInline
        ? "side"
        : "stacked";
    const columns = mode === "side" ? sideColumns : grid.columns;
    const gridX = mode === "side" ? INNER_X + grid.headerColumns * grid.step : INNER_X;
    const gridTop = mode === "side" ? CARD_PAD : CARD_PAD + 20 + TAG_LINE + 22;

    const rows = Math.ceil(count / columns);
    const gridH = rows * grid.rowH + Math.max(0, rows - 1) * grid.rowGap;
    const headerH =
      mode === "side"
        ? 20 + group.combination.length * TAG_LINE + (group.guarantee ? 14 + BADGE_H : 0)
        : 0;

    const tiles = group.operators.map((operator, i) => ({
      operator,
      x: gridX + (i % columns) * grid.step,
      y: gridTop + Math.floor(i / columns) * (grid.rowH + grid.rowGap),
    }));

    const h = CARD_PAD + Math.max(headerH, gridTop - CARD_PAD + gridH) + CARD_PAD;
    const card: CardLayout = { group, index, y, h, mode, badgeW, tagXs, tiles };
    y += h + CARD_GAP;
    return card;
  });

  let emptyY: number | null = null;
  if (cards.length === 0) {
    emptyY = y;
    y += 180 + CARD_GAP;
  }

  const footerY = y + 28;
  const height = footerY + 30 + 96 + 60;

  return {
    height,
    metaY,
    titleY,
    subtitleY,
    tagsLabelY,
    chips,
    statsY,
    cards,
    emptyY,
    footerY,
    grid,
  };
}

/* ------------------------------------------------------------------ */
/* Painting                                                            */
/* ------------------------------------------------------------------ */

interface PaintContext {
  ctx: Ctx;
  type: Typography;
  palette: Palette;
  scale: number;
  code: string;
  accent: string | null;
}

function paintBackground({ ctx, palette, accent, code }: PaintContext, height: number) {
  const base = ctx.createLinearGradient(0, 0, 0, height);
  base.addColorStop(0, palette.background);
  base.addColorStop(1, palette.backgroundDeep);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, WIDTH, height);

  // 確定レアリティの色で右上を淡く灯し、画像ごとの表情を作る
  const glowColor = accent ?? palette.ink;
  const glow = ctx.createRadialGradient(WIDTH - 60, 40, 0, WIDTH - 60, 40, 620);
  glow.addColorStop(0, withAlpha(toHex(glowColor), accent ? 0.22 : 0.06));
  glow.addColorStop(0.35, withAlpha(toHex(glowColor), accent ? 0.07 : 0.02));
  glow.addColorStop(1, withAlpha(toHex(glowColor), 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, Math.min(height, 700));

  // ドットグリッド
  ctx.fillStyle = palette.grid;
  for (let gy = 24; gy < height; gy += 24) {
    for (let gx = 24; gx < WIDTH; gx += 24) {
      ctx.fillRect(gx - 0.75, gy - 0.75, 1.5, 1.5);
    }
  }

  // トンボ
  ctx.strokeStyle = palette.faint;
  ctx.lineWidth = 1.25;
  const m = 26;
  const l = 16;
  const corners: [number, number, number, number][] = [
    [m, m, 1, 1],
    [WIDTH - m, m, -1, 1],
    [m, height - m, 1, -1],
    [WIDTH - m, height - m, -1, -1],
  ];
  ctx.beginPath();
  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.moveTo(cx, cy + dy * l);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * l, cy);
  });
  ctx.stroke();

  // 左端の目盛り
  ctx.fillStyle = palette.faint;
  for (let ty = PAD; ty <= height - PAD; ty += 24) {
    const isMajor = (ty - PAD) % 120 === 0;
    ctx.fillRect(34, ty, isMajor ? 12 : 5, 1);
  }

  // 右端の縦組みラベル
  ctx.save();
  ctx.translate(WIDTH - 38, PAD);
  ctx.rotate(Math.PI / 2);
  ctx.font = `600 11px ${fontFamilyOf(ctx)}`;
  ctx.fillStyle = palette.faint;
  ctx.textBaseline = "middle";
  fillTracked(
    ctx,
    `ARKNIGHTS RECRUITMENT — OPEN RECRUITMENT SIMULATION — ${code}`,
    0,
    0,
    4,
  );
  ctx.restore();
}

function paintHeader(p: PaintContext, layout: Layout, input: ResultImageInput) {
  const { ctx, type, palette } = p;

  // メタ情報行
  ctx.fillStyle = palette.ink;
  ctx.fillRect(PAD, layout.metaY - 10, 9, 9);
  ctx.font = type.font(600, 13);
  ctx.fillStyle = palette.ink;
  fillTracked(ctx, "RECRUITMENT REPORT", PAD + 20, layout.metaY, 3.2);
  ctx.fillStyle = palette.muted;
  fillTracked(
    ctx,
    `NO. ${p.code}   ·   ${formatDate(input.generatedAt)}`,
    PAD + CONTENT,
    layout.metaY,
    2.4,
    "right",
  );

  const ruleY = layout.metaY + 18;
  ctx.fillStyle = palette.hairline;
  ctx.fillRect(PAD, ruleY, CONTENT, 1);
  ctx.fillStyle = palette.ink;
  ctx.fillRect(PAD, ruleY - 1, 64, 3);

  // タイトル。サイトの LineShadowText と同じ斜線シャドウを Canvas で再現する
  const titleSize = 132;
  ctx.font = type.font(800, titleSize);
  setLetterSpacing(ctx, `${-0.035 * titleSize}px`);
  const offset = titleSize * 0.045;
  ctx.fillStyle = createHatchPattern(p, palette.titleShadow, titleSize * 0.06);
  ctx.fillText("Recruitment", PAD - 4 + offset, layout.titleY + offset);
  ctx.fillStyle = palette.ink;
  ctx.fillText("Recruitment", PAD - 4, layout.titleY);
  setLetterSpacing(ctx, "0px");

  // サブタイトル
  ctx.font = type.font(700, 25);
  ctx.fillStyle = palette.muted;
  ctx.fillText("公開求人 シミュレーション結果", PAD, layout.subtitleY);

  if (input.note) {
    ctx.font = type.font(600, 15);
    const noteW = ctx.measureText(input.note).width;
    const nx = PAD + CONTENT - noteW - 32;
    const ny = layout.subtitleY - 24;
    roundRectPath(ctx, nx, ny, noteW + 32, 34, 17);
    ctx.fillStyle = palette.chip;
    ctx.fill();
    ctx.strokeStyle = palette.chipBorder;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = palette.ink;
    ctx.fillText(input.note, nx + 16, ny + 23);
  }

  // 選択タグ
  ctx.font = type.font(600, 13);
  ctx.fillStyle = palette.muted;
  const labelW = fillTracked(ctx, "SELECTED TAGS", PAD, layout.tagsLabelY, 3.2);
  ctx.font = type.font(500, 13);
  ctx.fillStyle = palette.faint;
  ctx.fillText("選択されたタグ", PAD + labelW + 14, layout.tagsLabelY);
  ctx.font = type.font(600, 13);
  fillTracked(
    ctx,
    `${String(input.selectedTags.length).padStart(2, "0")} / 06`,
    PAD + CONTENT,
    layout.tagsLabelY,
    2.4,
    "right",
  );

  layout.chips.forEach((chip) => {
    const rarity = ELITE_TAG_RARITY[chip.tag];
    const tint = rarity ? palette.rarity[rarity] : null;

    roundRectPath(ctx, chip.x, chip.y, chip.w, CHIP_H, 10);
    ctx.fillStyle = tint ? withAlpha(tint, 0.12) : palette.chip;
    ctx.fill();
    ctx.strokeStyle = tint ? withAlpha(tint, 0.55) : palette.chipBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = type.font(600, 13);
    ctx.fillStyle = tint ?? palette.faint;
    const indexW = fillTracked(
      ctx,
      String(chip.index + 1).padStart(2, "0"),
      chip.x + 20,
      chip.y + 34,
      1,
    );
    ctx.font = type.font(700, 24);
    ctx.fillStyle = tint ?? palette.ink;
    ctx.fillText(chip.tag, chip.x + 20 + indexW + 12, chip.y + 36);
  });
}

function paintStats(p: PaintContext, layout: Layout, input: ResultImageInput) {
  const { ctx, type, palette } = p;
  const y = layout.statsY;

  ctx.fillStyle = palette.hairline;
  ctx.fillRect(PAD, y, CONTENT, 1);
  ctx.fillRect(PAD, y + STATS_H, CONTENT, 1);

  const cellW = CONTENT / 3;
  for (let i = 1; i < 3; i++) {
    ctx.fillRect(PAD + cellW * i, y + 22, 1, STATS_H - 44);
  }

  const uniqueOperators = new Set(
    input.groups.flatMap((group) => group.operators.map((op) => op.id)),
  ).size;
  const best = pickBestGuarantee(input.groups);

  const cells: { label: string; sub: string }[] = [
    { label: "COMBINATIONS", sub: "組み合わせ" },
    { label: "OPERATORS", sub: "候補" },
    { label: "BEST ODDS", sub: "最高確定" },
  ];

  cells.forEach((cell, i) => {
    const x = PAD + cellW * i + (i === 0 ? 0 : 32);
    ctx.font = type.font(600, 13);
    ctx.fillStyle = palette.muted;
    const w = fillTracked(ctx, cell.label, x, y + 38, 3.2);
    ctx.font = type.font(500, 13);
    ctx.fillStyle = palette.faint;
    ctx.fillText(cell.sub, x + w + 10, y + 38);
  });

  ctx.font = type.font(700, 64);
  setLetterSpacing(ctx, "-2px");
  ctx.fillStyle = palette.ink;
  ctx.fillText(String(input.groups.length), PAD, y + 108);
  ctx.fillText(String(uniqueOperators), PAD + cellW + 32, y + 108);
  setLetterSpacing(ctx, "0px");

  const bx = PAD + cellW * 2 + 32;
  if (best) {
    const color = palette.rarity[best.rarity];
    ctx.fillStyle = color;
    starPath(ctx, bx + 19, y + 85, 19);
    ctx.fill();
    ctx.font = type.font(700, 64);
    ctx.fillText(String(best.rarity), bx + 44, y + 108);
    const numeralW = ctx.measureText(String(best.rarity)).width;
    ctx.font = type.font(700, 20);
    ctx.fillStyle = palette.muted;
    ctx.fillText(best.label, bx + 44 + numeralW + 10, y + 106);
  } else {
    ctx.font = type.font(700, 64);
    ctx.fillStyle = palette.faint;
    ctx.fillText("—", bx, y + 108);
  }
}

function paintBadge(
  p: PaintContext,
  guarantee: Guarantee,
  x: number,
  y: number,
  width: number,
) {
  const { ctx, type, palette } = p;
  const color = palette.rarity[guarantee.rarity];
  const centerY = y + BADGE_H / 2;

  roundRectPath(ctx, x, y, width, BADGE_H, BADGE_H / 2);
  ctx.fillStyle = withAlpha(color, 0.14);
  ctx.fill();
  ctx.strokeStyle = withAlpha(color, 0.5);
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = color;
  starPath(ctx, x + 14 + 7.5, centerY, 8);
  ctx.fill();

  ctx.font = type.font(700, 18);
  const numeral = String(guarantee.rarity);
  ctx.fillText(numeral, x + 14 + 15 + 5, centerY + 6.5);
  const numeralW = ctx.measureText(numeral).width;
  ctx.font = type.font(700, 15);
  ctx.fillText(guarantee.label, x + 14 + 15 + 5 + numeralW + 6, centerY + 5.5);
}

function paintCard(
  p: PaintContext,
  layout: Layout,
  card: CardLayout,
  total: number,
  images: Map<string, HTMLImageElement | null>,
  options: ResultImageOptions,
) {
  const { ctx, type, palette } = p;
  const { group } = card;
  const x = PAD;
  const y = card.y;
  const highlight =
    group.guarantee?.kind === "rarity"
      ? palette.rarity[group.guarantee.rarity]
      : null;

  // パネル
  chamferPath(ctx, x, y, CONTENT, card.h, CARD_RADIUS, CARD_CUT);
  ctx.fillStyle = palette.panel;
  ctx.fill();

  if (highlight) {
    ctx.save();
    chamferPath(ctx, x, y, CONTENT, card.h, CARD_RADIUS, CARD_CUT);
    ctx.clip();
    const wash = ctx.createLinearGradient(x, 0, x + CONTENT * 0.6, 0);
    wash.addColorStop(0, withAlpha(highlight, 0.11));
    wash.addColorStop(1, withAlpha(highlight, 0));
    ctx.fillStyle = wash;
    ctx.fillRect(x, y, CONTENT, card.h);
    ctx.fillStyle = highlight;
    ctx.fillRect(x, y, 4, card.h);
    ctx.restore();
  }

  chamferPath(ctx, x + 0.5, y + 0.5, CONTENT - 1, card.h - 1, CARD_RADIUS, CARD_CUT);
  ctx.strokeStyle = highlight ? withAlpha(highlight, 0.3) : palette.panelBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  // 切り欠きのアクセント
  ctx.beginPath();
  ctx.moveTo(x + CONTENT - CARD_CUT - 30, y + 0.5);
  ctx.lineTo(x + CONTENT - CARD_CUT, y + 0.5);
  ctx.lineTo(x + CONTENT - 0.5, y + CARD_CUT);
  ctx.lineTo(x + CONTENT - 0.5, y + CARD_CUT + 30);
  ctx.strokeStyle = highlight ?? palette.faint;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 見出しメタ: 通し番号と人数
  const isSide = card.mode === "side";
  const headerW = isSide ? sideHeaderWidth(layout.grid) : INNER_W;
  const metaY = y + CARD_PAD + 10;
  ctx.font = type.font(600, 12);
  ctx.fillStyle = highlight ?? palette.muted;
  const indexW = fillTracked(
    ctx,
    String(card.index + 1).padStart(2, "0"),
    INNER_X,
    metaY,
    1.8,
  );
  ctx.fillStyle = palette.faint;
  fillTracked(ctx, `/ ${String(total).padStart(2, "0")}`, INNER_X + indexW + 7, metaY, 1.8);
  fillTracked(
    ctx,
    `${group.operators.length} ${group.operators.length === 1 ? "OPERATOR" : "OPERATORS"}`,
    INNER_X + headerW,
    metaY,
    1.6,
    "right",
  );

  const tagsTop = y + CARD_PAD + 20;
  if (isSide) {
    // タグを縦に積み、"+" は左余白にぶら下げる
    group.combination.forEach((tag, i) => {
      const baseline = tagsTop + i * TAG_LINE + 28;
      if (i > 0) {
        ctx.font = type.font(500, 22);
        ctx.fillStyle = palette.faint;
        ctx.textAlign = "right";
        ctx.fillText("+", INNER_X - 6, baseline - 2);
        ctx.textAlign = "left";
      }
      const fitted = fitText(ctx, tag, headerW, (size) => type.font(700, size), 27, 18);
      ctx.font = type.font(700, fitted.size);
      ctx.fillStyle = palette.ink;
      ctx.fillText(fitted.text, INNER_X, baseline);
    });

    if (group.guarantee) {
      paintBadge(
        p,
        group.guarantee,
        INNER_X,
        tagsTop + group.combination.length * TAG_LINE + 14,
        card.badgeW,
      );
    }

    // 見出しとグリッドを分ける罫線
    ctx.fillStyle = palette.hairline;
    ctx.fillRect(
      INNER_X + layout.grid.headerColumns * layout.grid.step - SIDE_GAP,
      y + CARD_PAD,
      1,
      card.h - CARD_PAD * 2,
    );
  } else {
    const baseline = tagsTop + 28;
    let end = INNER_X;
    group.combination.forEach((tag, i) => {
      const tx = INNER_X + card.tagXs[i];
      if (i > 0) {
        ctx.font = type.font(500, 22);
        ctx.fillStyle = palette.faint;
        ctx.textAlign = "center";
        ctx.fillText("+", tx - 20, baseline - 2);
        ctx.textAlign = "left";
      }
      ctx.font = type.font(700, 27);
      ctx.fillStyle = palette.ink;
      ctx.fillText(tag, tx, baseline);
      end = tx + ctx.measureText(tag).width;
    });

    if (group.guarantee) {
      paintBadge(p, group.guarantee, end + 20, tagsTop + (TAG_LINE - BADGE_H) / 2 + 1, card.badgeW);
    }

    ctx.fillStyle = palette.hairline;
    ctx.fillRect(INNER_X, tagsTop + TAG_LINE + 10, INNER_W, 1);
  }

  card.tiles.forEach((tile) => {
    paintTile(p, layout, tile, y, images.get(tile.operator.imgPath) ?? null, options);
  });
}

function paintTile(
  p: PaintContext,
  layout: Layout,
  tile: TileLayout,
  cardY: number,
  image: HTMLImageElement | null,
  options: ResultImageOptions,
) {
  const { ctx, type, palette } = p;
  const { operator } = tile;
  const size = layout.grid.tileSize;
  const x = tile.x;
  const y = cardY + tile.y;
  const color = palette.rarity[operator.rarity];
  const radius = size * 0.13;

  ctx.save();
  roundRectPath(ctx, x, y, size, size, radius);
  ctx.clip();
  ctx.fillStyle = palette.tile;
  ctx.fillRect(x, y, size, size);

  if (image) {
    drawImageCover(ctx, image, x, y, size, size);
  } else {
    ctx.font = type.font(700, size * 0.4);
    ctx.fillStyle = palette.muted;
    ctx.textAlign = "center";
    ctx.fillText(operator.name.charAt(0), x + size / 2, y + size * 0.64);
    ctx.textAlign = "left";
  }

  // 下部のシェードとレアリティ表示
  const shade = ctx.createLinearGradient(0, y + size * 0.52, 0, y + size);
  shade.addColorStop(0, withAlpha(toHex(palette.tileShade), 0));
  shade.addColorStop(1, palette.tileShade);
  ctx.fillStyle = shade;
  ctx.fillRect(x, y + size * 0.52, size, size * 0.48);

  ctx.fillStyle = color;
  ctx.fillRect(x, y + size - 4, size, 4);

  const starR = size * 0.046;
  const starGap = starR * 2.25;
  ctx.fillStyle = color;
  for (let i = 0; i < operator.rarity; i++) {
    starPath(ctx, x + size * 0.1 + starR + i * starGap, y + size - 4 - starR * 2.1, starR);
    ctx.fill();
  }
  ctx.restore();

  roundRectPath(ctx, x + 0.5, y + 0.5, size - 1, size - 1, radius);
  ctx.strokeStyle = palette.tileEdge;
  ctx.lineWidth = 1;
  ctx.stroke();

  if (!options.showNames) {
    return;
  }

  const maxW = size + 10;
  const fitted = fitText(
    ctx,
    operator.name,
    maxW,
    (s) => type.font(700, s),
    17,
    11.5,
  );
  ctx.font = type.font(700, fitted.size);
  ctx.fillStyle = palette.ink;
  ctx.textAlign = "center";
  ctx.fillText(fitted.text, x + size / 2, y + size + 26);

  ctx.font = type.font(500, 12);
  ctx.fillStyle = palette.muted;
  ctx.fillText(operator.type, x + size / 2, y + size + 45);
  ctx.textAlign = "left";
}

function paintEmpty(p: PaintContext, y: number) {
  const { ctx, type, palette } = p;
  chamferPath(ctx, PAD + 0.5, y + 0.5, CONTENT - 1, 179, CARD_RADIUS, CARD_CUT);
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = palette.panelBorder;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = type.font(700, 24);
  ctx.fillStyle = palette.muted;
  ctx.textAlign = "center";
  ctx.fillText("該当するオペレーターはいません", WIDTH / 2, y + 98);
  ctx.textAlign = "left";
}

function paintFooter(p: PaintContext, layout: Layout, input: ResultImageInput) {
  const { ctx, type, palette } = p;
  const y = layout.footerY;

  ctx.fillStyle = palette.hairline;
  ctx.fillRect(PAD, y, CONTENT, 1);
  ctx.fillStyle = palette.ink;
  ctx.fillRect(PAD, y - 1, 64, 3);

  const top = y + 30;
  ctx.font = type.font(700, 22);
  ctx.fillStyle = palette.ink;
  ctx.fillText(input.siteLabel, PAD, top + 22);
  ctx.font = type.font(500, 15);
  ctx.fillStyle = palette.muted;
  ctx.fillText("Arknights Recruitment | アークナイツ公開求人ツール", PAD, top + 50);
  ctx.font = type.font(500, 11);
  ctx.fillStyle = palette.faint;
  fillTracked(
    ctx,
    "FAN-MADE TOOL · NOT AFFILIATED WITH HYPERGRYPH / YOSTAR",
    PAD,
    top + 82,
    1.6,
  );

  // 選択タグから決定的に生成するバーコード
  const barW = 240;
  const barH = 46;
  const bx = PAD + CONTENT - barW;
  const random = mulberry32(fnv1a(p.code));
  const bars: [number, number][] = [];
  let cursor = 0;
  for (;;) {
    const w = [1, 1, 1.5, 2, 3][Math.floor(random() * 5)];
    if (cursor + w > barW) {
      break;
    }
    bars.push([cursor, w]);
    cursor += w + [1.5, 2, 3][Math.floor(random() * 3)];
  }
  // 最後のバーが右端の罫線とぴったり揃うように寄せる
  const last = bars[bars.length - 1];
  const offset = bx + barW - (last[0] + last[1]);
  ctx.fillStyle = palette.ink;
  bars.forEach(([bxOffset, w]) => ctx.fillRect(offset + bxOffset, top, w, barH));

  ctx.font = type.font(600, 11);
  ctx.fillStyle = palette.muted;
  fillTracked(
    ctx,
    `RA-${p.code.replace("-", "")}-${formatStamp(input.generatedAt)}`,
    PAD + CONTENT,
    top + 70,
    2.6,
    "right",
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const familyByContext = new WeakMap<Ctx, string>();

function fontFamilyOf(ctx: Ctx) {
  return familyByContext.get(ctx) ?? "sans-serif";
}

function setLetterSpacing(ctx: Ctx, value: string) {
  if ("letterSpacing" in ctx) {
    (ctx as Ctx & { letterSpacing: string }).letterSpacing = value;
  }
}

function createHatchPattern(p: PaintContext, color: string, period: number) {
  const size = Math.max(2, Math.round(period * p.scale));
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  const tctx = tile.getContext("2d");
  if (!tctx) {
    return color;
  }
  tctx.strokeStyle = color;
  tctx.lineWidth = size * 0.36;
  tctx.beginPath();
  for (let k = -1; k <= 1; k++) {
    tctx.moveTo(k * size, size);
    tctx.lineTo(k * size + size, 0);
  }
  tctx.stroke();

  const pattern = p.ctx.createPattern(tile, "repeat");
  if (!pattern) {
    return color;
  }
  pattern.setTransform(new DOMMatrix().scale(1 / p.scale));
  return pattern;
}

/** rgba(...) の場合は ink 色として近似する(グロー用の hex 変換) */
function toHex(color: string) {
  if (color.startsWith("#")) {
    return color;
  }
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    return "#000000";
  }
  return `#${match
    .slice(1, 4)
    .map((v) => Number(v).toString(16).padStart(2, "0"))
    .join("")}`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatDate(date: Date) {
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatStamp(date: Date) {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

function pickBestGuarantee(groups: ResultImageGroup[]) {
  return groups.reduce<Guarantee | null>((best, group) => {
    const current = group.guarantee;
    if (current?.kind !== "rarity") {
      return best;
    }
    if (!best || current.rarity > best.rarity) {
      return current;
    }
    if (current.rarity === best.rarity && current.label === "確定") {
      return current;
    }
    return best;
  }, null);
}

export function createReportCode(tags: readonly string[]) {
  const hex = fnv1a(tags.join("|")).toString(16).toUpperCase().padStart(8, "0");
  return `${hex.slice(0, 4)}-${hex.slice(4)}`;
}

/* ------------------------------------------------------------------ */
/* Entry                                                               */
/* ------------------------------------------------------------------ */

export async function renderResultImage(
  input: ResultImageInput,
  options: ResultImageOptions,
): Promise<RenderedResultImage> {
  const family = resolveFontFamily();
  const type = new Typography(family);
  const palette = PALETTES[options.theme];

  const allText = [
    "RECRUITMENT REPORT Recruitment 公開求人 シミュレーション結果 選択されたタグ 組み合わせ 候補 最高確定 以上確定 ロボット 該当するオペレーターはいません アークナイツ公開求人ツール 0123456789",
    input.note ?? "",
    input.siteLabel,
    ...input.selectedTags,
    ...input.groups.flatMap((group) =>
      group.operators.flatMap((op) => [op.name, op.type]),
    ),
  ].join("");

  const uniqueSources = Array.from(
    new Set(input.groups.flatMap((group) => group.operators.map((op) => op.imgPath))),
  );

  const [, loaded] = await Promise.all([
    ensureFonts(family, allText),
    Promise.all(uniqueSources.map(async (src) => [src, await loadImage(src)] as const)),
  ]);
  const images = new Map(loaded);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }

  const layout = computeLayout(ctx, type, input, options);
  const height = Math.ceil(layout.height);
  const scale = Math.min(
    TARGET_SCALE,
    Math.sqrt(MAX_PIXELS / (WIDTH * height)),
    MAX_EDGE / height,
  );

  canvas.width = Math.floor(WIDTH * scale);
  canvas.height = Math.floor(height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  familyByContext.set(ctx, family);

  const best = pickBestGuarantee(input.groups);
  const paint: PaintContext = {
    ctx,
    type,
    palette,
    scale,
    code: createReportCode(input.selectedTags),
    accent: best ? palette.rarity[best.rarity] : null,
  };

  paintBackground(paint, height);
  paintHeader(paint, layout, input);
  paintStats(paint, layout, input);
  layout.cards.forEach((card) =>
    paintCard(paint, layout, card, layout.cards.length, images, options),
  );
  if (layout.emptyY !== null) {
    paintEmpty(paint, layout.emptyY);
  }
  paintFooter(paint, layout, input);

  return { canvas, width: canvas.width, height: canvas.height };
}
