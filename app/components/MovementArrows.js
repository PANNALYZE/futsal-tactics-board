"use client";

// Court の SVG（viewBox 200x400）内に描く。% 座標 → x*2, y*4
const toSvg = ({ x, y }) => ({ x: x * 2, y: y * 4 });

export default function MovementArrows({ arrows }) {
  if (!arrows || arrows.length === 0) return null;
  return (
    <g>
      <defs>
        <marker id="arrow-player" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
        </marker>
        <marker id="arrow-ball" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
        </marker>
      </defs>
      {arrows.map((a) => {
        const from = toSvg(a.from);
        const to = toSvg(a.to);
        const isBall = a.kind === "ball";
        return (
          <line
            key={a.id}
            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke={isBall ? "#ffffff" : "#fbbf24"}
            strokeWidth="2"
            strokeDasharray={isBall ? "4 3" : undefined}
            strokeLinecap="round"
            markerEnd={`url(#${isBall ? "arrow-ball" : "arrow-player"})`}
          />
        );
      })}
    </g>
  );
}
