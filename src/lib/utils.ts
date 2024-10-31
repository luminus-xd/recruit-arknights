import type { Position, Tag, Type } from "@/types/recruit";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const positions: Position[] = ["近距離", "遠距離"];

export const types: Type[] = [
  "先鋒",
  "前衛",
  "狙撃",
  "術師",
  "重装",
  "医療",
  "補助",
  "特殊",
];

export const tags: Tag[] = [
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
  "元素",
  "ロボット",
  "エリート",
  "上級エリート",
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
