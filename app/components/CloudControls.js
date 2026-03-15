"use client";

import { useState, useEffect, useCallback } from "react";

const MAX_TACTICS = 20;

export default function CloudControls({ steps, onLoadTactic, loadedTacticId, loadedTacticName }) {
  const [tacticName, setTacticName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [tacticsList, setTacticsList] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const fetchTactics = useCallback(async () => {
    try {
      const res = await fetch("/api/tactics");
      const data = await res.json();
      if (data.tactics) {
        setTacticsList(data.tactics);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchTactics();
    }
  }, [isOpen, fetchTactics]);

  // 上書き保存
  const handleOverwrite = async () => {
    if (steps.length === 0) {
      setMessage("ステップを記録してから保存してください");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await fetch(`/api/tactics/${loadedTacticId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: loadedTacticName, steps }),
      });
      setMessage(`「${loadedTacticName}」を上書き保存しました`);
      fetchTactics();
    } catch {
      setMessage("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  // 新規保存
  const handleSaveNew = async () => {
    if (!tacticName.trim()) {
      setMessage("戦術名を入力してください");
      return;
    }
    if (steps.length === 0) {
      setMessage("ステップを記録してから保存してください");
      return;
    }
    if (tacticsList.length >= MAX_TACTICS) {
      setMessage("登録上限（20個）に達しています。不要な戦術を削除してください。");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/tactics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tacticName.trim(), steps }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
      } else if (data.id) {
        setMessage(`「${tacticName.trim()}」を保存しました`);
        setTacticName("");
        fetchTactics();
      }
    } catch {
      setMessage("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = async (tactic) => {
    try {
      const res = await fetch(`/api/tactics/${tactic.id}`);
      const data = await res.json();
      if (data.steps) {
        onLoadTactic(data.steps, data.name, tactic.id);
        setMessage(`「${data.name}」を読み込みました`);
        setIsOpen(false);
      }
    } catch {
      setMessage("読み込みに失敗しました");
    }
  };

  const handleRename = async (id) => {
    if (!editingName.trim()) return;
    try {
      await fetch(`/api/tactics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      setEditingId(null);
      setEditingName("");
      fetchTactics();
    } catch {
      setMessage("名前の変更に失敗しました");
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await fetch(`/api/tactics/${id}`, { method: "DELETE" });
      setConfirmDeleteId(null);
      fetchTactics();
    } catch {
      setMessage("削除に失敗しました");
    }
  };

  return (
    <div className="cloud-controls">
      <button
        className="cloud-toggle"
        onClick={() => { setIsOpen(!isOpen); setConfirmDeleteId(null); }}
      >
        {isOpen ? "✕ 閉じる" : "📁 保存・読込"}
      </button>

      {isOpen && (
        <div className="cloud-panel">
          {/* 上書き保存 */}
          {loadedTacticId && (
            <div className="cloud-section">
              <span className="loaded-name">編集中: {loadedTacticName}</span>
              <button
                className="cloud-btn overwrite-btn"
                onClick={handleOverwrite}
                disabled={saving}
              >
                {saving ? "..." : "上書き保存"}
              </button>
            </div>
          )}

          {/* 新規保存 */}
          <div className="cloud-section">
            <input
              type="text"
              placeholder="新しい戦術名を入力"
              value={tacticName}
              onChange={(e) => setTacticName(e.target.value)}
              className="cloud-input"
            />
            <button
              className="cloud-btn save-btn"
              onClick={handleSaveNew}
              disabled={saving}
            >
              {saving ? "..." : "新規保存"}
            </button>
          </div>

          {/* 保存済み戦術一覧 */}
          {tacticsList.length > 0 ? (
            <div className="tactics-list">
              <p className="list-label">保存済みの戦術 ({tacticsList.length}/{MAX_TACTICS}):</p>
              {tacticsList.map((t) => (
                <div key={t.id}>
                  <div
                    className={`tactic-item ${t.id === loadedTacticId ? "current" : ""}`}
                    onClick={() => editingId !== t.id && handleSelect(t)}
                  >
                    {editingId === t.id ? (
                      <div className="rename-form" onClick={(e) => e.stopPropagation()}>
                        <input
                          className="rename-input"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => { if (e.key === "Enter") handleRename(t.id); }}
                        />
                        <button className="confirm-btn yes" onClick={() => handleRename(t.id)}>OK</button>
                        <button className="confirm-btn no" onClick={() => setEditingId(null)}>戻る</button>
                      </div>
                    ) : confirmDeleteId === t.id ? (
                      <div className="confirm-delete">
                        <span className="confirm-text">削除する？</span>
                        <button
                          className="confirm-btn yes"
                          onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(t.id); }}
                        >
                          はい
                        </button>
                        <button
                          className="confirm-btn no"
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                        >
                          いいえ
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="tactic-name">{t.name}</span>
                        <div className="tactic-actions">
                          <button
                            className="tactic-rename-btn"
                            onClick={(e) => { e.stopPropagation(); setEditingId(t.id); setEditingName(t.name); setConfirmDeleteId(null); }}
                          >
                            名前変更
                          </button>
                          <button
                            className="tactic-delete-btn"
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(t.id); setEditingId(null); }}
                          >
                            削除
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="cloud-message">まだ保存された戦術はありません</p>
          )}

          {message && <p className="cloud-message">{message}</p>}
        </div>
      )}

      <style jsx>{`
        .cloud-controls {
          padding: 8px 12px;
          background: #16213e;
          border-top: 1px solid #2a2a4a;
        }
        .cloud-toggle {
          width: 100%;
          padding: 8px;
          background: #1e3a5f;
          border: 1px solid #4a4a6a;
          border-radius: 8px;
          color: #e0e0e0;
          font-size: 14px;
          cursor: pointer;
        }
        .cloud-panel {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cloud-section {
          display: flex;
          gap: 8px;
        }
        .cloud-input {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid #4a4a6a;
          border-radius: 6px;
          background: #2a2a4a;
          color: #e0e0e0;
          font-size: 13px;
        }
        .cloud-btn {
          padding: 8px 14px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
          color: white;
          white-space: nowrap;
        }
        .save-btn { background: #2563eb; }
        .overwrite-btn { background: #d97706; }
        .loaded-name {
          flex: 1;
          font-size: 13px;
          color: #fbbf24;
          display: flex;
          align-items: center;
        }
        .list-label {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 4px;
        }
        .tactics-list {
          max-height: 200px;
          overflow-y: auto;
        }
        .tactic-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: #2a2a4a;
          border-radius: 6px;
          margin-bottom: 4px;
          cursor: pointer;
        }
        .tactic-item.current {
          border: 1px solid #fbbf24;
        }
        .tactic-item:active {
          background: #3b82f6;
        }
        .tactic-name {
          font-size: 14px;
          color: #e0e0e0;
          flex: 1;
        }
        .tactic-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }
        .tactic-rename-btn {
          background: #4b5563;
          border: none;
          color: white;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        }
        .rename-form {
          display: flex;
          gap: 4px;
          width: 100%;
          align-items: center;
        }
        .rename-input {
          flex: 1;
          padding: 4px 8px;
          border: 1px solid #60a5fa;
          border-radius: 4px;
          background: #1e3a5f;
          color: #e0e0e0;
          font-size: 13px;
        }
        .tactic-delete-btn {
          background: #dc2626;
          border: none;
          color: white;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        .confirm-delete {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .confirm-text {
          font-size: 11px;
          color: #f87171;
        }
        .confirm-btn {
          border: none;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .confirm-btn.yes {
          background: #dc2626;
          color: white;
        }
        .confirm-btn.no {
          background: #4b5563;
          color: white;
        }
        .cloud-message {
          font-size: 12px;
          color: #93c5fd;
          text-align: center;
          padding: 4px;
        }
      `}</style>
    </div>
  );
}
