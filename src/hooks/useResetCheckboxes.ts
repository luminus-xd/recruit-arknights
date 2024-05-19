import { useCallback } from "react";
import { toast } from "sonner";

export const useResetCheckboxes = (
  setCheckedItems: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >,
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>,
  setSelectedCount: React.Dispatch<React.SetStateAction<number>>
) => {
  const resetCheckboxes = useCallback(() => {
    setCheckedItems({});
    setSelectedItems([]);
    setSelectedCount(0);
    // URLパラメータをリセット
    const params = new URLSearchParams(window.location.search);
    params.delete("selectedItems");
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
    toast.success("チェックボックスをリセットしました");
  }, [setCheckedItems, setSelectedItems, setSelectedCount]);

  return { resetCheckboxes };
};
