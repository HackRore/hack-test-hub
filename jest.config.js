export default {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    moduleNameMapper: {
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
        'lucide-react': '<rootDir>/__mocks__/lucide-react.js',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(lucide-react|zustand|clsx|tailwind-merge)/)'
    ],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};
