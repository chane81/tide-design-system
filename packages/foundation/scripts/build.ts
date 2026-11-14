// 원본(src)은 확장자 없는 import라 Node type stripping으로 바로 실행할 수 없어 tsdown이 만든 dist를 import한다.
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
} from "../dist/index.js";
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
} from "../dist/internal.js";

const distDir = fileURLToPath(new URL("../dist/", import.meta.url));
const header =
  "/* 이 파일은 @tide-design/foundation 빌드 스크립트가 만든다. 직접 고치지 않는다. */\n";

// Tailwind 속성별 namespace 이름(tailwindcss 4.3.5 themeKeys, ADR 0003)
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

// 덮기·섞기는 런타임 color-mix() 대신 빌드할 때 계산한 hex로 써서 대비 검사와 같은 값이 되게 한다.
function cssValue(value: SemanticColorValue): string {
  if (value === "transparent") return "transparent";

  return typeof value === "string" ? `var(${tidePrimitiveVar(value)})` : colorValueHex(value);
}

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

// 이름은 `--tide-<Utility class 이름>` 규칙을 따른다. 포커스 ring은 class가 아니라 utility의 구성 값이다.
const tideRadiusVar = (name: string): string => `--tide-rounded-${name}`;
const shapeDeclarations: string[] = [
  ...Object.entries(radius).map(([name, value]) => `  ${tideRadiusVar(name)}: ${value};`),
  `  --tide-focus-ring-width: ${focusRing.width};`,
];

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

// 그림자는 --tide-shadow-color를 참조해서 Theme 블록마다 다시 선언한다. var()는 선언한 요소에서 계산되어
// 상속되므로, :root에만 두면 요소 단위 data-theme="dark" 안에서도 light 그림자 색이 남는다.
const shadowNames = Object.keys(shadow) as ShadowName[];
const tideShadowVar = (name: string): string => `--tide-shadow-${name}`;

// accent 기본값도 같은 이유로 Theme 블록마다 다시 선언한다. [data-color] 규칙은 Theme과 무관해 한 번만 둔다(ADR 0011).
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

// tokens.css에는 Tailwind 문법을 쓰지 않는다. Theme은 prefers-color-scheme으로 자동 전환하지 않는다.
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

// 포커스 색은 accent 슬롯을 따른다(halo subtle-border, 테두리 border. ADR 0032).
// halo를 ring utility로 그려 shadow-*와 함께 써도 그림자가 남는다(tailwindcss 4.3.5).
// 투명 outline은 forced-colors 안에만 둔다. 평소에 두면 transition-colors가 outline 색을 전환해 클릭 직후 번쩍인다.
const focusHalo: string[] = [
  "  @apply ring-(length:--tide-focus-ring-width) ring-(--tide-accent-subtle-border);",
  "  outline: none;",
  // 브라우저 기본 :focus-visible offset(링크·체크박스 1~2px)을 지워 forced-colors outline도 요소에 붙인다.
  "  outline-offset: 0;",
  "  @media (forced-colors: active) {",
  "    outline: var(--tide-focus-ring-width) solid transparent;",
  "  }",
];

// Tailwind 변수는 --tide-*를 가리키는 내부 연결이고 공개 계약이 아니다. 기본값 제거는 tailwindcss 4.3.5 기준이다.
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
  // --font-*: initial은 글꼴만 지우고 굵기는 남긴다.
  "  --font-weight-*: initial;",
  "  --radius-*: initial;",
  // 그림자 기본값은 자기 색(검정 alpha)을 써서 Theme 색과 어긋나므로 모두 지운다.
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
  // transition-colors처럼 시간을 적지 않은 class가 쓰는 기본값
  `  --default-transition-duration: var(${tideDurationVar("fast")});`,
  `  --default-transition-timing-function: var(${tideEaseVar("out")});`,
  ...zIndexNames.map((name) => `  --z-index-${name}: var(${tideZVar(name)});`),
  "}",
  "",
  "@utility focus-ring {",
  ...focusHalo,
  "}",
  "",
  "@utility focus-field {",
  "  border-color: var(--tide-accent-border);",
  ...focusHalo,
  // 오류 입력창은 같은 모양을 오류 색으로 그린다(ADR 0026).
  '  &[aria-invalid="true"] {',
  "    border-color: var(--tide-border-danger);",
  "    @apply ring-(--tide-border-danger-subtle);",
  "  }",
  "}",
  "",
  // 한글은 어절 단위로 줄을 바꾸고 긴 영문·URL은 끊는다. 선택자는 Tailwind preflight와 같다.
  "@layer base {",
  "  html,",
  "  :host {",
  "    word-break: keep-all;",
  "    overflow-wrap: break-word;",
  "  }",
  "}",
  "",
].join("\n");

// tailwind-merge 설정은 순수 객체라 런타임에서 tailwind-merge에 의존하지 않는다(tailwind-merge 3.7.0).
// Semantic 키는 그 namespace의 group에만 더해 text-canvas 같은 이름은 분류되지 않게 한다.
const semanticKeys = (namespace: SemanticNamespace): string[] => [
  ...semantic.filter((entry) => entry.namespace === namespace).map((entry) => entry.key),
  ...accentUtilities
    .filter((utility) => utility.namespace === namespace)
    .map((utility) => utility.key),
];

// --border-color는 border의 모든 방향과 divide가 함께 읽는다(tailwindcss 4.3.5).
const borderSides = ["x", "y", "s", "e", "bs", "be", "t", "r", "b", "l"];
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
      // 텍스트 스타일이 굵기도 정하므로, 앞의 font-bold가 뒤의 text-body-md를 이기지 못하게 한다.
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
      // 기본 group은 숫자만 알아서 Tide 이름을 더해 duration-fast·z-modal도 충돌로 잡히게 한다.
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
