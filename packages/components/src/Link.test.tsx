// Link 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 14).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors)에서도 밑줄과 포커스 ring이 남는지 본다.
import { colorFamilyCss, defineColorFamily } from "@tide-design/foundation/color-family";
import NextLink from "next/link.js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Link, type LinkProps } from "./Link.tsx";

// nodenext 타입 해석은 CJS인 next/link를 module.exports({ default })로 보지만, Vite는 default를 바로 준다.
const Next = ("default" in NextLink ? NextLink.default : NextLink) as typeof NextLink.default;

// 앱 Role(brand)을 Role 타입에 더한다(앱의 augmentation과 같다. 티켓 41, ADR 0016).
declare module "@tide-design/foundation" {
  interface RoleRegistry {
    brand: true;
  }
}

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";

async function resolveColor(value: string): Promise<string> {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  probe.style.color = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}

describe("역할과 모양", () => {
  test("link 역할과 텍스트 이름, href를 갖고 밑줄이 있다", async () => {
    await render(
      <p>
        자세한 내용은 <Link href="#guide">설치 안내</Link>를 봅니다.
      </p>,
    );
    const link = page.getByRole("link", { name: "설치 안내" });
    await expect.element(link).toBeInTheDocument();
    const element = link.element();
    expect(element).toHaveAttribute("href", "#guide");
    const style = getComputedStyle(element);
    // 색만으로 링크를 구분하지 않는다(WCAG 1.4.1). 고대비 모드에서도 밑줄이 남는다.
    expect(style.textDecorationLine).toBe("underline");
    expect(style.textDecorationThickness).toBe("1px");
    expect(style.textUnderlineOffset).toBe("2px");
    expect(style.cursor).toBe("pointer");
  });

  test("글자 크기와 굵기는 주변 텍스트를 따른다", async () => {
    await render(
      <p className="text-heading-lg" data-testid="text">
        <Link href="#guide">안내</Link>
      </p>,
    );
    const text = getComputedStyle(page.getByTestId("text").element());
    const style = getComputedStyle(page.getByRole("link").element());
    expect(style.fontSize).toBe(text.fontSize);
    expect(style.fontWeight).toBe(text.fontWeight);
  });
});

describe("색 이름(data-color)", () => {
  test("기본은 primary 글자색이고, 루트에 data-color를 붙여 바깥 색을 물려받지 않는다", async () => {
    await render(
      <div data-theme="light" data-color="danger">
        <Link href="#a">안내</Link>
      </div>,
    );
    const element = page.getByRole("link").element();
    expect(element).toHaveAttribute("data-color", "primary");
    if (!forcedColors()) {
      expect(getComputedStyle(element).color).toBe(await resolveColor("var(--tide-text-primary)"));
    }
  });

  test.each([
    ["neutral", "var(--tide-text-default)"],
    ["danger", "var(--tide-text-danger)"],
    ["info", "var(--tide-text-info)"],
  ] as const)("color=%s는 그 Role의 text 슬롯을 쓴다", async (color, token) => {
    if (forcedColors()) return; // 시스템 색(LinkText)으로 바뀐다.
    await render(
      <div data-theme="light">
        <Link href="#a" color={color}>
          안내
        </Link>
      </div>,
    );
    const element = page.getByRole("link").element();
    expect(element).toHaveAttribute("data-color", color);
    expect(getComputedStyle(element).color).toBe(await resolveColor(token));
  });

  test("Role이 아닌 색 이름은 타입 오류다", () => {
    // @ts-expect-error -- color는 Role(Tide Role 6개와 augmentation한 앱 Role)만 받는다. 장식 계열 purple도 Role이 아니다.
    const a: LinkProps = { color: "purple" };
    // @ts-expect-error -- 색 계열 이름은 장식·분류 Component용이라 받지 않는다(ADR 0016).
    const b: LinkProps = { color: "blue", href: "/x" };
    const c: LinkProps = { color: "brand", href: "/x" };
    expect([a, b, c]).toHaveLength(3);
  });

  describe("앱 Role", () => {
    // 앱이 tide-color로 만든 CSS를 Tide CSS 뒤에 불러오는 것과 같은 순서로 넣는다.
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

    test('color="brand"는 앱 Role의 text 슬롯을 쓴다', async () => {
      style = document.createElement("style");
      style.textContent = colorFamilyCss([brand]);
      document.head.append(style);
      await render(
        <div data-theme="light">
          <Link href="#a" color="brand">
            안내
          </Link>
        </div>,
      );
      const element = page.getByRole("link").element();
      expect(element).toHaveAttribute("data-color", "brand");
      // light text 슬롯은 700 단계다(ADR 0022).
      expect(getComputedStyle(element).getPropertyValue("--tide-accent-text").trim()).toBe(
        "#90406a",
      );
      if (!forcedColors()) {
        expect(getComputedStyle(element).color).toBe(await resolveColor("#90406a"));
      }
    });
  });
});

describe("포커스 표시", () => {
  test("키보드 포커스에 focus-ring(outline 2px, offset 2px)이 보인다", async () => {
    await render(
      <div data-theme="light">
        <Link href="#a">안내</Link>
      </div>,
    );
    await userEvent.tab();
    const link = page.getByRole("link");
    await expect.element(link).toHaveFocus();
    const style = getComputedStyle(link.element());
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("2px");
    expect(style.outlineColor).not.toBe(transparent);
    if (!forcedColors()) {
      expect(style.outlineColor).toBe(await resolveColor("var(--tide-outline-focus)"));
    }
  });
});

describe("render", () => {
  test("Next Link로 렌더하면 props, ref, className을 병합하고 키보드로 이동한다", async () => {
    let node: HTMLAnchorElement | null = null;
    const onLinkClick = vi.fn();
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    await render(
      <div>
        <button type="button">앞</button>
        <Link
          render={<Next href="/settings" className="font-bold" onClick={onLinkClick} />}
          ref={(element) => {
            node = element;
          }}
          onClick={onClick}
          className="no-underline"
          data-testid="link"
          color="success"
        >
          설정
        </Link>
      </div>,
    );
    const link = page.getByRole("link", { name: "설정" });
    const element = link.element();
    expect(element.tagName).toBe("A");
    expect(element).toHaveAttribute("href", "/settings");
    expect(element).toHaveAttribute("data-testid", "link");
    expect(element).toHaveAttribute("data-color", "success");
    expect(node).toBe(element);
    // render 요소의 className과 사용자 className을 모두 붙이고, 사용자 className이 기본 밑줄을 이긴다.
    expect(element).toHaveClass("font-bold");
    expect(element).toHaveClass("no-underline");
    expect(element).not.toHaveClass("underline");

    // 키보드 이동: 앞 버튼 → 링크. Enter로 실행하면 두 onClick이 render 요소 → Link 순서로 불린다.
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(link).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onLinkClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLinkClick.mock.invocationCallOrder[0]).toBeLessThan(
      onClick.mock.invocationCallOrder[0]!,
    );
    expect(location.pathname).not.toBe("/settings");
  });

  test("render 요소의 children도 텍스트로 쓴다", async () => {
    await render(<Link render={<a href="#top">맨 위로</a>} />);
    await expect.element(page.getByRole("link", { name: "맨 위로" })).toBeInTheDocument();
  });
});

describe("공통 API", () => {
  test("ref와 나머지 a 속성을 루트에 넘긴다", async () => {
    let node: HTMLAnchorElement | null = null;
    await render(
      <Link
        href="https://example.com"
        target="_blank"
        rel="noreferrer"
        aria-describedby="hint"
        ref={(element) => {
          node = element;
        }}
      >
        외부 문서
      </Link>,
    );
    expect(node).toBeInstanceOf(HTMLAnchorElement);
    expect(node).toHaveAttribute("target", "_blank");
    expect(node).toHaveAttribute("rel", "noreferrer");
    expect(node).toHaveAttribute("aria-describedby", "hint");
  });
});
