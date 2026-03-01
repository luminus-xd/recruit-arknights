import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AllTag } from "@/lib/utils";
import { allTags, isValidTag } from "@/lib/utils";
import { parseAsArrayOf, parseAsStringLiteral, useQueryState } from "nuqs";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const selectedItemsParser = parseAsArrayOf(
  parseAsStringLiteral(allTags)
).withDefault([] as AllTag[]);

export const useCheckboxState = () => {
  const [selectedItemsRaw, setSelectedItemsRaw] = useQueryState(
    "selectedItems",
    selectedItemsParser
  );

  const isHydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const selectedItems = useMemo(() => {
    if (!isHydrated) {
      return [] as AllTag[];
    }

    return selectedItemsRaw ?? [];
  }, [isHydrated, selectedItemsRaw]);

  const checkedItems = useMemo(() => {
    return selectedItems.reduce<Record<string, boolean>>((acc, item) => {
      acc[item] = true;
      return acc;
    }, {});
  }, [selectedItems]);

  const setSelectedItems = useCallback<Dispatch<SetStateAction<string[]>>>(
    (valueOrUpdater) => {
      setSelectedItemsRaw((prev) => {
        const base = prev ?? [];
        const next =
          typeof valueOrUpdater === "function"
            ? valueOrUpdater([...base])
            : valueOrUpdater;

        const sanitized = next
          .filter((item): item is AllTag => isValidTag(item))
          .filter((item, index, array) => array.indexOf(item) === index);

        if (sanitized.length === 0) {
          return null;
        }

        return sanitized;
      });
    },
    [setSelectedItemsRaw]
  );

  const clearSelectedItems = useCallback(() => {
    setSelectedItemsRaw(null);
  }, [setSelectedItemsRaw]);

  return {
    checkedItems,
    selectedItems,
    setSelectedItems,
    clearSelectedItems,
    selectedCount: selectedItems.length,
  } as const;
};
