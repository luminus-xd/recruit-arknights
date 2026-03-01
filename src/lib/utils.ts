import type { RarityTag, Position, Tag, Type } from "@/types/recruit";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const rarityTags = ["ロボット", "エリート", "上級エリート"] as const satisfies readonly RarityTag[];

export const positions = ["近距離", "遠距離"] as const satisfies readonly Position[];

export const types = [
  "先鋒",
  "前衛",
  "狙撃",
  "術師",
  "重装",
  "医療",
  "補助",
  "特殊",
] as const satisfies readonly Type[];

export const tags = [
  "初期",
  "火力",
  "生存",
  "防御",
  "治療",
  "支援",
  "範囲攻撃",
  "減速",
  "牽制",
  "弱化",
  "COST回復",
  "強制移動",
  "爆発力",
  "召喚",
  "高速再配置",
  "元素"
] as const satisfies readonly Tag[];

export const allTags = [
  ...rarityTags,
  ...positions,
  ...types,
  ...tags,
] as const satisfies readonly AllTag[];

export type AllTag = RarityTag | Position | Type | Tag;

const allTagsSet: ReadonlySet<string> = new Set<string>(allTags);

export const isValidTag = (item: string): item is AllTag => {
  return allTagsSet.has(item);
};

// 定数定義
export const RECRUIT_LIMITS = {
  MAX_SELECTED_TAGS: 6,
  WARNING_THRESHOLD: 7,
} as const;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
