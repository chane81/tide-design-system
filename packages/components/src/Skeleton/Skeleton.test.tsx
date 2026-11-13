// 두 번째 instance(forced-colors·reduced-motion)에서도 돈다.
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Skeleton, type SkeletonProps } from "./Skeleton";

const reducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;

function resolve(value: string, theme: "light" | "dark" = "light"): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = theme;
  probe.style.forcedColorAdjust = "none";
  probe.style.borderColor = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).borderTopColor;
  probe.remove();

  return resolved;
}

const byTestId = (id: string): HTMLElement => page.getByTestId(id).element() as HTMLElement;

describe("스크린 리더", () => {
  test("aria-hidden이라 접근성 트리에 나오지 않는다", async () => {
    await render(
      <section aria-label="댓글" aria-busy="true">
        <Skeleton data-testid="skeleton" />
        <Skeleton variant="circle" />
      </section>,
    );
    expect(byTestId("skeleton")).toHaveAttribute("aria-hidden", "true");
    await expect
      .element(page.getByRole("region", { name: "댓글" }))
      .toMatchAriaInlineSnapshot(`- region "댓글"`);
  });

  test("aria-hidden과 children은 받지 않는다", () => {
    // @ts-expect-error -- Skeleton은 늘 숨겨진다.
    const hidden: SkeletonProps = { "aria-hidden": false };
    // @ts-expect-error -- 안에 내용을 넣지 않는다. 내용이 오면 Skeleton을 내용으로 바꾼다.
    const children: SkeletonProps = { children: "불러오는 중" };
    expect([hidden, children]).toHaveLength(2);
  });
});

describe("깜빡임과 움직임 줄이기", () => {
  test("keyframe 깜빡임(pulse 2s infinite)이 돌고, 움직임 줄이기에서는 멈춘다", async () => {
    await render(<Skeleton data-testid="skeleton" />);
    const element = byTestId("skeleton");
    const style = getComputedStyle(element);

    // 두 번째 instance는 forced-colors와 reduced-motion을 함께 켠다.
    expect(reducedMotion()).toBe(forcedColors());
    if (reducedMotion()) {
      expect(style.animationName).toBe("none");
      expect(element.getAnimations()).toHaveLength(0);
      expect(style.opacity).toBe("1");
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(getComputedStyle(element).opacity).toBe("1");
    } else {
      expect(style.animationName).toBe("pulse");
      expect(style.animationDuration).toBe("2s");
      expect(style.animationIterationCount).toBe("infinite");
      expect(style.animationTimingFunction).toBe("cubic-bezier(0.4, 0, 0.6, 1)");
      const [animation] = element.getAnimations();
      expect(animation?.playState).toBe("running");
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(Number(getComputedStyle(element).opacity)).toBeLessThan(1);
    }
    expect(element.getBoundingClientRect().height).toBeGreaterThan(0);
  });
});

describe("모양", () => {
  test("기본(text)은 글 한 줄: 높이 1em, 너비 100%, radius sm이다", async () => {
    await render(
      <div className="w-[200px] text-[20px]">
        <Skeleton data-testid="skeleton" />
      </div>,
    );
    const box = byTestId("skeleton").getBoundingClientRect();
    expect(box.height).toBe(20);
    expect(box.width).toBe(200);
    expect(getComputedStyle(byTestId("skeleton")).borderTopLeftRadius).toBe("4px");
  });

  test("rect는 너비 100%, radius md이고 높이는 className으로 준다", async () => {
    await render(
      <div className="w-[240px]">
        <Skeleton variant="rect" className="h-30" data-testid="skeleton" />
      </div>,
    );
    const box = byTestId("skeleton").getBoundingClientRect();
    expect(box.width).toBe(240);
    expect(box.height).toBe(120);
    expect(getComputedStyle(byTestId("skeleton")).borderTopLeftRadius).toBe("6px");
  });

  test.each([
    ["xs", 24],
    ["sm", 32],
    ["md", 40],
    ["lg", 48],
  ] as const)("circle %s는 지름 %ipx 원이다", async (size, px) => {
    await render(<Skeleton variant="circle" size={size} data-testid="skeleton" />);
    const element = byTestId("skeleton");
    const box = element.getBoundingClientRect();
    expect(box.width).toBe(px);
    expect(box.height).toBe(px);
    expect(Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)).toBeGreaterThan(px);
  });

  test("circle에 size를 주지 않으면 md(40px)이고, flex 안에서 줄어들지 않는다", async () => {
    await render(
      <div className="flex w-[20px]">
        <Skeleton variant="circle" data-testid="skeleton" />
        <Skeleton variant="rect" className="h-4" />
      </div>,
    );
    expect(byTestId("skeleton").getBoundingClientRect().width).toBe(40);
  });

  test("size는 circle에만 있고, 지원하지 않는 값은 타입 오류다", () => {
    // @ts-expect-error -- text·rect는 size를 받지 않는다(크기는 className으로 준다).
    const text: SkeletonProps = { variant: "text", size: "md" };
    // @ts-expect-error -- circle size는 xs/sm/md/lg다.
    const circle: SkeletonProps = { variant: "circle", size: "xl" };
    // @ts-expect-error -- 지원하지 않는 variant다.
    const variant: SkeletonProps = { variant: "square" };
    expect([text, circle, variant]).toHaveLength(3);
  });
});

describe("색과 forced-colors", () => {
  test.each(["light", "dark"] as const)(
    "%s: 배경은 bg-neutral-subtle-active이고 경계는 투명하다",
    async (theme) => {
      await render(
        <div data-theme={theme}>
          <Skeleton data-testid="skeleton" />
        </div>,
      );
      const style = getComputedStyle(byTestId("skeleton"));
      if (forcedColors()) return;
      expect(style.backgroundColor).toBe(resolve("var(--tide-bg-neutral-subtle-active)", theme));
      expect(style.borderTopColor).toBe("rgba(0, 0, 0, 0)");
    },
  );

  test("forced-colors에서는 배경이 Canvas가 되고 경계가 CanvasText로 남아 모양이 보인다", async () => {
    await render(
      <div data-theme="light">
        <Skeleton variant="circle" data-testid="skeleton" />
      </div>,
    );
    const style = getComputedStyle(byTestId("skeleton"));
    expect(style.borderTopWidth).toBe("1px");
    if (forcedColors()) {
      expect(style.backgroundColor).toBe(resolve("Canvas"));
      expect(style.borderTopColor).toBe(resolve("CanvasText"));
    }
  });
});

describe("공통 API", () => {
  test("ref와 나머지 props를 루트 div에 넘기고, className이 기본 class를 이긴다", async () => {
    let node: HTMLDivElement | null = null;
    await render(
      <div className="w-[300px]">
        <Skeleton
          ref={(element) => {
            node = element;
          }}
          id="title-skeleton"
          className="w-1/2 rounded-none"
          data-testid="skeleton"
        />
      </div>,
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
    const element = byTestId("skeleton");
    expect(element).toHaveAttribute("id", "title-skeleton");
    expect(element).toHaveClass("w-1/2", "rounded-none");
    expect(element).not.toHaveClass("w-full");
    expect(element).not.toHaveClass("rounded-sm");
    expect(element.getBoundingClientRect().width).toBe(150);
    expect(getComputedStyle(element).borderTopLeftRadius).toBe("0px");
  });
});
