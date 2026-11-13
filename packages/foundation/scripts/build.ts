// Token 원본(src)에서 CSS와 tailwind-merge 설정을 만든다(ADR 0003).
// Node 26의 type stripping으로 바로 실행한다: `node scripts/build.ts`
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  color,
  duration,
  easing,
  focusRing,
  fontFamily,
  fontSize,
  fontWeight,
  radius,
  shadow,
  textStyle,
  zIndex,
  type FontFamilyName,
  type SemanticColorValue,
  type SemanticNamespace,
  type ShadowName,
  type ThemeName,
} from "../src/index.ts";
import {
  accentDefaultDeclarations,
  accentUtilities,
  accentVar,
  colorValueHex,
  dataColorRule,
  fontFamilyCss,
  roleAliasCss,
  semanticEntries,
  shadowColor,
  shadowCss,
  tideColorNames,
  tideFamilyThemeDeclarations,
} from "../src/internal.ts";

const distDir = fileURLToPath(new URL("../dist/", import.meta.url));
const header =
  "/* 이 파일은 @tide-design/foundation 빌드 스크립트가 만든다. 직접 고치지 않는다. */\n";

// Tailwind 속성별 namespace 이름(tailwindcss 4.3.5 dist/lib.mjs의 themeKeys로 확인, ADR 0003).
// 예: background → --background-color-*
const tailwindNamespace: Record<SemanticNamespace, string> = {
  background: "--background-color",
  text: "--text-color",
  border: "--border-color",
  outline: "--outline-color",
};

const primitiveEntries: { name: string; hex: string }[] = Object.entries(color).flatMap<{
  name: string;
  hex: string;
}>(([family, steps]) =>
  typeof steps === "string"
    ? [{ name: family, hex: steps }]
    : Object.entries(steps).map(([step, hex]) => ({ name: `${family}-${step}`, hex })),
);

const semantic = semanticEntries();

/** 공개 계약 변수 이름 */
const tidePrimitiveVar = (name: string): string => `--tide-color-${name}`;
const tideSemanticVar = (className: string): string => `--tide-${className}`;

/**
 * Semantic 값의 CSS 표현. Primitive는 변수로 참조하고, alpha가 있으면 8자리 hex로, transparent는 키워드로 쓴다.
 * 덮기·섞기(ADR 0022)는 빌드할 때 계산한 6자리 hex다. 런타임 color-mix()를 쓰지 않아 대비 검사와 같은 값이다.
 */
function cssValue(value: SemanticColorValue): string {
  if (value === "transparent") return "transparent";

  return typeof value === "string" ? `var(${tidePrimitiveVar(value)})` : colorValueHex(value);
}

// 타이포그래피 공개 계약. Theme과 무관하므로 Primitive 색과 같은 :root 블록에 둔다.
// 텍스트 스타일은 Primitive 크기와 굵기 Token을 변수로 참조한다(Semantic이 Primitive를 참조하는 것과 같은 구조).
const fontFamilyNames = Object.keys(fontFamily) as FontFamilyName[];
const tideFontFamilyVar = (name: string): string => `--tide-font-${name}`;
const tideFontSizeVar = (step: string | number): string => `--tide-font-size-${step}`;
const tideFontWeightVar = (name: string): string => `--tide-font-${name}`;
const tideTextVar = (name: string): string => `--tide-text-${name}`;
const textStyleEntries = Object.entries(textStyle);

const typographyDeclarations: string[] = [
  ...fontFamilyNames.map((name) => `  ${tideFontFamilyVar(name)}: ${fontFamilyCss(name)};`),
  ...Object.entries(fontSize).map(([step, rem]) => `  ${tideFontSizeVar(step)}: ${rem};`),
  ...Object.entries(fontWeight).map(([name, value]) => `  ${tideFontWeightVar(name)}: ${value};`),
  ...textStyleEntries.flatMap(([name, style]) => [
    `  ${tideTextVar(name)}: var(${tideFontSizeVar(style.fontSize)});`,
    `  ${tideTextVar(name)}--line-height: ${style.lineHeight};`,
    `  ${tideTextVar(name)}--font-weight: var(${tideFontWeightVar(style.fontWeight)});`,
  ]),
];

// radius와 포커스 ring 공개 계약. Theme과 무관하므로 :root 블록에 둔다.
// 이름은 `--tide-<Utility class 이름>` 규칙을 따른다(rounded-md → --tide-rounded-md).
// 포커스 ring은 class가 아니라 utility의 구성 값이라 spec이 정한 이름(--tide-focus-ring-width/offset)을 쓴다.
const tideRadiusVar = (name: string): string => `--tide-rounded-${name}`;
const shapeDeclarations: string[] = [
  ...Object.entries(radius).map(([name, value]) => `  ${tideRadiusVar(name)}: ${value};`),
  `  --tide-focus-ring-width: ${focusRing.width};`,
  `  --tide-focus-ring-offset: ${focusRing.offset};`,
];

// motion·쌓임 단계 공개 계약. Theme과 무관하므로 :root 블록에 둔다.
// 이름은 `--tide-<Utility class 이름>` 규칙을 따른다(duration-fast → --tide-duration-fast, ease-out → --tide-ease-out,
// z-modal → --tide-z-modal).
const durationNames = Object.keys(duration);
const easingNames = Object.keys(easing);
const zIndexNames = Object.keys(zIndex);
const tideDurationVar = (name: string): string => `--tide-duration-${name}`;
const tideEaseVar = (name: string): string => `--tide-ease-${name}`;
const tideZVar = (name: string): string => `--tide-z-${name}`;
const motionDeclarations: string[] = [
  ...Object.entries(duration).map(([name, value]) => `  ${tideDurationVar(name)}: ${value};`),
  ...Object.entries(easing).map(([name, value]) => `  ${tideEaseVar(name)}: ${value};`),
  ...Object.entries(zIndex).map(([name, value]) => `  ${tideZVar(name)}: ${value};`),
];

// Elevation 공개 계약(shadow-md → --tide-shadow-md).
// --tide-shadow-color를 참조하는 값이라 Theme 블록마다 다시 선언한다. 사용자 정의 속성의 var()는 선언한 요소에서
// 계산되어 상속되므로, :root에만 두면 요소 단위 data-theme="dark" 안에서도 light 그림자 색이 남는다.
const shadowNames = Object.keys(shadow) as ShadowName[];
const tideShadowVar = (name: string): string => `--tide-shadow-${name}`;

// 색 계열 변수 묶음과 accent 슬롯(tide-v0-impl 티켓 40, ADR 0011).
// - 계열 변수(--tide-blue-solid 등)는 Theme 블록마다 정한다. Role Token은 계열 변수의 별칭이고,
//   덮어쓴 슬롯(neutral dark subtle)만 Primitive를 직접 가리킨다.
// - accent 슬롯(--tide-accent-*)의 기본값은 primary다. Theme 블록마다 다시 선언해서 요소 단위 data-theme에서도
//   그 Theme 값을 읽는다. [data-color] 규칙은 Theme과 무관한 별칭이라 Theme 블록 뒤에 한 번씩만 둔다.
function themeBlock(theme: ThemeName): string[] {
  return [
    `  color-scheme: ${theme};`,
    ...tideFamilyThemeDeclarations(theme),
    ...semantic.map(
      (entry) =>
        `  ${tideSemanticVar(entry.className)}: ${roleAliasCss(entry.className, theme) ?? cssValue(entry.value[theme])};`,
    ),
    ...accentDefaultDeclarations(),
    `  --tide-shadow-color: ${cssValue(shadowColor[theme])};`,
    ...shadowNames.map((name) => `  ${tideShadowVar(name)}: ${shadowCss(name)};`),
  ];
}

// tokens.css: --tide-* 변수와 [data-theme] 덮어쓰기, [data-color] 규칙만 담는다. Tailwind 문법은 쓰지 않는다.
// Theme 블록은 속성 선택자라서 요소 단위 data-theme에도 적용된다. prefers-color-scheme으로 자동 전환하지 않는다.
const tokensCss = [
  header,
  ":root {",
  ...primitiveEntries.map((entry) => `  ${tidePrimitiveVar(entry.name)}: ${entry.hex};`),
  ...typographyDeclarations,
  ...shapeDeclarations,
  ...motionDeclarations,
  "}",
  "",
  ':root,\n[data-theme="light"] {',
  ...themeBlock("light"),
  "}",
  "",
  '[data-theme="dark"] {',
  ...themeBlock("dark"),
  "}",
  "",
  ...tideColorNames.flatMap((name) => [dataColorRule(name), ""]),
].join("\n");

// tailwind.css: tokens.css 위에 dark variant, Tailwind 기본값 제거, @theme inline 연결, base CSS를 얹는다.
// Tailwind 변수는 --tide-*를 가리키는 내부 연결이고 공개 계약이 아니다.
// dark variant는 Tailwind 문서(dark-mode, data attribute)의 형태를 그대로 쓴다.
// 기본값 제거(tailwindcss 4.3.5에서 확인):
// - --text-*: initial은 기본 크기(text-xs~9xl)만 지운다. --text-color-*(뒤에서 정의), --text-shadow-*는 남는다.
// - --font-*: initial은 font-family(sans·serif·mono)만 지우고 굵기는 남기므로 --font-weight-*: initial을 따로 쓴다.
// - --leading-*, --tracking-*는 지우지 않는다(드문 경우의 확장 수단). tabular-nums는 theme 변수가 없는 class다.
// - --font-sans를 정의하면 Tailwind preflight의 기본 글꼴(--default-font-family)도 Tide sans를 따른다.
// 텍스트 스타일은 --text-<이름>--line-height, --font-weight 하위 변수로 class 하나에 묶는다(Tailwind font-size 문서).
// - --radius-*: initial은 rounded-xs·2xl·3xl·4xl과 단계 없는 rounded를 지운다. rounded-none은 theme 변수가 없는 class라 남는다.
//   rounded-full은 --radius-full을 정의하면 그 값을 쓴다.
// - 그림자 기본값은 자기 색(검정 alpha)을 써서 Theme 매핑과 어긋나므로 모두 지운다(tide-v0 티켓 12 「교체」):
//   --shadow-*(단계 없는 shadow 포함), --inset-shadow-*, --drop-shadow-*, --text-shadow-*. shadow-none은 theme 변수가 없는 class라 남는다.
// - shadow-md는 --tw-shadow: var(--tide-shadow-md)가 된다. 값이 var() 하나라 Tailwind가 색을 --tw-shadow-color로 바꾸지 않으므로
//   shadow-<색> class로 그림자 색을 바꿀 수 없다(spec: shadow 색은 class로 노출하지 않는다).
// - motion(tide-v0 티켓 21): duration-* class는 --transition-duration-* namespace를 찾고, 없으면 숫자를 ms로 읽는다.
//   기본 theme에는 이 namespace 값이 없으므로 지울 것이 없다. 숫자 해석(duration-150)은 끌 수 없어 그대로 둔다.
//   easing namespace는 --ease-*다. --ease-out만 Tide 공개 계약에 연결하고 ease-in, ease-in-out은 Tailwind 기본값으로 남긴다.
//   transition-colors처럼 시간을 적지 않은 class는 --default-transition-duration과 --default-transition-timing-function을 쓰므로
//   둘을 fast와 out에 연결한다(기본값은 150ms, cubic-bezier(0.4, 0, 0.2, 1)).
// - 쌓임 단계(tide-v0 티켓 22): z-* class는 --z-index-* namespace를 찾는다. 기본 theme에는 값이 없다.
//   숫자 해석(z-10, z-50)은 끌 수 없어 그대로 둔다. Component 내부 겹침용 z-0/z-1도 숫자 해석이다.
const tailwindCss = [
  header,
  '@import "./tokens.css";',
  "",
  "@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));",
  "",
  "@theme inline {",
  "  --color-*: initial;",
  "  --text-*: initial;",
  "  --font-*: initial;",
  "  --font-weight-*: initial;",
  "  --radius-*: initial;",
  "  --shadow-*: initial;",
  "  --inset-shadow-*: initial;",
  "  --drop-shadow-*: initial;",
  "  --text-shadow-*: initial;",
  ...primitiveEntries.map(
    (entry) => `  --color-${entry.name}: var(${tidePrimitiveVar(entry.name)});`,
  ),
  ...semantic.map(
    (entry) =>
      `  ${tailwindNamespace[entry.namespace]}-${entry.key}: var(${tideSemanticVar(entry.className)});`,
  ),
  // accent Utility class(bg-accent-solid, text-accent 등). 계열 Utility class(bg-blue-solid)는 노출하지 않는다.
  ...accentUtilities.map(
    (utility) =>
      `  ${tailwindNamespace[utility.namespace]}-${utility.key}: var(${accentVar(utility.slot)});`,
  ),
  ...fontFamilyNames.map((name) => `  --font-${name}: var(${tideFontFamilyVar(name)});`),
  ...Object.keys(fontWeight).map(
    (name) => `  --font-weight-${name}: var(${tideFontWeightVar(name)});`,
  ),
  ...textStyleEntries.flatMap(([name]) => [
    `  --text-${name}: var(${tideTextVar(name)});`,
    `  --text-${name}--line-height: var(${tideTextVar(name)}--line-height);`,
    `  --text-${name}--font-weight: var(${tideTextVar(name)}--font-weight);`,
  ]),
  ...Object.keys(radius).map((name) => `  --radius-${name}: var(${tideRadiusVar(name)});`),
  ...shadowNames.map((name) => `  --shadow-${name}: var(${tideShadowVar(name)});`),
  ...durationNames.map((name) => `  --transition-duration-${name}: var(${tideDurationVar(name)});`),
  ...easingNames.map((name) => `  --ease-${name}: var(${tideEaseVar(name)});`),
  `  --default-transition-duration: var(${tideDurationVar("fast")});`,
  `  --default-transition-timing-function: var(${tideEaseVar("out")});`,
  ...zIndexNames.map((name) => `  --z-index-${name}: var(${tideZVar(name)});`),
  "}",
  "",
  // 포커스 표시(tide-v0 티켓 20). @utility로 정의해서 focus-visible:focus-ring, focus:focus-field처럼 variant와 함께 쓴다.
  // - ring: outline 2px, offset 2px. 요소의 radius를 따른다.
  // - field: offset 없이 border를 focus 색으로 바꾸고, 늘어난 1px는 inset shadow로 그려 2px로 보이게 한다(레이아웃이 그대로다).
  //   평소에는 outline을 없앤다(UA :focus-visible outline도 막는다). forced-colors 모드에서만 투명 outline을 두면
  //   시스템 색으로 그려져 포커스 표시가 남는다(그 모드는 border 색과 box-shadow를 덮어쓴다).
  //   평소에도 투명 outline을 두면 transition-colors가 outline-color를 currentColor → transparent로 전환해,
  //   클릭 직후 150ms 동안 글자색 outline이 번쩍였다 사라진다. 그래서 forced-colors 안으로 옮겼다.
  // - error+focus: 오류 입력창(aria-invalid="true")은 포커스 중에 같은 2px 표시를 오류 색(border-danger)으로 그린다
  //   (ADR 0026). 빨간 border 안쪽에 파란 inset이 겹쳐 두 색이 보이지 않게 border와 inset을 같은 색으로 맞춘다.
  //   variant 없이 쓰면 .focus-field[aria-invalid](0,2,0)가 aria-invalid:border-danger(0,2,0)와 동률이지만,
  //   둘 다 border-danger라 순서와 상관없이 결과가 같다.
  "@utility focus-ring {",
  "  outline: var(--tide-focus-ring-width) solid var(--tide-outline-focus);",
  "  outline-offset: var(--tide-focus-ring-offset);",
  "}",
  "",
  "@utility focus-field {",
  "  border-color: var(--tide-outline-focus);",
  "  box-shadow: inset 0 0 0 1px var(--tide-outline-focus);",
  "  outline: none;",
  "  @media (forced-colors: active) {",
  "    outline: var(--tide-focus-ring-width) solid transparent;",
  "  }",
  '  &[aria-invalid="true"] {',
  "    border-color: var(--tide-border-danger);",
  "    box-shadow: inset 0 0 0 1px var(--tide-border-danger);",
  "  }",
  "}",
  "",
  // 한글은 어절 단위로 줄을 바꾸고, 공백 없이 긴 영문·URL은 끊는다. 루트 font-size는 바꾸지 않는다.
  // 선택자는 Tailwind preflight의 html, :host와 같다. 둘 다 상속되는 속성이다.
  "@layer base {",
  "  html,",
  "  :host {",
  "    word-break: keep-all;",
  "    overflow-wrap: break-word;",
  "  }",
  "}",
  "",
].join("\n");

// tailwind-merge 설정: 순수 객체다. 런타임에서 tailwind-merge에 의존하지 않는다(tailwind-merge 3.7.0).
// - theme color: Tide Primitive 이름으로 바꾼다(기본값 [isAny]). Tide에 없는 색 이름은 충돌 해결 대상에서 빠진다.
// - Semantic 색: Tailwind namespace마다 쓰는 class group에 그 namespace의 키만 더한다.
//   그래서 bg-canvas는 배경색, text-muted는 글자색으로 분류되고 text-canvas 같은 이름은 분류되지 않는다.
//   --border-color는 border의 모든 방향과 divide가 함께 읽는다(tailwindcss 4.3.5 themeKeys).
// accent Utility class도 같은 group에 넣는다(bg-accent-solid는 배경색, text-accent-on-solid는 글자색).
const semanticKeys = (namespace: SemanticNamespace): string[] => [
  ...semantic.filter((entry) => entry.namespace === namespace).map((entry) => entry.key),
  ...accentUtilities
    .filter((utility) => utility.namespace === namespace)
    .map((utility) => utility.key),
];

const borderSides = ["x", "y", "s", "e", "bs", "be", "t", "r", "b", "l"];
// - 텍스트 스타일·굵기·font-family: theme의 text, font-weight, font를 Tide 이름으로 바꾼다.
//   text-body-md는 font-size group, text-muted는 text-color group이라 서로 지우지 않는다.
// - 텍스트 스타일은 행간과 굵기도 정한다. 기본 설정의 font-size → leading 충돌에 font-weight를 더해서
//   앞에 온 font-bold가 뒤에 온 text-body-md보다 이기는 일(Tailwind의 --tw-font-weight 우선)을 막는다.
const tailwindMergeConfig = {
  override: {
    theme: {
      color: ["inherit", "current", "transparent", ...primitiveEntries.map((entry) => entry.name)],
      text: Object.keys(textStyle),
      "font-weight": Object.keys(fontWeight),
      font: fontFamilyNames,
      // radius·Elevation: Tide 단계만 둔다. rounded-2xl, shadow-xl처럼 지운 이름은 분류하지 않는다.
      radius: Object.keys(radius),
      shadow: shadowNames,
      // CSS에서 지운 그림자 기본값. 남은 class는 none과 임의 값뿐이다.
      "inset-shadow": [],
      "drop-shadow": [],
      "text-shadow": [],
    },
  },
  extend: {
    conflictingClassGroups: {
      "font-size": ["font-weight"],
    },
    classGroups: {
      "bg-color": [{ bg: semanticKeys("background") }],
      "text-color": [{ text: semanticKeys("text") }],
      "border-color": [{ border: semanticKeys("border") }],
      ...Object.fromEntries(
        borderSides.map((side) => [
          `border-color-${side}`,
          [{ [`border-${side}`]: semanticKeys("border") }],
        ]),
      ),
      "divide-color": [{ divide: semanticKeys("border") }],
      "outline-color": [{ outline: semanticKeys("outline") }],
      // motion·쌓임 단계: 기본 group은 숫자와 임의 값만 안다. Tide 이름을 더해 duration-fast duration-normal,
      // z-10 z-modal이 서로 지우게 한다. easing은 기본 theme ease(in, out, in-out)에 out이 이미 있다.
      duration: [{ duration: durationNames }],
      z: [{ z: zIndexNames }],
    },
  },
};

const tailwindMergeJs = `${header}export const tailwindMergeConfig = ${JSON.stringify(tailwindMergeConfig, null, 2)};\n`;
const tailwindMergeDts = `${header}import type { ConfigExtension, DefaultClassGroupIds, DefaultThemeGroupIds } from "tailwind-merge";

/** \`extendTailwindMerge\`에 넘기는 Tide 설정 */
export declare const tailwindMergeConfig: ConfigExtension<DefaultClassGroupIds, DefaultThemeGroupIds>;
`;

await mkdir(distDir, { recursive: true });
await Promise.all([
  writeFile(new URL("tokens.css", `file://${distDir}`), tokensCss),
  writeFile(new URL("tailwind.css", `file://${distDir}`), tailwindCss),
  writeFile(new URL("tailwind-merge.js", `file://${distDir}`), tailwindMergeJs),
  writeFile(new URL("tailwind-merge.d.ts", `file://${distDir}`), tailwindMergeDts),
]);
