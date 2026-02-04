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
    // Persisted to localStorage to ensure machine-specific battery data survivors refreshes
    batteryStats: JSON.parse(localStorage.getItem('hackrore_battery_meta')) || {
        designCapacity: 0,
        fullChargeCapacity: 0,
        cycleCount: 0,
    },
    setBatteryStats: (stats) => set((state) => {
        const newData = { ...state.batteryStats, ...stats };
        localStorage.setItem('hackrore_battery_meta', JSON.stringify(newData));
        return { batteryStats: newData };
    }),

    // Theme/Settings (Future proofing)
    soundEnabled: true,
    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

    // Storage Metadata Persistence (Manual Tech Input)
    // Persisted to localStorage to ensure machine-specific data survives refreshes
    storageMetadata: JSON.parse(localStorage.getItem('hackrore_storage_meta')) || {
        brand: '',
        busType: 'NVMe',
        healthPercent: 100,
        observedCapacity: '',
        peakActiveTime: 0,
        avgResponseTime: 0,
    },
    setStorageMetadata: (metadata) => set((state) => {
        const newData = { ...state.storageMetadata, ...metadata };
        localStorage.setItem('hackrore_storage_meta', JSON.stringify(newData));
        return { storageMetadata: newData };
    }),

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
