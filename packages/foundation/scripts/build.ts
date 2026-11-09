// Token 원본(src)에서 CSS와 tailwind-merge 설정을 만든다(ADR 0003).
// Node 26의 type stripping으로 바로 실행한다: `node scripts/build.ts`
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { color, semantic, semanticPrefix, type SemanticNamespace } from "../src/index.ts";

const distDir = fileURLToPath(new URL("../dist/", import.meta.url));
const header = "/* 이 파일은 @tide-tds/foundation 빌드 스크립트가 만든다. 직접 고치지 않는다. */\n";

type Theme = "light" | "dark";

// Tailwind namespace 이름. 예: background → --background-color-*
const tailwindNamespace: Record<SemanticNamespace, string> = {
  background: "--background-color",
  text: "--text-color",
  border: "--border-color",
  outline: "--outline-color",
};

const primitiveEntries = Object.entries(color).flatMap(([family, steps]) =>
  Object.entries(steps).map(([step, hex]) => ({ name: `${family}-${step}`, hex })),
);

const semanticEntries = (Object.keys(semantic) as SemanticNamespace[]).flatMap((namespace) =>
  Object.entries(semantic[namespace]).map(([key, value]) => ({
    namespace,
    key,
    // 공개 계약: --tide-<Utility class 이름>
    className: `${semanticPrefix[namespace]}-${key}`,
    value: value as Record<Theme, string>,
  })),
);

/** 공개 계약 변수 이름 */
const tidePrimitiveVar = (name: string): string => `--tide-color-${name}`;
const tideSemanticVar = (className: string): string => `--tide-${className}`;

function semanticBlock(theme: Theme): string[] {
  return semanticEntries.map(
    (entry) =>
      `  ${tideSemanticVar(entry.className)}: var(${tidePrimitiveVar(entry.value[theme])});`,
  );
}

// tokens.css: --tide-* 변수와 [data-theme] 덮어쓰기만 담는다. Tailwind 문법은 쓰지 않는다.
const tokensCss = [
  header,
  ":root {",
  ...primitiveEntries.map((entry) => `  ${tidePrimitiveVar(entry.name)}: ${entry.hex};`),
  "}",
  "",
  ':root,\n[data-theme="light"] {',
  "  color-scheme: light;",
  ...semanticBlock("light"),
  "}",
  "",
  '[data-theme="dark"] {',
  "  color-scheme: dark;",
  ...semanticBlock("dark"),
  "}",
  "",
].join("\n");

// tailwind.css: tokens.css 위에 Tailwind 기본 팔레트 제거와 @theme inline 연결을 얹는다.
// Tailwind 변수는 --tide-*를 가리키는 내부 연결이고 공개 계약이 아니다.
const tailwindCss = [
  header,
  '@import "./tokens.css";',
  "",
  "@theme inline {",
  "  --color-*: initial;",
  ...primitiveEntries.map(
    (entry) => `  --color-${entry.name}: var(${tidePrimitiveVar(entry.name)});`,
  ),
  ...semanticEntries.map(
    (entry) =>
      `  ${tailwindNamespace[entry.namespace]}-${entry.key}: var(${tideSemanticVar(entry.className)});`,
  ),
  "}",
  "",
].join("\n");

// tailwind-merge 설정: 순수 객체다. 런타임에서 tailwind-merge에 의존하지 않는다.
// color 스케일을 Tide 이름으로 바꿔, Tide에 없는 색 이름은 충돌 해결 대상에서 빠지게 한다.
const colorNames = [
  "inherit",
  "current",
  "transparent",
  ...primitiveEntries.map((entry) => entry.name),
  ...new Set(semanticEntries.map((entry) => entry.key)),
];
const tailwindMergeConfig = { override: { theme: { color: colorNames } } };

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
