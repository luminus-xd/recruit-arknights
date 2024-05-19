import type { Recruit, Operator } from "@/types/recruit";

/**
 * 選択された項目に基づいてリクルートデータをフィルタリングし、フィルタリングされた結果を返します
 *
 * @param recruitData - フィルタリングするデータ
 * @param selectedItems - 選択されたタグ、タイプ、またはポジション
 * @returns - 選択された項目の組み合わせごとにグループ化されたフィルタリング結果
 */
export const useFilterOperators = (
  recruitData: Recruit | null,
  selectedItems: string[]
): { [key: string]: Operator[] } => {
  if (!recruitData || selectedItems.length === 0) {
    return {};
  }

  const hasUpperElite = selectedItems.includes("上級エリート");

  /**
   * 選択された項目の組み合わせに基づいてオペレーターをフィルタリングします
   *
   * @param combination - 選択された項目の組み合わせ
   * @param operators - フィルタリングするオペレーターのリスト
   * @returns - フィルタリングされたオペレーター
   */
  const filterByCombination = (
    combination: string[],
    operators: Operator[]
  ): Operator[] => {
    return operators.filter((operator: Operator) => {
      return combination.every((item) => {
        if (item === "エリート" && operator.rarity === 5) return true;
        if (item === "上級エリート" && operator.rarity === 6) return true;
        if (operator.rarity === 6 && !combination.includes("上級エリート"))
          return false;
        return operator.tags.includes(item as any) || operator.type === item;
      });
    });
  };

  /**
   * 選択された項目のすべての非空の組み合わせを生成します
   * @param array - 選択された項目の配列
   * @returns - 組み合わせの配列
   */
  const combinations = (array: string[]): string[][] => {
    return array
      .reduce<string[][]>((a, v) => a.concat(a.map((r) => [v, ...r])), [[]])
      .filter((c) => c.length > 0);
  };

  const allCombinations = combinations(selectedItems);
  const filteredResults: { [key: string]: Operator[] } = {};

  allCombinations.forEach((combination) => {
    const combinationKey = combination.join(" + ");
    const filtered = filterByCombination(combination, recruitData);
    if (filtered.length > 0) {
      filteredResults[combinationKey] = filtered;
    }
  });

  return Object.entries(filteredResults)
    .sort((a, b) => b[0].split(" + ").length - a[0].split(" + ").length)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
