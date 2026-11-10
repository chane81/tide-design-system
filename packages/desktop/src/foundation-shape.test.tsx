// Foundation의 radius·Elevation·포커스 표시를 실제 Chromium에서 계산값으로 확인한다(tide-v0-impl 티켓 06).
// 앱과 같은 CSS(@import "tailwindcss" + desktop styles.css → foundation tailwind.css)를 쓴다.
// 두 instance에서 모두 돈다. forced-colors instance(contextOptions forcedColors: "active")에서는
// 그림자와 border 색이 시스템 색으로 덮이므로, 투명 border·outline이 보이는지를 따로 단언한다.
import { color } from "@tide-tds/foundation";
import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

/** hex를 getComputedStyle이 돌려주는 rgb() 표기로 바꾼다 */
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

// raised 표면의 class 조합. 두 Theme 모두 border 1px이고 색은 border-raised(light 투명, dark gray-800)다.
// Theme 분기(dark:)가 없으므로 요소 단위 data-theme을 그대로 따른다.
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
  test("focus-ring은 키보드 포커스에서 outline 2px, offset 2px이다", async () => {
    await render(
      <button type="button" className="rounded-md focus-visible:focus-ring">
        저장
      </button>,
    );
    const button = page.getByRole("button", { name: "저장" }).element();
    await userEvent.tab();

    expect(document.activeElement).toBe(button);
    const style = getComputedStyle(button);
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("2px");
    if (forcedColors()) {
      expect(style.outlineColor).not.toBe(transparent);
    } else {
      expect(style.outlineColor).toBe(rgb(color.blue[600]));
    }
  });

  test("focus-field는 border를 focus 색으로 바꾸고 inset 1px와 투명 outline을 둔다", async () => {
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
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    if (forcedColors()) {
      // border 색과 box-shadow는 시스템 색으로 덮이고, 투명 outline이 보여서 포커스 표시가 남는다.
      expect(style.boxShadow).toBe("none");
      expect(style.outlineColor).not.toBe(transparent);
    } else {
      expect(style.borderTopColor).toBe(rgb(color.blue[600]));
      expect(style.boxShadow).toBe(`${rgb(color.blue[600])} 0px 0px 0px 1px inset`);
      expect(style.outlineColor).toBe(transparent);
    }
  });

  test("오류 입력창도 포커스 중에는 focus-field가 이기고, 포커스가 빠지면 오류 border로 돌아온다", async () => {
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
    const danger = rgb(color.red[600]);
    const focus = rgb(color.blue[600]);

    if (!forcedColors()) expect(getComputedStyle(input.element()).borderTopColor).toBe(danger);

    await userEvent.click(input);
    const focused = getComputedStyle(input.element());
    if (forcedColors()) {
      expect(focused.boxShadow).toBe("none");
      expect(focused.outlineColor).not.toBe(transparent);
    } else {
      // 빨강 border 안쪽에 파랑 inset이 겹쳐 두 줄로 보이지 않는다(tide-v0 티켓 20 구현 주의).
      expect(focused.borderTopColor).toBe(focus);
      expect(focused.borderLeftColor).toBe(focus);
      expect(focused.boxShadow).toBe(`${focus} 0px 0px 0px 1px inset`);
      expect(focused.outlineColor).toBe(transparent);
    }

    await userEvent.click(page.getByRole("button", { name: "다음" }));
    if (!forcedColors()) {
      const blurred = getComputedStyle(input.element());
      expect(blurred.borderTopColor).toBe(danger);
      expect(blurred.boxShadow).toBe("none");
    }
  });
});
