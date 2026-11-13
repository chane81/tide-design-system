import { readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

export const packageDir: string = fileURLToPath(new URL("../", import.meta.url));

/** 이름표 파일. `Tide 이름 → 원본 SVG 이름`이고, Tide 이름의 정본이다. */
export const namesFile: string = join(packageDir, "icon-names.json");

/** 설치된 업스트림 패키지 폴더. package.json에 exports가 없어 경로로 찾는다. */
export const upstreamDir: string = dirname(require.resolve("lucide-static/package.json"));

/** 원본 SVG 폴더. 정식 이름과 alias 이름의 SVG가 함께 있다. */
export const svgDir: string = join(upstreamDir, "icons");

export async function svgNames(): Promise<string[]> {
  return (await readdir(svgDir))
    .filter((file) => file.endsWith(".svg"))
    .map((file) => file.slice(0, -".svg".length))
    .sort();
}

/** `arrow-down-0-1` → `ArrowDown01Icon`. 처음 이름표를 채울 때만 쓴다. 그 뒤로는 이름표가 정본이다. */
export function toTideName(svgName: string): string {
  const pascal = svgName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return `${pascal}Icon`;
}
