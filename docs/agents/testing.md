# 테스트 작성 규칙 (browser 테스트)

에이전트와 사람 모두 따른다. 지금까지 flaky 테스트를 고치며 정한 규칙이다(근거는 각 티켓 Comments).

- **마우스 잔류**: 공통 `beforeEach`(`packages/components/test/browser-setup.ts`)가 `commands.mouseLeavePage`로 마우스를 페이지 밖으로 뺀다. 앞 테스트의 마우스가 남아 hover 오버레이가 열리던 문제 대응이다(티켓 26).
- **키 입력 나누기**: 글자와 탐색 키를 한 `userEvent.keyboard()`로 붙여 보내지 않는다. 상태 변화(목록 열림·거르기 결과 등)를 확인한 뒤 다음 키를 보낸다(티켓 29).
- **전환 중 값 읽기**: 닫기·열기 직후 `getComputedStyle`이나 `getAnimations()`를 동기로 읽지 않는다. 부하가 크면 그 사이에 전환이 끝나고 요소가 DOM에서 빠질 수 있다. `test/motion.ts`의 `captureWhen`·`captureExit`를 동작 **전에** 걸어 두고, 결과를 `await`한다. 이 helper는 MutationObserver microtask로 값을 붙잡는다. 퇴장 중에 다시 여는 경우는 `openControl`(`flushSync`)로 한 task 안에서 처리한다(티켓 29 Comments).
- **가짜 타이머와 locator 명령**: `vi.useFakeTimers`를 켠 상태에서 locator 명령(`userEvent.hover`·`click` 등)을 쓰면, vitest 5.1.0 browser가 명령 동안 실제 50ms마다 `vi.advanceTimersByTime(50)`을 부른다. 그래서 가짜 시계도 명령이 실제로 걸린 시간만큼 흐른다. 시간 경계 단언은 명령 소요 시간에 기대지 말고, 이벤트 순간(`pointerenter` 등)의 가짜 시각을 기록해 계산한다. 대상 타이머보다 넉넉히 긴 시간을 쓴다(티켓 34 Comments).
- **changeset**: `packages/*` 안의 테스트만 바꿔도 changeset 검사가 걸린다. 릴리스가 필요 없으면 empty changeset을 쓴다.
- **로컬 동시 실행 수**: 로컬에서는 vitest worker 수를 CPU의 20%로 줄인다(루트 `vitest.workers.ts`). `pnpm test`가 components·docs 브라우저 테스트를 함께 돌려도 CPU 약 60%에 머물게 실측한 값이다. CI(`CI=true`)는 제한하지 않는다. 잠깐 바꾸려면 `TIDE_TEST_WORKERS=1 pnpm test`처럼 덮어쓴다(turbo가 이 변수를 task에 넘긴다).
