import * as icons from "@tide-design/icons";
import { describe, expect, it } from "vitest";

import { buildIconIndex, iconIndex, importStatement, searchIcons } from "./iconSearch";

const index = buildIconIndex(
  { HouseIcon: "house", ArrowDownIcon: "arrow-down", ArrowUpIcon: "arrow-up", XIcon: "x" },
  { house: ["home", "living"], "arrow-down": ["direction"], x: ["close", "cancel"] },
);
const names = (query: string): string[] => searchIcons(index, query).map(({ name }) => name);

describe("searchIcons", () => {
  it("빈 검색어는 전부 돌려준다", () => {
    expect(names("  ")).toEqual(["ArrowDownIcon", "ArrowUpIcon", "HouseIcon", "XIcon"]);
  });

  it("Tide 이름으로 찾는다(대소문자, 공백, 하이픈 무시)", () => {
    expect(names("House")).toEqual(["HouseIcon"]);
    expect(names("arrow down")).toEqual(["ArrowDownIcon"]);
    expect(names("arrow-down")).toEqual(["ArrowDownIcon"]);
    expect(names("arrow")).toEqual(["ArrowDownIcon", "ArrowUpIcon"]);
  });

  it("태그로 찾는다", () => {
    expect(names("home")).toEqual(["HouseIcon"]);
    expect(names("close")).toEqual(["XIcon"]);
  });

  it("이름이 같은 것, 이름이 검색어로 시작하는 것, 이름에 든 것, 태그가 같은 것 순서로 둔다", () => {
    const ranked = buildIconIndex(
      {
        AlarmClockPlusIcon: "alarm-clock-plus",
        CirclePlusIcon: "circle-plus",
        CrossIcon: "cross",
        PlusIcon: "plus",
        PlusSquareIcon: "plus-square",
        AddIcon: "add",
      },
      { cross: ["plus"], add: ["plus sign"] },
    );
    expect(searchIcons(ranked, "plus").map(({ name }) => name)).toEqual([
      "PlusIcon",
      "PlusSquareIcon",
      "AlarmClockPlusIcon",
      "CirclePlusIcon",
      "CrossIcon",
      "AddIcon",
    ]);
  });

  it("검색어 낱말이 모두 맞아야 한다", () => {
    expect(names("arrow direction")).toEqual(["ArrowDownIcon"]);
    expect(names("house close")).toEqual([]);
  });
});

describe("실제 검색 목록", () => {
  it("이름표의 이름이 모두 실제 export다", () => {
    const exported = new Set(Object.keys(icons));
    expect(iconIndex.filter(({ name }) => !exported.has(name))).toEqual([]);
    expect(iconIndex).toHaveLength(exported.size);
  });

  it("모든 아이콘에 태그가 하나 이상 붙는다", () => {
    expect(iconIndex.filter(({ keywords }) => keywords.length < 2).map(({ name }) => name)).toEqual(
      [],
    );
  });

  it("import 문을 만든다", () => {
    expect(importStatement("PlusIcon")).toBe('import { PlusIcon } from "@tide-design/icons";');
  });
});
