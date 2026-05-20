'use client';

import React from 'react';

export type CoordinatorAPI = {
  isPinnedElsewhere: (id: string) => boolean;
  setPinned: (id: string) => void;
  clearPinnedIf: (id: string) => void;
  notifyActivated: (id: string) => void;
  subscribe: (cb: (id: string) => void) => () => void;
};

export const ProjectThumbContext = React.createContext<CoordinatorAPI | null>(null);

export const ProjectThumbProvider = ({ children }: { children: React.ReactNode }) => {
  const stateRef = React.useRef<{
    pinnedId: string | null;
    listeners: Set<(id: string) => void>;
  }>({ pinnedId: null, listeners: new Set() });

  const api = React.useMemo<CoordinatorAPI>(
    () => ({
      isPinnedElsewhere: (id) => {
        const p = stateRef.current.pinnedId;
        return p !== null && p !== id;
      },
      setPinned: (id) => {
        stateRef.current.pinnedId = id;
      },
      clearPinnedIf: (id) => {
        if (stateRef.current.pinnedId === id) stateRef.current.pinnedId = null;
      },
      notifyActivated: (id) => stateRef.current.listeners.forEach((cb) => cb(id)),
      subscribe: (cb) => {
        stateRef.current.listeners.add(cb);
        return () => stateRef.current.listeners.delete(cb);
      },
    }),
    []
  );

  return <ProjectThumbContext.Provider value={api}>{children}</ProjectThumbContext.Provider>;
};

export const useCoordinator = (): CoordinatorAPI => {
  const ctx = React.useContext(ProjectThumbContext);
  if (!ctx) throw new Error('ProjectThumb must be inside <ProjectThumbProvider>');
  return ctx;
};
