/** Shortest signed step from the active tile to `index` on a ring. */

export function ringOffset(index: number, active: number, count: number) {
  if (count <= 0) return 0;
  let delta = index - active;
  delta = ((delta % count) + count) % count;
  if (delta > count / 2) delta -= count;
  return delta;
}

export function wrapIndex(value: number, count: number) {
  if (count <= 0) return 0;
  return ((value % count) + count) % count;
}
