import { copyFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, "../node_modules/devicon/fonts/devicon.woff");
const destDir = resolve(__dirname, "../static/fonts/devicon");
const dest = resolve(destDir, "devicon.woff");

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
