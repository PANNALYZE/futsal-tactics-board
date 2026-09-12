// 現在ステップと次ステップの配置差分から「移動の矢印」を作る（% 座標）
// nextPaths に選手の軌跡（2点以上）があれば path として添える

const MIN_DISTANCE = 3;

export function movementArrows(currentPlayers, nextPlayers, nextPaths = {}) {
  if (!Array.isArray(currentPlayers) || !Array.isArray(nextPlayers)) return [];
  const nextById = new Map(nextPlayers.map((p) => [p.id, p]));
  return currentPlayers.flatMap((p) => {
    const n = nextById.get(p.id);
    if (!n) return [];
    const dx = n.x - p.x;
    const dy = n.y - p.y;
    if (Math.hypot(dx, dy) < MIN_DISTANCE) return [];
    const arrow = {
      id: p.id,
      kind: p.role === "BALL" ? "ball" : "player",
      team: p.team,
      from: { x: p.x, y: p.y },
      to: { x: n.x, y: n.y },
    };
    const path = nextPaths && nextPaths[p.id];
    if (Array.isArray(path) && path.length >= 2) arrow.path = path;
    return [arrow];
  });
}
