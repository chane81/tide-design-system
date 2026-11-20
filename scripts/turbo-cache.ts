// turbo 로컬 캐시(.turbo/cache)에서 이번 run이 쓰지 않은 항목을 고르는 순수 함수.
// 파일을 읽고 지우는 일은 prune-turbo-cache.ts가 한다.

// turbo 2.11.10은 hash마다 `<hash>.tar.zst`, `<hash>-manifest.json`, `<hash>-meta.json`을 둔다.
const CACHE_FILE = /^([0-9a-f]+)(?:\.tar\.zst|-manifest\.json|-meta\.json)$/;

/** `turbo run --summarize` JSON에서 쓰는 부분(turbo 2.11.10). */
export type RunSummary = { tasks: ReadonlyArray<{ hash: string }> };

/** summary들에 나온 task hash 전체. */
export function usedHashes(summaries: readonly RunSummary[]): Set<string> {
  return new Set(summaries.flatMap((summary) => summary.tasks.map((task) => task.hash)));
}

/** 지울 캐시 파일 이름. 형식을 모르는 파일은 남긴다. */
export function staleCacheFiles(fileNames: readonly string[], keep: ReadonlySet<string>): string[] {
  return fileNames.filter((name) => {
    const hash = CACHE_FILE.exec(name)?.[1];

    return hash !== undefined && !keep.has(hash);
  });
}
