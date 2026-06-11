import { useMemo } from "react";
import {
  compareByRarityThenType,
  filterByCombination,
  generateCombinations,
} from "@/lib/operatorMatching";
import type { Recruit, Operator } from "@/types/recruit";

/**
 * 選択された項目に基づいてリクルートデータをフィルタリングし、フィルタリングされた結果を返す
 * @param recruitData - フィルタリングするデータ
 * @param selectedItems - 選択されたタグ、タイプ、またはポジション
 * @returns - 選択された項目の組み合わせごとにグループ化されたフィルタリング結果
 */
export const useFilterOperators = (
  recruitData: Recruit | null,
  selectedItems: string[]
): { [key: string]: Operator[] } => {
  // フィルタリング処理をメモ化
  const filteredResults = useMemo(() => {
    if (!recruitData || selectedItems.length === 0) {
      return {};
    }

    // 組み合わせ生成とフィルタリング処理
    const allCombinations = generateCombinations(selectedItems);
    const results: { [key: string]: Operator[] } = {};

    // 各組み合わせに対してフィルタリングを行う
    allCombinations.forEach((combination) => {
      const combinationKey = combination.join(" + ");
      const filtered = filterByCombination(recruitData, combination, {
        requireUpperEliteForRarity6: true,
      });

      // 結果が空でない場合のみ保存（レアリティ優先、次にtype順でソート）
      if (filtered.length > 0) {
        results[combinationKey] = filtered.sort(compareByRarityThenType);
      }
    });

    return results;
  }, [selectedItems, recruitData]);

  // ソート処理をメモ化
  const sortedResults = useMemo(() => {
    return Object.entries(filteredResults).sort((a, b) => {
      const aKey = a[0];
      const bKey = b[0];

      const aHasUpperElite = aKey.includes("上級エリート");
      const bHasUpperElite = bKey.includes("上級エリート");

      if (aHasUpperElite !== bHasUpperElite) {
        return aHasUpperElite ? -1 : 1;
      }

      const aHasElite = aKey.includes("エリート");
      const bHasElite = bKey.includes("エリート");

      if (aHasElite !== bHasElite) {
        return aHasElite ? -1 : 1;
      }

      // タグの数でソート
      return bKey.split(" + ").length - aKey.split(" + ").length;
    });
  }, [filteredResults]);

  return Object.fromEntries(sortedResults);
};
