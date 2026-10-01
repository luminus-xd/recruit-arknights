export type ResultImageTheme = "dark" | "light";

export interface Palette {
  background: string;
  backgroundDeep: string;
  ink: string;
  muted: string;
  faint: string;
  hairline: string;
  grid: string;
  panel: string;
  panelBorder: string;
  chip: string;
  chipBorder: string;
  tile: string;
  tileEdge: string;
  tileShade: string;
  titleShadow: string;
  rarity: Record<number, string>;
}

/**
 * サイトのアバター枠と同じ色相を使い、書き出し画像でも
 * レアリティの印象が変わらないようにしている。
 */
export const PALETTES: Record<ResultImageTheme, Palette> = {
  dark: {
    background: "#0B0C0F",
    backgroundDeep: "#060708",
    ink: "#F3F2EE",
    muted: "rgba(243, 242, 238, 0.58)",
    faint: "rgba(243, 242, 238, 0.30)",
    hairline: "rgba(243, 242, 238, 0.12)",
    grid: "rgba(243, 242, 238, 0.055)",
    panel: "rgba(255, 255, 255, 0.025)",
    panelBorder: "rgba(255, 255, 255, 0.085)",
    chip: "rgba(255, 255, 255, 0.05)",
    chipBorder: "rgba(255, 255, 255, 0.16)",
    tile: "#17191D",
    tileEdge: "rgba(255, 255, 255, 0.10)",
    tileShade: "rgba(6, 7, 8, 0.78)",
    titleShadow: "rgba(243, 242, 238, 0.55)",
    rarity: {
      1: "#A1A1AA",
      2: "#4ADE80",
      3: "#60A5FA",
      4: "#C084FC",
      5: "#FB923C",
      6: "#F87171",
    },
  },
  light: {
    background: "#F4F3EF",
    backgroundDeep: "#EAE8E2",
    ink: "#0D0E11",
    muted: "rgba(13, 14, 17, 0.60)",
    faint: "rgba(13, 14, 17, 0.36)",
    hairline: "rgba(13, 14, 17, 0.14)",
    grid: "rgba(13, 14, 17, 0.07)",
    panel: "rgba(255, 255, 255, 0.72)",
    panelBorder: "rgba(13, 14, 17, 0.09)",
    chip: "rgba(255, 255, 255, 0.9)",
    chipBorder: "rgba(13, 14, 17, 0.16)",
    tile: "#E6E4DE",
    tileEdge: "rgba(13, 14, 17, 0.10)",
    tileShade: "rgba(13, 14, 17, 0.62)",
    titleShadow: "rgba(13, 14, 17, 0.62)",
    rarity: {
      1: "#71717A",
      2: "#16A34A",
      3: "#2563EB",
      4: "#9333EA",
      5: "#EA580C",
      6: "#DC2626",
    },
  },
};

/** "#RRGGBB" に透明度を付与する */
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
