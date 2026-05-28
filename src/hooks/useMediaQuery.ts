import { useSyncExternalStore } from "react";

const mqCache = new Map<string, MediaQueryList>();

function getMQ(query: string): MediaQueryList {
  let mq = mqCache.get(query);
  if (!mq) {
    mq = window.matchMedia(query);
    mqCache.set(query, mq);
  }
  return mq;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = getMQ(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => getMQ(query).matches,
    () => false,
  );
}
