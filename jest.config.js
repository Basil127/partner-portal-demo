module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/app/backend/tests', '<rootDir>/app/frontend/tests'],
	testMatch: ['**/tests/**/*.test.ts'],
	collectCoverageFrom: [
		'app/backend/src/**/*.ts',
		'!app/backend/src/**/*.d.ts',
		'!app/backend/src/index.ts',
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/app/backend/src/$1',
	},
};
