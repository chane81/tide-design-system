import { CodeOrSourceMdx, HeadersMdx, Markdown } from "@storybook/addon-docs/blocks";
import type { ReactElement } from "react";

import { DocsAnchor } from "./DocsAnchor.tsx";
import { githubSlug, REPO_URL, rewriteRepoLinks } from "./links.ts";

export interface RepoMarkdownProps {
  /** 원문 문자열. MDX에서 `?raw`로 import한 값이다. */
  source: string;
  /** 원문의 저장소 루트 기준 경로(예: `docs/principles/README.md`). 상대 링크를 풀 때 쓴다. */
  path: string;
}

/**
 * 저장소의 `.md` 원문을 Storybook `Markdown` 블록으로 그린다(@storybook/addon-docs 10.6.6).
 * 상대 링크는 Storybook 경로나 GitHub 주소로 바꾸고, 제목 id는 GitHub와 같게 만든다.
 */
export function RepoMarkdown({ source, path }: RepoMarkdownProps): ReactElement {
  return (
    <>
      <Markdown
        options={{
          // Markdown 블록은 options.overrides를 통째로 덮어쓰므로 기본 override(code, 제목, a)를 함께 넣는다.
          overrides: { code: CodeOrSourceMdx, ...HeadersMdx, a: DocsAnchor },
          slugify: githubSlug,
        }}
      >
        {rewriteRepoLinks(source, path)}
      </Markdown>
      <p>
        <small>
          이 페이지는 저장소의{" "}
          <DocsAnchor href={`${REPO_URL}/blob/main/${path}`} target="_blank">
            <code>{path}</code>
          </DocsAnchor>{" "}
          원문을 그대로 보여 줍니다.
        </small>
      </p>
    </>
  );
}
