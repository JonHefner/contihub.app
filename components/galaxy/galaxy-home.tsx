"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  GALAXY_CLUSTERS,
  filterGalaxyNodes,
  galaxyNodes,
  hitTest,
  type GalaxyCluster,
  type GalaxyNode,
} from "@/lib/galaxy/layout";
import styles from "./galaxy-home.module.css";

/** Rendered only on the `/app` front page. Suite sub-pages keep the Conti Way shell. */

type GalaxyHomeProps = {
  list: ReactNode;
  invite: ReactNode;
  sample: ReactNode;
  pulse: ReactNode;
};

type Camera = { x: number; y: number; scale: number };

const KIND_COLOR: Record<GalaxyNode["kind"], string> = {
  hub: "#D4AF37",
  suite: "#6EC6FF",
  project: "#FFB347",
  team: "#D4AF37",
};

function screenToWorld(sx: number, sy: number, camera: Camera, width: number, height: number) {
  return {
    x: (sx - width / 2) / camera.scale + camera.x,
    y: (sy - height / 2) / camera.scale + camera.y,
  };
}

function stars() {
  let seed = 0xC0FFEE;
  const next = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: 90 }, () => ({
    x: (next() - 0.5) * 2400,
    y: (next() - 0.5) * 1600,
    r: next() * 1.3 + 0.3,
    a: next() * 0.55 + 0.15,
  }));
}

const STARFIELD = stars();

function drawMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  const scale = (radius * 1.35) / 100;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-50, -50);
  const opening = (28 * Math.PI) / 180;
  const strokeC = (rOuter: number, rInner: number, color: string) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = rOuter - rInner;
    ctx.lineCap = "butt";
    ctx.arc(50, 50, (rOuter + rInner) / 2, -opening, opening, true);
    ctx.stroke();
  };
  strokeC(35, 22.8, "#1e4fa3");
  strokeC(17.8, 7.8, "#D4AF37");
  ctx.restore();
}

export function GalaxyHome({ list, invite, sample, pulse }: GalaxyHomeProps) {
  const nodes = useMemo(() => galaxyNodes(), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera>({ x: 0, y: 24, scale: 0.72 });
  const fitted = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ mode: "none" as "none" | "pan" | "pinch", lastX: 0, lastY: 0, startX: 0, startY: 0, moved: 0, pinch: 0 });
  const [view, setView] = useState<"galaxy" | "list">("galaxy");
  const [query, setQuery] = useState("");
  const [cluster, setCluster] = useState<GalaxyCluster>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visible = filterGalaxyNodes(nodes, query, cluster);
  const visibleIds = useMemo(() => new Set(visible.map((item) => item.id)), [visible]);
  const selected = nodes.find((item) => item.id === selectedId) ?? null;

  const drawRef = useRef<() => void>(() => {});
  drawRef.current = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const camera = cameraRef.current;
    ctx.fillStyle = "#05020F";
    ctx.fillRect(0, 0, width, height);

    const toScreen = (x: number, y: number) => ({
      x: (x - camera.x) * camera.scale + width / 2,
      y: (y - camera.y) * camera.scale + height / 2,
    });

    for (const star of STARFIELD) {
      const point = toScreen(star.x, star.y);
      ctx.beginPath();
      ctx.fillStyle = `rgba(245,240,255,${star.a})`;
      ctx.arc(point.x, point.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const hub = nodes.find((item) => item.kind === "hub");
    if (!hub) return;
    const hubScreen = toScreen(hub.x, hub.y);
    const orbits = [...new Set(nodes.filter((item) => item.kind !== "hub").map((item) => Math.hypot(item.x, item.y)))];
    ctx.lineWidth = 1;
    for (const orbit of orbits) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(212,175,55,0.13)";
      ctx.arc(hubScreen.x, hubScreen.y, orbit * camera.scale, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const item of nodes) {
      if (item.kind === "hub") continue;
      const point = toScreen(item.x, item.y);
      ctx.beginPath();
      ctx.strokeStyle = visibleIds.has(item.id) ? "rgba(212,175,55,0.45)" : "rgba(212,175,55,0.12)";
      ctx.moveTo(hubScreen.x, hubScreen.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    for (const item of nodes) {
      const point = toScreen(item.x, item.y);
      const radius = item.radius * camera.scale;
      const color = KIND_COLOR[item.kind];
      const dim = !visibleIds.has(item.id);
      ctx.save();
      ctx.globalAlpha = dim ? 0.22 : 1;
      ctx.beginPath();
      ctx.fillStyle = "rgba(27,2,90,0.92)";
      ctx.shadowColor = color;
      ctx.shadowBlur = item.id === selectedId ? 28 : 16;
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = item.id === selectedId ? 3 : 1.5;
      ctx.strokeStyle = color;
      ctx.stroke();
      if (item.kind === "hub") drawMark(ctx, point.x, point.y, radius * 0.72);
      ctx.font = `${item.kind === "hub" ? 700 : 600} ${Math.max(11, 12 * camera.scale)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = item.kind === "hub" ? "#D4AF37" : "#F5F0FF";
      if (item.kind === "hub") {
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(item.name, point.x, point.y + radius + 8);
      } else {
        const angle = Math.atan2(item.y, item.x);
        const outward = Math.cos(angle);
        ctx.textAlign = outward > 0.35 ? "left" : outward < -0.35 ? "right" : "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.name, point.x + Math.cos(angle) * (radius + 10), point.y + Math.sin(angle) * (radius + 14));
      }
      ctx.restore();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || view !== "galaxy") return;
    const fit = () => {
      if (fitted.current) {
        drawRef.current();
        return;
      }
      const span = Math.min(canvas.clientWidth, canvas.clientHeight);
      cameraRef.current.scale = Math.max(0.42, Math.min(1, span / 980));
      fitted.current = true;
      drawRef.current();
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [view, visibleIds, selectedId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || view !== "galaxy") return;
    const zoomAt = (sx: number, sy: number, nextScale: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const camera = cameraRef.current;
      const before = screenToWorld(sx, sy, camera, width, height);
      camera.scale = Math.min(2.2, Math.max(0.35, nextScale));
      camera.x = before.x - (sx - width / 2) / camera.scale;
      camera.y = before.y - (sy - height / 2) / camera.scale;
      drawRef.current();
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const factor = event.deltaY < 0 ? 1.08 : 0.92;
      zoomAt(event.clientX - rect.left, event.clientY - rect.top, cameraRef.current.scale * factor);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [view]);

  function focusNode(item: GalaxyNode) {
    setSelectedId(item.id);
    cameraRef.current.x = item.x;
    cameraRef.current.y = item.y;
    drawRef.current();
  }

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) {
      gesture.current = { mode: "pan", lastX: event.clientX, lastY: event.clientY, startX: event.clientX, startY: event.clientY, moved: 0, pinch: 0 };
    } else if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.mode = "pinch";
      gesture.current.pinch = Math.hypot(a.x - b.x, a.y - b.y);
      gesture.current.moved = 20;
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (gesture.current.mode === "pinch" && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const ratio = gesture.current.pinch ? dist / gesture.current.pinch : 1;
      gesture.current.pinch = dist;
      const rect = canvas.getBoundingClientRect();
      const sx = (a.x + b.x) / 2 - rect.left;
      const sy = (a.y + b.y) / 2 - rect.top;
      const camera = cameraRef.current;
      const before = screenToWorld(sx, sy, camera, rect.width, rect.height);
      camera.scale = Math.min(2.2, Math.max(0.35, camera.scale * ratio));
      camera.x = before.x - (sx - rect.width / 2) / camera.scale;
      camera.y = before.y - (sy - rect.height / 2) / camera.scale;
      drawRef.current();
      return;
    }
    if (gesture.current.mode !== "pan") return;
    const dx = event.clientX - gesture.current.lastX;
    const dy = event.clientY - gesture.current.lastY;
    gesture.current.moved = Math.hypot(event.clientX - gesture.current.startX, event.clientY - gesture.current.startY);
    cameraRef.current.x -= dx / cameraRef.current.scale;
    cameraRef.current.y -= dy / cameraRef.current.scale;
    gesture.current.lastX = event.clientX;
    gesture.current.lastY = event.clientY;
    drawRef.current();
  }

  function onPointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    const click = gesture.current.mode === "pan" && gesture.current.moved < 5;
    pointers.current.delete(event.pointerId);
    if (pointers.current.size > 0) {
      gesture.current.moved = 20;
      return;
    }
    gesture.current.mode = "none";
    if (!click) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const world = screenToWorld(event.clientX - rect.left, event.clientY - rect.top, cameraRef.current, rect.width, rect.height);
    const hit = hitTest(visible, world.x, world.y);
    setSelectedId(hit?.id ?? null);
  }

  if (view === "list") {
    return (
      <div>
        <div className={styles.listBar}>
          <button type="button" className={styles.viewToggle} onClick={() => setView("galaxy")}>
            Galaxy view
          </button>
        </div>
        {list}
      </div>
    );
  }

  const kindClass =
    selected?.kind === "project" ? styles.kindProject : selected?.kind === "suite" ? styles.kindSuite : styles.kindHub;

  return (
    <div className={styles.root}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="ContiHub galaxy. Drag to pan, scroll or pinch to zoom, and use the chips to open an app."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <div className={styles.top}>
        <div className={styles.brand}>
          <svg className={styles.brandMark} viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="49" fill="#05020F" />
            <path d="M72 28 A32 32 0 1 0 72 72" fill="none" stroke="#1e4fa3" strokeWidth="12" />
            <path d="M66 38 A18 18 0 1 0 66 62" fill="none" stroke="#D4AF37" strokeWidth="8" />
          </svg>
          <div>
            <h1>ContiHub</h1>
            <p>The Conti Way · Suite galaxy</p>
          </div>
        </div>
        <input
          className={styles.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search apps"
          aria-label="Search apps"
        />
        <button type="button" className={styles.viewToggle} onClick={() => setView("list")}>
          List view
        </button>
      </div>
      <div className={styles.chips}>
        {GALAXY_CLUSTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={`${styles.chip} ${cluster === item ? styles.chipActive : ""}`}
            onClick={() => setCluster(item)}
          >
            {item}
          </button>
        ))}
        {visible
          .filter((item) => item.kind !== "hub")
          .map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.chip} ${selectedId === item.id ? styles.chipActive : ""}`}
              onClick={() => focusNode(item)}
            >
              {item.name}
            </button>
          ))}
      </div>
      {selected ? (
        <aside className={styles.panel} aria-label={selected.name}>
          <button type="button" className={styles.close} onClick={() => setSelectedId(null)} aria-label="Close">
            ×
          </button>
          <span className={`${styles.kind} ${kindClass}`}>{selected.kind === "hub" ? "Hub" : selected.kind === "project" ? "Project" : selected.kind === "team" ? "Team" : "Suite"}</span>
          <h2>{selected.name}</h2>
          <p className={styles.cluster}>{selected.cluster}</p>
          <p className={styles.desc}>{selected.description}</p>
          {selected.href ? (
            <Link className={styles.open} href={selected.href}>
              Open app
            </Link>
          ) : null}
          {selected.id === "hub" ? <div className={styles.invite}>{sample}</div> : null}
          {selected.id === "invite" ? <div className={styles.invite}>{invite}</div> : null}
        </aside>
      ) : null}
      <div className={styles.legend}>
        <div className={styles.legendHead}>Conti Way</div>
        <div><span className={styles.dot} style={{ background: "#D4AF37" }} />Hub and team</div>
        <div><span className={styles.dot} style={{ background: "#FFB347" }} />Projects</div>
        <div><span className={styles.dot} style={{ background: "#6EC6FF" }} />Suite apps</div>
        <div>Drag, pinch, or scroll. Chips work on a phone.</div>
      </div>
      <div className={styles.pulse}>{pulse}</div>
    </div>
  );
}
