import { describe, it, expect } from "vitest";
import { pointAlongPath, interpolatePlayers } from "./animate";

const p = (id, x, y) => ({ id, team: "home", role: "FP", number: 0, x, y });

describe("pointAlongPath", () => {
  const path = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
  it("t=0 は始点、t=1 は終点", () => {
    expect(pointAlongPath(path, 0)).toEqual({ x: 0, y: 0 });
    expect(pointAlongPath(path, 1)).toEqual({ x: 10, y: 10 });
  });
  it("弧長で等速に進む（t=0.5 は角、t=0.75 は2辺目の中間）", () => {
    expect(pointAlongPath(path, 0.5)).toEqual({ x: 10, y: 0 });
    expect(pointAlongPath(path, 0.75)).toEqual({ x: 10, y: 5 });
  });
  it("範囲外の t は 0〜1 に丸める", () => {
    expect(pointAlongPath(path, -1)).toEqual({ x: 0, y: 0 });
    expect(pointAlongPath(path, 2)).toEqual({ x: 10, y: 10 });
  });
});

describe("interpolatePlayers", () => {
  it("軌跡が無い選手は直線補間、ある選手は軌跡に沿う", () => {
    const from = [p("a", 0, 0), p("b", 0, 0)];
    const to = [p("a", 10, 10), p("b", 10, 10)];
    const paths = { b: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }] };
    const mid = interpolatePlayers(from, to, paths, 0.5);
    expect(mid.find((q) => q.id === "a")).toMatchObject({ x: 5, y: 5 });
    // b は角を丸めた曲線に沿うので、直線の中点(5,5)ではなく角(10,0)の近くにいる
    const b = mid.find((q) => q.id === "b");
    expect(b.x).toBeGreaterThan(8);
    expect(b.y).toBeLessThan(3);
  });
  it("軌跡の始点・終点は from/to の位置に置き換える", () => {
    const from = [p("a", 0, 0)];
    const to = [p("a", 20, 20)];
    const paths = { a: [{ x: 5, y: 5 }, { x: 10, y: 0 }, { x: 15, y: 15 }] };
    expect(interpolatePlayers(from, to, paths, 0)[0]).toMatchObject({ x: 0, y: 0 });
    expect(interpolatePlayers(from, to, paths, 1)[0]).toMatchObject({ x: 20, y: 20 });
  });
  it("to に無い選手は from のまま", () => {
    const from = [p("a", 1, 1)];
    expect(interpolatePlayers(from, [], {}, 0.5)[0]).toMatchObject({ x: 1, y: 1 });
  });
});
