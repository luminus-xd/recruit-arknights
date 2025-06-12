import { useEffect } from "react";
import { toast } from "sonner";
import { RECRUIT_LIMITS } from "@/lib/utils";

/**
 * タグの選択数が上限を超えた場合にトーストUIによる警告を行う
 * @param selectedCount
 * @param selectedItems
 */
export const useLimitWarning = (
  selectedCount: number,
  selectedItems: string[]
) => {
  useEffect(() => {
    if (selectedCount >= RECRUIT_LIMITS.WARNING_THRESHOLD) {
      toast.warning("タグの選択数が上限になりました。6個まで選択可能です", {
        description: `選択中: <b>${selectedItems.join(", ")}</b>`,
      });
    }
  }, [selectedCount, selectedItems]);
};
