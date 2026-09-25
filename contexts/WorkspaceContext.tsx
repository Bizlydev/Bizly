import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Workspace } from '../types';

interface WorkspaceContextType {
  workspace: Workspace | null;
  isManager: boolean;
  loading: boolean;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: null,
  isManager: false,
  loading: true,
  refreshWorkspace: async () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadWorkspace() {
    if (!profile?.workspaceId) {
      setWorkspace(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', profile.workspaceId)
      .single();
    setWorkspace(data);
    setLoading(false);
  }

  useEffect(() => {
    loadWorkspace();
  }, [profile?.workspaceId]);

  const isManager = profile?.role === 'manager';

  return (
    <WorkspaceContext.Provider
      value={{ workspace, isManager, loading, refreshWorkspace: loadWorkspace }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
