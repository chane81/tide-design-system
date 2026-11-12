// Badge의 모양과 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 19).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors)에서는 배경이 사라져도 경계로 모양이 남는지 본다.
import { colorFamilyCss, defineColorFamily } from "@tide-tds/foundation/color-family";
import { afterEach, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Badge, type BadgeProps } from "./Badge.tsx";

// 앱 Role(brand)과 앱 장식 계열(leaf)을 색 이름 타입에 더한다(앱의 augmentation과 같다. 티켓 41, ADR 0016).
declare module "@tide-tds/foundation" {
  interface RoleRegistry {
    brand: true;
  }
  interface ColorFamilyRegistry {
    leaf: true;
  }
}

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(value: string): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  // 시스템 색 이름(CanvasText 등)을 forced-colors가 덮지 않고 그대로 계산하게 한다.
  probe.style.forcedColorAdjust = "none";
  probe.style.borderColor = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).borderTopColor;
  probe.remove();
  return resolved;
}

const badge = (text: string): HTMLElement =>
  page.getByText(text, { exact: true }).element() as HTMLElement;

const roles = ["neutral", "primary", "success", "warning", "danger", "info"] as const;
// 색 계열은 Theme 블록이 정한 계열 변수(--tide-<계열>-<슬롯>)를 accent 슬롯으로 쓴다(ADR 0011).
const families = ["gray", "blue", "green", "amber", "red", "cyan", "purple", "mint"] as const;

describe("역할과 이름", () => {
  test("상태를 텍스트로 전한다. 역할이 없는 span이라 주변 이름에 그대로 들어간다", async () => {
    await render(
      <ul>
        <li>
          배포 <Badge color="success">완료</Badge>
        </li>
      </ul>,
    );
    const element = badge("완료");
    expect(element.tagName).toBe("SPAN");
    expect(element).not.toHaveAttribute("role");
    // live region(status)이 아니다. 바뀔 때 읽어 줘야 하면 앱이 알림 영역을 둔다.
    expect(page.getByRole("status").elements()).toHaveLength(0);
    await expect.element(page.getByRole("listitem")).toHaveTextContent("배포 완료");
  });

  test("버튼 안에 넣으면 텍스트가 버튼 이름에 들어간다", async () => {
    await render(
      <button type="button">
        알림 <Badge color="danger">3개</Badge>
      </button>,
    );
    await expect.element(page.getByRole("button", { name: "알림 3개" })).toBeInTheDocument();
  });

  test("children(텍스트)은 필수다", () => {
    // @ts-expect-error -- 색만으로 상태를 전하지 않도록 children을 반드시 받는다.
    const props: BadgeProps = { color: "success" };
    expect(props.color).toBe("success");
  });
});

describe("모양", () => {
  test("radius는 sm(4px), 기본 size는 md(높이 24px, label-md)다", async () => {
    await render(<Badge>초안</Badge>);
    const element = badge("초안");
    const style = getComputedStyle(element);
    expect(style.borderTopLeftRadius).toBe("4px");
    expect(element.getBoundingClientRect().height).toBe(24);
    expect(style.fontSize).toBe("14px");
    expect(style.fontWeight).toBe("500");
    expect(style.paddingInlineStart).toBe("8px");
    expect(style.whiteSpace).toBe("nowrap");
  });

  const sizes: [NonNullable<BadgeProps["size"]>, number, string, string][] = [
    ["sm", 20, "12px", "6px"],
    ["md", 24, "14px", "8px"],
  ];

  test.each(sizes)(
    "%s는 높이 %ipx, 글자 %s, 좌우 여백 %s다",
    async (size, height, font, padding) => {
      await render(<Badge size={size}>{size}</Badge>);
      const element = badge(size);
      expect(element.getBoundingClientRect().height).toBe(height);
      expect(getComputedStyle(element).fontSize).toBe(font);
      expect(getComputedStyle(element).paddingRight).toBe(padding);
    },
  );

  test("지원하지 않는 size·variant는 타입 오류다", () => {
    // @ts-expect-error -- size는 sm/md만 받는다.
    const large: BadgeProps = { children: "a", size: "lg" };
    // @ts-expect-error -- variant는 subtle/solid만 받는다.
    const outline: BadgeProps = { children: "a", variant: "outline" };
    expect([large.size, outline.variant]).toEqual(["lg", "outline"]);
  });

  test("안에 넣은 아이콘은 12px다", async () => {
    await render(
      <Badge>
        <svg aria-hidden="true" viewBox="0 0 24 24" />
        검토 중
      </Badge>,
    );
    const svg = badge("검토 중").querySelector("svg")!;
    expect(svg.getBoundingClientRect().width).toBe(12);
    expect(svg.getBoundingClientRect().height).toBe(12);
  });

  test("그림자가 없다", async () => {
    await render(<Badge>초안</Badge>);
    expect(getComputedStyle(badge("초안")).boxShadow).toBe("none");
  });
});

describe("색", () => {
  test("기본은 neutral subtle이고 루트에 data-color가 붙는다", async () => {
    await render(
      <div data-theme="light">
        <Badge>초안</Badge>
      </div>,
    );
    const element = badge("초안");
    expect(element).toHaveAttribute("data-color", "neutral");
    if (forcedColors()) return;
    expect(getComputedStyle(element).backgroundColor).toBe(
      resolve("var(--tide-bg-neutral-subtle)"),
    );
    expect(getComputedStyle(element).color).toBe(resolve("var(--tide-text-default)"));
  });

  test.each(roles)(
    "%s subtle은 같은 Role의 subtle 배경, 파스텔 글자(on-subtle), 파스텔 테두리다",
    async (role) => {
      await render(
        <div data-theme="light">
          <Badge color={role}>{role}</Badge>
        </div>,
      );
      const element = badge(role);
      expect(element).toHaveAttribute("data-color", role);
      if (forcedColors()) return;
      // neutral의 on-subtle은 text-default를 공유한다(ADR 0022).
      const text =
        role === "neutral" ? "var(--tide-text-default)" : `var(--tide-text-${role}-on-subtle)`;
      expect(getComputedStyle(element).backgroundColor).toBe(
        resolve(`var(--tide-bg-${role}-subtle)`),
      );
      expect(getComputedStyle(element).color).toBe(resolve(text));
      expect(getComputedStyle(element).borderTopColor).toBe(
        resolve(`var(--tide-border-${role}-subtle)`),
      );
    },
  );

  // subtle·faint의 계산된 색이 Token 값과 같은지 light·dark에서 본다(티켓 03 수용 기준).
  test.each(
    (["light", "dark"] as const).flatMap((theme) =>
      (["subtle", "faint"] as const).flatMap((variant) =>
        roles.map((role) => [theme, variant, role] as const),
      ),
    ),
  )("%s %s × %s는 Token 값으로 칠한다", async (theme, variant, role) => {
    await render(
      <div data-theme={theme}>
        <Badge color={role} variant={variant}>
          {role}
        </Badge>
      </div>,
    );
    if (forcedColors()) return;
    const probe = (value: string): string => {
      const div = document.createElement("div");
      div.dataset["theme"] = theme;
      div.style.borderColor = value;
      document.body.append(div);
      const resolved = getComputedStyle(div).borderTopColor;
      div.remove();
      return resolved;
    };
    const style = getComputedStyle(badge(role));
    const text =
      role === "neutral" ? "var(--tide-text-default)" : `var(--tide-text-${role}-on-subtle)`;
    expect(style.backgroundColor).toBe(probe(`var(--tide-bg-${role}-${variant})`));
    expect(style.color).toBe(probe(text));
    // faint는 테두리가 없다(투명).
    expect(style.borderTopColor).toBe(
      variant === "faint" ? transparent : probe(`var(--tide-border-${role}-subtle)`),
    );
  });

  test.each(roles)("%s solid는 같은 Role의 solid 배경과 on-solid 글자색이다", async (role) => {
    await render(
      <div data-theme="dark">
        <Badge color={role} variant="solid">
          {role}
        </Badge>
      </div>,
    );
    const element = badge(role);
    if (forcedColors()) return;
    const probe = (value: string): string => {
      const div = document.createElement("div");
      div.dataset["theme"] = "dark";
      div.style.borderColor = value;
      document.body.append(div);
      const resolved = getComputedStyle(div).borderTopColor;
      div.remove();
      return resolved;
    };
    expect(getComputedStyle(element).backgroundColor).toBe(probe(`var(--tide-bg-${role}-solid)`));
    expect(getComputedStyle(element).color).toBe(probe("var(--tide-text-on-solid)"));
  });

  test("바깥 요소의 data-color를 물려받지 않는다", async () => {
    await render(
      <div data-theme="light" data-color="danger">
        <Badge>초안</Badge>
      </div>,
    );
    expect(badge("초안")).toHaveAttribute("data-color", "neutral");
    if (forcedColors()) return;
    expect(getComputedStyle(badge("초안")).backgroundColor).toBe(
      resolve("var(--tide-bg-neutral-subtle)"),
    );
  });

  test.each(
    (["subtle", "faint", "solid"] as const).flatMap((variant) =>
      families.map((family) => [variant, family] as const),
    ),
  )("%s × 색 계열 %s는 그 계열 변수를 쓴다", async (variant, family) => {
    await render(
      <div data-theme="light">
        <Badge color={family} variant={variant}>
          {family}
        </Badge>
      </div>,
    );
    const element = badge(family);
    expect(element).toHaveAttribute("data-color", family);
    if (forcedColors()) return;
    const [bg, text] = variant === "solid" ? ["solid", "on-solid"] : [variant, "on-subtle"];
    expect(getComputedStyle(element).backgroundColor).toBe(resolve(`var(--tide-${family}-${bg})`));
    expect(getComputedStyle(element).color).toBe(resolve(`var(--tide-${family}-${text})`));
  });

  test("gray는 neutral과 다른 색 이름이다(dark subtle 배경이 다르다)", async () => {
    await render(
      <div data-theme="dark">
        <Badge color="gray">gray</Badge>
        <Badge color="neutral">neutral</Badge>
      </div>,
    );
    expect(badge("gray")).toHaveAttribute("data-color", "gray");
    if (forcedColors()) return;
    expect(getComputedStyle(badge("gray")).backgroundColor).not.toBe(
      getComputedStyle(badge("neutral")).backgroundColor,
    );
  });

  test("color는 Role과 색 계열 이름(Color)을 받고, 없는 이름은 타입 오류다(ADR 0016·0017)", () => {
    // @ts-expect-error -- 등록하지 않은 이름은 색 이름이 아니다.
    const unknown: BadgeProps = { children: "a", color: "purple-ish" };
    const names: BadgeProps[] = [
      { children: "a", color: "success" },
      { children: "a", color: "blue" },
      { children: "a", color: "gray" },
      // 장식 계열 purple·mint(ADR 0022 §5)
      { children: "a", color: "purple" },
      { children: "a", color: "mint" },
      // 앱 Role과 앱 장식 계열도 받는다.
      { children: "a", color: "brand" },
      { children: "a", color: "leaf" },
    ];
    expect([unknown.color, ...names.map((props) => props.color)]).toEqual([
      "purple-ish",
      "success",
      "blue",
      "gray",
      "purple",
      "mint",
      "brand",
      "leaf",
    ]);
  });

  describe("앱 Role과 앱 장식 계열", () => {
    // 앱이 RoleRegistry에 brand, ColorFamilyRegistry에 leaf를 더하고, tide-color로 만든 CSS를
    // Tide CSS 뒤에 불러오는 것과 같은 순서로 넣는다. 계열 CSS는 등록 종류와 관계없이 같은 모양이다.
    const brand = defineColorFamily({
      name: "brand",
      scale: {
        50: "#f5f3ff",
        100: "#ede9fe",
        200: "#ddd6fe",
        300: "#c4b5fd",
        400: "#a78bfa",
        500: "#8b5cf6",
        600: "#7c3aed",
        700: "#6d28d9",
        800: "#5b21b6",
        900: "#4c1d95",
        950: "#2e1065",
      },
    });
    const leaf = defineColorFamily({ name: "leaf", scale: { ...brand.scale, 600: "#15803d" } });
    let style: HTMLStyleElement | undefined;
    afterEach(() => style?.remove());

    test('color="brand"로 앱 Role을 쓰고, Badge 코드는 그대로다', async () => {
      style = document.createElement("style");
      style.textContent = colorFamilyCss([brand]);
      document.head.append(style);

      await render(
        <div data-theme="light">
          <Badge color="brand" variant="solid">
            브랜드
          </Badge>
        </div>,
      );
      const element = badge("브랜드");
      expect(element).toHaveAttribute("data-color", "brand");
      if (forcedColors()) return;
      expect(getComputedStyle(element).backgroundColor).toBe(resolve("#7c3aed"));
      expect(getComputedStyle(element).color).toBe(resolve("#ffffff"));
    });

    test('color="leaf"로 앱 장식 계열을 쓴다', async () => {
      style = document.createElement("style");
      style.textContent = colorFamilyCss([leaf]);
      document.head.append(style);

      await render(
        <div data-theme="light">
          <Badge color="leaf" variant="solid">
            분류
          </Badge>
        </div>,
      );
      const element = badge("분류");
      expect(element).toHaveAttribute("data-color", "leaf");
      if (forcedColors()) return;
      expect(getComputedStyle(element).backgroundColor).toBe(resolve("#15803d"));
    });
  });
});

describe("forced-colors", () => {
  test("평소에는 경계가 투명하고, forced-colors에서는 CanvasText 경계로 모양이 남는다", async () => {
    await render(
      <div data-theme="light">
        <Badge color="success" variant="solid">
          완료
        </Badge>
      </div>,
    );
    const style = getComputedStyle(badge("완료"));
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopWidth).toBe("1px");
    if (forcedColors()) {
      expect(style.borderTopColor).toBe(resolve("CanvasText"));
      expect(style.color).toBe(resolve("CanvasText"));
      expect(style.color).not.toBe(style.backgroundColor);
    } else {
      expect(style.borderTopColor).toBe(transparent);
    }
  });
});

describe("공통 API", () => {
  test("ref와 나머지 props를 루트 span에 넘기고, className이 기본 class를 이긴다", async () => {
    let node: HTMLSpanElement | null = null;
    await render(
      <Badge
        ref={(element) => {
          node = element;
        }}
        id="state"
        title="배포 상태"
        className="rounded-full px-3"
      >
        완료
      </Badge>,
    );
    expect(node).toBeInstanceOf(HTMLSpanElement);
    const element = badge("완료");
    expect(element).toHaveAttribute("id", "state");
    expect(element).toHaveAttribute("title", "배포 상태");
    expect(element).toHaveClass("rounded-full", "px-3");
    expect(element).not.toHaveClass("rounded-sm");
    expect(element).not.toHaveClass("px-2");
    expect(getComputedStyle(element).paddingLeft).toBe("12px");
  });
});
