import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { isMockApiEnabled, setMockApiOverride } from '@/lib/config';

interface DemoModeContextType {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType>({
  isDemoMode: isMockApiEnabled(),
  setDemoMode: () => {},
  toggleDemoMode: () => {},
});

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => isMockApiEnabled());

  useEffect(() => {
    setMockApiOverride(isDemoMode);
  }, [isDemoMode]);

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => {
      const next = !prev;
      setMockApiOverride(next);
      return next;
    });
  }, []);

  const handleSetDemoMode = useCallback((enabled: boolean) => {
    setMockApiOverride(enabled);
    setIsDemoMode(enabled);
  }, []);

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        setDemoMode: handleSetDemoMode,
        toggleDemoMode,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemoMode(): DemoModeContextType {
  return useContext(DemoModeContext);
}
