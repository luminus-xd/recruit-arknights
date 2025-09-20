import { useCallback } from "react";
import { toast } from "sonner";

interface UseResetCheckboxesOptions {
  clearSelectedItems: () => void;
}

export const useResetCheckboxes = ({
  clearSelectedItems,
}: UseResetCheckboxesOptions) => {
  const resetCheckboxes = useCallback(() => {
    clearSelectedItems();
    toast.success("チェックボックスをリセットしました");
  }, [clearSelectedItems]);

  return { resetCheckboxes };
};
