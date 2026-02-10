import baseConfig from '../../eslint.config.mjs';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	...baseConfig,
	{
		files: ['src/**/*.ts', 'tests/**/*.ts'],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
				describe: 'readonly',
				it: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				jest: 'readonly',
			},
		},
		rules: {
			// Backend specific overrides
			'no-console': 'off', // Allow console logging in backend for simplicity/debugging
			'@typescript-eslint/no-explicit-any': 'off', // Sometimes needed for DB rows or untyped libraries
		},
	},
	{
		files: ['src/scripts/**/*.ts'],
		rules: {
			'no-console': 'off', // Scripts definitely need console for output
		},
	},
];
