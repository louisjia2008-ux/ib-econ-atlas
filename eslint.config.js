import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "output/**",
      "playwright-report/**",
      "test-results/**",
      "src/generated/**",
      "worker/generated/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: ["src/**/*.tsx"],
    ...reactRefresh.configs.vite,
  },
);
