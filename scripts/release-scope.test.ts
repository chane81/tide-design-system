// 릴리스 묶음 규칙(ADR 0020): Version PR 제목, 섞인 changeset, Storybook 릴리스 판단.
// releases·changesets 모양은 `changeset status --output`(@changesets/cli 3.0.3)과 같다.
import { describe, expect, it } from "vitest";

import {
  bundleVersions,
  incrementVersion,
  mixedChangesetProblems,
  shouldReleaseStorybook,
  storybookFollowChangeset,
  storybookFollowType,
  storybookTag,
  versionPrTitle,
  withStorybookFollow,
} from "./release-scope.ts";

const tds = (newVersion: string, type = "minor") => [
  { name: "@tide-tds/foundation", type, newVersion },
  { name: "@tide-tds/icons", type, newVersion },
  { name: "@tide-tds/components", type, newVersion },
];
const docs = (newVersion: string, type = "minor") => ({
  name: "@tide-tds/docs",
  type,
  newVersion,
});

describe("묶음별 다음 버전", () => {
  it("TDS만 오르면 Storybook은 null이다", () => {
    expect(bundleVersions(tds("0.6.0"))).toEqual({ tds: "0.6.0", storybook: null });
  });

  it("Storybook만 오르면 TDS는 null이다", () => {
    expect(bundleVersions([docs("0.1.0")])).toEqual({ tds: null, storybook: "0.1.0" });
  });

  it("둘 다 오르면 각자 버전을 갖는다", () => {
    expect(bundleVersions([...tds("0.6.0"), docs("0.2.0", "patch")])).toEqual({
      tds: "0.6.0",
      storybook: "0.2.0",
    });
  });

  it("type이 none인 항목은 오르지 않은 것으로 본다", () => {
    expect(bundleVersions([...tds("0.5.0", "none"), docs("0.1.0")])).toEqual({
      tds: null,
      storybook: "0.1.0",
    });
    expect(bundleVersions([...tds("0.6.0"), docs("0.0.0", "none")])).toEqual({
      tds: "0.6.0",
      storybook: null,
    });
  });

  it("TDS 패키지 버전이 서로 다르면 fixed가 깨진 것이라 오류다", () => {
    const broken = [
      { name: "@tide-tds/components", type: "minor", newVersion: "0.6.0" },
      { name: "@tide-tds/icons", type: "patch", newVersion: "0.5.1" },
    ];
    expect(() => bundleVersions(broken)).toThrow("fixed");
  });

  it("묶음에 속하지 않는 패키지는 무시한다", () => {
    expect(
      bundleVersions([{ name: "@tide-tds/smoke-next", type: "none", newVersion: "0.0.0" }]),
    ).toEqual({ tds: null, storybook: null });
  });
});

describe("Version PR 제목", () => {
  it("TDS만", () => {
    expect(versionPrTitle({ tds: "0.6.0", storybook: null })).toBe("[TDS] Release 0.6.0");
  });

  it("Storybook만", () => {
    expect(versionPrTitle({ tds: null, storybook: "0.1.0" })).toBe("[Storybook] Release 0.1.0");
  });

  it("둘 다면 TDS를 앞에 두고 가운뎃점으로 잇는다", () => {
    expect(versionPrTitle({ tds: "0.6.0", storybook: "0.2.0" })).toBe(
      "[TDS] Release 0.6.0 · [Storybook] Release 0.2.0",
    );
  });

  it("오르는 묶음이 없으면 오류다", () => {
    expect(() => versionPrTitle({ tds: null, storybook: null })).toThrow();
  });
});

describe("섞인 changeset", () => {
  it("TDS 패키지와 docs가 한 파일에 있으면 그 파일을 짚는다", () => {
    const problems = mixedChangesetProblems([
      {
        id: "mixed",
        releases: [
          { name: "@tide-tds/components", type: "patch" },
          { name: "@tide-tds/docs", type: "patch" },
        ],
      },
    ]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain(".changeset/mixed.md");
  });

  it("묶음마다 따로 쓴 파일, 한 묶음 안의 여러 패키지, empty는 통과한다", () => {
    expect(
      mixedChangesetProblems([
        { id: "tds", releases: tds("0.6.0").map(({ name, type }) => ({ name, type })) },
        { id: "docs", releases: [{ name: "@tide-tds/docs", type: "minor" }] },
        { id: "empty", releases: [] },
      ]),
    ).toEqual([]);
  });
});

describe("Storybook 릴리스 판단", () => {
  it("tag는 changesets 모노레포 형식 <name>@<version>이다", () => {
    expect(storybookTag("0.1.0")).toBe("@tide-tds/docs@0.1.0");
  });

  it("tag가 없는 버전은 릴리스한다", () => {
    expect(shouldReleaseStorybook("0.1.0", false)).toBe(true);
  });

  it("tag가 이미 있으면 릴리스하지 않는다", () => {
    expect(shouldReleaseStorybook("0.1.0", true)).toBe(false);
  });

  it("시작값 0.0.0은 tag가 없어도 릴리스하지 않는다", () => {
    expect(shouldReleaseStorybook("0.0.0", false)).toBe(false);
  });
});

describe("Storybook이 TDS 릴리스를 따라 오르기", () => {
  const tdsChangeset = (type: string) => ({
    id: `tds-${type}`,
    releases: [{ name: "@tide-tds/components", type }],
  });
  const docsChangeset = (type: string) => ({
    id: `docs-${type}`,
    releases: [{ name: "@tide-tds/docs", type }],
  });
  const empty = { id: "empty", releases: [] };
  // changeset status는 오르지 않는 docs도 type none으로 releases에 넣는다.
  const docsNone = {
    name: "@tide-tds/docs",
    type: "none",
    oldVersion: "0.1.0",
    newVersion: "0.1.0",
  };

  it("TDS patch만 있으면 patch, minor가 섞이면 가장 큰 단계(minor)를 따른다", () => {
    expect(storybookFollowType([tdsChangeset("patch")])).toBe("patch");
    expect(storybookFollowType([tdsChangeset("patch"), tdsChangeset("minor"), empty])).toBe(
      "minor",
    );
  });

  it("사람이 쓴 Storybook changeset이 있으면 따라 오르지 않는다", () => {
    expect(storybookFollowType([tdsChangeset("minor"), docsChangeset("patch")])).toBeNull();
  });

  it("TDS 릴리스가 없으면(Storybook만, empty만) 따라 오르지 않는다", () => {
    expect(storybookFollowType([docsChangeset("minor")])).toBeNull();
    expect(storybookFollowType([empty])).toBeNull();
    expect(storybookFollowType([])).toBeNull();
  });

  it("버전을 한 단계 올린다", () => {
    expect(incrementVersion("0.1.0", "patch")).toBe("0.1.1");
    expect(incrementVersion("0.1.3", "minor")).toBe("0.2.0");
    expect(incrementVersion("0.9.2", "major")).toBe("1.0.0");
    expect(() => incrementVersion("0.1.0-next.0", "patch")).toThrow();
  });

  it("status releases의 docs none 항목을 따라 오른 버전으로 바꿔 제목에 반영한다", () => {
    const releases = withStorybookFollow(
      [...tds("0.5.1", "patch"), docsNone],
      [tdsChangeset("patch")],
    );
    expect(versionPrTitle(bundleVersions(releases))).toBe(
      "[TDS] Release 0.5.1 · [Storybook] Release 0.1.1",
    );
  });

  it("따라 오르지 않으면 releases를 그대로 둔다", () => {
    const releases = [...tds("0.6.0"), { ...docsNone, type: "patch", newVersion: "0.1.1" }];
    expect(withStorybookFollow(releases, [tdsChangeset("minor"), docsChangeset("patch")])).toEqual(
      releases,
    );
  });

  it("자동 changeset은 docs 한 패키지만 담고 반영한 TDS 버전을 요약에 적는다", () => {
    const content = storybookFollowChangeset("minor", "0.6.0");
    expect(content).toMatch(/^---\n"@tide-tds\/docs": minor\n---\n/);
    expect(content).toContain("TDS 0.6.0 반영");
  });
});
