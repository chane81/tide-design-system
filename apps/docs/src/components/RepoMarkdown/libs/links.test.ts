import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { githubSlug, rewriteRepoLinks, STORYBOOK_DOCS, toStorybookHref } from "./links.ts";

const repoRoot = join(import.meta.dirname, "../../../../../..");

describe("toStorybookHref", () => {
  test("Storybook에 실은 문서는 docs 경로로 바꾸고 앵커를 유지한다", () => {
    expect(
      toStorybookHref("docs/standards/accessibility.md", "../principles/README.md#-원칙"),
    ).toBe("?path=/docs/원칙-tide-원칙--docs#-원칙");
    expect(toStorybookHref("docs/principles/README.md", "../standards/accessibility.md")).toBe(
      "?path=/docs/기준-접근성--docs",
    );
  });

  test("Storybook에 없는 저장소 파일은 GitHub 주소로 바꾼다(폴더는 tree)", () => {
    expect(toStorybookHref("docs/principles/README.md", "../../GLOSSARY.md")).toBe(
      "https://github.com/chane81/tide-design-system/blob/main/GLOSSARY.md",
    );
    expect(toStorybookHref("docs/principles/README.md", "../decisions/")).toBe(
      "https://github.com/chane81/tide-design-system/tree/main/docs/decisions/",
    );
  });

  test("외부 주소, 페이지 안 앵커, Storybook 경로는 그대로 둔다", () => {
    for (const href of ["https://www.w3.org/TR/WCAG22/", "#충돌할-때", "?path=/docs/x--docs"]) {
      expect(toStorybookHref("docs/principles/README.md", href)).toBe(href);
    }
  });

  test("저장소 밖을 가리키면 실패한다", () => {
    expect(() => toStorybookHref("docs/principles/README.md", "../../../x.md")).toThrow();
  });
});

describe("githubSlug", () => {
  test("GitHub과 같은 id를 만든다(원문의 앵커 링크와 일치)", () => {
    expect(githubSlug("① 접근성이 미려함보다 우선한다 · Accessible over beautiful")).toBe(
      "-접근성이-미려함보다-우선한다--accessible-over-beautiful",
    );
    expect(githubSlug("충돌할 때")).toBe("충돌할-때");
  });
});

// 원문에 새 상대 링크가 생겨도 Storybook에서 깨지지 않는지 실제 파일로 확인한다.
describe.each(Object.keys(STORYBOOK_DOCS).filter((path) => path.endsWith(".md")))("%s", (path) => {
  test("바꾼 뒤에는 상대 링크가 남지 않는다", async () => {
    const source = await readFile(join(repoRoot, path), "utf8");
    const hrefs = [...rewriteRepoLinks(source, path).matchAll(/\]\(([^)\s]+)/g)].map(
      (match) => match[1],
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toMatch(/^(https:\/\/|\?path=\/docs\/|#)/);
    }
  });

  test("GitHub 주소로 바꾼 저장소 파일이 실제로 있다", async () => {
    const source = await readFile(join(repoRoot, path), "utf8");
    const prefix = /^https:\/\/github\.com\/chane81\/tide-design-system\/(?:blob|tree)\/main\//;
    const repoPaths = [...rewriteRepoLinks(source, path).matchAll(/\]\(([^)\s#]+)/g)]
      .map((match) => match[1] ?? "")
      .filter((href) => prefix.test(href))
      .map((href) => href.replace(prefix, ""));
    for (const repoPath of repoPaths) {
      // stat은 파일과 폴더 모두 확인한다. 없으면 ENOENT로 실패한다.
      await expect(stat(join(repoRoot, repoPath))).resolves.toBeDefined();
    }
  });
});
