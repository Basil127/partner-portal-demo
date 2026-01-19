import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

/** @type {import('eslint').Linter.Config[]} */
export const baseConfig = [
    {
        ignores: ["**/node_modules/", "**/dist/", "**/.next/", "**/out/", "**/*.config.js"],
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },

            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        plugins: {
            "@typescript-eslint": typescriptEslint,
        },

        rules: {
            ...js.configs.recommended.rules,
            ...typescriptEslint.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "warn",

            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
            }],

            "no-console": ["warn", {
                allow: ["warn", "error"],
            }],
        },
    },
    // Backend Overrides
    {
        files: ["app/backend/src/**/*.ts"],
        rules: {
            "no-console": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
    // Frontend Overrides
    {
        files: ["app/frontend/src/**/*.{ts,tsx}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                React: "writable",
            },
        },
        rules: {
            "no-console": "warn",
        },
    },
    // Test Overrides
    {
        files: ["tests/**/*.ts", "app/backend/src/**/*.test.ts"],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
];

export default baseConfig;