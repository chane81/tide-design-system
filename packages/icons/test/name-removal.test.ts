// 이름표에서 키가 빠졌을 때 minor changeset을 요구하는 규칙(spec 테스트 표 ① icons).
// 실제 이름표를 base로 두고 head를 바꿔 본다. changeset 모양은 `changeset status --output`(@changesets/cli 3.0.3)과 같다.
import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { nameRemovalProblem, removedNameKeys } from "../scripts/name-removal.ts";

const base = JSON.parse(
  await readFile(new URL("../icon-names.json", import.meta.url), "utf8"),
) as Record<string, string>;

function without(...keys: string[]): Record<string, string> {
  return Object.fromEntries(Object.entries(base).filter(([key]) => !keys.includes(key)));
}

const iconsMinor = {
  id: "rename-house",
  releases: [{ name: "@tide-design/icons", type: "minor" }],
};
const iconsPatch = { id: "fix-house", releases: [{ name: "@tide-design/icons", type: "patch" }] };
const componentsMinor = {
  id: "components-break",
  releases: [{ name: "@tide-design/components", type: "minor" }],
};
const empty = { id: "docs-only", releases: [] };

describe("이름표에서 빠진 키", () => {
  it("키를 지우면 그 키가 빠진 것으로 나온다", () => {
    expect(removedNameKeys(base, without("HouseIcon", "PlusIcon"))).toEqual([
      "HouseIcon",
      "PlusIcon",
    ]);
  });

  it("키 이름을 바꾸면 옛 키가 빠진 것으로 나온다", () => {
    const head = { ...without("HouseIcon"), HomeIcon: "house" };
    expect(removedNameKeys(base, head)).toEqual(["HouseIcon"]);
  });

  it("키를 더하거나 원본 SVG만 바꾸면 빠진 키가 없다", () => {
    const head = { ...base, HouseIcon: "house-renamed", BrandNewIcon: "brand-new" };
    expect(removedNameKeys(base, head)).toEqual([]);
  });
});

describe("minor changeset 요구", () => {
  it("빠진 키가 없으면 changeset 종류와 상관없이 통과한다", () => {
    expect(nameRemovalProblem([], [])).toBeNull();
    expect(nameRemovalProblem([], [iconsPatch])).toBeNull();
  });

  it("빠진 키가 있는데 changeset이 없거나 empty뿐이면 실패한다", () => {
    expect(nameRemovalProblem(["HouseIcon"], [])).toContain("HouseIcon");
    expect(nameRemovalProblem(["HouseIcon"], [empty])).toContain("HouseIcon");
  });

  it("icons가 patch뿐이면 실패한다", () => {
    expect(nameRemovalProblem(["HouseIcon"], [iconsPatch])).toContain(
      '"@tide-design/icons": minor',
    );
  });

  it("다른 패키지의 minor로는 통과하지 않는다", () => {
    expect(nameRemovalProblem(["HouseIcon"], [componentsMinor])).not.toBeNull();
  });

  it("icons minor changeset이 하나라도 있으면 통과한다", () => {
    expect(nameRemovalProblem(["HouseIcon"], [iconsPatch, iconsMinor])).toBeNull();
  });

  it("빠진 키가 많으면 앞의 20개만 적고 나머지 개수를 알린다", () => {
    const removed = Object.keys(base).slice(0, 25);
    const message = nameRemovalProblem(removed, []) ?? "";
    expect(message).toContain("키 25개");
    expect(message).toContain("외 5개");
    expect(message).not.toContain(removed[24]);
  });
});
