// Regenerates tests/fixtures/api-operations.json from the published OpenAPI specification.
// Run with `npm run refresh:api-operations`.
import { writeFileSync } from "node:fs";

const SPEC_URL = "https://doc.voicedock.ai/openapi.bundled.json";
const METHODS = ["get", "post", "put", "patch", "delete"];

const response = await fetch(SPEC_URL);
if (!response.ok) {
  throw new Error(`Could not fetch ${SPEC_URL}: ${response.status}`);
}
const spec = await response.json();

const operations = [];
for (const [path, item] of Object.entries(spec.paths ?? {})) {
  for (const method of METHODS) {
    if (!item[method]) continue;
    const normalizedPath = path.replace(/^\/api\/v1/, "").replace(/\{[^}]+\}/g, "{}");
    operations.push({
      operation: `${method.toUpperCase()} ${normalizedPath}`,
      deprecated: Boolean(item[method].deprecated),
    });
  }
}
operations.sort((a, b) => a.operation.localeCompare(b.operation));

writeFileSync(
  new URL("../tests/fixtures/api-operations.json", import.meta.url),
  JSON.stringify({ source: SPEC_URL, operations }, null, 2) + "\n",
);
console.log(`Wrote ${operations.length} operations`);
