// 두 번째 instance(forced-colors·reduced-motion)에서도 돈다.
// 채움 방식·상태 처리는 Button과 같은 모듈이라 대표 조합만 본다. 전체 조합은 Button.test.tsx가 본다.
import { colorFamilyCss, defineColorFamily } from "@tide-design/foundation/color-family";
import Link from "next/link.js";
import type { ReactNode } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { IconButton, type IconButtonProps } from "./IconButton";

// 앱 Role(brand)을 Role 타입에 더한다(ADR 0016).
declare module "@tide-design/foundation" {
  interface RoleRegistry {
    brand: true;
  }
}

const reducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";

async function resolve(
  property: "backgroundColor" | "color" | "borderColor",
  value: string,
): Promise<string> {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  probe.style[property] = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe)[property];
  probe.remove();

  return resolved;
}

const Icon = (): ReactNode => <svg data-testid="icon" viewBox="0 0 24 24" />;

describe("역할과 이름", () => {
  test("button 역할과 aria-label 이름을 갖고, type 기본값이 button이다", async () => {
    await render(
      <IconButton aria-label="설정">
        <Icon />
      </IconButton>,
    );
    const button = page.getByRole("button", { name: "설정" });
    await expect.element(button).toBeInTheDocument();
    expect(button.element()).toHaveAttribute("type", "button");
    expect(page.getByTestId("icon").element().parentElement).toHaveAttribute("aria-hidden", "true");
  });

  test("aria-label이 없으면 타입 오류다. 지원하지 않는 variant·size도 타입 오류다", () => {
    // @ts-expect-error -- aria-label은 필수다.
    const a: IconButtonProps = { children: <Icon /> };
    // @ts-expect-error -- 아이콘(children)도 필수다.
    const b: IconButtonProps = { "aria-label": "설정" };
    // @ts-expect-error -- variant는 채움 방식 4개만 받는다.
    const c: IconButtonProps = { "aria-label": "설정", children: <Icon />, variant: "link" };
    // @ts-expect-error -- size는 xs/sm/md/lg만 받는다. 24px보다 작은 size는 없다.
    const d: IconButtonProps = { "aria-label": "설정", children: <Icon />, size: "2xs" };
    // @ts-expect-error -- color는 Role만 받는다. 장식 계열 purple도 Role이 아니다.
    const e: IconButtonProps = { "aria-label": "설정", children: <Icon />, color: "purple" };
    // @ts-expect-error -- 색 계열 이름은 받지 않는다(ADR 0016).
    const f: IconButtonProps = { "aria-label": "설정", children: <Icon />, color: "blue" };
    const ok: IconButtonProps = { "aria-label": "설정", children: <Icon />, color: "brand" };
    expect([a, b, c, d, e, f, ok]).toHaveLength(7);
  });

  test("JSX에서 aria-label을 빠뜨리면 타입 오류다", async () => {
    await render(
      // @ts-expect-error -- aria-label은 필수다.
      <IconButton data-testid="target">
        <Icon />
      </IconButton>,
    );
    expect(page.getByTestId("target").element()).not.toHaveAttribute("aria-label");
  });
});

describe("키보드와 클릭", () => {
  test("Tab으로 포커스하고 Enter와 Space로 실행한다", async () => {
    const onClick = vi.fn();
    await render(
      <IconButton aria-label="설정" onClick={onClick}>
        <Icon />
      </IconButton>,
    );
    await userEvent.tab();
    const button = page.getByRole("button", { name: "설정" });
    await expect.element(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});

describe("크기", () => {
  const sizes: [NonNullable<IconButtonProps["size"]>, number, number][] = [
    // size, 정사각형 한 변, 아이콘
    ["xs", 24, 16],
    ["sm", 32, 16],
    ["md", 40, 20],
    ["lg", 48, 24],
  ];

  test.each(sizes)("%s는 %ipx 정사각형이고 아이콘은 %ipx다", async (size, side, icon) => {
    await render(
      <IconButton aria-label="설정" size={size}>
        <svg data-testid="icon" width={24} height={24} viewBox="0 0 24 24" />
      </IconButton>,
    );
    const box = page.getByRole("button").element().getBoundingClientRect();
    expect([box.width, box.height]).toEqual([side, side]);
    const iconBox = page.getByTestId("icon").element().getBoundingClientRect();
    expect([iconBox.width, iconBox.height]).toEqual([icon, icon]);
    expect(getComputedStyle(page.getByRole("button").element()).borderRadius).toBe("6px");
  });

  test("가장 작은 size도 24×24px 이상이다(WCAG 2.5.8)", async () => {
    await render(
      <IconButton aria-label="닫기" size="xs">
        <Icon />
      </IconButton>,
    );
    const style = getComputedStyle(page.getByRole("button").element());
    expect(Number.parseFloat(style.width)).toBeGreaterThanOrEqual(24);
    expect(Number.parseFloat(style.height)).toBeGreaterThanOrEqual(24);
  });
});

describe("스타일 축", () => {
  test("기본값은 solid·primary·md이고 루트에 data-color를 붙인다", async () => {
    await render(
      <div data-theme="light" data-color="danger">
        <IconButton aria-label="설정">
          <Icon />
        </IconButton>
      </div>,
    );
    const element = page.getByRole("button").element();
    expect(element).toHaveAttribute("data-color", "primary");
    const style = getComputedStyle(element);
    expect(style.width).toBe("40px");
    if (!forcedColors()) {
      expect(style.backgroundColor).toBe(
        await resolve("backgroundColor", "var(--tide-bg-primary-solid)"),
      );
      expect(style.color).toBe(await resolve("color", "var(--tide-text-on-solid)"));
    }
  });

  test.each([
    ["ghost", "neutral", null, "text-default"],
    ["outline", "danger", null, "text-danger"],
    ["subtle", "success", "bg-success-subtle", "text-success-on-subtle"],
  ] as const)("%s × %s의 색은 Button과 같은 Token이다", async (variant, color, bg, text) => {
    if (forcedColors()) return;
    await render(
      <div data-theme="light">
        <IconButton aria-label="설정" variant={variant} color={color}>
          <Icon />
        </IconButton>
      </div>,
    );
    const style = getComputedStyle(page.getByRole("button").element());
    expect(style.backgroundColor).toBe(
      bg ? await resolve("backgroundColor", `var(--tide-${bg})`) : transparent,
    );
    expect(style.color).toBe(await resolve("color", `var(--tide-${text})`));
  });

  describe("앱 Role", () => {
    // 앱처럼 tide-color로 만든 CSS를 Tide CSS 뒤에 넣는다.
    const brand = defineColorFamily({
      name: "brand",
      scale: {
        50: "#fcf0f5",
        100: "#fee5f0",
        200: "#ebcbd9",
        300: "#e1adc4",
        400: "#dc7dac",
        500: "#c75b93",
        600: "#a85c81",
        700: "#90406a",
        800: "#793157",
        900: "#68274a",
        950: "#5c1d3f",
      },
    });
    let style: HTMLStyleElement | undefined;
    afterEach(() => style?.remove());

    test('color="brand"는 앱 Role의 계열 변수를 쓴다', async () => {
      style = document.createElement("style");
      style.textContent = colorFamilyCss([brand]);
      document.head.append(style);
      await render(
        <div data-theme="light">
          <IconButton aria-label="설정" color="brand">
            <Icon />
          </IconButton>
        </div>,
      );
      const element = page.getByRole("button").element();
      expect(element).toHaveAttribute("data-color", "brand");
      expect(getComputedStyle(element).getPropertyValue("--tide-accent-solid").trim()).toBe(
        "#a85c81",
      );
      if (!forcedColors()) {
        expect(getComputedStyle(element).backgroundColor).toBe(
          await resolve("backgroundColor", "#a85c81"),
        );
      }
    });
  });
});

describe("press 축소", () => {
  async function scaleWhilePressed(element: ReactNode): Promise<string> {
    await render(element);
    await commands.mouseDownOn("target");
    // 전환(fast 150ms)이 끝날 때까지 기다린다.
    await new Promise((resolve) => setTimeout(resolve, 250));
    const scale = getComputedStyle(page.getByTestId("target").element()).scale;
    await commands.mouseUp();

    return scale;
  }

  test("누르면 0.96으로 줄어든다. 움직임 줄이기에서는 줄어들지 않는다", async () => {
    expect(reducedMotion()).toBe(forcedColors());
    const scale = await scaleWhilePressed(
      <IconButton aria-label="설정" data-testid="target">
        <Icon />
      </IconButton>,
    );
    expect(scale).toBe(reducedMotion() ? "none" : "0.96");
  });

  test.each([
    ["noPressScale", { noPressScale: true }],
    ["disabled", { disabled: true }],
    ["loading", { loading: true }],
  ] as const)("%s면 줄어들지 않는다", async (_, extra) => {
    const scale = await scaleWhilePressed(
      <IconButton aria-label="설정" data-testid="target" {...extra}>
        <Icon />
      </IconButton>,
    );
    expect(scale).toBe("none");
  });
});

describe("포커스 표시와 forced-colors", () => {
  test("키보드 포커스에 focus-ring(outline 2px, offset 2px)이 보인다", async () => {
    await render(
      <div data-theme="light">
        <IconButton aria-label="설정" variant="ghost">
          <Icon />
        </IconButton>
      </div>,
    );
    await userEvent.tab();
    // outline 색도 transition-colors(fast 150ms) 대상이라 전환이 끝난 뒤 읽는다.
    await new Promise((resolve) => setTimeout(resolve, 250));
    const style = getComputedStyle(page.getByRole("button").element());
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("2px");
    expect(style.outlineColor).not.toBe(transparent);
    if (!forcedColors()) {
      expect(style.outlineColor).toBe(await resolve("color", "var(--tide-outline-focus)"));
    }
  });

  test("ghost의 투명 border가 고대비 모드에서 경계로 보인다", async () => {
    await render(
      <IconButton aria-label="설정" variant="ghost">
        <Icon />
      </IconButton>,
    );
    const style = getComputedStyle(page.getByRole("button").element());
    expect(style.borderTopWidth).toBe("1px");
    if (forcedColors()) expect(style.borderTopColor).not.toBe(transparent);
  });
});

describe("상태", () => {
  const cursorOf = (testId: string): string =>
    getComputedStyle(page.getByTestId(testId).element()).cursor;

  test("커서: 활성 pointer, disabled not-allowed, loading wait. 링크로 렌더해도 같다", async () => {
    await render(
      <div>
        <IconButton aria-label="a" data-testid="active">
          <Icon />
        </IconButton>
        <IconButton aria-label="b" data-testid="disabled" disabled>
          <Icon />
        </IconButton>
        <IconButton aria-label="c" data-testid="loading" loading>
          <Icon />
        </IconButton>
        <IconButton aria-label="d" data-testid="link" render={<Link href="/settings" />}>
          <Icon />
        </IconButton>
      </div>,
    );
    expect(cursorOf("active")).toBe("pointer");
    expect(cursorOf("disabled")).toBe("not-allowed");
    expect(cursorOf("loading")).toBe("wait");
    expect(cursorOf("link")).toBe("pointer");
  });

  test("disabled는 네이티브 disabled를 쓰고 클릭되지 않는다", async () => {
    const onClick = vi.fn();
    await render(
      <IconButton aria-label="설정" disabled onClick={onClick}>
        <Icon />
      </IconButton>,
    );
    const button = page.getByRole("button", { name: "설정" });
    await expect.element(button).toBeDisabled();
    expect(button.element()).not.toHaveAttribute("aria-disabled");
    (button.element() as HTMLElement).click();
    expect(onClick).not.toHaveBeenCalled();
  });

  test("로딩은 아이콘 자리에 Spinner를 보이고, 이름에 상태를 붙이고, 포커스를 남긴 채 클릭을 막는다", async () => {
    const onClick = vi.fn();
    const { rerender } = await render(
      <IconButton aria-label="새로 고침" size="lg" onClick={onClick}>
        <Icon />
      </IconButton>,
    );
    await userEvent.tab();
    await rerender(
      <IconButton aria-label="새로 고침" size="lg" onClick={onClick} loading>
        <Icon />
      </IconButton>,
    );
    const button = page.getByRole("button", { name: "새로 고침 로딩 중" });
    await expect.element(button).toHaveFocus();
    const element = button.element();
    expect(element).toHaveAttribute("aria-disabled", "true");
    expect(element).toHaveAttribute("data-loading");
    expect(element).not.toHaveAttribute("disabled");
    expect(page.getByTestId("icon").elements()).toHaveLength(0);

    const spinner = element.querySelector("svg")!;
    expect(spinner).toHaveAttribute("aria-hidden", "true");
    expect(spinner.getBoundingClientRect().width).toBe(24);

    await userEvent.keyboard("{Enter}");
    (element as HTMLElement).click();
    expect(onClick).not.toHaveBeenCalled();
  });

  test("loadingLabel로 알림 텍스트를 바꾼다", async () => {
    await render(
      <IconButton aria-label="저장" loading loadingLabel="저장하는 중">
        <Icon />
      </IconButton>,
    );
    await expect
      .element(page.getByRole("button", { name: "저장 저장하는 중" }))
      .toBeInTheDocument();
  });
});

describe("render와 공통 API", () => {
  test("Next Link로 렌더하면 props, ref, className을 병합한다", async () => {
    let node: HTMLElement | null = null;
    const onLinkClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    await render(
      <IconButton
        aria-label="설정으로 이동"
        render={<Link href="/settings" className="shadow-md" onClick={onLinkClick} />}
        ref={(element) => {
          node = element;
        }}
        className="size-14"
      >
        <Icon />
      </IconButton>,
    );
    const link = page.getByRole("link", { name: "설정으로 이동" });
    const element = link.element();
    expect(element.tagName).toBe("A");
    expect(element).toHaveAttribute("href", "/settings");
    expect(element).not.toHaveAttribute("type");
    expect(node).toBe(element);
    expect(element).toHaveClass("shadow-md");
    expect(element).toHaveClass("size-14");
    expect(element).not.toHaveClass("size-10");

    await userEvent.tab();
    await expect.element(link).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });

  test("링크로 렌더한 disabled는 aria-disabled·data-disabled를 붙이고 이동을 막는다", async () => {
    const onClick = vi.fn();
    await render(
      <IconButton aria-label="설정" render={<Link href="/settings" />} disabled onClick={onClick}>
        <Icon />
      </IconButton>,
    );
    const element = page.getByRole("link", { name: "설정" }).element();
    expect(element).toHaveAttribute("aria-disabled", "true");
    expect(element).toHaveAttribute("data-disabled");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("ref와 나머지 props를 루트 button에 넘긴다", async () => {
    let node: HTMLButtonElement | null = null;
    await render(
      <IconButton
        aria-label="설정"
        ref={(element) => {
          node = element;
        }}
        id="settings"
        aria-describedby="hint"
      >
        <Icon />
      </IconButton>,
    );
    expect(node).toBeInstanceOf(HTMLButtonElement);
    expect(node).toHaveAttribute("id", "settings");
    expect(node).toHaveAttribute("aria-describedby", "hint");
    expect(node).not.toHaveAttribute("data-loading");
    expect(node).not.toHaveAttribute("data-disabled");
  });
});
