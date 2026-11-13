# 06: 주석 정리 후속 — 문서로 옮길 내용과 예시 정리

Status: done
Blocked by: 없음 (01~05 완료)

## What to build

주석 정리 01~05에서 "코드 주석에서는 빼야 하지만 기록은 남겨야 한다"고 보류한 내용을 알맞은 문서로 옮긴다. 근거 원문은 각 티켓의 `## Comments`에 있다.

## 할 일

1. **MDX에 추가 (티켓 02 Comments):** 앱 개발자가 알아야 하는데 JSDoc에서 빠진 설명 3건을 해당 Component 문서(`apps/docs/src/stories/components/*.mdx`)에 넣는다. [문서 작성 기준](../../../standards/docs-writing.md)을 따른다.
   - Switch: `invalid`일 때 꺼진 track 경계가 danger 색이 되고, Field 안에서는 prop이 Field 값보다 우선한다.
   - CheckboxGroup: 선택 값은 각 Checkbox가 갖고, 묶음은 값을 모으지 않는다.
   - Badge: 한 줄로만 쓴다(줄바꿈하면 모양이 깨진다).
2. **`docs/agents/testing.md`에 추가 (티켓 03·05 Comments):**
   - vitest worker 수별 CPU 실측 수치(지금은 결론만 있다).
   - `test/browser-setup.ts`의 마우스 이동 hook이 vitest-browser-react cleanup보다 먼저 돈다는 순서와 그 영향. 옮긴 뒤 코드 주석은 문서를 가리키는 1줄로 줄인다.
3. **릴리스·배포 근거 기록 (티켓 04·05 Comments):** 아래 3건을 기존 문서(관련 ADR 0008·0020·0021의 정정 절, `CONTRIBUTING.md`의 릴리스 절, `docs/research/` 중 알맞은 곳)에 적는다. 새 결정이 아니라 구현 세부이므로 새 ADR은 만들지 않는 것이 기본이다.
   - `release.yml`: `actions/create-github-app-token` v3.3.0은 `client-id`를 받고(`app-id`는 deprecated), job이 끝나면 token을 폐기한다.
   - `release.yml`: changesets/action이 `GITHUB_TOKEN`으로 PR 링크를 찾고, 열린 Version PR의 제목을 새 값으로 바꾼다.
   - `apps/docs/Dockerfile`: Dokploy가 main을 받아 빌드한다. 리서치 문서에만 있으면 결정 기록에도 한 줄 남기고, Dockerfile 주석은 1줄로 둔다.
   - 외부 서비스 동작은 공식 문서·설치 버전으로 다시 확인하고 근거 버전을 적는다.
4. **stories 예시 (티켓 04 Comments):** `Icons.stories.tsx`·`Spinner.stories.tsx`에서 Button이 없던 시절의 대체 예시를 찾아, 지금 있는 `Button`·`IconButton`으로 바꾸는 게 문서에 더 맞는지 판단한다. 바꾸면 사이드바 항목·story id는 그대로 둔다.

## 수용 기준

- [x] 위 1~4가 문서에 반영됐고, 각 티켓 Comments의 보류 항목에 "06에서 반영" 표시를 남겼다.
- [x] `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`가 통과한다.
- [x] changeset: 저장소 검사가 요구하는 대로(문서 앱만 바뀌면 empty).

## Comments

- 2026-11-14 완료. 반영 위치:
  1. MDX: `Switch.mdx` 「설명과 오류 붙이기」, `Checkbox.mdx` 「묶어서 이름 붙이기」, `Badge.mdx` 「크기 바꾸기」. 사실은 소스로 확인했다(`useFieldControl`의 `props.invalid ?? field?.invalid`, Switch class `aria-invalid:border-danger`, Badge `h-5`·`h-6` + `whitespace-nowrap`).
  2. `docs/agents/testing.md`: 「로컬 동시 실행 수」에 실측 표, 「마우스 잔류」에 hook 순서. 순서는 vitest-browser-react 2.3.0 `dist/index.js`가 import 때 cleanup `beforeEach`를 거는 것으로 확인했다(setup 파일 hook이 먼저 등록된다). `browser-setup.ts` 주석은 문서를 가리키는 1줄만 남겼다.
  3. 릴리스·배포: create-github-app-token은 `docs/research/bot-pr-workflow-approval.md` 「보충 (2026-11-14)」, changesets/action 제목 갱신·`GITHUB_TOKEN`과 Dokploy 빌드 대상은 ADR 0020 「보충 (2026-11-14)」, `CONTRIBUTING.md` 「릴리스 흐름」 4번에 한 문장. 새 ADR은 만들지 않았다. Dokploy가 main HEAD를 빌드한다는 말은 이미 ADR 0020 본문(문서 배포 시점)에 있어, 보충에는 앱 설정과 외부 문서 근거만 더했다. Dockerfile 주석은 1줄 그대로 두고 `(ADR 0020)`만 붙였다.
- 확인한 외부 근거:
  - `actions/create-github-app-token`: `@v3`가 v3.3.0과 같은 커밋. v3.3.0 tag의 `action.yml`(`client-id`, `app-id`의 `deprecationMessage`, `skip-token-revoke` 기본 `false`, `token` output, `post` step)과 README 「How it works」.
  - changesets/action: `@v2`가 v2.1.2와 같은 커밋. v2.1.2 `src/run.ts` `runVersion`(`GITHUB_TOKEN` 환경 변수, 열린 PR이면 GraphQL `updatePullRequest`), `version/action.yml`.
  - `@changesets/get-github-info` 1.0.1(설치본, changelog-github 1.0.1이 씀): `GITHUB_TOKEN` 환경 변수를 읽는다.
  - Dokploy: context7 `/websites/dokploy`(docs.dokploy.com 「GitHub」 「Build Type」). 앱에 고른 브랜치를 배포하고 Dockerfile 경로·context로 빌드한다. 문서에 버전 표기가 없어 운영 버전(v0.31.1, tide-v0-impl 티켓 44)과 맞는지는 확인 불가.
- 판단(할 일 4): 바꿨다. Spinner 「버튼 안에서」는 직접 만든 버튼에 Spinner를 넣는 모양이었는데, 지금 앱이 로딩 버튼을 만드는 길은 `<Button loading>`이다(Button이 Spinner를 넣고 숨김 텍스트를 붙인다). 문서 예시가 권장 사용법과 어긋나 바꾸고, MDX 문장에 직접 넣는 경우의 `aria-hidden` 규칙을 남겼다. 아이콘 페이지의 「장식용 아이콘」·「아이콘만 있는 버튼」도 인라인 style 네이티브 버튼 대신 `Button startIcon`·`IconButton`으로 바꿨다. MDX가 이미 「IconButton은 `aria-label`이 필수」라고 안내해 예시와 문장이 맞는다. story export 이름·`name`·`title`은 그대로이고, docs 빌드 `storybook-static/index.json`의 entry id 322개가 origin/main과 같다.
- changeset: `@tide-design/docs` patch(문서 내용 추가·예시 수정, CONTRIBUTING 「버전 규칙 (Storybook)」의 patch), `packages/components` 테스트 setup 주석은 empty.
- 검증: `pnpm build`, `typecheck`, `test`, `lint`, `format:check`, `test:scripts`, `node scripts/check-changesets.ts origin/main` 통과.
