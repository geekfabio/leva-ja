module.exports = {
  preset: "jest-expo",
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  setupFiles: ["<rootDir>/jest.env.js", "<rootDir>/jest.setup.ts"],
};
