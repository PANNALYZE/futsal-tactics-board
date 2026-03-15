// Default futsal formation: 1-2-1 diamond
// GK → Fixo (底) → Ala x2 (両サイド) → Pivo (頂点)
// Court coordinates: x(0-100), y(0-100) where top=0, bottom=100

export const INITIAL_PLAYERS = [
  // Home team (blue) - bottom half, attacking upward
  // GK: ゴール真ん前
  { id: "home-gk", team: "home", role: "GK", number: 1, x: 50, y: 95 },
  // Fixo (2): ダイヤモンド底辺
  { id: "home-2", team: "home", role: "FP", number: 2, x: 50, y: 78 },
  // Ala left (3): 左サイド
  { id: "home-3", team: "home", role: "FP", number: 3, x: 25, y: 65 },
  // Ala right (4): 右サイド
  { id: "home-4", team: "home", role: "FP", number: 4, x: 75, y: 65 },
  // Pivo (5): ダイヤモンド頂点
  { id: "home-5", team: "home", role: "FP", number: 5, x: 50, y: 58 },

  // Away team (red) - top half, attacking downward (mirror diamond)
  { id: "away-gk", team: "away", role: "GK", number: 1, x: 50, y: 5 },
  // Fixo
  { id: "away-2", team: "away", role: "FP", number: 2, x: 50, y: 22 },
  // Ala left
  { id: "away-3", team: "away", role: "FP", number: 3, x: 75, y: 35 },
  // Ala right
  { id: "away-4", team: "away", role: "FP", number: 4, x: 25, y: 35 },
  // Pivo
  { id: "away-5", team: "away", role: "FP", number: 5, x: 50, y: 42 },

  // Ball
  { id: "ball", team: "ball", role: "BALL", number: 0, x: 50, y: 50 },
];
