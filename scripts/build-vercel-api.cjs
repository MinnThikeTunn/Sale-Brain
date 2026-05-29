/**
 * Bundle api/handler.ts + server.ts into api/index.js for Vercel serverless.
 * Vercel only invokes api/index for /api/* when routes rewrite to /api/index.
 */
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const outFile = path.join(__dirname, "..", "api", "index.js");

esbuild.buildSync({
  entryPoints: [path.join(__dirname, "vercel-handler.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile: outFile,
  packages: "external",
  sourcemap: true,
  logLevel: "info",
});

console.log("[build-vercel-api] Wrote", outFile);
