// 색 스케일 블록(ColorScale.tsx)이 그리는 값. 화면과 떨어진 순수 함수라 Node unit 테스트가 바로 검사한다.
// 값은 모두 foundation 원본(`color`, `roleFamily`, `colorFamilyNames`)에서 읽는다. hex를 손으로 적지 않는다.
import { color, type ColorFamily, type ColorStep, type Role } from "@tide-tds/foundation";
// 내부 서브패스(앱 개발자용 아님). 타일 글자색을 고르려고 대비비를 계산한다.
import { colorFamilyNames, contrastRatio, roleFamily } from "@tide-tds/foundation/internal";

/** 타일 하나. `label`은 타일에 보이는 글자(단계 숫자나 `white`), `name`은 스크린리더가 읽는 전체 이름이다. */
export interface ColorTile {
  readonly name: string;
  readonly label: string;
  readonly hex: string;
  /** 타일 위 글자색. `tileTextColor`가 고른다. */
  readonly text: string;
  /** OKLCH 채도(C). */
  readonly chroma: number;
}

/** 카드 하나. Role 계열은 `role`, 장식 계열은 `"장식"`, white·black 묶음은 `null`이다. */
export interface ColorTileGroup {
  readonly id: string;
  /** 카드의 색 계열. white·black 묶음은 `null`이다. */
  readonly family: ColorFamily | null;
  readonly title: string;
  readonly role: Role | "장식" | null;
  readonly tiles: readonly ColorTile[];
}

export const colorSteps = Object.keys(color.blue).map(Number) as ColorStep[];

const familyRole = Object.fromEntries(
  Object.entries(roleFamily).map(([role, family]) => [family, role]),
) as Partial<Record<ColorFamily, Role>>;

/** Role 계열 다음에 Role이 없는 장식 계열(purple, mint)이 온다(ADR 0022 §5). */
export const scaleFamilies: readonly ColorFamily[] = [
  ...Object.values(roleFamily),
  ...colorFamilyNames.filter((family) => !(family in familyRole)),
];

// 글자색 후보. 진한 글자는 black, 밝은 글자는 white다.
// 어떤 바탕이든 둘 중 높은 쪽은 √21 ≈ 4.58:1 이상이다(두 대비가 같아지는 휘도에서 가장 낮다). 그래서 4.5:1을 늘 넘는다.
const textCandidates = [color.black, color.white] as const;

/** 바탕 위 글자색. 후보 중 대비가 더 높은 쪽을 고른다(같으면 진한 글자). */
export function tileTextColor(background: string): string {
  const [dark, light] = textCandidates;
  return contrastRatio(light, background) > contrastRatio(dark, background) ? light : dark;
}

// sRGB 채널(0~255 hex 두 자리) → 선형 값. sRGB 전달 함수(IEC 61966-2-1)의 역이다.
function linearChannel(hex: string, index: number): number {
  const channel = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/**
 * sRGB hex → OKLCH 채도 C.
 * Björn Ottosson의 OKLab 정의(2020, 「A perceptual color space for image processing」)대로
 * 선형 sRGB → LMS(M1) → 세제곱근 → Lab(M2)로 바꾸고, C = √(a² + b²)다.
 * 행렬 값은 그 정의의 값이며 foundation 스케일 테스트(OKLCH L 계산)와 같다.
 */
export function oklchChroma(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((index) => linearChannel(hex, index)) as [number, number, number];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return Math.hypot(a, bAxis);
}

/** 채도 표기. 소수 셋째 자리까지(예: `0.188`). */
export function formatChroma(hex: string): string {
  return oklchChroma(hex).toFixed(3);
}

function tile(name: string, label: string, hex: string): ColorTile {
  return { name, label, hex, text: tileTextColor(hex), chroma: oklchChroma(hex) };
}

/** 계열 카드(11단계씩)와 white·black 카드. */
export const colorTileGroups: readonly ColorTileGroup[] = [
  ...scaleFamilies.map((family) => ({
    id: family,
    family,
    title: family,
    role: familyRole[family] ?? ("장식" as const),
    tiles: colorSteps.map((step) => tile(`${family}-${step}`, String(step), color[family][step])),
  })),
  {
    id: "base",
    family: null,
    title: "white, black",
    role: null,
    tiles: [tile("white", "white", color.white), tile("black", "black", color.black)],
  },
];
