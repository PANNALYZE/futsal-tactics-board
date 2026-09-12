"use client";

export default function StepMemo({ memo, onChange, disabled }) {
  return (
    <div className="step-memo">
      <textarea
        className="memo-input"
        value={memo}
        onChange={(e) => onChange(e.target.value)}
        placeholder="このステップのメモ（誰がどこへ・狙い）"
        rows={2}
        disabled={disabled}
      />
      <style jsx>{`
        .step-memo {
          padding: 6px 12px 0;
          background: #16213e;
        }
        .memo-input {
          width: 100%;
          box-sizing: border-box;
          padding: 6px 8px;
          border: 1px solid #4a4a6a;
          border-radius: 6px;
          background: #2a2a4a;
          color: #e0e0e0;
          font-size: 13px;
          line-height: 1.4;
          resize: none;
        }
        .memo-input:disabled {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
