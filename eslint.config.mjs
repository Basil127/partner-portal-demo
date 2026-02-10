import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

/** @type {import('eslint').Linter.Config[]} */
export const baseConfig = [
	{
		ignores: [
			'**/node_modules/',
			'**/dist/',
			'**/.next/',
			'**/out/',
			'**/*.config.js',
			'**/*.config.ts',
			'**/*.d.ts',
			'base-admin-dashboard/**',
		],
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				RequestInit: 'readonly',
				BodyInit: 'readonly',
			},

			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',

			parserOptions: {
				project: './tsconfig.json',
			},
		},

		plugins: {
			'@typescript-eslint': typescriptEslint,
		},

		rules: {
			...js.configs.recommended.rules,
			...typescriptEslint.configs.recommended.rules,
			'@typescript-eslint/no-explicit-any': 'warn',

			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],

			'no-console': [
				'warn',
				{
					allow: ['warn', 'error'],
				},
			],
		},
	},
	// Generated client code overrides
	{
		files: ['**/*.gen.ts', '**/*.gen.tsx'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
		},
	},
	// Backend Overrides
	{
		files: ['app/backend/src/**/*.ts', 'app/backend/tests/**/*.ts', 'src/**/*.ts', 'tests/**/*.ts'],
		rules: {
			'no-console': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	// Frontend Overrides
	{
		files: [
			'app/frontend/src/**/*.{ts,tsx}',
			'app/frontend/tests/**/*.{ts,tsx}',
			'src/**/*.{ts,tsx}',
			'tests/**/*.{ts,tsx}',
		],
		languageOptions: {
			globals: {
				...globals.browser,
				React: 'writable',
			},
		},
		rules: {
			'no-console': 'warn',
		},
	},
	// Test Overrides
	{
		files: [
			'app/backend/tests/**/*.ts',
			'app/frontend/tests/**/*.ts',
			'**/tests/**/*.ts',
			'**/tests/**/*.tsx',
			'**/*.test.ts',
			'**/*.test.tsx',
			'**/*.spec.ts',
			'**/*.spec.tsx',
		],
		languageOptions: {
			globals: {
				...globals.jest,
				...globals.node,
				// Core Jest/Jasmine globals
				describe: 'readonly',
				it: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
				jest: 'readonly',
				test: 'readonly',
				expect: 'readonly',
				fit: 'readonly',
				fdescribe: 'readonly',
				xit: 'readonly',
				xdescribe: 'readonly',
				xtest: 'readonly',
			},
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
];

export default baseConfig;
