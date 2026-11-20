import { describe, expect, it } from "vitest";

import { staleCacheFiles, usedHashes } from "./turbo-cache.ts";

describe("turbo 캐시 정리", () => {
  it("summary들의 task hash를 모두 모은다", () => {
    const hashes = usedHashes([
      { tasks: [{ hash: "aa11" }, { hash: "bb22" }] },
      { tasks: [{ hash: "bb22" }, { hash: "cc33" }] },
    ]);

    expect([...hashes].sort()).toEqual(["aa11", "bb22", "cc33"]);
  });

  it("쓰지 않은 hash의 파일 세 개를 고른다", () => {
    const files = [
      "aa11.tar.zst",
      "aa11-manifest.json",
      "aa11-meta.json",
      "dd44.tar.zst",
      "dd44-manifest.json",
      "dd44-meta.json",
    ];

    expect(staleCacheFiles(files, new Set(["aa11"]))).toEqual([
      "dd44.tar.zst",
      "dd44-manifest.json",
      "dd44-meta.json",
    ]);
  });

  it("형식을 모르는 파일은 남긴다", () => {
    expect(staleCacheFiles(["README", "dd44.tar", "DD44.tar.zst"], new Set())).toEqual([]);
  });
});
