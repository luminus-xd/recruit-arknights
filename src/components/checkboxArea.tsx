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

  useEffect(() => {
    if (selectedCount === 7) {
      toast.warning("タグの選択数が上限になりました", {
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
        toast.warning("タグの選択数が上限になりました", {
          description: "タグの選択は6個までです",
        });
      }
    } else {
      setCheckedItems((prev) => ({ ...prev, [key]: false }));
      setSelectedCount(selectedCount - 1);
    }
  };

  if (recruitData) {
    console.table(recruitData);
  }

  return (
    <>
      <hgroup className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">Type</h2>
        <p className="mt-1 text-gray-500 dark:text-gray-400">職分</p>
      </hgroup>
      <div className="mt-2 mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {types.map((type, index) => (
          <div key={index} className="flex w-full items-center gap-2">
            <input
              type="checkbox"
              id={`type-${index + 1}`}
              className="hidden peer"
              checked={!!checkedItems[`type-${index + 1}`]}
              value={type}
              onChange={(e) => handleCheckboxChange(e, `type-${index + 1}`)}
            />
            <label
              htmlFor={`type-${index + 1}`}
              className="select-none cursor-pointer w-full flex items-center justify-center rounded-lg border-2 border-gray-200 py-3 px-9 font-bold text-gray-700 transition-colors duration-200 ease-in-out peer-checked:bg-gray-200 peer-checked:text-gray-900 peer-checked:border-gray-200"
            >
              <span>{type}</span>
            </label>
          </div>
        ))}
      </div>

      <hgroup className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">Position</h2>
        <p className="text-gray-500 dark:text-gray-400">位置</p>
      </hgroup>
      <div className="mt-2 mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {positions.map((position, index) => (
          <div key={index} className="flex w-full items-center gap-2">
            <input
              type="checkbox"
              id={`position-${index + 1}`}
              className="hidden peer"
              checked={!!checkedItems[`position-${index + 1}`]}
              value={position}
              onChange={(e) => handleCheckboxChange(e, `position-${index + 1}`)}
            />
            <label
              htmlFor={`position-${index + 1}`}
              className="select-none cursor-pointer w-full flex items-center justify-center rounded-lg border-2 border-gray-200 py-3 px-6 font-bold text-gray-700 transition-colors duration-200 ease-in-out peer-checked:bg-gray-200 peer-checked:text-gray-900 peer-checked:border-gray-200"
            >
              <span>{position}</span>
            </label>
          </div>
        ))}
      </div>

      <hgroup className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">Tag</h2>
        <p className="text-gray-500 dark:text-gray-400">タグ</p>
      </hgroup>
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
              className="select-none cursor-pointer w-full flex items-center justify-center rounded-lg border-2 border-gray-200 py-3 px-6 font-bold text-gray-700 transition-colors duration-200 ease-in-out peer-checked:bg-gray-200 peer-checked:text-gray-900 peer-checked:border-gray-200"
            >
              <span>{tag}</span>
            </label>
          </div>
        ))}
      </div>
    </>
  );
}
