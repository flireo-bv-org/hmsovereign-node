// Typechecks the TypeScript examples in README.md against the source.
// Run with `npm run check:readme`.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const outDir = new URL(".readme-check/", root);
const readme = readFileSync(new URL("README.md", root), "utf8");
const blocks = [...readme.matchAll(/```typescript\r?\n([\s\S]*?)```/g)].map((match) => match[1]);
if (blocks.length === 0) {
  throw new Error("No TypeScript examples found in README.md");
}

// Values the examples take from the reader's own code.
const prelude = [
  "declare const rawBody: string;",
  "declare const signatureHeader: string;",
  "declare const timestampHeader: string;",
].join("\n");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir);
blocks.forEach((code, index) => {
  writeFileSync(new URL(`example-${index + 1}.ts`, outDir), `${prelude}\n${code}\nexport {};\n`);
});
writeFileSync(
  new URL("tsconfig.json", outDir),
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "bundler",
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        types: ["node"],
        paths: { hmsovereign: ["../src/index.ts"] },
      },
      include: ["*.ts"],
    },
    null,
    2,
  ),
);

const require = createRequire(import.meta.url);
const tsc = require.resolve("typescript/bin/tsc");
try {
  execFileSync(process.execPath, [tsc, "-p", fileURLToPath(new URL("tsconfig.json", outDir))], {
    stdio: "inherit",
  });
  console.log(`README examples typecheck (${blocks.length} blocks)`);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
