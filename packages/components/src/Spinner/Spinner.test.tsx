// Spinner 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 09).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서도 회전이 유지되는지를
// 계산값과 Web Animations API로 단언한다(tide-v0 티켓 21: Spinner 회전은 reduced-motion에서도 유지).
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Spinner, type SpinnerProps } from "./Spinner";

const reducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";

describe("역할과 이름", () => {
  test("기본으로 status 역할과 이름 「로딩 중」을 갖는다", async () => {
    await render(<Spinner />);
    await expect.element(page.getByRole("status", { name: "로딩 중" })).toBeInTheDocument();
  });

  test("aria-label로 이름을 바꾼다", async () => {
    await render(<Spinner aria-label="목록 불러오는 중" />);
    await expect
      .element(page.getByRole("status", { name: "목록 불러오는 중" }))
      .toBeInTheDocument();
    expect(page.getByRole("status", { name: "로딩 중" }).elements()).toHaveLength(0);
  });

  test("aria-labelledby로 보이는 텍스트를 이름으로 쓸 수 있다", async () => {
    await render(
      <div>
        <Spinner aria-labelledby="loading-text" />
        <span id="loading-text">결제 확인 중</span>
      </div>,
    );
    await expect.element(page.getByRole("status", { name: "결제 확인 중" })).toBeInTheDocument();
  });

  test("버튼 안에 넣으면 이름이 버튼 이름에 들어가고, 키보드 포커스를 받지 않는다", async () => {
    await render(
      <button type="button" disabled>
        <Spinner size="sm" aria-label="저장 중" />
        저장
      </button>,
    );
    await expect.element(page.getByRole("button", { name: "저장 중 저장" })).toBeInTheDocument();
    expect(page.getByRole("status").element()).toHaveAttribute("focusable", "false");
    expect(page.getByRole("status").element()).not.toHaveAttribute("tabindex");
  });
});

describe("size", () => {
  // spec 아이콘 크기 규칙의 「텍스트 옆 아이콘」 열
  const sizes: [NonNullable<SpinnerProps["size"]>, number][] = [
    ["xs", 14],
    ["sm", 14],
    ["md", 16],
    ["lg", 20],
  ];

  test.each(sizes)("%s는 %ipx이다", async (size, px) => {
    await render(<Spinner size={size} />);
    const box = page.getByRole("status").element().getBoundingClientRect();
    expect(box.width).toBe(px);
    expect(box.height).toBe(px);
  });

  test("size를 주지 않으면 md(16px)이다", async () => {
    await render(<Spinner />);
    expect(page.getByRole("status").element().getBoundingClientRect().width).toBe(16);
  });

  test("지원하지 않는 size는 타입 오류다", () => {
    // @ts-expect-error -- size는 xs/sm/md/lg만 받는다.
    const props: SpinnerProps = { size: "xl" };
    expect(props.size).toBe("xl");
  });

  test("선 두께는 size와 관계없이 2px이다", async () => {
    await render(<Spinner size="lg" />);
    const path = page.getByRole("status").element().querySelector("path")!;
    const style = getComputedStyle(path);
    expect(style.strokeWidth).toBe("2px");
    expect(style.vectorEffect).toBe("non-scaling-stroke");
  });
});

describe("회전", () => {
  test("keyframe 회전(spin 1s linear infinite)이 움직임 줄이기에서도 돈다", async () => {
    await render(<Spinner />);
    const svg = page.getByRole("status").element();
    const style = getComputedStyle(svg);

    // 두 번째 instance는 forced-colors와 reduced-motion을 함께 켠다. 분기가 실제로 두 쪽 다 도는지 확인한다.
    expect(reducedMotion()).toBe(forcedColors());
    // reduced-motion instance에서도 같은 값이다. motion-safe:로 감싸지 않았기 때문이다.
    expect(style.animationName).toBe("spin");
    expect(style.animationDuration).toBe("1s");
    expect(style.animationTimingFunction).toBe("linear");
    expect(style.animationIterationCount).toBe("infinite");
    expect(style.animationPlayState).toBe("running");

    const [animation] = svg.getAnimations();
    expect(animation?.playState).toBe("running");
    // 실제로 시간이 흐르며 각도가 바뀐다.
    const before = getComputedStyle(svg).transform;
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(getComputedStyle(svg).transform).not.toBe(before);
  });
});

describe("색", () => {
  test("currentColor로 주변 글자색을 따르고, forced-colors에서도 원호가 보인다", async () => {
    await render(
      <div data-theme="light" className="text-primary">
        <Spinner />
      </div>,
    );
    const svg = page.getByRole("status").element();
    const path = svg.querySelector("path")!;
    const style = getComputedStyle(path);

    expect(style.stroke).toBe(getComputedStyle(svg).color);
    expect(style.stroke).not.toBe(transparent);
    expect(style.fill).toBe("none");
    if (!forcedColors()) {
      // text-primary(light blue-800)
      expect(style.stroke).toBe(getComputedStyle(svg.parentElement!).color);
    }
  });
});

describe("공통 API", () => {
  test("ref와 나머지 props를 루트 svg에 넘기고, className이 기본 class를 이긴다", async () => {
    let node: SVGSVGElement | null = null;
    await render(
      <Spinner
        ref={(element) => {
          node = element;
        }}
        id="page-spinner"
        data-testid="spinner"
        className="size-8"
      />,
    );

    expect(node).toBeInstanceOf(SVGSVGElement);
    expect(node).toHaveAttribute("id", "page-spinner");
    const svg = page.getByTestId("spinner").element();
    expect(svg).toHaveClass("size-8");
    expect(svg).not.toHaveClass("size-4");
    expect(svg.getBoundingClientRect().width).toBe(32);
  });

  test("children은 받지 않는다", () => {
    // @ts-expect-error -- Spinner는 자기 모양을 그린다.
    const props: SpinnerProps = { children: "로딩" };
    expect(props).toBeDefined();
  });
});
