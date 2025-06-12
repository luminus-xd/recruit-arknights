import { useState, useEffect, useCallback } from "react";
import type { Tag, RarityTag, Type, Position } from "@/types/recruit";
import { rarityTags, positions, tags, types } from "@/lib/utils";

export const useCheckboxState = () => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);

  /**
   * URLパラメータ(selectedItems=...) からチェック済みの項目を読み取る
   */
  const initializeFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const items = params.get("selectedItems")?.split(",") || [];
    const initialCheckedItems: { [key: string]: boolean } = {};

    items.forEach((item) => {
      if (
        rarityTags.includes(item as RarityTag) ||
        tags.includes(item as Tag) ||
        positions.includes(item as Position) ||
        types.includes(item as Type)
      ) {
        initialCheckedItems[item] = true;
      }
    });

    setCheckedItems(initialCheckedItems);
    setSelectedItems(items);
    setSelectedCount(items.length);
  }, []);

  useEffect(() => {
    initializeFromUrl();
  }, [initializeFromUrl]);

  return {
    checkedItems,
    setCheckedItems,
    selectedItems,
    setSelectedItems,
    selectedCount,
    setSelectedCount,
  };
};