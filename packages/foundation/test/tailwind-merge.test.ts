// 빌드한 tailwind-merge 설정(공개 표면)을 실제 tailwind-merge 3.7.0에 넣어 충돌 해결을 확인한다.
import { extendTailwindMerge } from "tailwind-merge";
import { describe, expect, it } from "vitest";

import { tailwindMergeConfig } from "../dist/tailwind-merge.js";

const twMerge = extendTailwindMerge(tailwindMergeConfig);

describe("tailwind-merge 설정", () => {
  it("같은 namespace의 Semantic 색끼리 충돌을 푼다", () => {
    expect(twMerge("bg-canvas bg-raised")).toBe("bg-raised");
    expect(twMerge("bg-primary-solid bg-danger-subtle-hover")).toBe("bg-danger-subtle-hover");
    expect(twMerge("text-default text-muted")).toBe("text-muted");
    expect(twMerge("text-on-solid text-primary")).toBe("text-primary");
    expect(twMerge("border-default border-strong")).toBe("border-strong");
    expect(twMerge("border-t-default border-t-danger")).toBe("border-t-danger");
    expect(twMerge("divide-default divide-strong")).toBe("divide-strong");
    expect(twMerge("outline-focus outline-blue-600")).toBe("outline-blue-600");
  });

  it("Semantic 색과 Primitive 색, 임의 값끼리도 충돌을 푼다", () => {
    expect(twMerge("bg-blue-500 bg-primary-solid")).toBe("bg-primary-solid");
    expect(twMerge("text-muted text-gray-700")).toBe("text-gray-700");
    expect(twMerge("border-strong border-[#000]")).toBe("border-[#000]");
    expect(twMerge("hover:bg-primary-solid-hover hover:bg-primary-solid-active")).toBe(
      "hover:bg-primary-solid-active",
    );
  });

  it("다른 속성의 class는 남긴다", () => {
    expect(twMerge("bg-canvas text-default border-default outline-focus")).toBe(
      "bg-canvas text-default border-default outline-focus",
    );
    // 테두리 색과 두께, 외곽선 색과 두께는 다른 그룹이다.
    expect(twMerge("border-strong border-2")).toBe("border-strong border-2");
    expect(twMerge("outline-focus outline-2")).toBe("outline-focus outline-2");
    // border 전체 색과 한쪽 색: 뒤에 온 한쪽 색만 덮는다.
    expect(twMerge("border-strong border-t-danger")).toBe("border-strong border-t-danger");
  });

  it("다른 namespace의 이름이나 Tide에 없는 색은 색으로 분류하지 않는다", () => {
    // text-canvas는 class가 생기지 않으므로 text-default와 충돌하지 않는다.
    expect(twMerge("text-default text-canvas")).toBe("text-default text-canvas");
    expect(twMerge("bg-canvas bg-muted")).toBe("bg-canvas bg-muted");
    expect(twMerge("bg-blue-500 bg-slate-500")).toBe("bg-blue-500 bg-slate-500");
  });
});
