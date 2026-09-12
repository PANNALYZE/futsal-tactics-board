import { describe, it, expect } from "vitest";
import { normalizeSteps, createStep, CATEGORIES, categoryLabel } from "./steps";

const players = [{ id: "home-gk", team: "home", role: "GK", number: 1, x: 50, y: 95 }];

describe("normalizeSteps", () => {
  it("旧形式（選手配列の配列）を { players, memo } に変換する", () => {
    expect(normalizeSteps([players, players])).toEqual([
      { players, memo: "", paths: {} },
      { players, memo: "", paths: {} },
    ]);
  });

  it("新形式はそのまま返し、memo が無ければ空文字を補う", () => {
    expect(normalizeSteps([{ players, memo: "a" }, { players }])).toEqual([
      { players, memo: "a", paths: {} },
      { players, memo: "", paths: {} },
    ]);
  });

  it("空・不正値は空配列にする", () => {
    expect(normalizeSteps([])).toEqual([]);
    expect(normalizeSteps(null)).toEqual([]);
    expect(normalizeSteps(undefined)).toEqual([]);
  });
});

describe("createStep", () => {
  it("選手をコピーしてステップを作る（元配列を変更しない）", () => {
    const step = createStep(players, "memo");
    expect(step).toEqual({ players, memo: "memo", paths: {} });
    expect(step.players).not.toBe(players);
    expect(step.players[0]).not.toBe(players[0]);
  });
});

describe("categoryLabel", () => {
  it("既知のカテゴリは日本語名、未知は「その他」", () => {
    expect(categoryLabel("own_kickin")).toBe("自陣キックイン");
    expect(categoryLabel("nope")).toBe("その他");
    expect(CATEGORIES.map((c) => c.key)).toEqual(["own_kickin", "opp_kickin", "corner", "other"]);
  });
});

describe("paths の保持", () => {
  it("normalizeSteps は paths がオブジェクトなら保持し、無ければ空にする", () => {
    const paths = { "home-2": [{ x: 1, y: 1 }, { x: 5, y: 5 }] };
    expect(normalizeSteps([{ players, memo: "", paths }, { players }])).toEqual([
      { players, memo: "", paths },
      { players, memo: "", paths: {} },
    ]);
  });
  it("createStep は paths を受け取れる", () => {
    const paths = { "home-2": [{ x: 1, y: 1 }, { x: 5, y: 5 }] };
    expect(createStep(players, "m", paths).paths).toEqual(paths);
    expect(createStep(players).paths).toEqual({});
  });
});
