# 04: 문서 앱 주석 정리

Status: done
Blocked by: 코드 스타일 02 ([code-style/issues/02](../../code-style/issues/02-extensionless-imports.md))

## What to build

`apps/docs`(`src`, `.storybook`, 설정 파일)의 주석을 [주석 규칙](../../../../.claude/rules/code-comments.md)대로 정리한다. 코드는 바꾸지 않는다.

## 할 일

- `.storybook/main.ts`의 Vite·Storybook 우회 설명은 버전과 이유만 1~2줄로 남긴다.
- stories의 `parameters.docs.description` 등 문서 문자열은 주석이 아니므로 이 티켓 범위가 아니다.

## 수용 기준

- [x] 범위 안 주석이 규칙의 「남긴다」에 해당하는 것만 1~2줄로 남았다.
- [x] 정리 전후 주석 줄 수를 티켓 Comments에 적었다.
- [x] 공통 수용 기준(README)을 통과한다.

## Comments

- 주석 줄 수(범위: `apps/docs`의 `.storybook`, `src`의 `.ts`·`.tsx`, `vitest.config.ts`, `preview.css`, `Dockerfile`, `nginx.conf`. MDX 제외): 정리 전 715줄 → 정리 후 498줄. 남은 줄 대부분은 story export 위 한 줄 JSDoc(`/** 기본: … */`)이다. Storybook이 이것을 Docs 페이지의 story 설명으로 그리므로 문서 문자열로 보고 손대지 않았다.
- 판단: stories 38개 파일의 머리 주석(「X 문서의 예시. 모든 예시는 story로 두고…, 동작 단언은 `X.test.tsx`에 있다」)은 spec과 티켓에 있는 규칙을 되풀이해 지웠다. play로 portal·focus-ring 상태를 여는 이유(문서에서는 닫혀 있음, inert라 defaultOpen 금지, React Aria 키보드 조건)만 1~2줄로 남겼다.
- 판단: `subcomponents` 위 「부분 Component의 props 표도 함께 보여 준다」(10곳)는 코드를 풀어 쓴 주석이라 지웠다. react-docgen이 별칭을 풀지 못한다는 `argTypes` 주석은 남겼다.
- 판단: `.storybook/main.ts` 머리의 설정 설명 블록은 각 설정 바로 위 한 줄로 나눴다(MDX 3 GFM, Vite 8 조건 대체, optimizeDeps, "use client" 경고). 확인 경로(설치본·docs 이름)는 지웠다.
- 판단: `nginx.conf`·`Dockerfile`의 캐시·상속 설명은 tide-v0-impl 티켓 44에 있어 결론 두 줄만 남겼다.
- 판단: 예시용 네이티브 버튼(`Icons.stories.tsx`, `Spinner.stories.tsx`)의 「Button Component(티켓 13) 전이라」는 작업 이력이라 지웠다. 지금은 Button이 있으니 예시를 Button으로 바꿀지는 따로 볼 일이다(코드 변경이라 이 티켓 범위 밖). **06에서 반영**(Spinner `InButton`은 `<Button loading>`, Icons `Decorative`·`IconOnlyButton`은 `Button`·`IconButton`으로 바꿈. 판단은 06 Comments).
- 보류(결정 근거인데 ADR·티켓에 없음, 1건): `Dockerfile` 머리의 「Dokploy가 main을 받아 이 파일로 빌드한다」. 배포 방식이 리서치 문서(`docs/research/changesets-split-version-prs.md`)에만 있다. 주석에 남겨 두었다. 배포 문서나 ADR로 옮길지 정해야 한다. **06에서 반영**(ADR 0020 「보충 (2026-11-14)」, `CONTRIBUTING.md` 「릴리스 흐름」 4번. Dockerfile 주석은 1줄에 `(ADR 0020)`을 붙임).
- 검증: 바뀐 파일마다 주석·빈 줄을 뺀 코드 줄을 origin/main과 비교해 차이 0. `pnpm build`, `typecheck`, `test`, `lint`, `format:check` 통과.
