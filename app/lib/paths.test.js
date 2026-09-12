import { describe, it, expect } from "vitest";
import { appendPoint, simplifyPath, MAX_PATH_POINTS } from "./paths";

describe("appendPoint", () => {
  it("最初の点はそのまま追加する", () => {
    expect(appendPoint([], { x: 10, y: 10 })).toEqual([{ x: 10, y: 10 }]);
  });
  it("直前の点から離れていなければ追加しない（元配列は変更しない）", () => {
    const path = [{ x: 10, y: 10 }];
    const out = appendPoint(path, { x: 10.3, y: 10.2 });
    expect(out).toBe(path);
    expect(path).toHaveLength(1);
  });
  it("離れていれば新しい配列に追加する", () => {
    const path = [{ x: 10, y: 10 }];
    const out = appendPoint(path, { x: 20, y: 10 });
    expect(out).toEqual([{ x: 10, y: 10 }, { x: 20, y: 10 }]);
    expect(out).not.toBe(path);
  });
});

describe("simplifyPath", () => {
  it("一直線上の中間点を落とす", () => {
    const path = [{ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 10, y: 10 }];
    expect(simplifyPath(path)).toEqual([{ x: 0, y: 0 }, { x: 10, y: 10 }]);
  });
  it("曲がり角は残す", () => {
    const path = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    expect(simplifyPath(path)).toEqual(path);
  });
  it("点数が上限を超えない", () => {
    const path = Array.from({ length: 300 }, (_, i) => ({ x: i / 3, y: Math.sin(i / 5) * 30 + 50 }));
    expect(simplifyPath(path).length).toBeLessThanOrEqual(MAX_PATH_POINTS);
  });
  it("2点未満はそのまま", () => {
    expect(simplifyPath([{ x: 1, y: 1 }])).toEqual([{ x: 1, y: 1 }]);
  });
});

import { smoothPath, curveSamples } from "./paths";

describe("smoothPath", () => {
  it("手ブレ（ジグザグ）をならし、始点と終点は変えない", () => {
    const zig = Array.from({ length: 21 }, (_, i) => ({ x: i * 2, y: i % 2 ? 3 : 0 }));
    const out = smoothPath(zig);
    expect(out[0]).toEqual(zig[0]);
    expect(out[out.length - 1]).toEqual(zig[zig.length - 1]);
    const maxDev = Math.max(...out.slice(1, -1).map((p) => Math.abs(p.y - 1.5)));
    expect(maxDev).toBeLessThan(1.5);
    expect(out.length).toBeLessThan(zig.length);
  });
  it("2点以下はそのまま", () => {
    const two = [{ x: 0, y: 0 }, { x: 5, y: 5 }];
    expect(smoothPath(two)).toEqual(two);
  });
});

describe("curveSamples", () => {
  const pts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
  it("始点と終点を通り、区間ごとに細分化される", () => {
    const out = curveSamples(pts, 4);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[out.length - 1]).toEqual({ x: 10, y: 10 });
    expect(out).toHaveLength(2 * 4 + 1);
  });
  it("2点なら直線の2点のまま", () => {
    expect(curveSamples(pts.slice(0, 2), 4)).toEqual(pts.slice(0, 2));
  });
});
