"use client";

import { curveSamples } from "../lib/paths";

// Court の SVG（viewBox 200x400）内に描く。% 座標 → x*2, y*4
const toSvg = ({ x, y }) => ({ x: x * 2, y: y * 4 });

// 表示も再生と同じ曲線サンプル（curveSamples）を使う
function curvePathD(points) {
  const pts = curveSamples(points).map(toSvg);
  if (pts.length === 0) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

// 矢印の色はマーカー（味方=青、相手=赤、ボール=白）に合わせる
const ARROW_COLORS = {
  home: "#60a5fa",
  away: "#f87171",
  ball: "#ffffff",
};

function arrowColorKey(a) {
  if (a.kind === "ball") return "ball";
  return a.team === "away" ? "away" : "home";
}

export default function MovementArrows({ arrows }) {
  if (!arrows || arrows.length === 0) return null;
  return (
    <g>
      <defs>
        {Object.entries(ARROW_COLORS).map(([key, color]) => (
          <marker key={key} id={`arrow-${key}`} viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
      </defs>
      {arrows.map((a) => {
        const key = arrowColorKey(a);
        const common = {
          fill: "none",
          stroke: ARROW_COLORS[key],
          strokeWidth: 2,
          strokeDasharray: key === "ball" ? "4 3" : undefined,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          markerEnd: `url(#arrow-${key})`,
        };
        if (a.path) {
          // 軌跡の始点・終点は前後ステップの選手位置に合わせる
          // （ステップ更新で位置がずれても矢印が選手から生えるように）
          const pts = [a.from, ...a.path.slice(1, -1), a.to];
          return <path key={a.id} d={curvePathD(pts)} {...common} />;
        }
        const from = toSvg(a.from);
        const to = toSvg(a.to);
        return <line key={a.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} {...common} />;
      })}
    </g>
  );
}
