import { useCallback, useSyncExternalStore } from "react";

const LOCAL_STORAGE_STATE_EVENT = "local-storage-state";

/**
 * localStorage と同期する状態値。
 * SSR と hydration 中は defaultValue を返し、クライアント確定後に保存値へ追従する。
 */
export function useLocalStorageState<T extends string>(
  key: string,
  defaultValue: T,
  validate: (value: string) => value is T,
): [T, (value: T) => void] {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === key) {
          onStoreChange();
        }
      };
      const handleLocalChange = (event: Event) => {
        const detail = (event as CustomEvent<{ key: string }>).detail;
        if (detail?.key === key) {
          onStoreChange();
        }
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener(LOCAL_STORAGE_STATE_EVENT, handleLocalChange);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(LOCAL_STORAGE_STATE_EVENT, handleLocalChange);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    const stored = window.localStorage.getItem(key);
    return stored !== null && validate(stored) ? stored : defaultValue;
  }, [defaultValue, key, validate]);

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setAndStore = useCallback(
    (next: T) => {
      window.localStorage.setItem(key, next);
      window.dispatchEvent(
        new CustomEvent(LOCAL_STORAGE_STATE_EVENT, { detail: { key } }),
      );
    },
    [key],
  );

  return [value, setAndStore];
}
