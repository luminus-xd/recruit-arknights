import { useEffect } from "react";
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

  useEffect(() => {
    if (!isLoading) {
      toast.success("データの読み込みが完了しました");
    }
  }, [isLoading]);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: string
  ) => {
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
          "タグの選択数が上限になりました。<br>6個まで選択可能です",
          {
            description: `選択中: <b>${selectedItems.join(", ")}</b>`,
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
  };

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
          <div
            key={index}
            className="flex w-full items-center gap-2 focus-within:ring-2 focus-within:ring-sky-400 rounded-lg"
          >
            <input
              type="checkbox"
              id={`${prefix}-${index + 1}`}
              className="visually-hidden peer"
              checked={!!checkedItems[item]}
              value={item}
              onChange={(e) => handleCheckboxChange(e, item)}
            />
            <label
              htmlFor={`${prefix}-${index + 1}`}
              className="select-none cursor-pointer w-full flex items-center justify-center rounded-lg border-2 border-gray-200 dark:border-gray-500 py-3 px-6 font-bold text-gray-700 dark:text-gray-200 transition-colors duration-200 ease-in-out peer-checked:bg-gray-200 peer-checked:text-gray-900 peer-checked:border-gray-200 dark:peer-checked:bg-secondary dark:peer-checked:text-secondary-foreground dark:peer-checked:border-secondary"
            >
              <span>{item}</span>
            </label>
          </div>
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
        {Object.entries(filteredOperators).map(([combination, operators]) => (
          <div key={combination}>
            <h3 className="text-lg font-bold border-b-2 pb-1">{combination}</h3>
            <ul className="flex flex-wrap mt-3 gap-2">
              {(operators as Operator[]).map((operator) => (
                <li key={operator.id}>
                  <a
                    href={operator.wiki}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Avatar rarity={operator.rarity}>
                      <AvatarImage alt={operator.name} src={operator.imgPath} />
                      <AvatarFallback>{operator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
