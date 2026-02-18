import React from "react";

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
}) => (
  <div className="flex w-full items-center gap-2 focus-within:ring-2 focus-within:ring-sky-400 rounded-lg">
    <input
      type="checkbox"
      id={id}
      className="visually-hidden peer"
      checked={checked}
      onChange={onChange}
    />
    <label
      htmlFor={id}
      className="select-none cursor-pointer w-full flex items-center justify-center rounded-lg border-2 border-gray-200 dark:border-gray-500 py-3 px-6 font-bold text-gray-700 dark:text-gray-200 transition-colors duration-200 ease-in-out peer-checked:bg-gray-200 peer-checked:text-gray-900 peer-checked:border-gray-200 dark:peer-checked:bg-secondary dark:peer-checked:text-secondary-foreground dark:peer-checked:border-secondary any-hover:hover:bg-gray-100 any-hover:hover:border-gray-400 any-hover:hover:text-gray-900 dark:any-hover:hover:bg-white/10 dark:any-hover:hover:border-gray-300 dark:any-hover:hover:text-white"
    >
      <span>{label}</span>
    </label>
  </div>
);

export default React.memo(Checkbox);
