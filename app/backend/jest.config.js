export default {
	testEnvironment: 'node',
	roots: ['<rootDir>/tests'],
	testMatch: ['**/tests/**/*.test.ts'],
	collectCoverageFrom: [
		'<rootDir>/src/**/*.ts',
		'!<rootDir>/src/**/*.d.ts',
		'!<rootDir>/src/index.ts',
	],
	coverageDirectory: '<rootDir>/coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	extensionsToTreatAsEsm: ['.ts'],
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: '<rootDir>/tsconfig.jest.json',
			},
		],
	},
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@partner-portal/shared$': '<rootDir>/../../packages/shared/src/index.ts',
	},
};
