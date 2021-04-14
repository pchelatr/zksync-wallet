module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: ["@nuxtjs/eslint-config-typescript", "eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  rules: {
    // enable additional rules
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    camelcase: "off",
    semi: ["error", "always"],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "no-console": "off",
    "@typescript-eslint/no-empty-function": ["off"],
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module",
    ecmaFeatures: {
      jsx: false,
    },

    extraFileExtensions: ["*.vue", ".*.vue"],
  },
};
