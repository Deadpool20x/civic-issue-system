import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baseConfigs = [
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    ...js.configs.recommended,
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
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
      "test-*.js",
      "test-*.cjs",
      "server.js",
      "reactbits-repo/**",
      "playground-*.js",
      "lib/mongodb.js",
      "lib/startup-check.js",
      "lib/env.js",
    ],
  },
  ...baseConfigs,
  {
    rules: {
      // Enforce consistent error handling
      "no-console": "off",

      // Prevent common React issues
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",

      // Enforce proper async/await usage
      "no-async-promise-executor": "error",
      "no-await-in-loop": "warn",

      // Security-related rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // Code quality rules
      "prefer-const": "warn",
      "no-var": "warn",
      "eqeqeq": ["error", "always"],
      "curly": "warn",
      "no-duplicate-imports": "error",

      // Best practices for error handling
      "handle-callback-err": "error",

      // Accessibility (only if jsx-a11y plugin is available)
      // "jsx-a11y/alt-text": "error",
      // "jsx-a11y/anchor-has-content": "error",

      // Import organization
      "sort-imports": "off"
    }
  }
];

export default eslintConfig;
