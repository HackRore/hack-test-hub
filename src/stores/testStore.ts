import { create } from 'zustand';

export type TestStatus = 'pending' | 'running' | 'pass' | 'fail' | 'partial';

export interface TestResult {
  id: string;
  name: string;
  status: TestStatus;
  score?: number;
  details?: string;
  timestamp?: Date;
}

interface TestStore {
  results: Record<string, TestResult>;
  setResult: (id: string, result: Partial<TestResult>) => void;
  clearResults: () => void;
  getHealthScore: () => number;
}

export const useTestStore = create<TestStore>((set, get) => ({
  results: {},
  
  setResult: (id, result) => set((state) => ({
    results: {
      ...state.results,
      [id]: {
        ...state.results[id],
        id,
        ...result,
        timestamp: new Date(),
      } as TestResult,
    },
  })),
  
  clearResults: () => set({ results: {} }),
  
  getHealthScore: () => {
    const results = Object.values(get().results);
    if (results.length === 0) return 0;
    
    const passCount = results.filter(r => r.status === 'pass').length;
    const partialCount = results.filter(r => r.status === 'partial').length;
    
    return Math.round(((passCount + partialCount * 0.5) / results.length) * 100);
  },
}));
