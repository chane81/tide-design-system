# 오버레이는 공통 모듈(`overlay.tsx`·`overlay-style.ts`)로 portal·위치·쌓임·motion·DOM에서 빼는 시점을 나눈다

근거 원칙: ① 접근성이 미려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

Popover·Tooltip·Menu·Select·Combobox·Dialog·Toast는 모두 「트리거나 화면 위에 떠서, 열고 닫힐 때 움직이고, 닫히면 포커스를 돌려주는」 요소다. 이 공통 부분을 Popover(티켓 25)에서 내부 모듈로 나누고, 역할(dialog, menu, listbox, tooltip)과 마크업만 각 Component가 정한다(2026-11-11, [티켓 25](../progress/tide-v0-impl/issues/25-popover.md)). React Aria는 hooks 층만 쓴다(ADR 0004, react-aria 3.53.1, react-stately 3.51.0).

공개 API가 아닌 내부 모듈이다(`index.ts`에서 export하지 않는다). 나누는 부분은 다섯이다.

- **DOM에 둘지(`useOverlayPresence(isOpen, ref)`)**: 열리면 바로 DOM에 넣는다. 닫히면 요소의 `getAnimations()`(CSS transition 포함)가 모두 끝나거나 취소될 때까지 남겼다가 뺀다. 도는 전환이 없으면(지원하지 않는 브라우저, 퇴장 전환이 없는 오버레이) 바로 뺀다. 퇴장 중에 다시 열리면 빼지 않는다. React Aria hooks에는 퇴장을 기다리는 hook이 없어서(react-aria-components의 `isExiting`은 Component 층) Tide가 이 일을 한다. 오버레이 hook(`usePopover`, `useDialog` 등)은 요소가 있다고 보고 동작하므로, 바깥 Component가 이 hook으로 DOM에 둘지 정하고 안쪽 Component만 그 hook들을 부른다.
- **portal(`OverlayPortal`)**: React Aria `Overlay`로 `document.body`에 portal한다. 안을 `FocusScope restoreFocus`로 감싸 DOM에서 빠질 때 포커스가 열기 전 요소로 돌아간다. 역할 hook(`useDialog`)이 Overlay context로 포커스 가두기를 요청하므로 **역할 hook을 부르는 Component는 portal 안쪽**에 둔다. 퇴장 중에는 `isExiting`으로 가두기를 푼다.
- **위치(`usePopoverOverlay`, `overlayPositionProps`)**: 트리거에 붙는 오버레이는 `usePopover`를 감싼 `usePopoverOverlay`(Esc·바깥 누름·포커스 이탈로 닫기, 기본 모달: 바깥 `inert` + 스크롤 잠금, `nonModal`로 끔)를 쓴다. dismiss가 다른 Tooltip은 `useOverlayPosition`을 직접 쓰고 결과를 `overlayPositionProps`로 맞춘다. `overlayPositionProps`는 React Aria가 위치 style에 넣는 `zIndex: 100000`을 빼고, 주축 방향을 `data-placement`(`top`/`bottom`/`left`/`right`)로 붙인다. placement가 아직 계산되기 전(첫 렌더)에는 요청한 placement의 주축을 쓴다.
- **쌓임**: 쌓임 단계 class(`z-popover`, `z-tooltip`, `z-toast`, `z-modal`)만 쓴다. 표면 class에 넣지 않고 오버레이마다 붙인다. 오버레이 루트는 `isolate`라 안의 겹침(`z-0`/`z-1`)이 바깥 단계와 섞이지 않는다.
- **표면·motion(`overlay-style.ts`)**: `overlaySurfaceClass`(raised + `shadow-md` + radius `lg` + `border-raised` + `text-default`)와 「가끔 씀」 motion인 `popoverMotionClass`를 둔다. motion은 `data-open`이 있을 때 `@starting-style`(`starting:`)에서 등장하고, 빠지면 닫힌 상태(`not-data-open:`)로 퇴장한다. 닫힌 상태는 `display: none`이고 `transition-discrete`(`allow-discrete`)로 display까지 전환해, 지원하는 브라우저에서는 퇴장 전환이 끝날 때 사라지고 지원하지 않으면 바로 사라진다. 이동·blur와 그 전환 대상은 `motion-safe:`에만 둔다. 「자주 씀」(Tooltip, Menu, 목록)과 Dialog류는 같은 구조로 자기 class를 이 파일에 더한다.
- **Theme(`useOverlayTheme`)**: portal은 Theme 영역 밖(`body`)으로 나가므로, 트리거에서 가장 가까운 `[data-theme]` 값을 오버레이에 옮긴다. Theme을 `<html>`이 아닌 영역에 붙인 앱에서도 같은 색이 된다. 위치를 계산하기 전(첫 스타일 계산 전)에 붙도록 위치 hook보다 먼저 부른다.

## 검토한 대안

- **Component마다 직접 짜기**: 6개 오버레이가 같은 hook 조합·z-index 덮어쓰기·퇴장 대기를 반복하고, 하나를 고칠 때 나머지가 어긋난다(③).
- **CSS만으로 퇴장(요소를 항상 DOM에 두고 `display`만 전환)**: React Aria의 포커스 복귀(`FocusScope restoreFocus`)와 `ariaHideOutside`는 요소가 DOM에서 빠지거나 상태가 바뀔 때 동작하도록 짜여 있어, 닫힌 요소를 남겨 두면 포커스 복귀를 Tide가 다시 짜야 한다(①). 대신 퇴장 동안만 남기고 끝나면 뺀다.
- **퇴장 시간을 `setTimeout`(150ms)으로 기다리기**: 지원하지 않는 브라우저·움직임 줄이기·앱이 바꾼 duration에서 시간이 어긋난다. `getAnimations()`는 실제로 도는 전환만 기다린다.
- **top-layer(`<dialog>`, popover API)**: spec이 v0에서 쓰지 않기로 했다(쌓임 단계 Token으로 앱이 단계를 끼울 수 있어야 한다). `@starting-style`과 `allow-discrete`는 top-layer 없이도 동작한다.
- **`underlayProps`로 투명 underlay 깔기**: React Aria 3.53.1 `usePopover`의 `underlayProps`는 빈 객체이고, 바깥 막기는 `inert`(`ariaHideOutside(..., { shouldUseInert: true })`)가 한다. underlay는 두지 않는다.

## Consequences

- 26(Tooltip)·27(Menu)·28(Select)·29(Combobox)·30(Dialog)·34(Toast)는 이 모듈을 쓴다. 바꿀 것이 생기면 이 ADR을 고친다.
- 열린 동안 바깥이 `inert`라 Playwright `click`(누를 수 있는지 먼저 확인)은 바깥 요소를 누르지 못한다. 테스트는 좌표로 마우스를 누르는 명령(`mouseDownOn`·`mouseUp`)을 쓴다.
- 트리거는 `useOverlayTrigger`의 `onPress`를 `usePress`로 붙인다(`useButton` 대신. 트리거가 `render`로 Tide Button이 되므로 press만 붙이고, 공개 이름에 `onPress`를 드러내지 않는다). 기본(모달)에서는 열린 동안 트리거도 `inert`라, 트리거를 다시 누르면 바깥 누름으로 닫힌다(테스트로 확인). `nonModal`(Combobox)에서 트리거 누름과 바깥 누름이 겹치는 경우는 29에서 확인한다.
- 등장 방향은 첫 스타일 계산 때 정해진다. 공간이 없어 반대쪽으로 뒤집힌 경우에만 첫 프레임의 시작 방향이 요청한 쪽(4px)이 된다.

> 덧붙임(2026-11-11, [티켓 26](../progress/tide-v0-impl/issues/26-tooltip.md)): Tooltip이 이 모듈을 처음 다시 썼다. 바뀐 것은 셋이다. Popover 테스트는 그대로 통과한다.
>
> - **`OverlayPortal`의 `focusManagement`(기본 `true`)**: `false`면 React Aria `Overlay`에 `disableFocusManagement`를 넘겨 `FocusScope` 없이 portal만 한다. Tooltip은 포커스를 받지 않으므로 끈다. 켜 두면 열린 Popover 안 트리거의 Tooltip이 FocusScope를 하나 더 만들고 닫힐 때 포커스 복귀를 시도한다.
> - **「자주 씀」 motion `frequentMotionClass`(overlay-style.ts)**: `popoverMotionClass`와 같은 구조(`data-open`, 닫힌 상태 `hidden` + `transition-discrete`, 퇴장 중 `pointer-events-none`)에서 등장의 시작 상태와 이동·blur를 뺐다. 열린 동안은 `data-open:transition-none`이라 새로 나타날 때도, 퇴장 중 다시 열릴 때도 전환 없이 바로 불투명해진다. 닫히면 `transition-[opacity,display]` `fast` out으로 opacity만 사라진다. 이동이 없으므로 움직임 줄이기에서도 같다. Menu·Select·Combobox 목록(27~29)이 그대로 쓴다.
> - **위치는 `useOverlayPosition` + `overlayPositionProps`**: Tooltip은 dismiss(Esc, hover·포커스 이탈)를 `useTooltipTrigger`가 하므로 `usePopover`를 쓰지 않는다. 위치는 `useOverlayPosition`(`isOpen`, 스크롤 시 `onClose`로 바로 닫기)이 구하고 `overlayPositionProps`가 `zIndex`를 빼고 `data-placement`를 붙인다.
>
> 모듈 밖의 Tooltip 결정 하나: 열린 모달 Popover·Dialog는 바깥을 `ariaHideOutside(..., { shouldUseInert: true })`로 막고 **나중에 body에 붙은 요소도** MutationObserver로 막는다. 그 안 트리거의 Tooltip이 `inert`가 되지 않도록 설명 요소에 `data-react-aria-top-layer`를 붙인다. React Aria 3.53.1 소스(`ariaHideOutside`의 늘 보이는 요소, `useInteractOutside`의 바깥 판정 제외, `FocusScope`)가 이 속성을 보는 것을 확인했지만 공개 문서에는 없는 속성이다. React Aria 판을 올릴 때 Tooltip 테스트 「열린 Popover 위에 보이고 inert가 되지 않는다」가 이 동작을 지킨다. Toast(34)도 같은 문제가 생기면 이 속성을 쓰고 공통 모듈로 옮긴다.

> 덧붙임(2026-11-11, [티켓 27](../progress/tide-v0-impl/issues/27-menu.md)): Menu가 이 모듈을 고치지 않고 그대로 썼다. Popover·Tooltip 테스트는 그대로 통과한다.
>
> - **조합**: `useOverlayPresence` → `OverlayPortal`(`focusManagement` 기본 `true`. Menu는 항목에 포커스가 오므로 FocusScope가 닫힐 때 트리거로 포커스를 돌린다) → `useOverlayTheme` → `usePopoverOverlay`(모달 기본) + `useMenu`. motion은 `frequentMotionClass`, 쌓임은 `z-popover`다.
> - **목록 공통 부분은 이 모듈 밖에 둔다**: 목록 표면(여백 3px 포함)·항목 class는 `list-style.ts`, 항목 모으기는 `list-collection.ts`([ADR 0019](0019-list-collection-elements.md))다. 오버레이가 아닌 목록(인라인 Listbox 등)에도 쓸 수 있게 이 모듈과 나눴다. `list-style.ts`가 `overlay-style.ts`의 표면·motion class를 가져다 쓴다.
> - **Tab**: React Aria `useMenu`는 Tab을 다루지 않고, `FocusScope`가 document capture에서 Tab을 먼저 받으며, 바깥이 `inert`라 기본 동작은 갈 곳이 없다. Menu는 window capture에서 Tab을 받아 기본 동작을 막고 닫는다(포커스는 트리거로 돌아온다). Select 목록(28)도 같은 처리가 필요한지 확인한다.

> 덧붙임(2026-11-11, [티켓 28](../progress/tide-v0-impl/issues/28-select.md)): Select 목록이 이 모듈을 썼고 하나를 더했다. Popover·Tooltip·Menu 테스트는 그대로 통과한다.
>
> - **`useCloseOnTab(overlayRef, close)`**: Menu 안에 있던 Tab 닫기(window capture에서 Tab을 받아 기본 동작을 막고 닫기)를 이 모듈로 옮겼다. Select 목록에도 필요했다. 옮기면서 **전파도 멈춘다**. listbox(`useListBox` 안의 `useSelectableCollection`)는 Tab에서 포커스를 목록 안 요소로 옮겨, 그대로 두면 닫힌 뒤 포커스가 트리거로 돌아오지 않았다(Select 테스트로 확인). Menu는 바뀐 동작이 없다(Menu Tab 테스트 통과).
> - **조합**: `useOverlayPresence` → `OverlayPortal`(`focusManagement` 기본) → `useOverlayTheme` → 트리거 폭을 `min-width`로 붙이는 layout effect(위치 hook보다 먼저) → `usePopoverOverlay`(모달 기본, `bottom start`, 4px) + `useListBox` + `useCloseOnTab`. motion은 `frequentMotionClass`, 쌓임은 `z-popover`(`listPopupClass`).
> - **바깥 요소와 listbox를 나눈다**: listbox의 자식은 option·group만 될 수 있다. 위치·표면은 바깥 요소(`listPopupClass`, `overlayProps`)가 맡고, 그 안에 Popover와 같은 숨은 닫기 버튼(`DismissButton`) 둘과 `role="listbox"` 요소를 둔다. Menu는 menu 자식 규칙 때문에 닫기 버튼이 없지만 Select는 둔다.

> 덧붙임(2026-11-11, [티켓 29](../progress/tide-v0-impl/issues/29-combobox.md)): Combobox 목록이 이 모듈을 고치지 않고 썼다(`nonModal`을 처음 쓴다). Popover·Tooltip·Menu·Select 테스트는 그대로 통과한다.
>
> - **조합**: `useOverlayPresence` → `OverlayPortal`(`focusManagement={false}`) → `useOverlayTheme(입력, 목록)` → 입력 폭을 `min-width`로 붙이는 layout effect → `usePopoverOverlay`(`nonModal: true`, `bottom start`, 4px, 기준은 입력) + `useListBox`(`useComboBox`의 `listBoxProps`라 `shouldUseVirtualFocus`). motion은 `frequentMotionClass`, 쌓임은 `z-popover`(`listPopupClass`). `useCloseOnTab`은 쓰지 않는다. Tab은 입력에서 일어나고 React Aria가 가상 포커스 옵션을 고른 뒤 다음 요소로 그대로 보낸다.
> - **`focusManagement={false}`**: 포커스가 늘 입력에 있어 FocusScope가 필요 없다. 감싸면 바깥 빈 곳을 눌러 포커스가 body로 간 뒤 목록이 빠질 때 FocusScope `restoreFocus`가 입력으로 포커스를 되돌린다(react-aria 3.53.1 FocusScope 소스: 활성 요소가 body면 복귀).
> - **non-modal에서 트리거와 바깥 누름(티켓 26 메모의 확인)**: 바깥 누름 닫기는 `usePopover`가 하지 않고(`isDismissable: false`), 포커스가 입력을 떠날 때 `useComboBox`가 닫는다. chevron 버튼은 누를 때 포커스를 가져가지 않으므로 열린 동안 다시 누르면 toggle로 닫히고 다시 열리지 않는다(테스트로 확인). 바깥은 inert가 아니며 `useComboBox`가 입력·목록 밖을 `aria-hidden`으로 숨긴다.
> - **문서 스크롤로 닫힌다**: non-modal이면 `usePopover`가 `useOverlayPosition`의 `onClose`로 `state.close`를 넘겨, 입력을 담은 문서·스크롤 영역이 스크롤되면 닫는다(react-aria 3.53.1 `useCloseOnScroll`). Combobox의 `close`는 입력을 고른 옵션 글자로 되돌린다. 목록이 화면보다 넓으면 옵션을 화면에 보이려는 `scrollIntoView`가 문서를 가로로 움직여 ↓ 한 번에 닫혔다(테스트로 재현). 그래서 Combobox는 `min-width`를 `min(입력 폭, 100vw − 24px)`(React Aria `containerPadding` 12px 양쪽)로 둔다. Select는 트리거 폭 그대로다(모달이라 스크롤로 닫히지 않는다).

> 덧붙임(2026-11-11, [티켓 30](../progress/tide-v0-impl/issues/30-dialog-and-alert-dialog.md)): Dialog·AlertDialog가 이 모듈을 썼다. `overlay.tsx`의 동작은 바꾸지 않았고(머리 주석에 모달 조합 한 줄), `overlay-style.ts`에 class 셋을 더했다. Popover·Tooltip·Menu·Select·Combobox 테스트는 그대로 통과한다.
>
> - **조합**: `useOverlayPresence(isOpen, 막 ref)` → `OverlayPortal`(`focusManagement` 기본) → `useOverlayTheme(트리거, 막)` → React Aria `useModalOverlay`(`isDismissable`: Dialog `true`, AlertDialog `false`) + `useDialog`(`role`: `dialog`/`alertdialog`). 위치 hook은 쓰지 않는다(가운데 고정). `useModalOverlay`가 Esc·바깥 누름 닫기, 바깥 `inert`(`ariaHideOutside(..., { shouldUseInert: true })`), 스크롤 잠금(`usePreventScroll`), 포커스 가두기 요청을 한다(react-aria 3.53.1 소스 확인).
> - **막(backdrop)이 루트**: portal 안의 루트는 화면 전체를 덮는 막(`fixed inset-0 isolate z-modal bg-overlay`)이고 그 안에 dialog 요소가 있다. dialog 요소가 `useModalOverlay`의 ref라 막은 「바깥」이 되어 막 누름이 바깥 누름으로 잡힌다(ADR 본문의 「underlay는 두지 않는다」는 트리거에 붙는 오버레이의 이야기다. 모달은 보이는 막이 있어야 한다). `underlayProps`(3.53.1에서 빈 객체)는 막에 펼친다.
> - **DOM에서 빼는 시점은 막의 전환으로 정한다**: `getAnimations()`는 자기 요소의 전환만 돌려주므로 `useOverlayPresence`에 막 ref를 넘긴다. 막(`backdropMotionClass`: opacity, 닫히면 `hidden` + `transition-discrete`)과 dialog(`dialogMotionClass`: opacity + `motion-safe:` scale)의 duration을 같게 두어 함께 끝난다. 표면은 `dialogSurfaceClass`(raised + `shadow-lg` + radius `xl` + `border-raised`).
> - **포커스 복귀 시점(기존 동작 확인)**: Esc로 닫으면 퇴장 중에 포커스가 body로 빠지고, 내용이 DOM에서 빠진 다음 프레임에 FocusScope가 트리거로 되돌린다. Popover도 같다(디버그 기록으로 확인). 테스트는 포커스를 `expect.poll`로 기다린다.
> - **Dialog 안의 다른 오버레이**: Select 목록(`z-popover` 300)과 Tooltip(`z-tooltip` 500, `data-react-aria-top-layer`)은 `z-modal`(200) 위에 보이고 `inert`가 되지 않으며, Esc는 위의 것부터 닫는다(테스트로 확인). Toast(34)가 열린 Dialog 위에 뜨는 경로: React Aria 3.53.1 `useToastRegion`은 영역 props에 `data-react-aria-top-layer`를 이미 붙인다(소스 확인). 그래서 영역 요소에 `regionProps`를 펼치고 `z-toast`(400)로 쌓으면 Dialog가 연 뒤 body에 붙어도 `inert`가 되지 않을 것이다. 34에서 「열린 Dialog 위 Toast가 inert가 아니고 눌린다」 테스트로 확인한다.

> 덧붙임(2026-11-11, [티켓 34](../progress/tide-v0-impl/issues/34-toast.md)): Toast가 이 모듈을 고치지 않고 썼다. 오버레이 중 트리거가 없는 첫 Component다. 다른 오버레이 테스트는 그대로 통과한다.
>
> - **조합**: `ToastRegion`이 react-stately `useToastQueue`로 보이는 Toast를 받고, Toast가 하나라도 있으면 `OverlayPortal`(`isExiting={false}`, `focusManagement={false}`) 안에 영역을 그린다. 영역은 `useToastRegion`(region 랜드마크, hover·focus 동안 `pauseAll`, 닫힌 Toast의 포커스를 옆 Toast·들어오기 전 요소로 옮김), Toast 하나는 `useToast`다. 포커스는 이 hook들이 다루므로 FocusScope는 감싸지 않는다(감싸면 restoreFocus가 hook의 포커스 이동과 겹친다). 위치 hook은 쓰지 않는다(`fixed end-4 bottom-4`).
> - **퇴장은 Toast마다 `useOverlayPresence`**: react-stately 큐는 닫힌 Toast를 `visibleToasts`에서 바로 뺀다. 영역은 빠진 Toast를 원래 자리에 `open: false`로 남기고, 각 Toast가 `useOverlayPresence(open, ref)`로 퇴장 전환이 끝났을 때 영역에 알려 뺀다. 퇴장 중 Toast는 `toastProps`·`contentProps`(역할·tabIndex)를 펼치지 않는다. `useToastRegion`이 `[role="alertdialog"]` 순서로 옆 Toast를 찾으므로 퇴장 중 요소가 섞이면 포커스가 엉뚱한 Toast로 간다.
> - **motion은 `popoverMotionClass` 그대로**: 아래에서 떠오르도록 `data-placement="top"`(트리거 위에 뜨는 Popover와 같은 방향: 4px 아래에서 올라오고 퇴장은 2px 아래로)을 붙인다. 표면은 `overlaySurfaceClass`, 쌓임은 `z-toast`(400)다.
> - **열린 모달 위(티켓 26·30 메모의 확인)**: `useToastRegion`의 `regionProps`에 `data-react-aria-top-layer`가 있어(react-aria 3.53.1 소스), 열린 Dialog가 연 뒤 body에 붙은 영역도 `inert`·`aria-hidden`이 되지 않고 눌러도 Dialog가 닫히지 않는다(테스트로 확인). 공통 모듈로 옮길 것은 생기지 않았다.
> - **Theme**: 트리거가 없어 `useOverlayTheme`을 쓰지 않는다. 영역은 문서(`<html>`)의 Theme을 따른다.
