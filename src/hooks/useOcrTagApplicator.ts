import { useCallback } from "react";
import type { Tag, Type, Position } from "@/types/recruit";
import { rerityTags, positions, tags, types } from "@/lib/utils";

interface UseOcrTagApplicatorProps {
    checkedItems: { [key: string]: boolean };
    setCheckedItems: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
    selectedItems: string[];
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedCount: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * OCRタグをチェックボックス状態に適用する責務を分離したフック
 */
export const useOcrTagApplicator = ({
    checkedItems,
    setCheckedItems,
    selectedItems,
    setSelectedItems,
    setSelectedCount,
}: UseOcrTagApplicatorProps) => {
    /**
     * OCRで抽出したタグを受け取り、既存のチェックをリセットしてから該当するチェックボックスをオンにする関数
     */
    const applyOcrTags = useCallback(
        (ocrTags: string[]) => {
            // チェック状態を一度リセットし、OCRタグのみ反映
            setCheckedItems(() => {
                const updatedCheckedItems: { [key: string]: boolean } = {};
                const updatedSelectedItems = new Set<string>();

                ocrTags.forEach((rawTag) => {
                    // 前後の空白などを除去してから判定
                    const tag = rawTag.trim();

                    if (tag === "上級エリート") {
                        updatedCheckedItems["上級エリート"] = true;
                        updatedSelectedItems.add("上級エリート");
                        return;
                    }

                    if (tag === "エリート") {
                        updatedCheckedItems["エリート"] = true;
                        updatedSelectedItems.add("エリート");
                        return;
                    }

                    if (tag === "ロボット") {
                        updatedCheckedItems["ロボット"] = true;
                        updatedSelectedItems.add("ロボット");
                        return;
                    }

                    if (
                        tags.includes(tag as Tag) ||
                        positions.includes(tag as Position) ||
                        types.includes(tag as Type)
                    ) {
                        updatedCheckedItems[tag] = true;
                        updatedSelectedItems.add(tag);
                    }
                });

                const selectedArray = Array.from(updatedSelectedItems);
                setSelectedItems(selectedArray);
                setSelectedCount(selectedArray.length);

                return updatedCheckedItems;
            });
        },
        [setCheckedItems, setSelectedItems, setSelectedCount]
    );

    return { applyOcrTags };
};