import { describe, it, expect } from "vitest";
import { movementArrows } from "./arrows";

const p = (id, role, x, y) => ({ id, team: role === "BALL" ? "ball" : "home", role, number: 0, x, y });

describe("movementArrows", () => {
  it("次ステップで動いた選手だけ矢印にする", () => {
    const cur = [p("home-2", "FP", 10, 10), p("home-3", "FP", 50, 50)];
    const next = [p("home-2", "FP", 40, 10), p("home-3", "FP", 50, 50)];
    expect(movementArrows(cur, next)).toEqual([
      { id: "home-2", kind: "player", from: { x: 10, y: 10 }, to: { x: 40, y: 10 } },
    ]);
  });

  it("ボールは kind=ball になる", () => {
    const cur = [p("ball", "BALL", 10, 10)];
    const next = [p("ball", "BALL", 10, 60)];
    expect(movementArrows(cur, next)[0].kind).toBe("ball");
  });

  it("微小な移動は矢印にしない", () => {
    const cur = [p("home-2", "FP", 10, 10)];
    const next = [p("home-2", "FP", 10.5, 10.2)];
    expect(movementArrows(cur, next)).toEqual([]);
  });

  it("次ステップが無ければ空配列", () => {
    expect(movementArrows([p("home-2", "FP", 1, 1)], null)).toEqual([]);
  });
});
