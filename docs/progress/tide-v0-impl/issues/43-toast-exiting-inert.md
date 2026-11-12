# 43: 퇴장 중 Toast에 inert

Status: done
Blocked by: 34 (Toast)

## What to build

닫히는 Toast는 퇴장 전환(fast, 150ms) 동안 DOM에 남는다. 지금은 이때 역할만 빠지고 `inert`가 없어서, 키보드와 보조기술이 닫히는 Toast 안의 버튼(액션·닫기)에 닿을 수 있다. 퇴장 중 Toast를 `inert`로 만들어 이 구간에 상호작용하지 못하게 한다. 2026-11-12 보정 일괄 검토에서 정했다(review-backlog 34절).

## 수용 기준

- [x] 퇴장 전환이 진행되는 동안 그 Toast 요소가 `inert`다. 안의 버튼에 Tab으로 닿지 않고 눌러도 동작하지 않는다.
- [x] 퇴장 중 Toast가 영역 안의 다른 Toast 포커스 이동(`useToastRegion`의 다음 Toast 찾기)을 방해하지 않는다. 닫은 뒤 포커스가 지금처럼 이동한다.
- [x] 다시 열리는 경우가 없음을 확인하거나, 있으면 `inert`를 해제한다.
- [x] 테스트: 퇴장 중 `inert` 단언, Tab 이동 단언. 전환 중 값은 `test/motion.ts` helper로 읽는다(`docs/agents/testing.md`).
- [x] changeset(components patch).

## Comments

- 2026-11-12 완료(브랜치 `ticket-43-toast-exiting-inert`, main 7366cb1 위).
  - **근거 버전**: react 19.3.1·react-dom 19.3.1, @types/react 19.3.0, react-aria 3.53.1, react-stately 3.51.0, vitest·@vitest/browser-playwright 5.1.0(Chromium). 새 의존성 없음.
  - **API 확인**:
    - `inert`: context7 `/reactjs/react.dev`에는 `inert` 항목이 없어 설치본으로 확인했다. react-dom 19.3.1 `react-dom-client.development.js`가 `inert`를 boolean 속성으로 다룬다(`true`면 속성을 붙이고 `false`면 뺀다, `""`는 false로 보고 경고). `@types/react` 19.3.0 `HTMLAttributes`에 `inert?: boolean`. 그래서 `inert={!open}`로 쓴다.
    - 다시 열리는 경우: react-stately 3.51.0 `ToastQueue`는 `visibleToasts = queue.slice(0, maxVisibleToasts)`다. 보이는 수를 넘어 새 Toast가 오면 가장 오래된 Toast가 보이는 목록에서 빠지고(닫히지 않음), 영역은 이것을 퇴장 중(`open: false`)으로 그린다. 앞의 Toast가 닫히면 같은 key로 다시 보이고 `mergeEntries`가 `open: true`로 되돌린다. 그래서 「다시 열리는 경우」가 있다. `inert`를 `open`에서 바로 정하므로 그때 풀린다.
    - 포커스 이동: react-aria 3.53.1 `useToastRegion`은 `visibleToasts`가 바뀐 commit의 layout effect에서 `[role="alertdialog"]`를 모아 옆 Toast로 포커스를 옮긴다. 퇴장 중 Toast는 역할이 없어 목록에 없다(티켓 34와 같음). 포커스가 있던 요소가 `inert`가 되면 브라우저의 focus fixup은 렌더링 단계(HTML 「update the rendering」)에서 돌므로, 같은 task 안의 layout effect가 먼저 포커스를 옮긴다. 티켓 34 판단 보류 10의 걱정(hook이 옮기기 전에 body로 빠짐)은 생기지 않았다. 기존 「키보드로 닫으면 포커스가 옆 Toast로…」 테스트가 `inert`가 붙은 채로 통과하고, 5번 반복해도 같았다.
    - overlay 모듈과의 충돌: react-aria `ariaHideOutside`(모달 Popover·Dialog의 바깥 inert)는 `[data-react-aria-top-layer]`(Toast 영역)를 보이는 노드로 넣고 그 하위를 walker에서 건너뛴다(`FILTER_REJECT`). 그래서 Toast 안 요소의 `inert`를 읽거나 되돌리지 않는다. 되돌릴 때도 자기가 숨긴 노드(`hiddenNodes`)만 건드린다. 기존 「열린 Dialog 위에 보이고 inert·aria-hidden이 아니며…」 테스트도 통과한다.
  - **구현**: `ToastItem`의 Toast 요소에 `inert={!open}` 한 줄과 파일 머리 주석. props·마크업·스타일은 그대로다.
  - **color 결정**: 해당 없음(색 prop 변경 없음).
  - **Token과 대비**: 바뀐 것 없음.
  - **테스트**: components browser Toast 52 → 56 tests(+2 × instance 2).
    - 「퇴장: 같은 조합의 절반으로…」: `captureExit`로 붙잡은 값에 `inert === true`를 더했다.
    - 「퇴장 중 Toast는 inert라 안의 버튼에 Tab·포커스가 닿지 않고, 끝나면 DOM에서 빠진다」: Toast 둘(하나는 액션 있음) 중 DOM 마지막을 닫는다. `captureExit` 안에서 그 Toast의 전환을 `pause()`해 퇴장 중인 채로 DOM에 남긴다(`useOverlayPresence`가 `animation.finished`를 기다림). 그 상태에서 안의 버튼 둘에 `focus()`해도 포커스가 옮겨지지 않고, 남은 Toast의 닫기 버튼에서 Tab을 눌러도 퇴장 중 Toast 안으로 가지 않는다. 전환을 `finish()`하면 DOM에서 빠진다.
    - 「보이는 수를 넘어 밀려난(퇴장 중) Toast가 다시 보이면 inert가 풀린다」: `maxVisible: 1`에서 둘을 띄워 하나가 밀려나는 순간(`captureExit`)에 `inert === true`를 읽고 그 자리에서 둘을 닫는다. 하나가 같은 요소로 `data-open`·`alertdialog`를 되찾고 `inert`가 빠지며 버튼이 포커스를 받는다.
    - `inert={false}`로 바꿔 돌리면 위 세 테스트가 실패하는 것을 확인했다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과(첫 실행). foundation 460, icons 18, components 1749(이전 1745), docs 292 tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 통과. flaky·「Unexpected token」은 나지 않았다.
  - **changeset**: `@tide-tds/components` patch(`.changeset/toast-exiting-inert.md`).
  - **ADR·티켓 어긋남**: 없음.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 보이는 수를 넘어 밀려난 Toast(닫히지 않음)도 티켓 34 구조상 퇴장 전환을 거쳐 DOM에서 빠지므로 같은 `inert`를 받는다. 밀려난 Toast에 포커스가 있었다면 `useToastRegion`이 옆 Toast로 옮긴다(닫힌 것과 같음). 밀려남을 퇴장으로 보이는 지금 동작은 그대로 두었다.
  - **다음 티켓 메모**: 퇴장 중 상태를 오래 붙잡아 단언하려면 `captureExit` 안에서 `element.getAnimations()`를 `pause()`하고 끝에 `finish()`한다. `useOverlayPresence`가 `finished`를 기다리므로 그동안 DOM에 남는다.
