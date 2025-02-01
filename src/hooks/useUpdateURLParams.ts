import { useEffect } from "react";

/**
 * selectedItemsが更新された場合、URLのパラメータを変更する
 * @param selectedItems
 */
export const useUpdateURLParams = (selectedItems: string[]) => {
  useEffect(() => {
    // ブラウザ環境でのみ実行
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (selectedItems.length > 0) {
      params.set("selectedItems", selectedItems.join(","));
    } else {
      params.delete("selectedItems");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [selectedItems]);
};
