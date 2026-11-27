'use client';

import { useEffect } from 'react';
import { SWRConfig, useSWRConfig } from 'swr';
import Dashboard from '@/components/dashboard/Dashboard';
import type { FolderSummary } from '@/lib/types/ast';

function FolderCacheSync({ initialFolders }: { initialFolders: FolderSummary[] }) {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    mutate('/api/folders', initialFolders, { revalidate: false });
  }, [initialFolders, mutate]);

  return null;
}

export default function ClientPage({ initialFolders = [] }: { initialFolders?: FolderSummary[] }) {
  return (
    <SWRConfig
      value={{
        fallback: { '/api/folders': initialFolders },
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 10000,
      }}
    >
      <FolderCacheSync initialFolders={initialFolders} />
      <Dashboard />
    </SWRConfig>
  );
}
