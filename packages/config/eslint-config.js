module.exports = {
  extends: [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-const": "error"
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "dist/",
    "build/"
  ]
}