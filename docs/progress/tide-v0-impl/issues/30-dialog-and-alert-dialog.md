# 30: Dialog와 AlertDialog

Status: done
Blocked by: 25 (Popover)

## What to build

앱 개발자가 `Dialog`로 모달을 띄우고, 삭제 확인처럼 위험한 동작에는 `AlertDialog`를 쓴다. 키보드 사용자는 포커스가 Dialog 안에 갇히고 닫으면 트리거로 돌아온다. Dialog 안에서 연 Select 목록은 위에 보인다.

## 수용 기준

- [x] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [x] `z-modal`과 overlay(`bg-overlay`)를 쓴다. raised 표면, `shadow-lg`, radius `xl`.
- [x] 등장: opacity + scale 0.96 → 1, `normal`. 퇴장: 같은 조합을 약하게, `fast`. reduced-motion에서는 opacity만.
- [x] 포커스 가두기, Esc 닫기, 닫으면 트리거로 포커스 복귀. 닫기 IconButton(이름 필수).
- [x] 부분 Component를 평평한 이름(`DialogTrigger` 등)으로 export한다.
- [x] AlertDialog는 Dialog 위의 얇은 변형이고 alertdialog 역할을 쓴다.
- [x] `browser`: 역할·이름, 포커스 가두기와 복귀, Esc, overlay 클릭 동작, Dialog 안 Select 목록이 위에 보임, forced-colors 경계, reduced-motion 계산값을 단언한다.

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

- 2026-11-11 완료(브랜치 `ticket-30-dialog-and-alert-dialog`, main c25f3d3 위).
  - **근거 버전**: react-aria 3.53.1, react-stately 3.51.0(이미 components 의존성, 새 의존성 없음, `minimumReleaseAge` 그대로), react 19.3.1, vitest·@vitest/browser-playwright 5.1.0(Chromium), storybook 10.6.6, typescript 7.0.2.
  - **API 확인**: context7 `/websites/react-aria_adobe`(Modal/useModalOverlay: `isDismissable` 기본 `false`·`isKeyboardDismissDisabled`·`underlayProps`/`modalProps`, useDialog: `role` `dialog`/`alertdialog`·`titleProps`·`contentProps`, 「포커스 가두기는 Overlay 안에서 요청」)와 설치본 dist 소스(`useModalOverlay`: `useOverlay` + `usePreventScroll` + `useOverlayFocusContain` + `ariaHideOutside(..., { shouldUseInert: true })`, `underlayProps`는 빈 객체 / `useDialog`: 열 때 안에 포커스가 없으면 Dialog 요소에 포커스, `aria-modal`은 Safari 버그로 빼고 바깥 inert로 대신 / `useOverlayTrigger`: dialog 트리거에는 `aria-haspopup`을 붙이지 않음 / `useToastRegion`: 영역에 `data-react-aria-top-layer`). 접근성 패턴은 WAI-ARIA APG Dialog(Modal)·Alert and Message Dialogs 패턴과 Alert Dialog 예시, WAI-ARIA 1.2 `alertdialog`를 확인했다.
  - **APG 확인 결과**: Esc는 둘 다 닫는다(APG Dialog 키보드, Alert Dialog 예시 「no 버튼이나 Esc로 닫는다」). 바깥 누름 닫기는 APG가 정하지 않는다. AlertDialog는 「응답을 받아야 하는」 대화상자(APG, ARIA 1.2)이므로 막 누름으로 닫지 않는다(React Aria `ModalOverlay` `isDismissable` 기본 `false`와 같음). Dialog는 막 누름으로 닫는다. 이름은 보이는 제목을 `aria-labelledby`로, 설명은 `aria-describedby`로 잇고(alertdialog는 APG 필수), 첫 포커스는 AlertDialog에서 가장 덜 위험한 동작(첫 버튼)이다.
  - **export 이름**: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`, `AlertDialog`, 타입 `DialogProps`·`DialogTriggerProps`·`DialogContentProps`·`DialogSize`·`DialogTitleProps`·`DialogDescriptionProps`·`DialogFooterProps`·`DialogCloseProps`·`AlertDialogProps`.
  - **구현 결정**:
    - **AlertDialog는 루트만 다르다**: `AlertDialog.tsx`는 `DialogRoot`에 `alert`만 켜는 몇 줄이다. 부분 Component는 Dialog의 것을 그대로 쓴다. `alert`이면 역할 `alertdialog`, `isDismissable: false`, 닫기 IconButton 없음, 열릴 때 첫 조작 요소에 포커스(`useFocusManager().focusFirst({ tabbable: true })`, useDialog가 Dialog 요소에 포커스를 준 뒤 그대로일 때만. `autoFocus` 요소가 있으면 둔다).
    - **조합(ADR 0018 덧붙임)**: `useOverlayPresence(isOpen, 막 ref)` → `OverlayPortal` → `useOverlayTheme(트리거, 막)` → `useModalOverlay` + `useDialog`. portal 루트는 막(`fixed inset-0 isolate z-modal flex items-center justify-center bg-overlay p-4`)이고 그 안에 dialog 요소(ref·className·props가 가는 루트 DOM)가 있다. dialog가 `useModalOverlay`의 ref라 막 누름이 바깥 누름이 된다. 공통 모듈 동작은 바꾸지 않고 `overlay-style.ts`에 `dialogSurfaceClass`·`backdropMotionClass`·`dialogMotionClass`를 더했다.
    - **이름·설명**: `DialogTitle`·`DialogDescription`이 열린 동안 자기 id(주면 그 id)를 context로 알리고 dialog의 `aria-labelledby`·`aria-describedby`가 된다. 이름은 `aria-labelledby` > `aria-label` > 제목 > 트리거 글자(트리거가 있을 때만) 순서다. 트리거 없이 `open`으로 열어도 된다(포커스는 열기 전 요소로 돌아감).
    - **motion**: 막은 opacity(등장 `normal`, 퇴장 `fast`, 닫힌 상태 `hidden` + `transition-discrete`, 퇴장 중 `pointer-events-none`), 내용은 opacity + `motion-safe:` scale(`starting:scale-96` → 1, 퇴장 `scale-98`). 움직임 줄이기에서는 scale과 그 전환 대상이 빠진다. DOM에서 빼는 시점은 막의 전환으로 정한다(같은 duration).
    - **크기·여백**: `size` `sm` `max-w-96`(24rem)·`md` `max-w-128`(32rem, 기본)·`lg` `max-w-160`(40rem), `w-full`, 막 여백 16px, 높이는 `max-h-full` + `overflow-y-auto`. 여백 24px, 부분 사이 16px, Footer는 `mt-2`로 버튼 앞 24px. 제목 `text-heading-sm`(Dialog에서는 닫기 버튼 자리 `pe-9`), 설명 `text-body-md text-muted`. 닫기 IconButton은 ghost neutral `sm`, `absolute end-5 top-5`, DOM 끝(Tab 순서 마지막).
    - **DialogClose**: `onClick`을 먼저 부르고 `defaultPrevented`가 아니면 닫는다. `render`로 Button 모양.
  - **color 결정(ADR 0016 덧붙임)**: Dialog·AlertDialog는 오버레이 구조 Component라 `color`가 없다. 위험 동작은 행동 Component인 Button `color="danger"`(Role)로, 취소는 ghost neutral로 둔다(문서 Do/Don't).
  - **Token과 대비**: `text-default`·`text-muted` × `bg-raised`(4.5:1), `outline-focus` × `bg-raised`(3:1) 등록과 `bg-overlay`·`border-raised` 제외(foundation에 이미 사유 있음)를 components `unit`에 4 tests로 단언했다. foundation 대비 쌍은 늘지 않았다. z-index는 foundation `modal` 200(`z-modal`).
  - **props 표**(모두 client Component)

    | Component              | 요소                               | prop                                                                                                       |
    | ---------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
    | `Dialog`·`AlertDialog` | 없음(상태)                         | `open?`, `defaultOpen?`(기본 `false`), `onOpenChange?(open)`, `children`                                   |
    | `DialogTrigger`        | `<button type="button">`           | `render?: ReactElement`                                                                                    |
    | `DialogContent`        | `<div role="dialog\|alertdialog">` | `size?: "sm" \| "md" \| "lg"`(기본 `md`), `closeLabel?: string`(기본 `"닫기"`, Dialog만). `role`·`id` 제외 |
    | `DialogTitle`          | `<h2>`                             | `id?`(주면 그 id로 잇는다)                                                                                 |
    | `DialogDescription`    | `<p>`                              | `id?`                                                                                                      |
    | `DialogFooter`         | `<div>`                            | div props                                                                                                  |
    | `DialogClose`          | `<button type="button">`           | `render?: ReactElement`, `onClick`(`preventDefault`면 닫지 않음)                                           |

    상태: `data-open`(트리거·막·내용).

  - **테스트**: components browser에 Dialog 58 tests(29 × instance 2): 역할·이름(제목·트리거 글자·aria-label·준 id)·설명, aria-expanded·aria-controls·data-open, Enter로 열고 Esc로 닫으면 포커스 복귀, 닫기 IconButton(이름·closeLabel), DialogClose와 preventDefault, 막 누름 닫기·안 누름 유지, 트리거 없는 제어 열기의 포커스 복귀, 제어 onOpenChange, Tab·Shift+Tab 가두기, 바깥 inert·스크롤 잠금과 해제, autoFocus, AlertDialog(alertdialog·설명·닫기 버튼 없음·취소에 첫 포커스·막 누름 무시·Esc·danger 버튼), Dialog 안 Select 목록 위에 보임(z·elementFromPoint·inert 아님·Esc는 목록만), Dialog 안 Tooltip(inert 아님·위·Esc는 Tooltip만), portal·z 200·막 화면 전체·bg-overlay, 표면(raised·shadow-lg·12px·24px), size 3개, dark Theme, forced-colors 경계, 등장(opacity·scale 0.96·0.3s)·퇴장(scale 0.98·0.15s·pointer-events none·DOM에서 빠짐)·reduced-motion opacity만, ref·className·타입 오류. 막 모서리 누름 명령 `mouseDownAtCorner`를 test/commands.ts에 더했다. unit 대비 4 tests. docs storybook Dialog 7 story(play에서 열고 a11y 통과).
  - **smoke**: page(서버 컴포넌트)에 Dialog(size sm, 제목·설명·DialogClose)와 AlertDialog(danger 트리거·버튼). `Dialog.js`·`AlertDialog.js`에 `"use client"`. prerender HTML: 트리거가 `type="button"`·`aria-expanded="false"`·`aria-haspopup`·`aria-controls`·`data-open` 없음, AlertDialog 트리거 `data-color="danger"`, `alertdialog`·제목 요소 없음. CSS에 `z-modal`·`--tide-z-modal`·`bg-overlay`·`motion-safe:starting:scale-96`·`motion-safe:not-data-open:scale-98`·`max-w-128`. nodenext에 Props 타입 9개와 `size: "xl"`·`role`·`isDismissable` 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 460, icons 18, components 1525(이전 1463), docs 266(이전 259) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 통과. 처음 실행에서 고친 것: ① React Aria가 dialog 트리거에 `aria-haspopup`을 붙이지 않음 → 단언 수정, ② 포커스 복귀가 내용이 빠진 다음 프레임 → `expect.poll`, ③ smoke에서 제목 글자가 RSC payload에 있음 → 제목 요소(`…</h2>`) 부재로 단언. 「Unexpected token」은 나지 않았다.
  - **ADR·티켓 어긋남**: 없음. 공통 API 규칙 「ref는 루트 DOM」은 dialog 요소다(막은 portal 안 바깥 감싸개). 새 ADR은 만들지 않았고 ADR 0016·0018에 덧붙였다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. AlertDialog는 루트(`AlertDialog`)만 따로 두고 부분 Component는 Dialog 이름을 쓴다(`AlertDialogContent` 등 없음).
    2. Dialog는 막 누름으로 닫히고 끄는 prop이 없다. 폼 입력 중 실수로 닫히는 것이 문제면 prop을 더한다.
    3. Dialog를 열면 Dialog 요소 자신에 포커스가 온다(React Aria 기본, APG는 「보통 첫 조작 요소」). AlertDialog만 첫 조작 요소다.
    4. 닫기 IconButton은 Dialog에 늘 있고 Tab 순서 마지막이다.
    5. `aria-modal`이 없다(React Aria 선택, 바깥 inert로 대신). 트리거 `aria-haspopup`도 없다.
    6. `size` 값(24/32/40rem)과 제목 `text-heading-sm`·`<h2>` 고정.
    7. 닫을 때 퇴장 중 포커스가 잠깐 body로 빠진다(Popover와 같은 기존 동작).
  - **다음 티켓 메모**: 모달은 portal 루트를 막으로 두고 `useOverlayPresence`에 막 ref를 넘긴다(getAnimations는 자기 요소만 본다). 가려진 막을 누르는 테스트는 `commands.mouseDownAtCorner`. 닫힌 뒤 포커스는 다음 프레임에 돌아오므로 `expect.poll`. Toast(34)는 React Aria `useToastRegion`의 `regionProps`에 `data-react-aria-top-layer`가 이미 있으므로, 영역에 펼치고 `z-toast`로 쌓으면 열린 Dialog의 inert를 피할 것이다. 「열린 Dialog 위 Toast가 눌리고 inert가 아니다」를 34에서 테스트한다. Tabs·Accordion(31·32)은 오버레이가 아니므로 이 모듈과 무관하다.
