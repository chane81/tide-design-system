// 포커스 표시 단언 helper. focus-ring·focus-field를 쓰는 Component 테스트가 함께 쓴다(ADR 0032·0034).
import { color } from "@tide-design/foundation";
import { expect } from "vitest";

const transparent = "rgba(0, 0, 0, 0)";

const rgb = (hex: string): string => {
  const [r, g, b] = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));

  return `rgb(${r}, ${g}, ${b})`;
};

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;

/** light Theme의 halo 색(accent subtle-border, 200단계). data-color가 없으면 primary, 오류 입력창은 danger다. */
export const haloColor = {
  primary: rgb(color.blue[200]),
  success: rgb(color.green[200]),
  neutral: rgb(color.gray[200]),
  info: rgb(color.cyan[200]),
  danger: rgb(color.red[200]),
} as const;

/** light Theme의 focus 테두리 색(accent border). neutral은 border-strong(gray-500)이다. */
export const focusBorderColor = {
  primary: rgb(color.blue[600]),
  success: rgb(color.green[600]),
  neutral: rgb(color.gray[500]),
  info: rgb(color.cyan[600]),
  danger: rgb(color.red[600]),
} as const;

interface HaloOptions {
  /** halo 색. 기본 `primary` */
  readonly tone?: keyof typeof haloColor;
  /** forced-colors에서 `forced-color-adjust: none`을 쓰는 요소(Checkbox·Radio·Switch). halo가 시스템 색으로 남는다. */
  readonly adjustNone?: boolean;
}

interface RingOptions extends HaloOptions {
  /** 링 색. 기본은 `tone`의 focus 테두리 색 */
  readonly ring?: string;
  /** solid 바탕 요소의 안쪽 canvas 2px 틈. 기본 `false` */
  readonly gap?: boolean;
}

/**
 * focus-ring: 요소에 붙은 2px 링과 그 바깥 3px halo(퍼짐 5px)가 보이는지 본다.
 * forced-colors에서는 focus-field와 같이 투명 outline이 시스템 색으로 그려진다.
 */
export function expectFocusRing(
  element: Element,
  { tone = "primary", adjustNone = false, ring, gap = false }: RingOptions = {},
): void {
  const style = getComputedStyle(element);

  expect(style.outlineOffset).toBe("0px");
  if (!forcedColors()) {
    const ringColor = ring ?? focusBorderColor[tone as keyof typeof focusBorderColor];
    expect(style.boxShadow).toContain(`${ringColor} 0px 0px 0px 2px`);
    expect(style.boxShadow).toContain(`${haloColor[tone]} 0px 0px 0px 5px`);
    if (gap) expect(style.boxShadow).toContain(`${rgb(color.white)} 0px 0px 0px 2px inset`);
    else expect(style.boxShadow).not.toMatch(/\d+px inset/);
    expect(style.outlineStyle).toBe("none");

    return;
  }
  expect(style.outlineStyle).toBe("solid");
  expect(style.outlineWidth).toBe("3px");
  if (adjustNone) {
    expect(style.boxShadow).toContain("0px 0px 0px 5px");
    expect(style.boxShadow).not.toContain(haloColor[tone]);
  } else {
    expect(style.boxShadow).toBe("none");
    expect(style.outlineColor).not.toBe(transparent);
  }
}

/** focus-field: offset 없이 바깥 3px halo가 보이는지 본다. forced-colors에서는 halo 대신 투명 outline이 시스템 색으로 그려진다. */
export function expectFocusHalo(
  element: Element,
  { tone = "primary", adjustNone = false }: HaloOptions = {},
): void {
  const style = getComputedStyle(element);

  expect(style.outlineOffset).toBe("0px");
  if (!forcedColors()) {
    expect(style.boxShadow).toContain(`${haloColor[tone]} 0px 0px 0px 3px`);
    expect(style.boxShadow).not.toContain("inset");
    expect(style.boxShadow).not.toContain("0px 0px 0px 2px");
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

  expect(style.boxShadow).not.toMatch(/0px 0px 0px [235]px/);
  if (!forcedColors()) expect(style.outlineStyle).toBe("none");
}
