// Button 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 13).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는
// press 축소가 빠지는지, 투명 border·포커스 ring이 보이는지를 계산값으로 단언한다.
import { color } from "@tide-design/foundation";
import { colorFamilyCss, defineColorFamily } from "@tide-design/foundation/color-family";
import NextLink from "next/link.js";
import type { ReactNode } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Button, type ButtonProps } from "./Button.tsx";

// nodenext 타입 해석은 CJS인 next/link를 module.exports({ default })로 보지만, Vite는 default를 바로 준다.
// 두 경우 모두 Link Component를 꺼낸다.
const Link = ("default" in NextLink ? NextLink.default : NextLink) as typeof NextLink.default;

// 앱 Role(brand)을 Role 타입에 더한다(앱의 augmentation과 같다. 티켓 41, ADR 0016).
// 테스트 안에서는 interface를 선언한 foundation을 넓힌다. 앱이 `@tide-design/components`를 넓히는 경우는 smoke가 본다.
declare module "@tide-design/foundation" {
  interface RoleRegistry {
    brand: true;
  }
}

function rgb(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

const reducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
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

describe("역할과 이름", () => {
  test("button 역할과 텍스트 이름을 갖고, 폼을 제출하지 않도록 type 기본값이 button이다", async () => {
    await render(<Button>저장</Button>);
    const button = page.getByRole("button", { name: "저장" });
    await expect.element(button).toBeInTheDocument();
    expect(button.element()).toHaveAttribute("type", "button");
  });

  test("type을 주면 그대로 쓴다", async () => {
    await render(<Button type="submit">보내기</Button>);
    expect(page.getByRole("button").element()).toHaveAttribute("type", "submit");
  });

  test("아이콘은 장식용이라 이름에 들어가지 않는다. 다른 라이브러리의 ReactNode도 받는다", async () => {
    const OtherIcon = (): ReactNode => (
      <svg
        data-testid="other"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        role="img"
        aria-label="별"
      >
        <circle cx={12} cy={12} r={10} fill="currentColor" />
      </svg>
    );
    await render(
      <Button startIcon={<OtherIcon />} endIcon={<span data-testid="emoji">→</span>}>
        즐겨찾기
      </Button>,
    );
    await expect.element(page.getByRole("button", { name: "즐겨찾기" })).toBeInTheDocument();
    const svg = page.getByTestId("other").element();
    expect(svg.parentElement).toHaveAttribute("aria-hidden", "true");
    expect(page.getByTestId("emoji").element().parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    // 다른 라이브러리 아이콘의 width/height(24)를 덮어써 md 크기(16px)가 된다.
    const box = svg.getBoundingClientRect();
    expect([box.width, box.height]).toEqual([16, 16]);
  });
});

describe("키보드와 클릭", () => {
  test("Tab으로 포커스하고 Enter와 Space로 실행한다", async () => {
    const onClick = vi.fn();
    await render(<Button onClick={onClick}>저장</Button>);
    await userEvent.tab();
    const button = page.getByRole("button", { name: "저장" });
    await expect.element(button).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);

    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});

describe("스타일 축", () => {
  const sizes: [NonNullable<ButtonProps["size"]>, number, string, number][] = [
    // size, 높이, 텍스트 스타일, 텍스트 옆 아이콘
    ["xs", 24, "label-sm", 14],
    ["sm", 32, "label-md", 14],
    ["md", 40, "label-md", 16],
    ["lg", 48, "label-lg", 20],
  ];

  test.each(sizes)(
    "%s는 높이 %ipx, 텍스트 스타일 %s, 아이콘 %ipx, radius md(6px)다",
    async (size, height, textStyle, icon) => {
      await render(
        <div>
          <Button size={size} startIcon={<svg data-testid="icon" />}>
            저장
          </Button>
          <span data-testid="text" className={`text-${textStyle}`}>
            저장
          </span>
        </div>,
      );
      const button = page.getByRole("button").element();
      const style = getComputedStyle(button);
      const text = getComputedStyle(page.getByTestId("text").element());

      expect(button.getBoundingClientRect().height).toBe(height);
      expect(style.borderRadius).toBe("6px");
      expect(style.alignItems).toBe("center");
      expect(style.fontSize).toBe(text.fontSize);
      expect(style.lineHeight).toBe(text.lineHeight);
      expect(style.fontWeight).toBe(text.fontWeight);
      expect(page.getByTestId("icon").element().getBoundingClientRect().width).toBe(icon);
    },
  );

  test("기본값은 solid·primary·md다", async () => {
    await render(
      <div data-theme="light">
        <Button>저장</Button>
      </div>,
    );
    const style = getComputedStyle(page.getByRole("button").element());
    expect(style.height).toBe("40px");
    if (!forcedColors()) {
      expect(style.backgroundColor).toBe(
        await resolve("backgroundColor", "var(--tide-bg-primary-solid)"),
      );
      expect(style.color).toBe(await resolve("color", "var(--tide-text-on-solid)"));
    }
  });

  // 채움 방식마다 배경·글자·경계 Token. neutral은 역할 text·border·on-subtle이 없어 default·strong을 쓴다.
  // subtle 글자는 파스텔 글자 on-subtle이다(ADR 0022).
  const roles = ["neutral", "primary", "success", "warning", "danger", "info"] as const;
  const expected = (variant: NonNullable<ButtonProps["variant"]>, role: (typeof roles)[number]) => {
    const text = role === "neutral" ? "text-default" : `text-${role}`;
    switch (variant) {
      case "solid":
        return { bg: `bg-${role}-solid`, text: "text-on-solid", border: null };
      case "subtle":
        return {
          bg: `bg-${role}-subtle`,
          text: role === "neutral" ? "text-default" : `text-${role}-on-subtle`,
          border: null,
        };
      case "outline":
        return { bg: null, text, border: role === "neutral" ? "border-strong" : `border-${role}` };
      case "ghost":
        return { bg: null, text, border: null };
    }
  };

  test.each(
    (["solid", "subtle", "outline", "ghost"] as const).flatMap((v) =>
      roles.map((r) => [v, r] as const),
    ),
  )("%s × %s의 색은 Semantic Token을 쓴다", async (variant, role) => {
    if (forcedColors()) return; // 시스템 색으로 바뀌므로 Token 비교는 기본 instance에서만 한다.
    await render(
      <div data-theme="light">
        <Button variant={variant} color={role}>
          저장
        </Button>
      </div>,
    );
    const style = getComputedStyle(page.getByRole("button").element());
    const token = expected(variant, role);
    expect(style.backgroundColor).toBe(
      token.bg ? await resolve("backgroundColor", `var(--tide-${token.bg})`) : transparent,
    );
    expect(style.color).toBe(await resolve("color", `var(--tide-${token.text})`));
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopColor).toBe(
      token.border ? await resolve("borderColor", `var(--tide-${token.border})`) : transparent,
    );
  });

  // outline·ghost의 hover·누름은 같은 색으로 채운다(ADR 0025). Role은 hover faint·누름 subtle이고,
  // neutral만 색 없이 덮는다(bg-hover·bg-active). 계산된 색이 Token 값과 같은지 light·dark에서 본다.
  const tintCases = (["light", "dark"] as const).flatMap((theme) =>
    (["outline", "ghost"] as const).flatMap((variant) =>
      (
        [
          ["primary", "bg-primary-faint", "bg-primary-subtle", "text-primary"],
          ["danger", "bg-danger-faint", "bg-danger-subtle", "text-danger"],
          ["neutral", "bg-hover", "bg-active", "text-default"],
        ] as const
      ).map(([role, hover, press, text]) => [theme, variant, role, hover, press, text] as const),
    ),
  );
  test.each(tintCases)(
    "%s %s %s: hover 배경은 %s, 누름 배경은 %s, 글자는 그대로 %s다",
    async (theme, variant, role, hover, press, text) => {
      if (forcedColors()) return;
      await render(
        <div data-theme={theme}>
          <Button variant={variant} color={role} noPressScale data-testid="target">
            저장
          </Button>
        </div>,
      );
      const probe = (property: "backgroundColor" | "color", value: string): string => {
        const div = document.createElement("div");
        div.dataset["theme"] = theme;
        div.style[property] = value;
        document.body.append(div);
        const resolved = getComputedStyle(div)[property];
        div.remove();
        return resolved;
      };
      const button = page.getByRole("button").element() as HTMLElement;
      await userEvent.hover(button);
      await expect
        .poll(() => getComputedStyle(button).backgroundColor)
        .toBe(probe("backgroundColor", `var(--tide-${hover})`));
      expect(getComputedStyle(button).color).toBe(probe("color", `var(--tide-${text})`));

      await commands.mouseDownOn("target");
      await expect
        .poll(() => getComputedStyle(button).backgroundColor)
        .toBe(probe("backgroundColor", `var(--tide-${press})`));
      expect(getComputedStyle(button).color).toBe(probe("color", `var(--tide-${text})`));
      await commands.mouseUp();
    },
  );

  test("지원하지 않는 variant·color·size는 타입 오류다", () => {
    // @ts-expect-error -- variant는 채움 방식 4개만 받는다.
    const a: ButtonProps = { variant: "link" };
    // @ts-expect-error -- color는 Role(Tide Role 6개와 augmentation한 앱 Role)만 받는다. 장식 계열 purple도 Role이 아니다.
    const b: ButtonProps = { color: "purple" };
    // @ts-expect-error -- size는 xs/sm/md/lg만 받는다.
    const c: ButtonProps = { size: "xl" };
    // @ts-expect-error -- 색 계열 이름은 장식·분류 Component용이라 Button은 받지 않는다(ADR 0016).
    const blue: ButtonProps = { color: "blue" };
    // @ts-expect-error -- neutral과 다른 색인 gray도 받지 않는다.
    const gray: ButtonProps = { color: "gray" };
    // augmentation한 앱 Role은 타입을 통과한다.
    const d: ButtonProps = { color: "brand" };
    expect([a, b, c, blue, gray, d]).toHaveLength(6);
  });
});

describe("Role(data-color)", () => {
  test("루트에 data-color를 항상 붙이고(기본 primary), 바깥 data-color를 물려받지 않는다", async () => {
    await render(
      <div data-color="danger">
        <Button data-testid="default">저장</Button>
        <Button data-testid="success" color="success">
          저장
        </Button>
      </div>,
    );
    const element = page.getByTestId("default").element();
    expect(element).toHaveAttribute("data-color", "primary");
    expect(page.getByTestId("success").element()).toHaveAttribute("data-color", "success");
    expect(getComputedStyle(element).getPropertyValue("--tide-accent-solid").trim()).toBe(
      color.blue[600],
    );
  });

  test("dark Theme에서 subtle은 Role의 dark 값이다(neutral은 gray 규칙을 덮어쓴 값)", async () => {
    await render(
      <div data-theme="dark">
        <Button data-testid="primary" variant="subtle" color="primary">
          저장
        </Button>
        <Button data-testid="neutral" variant="subtle" color="neutral">
          저장
        </Button>
      </div>,
    );
    const subtle = (testId: string): string =>
      getComputedStyle(page.getByTestId(testId).element())
        .getPropertyValue("--tide-accent-subtle")
        .trim();
    // 변수 값은 forced-colors에서도 바뀌지 않는다.
    expect(subtle("primary")).toBe(color.blue[950]);
    expect(subtle("neutral")).toBe(color.gray[900]);
    if (!forcedColors()) {
      expect(getComputedStyle(page.getByTestId("primary").element()).backgroundColor).toBe(
        rgb(color.blue[950]),
      );
    }
  });

  describe("앱 Role", () => {
    // 앱이 RoleRegistry에 brand를 더하고, tide-color로 만든 CSS를 Tide CSS 뒤에 불러오는 것과 같은 순서로 넣는다.
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

    test('color="brand"로 앱 Role을 쓰고, Button 코드는 그대로다', async () => {
      style = document.createElement("style");
      style.textContent = colorFamilyCss([brand]);
      document.head.append(style);

      await render(
        <div>
          <Button data-testid="solid" color="brand">
            브랜드
          </Button>
          <div data-theme="dark">
            <Button data-testid="dark" variant="subtle" color="brand">
              브랜드
            </Button>
          </div>
        </div>,
      );
      const solid = page.getByTestId("solid").element();
      expect(solid).toHaveAttribute("data-color", "brand");
      expect(getComputedStyle(solid).getPropertyValue("--tide-accent-solid").trim()).toBe(
        "#a85c81",
      );
      if (!forcedColors()) {
        expect(getComputedStyle(solid).backgroundColor).toBe(rgb("#a85c81"));
        expect(getComputedStyle(solid).color).toBe(rgb(color.white));
        expect(getComputedStyle(page.getByTestId("dark").element()).backgroundColor).toBe(
          rgb("#5c1d3f"),
        );
      }
    });
  });

  describe("Tide Role 변수 덮어쓰기", () => {
    // 「브랜드 색 더하기」 문서의 「Tide Role의 색을 바꿀 때」와 같다. 앱 CSS를 Tide CSS 뒤에 둔다.
    // 별도 기능이 아니라 CSS 변수 덮어쓰기라 대비 검사는 받지 않는다.
    let style: HTMLStyleElement | undefined;
    afterEach(() => style?.remove());

    test("Theme 블록에서 --tide-bg-primary-solid를 덮어쓰면 기본 Button이 그 색이 된다", async () => {
      style = document.createElement("style");
      style.textContent = '[data-theme="light"] { --tide-bg-primary-solid: #a85c81; }';
      document.head.append(style);
      await render(
        <div data-theme="light">
          <Button data-testid="primary">저장</Button>
          <Button data-testid="success" color="success">
            저장
          </Button>
        </div>,
      );
      const accent = (testId: string): string =>
        getComputedStyle(page.getByTestId(testId).element())
          .getPropertyValue("--tide-accent-solid")
          .trim();
      expect(accent("primary")).toBe("#a85c81");
      // 다른 Role은 그대로다.
      expect(accent("success")).toBe(color.green[600]);
    });
  });

  test("transition-colors는 Tide 기본값(fast 150ms)이다", async () => {
    await render(<Button>저장</Button>);
    const style = getComputedStyle(page.getByRole("button").element());
    expect(style.transitionDuration.split(", ").every((value) => value === "0.15s")).toBe(true);
    expect(style.transitionProperty).toContain("background-color");
    expect(style.transitionProperty).toContain("border-color");
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
    // 두 번째 instance는 forced-colors와 reduced-motion을 함께 켠다. 분기가 실제로 두 쪽 다 도는지 확인한다.
    expect(reducedMotion()).toBe(forcedColors());
    const scale = await scaleWhilePressed(<Button data-testid="target">저장</Button>);
    expect(scale).toBe(reducedMotion() ? "none" : "0.96");
  });

  test("누르기 전에는 줄어들어 있지 않고, scale은 motion-safe일 때만 전환 대상이다", async () => {
    await render(<Button>저장</Button>);
    const style = getComputedStyle(page.getByRole("button").element());
    expect(style.scale).toBe("none");
    expect(style.transitionProperty.includes("scale")).toBe(!reducedMotion());
  });

  test("noPressScale이면 줄어들지 않는다", async () => {
    const scale = await scaleWhilePressed(
      <Button data-testid="target" noPressScale>
        저장
      </Button>,
    );
    expect(scale).toBe("none");
  });

  test("disabled면 줄어들지 않는다", async () => {
    expect(
      await scaleWhilePressed(
        <Button data-testid="target" disabled>
          저장
        </Button>,
      ),
    ).toBe("none");
  });

  test("로딩 중에는 줄어들지 않는다", async () => {
    expect(
      await scaleWhilePressed(
        <Button data-testid="target" loading>
          저장
        </Button>,
      ),
    ).toBe("none");
  });
});

describe("포커스 표시", () => {
  test("키보드 포커스에 focus-ring(outline 2px, offset 2px)이 보인다", async () => {
    await render(
      <div data-theme="light">
        <Button>저장</Button>
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
});

describe("forced-colors", () => {
  test.each(["solid", "subtle", "ghost"] as const)(
    "%s의 투명 border가 고대비 모드에서 경계로 보인다",
    async (variant) => {
      await render(<Button variant={variant}>저장</Button>);
      const style = getComputedStyle(page.getByRole("button").element());
      expect(style.borderTopWidth).toBe("1px");
      expect(style.borderTopStyle).toBe("solid");
      if (forcedColors()) expect(style.borderTopColor).not.toBe(transparent);
    },
  );
});

describe("커서", () => {
  // 활성 pointer, 비활성 not-allowed, 로딩 wait. button과 render 요소(Next Link, <a>)가 같다.
  const cursorOf = (testId: string): string =>
    getComputedStyle(page.getByTestId(testId).element()).cursor;

  test("기본 button: 활성 pointer, disabled not-allowed, loading wait", async () => {
    await render(
      <div>
        <Button data-testid="active">저장</Button>
        <Button data-testid="disabled" disabled>
          저장
        </Button>
        <Button data-testid="loading" loading>
          저장
        </Button>
      </div>,
    );
    expect(cursorOf("active")).toBe("pointer");
    expect(cursorOf("disabled")).toBe("not-allowed");
    expect(cursorOf("loading")).toBe("wait");
  });

  test("render 요소(Next Link, a)도 같은 규칙을 따른다", async () => {
    await render(
      <div>
        <Button data-testid="link" render={<Link href="/settings" />}>
          설정
        </Button>
        <Button data-testid="anchor" render={<a href="#top" />}>
          맨 위로
        </Button>
        <Button data-testid="link-disabled" render={<Link href="/settings" />} disabled>
          설정
        </Button>
        <Button data-testid="anchor-loading" render={<a href="#top" />} loading>
          맨 위로
        </Button>
      </div>,
    );
    expect(cursorOf("link")).toBe("pointer");
    expect(cursorOf("anchor")).toBe("pointer");
    expect(cursorOf("link-disabled")).toBe("not-allowed");
    expect(cursorOf("anchor-loading")).toBe("wait");
  });
});

describe("disabled", () => {
  test("네이티브 disabled를 쓰고 클릭되지 않으며 cursor가 not-allowed다", async () => {
    const onClick = vi.fn();
    await render(
      <Button disabled onClick={onClick}>
        저장
      </Button>,
    );
    const button = page.getByRole("button", { name: "저장" });
    await expect.element(button).toBeDisabled();
    expect(button.element()).not.toHaveAttribute("aria-disabled");
    expect(button.element()).not.toHaveAttribute("data-disabled");
    expect(getComputedStyle(button.element()).cursor).toBe("not-allowed");
    (button.element() as HTMLElement).click();
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("render", () => {
  test("Next Link로 렌더하면 props, ref, className을 병합한다", async () => {
    let node: HTMLElement | null = null;
    const onLinkClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    await render(
      <Button
        render={<Link href="/settings" className="underline" onClick={onLinkClick} />}
        ref={(element) => {
          node = element;
        }}
        variant="outline"
        className="px-8"
        data-testid="link"
      >
        설정
      </Button>,
    );
    const link = page.getByRole("link", { name: "설정" });
    await expect.element(link).toBeInTheDocument();
    const element = link.element();
    expect(element.tagName).toBe("A");
    expect(element).toHaveAttribute("href", "/settings");
    expect(element).toHaveAttribute("data-testid", "link");
    expect(element).not.toHaveAttribute("type");
    expect(node).toBe(element);
    expect(element).toHaveClass("underline");
    // 사용자 className이 기본 padding을 이긴다.
    expect(element).toHaveClass("px-8");
    expect(element).not.toHaveClass("px-4");
    expect(getComputedStyle(element).height).toBe("40px");

    // 키보드로 이동해 Enter로 실행한다.
    await userEvent.tab();
    await expect.element(link).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });

  test("render 요소의 children도 텍스트로 쓴다", async () => {
    await render(<Button render={<a href="#top">맨 위로</a>} />);
    await expect.element(page.getByRole("link", { name: "맨 위로" })).toBeInTheDocument();
  });

  test("disabled를 지원하지 않는 요소는 aria-disabled·data-disabled를 붙이고 이벤트를 막는다", async () => {
    const onClick = vi.fn();
    const onDocumentClick = vi.fn();
    document.addEventListener("click", onDocumentClick);
    await render(
      <Button render={<Link href="/settings" />} disabled onClick={onClick}>
        설정
      </Button>,
    );
    const link = page.getByRole("link", { name: "설정" });
    const element = link.element();
    expect(element).toHaveAttribute("aria-disabled", "true");
    expect(element).toHaveAttribute("data-disabled");
    expect(element).not.toHaveAttribute("disabled");
    expect(getComputedStyle(element).cursor).toBe("not-allowed");

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    // 이동(기본 동작)이 막히고, 사용자 onClick도 불리지 않는다.
    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
    expect(location.pathname).not.toBe("/settings");

    // 포커스는 받을 수 있다(스크린 리더가 비활성 링크를 찾을 수 있게).
    await userEvent.tab();
    await expect.element(link).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
    document.removeEventListener("click", onDocumentClick);
  });

  test("render로 button을 넘기면 네이티브 disabled를 쓴다", async () => {
    await render(
      <Button render={<button type="submit" />} disabled>
        보내기
      </Button>,
    );
    const button = page.getByRole("button", { name: "보내기" });
    await expect.element(button).toBeDisabled();
    expect(button.element()).toHaveAttribute("type", "submit");
    expect(button.element()).not.toHaveAttribute("aria-disabled");
  });
});

describe("로딩", () => {
  test("Spinner를 보이고, 포커스를 유지한 채 클릭을 막고, 상태를 이름과 aria-disabled로 알린다", async () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const { rerender } = await render(
      <form onSubmit={onSubmit}>
        <Button type="submit" size="sm" onClick={onClick}>
          저장
        </Button>
      </form>,
    );
    await userEvent.tab();
    await rerender(
      <form onSubmit={onSubmit}>
        <Button type="submit" size="sm" onClick={onClick} loading>
          저장
        </Button>
      </form>,
    );

    const button = page.getByRole("button", { name: "저장 로딩 중" });
    await expect.element(button).toBeInTheDocument();
    await expect.element(button).toHaveFocus();
    const element = button.element();
    expect(element).toHaveAttribute("aria-disabled", "true");
    expect(element).toHaveAttribute("data-loading");
    expect(element).not.toHaveAttribute("disabled");
    expect(getComputedStyle(element).cursor).toBe("wait");

    // Spinner는 앞 아이콘 자리(sm 14px)에 보이고 접근성 트리에서는 숨는다.
    const spinner = element.querySelector("svg")!;
    expect(spinner).toHaveAttribute("aria-hidden", "true");
    expect(spinner.getBoundingClientRect().width).toBe(14);
    expect(getComputedStyle(spinner).animationName).toBe("spin");

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    // Playwright 클릭은 aria-disabled 요소를 기다리기만 하므로 DOM 클릭으로 보낸다.
    (element as HTMLElement).click();
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("앞 아이콘을 Spinner로 바꾸고, loadingLabel로 알림 텍스트를 바꾼다", async () => {
    await render(
      <Button loading loadingLabel="저장하는 중" startIcon={<svg data-testid="icon" />}>
        저장
      </Button>,
    );
    await expect
      .element(page.getByRole("button", { name: "저장 저장하는 중" }))
      .toBeInTheDocument();
    expect(page.getByTestId("icon").elements()).toHaveLength(0);
  });

  test("로딩이어도 색은 바뀌지 않는다. disabled가 함께 오면 disabled가 이긴다", async () => {
    await render(
      <div>
        <Button loading>저장</Button>
        <Button loading disabled>
          삭제
        </Button>
      </div>,
    );
    const deleteButton = page.getByRole("button", { name: "삭제" });
    await expect.element(deleteButton).toBeDisabled();
    expect(deleteButton.element()).not.toHaveAttribute("data-loading");
    expect(deleteButton.element().querySelector("svg")).toBeNull();
    if (!forcedColors()) {
      expect(
        getComputedStyle(page.getByRole("button", { name: "저장 로딩 중" }).element())
          .backgroundColor,
      ).toBe(await resolve("backgroundColor", "var(--tide-bg-primary-solid)"));
    }
  });
});

describe("공통 API", () => {
  test("ref와 나머지 props를 루트 button에 넘기고, className이 기본 class를 이긴다", async () => {
    let node: HTMLButtonElement | null = null;
    await render(
      <Button
        ref={(element) => {
          node = element;
        }}
        id="save"
        aria-describedby="hint"
        className="h-14"
      >
        저장
      </Button>,
    );
    expect(node).toBeInstanceOf(HTMLButtonElement);
    expect(node).toHaveAttribute("id", "save");
    expect(node).toHaveAttribute("aria-describedby", "hint");
    expect(node!.getBoundingClientRect().height).toBe(56);
  });

  test("상태 data 속성은 해당할 때만 붙는다", async () => {
    await render(<Button>저장</Button>);
    const element = page.getByRole("button").element();
    expect(element).not.toHaveAttribute("data-loading");
    expect(element).not.toHaveAttribute("data-disabled");
    expect(element).not.toHaveAttribute("aria-disabled");
  });
});
