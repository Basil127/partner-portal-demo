import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
	dir: './',
});

const customJestConfig = {
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
	moduleNameMapper: {
		'^@/icons/index$': '<rootDir>/tests/__mocks__/iconsMock.tsx',
		'^@/(.*)$': '<rootDir>/src/$1',
		'^next/image$': '<rootDir>/tests/__mocks__/nextImageMock.tsx',
		'^next/link$': '<rootDir>/tests/__mocks__/nextLinkMock.tsx',
		'\\.svg$': '<rootDir>/tests/__mocks__/svgMock.tsx',
	},
	testMatch: ['**/tests/**/*.test.ts?(x)'],
};

export default createJestConfig(customJestConfig);
