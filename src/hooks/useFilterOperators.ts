import type { Recruit, Operator } from "@/types/recruit";

export const useFilterOperators = (
  recruitData: Recruit | null,
  selectedItems: string[]
) => {
  if (!recruitData || selectedItems.length === 0) {
    return {};
  }

  const hasUpperElite = selectedItems.includes("上級エリート");

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

  const combinations = (array: string[]) => {
    return array
      .reduce((a, v) => a.concat(a.map((r) => [v].concat(r))), [[]])
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
