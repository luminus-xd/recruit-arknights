import { useCallback } from "react";
import { toast } from "sonner";
import { useRecruit } from "@/contexts/RecruitContext";
import { positions, tags, types } from "@/lib/utils";
import { useInitializeCheckboxes } from "@/hooks/useInitializeCheckboxes";
import { useLimitWarning } from "@/hooks/useLimitWarning";
import { useUpdateURLParams } from "@/hooks/useUpdateURLParams";
import { useFilterOperators } from "@/hooks/useFilterOperators";
import { useResetCheckboxes } from "@/hooks/useResetCheckboxes";
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

export default function Recruit() {
  const { recruitData, isLoading } = useRecruit();
  const {
    checkedItems,
    setCheckedItems,
    selectedItems,
    setSelectedItems,
    selectedCount,
    setSelectedCount,
  } = useInitializeCheckboxes();

  const filteredOperators = useFilterOperators(recruitData, selectedItems);

  useLimitWarning(selectedCount, selectedItems);
  useUpdateURLParams(selectedItems);

  const { resetCheckboxes } = useResetCheckboxes(
    setCheckedItems,
    setSelectedItems,
    setSelectedCount
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, item: string) => {
      if (e.target.checked) {
        if (selectedCount < 6) {
          setCheckedItems((prev) => ({ ...prev, [item]: true }));
          setSelectedItems((prev) => [...prev, item]);
          setSelectedCount(selectedCount + 1);
          if (item === "上級エリート" || item === "エリート") {
            toast.info(
              "上級、通常のエリートを選択した場合は、忘れずに9時間に設定しましょう"
            );
          }
          if (item === "ロボット") {
            toast.info("ロボットタグは3時間50分の設定が推奨されます");
          }
        } else {
          toast.warning(
            "タグの選択数が上限になりました。6個まで選択可能です",
            {
              description: `選択中: ${selectedItems.join(", ")}`,
            }
          );
        }
      } else {
        setCheckedItems((prev) => ({ ...prev, [item]: false }));
        setSelectedItems((prev) =>
          prev.filter((selectedItem) => selectedItem !== item)
        );
        setSelectedCount(selectedCount - 1);
      }
    },
    [
      selectedCount,
      selectedItems,
      setCheckedItems,
      setSelectedItems,
      setSelectedCount,
    ]
  );

  const CheckboxGroup = ({
    title,
    description,
    items,
    prefix,
  }: {
    title: string;
    description: string;
    items: string[];
    prefix: string;
  }) => (
    <>
      <hgroup className="flex items-center gap-3">
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{description}</p>
      </hgroup>
      <div className="mt-2 mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item, index) => (
          <Checkbox
            key={index}
            id={`${prefix}-${index + 1}`}
            checked={!!checkedItems[item]}
            onChange={(e) => handleCheckboxChange(e, item)}
            label={item}
          />
        ))}
      </div>
    </>
  );

  return (
    <>
      <CheckboxGroup
        title="Type"
        description="職分"
        items={types}
        prefix="type"
      />
      <CheckboxGroup
        title="Position"
        description="位置"
        items={positions}
        prefix="position"
      />
      <CheckboxGroup title="Tag" description="タグ" items={tags} prefix="tag" />

      <div className="mt-4">
        <Button className="text-sm" onClick={resetCheckboxes}>
          選択状態をリセット
        </Button>
      </div>

      <Separator className="my-8" />

      {/* 選択されたタグの表示 */}
      <div className="mt-8">
        <hgroup className="flex items-center gap-3">
          <h2 className="text-3xl font-bold">Result</h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">結果</p>
        </hgroup>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          オペレーターのアイコンクリックで白Wikiに遷移します
        </p>
        <div className="mt-6">
          <h3 className="text-lg font-bold">選択されたタグ</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedItems.map((item) => (
              <span
                key={item}
                className="inline-block text-xs bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-stone-950 font-bold px-3 py-1 rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* フィルタリングされたオペレーターの表示 */}
      <div className="grid mt-8 gap-8">
        <TooltipProvider delayDuration={260}>
          {Object.entries(filteredOperators).map(([combination, operators]) => (
            <div key={combination}>
              <h3 className="text-lg font-bold border-b-2 pb-1">{combination}</h3>
              <ul className="flex flex-wrap mt-3 gap-2">
                {(operators as Operator[]).map((operator) => (
                  <li key={operator.id}>
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
                ))}
              </ul>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </>
  );
}
