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
  if (!recruitData || selectedItems.length === 0) {
    return {};
  }

  const hasUpperElite = selectedItems.includes("上級エリート");

  /**
   * 選択された項目の組み合わせに基づいてオペレーターをフィルタリング
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
   * 選択された項目のすべての非空の組み合わせを作成
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
      // rarityが低い順（昇順）に並び替え
      filtered.sort((a, b) => a.rarity - b.rarity);
      filteredResults[combinationKey] = filtered;
    }
  });

  const sortedResults = Object.entries(filteredResults).sort((a, b) => {
    const aIncludesUpperElite = a[0].includes("上級エリート");
    const bIncludesUpperElite = b[0].includes("上級エリート");
    const aIncludesElite = a[0].includes("エリート");
    const bIncludesElite = b[0].includes("エリート");

    if (aIncludesUpperElite && !bIncludesUpperElite) {
      return -1; // aを優先（上級エリート）
    }
    if (!aIncludesUpperElite && bIncludesUpperElite) {
      return 1; // bを優先（上級エリート）
    }
    if (aIncludesElite && !bIncludesElite) {
      return -1; // aを優先（エリート）
    }
    if (!aIncludesElite && bIncludesElite) {
      return 1; // bを優先（エリート）
    }

    // エリート/上級エリートが含まれない場合は、タグの数でソート
    return b[0].split(" + ").length - a[0].split(" + ").length;
  });

  return sortedResults.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
