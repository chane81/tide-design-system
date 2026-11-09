// 이름표를 처음 한 번 채운다(ADR 0007 「정정」). 이미 있으면 덮어쓰지 않고 실패한다.
// 대상은 업스트림의 정식 이름(icon-nodes.json의 키)뿐이다. alias 이름의 SVG는 넣지 않는다.
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { namesFile, toTideName, upstreamDir } from "./upstream.ts";

const exists = await access(namesFile).then(
  () => true,
  () => false,
);
if (exists) {
  throw new Error(`이름표가 이미 있다: ${namesFile}. 이름표가 정본이므로 다시 채우지 않는다.`);
}

const iconNodes = JSON.parse(
  await readFile(join(upstreamDir, "icon-nodes.json"), "utf8"),
) as Record<string, unknown>;

const table: Record<string, string> = {};
for (const svgName of Object.keys(iconNodes).sort()) {
  const tideName = toTideName(svgName);
  if (table[tideName]) {
    throw new Error(`Tide 이름이 겹친다: ${tideName} (${table[tideName]}, ${svgName})`);
  }
  table[tideName] = svgName;
}

const sorted = Object.fromEntries(Object.entries(table).sort(([a], [b]) => (a < b ? -1 : 1)));
await writeFile(namesFile, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`이름표를 만들었다: ${Object.keys(sorted).length}개`);
