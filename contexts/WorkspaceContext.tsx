import { createContext, useMemo, useState, type PropsWithChildren } from 'react';

export type Workspace = { id: string; name: string; role?: 'owner' | 'admin' | 'manager' | 'employee' };

type WorkspaceContextValue = {
  workspace: Workspace | null;
  setWorkspace: (workspace: Workspace | null) => void;
};

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const value = useMemo(() => ({ workspace, setWorkspace }), [workspace]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
