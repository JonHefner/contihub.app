import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = join(root, "public/brand");
const tilesDir = join(brandDir, "tiles");

const products = [
  { id: "contihub", name: "ContiHub" },
  { id: "projects", name: "Projects" },
  { id: "conticrm", name: "ContiCRM" },
  { id: "contifield", name: "ContiField" },
  { id: "conticost", name: "ContiCost" },
  { id: "contisafety", name: "ContiSafety" },
  { id: "contitrak", name: "ContiTraK" },
  { id: "contibid", name: "Conti Bid" },
];

const markInner = `  <defs>
    <linearGradient id="cc-blue" x1="10" y1="6" x2="86" y2="90" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#9cc4f5"/>
      <stop offset="22%" stop-color="#3b6ec4"/>
      <stop offset="55%" stop-color="#1e4fa3"/>
      <stop offset="100%" stop-color="#0a1d4a"/>
    </linearGradient>
    <linearGradient id="cc-blue-hi" x1="18" y1="14" x2="48" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#d7e8ff" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#1e4fa3" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="cc-gold" x1="38" y1="18" x2="90" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fff3c4"/>
      <stop offset="28%" stop-color="#e0c36a"/>
      <stop offset="58%" stop-color="#c9a34a"/>
      <stop offset="100%" stop-color="#6f5a12"/>
    </linearGradient>
    <linearGradient id="cc-gold-hi" x1="52" y1="30" x2="78" y2="58" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fff8d8" stop-opacity=".95"/>
      <stop offset="100%" stop-color="#c9a34a" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path fill="#071433" d="M69.176 25.032 A 37 37 0 1 0 69.176 70.968 L 57.985 62.209 A 23.2 23.2 0 1 1 57.985 33.791 Z" transform="translate(1.4 1.8)"/>
  <path fill="url(#cc-blue)" d="M68.368 25.836 A 36 36 0 1 0 68.368 70.164 L 57.73 61.852 A 22.5 22.5 0 1 1 57.73 34.148 Z"/>
  <path fill="url(#cc-blue-hi)" d="M68.368 25.836 A 36 36 0 1 0 68.368 70.164 L 57.73 61.852 A 22.5 22.5 0 1 1 57.73 34.148 Z"/>
  <path fill="#4a3c0c" d="M74.321 36.144 A 20 20 0 1 0 74.321 61.856 L 67.81 56.392 A 11.5 11.5 0 1 1 67.81 41.608 Z" transform="translate(.7 1)"/>
  <path fill="url(#cc-gold)" d="M73.321 35.144 A 20 20 0 1 0 73.321 60.856 L 66.81 55.392 A 11.5 11.5 0 1 1 66.81 40.608 Z"/>
  <path fill="url(#cc-gold-hi)" d="M73.321 35.144 A 20 20 0 1 0 73.321 60.856 L 66.81 55.392 A 11.5 11.5 0 1 1 66.81 40.608 Z"/>`;

function tileSvg(name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 640" fill="none">
  <defs>
    <linearGradient id="tile-face" x1="256" y1="0" x2="256" y2="640" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#16161a"/>
      <stop offset="100%" stop-color="#0b0b0d"/>
    </linearGradient>
    <radialGradient id="tile-glow" cx="256" cy="190" r="220" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1e4fa3" stop-opacity=".28"/>
      <stop offset="100%" stop-color="#1e4fa3" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="640" rx="72" fill="url(#tile-face)"/>
  <rect x="10" y="10" width="492" height="620" rx="62" stroke="#c9a34a" stroke-opacity=".38" stroke-width="3"/>
  <rect width="512" height="640" rx="72" fill="url(#tile-glow)"/>
  <g transform="translate(128 78) scale(2.66)">${markInner}</g>
  <text x="256" y="478" text-anchor="middle" fill="#fffdf8" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700">${name}</text>
  <rect x="176" y="508" width="160" height="6" rx="3" fill="#c9a34a"/>
</svg>
`;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited ${code}`));
      }
    });
  });
}

async function rasterize(svgPath, pngPath, width, height) {
  const htmlPath = svgPath.replace(/\.svg$/, ".raster.html");
  const fileName = svgPath.split("/").pop();
  await writeFile(
    htmlPath,
    `<!doctype html><html><head><style>html,body{margin:0;background:#0b0b0d;width:${width}px;height:${height}px;overflow:hidden}img{display:block;width:${width}px;height:${height}px}</style></head><body><img src="./${fileName}" alt=""></body></html>`,
  );
  await run("timeout", [
    "15",
    "google-chrome",
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    `--user-data-dir=/tmp/contihub-chrome-brand`,
    `--window-size=${width},${height}`,
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`,
  ]);
  await unlink(htmlPath);
}

await mkdir(tilesDir, { recursive: true });

for (const product of products) {
  const svgPath = join(tilesDir, `${product.id}.svg`);
  await writeFile(svgPath, tileSvg(product.name));
  await rasterize(svgPath, join(tilesDir, `${product.id}.png`), 512, 640);
}

const markSvg = await readFile(join(brandDir, "cc-mark.svg"), "utf8");
await writeFile(join(brandDir, "cc-mark-on-dark.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <rect width="128" height="128" rx="28" fill="#0b0b0d"/>
  <rect x="3" y="3" width="122" height="122" rx="25" stroke="#c9a34a" stroke-opacity=".45" stroke-width="3"/>
  <g transform="translate(16 16)">${markSvg.replace(/<\/?svg[^>]*>/g, "").replace(/id="/g, 'id="dark-')}</g>
</svg>
`);
await rasterize(join(brandDir, "cc-mark.svg"), join(brandDir, "cc-mark.png"), 384, 384);
await rasterize(join(brandDir, "cc-mark-on-dark.svg"), join(brandDir, "cc-mark-on-dark.png"), 384, 384);
