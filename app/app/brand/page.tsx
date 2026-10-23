import type { Metadata } from "next";
import { SuiteShell } from "@/components/suite-shell";

export const metadata: Metadata = {
  title: "Conti Brand",
};

const colors = [
  { name: "Blue", hex: "#2f5bff", ink: "#fffdf8" },
  { name: "Gold", hex: "#c4a574", ink: "#05030a" },
  { name: "Black", hex: "#05030a", ink: "#fffdf8" },
] as const;

const assets = [
  {
    title: "Official mark",
    body: "The only Conti Way mark. Blue outer C, gold inner C, on black. Use this file. Do not redraw it.",
    src: "/brand/conti-way-mark.png",
    file: "conti-way-mark.png",
    wide: false,
  },
  {
    title: "Email signature",
    body: "The signature tile. Place this crop in email signatures.",
    src: "/brand/kit/conti-mark-tile@2x.png",
    file: "conti-mark-tile@2x.png",
    wide: false,
  },
  {
    title: "Brand standard",
    body: "The Conti Way standard sheet for proposals and leave-behinds.",
    src: "/brand/kit/conti-way-cmo-standard.png",
    file: "conti-way-cmo-standard.png",
    wide: true,
  },
] as const;

export default function BrandPage() {
  return (
    <SuiteShell>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Conti brand</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-strong">
        One official mark.
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Download the artwork below. The same photograph is the header, the suite tiles, and the app icon.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {assets
          .filter((asset) => !asset.wide)
          .map((asset) => (
            <article key={asset.file} className="rounded-2xl border border-white/10 bg-surface p-5">
              <img
                src={asset.src}
                alt={asset.title}
                width={588}
                height={588}
                className="aspect-square w-full bg-black object-cover object-top"
              />
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink-strong">{asset.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{asset.body}</p>
              <a
                href={asset.src}
                download={asset.file}
                className="mt-4 inline-flex rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-page transition hover:bg-gold-soft"
              >
                Download {asset.file}
              </a>
            </article>
          ))}
      </div>

      {assets
        .filter((asset) => asset.wide)
        .map((asset) => (
          <article key={asset.file} className="mt-6 rounded-2xl border border-white/10 bg-surface p-5">
            <img src={asset.src} alt={asset.title} width={1600} height={900} className="w-full bg-black" />
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink-strong">{asset.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{asset.body}</p>
            <a
              href={asset.src}
              download={asset.file}
              className="mt-4 inline-flex rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-page transition hover:bg-gold-soft"
            >
              Download {asset.file}
            </a>
          </article>
        ))}

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-ink-strong">Brand colors</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {colors.map((color) => (
            <li key={color.hex} className="overflow-hidden rounded-2xl border border-white/10">
              <div className="flex h-28 items-end px-4 py-3" style={{ background: color.hex, color: color.ink }}>
                <span className="font-semibold">{color.name}</span>
              </div>
              <p className="bg-surface px-4 py-3 font-mono text-sm text-muted">{color.hex}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-red-400/35 bg-surface p-6">
        <h2 className="text-xl font-semibold tracking-tight text-ink-strong">Do not use</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          These marks are retired. Do not place them on proposals, email, the website, or Hub.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-ink">
          <li>The old boxed CONTINENTAL CONSTRUCTION OF OHIO letterhead lockup.</li>
          <li>Redrawn C variants, including flat vector marks, white cutouts, and transparent cutouts of the C.</li>
        </ul>
      </section>
    </SuiteShell>
  );
}
