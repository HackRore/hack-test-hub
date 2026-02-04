import { create } from 'zustand';

const useStore = create((set) => ({
    // Keyboard Tester State
    keyHistory: [],
    addKeyToHistory: (key) => set((state) => ({
        keyHistory: [...state.keyHistory, key].slice(-50) // Keep last 50
    })),
    clearKeyHistory: () => set({ keyHistory: [] }),

    // Navigation State
    activeTool: null, // null = Dashboard, string = tool ID
    setActiveTool: (toolId) => set({ activeTool: toolId }),

    // Battery Health State (Manual Input Persistence)
    batteryStats: {
        designCapacity: 48944,
        fullChargeCapacity: 28029,
        cycleCount: null,
    },
    setBatteryStats: (stats) => set({ batteryStats: stats }),

    // Theme/Settings (Future proofing)
    soundEnabled: true,
    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

    // QC Wizard State
    qcResults: {}, // { testId: 'pass' | 'fail' | null }
    setQCResult: (id, status) => set((state) => ({
        qcResults: { ...state.qcResults, [id]: status }
    })),
    resetQC: () => set({ qcResults: {}, wizardStep: 0 }),
    wizardStep: 0,
    setWizardStep: (step) => set({ wizardStep: step }),
}));

export default useStore;
