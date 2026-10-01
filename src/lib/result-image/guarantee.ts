import { RARITY } from "@/lib/constants";
import { operatorHasTag } from "@/lib/operatorMatching";
import type { Operator, Rarity } from "@/types/recruit";

export type Guarantee =
  | { kind: "rarity"; rarity: Rarity; label: string }
  | { kind: "robot"; rarity: Rarity; label: string };

/**
 * タグの組み合わせから「確定」できる最低レアリティを判定する。
 * 判定基準は /recommend と揃え、ロボットは確定判定から除外する(9時間設定を前提)。
 */
export function getGuarantee(
  combination: readonly string[],
  operators: readonly Operator[],
): Guarantee | null {
  if (combination.includes("ロボット")) {
    return { kind: "robot", rarity: RARITY.ROBOT, label: "ロボット" };
  }

  const candidates = operators.filter(
    (operator) => !operatorHasTag(operator, "ロボット"),
  );
  if (candidates.length === 0) {
    return null;
  }

  const floor = Math.min(...candidates.map((operator) => operator.rarity));
  if (floor < RARITY.HIGH_RARITY_MIN) {
    return null;
  }

  const rarity = floor as Rarity;
  const isExact = candidates.every((operator) => operator.rarity === rarity);

  return {
    kind: "rarity",
    rarity,
    label: isExact ? "確定" : "以上確定",
  };
}

/** ロボットを除き、星4以上が確定する組み合わせか */
export function isHighRarityGuarantee(guarantee: Guarantee | null): boolean {
  return guarantee?.kind === "rarity";
}
