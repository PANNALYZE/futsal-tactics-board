// 再生アニメーション用の補間。軌跡（paths）があればそれに沿って、無ければ直線で動かす

import { curveSamples } from "./paths";

const clamp01 = (t) => Math.min(1, Math.max(0, t));

// 折れ線上を弧長パラメータ t (0-1) で等速に進んだ点
export function pointAlongPath(points, t) {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { ...points[0] };
  const tt = clamp01(t);
  const lengths = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    lengths.push(len);
    total += len;
  }
  if (total === 0) return { ...points[points.length - 1] };
  let target = tt * total;
  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i] || i === lengths.length - 1) {
      const r = lengths[i] === 0 ? 1 : target / lengths[i];
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * r,
        y: points[i].y + (points[i + 1].y - points[i].y) * r,
      };
    }
    target -= lengths[i];
  }
  return { ...points[points.length - 1] };
}

// from → to の途中 (t) の配置。paths[id] があれば軌跡に沿う（始点・終点は from/to に合わせる）
export function interpolatePlayers(fromPlayers, toPlayers, paths, t) {
  const toById = new Map(toPlayers.map((p) => [p.id, p]));
  return fromPlayers.map((p) => {
    const n = toById.get(p.id);
    if (!n) return { ...p };
    const path = paths && paths[p.id];
    if (Array.isArray(path) && path.length >= 2) {
      const pts = [{ x: p.x, y: p.y }, ...path.slice(1, -1), { x: n.x, y: n.y }];
      const pos = pointAlongPath(curveSamples(pts), t);
      return { ...p, x: pos.x, y: pos.y };
    }
    const tt = clamp01(t);
    return { ...p, x: p.x + (n.x - p.x) * tt, y: p.y + (n.y - p.y) * tt };
  });
}
