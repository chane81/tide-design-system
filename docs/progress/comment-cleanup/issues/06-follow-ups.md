# 06: 주석 정리 후속 — 문서로 옮길 내용과 예시 정리

Status: ready-for-agent
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

- [ ] 위 1~4가 문서에 반영됐고, 각 티켓 Comments의 보류 항목에 "06에서 반영" 표시를 남겼다.
- [ ] `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`가 통과한다.
- [ ] changeset: 저장소 검사가 요구하는 대로(문서 앱만 바뀌면 empty).
