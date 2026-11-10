// Build setup adapted from dsh-kaitu-fortune (MIT, Copyright 2026 Guo Yihong).
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WorkspaceTypertGenerator } from "@deepseek-ai/dsh-typert-generator";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const modules = resolve(root, "node_modules");
const linkModules = (directory) => symlinkSync(modules, directory, process.platform === "win32" ? "junction" : "dir");

// Analyze the adapter and two SDK declaration packages in a temporary workspace.
const analysis = mkdtempSync(join(tmpdir(), "auday-typert-"));
try {
  const pkg = resolve(analysis, "packages/kaitu-auday");
  const sdk = ["dsh-typert-protocol", "dsh-typert-registry"];
  mkdirSync(resolve(pkg, "lib"), { recursive: true });
  cpSync(resolve(root, "adapters/dsh"), resolve(pkg, "src"), {
    recursive: true,
    filter: (path) => !path.replaceAll("\\", "/").includes("/client"),
  });
  // The generator resolves lib exports back to their matching source entry.
  const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  const { "./client": _client, ...exports } = manifest.exports;
  manifest.exports = { ...exports, ".": "./lib/service.js" };
  writeFileSync(resolve(pkg, "package.json"), JSON.stringify(manifest));
  writeFileSync(resolve(pkg, "lib/typert.host.d.ts"), "export declare const TYPERT: unknown;\n");
  linkModules(resolve(pkg, "node_modules"));
  for (const name of sdk) {
    const dir = resolve(analysis, "packages", name);
    cpSync(resolve(modules, `@deepseek-ai/${name}/lib/types`), resolve(dir, "src"), { recursive: true });
    writeFileSync(
      resolve(dir, "package.json"),
      JSON.stringify({ name: `@deepseek-ai/${name}`, exports: { ".": "./src/index.d.ts" } }),
    );
    linkModules(resolve(dir, "node_modules"));
  }
  const options = JSON.parse(readFileSync(resolve(root, "tsconfig.json"), "utf8"));
  options.compilerOptions.noEmit = false;
  options.compilerOptions.declaration = true;
  options.compilerOptions.paths = Object.fromEntries(
    sdk.map((name) => [`@deepseek-ai/${name}`, [resolve(analysis, "packages", name, "src/index.d.ts")]]),
  );
  writeFileSync(
    resolve(analysis, "tsconfig.base.json"),
    JSON.stringify({ compilerOptions: options.compilerOptions }),
  );
  linkModules(resolve(analysis, "node_modules"));
  for (const dir of [pkg, ...sdk.map((name) => resolve(analysis, "packages", name))])
    writeFileSync(
      resolve(dir, "tsconfig.json"),
      JSON.stringify({
        extends: "../../tsconfig.base.json",
        include: ["src/**/*.ts"],
        exclude: ["src/client"],
      }),
    );
  writeFileSync(
    resolve(analysis, "tsconfig.host.json"),
    JSON.stringify({
      extends: "./tsconfig.base.json",
      files: [],
      references: [{ path: "packages/kaitu-auday" }, ...sdk.map((name) => ({ path: `packages/${name}` }))],
    }),
  );
  for (const artifact of new WorkspaceTypertGenerator(analysis).generate(["kaitu-auday"], ["host"])) {
    mkdirSync(resolve(root, "lib"), { recursive: true });
    writeFileSync(resolve(root, "lib/typert.host.js"), artifact.js);
    writeFileSync(resolve(root, "lib/typert.host.d.ts"), artifact.dts);
    if (artifact.remote) {
      writeFileSync(resolve(root, "lib/typert.remote-client.js"), artifact.remote.js);
      writeFileSync(resolve(root, "lib/typert.remote-client.d.ts"), artifact.remote.dts);
    }
  }
} finally {
  rmSync(analysis, { recursive: true, force: true });
}

await build({ entryPoints: ["adapters/dsh/service.ts"], outfile: "dist/index.js", bundle: true,
  platform: "node", target: "node24.9", format: "esm",
  external: ["@deepseek-ai/cordis", "@deepseek-ai/dsh-typert-protocol"], legalComments: "eof" });
await build({ entryPoints: ["adapters/dsh/client.tsx"], outfile: "dist/client.js", bundle: true,
  plugins: [{ name: "client-zod", setup(build) {
    build.onResolve({ filter: /^zod$/ }, ({ importer }) =>
      resolve(importer) === resolve(root, "lib/typert.remote-client.js")
        ? { path: resolve(root, "adapters/dsh/client-zod.ts") } : undefined);
  } }],
  loader: { ".css": "text" },
  platform: "browser", format: "cjs", jsx: "automatic", target: "es2022", minify: true,
  external: ["react", "react/*", "@deepseek-ai/cordis"], legalComments: "eof",
  banner: { js: 'window.__ModuleLoader__.load({id:"kaitu-auday",factory:(require)=>{var module={exports:{}};var exports=module.exports;' },
  footer: { js: "return module.exports;}});" } });
// Zod's generated function templates contain whitespace-only lines.
const clientArtifact = resolve(root, "dist/client.js");
writeFileSync(clientArtifact, readFileSync(clientArtifact, "utf8").replace(/^[\t ]+$/gm, ""));
