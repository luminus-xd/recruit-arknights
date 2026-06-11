import type { ReactNode } from "react";

interface SelectedTagsProps {
  selectedItems: string[];
  modeControls?: ReactNode;
}

export function SelectedTags({ selectedItems, modeControls }: SelectedTagsProps) {
  return (
    <div className="mt-8">
      <hgroup className="flex items-center gap-3">
        <h2 className="text-3xl font-extrabold tracking-tight">Result</h2>
        <p className="mt-1 font-bold tracking-tight text-gray-500 dark:text-gray-400">
          結果
        </p>
      </hgroup>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        オペレーターのアイコンクリックで白Wikiに遷移します
      </p>
      {modeControls}
      {selectedItems.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold">選択されたタグ</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <li
                key={item}
                className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-700 dark:bg-gray-300 dark:text-stone-950"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
