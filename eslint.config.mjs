import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
// dirname used for potential future path-based ignoring — kept intentionally
void dirname(__filename);

const baseConfigs = [
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    ...js.configs.recommended,
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // Node.js globals
        console: "readonly",
        process: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        exports: "readonly",
        Buffer: "readonly",
        global: "readonly",
        // Web Fetch API
        Response: "readonly",
        Request: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        fetch: "readonly",
        Headers: "readonly",
        FormData: "readonly",
        File: "readonly",
        Blob: "readonly",
        XMLHttpRequest: "readonly",
        AbortController: "readonly",
        // Browser globals (used in 'use client' components)
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        location: "readonly",
        history: "readonly",
        crypto: "readonly",
        alert: "readonly",
        confirm: "readonly",
        prompt: "readonly",
        MutationObserver: "readonly",
        ResizeObserver: "readonly",
        IntersectionObserver: "readonly",
        // Timer globals (available in both Node and browser)
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        // Test globals
        jest: "readonly",
        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        afterAll: "readonly",
        beforeAll: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      "@next/next": nextPlugin,
      "react": reactPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...(nextPlugin.configs?.recommended?.rules || {}),
      ...(nextPlugin.configs?.["core-web-vitals"]?.rules || {}),
      ...(reactPlugin.configs?.recommended?.rules || {}),
      ...(hooksPlugin.configs?.recommended?.rules || {}),
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off"
    },
  },
];

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "*.env",
      "*.env.*",
      ".env",
      ".env.*",
      "**/.env",
      "**/.env.*",
      "scripts/**",
      "manual_tests/**",
      "test-*.js",
      "test-*.cjs",
      "testRegister.js",
      "server.js",
      "reactbits-repo/**",
      "playground-*.js",
      "lib/mongodb.js",
      "lib/startup-check.js",
      "lib/env.js",
      "testsprite_tests/**",
      "__tests__/**",
      "*.bak",
    ],
  },
  ...baseConfigs,
  {
    rules: {
      // Enforce consistent error handling
      "no-console": "off",

      // React hooks — warn instead of error so build doesn't fail on legacy code
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/set-state-in-effect": "off",

      // Enforce proper async/await usage
      "no-async-promise-executor": "error",
      "no-await-in-loop": "warn",

      // Security-related rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // Code quality — warn instead of error to allow gradual cleanup
      "prefer-const": "warn",
      "no-var": "warn",
      "eqeqeq": ["warn", "always"],
      "curly": "off",
      "no-duplicate-imports": "error",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-undef": "error",
      "no-empty": "warn",
      "no-case-declarations": "warn",
      "no-dupe-keys": "error",

      // Best practices for error handling
      "handle-callback-err": "error",

      // Import organization
      "sort-imports": "off"
    }
  }
];

export default eslintConfig;
