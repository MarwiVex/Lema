import useSWR from 'swr';
import type { FolderSummary } from '@/lib/types/ast';

const EMPTY_FOLDERS: FolderSummary[] = [];

const fetcher = (url: string): Promise<FolderSummary[]> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Error al obtener datos');
    return res.json();
  });

export function useFolders() {
  const { data, error, isLoading, mutate } = useSWR<FolderSummary[]>('/api/folders', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 10000,
  });

  return {
    folders: data ?? EMPTY_FOLDERS,
    isLoading,
    isError: error,
    mutate,
  };
}
