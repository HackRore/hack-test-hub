import '@testing-library/jest-dom';

// Mocks
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock AudioContext
window.AudioContext = jest.fn().mockImplementation(() => ({
    createOscillator: () => ({
        start: jest.fn(),
        stop: jest.fn(),
        connect: jest.fn(),
        frequency: { setValueAtTime: jest.fn() },
        type: 'sine',
        disconnect: jest.fn(),
    }),
    createGain: () => ({
        gain: { setValueAtTime: jest.fn() },
        connect: jest.fn(),
    }),
    createStereoPanner: () => ({
        pan: { value: 0 },
        connect: jest.fn(),
    }),
    createAnalyser: () => ({
        fftSize: 2048,
        frequencyBinCount: 1024,
        getByteFrequencyData: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
    }),
    createMediaStreamSource: () => ({
        connect: jest.fn(),
    }),
    close: jest.fn(),
    currentTime: 0,
    destination: {},
}));

// Mock Navigator APIs
Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
        getUserMedia: jest.fn().mockResolvedValue({
            getTracks: () => [{ stop: jest.fn() }],
            getVideoTracks: () => [{ getSettings: () => ({}), getCapabilities: () => ({}) }],
            getAudioTracks: () => [{ getSettings: () => ({}), getCapabilities: () => ({}) }],
        }),
    },
    writable: true,
});

Object.defineProperty(global.navigator, 'userAgent', {
    value: 'Test User Agent',
    writable: true,
});

Object.defineProperty(global.navigator, 'hardwareConcurrency', {
    value: 8,
    writable: true,
});

// Mock Canvas
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillStyle: '',
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    clearRect: jest.fn(),
    scale: jest.fn(),
    translate: jest.fn(),
}));

// Mock LocalStorage
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: function (key) {
            return store[key] || null;
        },
        setItem: function (key, value) {
            store[key] = value.toString();
        },
        removeItem: function (key) {
            delete store[key];
        },
        clear: function () {
            store = {};
        }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
