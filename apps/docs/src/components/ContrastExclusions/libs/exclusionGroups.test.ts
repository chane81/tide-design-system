import { describe, expect, it } from "vitest";

import { firstSentence, groupExclusions } from "./exclusionGroups";

describe("groupExclusions", () => {
  it("이유가 같은 Token을 처음 나온 순서대로 묶는다", () => {
    const groups = groupExclusions([
      { token: "bg-disabled", reason: "비활성이다. 더 있다." },
      { token: "bg-overlay", reason: "막이다." },
      { token: "text-disabled", reason: "비활성이다. 더 있다." },
    ]);

    expect(groups).toEqual([
      { tokens: ["bg-disabled", "text-disabled"], summary: "비활성이다." },
      { tokens: ["bg-overlay"], summary: "막이다." },
    ]);
  });
});

describe("firstSentence", () => {
  it("괄호 뒤에서 끝나는 첫 문장까지 자른다", () => {
    expect(firstSentence("경계다(light 투명, dark gray-800). 나머지다.")).toBe(
      "경계다(light 투명, dark gray-800).",
    );
  });

  it("괄호 안 마침표에서는 자르지 않는다", () => {
    expect(firstSentence("값이다(예: 1. 2.). 다음.")).toBe("값이다(예: 1. 2.).");
  });

  it("문장 끝이 없으면 그대로 돌려준다", () => {
    expect(firstSentence("문장 끝 없음")).toBe("문장 끝 없음");
  });
});
