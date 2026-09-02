import { defineConfig } from "vitest/config";

// An SDK is mostly types, and until now nothing checked them: `tsc --noEmit` reads
// the build config (src only) and vitest transpiles tests without typechecking. A
// wrong parameter type could therefore ship with a full green suite. Turning the
// typecheck runner on makes tests/**/*.test-d.ts real, failing-by-default tests
// under the plain `vitest run` everyone already uses.
export default defineConfig({
  test: {
    typecheck: {
      enabled: true,
      tsconfig: "./tsconfig.typecheck.json",
      include: ["tests/**/*.test-d.ts"],
    },
  },
});
