import baseConfig from "../../eslint.config.mjs";
import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...baseConfig,
    ...compat.extends("next/core-web-vitals"),
    {
        files: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
        rules: {
            // Frontend specific overrides
            "@next/next/no-html-link-for-pages": "off", // Sometimes needed for external links or if not using standard layout
            "no-console": "warn", // Keep console as warning in frontend
        },
    },
];
