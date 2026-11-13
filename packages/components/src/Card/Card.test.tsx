// Card의 모양과 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 19).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors)에서는 경계가 시스템 색으로 남는지 본다.
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Card, type CardProps } from "./Card";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(value: string, theme = "light"): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = theme;
  probe.style.forcedColorAdjust = "none";
  probe.style.borderColor = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).borderTopColor;
  probe.remove();

  return resolved;
}

describe("역할과 이름", () => {
  test("기본은 역할이 없는 div다", async () => {
    await render(<Card data-testid="card">내용</Card>);
    const card = page.getByTestId("card").element();
    expect(card.tagName).toBe("DIV");
    expect(card).not.toHaveAttribute("role");
  });

  test("render로 article을 쓰면 article 역할이 된다", async () => {
    await render(
      <Card render={<article aria-labelledby="card-title" />}>
        <h2 id="card-title">이번 달 사용량</h2>
        <p>120GB</p>
      </Card>,
    );
    await expect.element(page.getByRole("article", { name: "이번 달 사용량" })).toBeInTheDocument();
  });

  test("render로 목록 항목을 쓰면 목록 구조가 유지된다", async () => {
    await render(
      <ul>
        <Card render={<li />}>첫째</Card>
        <Card render={<li />}>둘째</Card>
      </ul>,
    );
    expect(page.getByRole("listitem").elements()).toHaveLength(2);
  });

  test("render로 이름 붙인 section을 쓰면 region이 된다", async () => {
    await render(<Card render={<section aria-label="결제 정보" />}>카드 번호</Card>);
    await expect.element(page.getByRole("region", { name: "결제 정보" })).toBeInTheDocument();
  });
});

describe("모양", () => {
  test("surface 표면에 border만 있고 그림자가 없다. radius는 lg(8px)다", async () => {
    await render(
      <div data-theme="light">
        <Card data-testid="card">내용</Card>
      </div>,
    );
    const style = getComputedStyle(page.getByTestId("card").element());
    expect(style.borderTopLeftRadius).toBe("8px");
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopStyle).toBe("solid");
    expect(style.boxShadow).toBe("none");
    expect(style.padding).toBe("16px");
    if (forcedColors()) return;
    expect(style.backgroundColor).toBe(resolve("var(--tide-bg-surface)"));
    expect(style.borderTopColor).toBe(resolve("var(--tide-border-default)"));
    expect(style.color).toBe(resolve("var(--tide-text-default)"));
  });

  test("dark Theme에서도 surface 배경과 border-default 경계다", async () => {
    await render(
      <div data-theme="dark">
        <Card data-testid="card">내용</Card>
      </div>,
    );
    if (forcedColors()) return;
    const style = getComputedStyle(page.getByTestId("card").element());
    expect(style.backgroundColor).toBe(resolve("var(--tide-bg-surface)", "dark"));
    expect(style.borderTopColor).toBe(resolve("var(--tide-border-default)", "dark"));
  });

  test("Card에는 color·variant prop이 없다", () => {
    // @ts-expect-error -- Card는 표면 한 가지다. 색 축을 받지 않는다.
    const colored: CardProps = { variant: "raised" };
    expect(colored).toBeDefined();
  });
});

describe("forced-colors", () => {
  test("경계가 사라지지 않고 forced-colors에서는 CanvasText 경계, Canvas 배경이다", async () => {
    await render(
      <div data-theme="light">
        <Card data-testid="card">내용</Card>
      </div>,
    );
    const style = getComputedStyle(page.getByTestId("card").element());
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopColor).not.toBe(transparent);
    if (forcedColors()) {
      expect(style.borderTopColor).toBe(resolve("CanvasText"));
      expect(style.backgroundColor).toBe(resolve("Canvas"));
    }
  });
});

describe("공통 API", () => {
  test("ref와 나머지 props를 루트 요소에 넘기고, className이 기본 class를 이긴다", async () => {
    let node: HTMLDivElement | null = null;
    await render(
      <Card
        ref={(element) => {
          node = element;
        }}
        id="usage"
        data-testid="card"
        className="p-6 rounded-xl"
      >
        내용
      </Card>,
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
    const card = page.getByTestId("card").element();
    expect(card).toHaveAttribute("id", "usage");
    expect(card).toHaveClass("p-6", "rounded-xl");
    expect(card).not.toHaveClass("p-4");
    expect(card).not.toHaveClass("rounded-lg");
    expect(getComputedStyle(card).padding).toBe("24px");
    expect(getComputedStyle(card).borderTopLeftRadius).toBe("12px");
  });

  test("render 요소의 className 위에 사용자 className이 이긴다", async () => {
    await render(
      <Card render={<article className="p-2" />} className="p-0" data-testid="card">
        내용
      </Card>,
    );
    const card = page.getByTestId("card").element();
    expect(card.tagName).toBe("ARTICLE");
    expect(getComputedStyle(card).padding).toBe("0px");
  });
});
