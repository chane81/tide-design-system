# 29: Combobox

Status: done
Blocked by: 28 (Select)

## What to build

앱 개발자가 `Combobox`에 옵션 목록을 주면 입력값으로 클라이언트에서 필터링되고 하나를 고른다. 비동기, 다중 선택, 가상화, 자유 입력은 v0에 없다.

## 수용 기준

- [x] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [x] `useComboBox`로 만든다. Select의 트리거·목록 규칙을 재사용한다.
- [x] 입력값으로 옵션을 클라이언트 필터링한다. 단일 선택만 한다.
- [x] `value`/`defaultValue`/`onValueChange(value)`. Field와 연결된다.
- [x] 결과가 없을 때의 표시를 정한다.
- [x] `browser`: 입력 필터링, 화살표 이동과 선택, Esc 닫기, 결과 개수나 상태 안내, Field 연결을 단언한다.

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

- 2026-11-11 완료(브랜치 `ticket-29-combobox`, main 0b33180 위).
  - **근거 버전**: react-aria 3.53.1, react-stately 3.51.0(이미 components 의존성, 새 의존성 없음, `minimumReleaseAge` 그대로), react 19.3.1, vitest·@vitest/browser-playwright 5.1.0(Chromium), storybook 10.6.6, typescript 7.0.2.
  - **API 확인**: context7 `/websites/react-aria_adobe`(ComboBox/useComboBox: `useComboBoxState`의 `defaultFilter`·`allowsEmptyCollection`·`value`/`defaultValue`/`onChange`·`menuTrigger` 기본 `input`, `useComboBox`의 `inputProps`·`listBoxProps`·`buttonProps`, useFilter `contains` + `sensitivity: "base"`)와 vitest `/vitest-dev/vitest`(`cdp()` from `vitest/browser`, playwright·chromium 전용)로 확인하고 설치본 dist 소스를 읽었다: `useComboBox`는 `useMenuTrigger`·`useSelectableCollection`(가상 포커스, 입력에 키 처리)·`useTextField`를 쓰고, Enter=`commit`, Tab=열려 있으면 `commit` 후 전파 계속, Esc=`revert`, ↓/↑=`open("first"/"last", "manual")`, 열린 동안 `ariaHideOutside([입력, 목록])`, 값 요소 id(`useValueId`)와 설명·오류 자리 id를 `aria-describedby`에 넣는다. 결과 개수는 `LiveAnnouncer`(`role="log"`, assertive)로 `countAnnouncement`(ko-KR 「N개 옵션을 사용할 수 있습니다.」)를 알린다. `useKeyboard`는 `isComposing` keydown을 건너뛴다(`allowComposing` 기본 false). `useComboBoxState`는 열림을 제어하지 않고(`isOpen: undefined`), `close`가 `commitValue`(입력을 고른 옵션 글자로 되돌림)이며 입력을 비우면 값을 `null`로 둔다. `usePopover`는 `isNonModal`이면 `isDismissable: false`, 스크롤 시 `onClose`(`useCloseOnScroll`). `FocusScope` `restoreFocus`는 활성 요소가 body여도 복귀한다. 접근성 패턴은 WAI-ARIA APG Combobox(list autocomplete, 가상 포커스 `aria-activedescendant`)를 따른다.
  - **export 이름**: `Combobox`(입력 `<input role="combobox">`), `ComboboxItem`(`<div role="option">`), `ComboboxSection`(묶음), 타입 `ComboboxProps`·`ComboboxItemProps`·`ComboboxSectionProps`.
  - **구현 결정**:
    - **루트는 입력**: `ref`·`className`·나머지 props(`placeholder`·`readOnly` 등)는 `<input>`에 간다. 감싸개 `<div class="flex w-full">` 안에서 입력 뒤에 chevron 버튼(React Aria `buttonProps`: Tab 순서 밖, 누름에 포커스를 가져가지 않음, 누르면 전체 목록)과 숨은 input이 온다. 버튼은 음수 margin으로 입력 끝 안쪽에 겹쳐 `className`으로 입력 폭을 바꿔도 입력 끝에 붙는다. chevron은 Select와 같은 자리(끝에서 sm 11·md 13·lg 17px), 입력 끝 padding은 chevron + 8px.
    - **Select 규칙 재사용**: `inputSizeClass`·`inputBaseClass`, `listPopupClass`, `ListBoxNodes`, `valueItemCollectionNode`·`sectionCollectionNode`를 그대로 쓰고 공통 모듈은 고치지 않았다.
    - **거르기**: `useFilter({ sensitivity: "base" }).contains`(locale 기준 「포함」, 대소문자·악센트 무시)를 `defaultFilter`로. 글자는 옵션 `textValue`(기본 내용 글자)이고 고른 뒤 입력에 들어가는 글자도 같다. 단일 선택, 자유 입력 없음(포커스가 떠나면 고르지 않은 글자는 지워진다).
    - **결과 없음**: `allowsEmptyCollection: true`로 목록을 닫지 않고 listbox 뒤(같은 표면 안)에 `emptyMessage`(기본 「결과가 없습니다」, `text-muted`, 옵션과 같은 36px)를 둔다. listbox 자식은 option·group만 될 수 있어서다. 개수(0 포함)는 React Aria live region이 알린다.
    - **non-modal 목록**: `usePopoverOverlay({ nonModal: true })` + `OverlayPortal focusManagement={false}`(FocusScope가 바깥 빈 곳 누름 뒤 입력으로 포커스를 되돌리는 것을 막음). `useCloseOnTab`은 쓰지 않는다. 목록 `min-width`는 `min(입력 폭, 100vw − 24px)`: 입력이 화면을 꽉 채우면 목록이 넘쳐, 옵션을 보이려는 스크롤이 문서를 움직이고 non-modal 목록이 닫혔다(재현 후 고침, ADR 0018 덧붙임).
    - **Field 연결(ADR 0013 덧붙임)**: 입력 id = `controlId`(label `for`), `labelId`는 `aria-labelledby`로도 넘겨 목록·버튼 이름에 쓰임, `aria-describedby` = Field 값만(값·설명·오류 빈 자리 id를 덮어씀), `aria-invalid`·`data-invalid`, 네이티브 `disabled`(입력·버튼). `required`는 입력의 네이티브 `required`(`validationBehavior: "native"`).
    - **폼**: `name`·`form`은 숨은 `<input type="hidden">`(고른 옵션 `value`, 비활성이면 disabled)에 붙는다. 입력 글자는 제출되지 않는다. reset은 React Aria `useFormReset`이 `defaultValue`로 돌린다.
    - **한글 IME**: React Aria가 `isComposing` keydown을 건너뛰는 것에 더해, 입력 keydown에서 `isComposing || keyCode === 229`면 React Aria 처리를 부르지 않는다(Safari는 조합을 끝내는 Enter가 compositionend 뒤 `isComposing: false`·keyCode 229로 온다). 거르기는 조합 중에도 바로 된다.
    - **값 API**: `value?: string | null`, `defaultValue?: string`, `onValueChange?(value: string | null)`(입력을 모두 지우면 `null`), `onOpenChange?(open)`. 열림은 제어할 수 없다(`useComboBoxState`가 받지 않음). `emptyMessage?: ReactNode`.
  - **color 결정(ADR 0016 덧붙임)**: 폼 입력 Component(Select와 같은 쪽)라 `color`가 없다.
  - **Token과 대비**: `text-default`·`text-muted` × `bg-canvas`(입력·placeholder·chevron), `border-strong`·`border-danger`·`outline-focus` × `bg-canvas`, `text-muted` × `bg-raised`(결과 없음) 등록과 `bg-disabled`·`text-disabled`·`border-default` 제외를 components `unit`에 4 tests로 단언했다. foundation 대비 쌍은 늘지 않았다.
  - **props 표**(모두 client Component)

    | Component         | 요소                                  | prop                                                                                                                                                                                                                                                                                                                                                                       |
    | ----------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `Combobox`        | `<input role="combobox">`             | `value?: string \| null`, `defaultValue?`, `onValueChange?(value \| null)`, `onOpenChange?(open)`, `emptyMessage?: ReactNode`(기본 `"결과가 없습니다"`), `name?`·`form?`(숨은 input), `size?: "sm" \| "md" \| "lg"`(기본 `md`), `invalid?`·`required?`·`disabled?`(Field 값). input의 `value`·`defaultValue`·`onChange`·`type`·`size`·`children`·`name`·`form`·`list` 제외 |
    | `ComboboxItem`    | `<div role="option">`                 | `value: string`(필수), `disabled?`(기본 `false`), `textValue?`(기본 내용 글자, 거르기·입력 글자). `role` 제외                                                                                                                                                                                                                                                              |
    | `ComboboxSection` | `<div role="presentation">` + `group` | `heading?: ReactNode`, `aria-label?`, `className?`(감싸개)                                                                                                                                                                                                                                                                                                                 |

    상태: 입력 `data-open`·`data-invalid`·`:disabled`, chevron 버튼 `:disabled`, 목록 `data-open`·`data-placement`, 옵션 `data-highlighted`·`data-selected`·`data-disabled`.

  - **테스트**: components browser에 Combobox 88 tests(44 × instance 2): combobox 역할·label for·설명 1개만·aria-autocomplete, chevron Tab 순서 밖·장식 아이콘, aria-label, 치면 열리고 거르기(aria-controls·data-open·포커스 입력 유지), 대소문자·악센트 무시, 결과 없음(listbox 밖 글자·Enter 무시)·`emptyMessage`, live region 개수 안내(en-US·`I18nProvider` ko-KR), 묶음 거르기(빈 묶음 빠짐), ↓ 첫·↑ 마지막(가상 포커스 `aria-activedescendant`), 비활성 건너뛰기·Enter 선택·`onOpenChange(false)`·숨은 input, 거른 목록 선택(치는 동안 위치 없음), 고른 옵션 `data-selected`·체크·↓↑가 고른 옵션에서 시작, chevron 누름 전체 목록·옵션 누름, 열린 동안 chevron 다시 누름은 닫힘 유지(non-modal 확인), hover 위치, 비활성 옵션 누름, Esc 되돌리기, 바깥 누름 닫기·글자 지움·바깥 inert 아님·포커스 되돌리지 않음, Tab 선택 후 다음 요소, 입력 지우면 `null`, **한글 IME**(CDP `Input.imeSetComposition`·`insertText`: 조합 중 거르기, 조합 중 Enter는 `isComposing: true`로 와서 고르지도 되돌리지도 않음, 여러 음절 조합, compositionend 뒤 keyCode 229 Enter 무시), value 제어·부모 미변경, Field 오류·disabled(입력·버튼)·폼 제출(value)·reset·required(제출 막힘·입력 포커스·blur 뒤 풀림), 직접 준 id·invalid 우선, size 3개 높이·padding·글자·radius·chevron 자리가 Select와 같음, className 폭에도 chevron 붙음, focus-field(forced-colors 투명 outline), 경계·chevron muted, portal·dark Theme·z 300·4px·입력보다 넓음, highlight·subtle-active, 결과 없음 muted·36px, 즉시 등장·opacity fast 퇴장, Fragment·배열·textValue, ref·className·props, 타입 오류. unit 대비 4 tests. docs storybook Combobox 8 story(목록 있는 story는 play에서 Tab 후 글자·↓로 열어 highlight까지 a11y 통과, 결과 없음 story는 빈 listbox).
  - **smoke**: page(서버 컴포넌트)의 Field(설명·오류·required) 안에 `Combobox size="lg" name defaultValue` + 묶음·비활성 옵션. `Combobox.js`에 `"use client"`. prerender HTML: 입력이 `role="combobox"`·`aria-expanded="false"`·`aria-autocomplete="list"`·`aria-invalid="true"`·`required`·`value="일본"`, id를 label `for`가 가리키고 `aria-describedby` 2개가 모두 있는 id, 숨은 input `type="hidden"`·`value="jp"`. nodenext에 Props 타입 3개와 `xs`·`open`·`onInputChange` 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 460, icons 18, components 1463(이전 1371), docs 259(이전 251) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 통과(`@tide-tds/components` patch). 「Unexpected token '}'」는 나지 않았다. 실패했다 고친 것: ① 화면 폭을 채운 입력에서 ↓·옵션 누름 때 목록이 닫히고 입력이 지워짐(옵션 `scrollIntoView`가 문서를 가로로 스크롤 → non-modal `useCloseOnScroll`) → 목록 `min-width`를 화면 폭 − 24px로 제한, ② live region은 문구를 이어 붙임 → 마지막 문구로 단언, ③ 고른 옵션이 있으면 ↓·↑ 모두 그 옵션에서 시작 → 단언 수정, ④ required 오류 상태는 고른 즉시가 아니라 blur 때 풀림 → 단언 수정, ⑤ 입력을 지운 직후 바로 치면 React Aria가 다음 렌더에서 입력을 비우는 경합(값 `null` → `resetInputValue`) → Tab 포커스의 전체 선택 위에 바로 치게 바꿈(실사용 속도에서는 나지 않음, 판단 보류 6).
  - **ADR·티켓 어긋남**: 없음. 공통 API 규칙 「ref는 루트 DOM」은 입력 `<input>`이다(감싸개 div·chevron 버튼·숨은 input·portal 목록은 형제나 바깥). 새 ADR은 만들지 않았고 ADR 0013·0016·0018·0019에 덧붙였다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 루트는 입력 `<input>`이고 감싸개 div에는 props가 가지 않는다(입력 폭은 `className`, 감싸개는 `w-full` 고정).
    2. 결과 없음: 목록을 닫지 않고 「결과가 없습니다」(`emptyMessage`)를 listbox 밖에 보인다(React Aria 기본은 닫음).
    3. `onValueChange`는 `string | null`(입력을 모두 지우면 `null`). Select(`string`만)와 다르다.
    4. 열림은 제어하지 않는다(`open`/`defaultOpen` 없음, `onOpenChange`만). 입력 클릭만으로는 열리지 않고 글자·↓↑·chevron으로 연다(`menuTrigger: "input"` 고정).
    5. React Aria 문구(chevron 버튼 이름 「Show suggestions」/「제안 사항 표시」, 목록 이름 「Suggestions」/「제안」, 개수 안내)는 React Aria locale(`I18nProvider`, 없으면 브라우저 언어)을 따른다. Tide가 한국어로 고정하지 않았다.
    6. 페이지 스크롤로 목록이 닫히며 입력이 고른 옵션 글자로 되돌아간다(React Aria non-modal 기본). 지운 직후 1프레임 안에 치면 글자가 지워지는 경합이 있다(React Aria `useComboBoxState`).
    7. 한글 거르기는 「포함」 검사라 조합 중간 글자(「바나나」를 치다 생긴 「반」)에서 잠깐 결과가 줄 수 있고, 초성 검색은 없다. keyCode 229 처리(Safari)는 Chromium에서 CDP로 흉내 내 확인했고 실제 Safari·Windows IME에서는 확인하지 못했다.
    8. 목록 폭은 `min(입력 폭, 100vw − 24px)`(Select는 트리거 폭 그대로).
    9. Tab은 가상 포커스 옵션을 고르고 다음 요소로 간다(React Aria 동작, APG는 Tab 선택을 정하지 않음).
  - **다음 티켓 메모**: non-modal 오버레이는 `focusManagement={false}`로 portal하고, 문서 스크롤에 닫히므로(`useCloseOnScroll`) 목록이 화면 밖으로 넘치지 않게 폭을 제한한다. 한글 IME는 `cdp()`(vitest/browser)의 `Input.imeSetComposition`·`Input.insertText`·`Input.dispatchKeyEvent`(`windowsVirtualKeyCode`)로 실제 composition 이벤트를 만들어 단언할 수 있다(console 확인은 `--silent=false`). React Aria LiveAnnouncer는 `[aria-live="assertive"]`에 문구를 이어 붙이므로 마지막 문구로 본다. 테스트에서 Tab 포커스는 입력 글자를 모두 선택한다. 「Unexpected token」은 이번에 나지 않았다. 다른 세션 테스트와 겹치면 browser run이 매우 느려질 수 있어 `--testTimeout`을 줄여 결과 파일로 받았다.
- 2026-11-11 flaky 테스트 원인과 수정(브랜치 `fix-flaky-overlay-tests`, main 84ec960 위). 테스트만 바꿨고 제품 코드는 그대로다.
  - **증상**: Release run 43005291973 attempt 1의 `chromium-forced-colors`에서 「닫기와 자유 입력 없음 > Tab은 가상 포커스의 옵션을 고르고 닫으며 포커스는 다음 요소로 간다」가 `expect.poll(activeOption).toBe(byTestId("grape"))`에서 `Matcher did not succeed in time`으로 실패했다. 받은 값은 `data-highlighted`인 사과(apple) 옵션이다. 「포」로 거른 목록이면 사과는 없어야 하므로, 거르지 않은 전체 목록이 열린 상태였다.
  - **원인**: 테스트가 `userEvent.keyboard("포{ArrowDown}")`로 두 입력을 붙여 보냈다. vitest 5.1.0 `@vitest/browser-playwright`는 US 자판 밖 글자를 `page.keyboard.insertText`로, `ArrowDown`을 곧바로 `page.keyboard.down`으로 보낸다(설치본 `dist/index.js` `keyboardImplementation`). 입력으로 목록을 여는 것은 react-stately 3.51.0 `useComboBoxState`가 입력 값을 바꾼 render 뒤 `useEffect`에서 `open(null, 'input')`을 불러 하므로, 그 render가 끝나기 전에 ↓ keydown이 도착할 수 있다. 그때는 아직 닫혀 있어 react-aria 3.53.1 `useComboBox`의 ArrowDown이 `state.open('first', 'manual')`을 부르고, `open`은 `trigger === 'manual'`이고 닫혀 있으면 `setShowAllItems(true)`로 거르지 않은 전체 목록을 연 뒤 첫 옵션(사과)에 간다. 실험: 같은 입력을 60번 반복하며 ↓ keydown 시점의 `aria-expanded`를 기록하니 부하 없이도 1/60이 닫힌 상태에서 도착했고, 그 1번이 정확히 사과 활성으로 끝났다.
  - **제품 버그인가**: 아니라고 판단했다. React Aria/Stately의 설계(입력 뒤 effect로 열기)이고, 사람이 글자를 친 뒤 같은 render 전(수 ms 안)에 ↓를 누를 수는 없다. Tide 코드로 바꿀 부분도 아니다.
  - **수정**: 「포」를 친 뒤 `expect.poll(optionNames).toEqual(["포도"])`로 거른 목록이 열린 것을 확인하고 나서 `{ArrowDown}`을 따로 보낸다. 단언하는 동작(↓로 포도에 가고 Tab이 포도를 고름)은 그대로다. 다른 테스트에 글자와 탐색 키를 한 호출로 붙여 보내는 곳은 없었다(`keyboard("글자{키}")` 검색, 글자 다음 줄에서 기다림 없이 Arrow·Enter를 보내는 곳도 없음).
  - **반복 결과**: CPU 코어 10개에 busy loop 10개를 건 부하에서, 수정 전 코드(Tooltip·Combobox 두 파일)는 10회 중 1회 Tooltip이 CI와 같은 단언(108행)으로 실패했다. 수정 후 Tooltip·Combobox·Popover·Menu·Select·Dialog 여섯 파일(두 instance, 406 tests)을 같은 부하에서 20회 돌려 0회 실패. `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과(components 1580 tests). 테스트만 바꿨지만 `scripts/check-changesets.ts`가 `packages/*` 변경에 changeset을 요구하므로 empty changeset(`.changeset/fix-flaky-overlay-tests.md`)을 넣었다(티켓 11 선례).
