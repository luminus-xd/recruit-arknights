"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function CheckboxArea() {
  const types = [
    "先鋒",
    "前衛",
    "狙撃",
    "術師",
    "重装",
    "医療",
    "補助",
    "特殊",
  ];
  const tags = [
    "近距離",
    "遠距離",
    "初期",
    "火力",
    "生存",
    "防御",
    "治療",
    "支援",
    "範囲攻撃",
    "減速",
    "牽制",
    "弱化",
    "COST回復",
    "強制移動",
    "爆発力",
    "召喚",
    "高速再配置",
    "ロボット",
    "エリート",
    "上級エリート",
  ];

  const [selectedCount, setSelectedCount] = useState(0);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    if (selectedCount === 7) {
      toast.info("タグの選択数が7個目になっています", {
        description: "タグの選択は6個までです",
      });
    }
  }, [selectedCount]);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    if (e.target.checked) {
      if (selectedCount < 6) {
        setCheckedItems((prev) => ({ ...prev, [key]: true }));
        setSelectedCount(selectedCount + 1);
      } else {
        toast.info("タグの選択数が7個目になっています", {
          description: "タグの選択は6個までです",
        });
      }
    } else {
      setCheckedItems((prev) => ({ ...prev, [key]: false }));
      setSelectedCount(selectedCount - 1);
    }
  };

  return (
    <>
      <hgroup className="items-center">
        <h2 className="text-2xl font-bold">Type</h2>
        <p className="mt-1 text-gray-600">職分</p>
      </hgroup>
      <div className="mt-2 mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {types.map((type, index) => (
          <div key={index} className="flex w-full items-center gap-2">
            <input
              type="checkbox"
              id={`type-${index + 1}`}
              className="hidden peer"
              checked={!!checkedItems[`type-${index + 1}`]}
              onChange={(e) => handleCheckboxChange(e, `type-${index + 1}`)}
            />
            <label
              htmlFor={`type-${index + 1}`}
              className="select-none cursor-pointer w-full flex items-center justify-center rounded-lg border-2 border-gray-200
              py-3 px-9 font-bold text-gray-700 transition-colors duration-200 ease-in-out peer-checked:bg-gray-200 peer-checked:text-gray-900 peer-checked:border-gray-200"
            >
              <span>{type}</span>
            </label>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold">Tags</h2>
      <div className="mt-2 mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {tags.map((tag, index) => (
          <div key={index} className="flex w-full items-center gap-2">
            <input
              type="checkbox"
              id={`tag-${index + 1}`}
              className="hidden peer"
              checked={!!checkedItems[`tag-${index + 1}`]}
              onChange={(e) => handleCheckboxChange(e, `tag-${index + 1}`)}
            />
            <label
              htmlFor={`tag-${index + 1}`}
              className="select-none cursor-pointer w-full flex items-center justify-center rounded-lg border-2 border-gray-200
              py-3 px-6 font-bold text-gray-700 transition-colors duration-200 ease-in-out peer-checked:bg-gray-200 peer-checked:text-gray-900 peer-checked:border-gray-200"
            >
              <span>{tag}</span>
            </label>
          </div>
        ))}
      </div>
    </>
  );
}
