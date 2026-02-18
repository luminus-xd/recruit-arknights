import { useCallback, memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { useRecruit } from "@/contexts/RecruitContext";

import { rarityTags, positions, tags, types, RECRUIT_LIMITS } from "@/lib/utils";

import { useCheckboxState } from "@/hooks/useCheckboxState";
import { useLimitWarning } from "@/hooks/useLimitWarning";
import { useOcrTagApplicator } from "@/hooks/useOcrTagApplicator";
import { useFilterOperators } from "@/hooks/useFilterOperators";
import { useResetCheckboxes } from "@/hooks/useResetCheckboxes";

import ScreenshotAnalysis from "@/components/screenshot-analysis";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Checkbox from "@/components/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type { Operator } from "@/types/recruit";

type FilterMode = "default" | "star14Plus";

const FILTER_MODE_STORAGE_KEY = "recruit-filter-mode";

// チェックボックスコンポーネント
const MemoizedCheckbox = memo(Checkbox);

// チェックボックスグループコンポーネント
const CheckboxGroup = memo(({
  title,
  description,
  items,
  prefix,
  checkedItems,
  onCheckboxChange,
}: {
  title: string;
  description: string;
  items: readonly string[];
  prefix: string;
  checkedItems: { [key: string]: boolean };
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>, item: string) => void;
}) => (
  <>
    <hgroup className="flex items-center gap-3">
      <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
      <p className="mt-1 text-gray-500 dark:text-gray-400 font-bold tracking-tight">{description}</p>
    </hgroup>
    <div className="mt-2 mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((item, index) => (
        <MemoizedCheckbox
          key={`${prefix}-${item}`}
          id={`${prefix}-${index + 1}`}
          checked={!!checkedItems[item]}
          onChange={(e) => onCheckboxChange(e, item)}
          label={item}
        />
      ))}
    </div>
  </>
));
CheckboxGroup.displayName = "CheckboxGroup";

// 選択タグ表示コンポーネント
const SelectedTags = memo(({
  selectedItems,
  modeControls,
}: {
  selectedItems: string[];
  modeControls?: ReactNode;
}) => (
  <div className="mt-8">
    <hgroup className="flex items-center gap-3">
      <h2 className="text-3xl font-extrabold tracking-tight">Result</h2>
      <p className="mt-1 text-gray-500 dark:text-gray-400 font-bold tracking-tight">結果</p>
    </hgroup>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      オペレーターのアイコンクリックで白Wikiに遷移します
    </p>
    {modeControls}
    {selectedItems.length > 0 && (
      <div className="mt-6">
        <h3 className="text-lg font-bold">選択されたタグ</h3>
        <ul className="flex flex-wrap gap-2 mt-2">
          {selectedItems.map((item) => (
            <li
              key={item}
              className="inline-block text-xs bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-stone-950 font-bold px-3 py-1 rounded-full"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
));
SelectedTags.displayName = "SelectedTags";

// オペレーターアイテムコンポーネント
const OperatorItem = memo(({ operator }: { operator: Operator }) => (
  <li>
    <Tooltip>
      <TooltipTrigger>
        <a
          className="hover:scale-105"
          href={operator.wiki}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Avatar rarity={operator.rarity}>
            <AvatarImage alt={operator.name} src={operator.imgPath} />
            <AvatarFallback>{operator.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <p>{operator.name}</p>
      </TooltipContent>
    </Tooltip>
  </li>
));
OperatorItem.displayName = "OperatorItem";

// オペレーター組み合わせコンポーネント
const OperatorCombination = memo(({ combination, operators }: { combination: string, operators: Operator[] }) => (
  <div className="relative p-4 border-2 rounded-md" key={combination}>
    <h3 className="absolute inline-block text-lg font-bold -top-[0.92rem] left-[0.55rem] px-2 bg-background">{combination}</h3>
    <ul className="flex flex-wrap mt-2 gap-2">
      {operators.map((operator) => (
        <OperatorItem key={operator.id} operator={operator} />
      ))}
    </ul>
  </div>
));
OperatorCombination.displayName = "OperatorCombination";

// フィルタリング結果コンポーネント
const FilteredResults = memo(({ filteredOperators }: { filteredOperators: { [key: string]: Operator[] } }) => (
  <div className="grid mt-8 gap-8">
    <TooltipProvider delayDuration={260}>
      {Object.entries(filteredOperators).map(([combination, operators]) => (
        <OperatorCombination
          key={combination}
          combination={combination}
          operators={operators as Operator[]}
        />
      ))}
    </TooltipProvider>
  </div>
));
FilteredResults.displayName = "FilteredResults";

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

  const [filterMode, setFilterMode] = useState<FilterMode>("default");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedMode = window.localStorage.getItem(FILTER_MODE_STORAGE_KEY);
    if (storedMode === "default" || storedMode === "star14Plus") {
      setFilterMode(storedMode);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(FILTER_MODE_STORAGE_KEY, filterMode);
  }, [filterMode]);

  const filteredOperators = useFilterOperators(recruitData, selectedItems);
  const filteredOperatorsByMode = useMemo(() => {
    if (filterMode !== "star14Plus") {
      return filteredOperators;
    }

    const reducedEntries = Object.entries(filteredOperators).reduce<
      Record<string, Operator[]>
    >((acc, [combination, operators]) => {
      const visibleOperators = operators.filter(
        (operator) => operator.rarity === 1 || operator.rarity >= 4,
      );

      if (visibleOperators.length > 0) {
        acc[combination] = visibleOperators;
      }

      return acc;
    }, {});

    return reducedEntries;
  }, [filteredOperators, filterMode]);

  const hasFilteredOperators = Object.keys(filteredOperatorsByMode).length > 0;
  const isStar14Mode = filterMode === "star14Plus";

  useLimitWarning(selectedCount, selectedItems);

  const { resetCheckboxes } = useResetCheckboxes({
    clearSelectedItems,
  });

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, item: string) => {
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
              "上級、通常のエリートを選択した場合は、忘れずに9時間に設定しましょう"
            );
          }
          if (item === "ロボット") {
            toast.info("ロボットタグは3時間50分の設定が推奨されます");
          }
        } else {
          // 上限超過時の警告（descriptionはsetSelectedItems内のprevで取得し参照変更を避ける）
          setSelectedItems((prev) => {
            toast.warning(
              "タグの選択数が上限になりました。6個まで選択可能です",
              { description: `選択中: ${prev.join(", ")}` }
            );
            return prev;
          });
        }
      } else {
        setSelectedItems((prev) =>
          prev.filter((selectedItem) => selectedItem !== item)
        );
      }
    },
    // selectedItemsの配列参照ではなくselectedCount(数値)を依存に使い不要な再生成を防ぐ
    [selectedCount, setSelectedItems]
  );

  return (
    <>
      <ScreenshotAnalysis applyOcrTags={applyOcrTags} />

      <Separator className="my-8" />

      <div className="mt-8">
        <CheckboxGroup
          title="Rarity"
          description="レアリティ"
          items={rarityTags}
          prefix="rerity"
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
        <Button className="text-sm" onClick={resetCheckboxes}>
          選択状態をリセット
        </Button>
      </div>

      <Separator className="my-8" />

      {/* 選択されたタグの表示 */}
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
                variant={filterMode === "default" ? "default" : "outline"}
                onClick={() => setFilterMode("default")}
              >
                通常
              </Button>
              <Button
                size="sm"
                variant={filterMode === "star14Plus" ? "default" : "outline"}
                onClick={() => setFilterMode("star14Plus")}
              >
                ロボット & 星4以上
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

      {/* フィルタリングされたオペレーターの表示 */}
      {isStar14Mode && selectedItems.length > 0 && !hasFilteredOperators ? (
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          指定されたタグでは、ロボットまたは星4以上のオペレーターが見つかりませんでした。
        </p>
      ) : (
        <FilteredResults filteredOperators={filteredOperatorsByMode} />
      )}
    </>
  );
}
