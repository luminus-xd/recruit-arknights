import { useMemo, type ChangeEvent } from "react";
import { toast } from "sonner";

import { useRecruit } from "@/contexts/RecruitContext";

import { RECRUIT_LIMITS, RARITY } from "@/lib/constants";
import { positions, rarityTags, tags, types } from "@/lib/utils";

import { useCheckboxState } from "@/hooks/useCheckboxState";
import { useFilterOperators } from "@/hooks/useFilterOperators";
import { useLimitWarning } from "@/hooks/useLimitWarning";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useOcrTagApplicator } from "@/hooks/useOcrTagApplicator";

import { CheckboxGroup } from "@/components/recruit/checkbox-group";
import { FilteredResults } from "@/components/recruit/filtered-results";
import { SelectedTags } from "@/components/recruit/selected-tags";
import type { DisplayMode, FilterMode } from "@/components/recruit/types";
import ScreenshotAnalysis from "@/components/screenshot-analysis";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import type { Operator } from "@/types/recruit";

const FILTER_MODE_STORAGE_KEY = "recruit-filter-mode";
const DISPLAY_MODE_STORAGE_KEY = "recruit-display-mode";

const isFilterMode = (value: string): value is FilterMode => {
  return value === "default" || value === "star14Plus";
};

const isDisplayMode = (value: string): value is DisplayMode => {
  return value === "icon" || value === "card";
};

export default function Recruit() {
  const { recruitData } = useRecruit();
  const {
    checkedItems,
    selectedItems,
    setSelectedItems,
    clearSelectedItems,
    selectedCount,
  } = useCheckboxState();

  const { applyOcrTags } = useOcrTagApplicator({
    setSelectedItems,
  });

  const [filterMode, setFilterMode] = useLocalStorageState<FilterMode>(
    FILTER_MODE_STORAGE_KEY,
    "default",
    isFilterMode,
  );
  const [displayMode, setDisplayMode] = useLocalStorageState<DisplayMode>(
    DISPLAY_MODE_STORAGE_KEY,
    "icon",
    isDisplayMode,
  );

  const filteredOperators = useFilterOperators(recruitData, selectedItems);
  const filteredOperatorsByMode = useMemo(() => {
    if (filterMode !== "star14Plus") {
      return filteredOperators;
    }

    return Object.entries(filteredOperators).reduce<Record<string, Operator[]>>(
      (acc, [combination, operators]) => {
        const visibleOperators = operators.filter(
          (operator) =>
            operator.rarity === RARITY.ROBOT ||
            operator.rarity >= RARITY.HIGH_RARITY_MIN,
        );

        if (visibleOperators.length > 0) {
          acc[combination] = visibleOperators;
        }

        return acc;
      },
      {},
    );
  }, [filteredOperators, filterMode]);

  const hasFilteredOperators = Object.keys(filteredOperatorsByMode).length > 0;
  const isStar14Mode = filterMode === "star14Plus";

  useLimitWarning(selectedCount, selectedItems);

  const handleReset = () => {
    clearSelectedItems();
    toast.success("チェックボックスをリセットしました");
  };

  const handleCheckboxChange = (
    e: ChangeEvent<HTMLInputElement>,
    item: string,
  ) => {
    if (e.target.checked) {
      if (selectedCount < RECRUIT_LIMITS.MAX_SELECTED_TAGS) {
        setSelectedItems((prev) => {
          if (prev.includes(item)) {
            return prev;
          }
          return [...prev, item];
        });
        if (item === "上級エリート" || item === "エリート") {
          toast.info(
            "上級、通常のエリートを選択した場合は、忘れずに9時間に設定しましょう",
          );
        }
        if (item === "ロボット") {
          toast.info("ロボットタグは3時間50分の設定が推奨されます");
        }
      } else {
        toast.warning("タグの選択数が上限になりました。6個まで選択可能です", {
          description: `選択中: ${selectedItems.join(", ")}`,
        });
      }
    } else {
      setSelectedItems((prev) =>
        prev.filter((selectedItem) => selectedItem !== item),
      );
    }
  };

  return (
    <>
      <ScreenshotAnalysis applyOcrTags={applyOcrTags} />

      <Separator className="my-8" />

      <div className="mt-8">
        <CheckboxGroup
          title="Rarity"
          description="レアリティ"
          items={rarityTags}
          prefix="rarity"
          checkedItems={checkedItems}
          onCheckboxChange={handleCheckboxChange}
        />
        <CheckboxGroup
          title="Type"
          description="職分"
          items={types}
          prefix="type"
          checkedItems={checkedItems}
          onCheckboxChange={handleCheckboxChange}
        />
        <CheckboxGroup
          title="Position"
          description="位置"
          items={positions}
          prefix="position"
          checkedItems={checkedItems}
          onCheckboxChange={handleCheckboxChange}
        />
        <CheckboxGroup
          title="Tag"
          description="タグ"
          items={tags}
          prefix="tag"
          checkedItems={checkedItems}
          onCheckboxChange={handleCheckboxChange}
        />
      </div>

      <div className="mt-4">
        <Button className="text-sm" onClick={handleReset}>
          選択状態をリセット
        </Button>
      </div>

      <Separator className="my-8" />

      <SelectedTags
        selectedItems={selectedItems}
        modeControls={
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                表示モード
              </span>
              <Button
                size="sm"
                variant={filterMode === "default" ? "default" : "outline-solid"}
                onClick={() => setFilterMode("default")}
              >
                通常
              </Button>
              <Button
                size="sm"
                variant={
                  filterMode === "star14Plus" ? "default" : "outline-solid"
                }
                onClick={() => setFilterMode("star14Plus")}
              >
                ロボット & 星4以上
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                表示形式
              </span>
              <Button
                size="sm"
                variant={displayMode === "icon" ? "default" : "outline-solid"}
                onClick={() => setDisplayMode("icon")}
              >
                アイコンのみ
              </Button>
              <Button
                size="sm"
                variant={displayMode === "card" ? "default" : "outline-solid"}
                onClick={() => setDisplayMode("card")}
              >
                詳細
              </Button>
            </div>

            {isStar14Mode && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                星2と星3のオペレーターは非表示になります。
              </p>
            )}
          </>
        }
      />

      {isStar14Mode && selectedItems.length > 0 && !hasFilteredOperators ? (
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          指定されたタグでは、ロボットまたは星4以上のオペレーターが見つかりませんでした。
        </p>
      ) : (
        <FilteredResults
          filteredOperators={filteredOperatorsByMode}
          displayMode={displayMode}
        />
      )}
    </>
  );
}
