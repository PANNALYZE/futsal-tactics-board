// ドラッグの軌跡（% 座標の点列）の記録と間引き

// ドラッグ中、直前の点からこの距離（%）以上動いたときだけ点を追加する
const MIN_STEP_DISTANCE = 1.0;
// 保存時の上限点数と Douglas-Peucker の許容誤差（%）
export const MAX_PATH_POINTS = 40;
const BASE_TOLERANCE = 1.5;
// 手ブレ除去の移動平均の窓幅（奇数）
const SMOOTH_WINDOW = 5;

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

// 移動平均で手ブレを取り、Douglas-Peucker で要点だけ残す（始点・終点は固定）
export function smoothPath(path) {
  if (path.length < 3) return path;
  const half = Math.floor(SMOOTH_WINDOW / 2);
  const averaged = path.map((p, i) => {
    if (i === 0 || i === path.length - 1) return p;
    const lo = Math.max(0, i - half);
    const hi = Math.min(path.length - 1, i + half);
    const win = path.slice(lo, hi + 1);
    return {
      x: win.reduce((a, q) => a + q.x, 0) / win.length,
      y: win.reduce((a, q) => a + q.y, 0) / win.length,
    };
  });
  return simplifyPath(averaged);
}

// 折れ線を Catmull-Rom 曲線で細分化した点列にする（表示と再生で同じ曲線を使う）
export function curveSamples(points, subdivisions = 8) {
  if (points.length < 3) return points;
  const out = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    for (let k = 1; k <= subdivisions; k++) {
      const t = k / subdivisions;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out[out.length - 1] = points[points.length - 1];
  return out;
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
