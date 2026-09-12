// 現在ステップと次ステップの配置差分から「移動の矢印」を作る（% 座標）

const MIN_DISTANCE = 3;

export function movementArrows(currentPlayers, nextPlayers) {
  if (!Array.isArray(currentPlayers) || !Array.isArray(nextPlayers)) return [];
  const nextById = new Map(nextPlayers.map((p) => [p.id, p]));
  return currentPlayers.flatMap((p) => {
    const n = nextById.get(p.id);
    if (!n) return [];
    const dx = n.x - p.x;
    const dy = n.y - p.y;
    if (Math.hypot(dx, dy) < MIN_DISTANCE) return [];
    return [{
      id: p.id,
      kind: p.role === "BALL" ? "ball" : "player",
      from: { x: p.x, y: p.y },
      to: { x: n.x, y: n.y },
    }];
  });
}
