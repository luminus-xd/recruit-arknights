import type { ChangeEvent } from "react";

import Checkbox from "@/components/checkbox";

interface CheckboxGroupProps {
  title: string;
  description: string;
  items: readonly string[];
  prefix: string;
  checkedItems: { [key: string]: boolean };
  onCheckboxChange: (e: ChangeEvent<HTMLInputElement>, item: string) => void;
}

export function CheckboxGroup({
  title,
  description,
  items,
  prefix,
  checkedItems,
  onCheckboxChange,
}: CheckboxGroupProps) {
  return (
    <>
      <hgroup className="flex items-center gap-3">
        <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
        <p className="mt-1 font-bold tracking-tight text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </hgroup>
      <div className="mt-2 mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
        {items.map((item, index) => (
          <Checkbox
            key={`${prefix}-${item}`}
            id={`${prefix}-${index + 1}`}
            checked={!!checkedItems[item]}
            onChange={(e) => onCheckboxChange(e, item)}
            label={item}
          />
        ))}
      </div>
    </>
  );
}
