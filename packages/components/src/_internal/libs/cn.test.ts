import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("뒤에 온 사용자 class가 같은 속성의 Tide class를 이긴다", () => {
    expect(cn("px-4 bg-primary-solid", "bg-blue-500")).toBe("px-4 bg-blue-500");
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("Semantic 색과 임의 값도 충돌을 푼다", () => {
    expect(cn("bg-blue-500", "bg-primary-solid")).toBe("bg-primary-solid");
    expect(cn("bg-primary-solid", "bg-[#ffffff]")).toBe("bg-[#ffffff]");
  });

  it("텍스트 스타일은 글자색과 따로 남고, 같은 그룹끼리는 사용자 class가 이긴다", () => {
    expect(cn("text-body-md", "text-muted")).toBe("text-body-md text-muted");
    expect(cn("text-body-md", "text-heading-lg")).toBe("text-heading-lg");
    expect(cn("text-label-md", "font-bold")).toBe("text-label-md font-bold");
  });

  it("radius와 그림자도 사용자 class가 이긴다", () => {
    expect(cn("rounded-md shadow-md", "rounded-lg")).toBe("shadow-md rounded-lg");
    expect(cn("rounded-lg shadow-md", "shadow-lg")).toBe("rounded-lg shadow-lg");
  });

  it("쌓임 단계와 duration도 사용자 class가 이긴다", () => {
    expect(cn("z-popover transition-colors duration-fast", "z-modal")).toBe(
      "transition-colors duration-fast z-modal",
    );
    expect(cn("transition-colors duration-fast", "duration-normal")).toBe(
      "transition-colors duration-normal",
    );
  });

  it("거짓 값은 무시한다", () => {
    expect(cn("p-4", false, null, undefined, { "p-2": true })).toBe("p-2");
  });
});
