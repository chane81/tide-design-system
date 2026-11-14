// forced-colors instance에서는 그림자·border 색이 시스템 색으로 덮여, 투명 border·outline이 보이는지를 따로 본다.
import { color } from "@tide-design/foundation";
import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { expectFocusHalo, expectNoFocusHalo, focusBorderColor, haloColor } from "./focus";

function rgb(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));

  return `rgb(${r}, ${g}, ${b})`;
}

const transparent = "rgba(0, 0, 0, 0)";

/**
 * box-shadow 계산값에서 Tide 그림자 레이어만 꺼낸다. 앞의 투명 레이어 4개는 Tailwind의 ring·inset 자리다.
 * color-mix 결과는 `color(srgb r g b / a)`로 계산된다(Chromium).
 */
function tideLayers(boxShadow: string): { alpha: number; geometry: string }[] {
  return [...boxShadow.matchAll(/color\(srgb [\d.]+ [\d.]+ [\d.]+ \/ ([\d.]+)\) ([^,]+)/g)].map(
    (match) => ({ alpha: Number(match[1]), geometry: match[2]!.trim() }),
  );
}
const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;

// Theme 분기(dark:)가 없어 요소 단위 data-theme을 그대로 따른다.
const raisedClass = "bg-raised border border-raised rounded-lg shadow-md";

describe("Elevation", () => {
  test("light raised는 투명 border 1px와 2레이어 그림자를 갖고, forced-colors에서는 border가 경계로 남는다", async () => {
    await render(
      <div data-theme="light" data-testid="raised" className={raisedClass}>
        raised
      </div>,
    );
    const style = getComputedStyle(page.getByTestId("raised").element());

    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopLeftRadius).toBe("8px");
    if (forcedColors()) {
      // forced-colors는 box-shadow를 지우고 투명 border를 시스템 색으로 그린다.
      expect(style.boxShadow).toBe("none");
      expect(style.borderTopColor).not.toBe(transparent);
    } else {
      expect(style.borderTopColor).toBe(transparent);
      // shadow-md 두 레이어. 색은 shadow 색(gray-950 8%)을 50%, 100%로 낮춘 값이다.
      const layers = tideLayers(style.boxShadow);
      expect(layers.map((layer) => layer.geometry)).toEqual([
        "0px 1px 3px 0px",
        "0px 4px 12px -2px",
      ]);
      expect(layers[0]!.alpha).toBeCloseTo(0.04, 2);
      expect(layers[1]!.alpha).toBeCloseTo(0.08, 2);
    }
  });

  test("dark 페이지 안의 light 영역에서도 raised border는 투명이다", async () => {
    await render(
      <div data-theme="dark">
        <div data-theme="light">
          <div data-testid="raised" className={raisedClass}>
            raised
          </div>
        </div>
      </div>,
    );
    const style = getComputedStyle(page.getByTestId("raised").element());

    expect(style.borderTopWidth).toBe("1px");
    if (forcedColors()) {
      expect(style.borderTopColor).not.toBe(transparent);
    } else {
      expect(style.borderTopColor).toBe(transparent);
      // 그림자도 light shadow 색(gray-950 8%)이다.
      expect(tideLayers(style.boxShadow)[1]!.alpha).toBeCloseTo(0.08, 2);
    }
  });

  test("dark에서도 그림자를 그리고 raised border는 gray-800이다", async () => {
    await render(
      <div data-theme="dark">
        <div data-testid="raised" className={raisedClass}>
          raised
        </div>
      </div>,
    );
    const style = getComputedStyle(page.getByTestId("raised").element());

    expect(style.borderTopWidth).toBe("1px");
    if (forcedColors()) {
      expect(style.boxShadow).toBe("none");
    } else {
      expect(style.borderTopColor).toBe(rgb(color.gray[800]));
      // dark shadow 색은 black 30%다.
      const layers = tideLayers(style.boxShadow);
      expect(layers.map((layer) => layer.geometry)).toEqual([
        "0px 1px 3px 0px",
        "0px 4px 12px -2px",
      ]);
      expect(layers[0]!.alpha).toBeCloseTo(0.15, 2);
      expect(layers[1]!.alpha).toBeCloseTo(0.3, 2);
    }
  });

  test("같은 shadow class가 요소 단위 Theme에 따라 색만 바꾼다", async () => {
    await render(
      <div>
        <div data-theme="light" data-testid="light" className="shadow-lg">
          light
        </div>
        <div data-theme="dark" data-testid="dark" className="shadow-lg">
          dark
        </div>
      </div>,
    );
    const light = getComputedStyle(page.getByTestId("light").element()).boxShadow;
    const dark = getComputedStyle(page.getByTestId("dark").element()).boxShadow;

    if (forcedColors()) {
      expect(light).toBe("none");
      expect(dark).toBe("none");
    } else {
      const lightLayers = tideLayers(light);
      const darkLayers = tideLayers(dark);
      expect(lightLayers.map((layer) => layer.geometry)).toEqual([
        "0px 2px 6px -1px",
        "0px 12px 24px -6px",
      ]);
      expect(darkLayers.map((layer) => layer.geometry)).toEqual(
        lightLayers.map((layer) => layer.geometry),
      );
      expect(darkLayers[1]!.alpha).toBeGreaterThan(lightLayers[1]!.alpha);
    }
  });
});

describe("포커스 표시", () => {
  test("focus-ring은 키보드 포커스에서 offset 없는 3px halo만 두고 테두리 색은 그대로다", async () => {
    await render(
      <button
        type="button"
        className="rounded-md border border-transparent focus-visible:focus-ring"
      >
        저장
      </button>,
    );
    const button = page.getByRole("button", { name: "저장" }).element();
    await userEvent.tab();

    expect(document.activeElement).toBe(button);
    expectFocusHalo(button);
    if (!forcedColors()) expect(getComputedStyle(button).borderTopColor).toBe(transparent);
  });

  test("focus-ring halo는 shadow-*와 함께 써도 그림자를 지우지 않는다", async () => {
    await render(
      <div data-theme="light" data-testid="box" className={`${raisedClass} focus-ring`}>
        표면
      </div>,
    );
    if (forcedColors()) return;
    const style = getComputedStyle(page.getByTestId("box").element());
    expect(style.boxShadow).toContain(`${haloColor.focus} 0px 0px 0px 3px`);
    expect(tideLayers(style.boxShadow)).toHaveLength(2);
  });

  test("focus-field는 1px border를 focus 색으로 바꾸고 바깥 3px halo를 둔다", async () => {
    await render(
      <input
        aria-label="이름"
        className="rounded-md border border-default bg-canvas focus:focus-field"
      />,
    );
    const input = page.getByRole("textbox", { name: "이름" });
    await userEvent.click(input);
    const style = getComputedStyle(input.element());

    expect(style.borderTopWidth).toBe("1px");
    expectFocusHalo(input.element());
    if (!forcedColors()) expect(style.borderTopColor).toBe(focusBorderColor.focus);
  });

  test("오류 입력창은 포커스 중에 같은 모양을 오류 색으로 그리고, 포커스가 빠지면 오류 border만 남는다", async () => {
    await render(
      <div>
        <input
          aria-label="이메일"
          aria-invalid="true"
          className="rounded-md border border-default aria-invalid:border-danger focus:focus-field"
        />
        <button type="button">다음</button>
      </div>,
    );
    const input = page.getByRole("textbox", { name: "이메일" });

    if (!forcedColors()) {
      expect(getComputedStyle(input.element()).borderTopColor).toBe(focusBorderColor.danger);
    }

    await userEvent.click(input);
    expectFocusHalo(input.element(), { tone: "danger" });
    if (!forcedColors()) {
      const focused = getComputedStyle(input.element());
      expect(focused.borderTopColor).toBe(focusBorderColor.danger);
      expect(focused.borderTopWidth).toBe("1px");
      expect(focused.boxShadow).not.toContain(haloColor.focus);
    }

    await userEvent.click(page.getByRole("button", { name: "다음" }));
    expectNoFocusHalo(input.element());
    if (!forcedColors()) {
      expect(getComputedStyle(input.element()).borderTopColor).toBe(focusBorderColor.danger);
    }
  });

  test("variant 없이 쓴 focus-field도 오류 입력창에서 border와 halo가 오류 색이다", async () => {
    // 문서의 포커스 표시 블록처럼 포커스 상태를 고정해서 보여 줄 때. 선택자 우선순위가 오류 border와 같아도 색이 섞이지 않는다.
    await render(
      <input
        aria-label="고정"
        aria-invalid="true"
        readOnly
        className="focus-field rounded-md border border-default aria-invalid:border-danger"
      />,
    );
    if (forcedColors()) return;
    const style = getComputedStyle(page.getByRole("textbox", { name: "고정" }).element());
    expect(style.borderTopColor).toBe(focusBorderColor.danger);
    expect(style.boxShadow).toContain(`${haloColor.danger} 0px 0px 0px 3px`);
  });

  test("dark Theme halo는 primary 800·red 800 단계다", async () => {
    await render(
      <div data-theme="dark">
        <input aria-label="보통" readOnly className="focus-field border" />
        <input aria-label="오류" aria-invalid="true" readOnly className="focus-field border" />
      </div>,
    );
    if (forcedColors()) return;
    const shadow = (name: string): string =>
      getComputedStyle(page.getByRole("textbox", { name }).element()).boxShadow;
    expect(shadow("보통")).toContain(`${rgb(color.blue[800])} 0px 0px 0px 3px`);
    expect(shadow("오류")).toContain(`${rgb(color.red[800])} 0px 0px 0px 3px`);
  });
});
