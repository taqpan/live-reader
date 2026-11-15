import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
    {
        ignores: [".output/**", ".wxt/**", "node_modules/**", "coverage/**"],
    },
    js.configs.recommended,
    tseslint.configs.recommended,
    pluginVue.configs["flat/recommended"],
    {
        files: ["**/*.{ts,vue}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.webextensions,
            },
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: [".vue"],
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/consistent-type-imports": "error",
            "vue/html-indent": ["warn", 4],
            "vue/multi-word-component-names": "off",
            "no-console": "warn",
        },
    },
    {
        files: ["*.config.{js,ts}"],
        languageOptions: {
            globals: globals.node,
        },
    },
);
