import { useMemo, useCallback } from "react";
import type { Recruit, Operator, Tag, RarityTag, Type, Position } from "@/types/recruit";
import { isValidTag, type AllTag } from "@/lib/utils";

/**
 * 選択された項目に基づいてリクルートデータをフィルタリングし、フィルタリングされた結果を返す
 * @param recruitData - フィルタリングするデータ
 * @param selectedItems - 選択されたタグ、タイプ、またはポジション
 * @returns - 選択された項目の組み合わせごとにグループ化されたフィルタリング結果
 */
// type（職分）の並び順を定義
const TYPE_ORDER = ["先鋒", "前衛", "重装", "狙撃", "術師", "医療", "補助", "特殊"];

// 組み合わせ生成関数（フック外で定義）
const generateCombinations = (items: string[]): string[][] => {
  const result: string[][] = [];
  const n = items.length;
  
  // ビット演算を使用してより効率的に組み合わせを生成
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
};

export const useFilterOperators = (
  recruitData: Recruit | null,
  selectedItems: string[]
): { [key: string]: Operator[] } => {
  // フィルタリング処理をメモ化
  const filteredResults = useMemo(() => {
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

          // 通常の配列の場合（適切な型ガード）
          if (Array.isArray(operator.tags) && isValidTag(item)) {
            // タイプと一致するかチェック
            if (item === operator.type) {
              return true;
            }
            // タグ配列内に含まれるかチェック
            return (operator.tags as (Tag | RarityTag)[]).includes(item as Tag | RarityTag);
          }
          return false;
        });
      });
    };

    // 組み合わせ生成とフィルタリング処理
    const allCombinations = generateCombinations(selectedItems);
    const results: { [key: string]: Operator[] } = {};

    // 各組み合わせに対してフィルタリングを行う
    allCombinations.forEach((combination) => {
      const combinationKey = combination.join(" + ");
      const filtered = filterByCombination(combination);

      // 結果が空でない場合のみ保存（レアリティ優先、次にtype順でソート）
      if (filtered.length > 0) {
        results[combinationKey] = filtered.sort((a, b) => {
          // レアリティで比較（優先）
          if (a.rarity !== b.rarity) {
            return a.rarity - b.rarity;
          }
          // レアリティが同じ場合はtype順で比較
          const aTypeIndex = TYPE_ORDER.indexOf(a.type);
          const bTypeIndex = TYPE_ORDER.indexOf(b.type);
          return aTypeIndex - bTypeIndex;
        });
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
