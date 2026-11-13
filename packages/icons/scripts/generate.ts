// 이름표에 있는 이름만 만든다. 이름표에 없는 원본 SVG는 목록만 출력하고 넣을지는 사람이 정한다(ADR 0007).
// 결과(src/generated/, LICENSE)는 커밋하지 않는다.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { namesFile, packageDir, svgDir, svgNames, upstreamDir } from "./upstream.ts";

const outDir = join(packageDir, "src/generated");

/** 원본 SVG의 도형 하나. 업스트림 SVG는 모두 자식 없는 도형만 평평하게 담고 있다. */
interface Shape {
  tag: string;
  attributes: [name: string, value: string][];
}

const SHAPE_TAGS = new Set(["path", "circle", "rect", "line", "ellipse", "polyline", "polygon"]);
// 도형에 허용하는 속성. 모르는 속성이 나오면 JSX 이름 변환을 확인해야 하므로 실패시킨다.
const SHAPE_ATTRIBUTES = new Set([
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "width",
  "height",
  "points",
  "fill",
]);

function parseSvg(svgName: string, source: string): Shape[] {
  const body = /<svg[^>]*>([\s\S]*)<\/svg>/.exec(source)?.[1];
  if (body === undefined) {
    throw new Error(`${svgName}.svg: <svg> 요소를 찾지 못했다.`);
  }
  const shapes: Shape[] = [];
  const rest = body.replace(/<([a-z]+)((?:\s+[a-zA-Z0-9:-]+="[^"]*")*)\s*\/>/g, (_, tag, attrs) => {
    if (!SHAPE_TAGS.has(tag)) {
      throw new Error(`${svgName}.svg: 지원하지 않는 요소 <${tag}>`);
    }
    const attributes: Shape["attributes"] = [];
    for (const [, name, value] of (attrs as string).matchAll(/([a-zA-Z0-9:-]+)="([^"]*)"/g)) {
      if (!name || value === undefined || !SHAPE_ATTRIBUTES.has(name)) {
        throw new Error(`${svgName}.svg: 지원하지 않는 속성 ${name}`);
      }
      attributes.push([name, value]);
    }
    shapes.push({ tag, attributes });

    return "";
  });
  if (rest.trim() !== "") {
    throw new Error(`${svgName}.svg: 해석하지 못한 내용이 남았다: ${rest.trim().slice(0, 80)}`);
  }
  if (shapes.length === 0) {
    throw new Error(`${svgName}.svg: 도형이 없다.`);
  }

  return shapes;
}

function shapeJsx({ tag, attributes }: Shape): string {
  const attrs = attributes.map(([name, value]) => `${name}=${JSON.stringify(value)}`).join(" ");

  // 렌더된 선 두께를 크기와 무관하게 유지한다. vector-effect는 상속되지 않아 도형마다 붙인다.
  return `      <${tag} ${attrs} vectorEffect="non-scaling-stroke" />`;
}

function componentSource(tideName: string, shapes: Shape[]): string {
  return `// 생성 파일(scripts/generate.ts). 고치지 말고 이름표(icon-names.json)를 고친다.
import type { ReactElement } from "react";

import { IconBase, type IconProps } from "../IconBase";

export function ${tideName}(props: IconProps): ReactElement {
  return (
    <IconBase {...props}>
${shapes.map(shapeJsx).join("\n")}
    </IconBase>
  );
}
`;
}

const table = JSON.parse(await readFile(namesFile, "utf8")) as Record<string, string>;
const tideNames = Object.keys(table).sort();

const badNames = tideNames.filter((name) => !/^[A-Z][A-Za-z0-9]*Icon$/.test(name));
if (badNames.length > 0) {
  throw new Error(`이름표의 Tide 이름은 PascalCase에 Icon 접미사여야 한다: ${badNames.join(", ")}`);
}

const available = new Set(await svgNames());
const missing = tideNames.filter((name) => !available.has(table[name] ?? ""));
if (missing.length > 0) {
  throw new Error(
    `원본 SVG가 없다(이름표의 원본 이름을 고친다):\n${missing.map((name) => `  ${name} → ${table[name]}.svg`).join("\n")}`,
  );
}

// `LetterSIcon`·`LettersIcon`처럼 대소문자만 다른 이름이 대소문자를 구분하지 않는 파일 시스템에서
// 겹치지 않게 kebab-case로 짓는다.
function fileName(tideName: string): string {
  return tideName.replace(/[A-Z]/g, (letter, index: number) =>
    index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`,
  );
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const tideName of tideNames) {
  const svgName = table[tideName] ?? "";
  const shapes = parseSvg(svgName, await readFile(join(svgDir, `${svgName}.svg`), "utf8"));
  await writeFile(join(outDir, `${fileName(tideName)}.tsx`), componentSource(tideName, shapes));
}

await writeFile(
  join(outDir, "index.ts"),
  `// 생성 파일(scripts/generate.ts). 고치지 말고 이름표(icon-names.json)를 고친다.\n${tideNames
    .map((name) => `export { ${name} } from "./${fileName(name)}";`)
    .join("\n")}\n`,
);

// 업스트림 LICENSE는 저작권 고지라 전문을 그대로 붙인다(ADR 0007).
const tideLicense = await readFile(join(packageDir, "../../LICENSE"), "utf8");
const upstreamLicense = await readFile(join(upstreamDir, "LICENSE"), "utf8");
await writeFile(
  join(packageDir, "LICENSE"),
  `${tideLicense.trimEnd()}

---

The icons in this package are generated from Lucide (https://lucide.dev).
The Lucide license and the Feather license below apply to those icons.

${upstreamLicense.trimEnd()}
`,
);

// 이름표에 없는 원본 SVG는 알리기만 한다(업스트림 alias SVG도 여기에 나온다).
const used = new Set(Object.values(table));
const unlisted = [...available].filter((name) => !used.has(name));
const { version } = JSON.parse(await readFile(join(upstreamDir, "package.json"), "utf8")) as {
  version: string;
};
console.log(`아이콘 ${tideNames.length}개를 만들었다(원본 ${version}).`);
if (unlisted.length > 0) {
  console.log(
    `이름표에 없는 원본 SVG ${unlisted.length}개(넣을지는 사람이 정한다): ${unlisted.join(", ")}`,
  );
}
