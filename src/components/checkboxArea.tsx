import type { Tag, Type, Position } from "@/types/recruit";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRecruit } from "@/contexts/RecruitContext";
import { positions, tags, types } from "@/lib/utils";

export default function CheckboxArea() {
  const { recruitData, isLoading } = useRecruit();
  const [selectedCount, setSelectedCount] = useState(0);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    // ページロード時にURLのクエリパラメータを解析し、初期状態を設定
    const params = new URLSearchParams(window.location.search);
    const items = params.get("selectedItems")?.split(",") || [];
    const initialCheckedItems: { [key: string]: boolean } = {};

    console.log(items);

    items.forEach((item) => {
      if (
        tags.includes(item as Tag) ||
        positions.includes(item as Position) ||
        types.includes(item as Type)
      ) {
        initialCheckedItems[item] = true;
      }
    });

    setCheckedItems(initialCheckedItems);
    setSelectedItems(items);
    setSelectedCount(items.length);
  }, []);

  useEffect(() => {
    if (selectedCount >= 7) {
      toast.warning("タグの選択数が上限になりました。<br>6個まで選択可能です", {
        description: `選択中: <b>${selectedItems.join(", ")}</b>`,
      });
    }
  }, [selectedCount, selectedItems]);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: string
  ) => {
    if (e.target.checked) {
      if (selectedCount < 6) {
        setCheckedItems((prev) => ({ ...prev, [item]: true }));
        setSelectedItems((prev) => [...prev, item]);
        setSelectedCount(selectedCount + 1);
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedItems.length > 0) {
      params.set("selectedItems", selectedItems.join(","));
    } else {
      params.delete("selectedItems");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [selectedItems]);

  if (isLoading) {
    console.table(recruitData);
  }

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
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{description}</p>
      </hgroup>
      <div className="mt-2 mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item, index) => (
          <div key={index} className="flex w-full items-center gap-2">
            <input
              type="checkbox"
              id={`${prefix}-${index + 1}`}
              className="hidden peer"
              checked={!!checkedItems[item]}
              value={item}
              onChange={(e) => handleCheckboxChange(e, item)}
            />
            <label
              htmlFor={`${prefix}-${index + 1}`}
              className="select-none cursor-pointer w-full flex items-center justify-center rounded-lg border-2 border-gray-200 py-3 px-6 font-bold text-gray-700 transition-colors duration-200 ease-in-out peer-checked:bg-gray-200 peer-checked:text-gray-900 peer-checked:border-gray-200"
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
    </>
  );
}
