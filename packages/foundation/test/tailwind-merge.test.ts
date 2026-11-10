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
  describe("타이포그래피", () => {
    it("텍스트 스타일과 글자색은 서로 지우지 않는다", () => {
      expect(twMerge("text-body-md text-muted")).toBe("text-body-md text-muted");
      expect(twMerge("text-primary text-heading-lg")).toBe("text-primary text-heading-lg");
      expect(twMerge("text-caption text-gray-700")).toBe("text-caption text-gray-700");
    });

    it("텍스트 스타일끼리는 뒤에 온 것이 이긴다", () => {
      expect(twMerge("text-body-md text-heading-lg")).toBe("text-heading-lg");
      expect(twMerge("text-display-lg text-caption")).toBe("text-caption");
      expect(twMerge("text-label-sm text-[13px]")).toBe("text-[13px]");
      expect(twMerge("md:text-body-md md:text-body-lg")).toBe("md:text-body-lg");
    });

    it("굵기와 font-family는 Tide 이름으로 충돌을 푼다", () => {
      expect(twMerge("font-normal font-bold")).toBe("font-bold");
      expect(twMerge("font-light font-semibold")).toBe("font-semibold");
      expect(twMerge("font-sans font-mono")).toBe("font-mono");
      // 굵기와 font-family는 다른 그룹이다.
      expect(twMerge("font-mono font-bold")).toBe("font-mono font-bold");
      // Tide에 없는 이름은 분류하지 않는다.
      expect(twMerge("font-sans font-serif")).toBe("font-sans font-serif");
      expect(twMerge("font-bold font-black")).toBe("font-bold font-black");
    });

    it("텍스트 스타일은 앞에 온 행간·굵기를 지우고, 뒤에 온 행간·굵기는 남긴다", () => {
      expect(twMerge("leading-tight font-bold text-body-md")).toBe("text-body-md");
      expect(twMerge("text-body-md leading-tight font-bold")).toBe(
        "text-body-md leading-tight font-bold",
      );
      // 자간과 숫자 정렬은 텍스트 스타일과 충돌하지 않는다.
      expect(twMerge("tracking-tight tabular-nums text-body-md")).toBe(
        "tracking-tight tabular-nums text-body-md",
      );
    });

    it("Tailwind 기본 크기 이름은 텍스트 스타일로 분류하지 않는다", () => {
      expect(twMerge("text-body-md text-xl")).toBe("text-body-md text-xl");
    });
  });
});
