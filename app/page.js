"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Court from "./components/Court";
import StepControls from "./components/StepControls";
import CloudControls from "./components/CloudControls";
import { INITIAL_PLAYERS } from "./lib/initialPlayers";

function clonePlayers(players) {
  return players.map((p) => ({ ...p }));
}

export default function Home() {
  // Current player positions on the court (always editable)
  const [players, setPlayers] = useState(clonePlayers(INITIAL_PLAYERS));
  // Recorded steps (starts empty, populated by pressing "+")
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const courtRef = useRef(null);

  // Load tactic from URL query param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      fetch(`/api/tactics/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.steps && data.steps.length > 0) {
            setSteps(data.steps);
            setPlayers(clonePlayers(data.steps[0]));
            setCurrentStep(0);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handlePlayerMove = useCallback(
    (playerId, x, y) => {
      // ドラッグ中は画面上の位置だけ更新。記録済みステップは触らない
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, x, y } : p))
      );
    },
    []
  );

  const handleAddStep = useCallback(() => {
    // 「+」を押した瞬間の配置をスナップショットとして保存
    const snapshot = clonePlayers(players);
    setSteps((prev) => [...prev, snapshot]);
    // 記録後はフリー編集モード（ステップ選択を解除）
    setCurrentStep(null);
  }, [players]);

  const handleDeleteStep = useCallback(
    (index) => {
      if (steps.length <= 0) return;
      const newSteps = steps.filter((_, i) => i !== index);
      setSteps(newSteps);
      if (newSteps.length === 0) {
        setCurrentStep(null);
      } else {
        const newIndex = Math.min(index, newSteps.length - 1);
        setCurrentStep(newIndex);
        setPlayers(clonePlayers(newSteps[newIndex]));
      }
    },
    [steps]
  );

  const handleSelectStep = useCallback(
    (index) => {
      setCurrentStep(index);
      setPlayers(clonePlayers(steps[index]));
    },
    [steps]
  );

  const handlePlay = useCallback(() => {
    if (steps.length < 2 || isAnimating) return;
    setIsAnimating(true);
    setCurrentStep(0);
    setPlayers(clonePlayers(steps[0]));

    let stepIndex = 0;
    const playNext = () => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        setPlayers(clonePlayers(steps[stepIndex]));
        setTimeout(playNext, 1200);
      } else {
        setIsAnimating(false);
      }
    };

    setTimeout(playNext, 1200);
  }, [steps, isAnimating]);

  const handleReset = useCallback(() => {
    setPlayers(clonePlayers(INITIAL_PLAYERS));
    setSteps([]);
    setCurrentStep(null);
    setLoadedTacticId(null);
    setLoadedTacticName("");
  }, []);

  // 読み込み中の戦術ID・名前を記憶（上書き保存用）
  const [loadedTacticId, setLoadedTacticId] = useState(null);
  const [loadedTacticName, setLoadedTacticName] = useState("");

  const handleLoadTactic = useCallback((loadedSteps, name, id) => {
    setSteps(loadedSteps);
    setLoadedTacticId(id);
    setLoadedTacticName(name);
    if (loadedSteps.length > 0) {
      setPlayers(clonePlayers(loadedSteps[0]));
      setCurrentStep(0);
    }
  }, []);

  return (
    <div className="app">
      {loadedTacticName && (
        <div className="tactic-header">
          {loadedTacticName}
        </div>
      )}

      <div className="court-wrapper">
        <Court
          players={players}
          onPlayerMove={handlePlayerMove}
          isAnimating={isAnimating}
          courtRef={courtRef}
        />
      </div>

      <div className="controls-wrapper">
        <StepControls
          steps={steps}
          currentStep={currentStep}
          onSelectStep={handleSelectStep}
          onAddStep={handleAddStep}
          onDeleteStep={handleDeleteStep}
          onPlay={handlePlay}
          onReset={handleReset}
          isAnimating={isAnimating}
        />
        <CloudControls
          steps={steps}
          onLoadTactic={handleLoadTactic}
          loadedTacticId={loadedTacticId}
          loadedTacticName={loadedTacticName}
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
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          overflow: hidden;
        }
        .controls-wrapper {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
