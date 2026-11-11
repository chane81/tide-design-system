# 34: Toast

Status: done
Blocked by: 25 (Popover), 26 (Tooltip), 27 (Menu), 28 (Select), 29 (Combobox), 30 (Dialog와 AlertDialog), 31 (Tabs), 32 (Accordion), 33 (Tag)

> 단계 경계: 4단계(25~33)가 끝난 뒤 사람이 Version PR을 머지해 0.4.0을 낸 다음에 시작한다(별도 티켓 없음).

## What to build

앱 개발자가 `Toast`로 알림을 띄운다. 영역(region), 큐, 자동 닫힘, 포커스 이동이 처리된다. 사용자는 자동으로 닫히는 Toast를 5초 이상 보고, hover나 focus 중에는 멈춘다. 액션이나 오류가 담긴 Toast는 자동으로 닫히지 않는다. 마지막 Component다.

## 수용 기준

- [x] `useToast`로 만든다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [x] 기본 위치는 아래 오른쪽이고 폭을 제한한다. `z-toast`로 쌓는다.
- [x] 자동 닫힘은 5초 이상이고 hover·focus 중에는 멈춘다. 액션이나 오류가 있으면 자동으로 닫지 않는다(WCAG 2.2.1, 2.2.2).
- [x] Alert 스타일과 IconButton(닫기)을 재사용한다. raised 표면, `shadow-md`, radius `lg`.
- [x] 등장·퇴장 motion은 Popover와 같다(opacity + blur + translate). reduced-motion에서는 opacity만.
- [x] `browser`: region 랜드마크, 알림 읽기, 큐, 자동 닫힘 시간과 hover/focus 정지, 액션·오류 Toast 유지, 닫기와 포커스 이동, reduced-motion 계산값을 단언한다.

### 공통 API 규칙

- [x] `ref`는 일반 prop으로 받아 루트 DOM 요소에 연결한다(`forwardRef` 없음).
- [x] props는 루트 DOM 요소의 props를 확장하고 겹치는 HTML 속성은 `Omit`한다. `XxxProps` 타입을 루트에서 export한다.
- [x] prop 이름은 DOM 이름을 쓰고, React Aria 이름(`isDisabled`, `onPress` 등)은 드러내지 않는다.
- [x] 사용자 `className`은 `cn`의 마지막에 넣어 충돌 시 이긴다.
- [x] 상태는 네이티브 pseudo-class가 있으면 그것을, 없으면 boolean `data-*` 속성으로 노출한다.
- [x] `"use client"`는 hook·state·이벤트를 쓰는 파일에만 붙인다.
- [x] Semantic Token만 쓰고, 지원하지 않는 `variant`·`size` 값은 타입 오류가 된다.
- [x] 세부 props(값, 기본값, padding)는 공통 규칙 안에서 정하고 props 표로 확정한다.
- [x] changeset을 포함한다.

### Component 완료 기준 (spec Testing Decisions)

- [x] `*.test.tsx`에 동작 단언이 있다(`browser` project).
- [x] 모든 예시가 story로 있고 a11y 검사를 통과한다(`storybook` project).
- [x] 포커스 표시, forced-colors, reduced-motion 계산값을 단언한다(해당하는 경우).
- [x] MDX 문서가 고정된 섹션 순서(설명 → 사용 시점/쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 표)를 따른다.
- [x] 쓰는 Token이 대비 쌍에 등록되어 있다(`unit` project).
- [x] smoke 앱에서 import해 빌드가 통과한다(`smoke`).

## Comments

- 2026-11-11 완료(브랜치 `ticket-34-toast`, main 0f57f28 위).
  - **근거 버전**: react-aria 3.53.1, react-stately 3.51.0(이미 components 의존성, 새 의존성 없음, `minimumReleaseAge` 그대로), react 19.3.1, tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0(Chromium), storybook 10.6.6, typescript 7.0.2.
  - **API 확인**: context7 `/websites/react-aria_adobe`(Toast·useToast: `useToastRegion(props, state, ref)` → `regionProps`, `useToast(props, state, ref)` → `toastProps`·`contentProps`·`titleProps`·`descriptionProps`·`closeButtonProps`, `useToastQueue(queue)`, `ToastQueue`(`add`·`close`·`pauseAll`·`resumeAll`·`clear`), 「minimum timeout of 5 seconds」, F6 랜드마크, 닫히면 다음 Toast·마지막이면 이전 위치로 포커스)와 설치본 dist 소스로 확인했다. `useToast`: `role="alertdialog"`·`aria-modal="false"`·`tabIndex=0`·`aria-labelledby`(제목)·`aria-describedby`(본문, `useSlotId`라 본문이 없으면 빠짐), `contentProps`는 `role="alert"`·`aria-atomic`(첫 layout 전 `aria-hidden`, NVDA 대응), 마운트 때 `timer.reset(timeout)`·언마운트 때 `pause`. `useToastRegion`: `useLandmark`(region, 이름 기본 ko-KR 「N개 알림.」), hover·focus within 동안 `pauseAll`, 포커스가 있던 Toast가 빠지면 `[role="alertdialog"]` 순서로 옆 Toast(포인터 modality면 들어오기 전 요소), 0개가 되면 들어오기 전 요소로 복귀, `data-react-aria-top-layer`. react-stately `ToastQueue`: `add`는 `unshift`(새것이 앞), `visibleToasts = queue.slice(0, maxVisibleToasts)`(클래스 기본 Infinity), 닫힌 Toast는 바로 빠짐, `Timer`는 setTimeout + Date.now로 남은 시간 계산. `clear`는 `onClose`를 부르지 않는다. 둘 다 루트 entry(`react-aria`, `react-stately`)에 있다.
  - **export 이름**: `ToastQueue`(클래스), `ToastRegion`, 타입 `ToastRegionProps`·`ToastOptions`·`ToastAction`·`ToastQueueOptions`.
  - **구현 결정**:
    - **API 모양(큐 + 영역)**: React Aria와 같이 큐를 React 밖에 두고(`new ToastQueue()`) 영역에 넘긴다. 어디서든 `queue.add`로 띄울 수 있고 Provider·context가 필요 없다. `Toast` 단일 Component는 두지 않았다(Toast는 영역이 그린다). react-stately 큐를 감싼 Tide 클래스라 자동 닫힘 규칙을 한 곳(`add`)에서 강제하고 React Aria 이름(`maxVisibleToasts`)을 드러내지 않는다. 안쪽 큐는 모듈 `WeakMap`으로만 꺼낸다.
    - **자동 닫힘 규칙(`add`에서 정함)**: 기본 5000ms, 더 짧은 값은 5000ms로 올림, `null`·`Infinity`·`NaN`은 자동 닫힘 없음(`setTimeout(Infinity)`는 바로 끝나므로), 액션이 있거나 `color="danger"`면 `timeout`과 관계없이 없음. hover·focus 정지는 `useToastRegion`이 영역 단위로 한다.
    - **client 전용**: 큐도 hook(`useToastQueue`)과 같은 파일에 두어 `Toast.tsx` 전체가 `"use client"`다. 서버 컴포넌트는 큐 인스턴스를 client에 넘길 수 없으므로 앱은 큐와 영역을 client 모듈에 둔다(문서·smoke `toasts.tsx`).
    - **퇴장 motion**: react-stately 큐가 닫힌 Toast를 바로 빼므로, 영역이 빠진 Toast를 원래 자리에 `open: false`로 남기고 각 Toast의 `useOverlayPresence`가 퇴장 전환이 끝나면 뺀다(렌더 중 상태 맞추기). 퇴장 중 Toast에는 `toastProps`·`contentProps`를 펼치지 않는다. 펼치면 `useToastRegion`의 `[role="alertdialog"]` 순서와 큐 순서가 어긋나 포커스가 엉뚱한 Toast로 간다.
    - **portal·포커스**: `OverlayPortal`(`focusManagement={false}`)로 body에 portal한다. 포커스 이동은 React Aria hook이 하므로 FocusScope를 두지 않는다. Toast가 없으면 영역을 그리지 않는다(빈 랜드마크 방지, RAC와 같음).
    - **배치·스타일**: Alert 배치(`alertLayoutClass` 등, 아이콘 20px·제목 14/600·본문 14/400·여백 16px)에 `overlaySurfaceClass`(raised + `shadow-md` + radius `lg` + `border-raised`)를 얹었다. 글자는 `text-default`, 상태 아이콘만 `text-accent`(역할 색). 액션은 내용 칸 아래 Button outline `sm`(같은 Role), 닫기는 Alert와 같은 IconButton ghost `xs`(같은 Role, 기본 「닫기」). Toast·영역 포커스는 `focus-visible:focus-ring`.
    - **위치**: 영역 `fixed end-4 bottom-4`(논리 속성, RTL이면 왼쪽), 폭 `w-[calc(100%-2rem)] max-w-96`(24rem), `flex-col-reverse gap-2`로 새 Toast가 아래(모서리 쪽)에 오고 DOM·Tab 순서는 새것부터. `isolate z-toast`.
    - **motion**: `popoverMotionClass` 그대로에 `data-placement="top"`(4px 아래에서 blur 4px·opacity 0으로 떠오름, 퇴장은 2px·blur 2px, reduced-motion은 opacity만).
    - **닫기 이름**: React Aria `closeButtonProps`의 번역(「닫기」/「Close」) 대신 Alert·Dialog와 같은 `closeLabel` 기본 「닫기」. `onPress`형 props는 쓰지 않고 `onClick`으로 `state.close`를 부른다(티켓 33 메모).
  - **color 결정(ADR 0016 덧붙임)**: 행동·의미 Component라 `Role`(앱 Role 포함, 기본 `info`, Alert와 같음), Toast마다. 영역에는 `color` 없음. 표면은 raised 고정이고 Role은 아이콘·버튼만 칠한다. `danger`를 「오류」로 본다.
  - **Token과 대비**: `text-default` × `bg-raised`, 역할 text × `bg-raised`(아이콘·버튼 글자, 6 Role), 역할 text × subtle-hover·subtle-active(버튼 hover·누름), 역할 경계 × `bg-raised`(outline 액션), `outline-focus` × 표면 층, 앱 Role 규칙, `border-raised` 제외를 components `unit`에 22 tests로 단언했다. 모두 이미 등록되어 있어 foundation 대비 쌍은 늘지 않았다.
  - **props 표**(모두 client 전용)

    | 대상                                 | prop·인자                                                                                                                                       | 기본값                     |
    | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
    | `ToastRegion`(`<div role="region">`) | `queue: ToastQueue`(필수), `aria-label?`, 나머지 div props. `children`·`role` 제외                                                              | 이름 「N개 알림.」(locale) |
    | `new ToastQueue(options)`            | `maxVisible?: number`                                                                                                                           | `3`                        |
    | `queue.add(toast)` → key             | `title: ReactNode`(필수), `description?`, `color?: Role`, `action?: { label; onClick? }`, `timeout?: number \| null`, `onClose?`, `closeLabel?` | `info`, `5000`, `"닫기"`   |
    | `queue.close(key)`·`clear()`         | 하나·모두 닫기                                                                                                                                  |                            |

    상태: `data-open`(떠 있는 Toast), `data-color`(Toast), `data-placement="top"`(motion용).

  - **테스트**: components browser에 Toast 52 tests(26 × instance 2): 영역(없으면 안 그림, body portal, region 이름 ko-KR 「1개 알림.」, `aria-label`, top-layer 속성), 읽기(alertdialog 이름·설명·`aria-modal=false`·tabindex 0, alert·aria-atomic, 아이콘 aria-hidden, 본문 없으면 설명 없음), 큐(3개까지·새것이 DOM 앞·화면 아래, 닫으면 기다리던 것, `maxVisible`·`close`·`clear`와 `onClose` 안 부름), 자동 닫힘(가짜 타이머: 기본 4.8초 열림·5초 닫힘·onClose, 1000→5000·8000 그대로, `null`·Infinity 없음, 액션·danger는 10분 뒤에도 열림, hover·focus 정지 후 남은 시간), 닫기·액션(이름·`closeLabel`·onClose, 액션 onClick 뒤 닫힘·preventDefault면 유지), F6·Tab 이동, 키보드로 닫으면 옆 Toast·마지막이면 들어오기 전 요소, 열린 Dialog 위(z 비교·inert/aria-hidden 아님·elementFromPoint·눌러도 Dialog 유지), 위치(fixed·끝/아래 16px·폭 ≤384·z 400·isolate), 표면(radius 8·경계 1px·여백 16·bg-raised·text-default·그림자·아이콘 역할 색 20px), 기본 info·버튼 Role·높이 24/32, focus-ring 2px/2px, forced-colors 경계, motion(등장 0.3s·out·blur 4px·translate 4px / 퇴장 0.15s·pointer-events none·blur 2px·2px·역할 빠짐·DOM과 영역 빠짐, reduced-motion은 opacity·display만), ref·className, 타입 오류(색 계열·제목 없음·role·`maxVisibleToasts`). unit 대비 22 tests. docs storybook Toast 6 story(play에서 버튼을 눌러 띄움, a11y 통과).
  - **smoke**: `app/toasts.tsx`(client 모듈: 큐 + `ToastRegion` + 띄우는 Button)를 서버 컴포넌트 page가 그린다. `Toast.js`에 `"use client"`, CSS에 `.z-toast`·`--tide-z-toast`·`flex-col-reverse`·`max-w-96`·`w-[calc(100%-2rem)]`, prerender HTML에 버튼만 있고 영역(`aria-label="알림"`) 없음. nodenext에 Props·옵션 타입과 색 계열·제목 없음 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과(첫 실행). foundation 460, icons 18, components 1745(이전 1671), docs 292(이전 286) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 통과. flaky·「Unexpected token」은 나지 않았다.
  - **ADR·티켓 어긋남**: 없음. 티켓 「`useToast`로 만든다」는 `useToast`(Toast 하나)와 `useToastRegion`·react-stately `ToastQueue`(영역·큐)를 함께 썼다. 새 ADR은 만들지 않았고 ADR 0018·0016에 덧붙였다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 공개 API는 `ToastQueue`(모듈에서 `new`) + `ToastRegion`이다. Provider·`useToaster()` hook·전역 기본 큐는 없다.
    2. 기본 `maxVisible`은 3이다(React Aria 클래스 기본은 무제한, hook 기본은 1).
    3. 자동 닫힘을 막는 「오류」는 `color="danger"`만이다. `warning`은 자동으로 닫힌다.
    4. 5초보다 짧은 `timeout`은 오류 없이 5초로 올린다(타입 오류·경고 없음). `timeout: null`로 자동 닫힘을 끈다.
    5. 기본 `color`는 `info`(Alert와 같음).
    6. 액션은 하나(`{ label, onClick }`)만, Button outline `sm`, 내용 아래 줄. 누르면 닫히고 `preventDefault`로 막는다.
    7. 새 Toast가 아래(모서리 쪽, `flex-col-reverse`)에 쌓이고 Tab 순서는 새것부터(화면에서는 아래에서 위로).
    8. 영역 이름 기본값은 React Aria 번역(locale 따름, 영어 locale이면 「1 notification.」)이고, 닫기 이름 기본값은 Tide 「닫기」(locale 무관)다.
    9. 영역은 문서 Theme만 따른다(트리거가 없어 `useOverlayTheme` 없음). Theme을 일부 영역에만 붙인 앱에서는 Toast가 문서 Theme 색이다.
    10. 퇴장 중 Toast는 역할만 빠지고 `inert`는 없다(150ms 동안 Tab으로 닿을 수 있음). `inert`를 주면 포커스가 있던 Toast가 hook의 포커스 이동 전에 body로 빠질 수 있어 두지 않았다.
    11. 위치는 아래 끝쪽 하나다(`placement` prop 없음). 바꾸려면 `className`(예: `bottom-8`).
  - **다음 티켓 메모**: 마지막 Component다. 시간에 기대는 테스트는 `vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] })`를 대상 타이머가 시작되기 전에 켜야 하고, 켠 동안 `expect.element`·`expect.poll`은 쓰지 않고 `requestAnimationFrame` 두 번으로 렌더를 기다린다. 가짜 Date도 입력 명령(`userEvent.hover` 등)의 실제 시간만큼 수십 ms 흐르므로 경계 앞뒤를 100ms 이상 띄운다. React Aria hook이 DOM을 역할로 세는 경우(`[role="alertdialog"]`) 퇴장 중 요소에서 역할을 빼야 한다. 트리거 없는 오버레이의 Theme 이어받기가 필요해지면 `useOverlayTheme`에 기준 요소를 넘기는 방법을 검토한다.
- 2026-11-12 flaky 테스트 원인과 수정(브랜치 `fix-exit-transition-flaky`). 테스트만 바꿨고 제품 코드는 그대로다.
  - **증상**: 전체 turbo `--force` 3회 중 1회, `chromium-forced-colors`에서 「자동 닫힘 > 영역에 마우스를 올린 동안 멈추고, 떠나면 남은 시간이 지나 닫힌다」가 `locator.hover: Timeout 14877ms exceeded`로 실패했다. call log는 `waiting for locator(...).getByLabel('저장했습니다')` 한 줄이고, 실패 스크린샷에는 Toast가 없다(정상이면 아래에 보인다. 같은 지점에서 일부러 실패시켜 비교함).
  - **원인**: vitest 5.1.0 `@vitest/browser`는 요소를 기다리는 명령(locator의 `hover`·`click` 등, `userEvent.hover`도 여기로 감)이 도는 동안, 가짜 타이머가 켜져 있으면 실제 50ms마다 `vi.advanceTimersByTime(50)`을 부른다(설치본 `dist/context.js` `advanceFakeTimersWhilePending`, 주석 「The provider waits in real time, so fake timers must keep moving」). 이 테스트는 5초 Toast를 3초 당긴 뒤 hover했다. 그래서 부하로 hover 명령이 실제 2초를 넘기면 마우스가 닿기 전에 가짜 시계가 남은 2초를 다 흘려 Toast가 닫힌다. 닫힌 Toast는 역할·이름을 빼고 퇴장한 뒤 DOM에서 빠지므로 Playwright는 locator를 끝내 찾지 못한다. 앞 「다음 티켓 메모」의 「가짜 Date도 입력 명령의 실제 시간만큼 수십 ms 흐른다」가 이 동작이다.
  - **배제한 가설**: (1) Toast 타이머가 실제 시간으로 흐른다 → 아니다. react-stately 3.51.0 `Timer`는 가짜 `setTimeout`·`Date`만 쓰고, sinon fake-timers는 `shouldAdvanceTime` 기본 false라 혼자 흐르지 않는다. rAF로 실제 6초를 기다려도 Toast는 열린 채였다. (2) 가짜 타이머가 Playwright 동작성 검사(rAF·안정성 대기)를 멈춘다 → 아니다. Playwright 1.65.0 injected script는 utility world에서 돌아 페이지의 가짜 전역과 무관하고(`UtilityScript`가 builtins를 따로 잡음), 「locator resolved」 전 단계에서 멈췄다. 6초를 기다린 뒤 hover는 약 67ms에 끝났다. (3) locator가 퇴장 중 요소용으로 만들어졌다 → 아니다. 열린 Toast도 `internal:label="저장했습니다"i`이고, 퇴장 중이면 `internal:label="notifications."i >> div`가 나온다.
  - **결정적 재현**: hover 앞에 실제 2.5초 뒤에야 나타나는 요소를 hover하는 명령을 넣으면, 그 명령 동안 가짜 시계가 2850ms 흐르고 Toast가 닫혀 DOM에서 빠진다(두 instance 모두). 이어지는 hover는 CI와 같은 실패가 된다.
  - **수정**: 테스트 시간 제한(15초)보다 훨씬 긴 60초 Toast를 쓰고, 영역의 `pointerenter`·`pointerleave` 순간의 가짜 시각을 그 자리에서 기록해 닫히는 시각(`떠난 시각 + 60000 − (들어온 시각 − 시작 시각)`)을 정확히 계산한다. 그 1ms 앞에서는 열려 있고 그 시각에 닫히는지 본다. 올린 동안에는 600초를 당겨도 닫히지 않는지 본다. 명령에 걸린 시간과 상관없이 결과가 같고, 경계를 1ms로 보므로 전보다 단언이 강하다. hover 앞과 unhover 뒤에 각각 2.5초 명령을 넣어도(가짜 시계 2850ms씩 흐름) 통과한다. 다른 가짜 타이머 테스트는 locator 명령을 쓰지 않아 영향이 없다(`useFakeTimers`는 이 파일뿐).
  - **반복 결과**: 고친 파일들(Toast·Menu·Tooltip·Popover 등 9개, 두 instance, 548 tests)을 CPU 코어 10개에 busy loop 10개를 건 부하에서 8회 모두 통과. 원인 조사 중 계측을 넣은 전체 turbo 5회·components 전체 5회에서는 재현되지 않았다(빈도 낮음). 수정 후 `setopt NULL_GLOB; rm -rf packages/*/dist apps/docs/storybook-static` 뒤 `pnpm turbo run typecheck test build smoke --force` 3회 연속 통과(components 1745 tests).
