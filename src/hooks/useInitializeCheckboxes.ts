import { useEffect, useState, useCallback } from "react";
import type { Tag, RerityTag, Type, Position } from "@/types/recruit";
import { rerityTags, positions, tags, types } from "@/lib/utils";

/**
 * ページロード時にURLのクエリパラメータを解析し、初期状態を設定
 * @returns
 */
export const useInitializeCheckboxes = () => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);

  const initializeState = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const items = params.get("selectedItems")?.split(",") || [];
    const initialCheckedItems: { [key: string]: boolean } = {};

    items.forEach((item) => {
      if (
        rerityTags.includes(item as RerityTag) ||
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
    initializeState();
  }, [initializeState]);

  return {
    checkedItems,
    setCheckedItems,
    selectedItems,
    setSelectedItems,
    selectedCount,
    setSelectedCount,
  };
};
