# 03: 문서 앱 섹션·블록 재배치

Status: done
Blocked by: 없음 (바로 시작 가능)

## What to build

`apps/docs/src/`의 사이드바 섹션 폴더를 `stories/<section>/` 아래로 모으고, `docs-blocks/`를 규칙의 네 폴더로 나눈다(규칙 1). 사이드바 순서·제목·URL은 바뀌지 않아야 한다(MDX·stories가 `title`을 직접 적는다).

## 할 일

- `getting-started`·`principles`·`standards`·`foundations`·`components`(섹션) → `src/stories/<section>/`.
- `docs-blocks/*.tsx` → `src/components/`. 한 블록만 쓰는 lib은 그 블록 폴더(`components/<Block>/libs/`)로, 여러 곳이 쓰는 lib은 `src/libs/`로(`colorTiles.ts`는 ColorScale과 Color stories가 함께 쓴다).
- `*.test.ts`는 대상 파일 옆에 둔다. `vitest.config.ts` `include`가 새 위치를 잡는지 확인한다.
- `.storybook/main.ts`의 `stories` glob이 새 위치를 잡는지 확인한다.
- `RepoMarkdown`처럼 저장소 경로를 문자열로 받는 곳은 저장소 문서 경로라 바뀌지 않는다. MDX 안 상대 import만 고친다.

## 수용 기준

- [ ] `pnpm --filter @tide-design/docs build` 결과의 사이드바 항목·URL이 이전과 같다(`storybook-static/index.json`의 entry id 목록 비교).
- [ ] `src/` 바로 아래에 `stories`, `components`, `libs`(필요하면 `hooks`·`constants`) 외 폴더가 없다.
- [ ] 공통 수용 기준(README)을 통과한다.
- [ ] changeset: docs 앱은 배포 패키지가 아니므로 규칙대로(필요하면 empty).
