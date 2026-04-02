import { useCallback, useEffect, useState } from 'react';
import { getLibrarySnapshot, LibraryData, subscribeToLibrary } from '@/services/libraryStore';

export function useLibrary(): LibraryData {
  const [snapshot, setSnapshot] = useState<LibraryData>(getLibrarySnapshot);

  const refresh = useCallback(() => {
    setSnapshot({ ...getLibrarySnapshot() });
  }, []);

  useEffect(() => {
    const unsub = subscribeToLibrary(refresh);
    return unsub;
  }, [refresh]);

  return snapshot;
}
