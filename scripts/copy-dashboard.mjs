import { cp, mkdir, rm, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "dist");
const destination = path.join(root, "esp32", "data");

if (!(await stat(path.join(source, "index.html")).catch(() => null))) {
  throw new Error("Vite build not found. Run this script after `npm run build:esp32`.");
}

await rm(destination, { recursive: true, force: true });
await mkdir(path.dirname(destination), { recursive: true });
await cp(source, destination, { recursive: true });
console.log(`Copied dashboard files to ${path.relative(root, destination)}.`);
