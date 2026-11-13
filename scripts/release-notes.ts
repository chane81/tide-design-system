// GitHub Release 본문을 파일에 쓰고 표준 출력에 버전을 찍는다. PUBLISHED_PACKAGES는 publish 액션의 출력이다.
// 세 패키지는 fixed라 버전이 하나여야 하고, 다르면 실패한다.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// 문서와 같은 순서(Token → 아이콘 → Component)로 붙인다.
const ORDER = ["@tide-design/foundation", "@tide-design/icons", "@tide-design/components"];

const outPath = process.argv[2];
const published = JSON.parse(process.env.PUBLISHED_PACKAGES ?? "[]") as Array<{
  name: string;
  version: string;
}>;
if (!outPath || published.length === 0) {
  console.error("사용법: PUBLISHED_PACKAGES='[…]' node scripts/release-notes.ts <본문 파일>");
  process.exit(2);
}

const versions = [...new Set(published.map((pkg) => pkg.version))];
if (versions.length !== 1) {
  console.error(`fixed 묶음인데 버전이 여러 개다: ${versions.join(", ")}`);
  process.exit(1);
}
const [version] = versions;

const dirs = new Map<string, string>();
for (const dir of readdirSync("packages")) {
  const manifest = join("packages", dir, "package.json");
  if (!existsSync(manifest)) continue;
  dirs.set((JSON.parse(readFileSync(manifest, "utf8")) as { name: string }).name, dir);
}

/** CHANGELOG에서 `## <version>` 항목의 본문만 꺼낸다. */
function entryOf(changelog: string): string | null {
  const lines = changelog.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  if (start === -1) return null;
  const end = lines.findIndex((line, index) => index > start && line.startsWith("## "));

  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join("\n")
    .trim();
}

const names = published
  .map((pkg) => pkg.name)
  .sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));
const sections = names.map((name) => {
  const changelog = join("packages", dirs.get(name) ?? "", "CHANGELOG.md");
  const entry =
    dirs.has(name) && existsSync(changelog) ? entryOf(readFileSync(changelog, "utf8")) : null;
  if (entry === null) {
    console.error(`${name}의 CHANGELOG에 ${version} 항목이 없다`);
    process.exit(1);
  }

  // 패키지 제목 아래로 한 단계씩 내린다(### → ####).
  return `## ${name}@${version}\n\n${entry.replace(/^### /gm, "#### ")}`;
});

const body = [
  `Tide ${version} 릴리스다. 세 패키지(${ORDER.map((name) => `\`${name}\``).join(", ")})는 언제나 같은 버전으로 함께 나간다. 앱에서도 같은 버전으로 설치한다.`,
  ...sections,
].join("\n\n");
writeFileSync(outPath, `${body}\n`);
console.log(version);
