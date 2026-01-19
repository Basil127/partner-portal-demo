import baseConfig from "../../eslint.config.mjs";

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...baseConfig,
    {
        files: ["app/backend/src/**/*.ts"],
        rules: {
            // Backend specific overrides
            "no-console": "off", // Allow console logging in backend for simplicity/debugging
            "@typescript-eslint/no-explicit-any": "off", // Sometimes needed for DB rows or untyped libraries
        }
    },
    {
        files: ["app/backend/src/scripts/**/*.ts"],
        rules: {
            "no-console": "off", // Scripts definitely need console for output
        }
    }
];
