import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

export default createJestConfig({
  setupFiles: ["<rootDir>/jest.polyfill.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // keeps your path aliases working
  },
  transform: { "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }] },
});
