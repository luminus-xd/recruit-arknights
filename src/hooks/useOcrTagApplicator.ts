import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { isValidTag } from "@/lib/utils";

interface UseOcrTagApplicatorProps {
    setSelectedItems: Dispatch<SetStateAction<string[]>>;
}

/**
 * OCRタグをチェックボックス状態に適用する責務を分離したフック
 */
export const useOcrTagApplicator = ({
    setSelectedItems,
}: UseOcrTagApplicatorProps) => {
    /**
     * OCRで抽出したタグを受け取り、既存のチェックをリセットしてから該当するチェックボックスをオンにする関数
     */
    const applyOcrTags = useCallback(
        (ocrTags: string[]) => {
            setSelectedItems(() => {
                const normalized = Array.from(
                    new Set(
                        ocrTags
                            .map((rawTag) => rawTag.trim())
                            .filter((tag): tag is string => tag.length > 0 && isValidTag(tag))
                    )
                );

                return normalized;
            });
        },
        [setSelectedItems]
    );

    return { applyOcrTags };
};
