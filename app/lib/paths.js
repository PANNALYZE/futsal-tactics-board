// ドラッグの軌跡（% 座標の点列）の記録と間引き

// ドラッグ中、直前の点からこの距離（%）以上動いたときだけ点を追加する
const MIN_STEP_DISTANCE = 1.0;
// 保存時の上限点数と Douglas-Peucker の許容誤差（%）
export const MAX_PATH_POINTS = 40;
const BASE_TOLERANCE = 0.8;

export function appendPoint(path, point) {
  if (path.length === 0) return [point];
  const last = path[path.length - 1];
  if (Math.hypot(point.x - last.x, point.y - last.y) < MIN_STEP_DISTANCE) return path;
  return [...path, point];
}

function perpendicularDistance(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return Math.hypot(p.x - cx, p.y - cy);
}

function douglasPeucker(points, tolerance) {
  if (points.length < 3) return points;
  let maxDist = 0;
  let index = 0;
  const first = points[0];
  const last = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist <= tolerance) return [first, last];
  const left = douglasPeucker(points.slice(0, index + 1), tolerance);
  const right = douglasPeucker(points.slice(index), tolerance);
  return [...left.slice(0, -1), ...right];
}

export function simplifyPath(path) {
  if (path.length < 3) return path;
  let tolerance = BASE_TOLERANCE;
  let out = douglasPeucker(path, tolerance);
  // 上限を超える場合は許容誤差を広げて再度間引く
  while (out.length > MAX_PATH_POINTS) {
    tolerance *= 1.5;
    out = douglasPeucker(path, tolerance);
  }
  return out;
}
