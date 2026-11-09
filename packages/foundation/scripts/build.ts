// Token 원본(src)에서 CSS와 tailwind-merge 설정을 만든다(ADR 0003).
// Node 26의 type stripping으로 바로 실행한다: `node scripts/build.ts`
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  color,
  colorValueHex,
  semanticEntries,
  shadowColor,
  type SemanticColorValue,
  type SemanticNamespace,
  type ThemeName,
} from "../src/index.ts";

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

// tailwind.css: tokens.css 위에 dark variant, Tailwind 기본 팔레트 제거, @theme inline 연결을 얹는다.
// Tailwind 변수는 --tide-*를 가리키는 내부 연결이고 공개 계약이 아니다.
// dark variant는 Tailwind 문서(dark-mode, data attribute)의 형태를 그대로 쓴다.
const tailwindCss = [
  header,
  '@import "./tokens.css";',
  "",
  "@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));",
  "",
  "@theme inline {",
  "  --color-*: initial;",
  ...primitiveEntries.map(
    (entry) => `  --color-${entry.name}: var(${tidePrimitiveVar(entry.name)});`,
  ),
  ...semantic.map(
    (entry) =>
      `  ${tailwindNamespace[entry.namespace]}-${entry.key}: var(${tideSemanticVar(entry.className)});`,
  ),
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
const tailwindMergeConfig = {
  override: {
    theme: {
      color: ["inherit", "current", "transparent", ...primitiveEntries.map((entry) => entry.name)],
    },
  },
  extend: {
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
