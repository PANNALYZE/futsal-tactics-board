// ステップは { players: [...], memo: "" } の配列。
// 旧データ（選手配列の配列）は normalizeSteps で読み込み時に変換する。

export const CATEGORIES = [
  { key: "own_kickin", label: "自陣キックイン" },
  { key: "opp_kickin", label: "相手陣キックイン" },
  { key: "corner", label: "コーナーキック" },
  { key: "other", label: "その他" },
];

export function categoryLabel(key) {
  const found = CATEGORIES.find((c) => c.key === key);
  return found ? found.label : "その他";
}

function clonePlayers(players) {
  return players.map((p) => ({ ...p }));
}

export function createStep(players, memo = "") {
  return { players: clonePlayers(players), memo };
}

export function normalizeSteps(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((step) => {
      if (Array.isArray(step)) return { players: step, memo: "" };
      if (step && Array.isArray(step.players)) {
        return { players: step.players, memo: step.memo ?? "" };
      }
      return null;
    })
    .filter(Boolean);
}
