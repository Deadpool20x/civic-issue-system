import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const baseConfigs = compat.extends("next/core-web-vitals", "next/typescript").map((config) => ({
  ...config,
  files: config.files ?? ["**/*.{js,jsx,ts,tsx,mjs,cjs}"] ,
}));

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
    ],
  },
  ...baseConfigs,
  {
    rules: {
      // Enforce consistent error handling
      "no-console": ["warn", { allow: ["warn", "error"] }],

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
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-duplicate-imports": "error",

      // Best practices for error handling
      "handle-callback-err": "error",

      // Accessibility
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",

      // Import organization
      "sort-imports": ["error", {
        "ignoreCase": true,
        "ignoreDeclarationSort": true,
        "ignoreMemberSort": false,
        "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
      }]
    }
  }
];
