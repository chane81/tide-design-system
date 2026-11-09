import { describe, expect, it } from "vitest";

import { cn } from "../src/index.ts";

describe("cn", () => {
  it("뒤에 온 사용자 class가 같은 속성의 Tide class를 이긴다", () => {
    expect(cn("px-4 bg-primary-solid", "bg-blue-500")).toBe("px-4 bg-blue-500");
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("Semantic 색과 임의 값도 충돌을 푼다", () => {
    expect(cn("bg-blue-500", "bg-primary-solid")).toBe("bg-primary-solid");
    expect(cn("bg-primary-solid", "bg-[#ffffff]")).toBe("bg-[#ffffff]");
  });

  it("거짓 값은 무시한다", () => {
    expect(cn("p-4", false, null, undefined, { "p-2": true })).toBe("p-2");
  });
});
