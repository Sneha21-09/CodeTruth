"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * State persisted in localStorage. Starts with the initial value on both server and
 * first client render (avoids hydration mismatch), then hydrates from storage.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const initialRef = useRef(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupt or blocked storage */
    }
    setReady(true);
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* storage full or blocked: keep in-memory state */
        }
        return resolved;
      });
    },
    [key],
  );

  const reset = useCallback(() => set(initialRef.current), [set]);
  return [value, set, ready, reset] as const;
}
