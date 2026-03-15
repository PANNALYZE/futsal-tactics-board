"use client";

import { useRef, useCallback, useEffect } from "react";

export default function Player({ player, onDrag, isAnimating }) {
  const isDragging = useRef(false);

  const handleStart = useCallback(
    (e) => {
      if (isAnimating) return;
      e.preventDefault();
      e.stopPropagation();
      isDragging.current = true;
    },
    [isAnimating]
  );

  const handleMove = useCallback(
    (e) => {
      if (!isDragging.current) return;
      e.preventDefault();

      let clientX, clientY;
      if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      onDrag(player.id, clientX, clientY);
    },
    [player.id, onDrag]
  );

  const handleEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => handleMove(e);
    const onTouchMove = (e) => handleMove(e);
    const onMouseUp = () => handleEnd();
    const onTouchEnd = () => handleEnd();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleMove, handleEnd]);

  const isBall = player.role === "BALL";
  const isGK = player.role === "GK";
  const teamColor = player.team === "home" ? "#3b82f6" : "#ef4444";
  const gkColor = player.team === "home" ? "#7c3aed" : "#f97316";
  const bgColor = isBall ? "#ffffff" : isGK ? gkColor : teamColor;

  return (
    <div
      className={`player-icon ${isBall ? "ball" : ""}`}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      style={{
        left: `${player.x}%`,
        top: `${player.y}%`,
        backgroundColor: bgColor,
        transition: isAnimating ? "left 1s ease, top 1s ease" : "none",
        cursor: isAnimating ? "default" : "grab",
      }}
    >
      {isBall ? (
        <svg className="ball-svg" viewBox="0 0 100 100">
          <defs>
            <clipPath id="ballClip">
              <circle cx="50" cy="50" r="46" />
            </clipPath>
          </defs>
          <circle cx="50" cy="50" r="46" fill="white" stroke="#222" strokeWidth="4" />
          <g clipPath="url(#ballClip)" stroke="#222" strokeWidth="2.5" strokeLinejoin="round">
            {/* Center black pentagon */}
            <polygon points="50,30 69,44 62,66 38,66 31,44" fill="#222" />
            {/* Seam lines from pentagon vertices outward */}
            <line x1="50" y1="30" x2="50" y2="4" />
            <line x1="69" y1="44" x2="95" y2="30" />
            <line x1="62" y1="66" x2="82" y2="88" />
            <line x1="38" y1="66" x2="18" y2="88" />
            <line x1="31" y1="44" x2="5" y2="30" />
            {/* Outer connecting seams (hexagon edges) */}
            <line x1="50" y1="4" x2="22" y2="12" />
            <line x1="50" y1="4" x2="78" y2="12" />
            <line x1="95" y1="30" x2="96" y2="58" />
            <line x1="5" y1="30" x2="4" y2="58" />
            <line x1="82" y1="88" x2="58" y2="98" />
            <line x1="18" y1="88" x2="42" y2="98" />
            <line x1="22" y1="12" x2="5" y2="30" />
            <line x1="78" y1="12" x2="95" y2="30" />
            <line x1="96" y1="58" x2="82" y2="88" />
            <line x1="4" y1="58" x2="18" y2="88" />
            <line x1="58" y1="98" x2="42" y2="98" />
          </g>
        </svg>
      ) : (
        <span className="player-label">
          {isGK ? "GK" : player.number}
        </span>
      )}

      <style jsx>{`
        .player-icon {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%, -50%);
          border: 2px solid rgba(255, 255, 255, 0.8);
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .player-icon.ball {
          width: 28px;
          height: 28px;
          border: none;
          background: none !important;
          box-shadow: none;
          z-index: 5;
        }
        .ball-svg {
          width: 100%;
          height: 100%;
          pointer-events: none;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
        }
        .player-label {
          font-size: 11px;
          font-weight: bold;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
