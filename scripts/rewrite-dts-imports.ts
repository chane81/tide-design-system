// tsc가 만든 d.ts의 상대 import 확장자(.ts/.tsx)를 .js로 바꾼다.
// TS 7.0.2의 rewriteRelativeImportExtensions는 JS 출력만 바꾸고 d.ts는 바꾸지 않는다(티켓 02에서 확인).
// 사용: node scripts/rewrite-dts-imports.ts <dist 디렉터리>
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const target = process.argv[2];
if (!target) {
  throw new Error("dist 디렉터리를 인자로 넘겨야 한다.");
}

const relativeTsSpecifier =
  /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']+?)\.tsx?\2/g;

const root = resolve(target);
const entries = await readdir(root, { recursive: true, withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".d.ts"))
  .map((entry) => join(entry.parentPath, entry.name));

await Promise.all(
  files.map(async (file) => {
    const source = await readFile(file, "utf8");
    const rewritten = source.replace(relativeTsSpecifier, "$1$2$3.js$2");
    if (rewritten !== source) {
      await writeFile(file, rewritten);
    }
  }),
);
