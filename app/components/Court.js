"use client";

import { useRef, useCallback } from "react";
import Player from "./Player";
import MovementArrows from "./MovementArrows";

export default function Court({
  players,
  arrows,
  onPlayerMove,
  isAnimating,
  courtRef: externalCourtRef,
}) {
  const internalCourtRef = useRef(null);
  const courtRef = externalCourtRef || internalCourtRef;

  const handlePlayerDrag = useCallback(
    (playerId, clientX, clientY) => {
      if (isAnimating) return;
      const court = courtRef.current;
      if (!court) return;

      const rect = court.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(2, Math.min(98, x));
      const clampedY = Math.max(2, Math.min(98, y));

      onPlayerMove(playerId, clampedX, clampedY);
    },
    [courtRef, onPlayerMove, isAnimating]
  );

  // SVG viewBox: 200 wide x 400 tall (portrait futsal court 20m x 40m)
  return (
    <div ref={courtRef} className="court-container">
      <svg
        className="court-svg"
        viewBox="0 0 200 400"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Court background */}
        <rect x="0" y="0" width="200" height="400" fill="#c8a243" />

        {/* Playing field */}
        <rect
          x="10"
          y="10"
          width="180"
          height="380"
          fill="#c8a243"
          stroke="white"
          strokeWidth="1.5"
        />

        {/* Center line */}
        <line
          x1="10"
          y1="200"
          x2="190"
          y2="200"
          stroke="white"
          strokeWidth="1.5"
        />

        {/* Center circle (r=3m → scaled: 30) */}
        <circle
          cx="100"
          cy="200"
          r="30"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />
        {/* Center spot */}
        <circle cx="100" cy="200" r="2" fill="white" />

        {/* === Top penalty area (semicircle, r=6m=60units) === */}
        <path
          d="M 40,10 A 60,60 0 0,0 160,10"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />
        {/* Top penalty spot (6m) */}
        <circle cx="100" cy="70" r="2" fill="white" />
        {/* Top second penalty spot (10m) */}
        <circle cx="100" cy="110" r="2" fill="white" />

        {/* Top goal (3m=30units wide, centered) */}
        <rect
          x="85"
          y="2"
          width="30"
          height="8"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />

        {/* === Bottom penalty area (semicircle) === */}
        <path
          d="M 40,390 A 60,60 0 0,1 160,390"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />
        {/* Bottom penalty spot */}
        <circle cx="100" cy="330" r="2" fill="white" />
        {/* Bottom second penalty spot */}
        <circle cx="100" cy="290" r="2" fill="white" />

        {/* Bottom goal (3m=30units wide, centered) */}
        <rect
          x="85"
          y="390"
          width="30"
          height="8"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />

        {/* Corner arcs (r=25cm → scaled ~2.5) */}
        <path d="M 10,13 A 3,3 0 0,1 13,10" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M 187,10 A 3,3 0 0,1 190,13" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M 10,387 A 3,3 0 0,0 13,390" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M 187,390 A 3,3 0 0,0 190,387" fill="none" stroke="white" strokeWidth="1.5" />

        {/* 次ステップへの移動（矢印 ON のときだけ） */}
        <MovementArrows arrows={arrows} />
      </svg>

      {/* Players rendered as HTML overlays for better touch handling */}
      {players.map((player) => (
        <Player
          key={player.id}
          player={player}
          onDrag={handlePlayerDrag}
          isAnimating={isAnimating}
        />
      ))}

      <style jsx>{`
        .court-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          aspect-ratio: 1 / 2;
          max-height: 100%;
          margin: 0 auto;
          touch-action: none;
        }
        .court-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
