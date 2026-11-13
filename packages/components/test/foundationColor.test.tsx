// Foundation의 색 이름(data-color)과 accent 슬롯을 실제 Chromium에서 계산값으로 확인한다(tide-v0-impl 티켓 40).
// 앱과 같은 CSS(@import "tailwindcss" + components styles.css → foundation tailwind.css)를 쓴다.
// accent 슬롯 변수(--tide-accent-*)는 forced-colors에서도 바뀌지 않으므로 두 instance에서 변수 값을 단언하고,
// 실제 배경색은 forced-colors가 아닐 때만 단언한다.
import { color } from "@tide-design/foundation";
import { colorFamilyCss, defineColorFamily } from "@tide-design/foundation/color-family";
import { afterEach, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

function rgb(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));

  return `rgb(${r}, ${g}, ${b})`;
}

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;

/** 요소에서 계산한 accent 슬롯 변수 값(hex) */
function accent(testId: string, slot: string): string {
  return getComputedStyle(page.getByTestId(testId).element())
    .getPropertyValue(`--tide-accent-${slot}`)
    .trim();
}

function background(testId: string): string {
  return getComputedStyle(page.getByTestId(testId).element()).backgroundColor;
}

const accentClass = "bg-accent-subtle text-accent border border-accent";

describe("data-color와 accent 슬롯", () => {
  test("요소 단위 data-theme 안의 data-color는 그 Theme 값을 따른다", async () => {
    await render(
      <div>
        <div data-color="blue" data-testid="page-light" className={accentClass}>
          light
        </div>
        <section data-theme="dark">
          <div data-color="blue" data-testid="nested-dark" className={accentClass}>
            dark
          </div>
          <section data-theme="light">
            <div data-color="blue" data-testid="nested-light" className={accentClass}>
              light 안의 light
            </div>
          </section>
        </section>
        <div data-theme="dark" data-color="blue" data-testid="same-element" className={accentClass}>
          같은 요소
        </div>
      </div>,
    );

    // subtle은 light 100, dark 950이다(ADR 0022).
    expect(accent("page-light", "subtle")).toBe(color.blue[100]);
    expect(accent("nested-dark", "subtle")).toBe(color.blue[950]);
    expect(accent("nested-light", "subtle")).toBe(color.blue[100]);
    expect(accent("same-element", "subtle")).toBe(color.blue[950]);
    expect(accent("nested-dark", "text")).toBe(color.blue[300]);
    if (!forcedColors()) {
      expect(background("page-light")).toBe(rgb(color.blue[100]));
      expect(background("nested-dark")).toBe(rgb(color.blue[950]));
      expect(background("same-element")).toBe(rgb(color.blue[950]));
    }
  });

  test("data-color가 없으면 primary이고, Role 이름은 Role Token을 꽂는다", async () => {
    await render(
      <div data-theme="dark">
        <div data-testid="default" className="bg-accent-solid" />
        <div data-color="danger" data-testid="danger" className="bg-accent-solid" />
        <div data-color="neutral" data-testid="neutral" className="bg-accent-subtle" />
        <div data-color="gray" data-testid="gray" className="bg-accent-subtle" />
      </div>,
    );

    expect(accent("default", "solid")).toBe(color.blue[600]);
    expect(accent("danger", "solid")).toBe(color.red[600]);
    // neutral은 gray와 다른 색이다: dark subtle이 neutral 900, gray 950이다.
    expect(accent("neutral", "subtle")).toBe(color.gray[900]);
    expect(accent("gray", "subtle")).toBe(color.gray[950]);
    expect(accent("neutral", "text")).toBe(color.gray[50]);
    expect(accent("gray", "text")).toBe(color.gray[300]);
    if (!forcedColors()) {
      expect(background("danger")).toBe(rgb(color.red[600]));
      expect(background("neutral")).toBe(rgb(color.gray[900]));
    }
  });

  describe("앱 브랜드 계열", () => {
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

    test("tide-color가 만드는 CSS를 Tide CSS 뒤에 두면 data-color로 고른다", async () => {
      // 앱이 brand.css를 Tide CSS 다음에 불러오는 것과 같은 순서다.
      style = document.createElement("style");
      style.textContent = colorFamilyCss([brand]);
      document.head.append(style);

      await render(
        <div>
          <div
            data-color="brand"
            data-testid="light"
            className="bg-accent-solid text-accent-on-solid"
          >
            브랜드
          </div>
          <div data-theme="dark">
            <div data-color="brand" data-testid="dark" className={accentClass}>
              브랜드
            </div>
          </div>
        </div>,
      );

      expect(accent("light", "solid")).toBe("#a85c81");
      expect(accent("light", "on-solid")).toBe(color.white);
      expect(accent("dark", "subtle")).toBe("#5c1d3f");
      expect(accent("dark", "border")).toBe("#dc7dac");
      if (!forcedColors()) {
        expect(background("light")).toBe(rgb("#a85c81"));
        expect(background("dark")).toBe(rgb("#5c1d3f"));
      }
    });
  });
});
