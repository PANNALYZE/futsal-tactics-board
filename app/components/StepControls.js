"use client";

export default function StepControls({
  steps,
  currentStep,
  onSelectStep,
  onAddStep,
  onDeleteStep,
  onPlay,
  onReset,
  isAnimating,
}) {
  return (
    <div className="step-controls">
      <div className="step-tabs">
        {steps.map((_, index) => (
          <button
            key={index}
            className={`step-tab ${index === currentStep ? "active" : ""}`}
            onClick={() => onSelectStep(index)}
            disabled={isAnimating}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="step-tab add-btn"
          onClick={onAddStep}
          disabled={isAnimating}
        >
          +
        </button>
      </div>

      <div className="action-buttons">
        <button
          className="action-btn play-btn"
          onClick={onPlay}
          disabled={isAnimating || steps.length < 2}
        >
          {isAnimating ? "再生中..." : "▶ 再生"}
        </button>
        <button
          className="action-btn delete-btn"
          onClick={() => onDeleteStep(currentStep)}
          disabled={isAnimating || steps.length === 0}
        >
          🗑 削除
        </button>
        <button
          className="action-btn reset-btn"
          onClick={onReset}
          disabled={isAnimating}
        >
          ↺ リセット
        </button>
      </div>

      <style jsx>{`
        .step-controls {
          padding: 8px 12px;
          background: #16213e;
          border-top: 1px solid #2a2a4a;
        }
        .step-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .step-tab {
          min-width: 36px;
          height: 36px;
          border: 1px solid #4a4a6a;
          border-radius: 8px;
          background: #2a2a4a;
          color: #e0e0e0;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          flex-shrink: 0;
        }
        .step-tab.active {
          background: #3b82f6;
          border-color: #60a5fa;
          color: white;
        }
        .step-tab.add-btn {
          background: #1e3a5f;
          border-style: dashed;
          font-size: 18px;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          flex: 1;
          height: 40px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
          color: white;
        }
        .play-btn {
          background: #059669;
        }
        .play-btn:disabled {
          background: #374151;
          color: #6b7280;
        }
        .delete-btn {
          background: #dc2626;
          flex: 0.7;
        }
        .delete-btn:disabled {
          background: #374151;
          color: #6b7280;
        }
        .reset-btn {
          background: #6b7280;
          flex: 0.7;
        }
        .reset-btn:disabled {
          background: #374151;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
