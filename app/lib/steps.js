// ステップは { players: [...], memo: "", paths: { [playerId]: [{x,y},...] } } の配列。
// paths は「前のステップからこのステップへ動いたときの軌跡」。
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

export function createStep(players, memo = "", paths = {}) {
  return { players: clonePlayers(players), memo, paths };
}

function normalizePaths(paths) {
  return paths && typeof paths === "object" && !Array.isArray(paths) ? paths : {};
}

export function normalizeSteps(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((step) => {
      if (Array.isArray(step)) return { players: step, memo: "", paths: {} };
      if (step && Array.isArray(step.players)) {
        return { players: step.players, memo: step.memo ?? "", paths: normalizePaths(step.paths) };
      }
      return null;
    })
    .filter(Boolean);
}
