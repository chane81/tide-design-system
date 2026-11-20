// `turbo run --summarize` 뒤에 돌려, 이번 run이 쓰지 않은 .turbo/cache 항목을 지운다.
// Actions cache는 복원한 것에 더해 저장하므로 지우지 않으면 오래된 결과가 계속 쌓인다.
// 전체 task를 도는 main push에서만 쓴다. --affected run에서 돌리면 건너뛴 task 캐시까지 지운다.
import { readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";

import { staleCacheFiles, usedHashes, type RunSummary } from "./turbo-cache.ts";

const cacheDir = ".turbo/cache";
const runsDir = ".turbo/runs";

const summaryFiles = (await readdir(runsDir).catch(() => [])).filter((name) =>
  name.endsWith(".json"),
);
if (summaryFiles.length === 0) {
  // summary 없이 지우면 캐시가 모두 사라진다.
  console.warn(`${runsDir}에 summary가 없어 캐시를 정리하지 않는다.`);
  process.exit(0);
}

const summaries = await Promise.all(
  summaryFiles.map(
    async (name) => JSON.parse(await readFile(join(runsDir, name), "utf8")) as RunSummary,
  ),
);
const keep = usedHashes(summaries);
const stale = staleCacheFiles(await readdir(cacheDir), keep);
await Promise.all(stale.map((name) => rm(join(cacheDir, name))));
// summary는 이번 run 것이라 캐시에 넣지 않는다.
await rm(runsDir, { recursive: true, force: true });

console.log(`turbo 캐시: task ${keep.size}개 유지, 파일 ${stale.length}개 삭제`);
