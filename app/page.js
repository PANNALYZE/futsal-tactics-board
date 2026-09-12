"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Court from "./components/Court";
import StepControls from "./components/StepControls";
import StepMemo from "./components/StepMemo";
import CloudControls from "./components/CloudControls";
import { INITIAL_PLAYERS } from "./lib/initialPlayers";
import { normalizeSteps, createStep } from "./lib/steps";
import { movementArrows } from "./lib/arrows";
import { appendPoint, simplifyPath } from "./lib/paths";

const PLAY_INTERVAL_MS = 1200;

// 保存する軌跡の座標は小数1桁に丸める（JSON の肥大化防止）
function roundPoint({ x, y }) {
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

function clonePlayers(players) {
  return players.map((p) => ({ ...p }));
}

export default function Home() {
  // Current player positions on the court (always editable)
  const [players, setPlayers] = useState(clonePlayers(INITIAL_PLAYERS));
  // Recorded steps: [{ players, memo }]
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showArrows, setShowArrows] = useState(true);
  // 読み込み中の戦術（id/name/category/description）。上書き保存用
  const [loadedTactic, setLoadedTactic] = useState(null);
  const courtRef = useRef(null);
  // ステップ選択後にドラッグした軌跡（playerId -> [{x,y}]）。+ / 更新 で次ステップに保存する
  const dragPaths = useRef({});
  // handlePlayerMove から最新の配置を読むための参照
  const playersRef = useRef(players);
  playersRef.current = players;

  const applyLoaded = useCallback((rawSteps, meta) => {
    const normalized = normalizeSteps(rawSteps);
    if (normalized.length === 0) return;
    dragPaths.current = {};
    setSteps(normalized);
    setLoadedTactic(meta);
    setPlayers(clonePlayers(normalized[0].players));
    setCurrentStep(0);
  }, []);

  // Load tactic from URL query param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;
    fetch(`/api/tactics/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.steps) {
          applyLoaded(data.steps, {
            id,
            name: data.name,
            category: data.category || "other",
            description: data.description || "",
          });
        }
      })
      .catch(() => {});
  }, [applyLoaded]);

  const handlePlayerMove = useCallback((playerId, x, y) => {
    // ドラッグ中は画面上の位置だけ更新。記録済みステップは触らない
    const current = playersRef.current.find((p) => p.id === playerId);
    if (current) {
      // 軌跡: 最初の移動時はドラッグ前の位置を起点にする
      const path = dragPaths.current[playerId] ?? [{ x: current.x, y: current.y }];
      dragPaths.current[playerId] = appendPoint(path, { x, y });
    }
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, x, y } : p))
    );
  }, []);

  const takeDragPaths = useCallback(() => {
    const paths = Object.fromEntries(
      Object.entries(dragPaths.current).map(([id, path]) => [id, simplifyPath(path).map(roundPoint)])
    );
    dragPaths.current = {};
    return paths;
  }, []);

  const handleAddStep = useCallback(() => {
    // 「+」を押した瞬間の配置と、そこまでのドラッグ軌跡をスナップショットとして保存
    const paths = takeDragPaths();
    setSteps((prev) => [...prev, createStep(players, "", paths)]);
    // 記録後はフリー編集モード（ステップ選択を解除）
    setCurrentStep(null);
  }, [players, takeDragPaths]);

  const handleUpdateStep = useCallback(() => {
    // 選択中ステップの配置を、今の画面の配置で置き換える
    if (currentStep === null) return;
    const paths = takeDragPaths();
    setSteps((prev) =>
      prev.map((s, i) =>
        i === currentStep
          ? { ...s, players: clonePlayers(players), paths: { ...s.paths, ...paths } }
          : s
      )
    );
  }, [currentStep, players, takeDragPaths]);

  const handleDeleteStep = useCallback(
    (index) => {
      if (steps.length <= 0 || index === null) return;
      const newSteps = steps
        .filter((_, i) => i !== index)
        .map((s, i) => (i === index ? { ...s, paths: {} } : s));
      dragPaths.current = {};
      setSteps(newSteps);
      if (newSteps.length === 0) {
        setCurrentStep(null);
      } else {
        const newIndex = Math.min(index, newSteps.length - 1);
        setCurrentStep(newIndex);
        setPlayers(clonePlayers(newSteps[newIndex].players));
      }
    },
    [steps]
  );

  const handleSelectStep = useCallback(
    (index) => {
      if (index < 0 || index >= steps.length) return;
      dragPaths.current = {};
      setCurrentStep(index);
      setPlayers(clonePlayers(steps[index].players));
    },
    [steps]
  );

  const handleMemoChange = useCallback(
    (memo) => {
      if (currentStep === null) return;
      setSteps((prev) => prev.map((s, i) => (i === currentStep ? { ...s, memo } : s)));
    },
    [currentStep]
  );

  const handlePlay = useCallback(() => {
    if (steps.length < 2 || isAnimating) return;
    dragPaths.current = {};
    setIsAnimating(true);
    setCurrentStep(0);
    setPlayers(clonePlayers(steps[0].players));

    let stepIndex = 0;
    const playNext = () => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        setPlayers(clonePlayers(steps[stepIndex].players));
        setTimeout(playNext, PLAY_INTERVAL_MS);
      } else {
        setIsAnimating(false);
      }
    };

    setTimeout(playNext, PLAY_INTERVAL_MS);
  }, [steps, isAnimating]);

  const handleReset = useCallback(() => {
    dragPaths.current = {};
    setPlayers(clonePlayers(INITIAL_PLAYERS));
    setSteps([]);
    setCurrentStep(null);
    setLoadedTactic(null);
  }, []);

  // 矢印: 選択中ステップから次ステップへの移動
  const arrows = useMemo(() => {
    if (!showArrows || isAnimating || currentStep === null) return [];
    const next = steps[currentStep + 1];
    return next ? movementArrows(players, next.players, next.paths) : [];
  }, [showArrows, isAnimating, currentStep, steps, players]);

  const memo = currentStep !== null && steps[currentStep] ? steps[currentStep].memo : "";

  return (
    <div className="app">
      {loadedTactic && (
        <div className="tactic-header">
          {loadedTactic.name}
        </div>
      )}

      <div className="court-wrapper">
        <Court
          players={players}
          arrows={arrows}
          onPlayerMove={handlePlayerMove}
          isAnimating={isAnimating}
          courtRef={courtRef}
        />
      </div>

      <div className="controls-wrapper">
        {currentStep !== null && (
          <StepMemo memo={memo} onChange={handleMemoChange} disabled={isAnimating} />
        )}
        <StepControls
          steps={steps}
          currentStep={currentStep}
          onSelectStep={handleSelectStep}
          onAddStep={handleAddStep}
          onUpdateStep={handleUpdateStep}
          onDeleteStep={handleDeleteStep}
          onPlay={handlePlay}
          onReset={handleReset}
          showArrows={showArrows}
          onToggleArrows={() => setShowArrows((v) => !v)}
          isAnimating={isAnimating}
        />
        <CloudControls
          steps={steps}
          onLoadTactic={applyLoaded}
          loadedTactic={loadedTactic}
        />
      </div>

      <style jsx>{`
        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          height: 100dvh;
          max-width: 480px;
          margin: 0 auto;
          overflow: hidden;
        }
        .tactic-header {
          text-align: center;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: bold;
          color: #fbbf24;
          background: #0f3460;
          flex-shrink: 0;
        }
        .court-wrapper {
          flex: 1;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          overflow: hidden;
        }
        .controls-wrapper {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
