// 두 번째 instance(forced-colors)에서도 돈다.
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Separator, type SeparatorProps } from "./Separator";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;

function resolve(value: string): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  probe.style.forcedColorAdjust = "none";
  probe.style.borderColor = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).borderTopColor;
  probe.remove();

  return resolved;
}

describe("역할과 이름", () => {
  test("기본은 네이티브 hr이고 가로 separator 역할이다", async () => {
    await render(<Separator />);
    const separator = page.getByRole("separator");
    await expect.element(separator).toBeInTheDocument();
    const element = separator.element();
    expect(element.tagName).toBe("HR");
    expect(element).not.toHaveAttribute("role");
    expect(element).not.toHaveAttribute("aria-orientation");
    expect(element).toHaveAttribute("data-orientation", "horizontal");
  });

  test("세로는 aria-orientation=vertical이다", async () => {
    await render(<Separator orientation="vertical" />);
    const element = page.getByRole("separator").element();
    expect(element).toHaveAttribute("aria-orientation", "vertical");
    expect(element).toHaveAttribute("data-orientation", "vertical");
  });

  test("decorative면 role=none이라 보조 기술에서 빠진다", async () => {
    await render(
      <div>
        <Separator decorative data-testid="line" />
        <Separator decorative orientation="vertical" data-testid="vertical" />
      </div>,
    );
    expect(page.getByRole("separator").elements()).toHaveLength(0);
    const line = page.getByTestId("line").element();
    expect(line).toHaveAttribute("role", "none");
    expect(page.getByTestId("vertical").element()).not.toHaveAttribute("aria-orientation");
  });

  test("aria-label로 구분의 이름을 줄 수 있다", async () => {
    await render(<Separator aria-label="고급 설정" />);
    await expect.element(page.getByRole("separator", { name: "고급 설정" })).toBeInTheDocument();
  });

  test("지원하지 않는 orientation과 role은 타입 오류다", () => {
    // @ts-expect-error -- orientation은 horizontal/vertical만 받는다.
    const diagonal: SeparatorProps = { orientation: "diagonal" };
    // @ts-expect-error -- 역할은 decorative로 고른다. role을 직접 받지 않는다.
    const presentation: SeparatorProps = { role: "presentation" };
    expect([diagonal.orientation, presentation]).toEqual(["diagonal", { role: "presentation" }]);
  });
});

describe("모양", () => {
  test("가로는 폭을 채우는 1px 위쪽 경계이고 바깥 여백이 없다", async () => {
    await render(
      <div data-theme="light" style={{ width: 200 }}>
        <Separator />
      </div>,
    );
    const element = page.getByRole("separator").element();
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    expect(box.width).toBe(200);
    expect(box.height).toBe(1);
    expect(style.marginTop).toBe("0px");
    expect(style.marginLeft).toBe("0px");
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderBottomWidth).toBe("0px");
    expect(style.borderLeftWidth).toBe("0px");
    if (forcedColors()) return;
    expect(style.borderTopColor).toBe(resolve("var(--tide-border-default)"));
  });

  test("세로는 flex 줄 높이만큼 늘어나는 1px 시작쪽 경계다", async () => {
    await render(
      <div data-theme="light" className="flex items-center gap-2" style={{ height: 40 }}>
        <span>왼쪽</span>
        <Separator orientation="vertical" />
        <span>오른쪽</span>
      </div>,
    );
    const element = page.getByRole("separator").element();
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    expect(box.width).toBe(1);
    expect(box.height).toBe(40);
    expect(style.borderLeftWidth).toBe("1px");
    expect(style.borderTopWidth).toBe("0px");
    if (forcedColors()) return;
    expect(style.borderLeftColor).toBe(resolve("var(--tide-border-default)"));
  });

  test("RTL에서 세로 경계는 시작쪽(오른쪽)에 그려진다", async () => {
    await render(
      <div dir="rtl" className="flex" style={{ height: 20 }}>
        <Separator orientation="vertical" />
      </div>,
    );
    const style = getComputedStyle(page.getByRole("separator").element());
    expect(style.borderRightWidth).toBe("1px");
    expect(style.borderLeftWidth).toBe("0px");
  });

  test("className으로 바깥 여백을 준다", async () => {
    await render(<Separator className="my-4" />);
    const style = getComputedStyle(page.getByRole("separator").element());
    expect(style.marginTop).toBe("16px");
    expect(style.marginBottom).toBe("16px");
  });
});

describe("forced-colors", () => {
  test("forced-colors에서도 선이 CanvasText로 보인다", async () => {
    await render(
      <div data-theme="light">
        <Separator />
        <Separator decorative data-testid="line" />
      </div>,
    );
    for (const element of [
      page.getByRole("separator").element(),
      page.getByTestId("line").element(),
    ]) {
      const style = getComputedStyle(element);
      expect(style.borderTopWidth).toBe("1px");
      expect(style.borderTopStyle).toBe("solid");
      if (forcedColors()) {
        expect(style.borderTopColor).toBe(resolve("CanvasText"));
      }
    }
  });
});

describe("공통 API", () => {
  test("ref와 나머지 props를 루트 hr에 넘기고, className이 기본 class를 이긴다", async () => {
    let node: HTMLHRElement | null = null;
    await render(
      <Separator
        ref={(element) => {
          node = element;
        }}
        id="divider"
        className="border-strong"
      />,
    );
    expect(node).toBeInstanceOf(HTMLHRElement);
    const element = page.getByRole("separator").element();
    expect(element).toHaveAttribute("id", "divider");
    expect(element).toHaveClass("border-strong");
    expect(element).not.toHaveClass("border-default");
  });
});
