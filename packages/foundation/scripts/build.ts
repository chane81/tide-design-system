// Token 원본(src)에서 CSS와 tailwind-merge 설정을 만든다(ADR 0003).
// Node 26의 type stripping으로 바로 실행한다: `node scripts/build.ts`
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  color,
  fontFamily,
  fontSize,
  fontWeight,
  textStyle,
  type FontFamilyName,
  type SemanticColorValue,
  type SemanticNamespace,
  type ThemeName,
} from "../src/index.ts";
import { colorValueHex, fontFamilyCss, semanticEntries, shadowColor } from "../src/internal.ts";

const distDir = fileURLToPath(new URL("../dist/", import.meta.url));
const header = "/* 이 파일은 @tide-tds/foundation 빌드 스크립트가 만든다. 직접 고치지 않는다. */\n";

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

/** Semantic 값의 CSS 표현. Primitive는 변수로 참조하고, alpha가 있으면 8자리 hex로 쓴다. */
function cssValue(value: SemanticColorValue): string {
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

function themeBlock(theme: ThemeName): string[] {
  return [
    `  color-scheme: ${theme};`,
    ...semantic.map(
      (entry) => `  ${tideSemanticVar(entry.className)}: ${cssValue(entry.value[theme])};`,
    ),
    `  --tide-shadow-color: ${cssValue(shadowColor[theme])};`,
  ];
}

// tokens.css: --tide-* 변수와 [data-theme] 덮어쓰기만 담는다. Tailwind 문법은 쓰지 않는다.
// Theme 블록은 속성 선택자라서 요소 단위 data-theme에도 적용된다. prefers-color-scheme으로 자동 전환하지 않는다.
const tokensCss = [
  header,
  ":root {",
  ...primitiveEntries.map((entry) => `  ${tidePrimitiveVar(entry.name)}: ${entry.hex};`),
  ...typographyDeclarations,
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
  ...primitiveEntries.map(
    (entry) => `  --color-${entry.name}: var(${tidePrimitiveVar(entry.name)});`,
  ),
  ...semantic.map(
    (entry) =>
      `  ${tailwindNamespace[entry.namespace]}-${entry.key}: var(${tideSemanticVar(entry.className)});`,
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
const semanticKeys = (namespace: SemanticNamespace): string[] =>
  semantic.filter((entry) => entry.namespace === namespace).map((entry) => entry.key);

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
