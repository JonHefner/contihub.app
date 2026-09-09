import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ccMarkOnDarkSvg,
  ccMarkSvg,
  faviconSvg,
  products,
  tileSvg,
} from "../lib/brand/cc-mark-svg.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = join(root, "public/brand");
const tilesDir = join(brandDir, "tiles");
const require = createRequire(import.meta.url);

async function rasterize(svg: string, pngPath: string, size: number) {
  const { Resvg } = require("@resvg/resvg-js") as {
    Resvg: new (
      source: string,
      options: { fitTo: { mode: "width"; value: number }; font?: { loadSystemFonts?: boolean } },
    ) => { render: () => { asPng: () => Buffer } };
  };
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: true },
  });
  await writeFile(pngPath, resvg.render().asPng());
}

await mkdir(tilesDir, { recursive: true });

const markSvg = ccMarkSvg();
const onDarkSvg = ccMarkOnDarkSvg();
await writeFile(join(brandDir, "cc-mark.svg"), markSvg);
await writeFile(join(brandDir, "cc-mark-on-dark.svg"), onDarkSvg);
await writeFile(join(root, "app/icon.svg"), faviconSvg());

await rasterize(markSvg, join(brandDir, "cc-mark.png"), 1024);
await rasterize(onDarkSvg, join(brandDir, "cc-mark-on-dark.png"), 1024);

for (const product of products) {
  const svg = tileSvg(product.name);
  await writeFile(join(tilesDir, `${product.id}.svg`), svg);
  await rasterize(svg, join(tilesDir, `${product.id}.png`), 1024);
}
