"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { ringOffset, wrapIndex } from "@/lib/hub/reel";
import type { ContiApp } from "@/lib/apps";

type RevolvingTilesProps = {
  tiles: ContiApp[];
};

export function RevolvingTiles({ tiles }: RevolvingTilesProps) {
  const count = tiles.length;
  const [active, setActive] = useState(1);
  const [wide, setWide] = useState(true);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ pointer: -1, x: 0, origin: 0, moved: 0 });

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const measure = () => setWide(node.clientWidth >= 640);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
      const onWheel = (event: WheelEvent) => {
      const sideways = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!sideways) return;
      const delta = event.shiftKey ? event.deltaY : event.deltaX;
      if (delta === 0) return;
      event.preventDefault();
      setActive((value) => wrapIndex(value + delta / (wide ? 220 : 150), count));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [count, wide]);

  function step(direction: number) {
    setActive((value) => wrapIndex(Math.round(value) + direction, count));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag.current = { pointer: event.pointerId, x: event.clientX, origin: active, moved: 0 };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (drag.current.pointer !== event.pointerId) return;
    const dx = event.clientX - drag.current.x;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    if (drag.current.moved < 6) return;
    const spacing = wide ? 168 : 118;
    setActive(wrapIndex(drag.current.origin - dx / spacing, count));
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (drag.current.pointer !== event.pointerId) return;
    const moved = drag.current.moved;
    drag.current.pointer = -1;
    setDragging(false);
    if (moved >= 6) setActive((value) => wrapIndex(Math.round(value), count));
  }

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (drag.current.moved < 6) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current.moved = 0;
  }

  const position = wrapIndex(active, count);
  const front = tiles[Math.round(position) % count] ?? tiles[0];
  const spacing = wide ? 168 : 112;
  const tileWidth = wide ? 232 : 168;

  return (
    <section className="mt-8" aria-labelledby="suite-reel-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p id="suite-reel-title" className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            Conti suite
          </p>
          <p className="mt-2 text-sm text-muted">Scroll or swipe left and right. The front tile opens that app.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-sm border border-gold/35 px-3 py-2 text-sm font-semibold text-ink transition hover:border-gold"
            onClick={() => step(-1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-sm border border-gold/35 px-3 py-2 text-sm font-semibold text-ink transition hover:border-gold"
            onClick={() => step(1)}
          >
            Next
          </button>
        </div>
      </div>
      <div
        ref={rootRef}
        className="relative mt-4 h-[22rem] overflow-hidden sm:h-[26rem]"
        style={{ perspective: "1200px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            step(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            step(1);
          }
        }}
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label="Conti suite tiles"
      >
        {tiles.map((tile, index) => {
          const offset = ringOffset(index, position, count);
          const distance = Math.abs(offset);
          if (distance > 3.15) return null;
          const frontTile = distance < 0.45;
          return (
            <Link
              key={tile.id}
              href={tile.href}
              aria-current={frontTile ? "true" : undefined}
              tabIndex={frontTile ? 0 : -1}
              className="absolute left-1/2 top-[46%] block"
              style={{
                width: tileWidth,
                transform: `translate(-50%, -50%) translateX(${offset * spacing}px) translateZ(${-distance * 110}px) rotateY(${offset * -42}deg) scale(${1 - Math.min(distance, 2.4) * 0.08})`,
                zIndex: 40 - Math.round(distance * 10),
                opacity: distance > 2.4 ? 0.45 : 1,
                transition: dragging ? "none" : "transform 420ms cubic-bezier(.2,.7,.2,1), opacity 420ms",
              }}
            >
              <img
                src={`/brand/tiles/${tile.id}.png`}
                alt={tile.name}
                width={512}
                height={512}
                draggable={false}
                className={`aspect-square w-full rounded-[1.6rem] object-contain shadow-[0_16px_32px_-18px_rgba(0,0,0,0.75)] ${
                  frontTile ? "ring-2 ring-gold" : ""
                }`}
              />
            </Link>
          );
        })}
      </div>
      {front ? (
        <div className="mx-auto max-w-xl text-center">
          <p className="font-display text-2xl font-semibold tracking-tight text-ink-strong">{front.name}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{front.description}</p>
        </div>
      ) : null}
    </section>
  );
}
