import { useMemo } from "react";
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
  return useMemo(() => {
    if (!recruitData || selectedItems.length === 0) {
      return {};
    }

    /**
     * 選択された項目の組み合わせに基づいてオペレーターをフィルタリング
     * @param combination - 選択された項目の組み合わせ
     * @returns - フィルタリングされたオペレーター
     */
    const filterByCombination = (combination: string[]): Operator[] => {
      // 上級エリートタグの存在確認（頻繁に使用されるため事前計算）
      const hasUpperElite = combination.includes("上級エリート");

      return recruitData.filter((operator: Operator) => {
        // 上級エリートとレアリティ6の処理
        if (operator.rarity === 6 && !hasUpperElite) return false;

        return combination.every((item) => {
          // エリートタグとレアリティ5の処理
          if (item === "エリート" && operator.rarity === 5) return true;

          // 上級エリートタグとレアリティ6の処理
          if (item === "上級エリート" && operator.rarity === 6) return true;

          if (operator.type === item) return true;

          // tagsが文字列の場合（"['近距離', '支援', 'ロボット']"のような形式）
          if (typeof operator.tags === 'string') {
            try {
              const tagsStr = operator.tags as string;
              const tagsArray = tagsStr
                .replace(/'/g, '"')
                .replace(/\[|\]/g, '')
                .split(', ')
                .map((tag: string) => tag.replace(/"/g, '').trim());

              return tagsArray.includes(item);
            } catch (e) {
              console.error('タグの解析エラー:', e);
              return false;
            }
          }

          // 通常の配列の場合
          return Array.isArray(operator.tags) && operator.tags.includes(item as any);
        });
      });
    };

    /**
     * 選択された項目のすべての可能な組み合わせを生成
     */
    const generateCombinations = (items: string[]): string[][] => {
      // 単一タグの組み合わせを先に追加
      const result: string[][] = items.map(item => [item]);

      // 2つのタグの組み合わせを生成
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          result.push([items[i], items[j]]);
        }
      }

      // 3つのタグの組み合わせを生成
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          for (let k = j + 1; k < items.length; k++) {
            result.push([items[i], items[j], items[k]]);
          }
        }
      }

      // 4つのタグの組み合わせを生成
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          for (let k = j + 1; k < items.length; k++) {
            for (let l = k + 1; l < items.length; l++) {
              result.push([items[i], items[j], items[k], items[l]]);
            }
          }
        }
      }

      // 5つのタグの組み合わせを生成
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          for (let k = j + 1; k < items.length; k++) {
            for (let l = k + 1; l < items.length; l++) {
              for (let m = l + 1; m < items.length; m++) {
                result.push([items[i], items[j], items[k], items[l], items[m]]);
              }
            }
          }
        }
      }

      // 6つのタグの組み合わせを生成（6件全て選択された場合）
      if (items.length === 6) {
        result.push([items[0], items[1], items[2], items[3], items[4], items[5]]);
      }

      return result;
    };

    const allCombinations = generateCombinations(selectedItems);
    const filteredResults: { [key: string]: Operator[] } = {};

    // Map を使用して結果をキャッシュ
    const filteredCache = new Map<string, Operator[]>();

    // 各組み合わせに対してフィルタリングを行う（ソートなし）
    allCombinations.forEach((combination) => {
      const combinationKey = combination.join(" + ");

      // キャッシュから結果を取得するか、新たに計算
      let filtered: Operator[];
      if (filteredCache.has(combinationKey)) {
        filtered = filteredCache.get(combinationKey)!;
      } else {
        filtered = filterByCombination(combination);
        filteredCache.set(combinationKey, filtered);
      }

      if (filtered.length > 0) {
        // rarityが低い順（昇順）に並び替え
        filteredResults[combinationKey] = [...filtered].sort((a, b) => a.rarity - b.rarity);
      }
    });

    const sortedResults = Object.entries(filteredResults).sort((a, b) => {
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

    return Object.fromEntries(sortedResults);
  }, [recruitData, selectedItems]);
};
