import { RARITY } from "@/lib/constants";
import { isValidTag, type AllTag } from "@/lib/utils";
import type { Operator, Recruit } from "@/types/recruit";

/** type(職分)の表示順 */
export const TYPE_ORDER = [
  "先鋒",
  "前衛",
  "重装",
  "狙撃",
  "術師",
  "医療",
  "補助",
  "特殊",
] as const;

function parseLegacyTagString(tags: string): string[] {
  return tags
    .replace(/'/g, '"')
    .replace(/\[|\]/g, "")
    .split(",")
    .map((tag) => tag.replace(/"/g, "").trim())
    .filter(Boolean);
}

export function getOperatorTags(operator: Operator): readonly string[] {
  const operatorTags = operator.tags as unknown;

  if (typeof operatorTags === "string") {
    return parseLegacyTagString(operatorTags);
  }

  if (Array.isArray(operatorTags)) {
    return operatorTags;
  }

  return [];
}

export function operatorHasTag(operator: Operator, tag: string): boolean {
  return getOperatorTags(operator).includes(tag);
}

/**
 * オペレーターが単一のタグ項目(タグ/位置/職分/レアリティタグ)にマッチするか判定する。
 * レガシーの文字列 tags もここで吸収し、呼び出し側の分岐を増やさない。
 */
export function operatorMatchesItem(operator: Operator, item: string): boolean {
  if (item === "エリート" && operator.rarity === RARITY.ELITE) {
    return true;
  }

  if (item === "上級エリート" && operator.rarity === RARITY.UPPER_ELITE) {
    return true;
  }

  if (operator.type === item) {
    return true;
  }

  if (!isValidTag(item)) {
    return false;
  }

  return getOperatorTags(operator).includes(item as AllTag);
}

/**
 * タグの組み合わせ全てにマッチするオペレーターを抽出する。
 *
 * requireUpperEliteForRarity6 が true の場合、組み合わせに "上級エリート" が
 * 含まれない限り星6を除外する。
 */
export function filterByCombination(
  recruitData: Recruit,
  combination: string[],
  options: { requireUpperEliteForRarity6?: boolean } = {},
): Operator[] {
  const hasUpperElite = combination.includes("上級エリート");

  return recruitData.filter((operator) => {
    if (
      options.requireUpperEliteForRarity6 &&
      operator.rarity === RARITY.UPPER_ELITE &&
      !hasUpperElite
    ) {
      return false;
    }

    return combination.every((item) => operatorMatchesItem(operator, item));
  });
}

/** items の空でない全部分集合(べき集合 - 空集合)を生成する */
export function generateCombinations(items: string[]): string[][] {
  const result: string[][] = [];
  const n = items.length;

  for (let i = 1; i < (1 << n); i++) {
    const combination: string[] = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        combination.push(items[j]);
      }
    }
    result.push(combination);
  }

  return result;
}

/** レアリティ昇順 → TYPE_ORDER 順のコンパレータ */
export function compareByRarityThenType(a: Operator, b: Operator): number {
  if (a.rarity !== b.rarity) {
    return a.rarity - b.rarity;
  }

  return TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
}
