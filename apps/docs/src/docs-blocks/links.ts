// 저장소 `.md` 원문의 상대 링크를 Storybook에서 동작하는 주소로 바꾼다.
// 원문은 GitHub에서 읽어도 맞는 상대 링크를 쓰므로, 원문은 고치지 않고 불러올 때만 바꾼다.

/** 저장소 파일을 GitHub에서 여는 주소의 앞부분. 문서 사이트는 main과 같은 내용을 설명한다. */
export const REPO_URL = "https://github.com/chane81/tide-design-system";

/**
 * Storybook 문서 페이지로 실은 저장소 문서와 그 docs id(`?path=/docs/<id>`).
 * 여기 없는 파일은 GitHub로 연결한다. 원문을 새로 실으면 이 표에도 넣는다.
 */
export const STORYBOOK_DOCS: Readonly<Record<string, string>> = {
  "docs/principles/README.md": "원칙-tide-원칙--docs",
  "docs/standards/accessibility.md": "기준-접근성--docs",
  // 기준 폴더 링크(`../standards/`)는 기준 목록 대신 첫 기준 페이지로 보낸다. 지금은 기준이 접근성 하나다.
  "docs/standards/": "기준-접근성--docs",
};

const SCHEME = /^[a-z][a-z\d+.-]*:/i;

/** `from` 파일 기준의 상대 경로 `href`를 저장소 루트 기준 경로로 바꾼다. 끝의 `/`는 유지한다. */
export function resolveRepoPath(from: string, href: string): string {
  const segments = from.split("/").slice(0, -1);
  for (const part of href.split("/")) {
    if (part === "..") {
      if (segments.length === 0) {
        throw new Error(`저장소 밖을 가리키는 링크: ${href} (${from})`);
      }
      segments.pop();
    } else if (part !== "." && part !== "") {
      segments.push(part);
    }
  }
  const joined = segments.join("/");
  return href.endsWith("/") ? `${joined}/` : joined;
}

/**
 * 링크 하나를 바꾼다.
 * - 외부 주소(`https:` 등), 페이지 안 앵커(`#...`), 이미 Storybook 경로인 것(`?path=`)은 그대로 둔다.
 * - Storybook에 실은 문서는 `?path=/docs/<id>`로, 나머지 저장소 파일은 GitHub 주소로 바꾼다.
 */
export function toStorybookHref(from: string, href: string): string {
  if (SCHEME.test(href) || href.startsWith("#") || href.startsWith("?")) {
    return href;
  }
  const hashIndex = href.indexOf("#");
  const pathPart = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex);
  const repoPath = resolveRepoPath(from, pathPart);

  const docsId = STORYBOOK_DOCS[repoPath];
  if (docsId !== undefined) {
    return `?path=/docs/${docsId}${hash}`;
  }
  const kind = repoPath.endsWith("/") ? "tree" : "blob";
  return `${REPO_URL}/${kind}/main/${repoPath}${hash}`;
}

// 인라인 링크 `[글](주소)`와 `[글](주소 "제목")`. 원문은 참조형 링크를 쓰지 않는다.
const INLINE_LINK = /\]\(([^)\s]+)((?:\s+"[^"]*")?)\)/g;

/** 원문 전체의 인라인 링크를 바꾼다. `from`은 원문의 저장소 루트 기준 경로다. */
export function rewriteRepoLinks(markdown: string, from: string): string {
  return markdown.replace(
    INLINE_LINK,
    (_match, href: string, title: string) => `](${toStorybookHref(from, href)}${title})`,
  );
}

/**
 * GitHub와 같은 규칙으로 제목 id를 만든다. 원문의 앵커 링크(`#-접근성이-...`)가 Storybook에서도 맞게 한다.
 * 소문자로 바꾸고, 글자·숫자(Nd)·결합 문자·`_`·`-`·공백만 남긴 뒤 공백을 `-`로 바꾼다(앞뒤 공백도 `-`가 된다).
 */
export function githubSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{Nd}\p{Pc} -]/gu, "")
    .replace(/ /g, "-");
}
