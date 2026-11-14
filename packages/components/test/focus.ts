// 포커스 표시(halo) 단언 helper. focus-ring·focus-field를 쓰는 Component 테스트가 함께 쓴다(ADR 0032).
import { color } from "@tide-design/foundation";
import { expect } from "vitest";

const transparent = "rgba(0, 0, 0, 0)";

const rgb = (hex: string): string => {
  const [r, g, b] = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));

  return `rgb(${r}, ${g}, ${b})`;
};

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;

/** light Theme의 halo 색. 오류 입력창은 `danger`다. */
export const haloColor = {
  focus: rgb(color.blue[200]),
  danger: rgb(color.red[200]),
} as const;

/** light Theme의 focus 테두리 색. 오류 입력창은 border-danger(red-600)다. */
export const focusBorderColor = {
  focus: rgb(color.blue[600]),
  danger: rgb(color.red[600]),
} as const;

interface HaloOptions {
  /** halo 색. 기본 `focus` */
  readonly tone?: keyof typeof haloColor;
  /** forced-colors에서 `forced-color-adjust: none`을 쓰는 요소(Checkbox·Radio·Switch). halo가 시스템 색으로 남는다. */
  readonly adjustNone?: boolean;
}

/** offset 없이 바깥 3px halo가 보이는지 본다. forced-colors에서는 halo 대신 투명 outline이 시스템 색으로 그려진다. */
export function expectFocusHalo(
  element: Element,
  { tone = "focus", adjustNone = false }: HaloOptions = {},
): void {
  const style = getComputedStyle(element);

  expect(style.outlineOffset).toBe("0px");
  if (!forcedColors()) {
    expect(style.boxShadow).toContain(`${haloColor[tone]} 0px 0px 0px 3px`);
    expect(style.boxShadow).not.toContain("inset");
    // 평소에는 outline이 없다. 투명 outline은 forced-colors에서만 둔다.
    expect(style.outlineStyle).toBe("none");

    return;
  }
  expect(style.outlineStyle).toBe("solid");
  expect(style.outlineWidth).toBe("3px");
  if (adjustNone) {
    // adjust를 끈 요소는 halo 변수를 Highlight로 바꿔 halo가 남고, outline은 투명 그대로다.
    expect(style.boxShadow).toContain("0px 0px 0px 3px");
    expect(style.boxShadow).not.toContain(haloColor[tone]);
  } else {
    expect(style.boxShadow).toBe("none");
    expect(style.outlineColor).not.toBe(transparent);
  }
}

/** 포커스가 없을 때 halo와 outline이 모두 없는지 본다. */
export function expectNoFocusHalo(element: Element): void {
  const style = getComputedStyle(element);

  expect(style.boxShadow).not.toContain("0px 0px 0px 3px");
  if (!forcedColors()) expect(style.outlineStyle).toBe("none");
}
