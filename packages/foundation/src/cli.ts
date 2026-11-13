#!/usr/bin/env node
// 색 계열 .ts 파일은 Node의 type stripping으로 읽는다. CSS만 stdout으로 내고 나머지 출력은 stderr로 보낸다.
import { resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import {
  checkColorFamily,
  colorFamilyCss,
  defineColorFamily,
  type ColorFamilyDefinition,
} from "./colorFamily";

const usage = "사용법: tide-color build <색 계열 파일(.ts, .js)> > <출력 CSS>";

async function loadFamilies(file: string): Promise<ColorFamilyDefinition[]> {
  const module = (await import(pathToFileURL(resolve(file)).href)) as { default?: unknown };
  const exported = module.default;
  if (exported === undefined) {
    throw new Error(
      `${file}에 default export가 없다. defineColorFamily 결과를 default로 내보낸다.`,
    );
  }
  const list = Array.isArray(exported) ? exported : [exported];
  // defineColorFamily를 거치지 않은 객체도 같은 검증을 받는다.
  const families = list.map((family) => defineColorFamily(family as ColorFamilyDefinition));
  const names = families.map((family) => family.name);
  const duplicated = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicated.length > 0)
    throw new Error(`같은 색 이름이 두 번 나온다: ${duplicated.join(", ")}`);

  return families;
}

async function build(file: string): Promise<number> {
  const families = await loadFamilies(file);
  let failed = 0;
  for (const family of families) {
    const results = checkColorFamily(family);
    const failures = results.filter((result) => !result.pass);
    failed += failures.length;
    for (const failure of failures) {
      process.stderr.write(
        `대비 미달 ${family.name} ${failure.theme}: ${failure.foreground} / ${failure.background} ` +
          `${failure.ratio.toFixed(2)}:1 < ${failure.minRatio}:1\n`,
      );
    }
    process.stderr.write(
      `${family.name}: 대비 쌍 ${results.length}개 중 ${results.length - failures.length}개 통과\n`,
    );
  }
  if (failed > 0) {
    process.stderr.write(
      "대비 기준에 못 미쳐 CSS를 만들지 않았다. 스케일을 고치거나 overrides로 슬롯 단계를 바꾼다.\n",
    );

    return 1;
  }
  const header = `/* tide-color가 ${file}에서 만들었다. 직접 고치지 않는다. Tide CSS 다음에 불러온다. */\n`;
  process.stdout.write(header + colorFamilyCss(families));

  return 0;
}

async function main(args: string[]): Promise<number> {
  const [command, file, ...rest] = args;
  if (command !== "build" || !file || rest.length > 0) {
    process.stderr.write(`${usage}\n`);

    return 2;
  }
  try {
    return await build(file);
  } catch (error) {
    process.stderr.write(`tide-color: ${error instanceof Error ? error.message : String(error)}\n`);

    return 1;
  }
}

process.exitCode = await main(process.argv.slice(2));
