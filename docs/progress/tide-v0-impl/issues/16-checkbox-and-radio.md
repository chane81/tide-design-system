# 16: Checkbox와 Radio

Status: done
Blocked by: 08 (아이콘 패키지), 15 (Field와 Input·Textarea)

## What to build

앱 개발자가 네이티브 `Checkbox`와 `Radio`를 Tide 스타일로 쓰고, 묶음을 Field로 감싸 label·설명·오류를 붙인다. Checkbox는 indeterminate 상태도 보여 준다.

## 수용 기준

- [x] 네이티브 `input[type=checkbox|radio]`를 쓰고 hook을 쓰지 않는다.
- [x] Checkbox 체크와 indeterminate 표시는 아이콘 패키지의 아이콘을 쓴다(장식용).
- [x] 묶음을 Field로 감싸면 그룹 이름, 설명, 오류가 연결된다.
- [x] 조작 영역이 24×24px 이상이다.
- [x] 포커스 표시는 `focus-ring`이다.
- [x] `browser`: 역할·이름, 체크·indeterminate 상태, Space 토글, Radio 화살표 이동(네이티브), 그룹 연결, disabled, forced-colors에서 체크 표시가 보이는지 단언한다.

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

- 2026-11-10 완료(브랜치 `ticket-16-checkbox-radio`, 티켓 15 브랜치 04f7e1a 위).
  - **근거 버전**: react·react-dom 19.3.1, tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, vitest-browser-react 2.3.0, storybook 10.6.6, next 16.4.5, typescript 7.0.2. react-aria·react-stately는 쓰지 않는다(ADR 0004, 네이티브 요소). 새 의존성은 없고 `minimumReleaseAge`는 그대로다. 아이콘은 이미 의존하던 `@tide-tds/icons`의 `CheckIcon`, `MinusIcon`, `CircleIcon`이다.
  - **API 확인**: Tailwind `indeterminate:`·`checked:`·`peer-*`·`has-*`(pseudo-class와 조합)·`not-*`·`forced-colors:` variant는 context7 `/tailwindlabs/tailwindcss.com`(hover-focus-and-other-states.mdx, v4 blog)와 설치본 `tailwindcss/dist/lib.js`(4.3.5, `checked` 다음에 `indeterminate`, `enabled` 다음에 `disabled` 등록)로 확인했다. `useLayoutEffect`는 서버에서 실행되지 않고(react.dev useLayoutEffect Caveats), 설치본 react-dom 19.3.1 cjs에 서버 경고 문자열이 없다. `toBePartiallyChecked`(input `indeterminate` 지원), `toBeChecked`, `userEvent.keyboard`·`hover`·`click(element, { position })`은 context7 `/vitest-dev/vitest`(docs/api/browser). MDX `<ArgTypes of={component}>`는 context7 `/storybookjs/storybook` MIGRATION.md.
  - **구조**([ADR 0015](../../../decisions/0015-switch-label-root-input-ref.md), 티켓 17. 티켓 17 브랜치를 이 브랜치 위로 올려 ADR 파일이 함께 들어온다): 루트 `<label data-color data-disabled data-invalid>` → 24×24 조작 영역 `<span grid>` → 네이티브 `<input class="peer appearance-none">`(상자) + 장식 아이콘(`aria-hidden`) → 글자 `<span>`. `ref`와 HTML 속성은 input에, `className`·`style`은 루트 label에 간다. 처음에는 같은 내용을 ADR 0014로 따로 쓰려 했으나 Switch가 ADR 0015로 먼저 정해 그것을 따르고 0014는 만들지 않았다(첫 구현 커밋 메시지의 「ADR 0014」는 main 위 rebase 때 지웠고, 주석은 「Switch 구조(ADR 0015)에 맞춤」 커밋에서 정정).
  - **Field 정정**([ADR 0013 정정](../../../decisions/0013-field-props-and-context-connection.md#정정)): Field에 `group?: boolean`(기본 `false`). `group`이면 label이 `for` 없는 `<span id={labelId}>`이고, 묶음이 `aria-labelledby={labelId}`, `aria-describedby={describedBy}`, `id={controlId}`를 받는다. `fieldset`/`legend`는 루트 요소 타입이 바뀌고 legend 렌더링이 flex 배치와 맞지 않으며 fieldset `aria-describedby` 지원이 고르지 않아 버렸다. 묶음은 안쪽 Field context를 `null`로 덮어 항목 id가 겹치지 않게 하고, 전용 context(`choice-group.ts`)로 상태를 넘긴다. `aria-invalid`는 각 input에, 묶음 루트에는 `data-invalid`만.
  - **props 표**:

    | Component       | prop                                                    | 타입·값                                     | 기본값                | 비고                                                              |
    | --------------- | ------------------------------------------------------- | ------------------------------------------- | --------------------- | ----------------------------------------------------------------- |
    | `Checkbox`      | `children`                                              | `ReactNode`                                 | —                     | 이름. 없으면 `aria-label`                                         |
    |                 | `size`                                                  | `"sm" \| "md"`                              | `"md"`                | `xs`·`lg`는 타입 오류                                             |
    |                 | `color`                                                 | `Role`                                      | `"primary"`           | 루트 `data-color`, accent class                                   |
    |                 | `indeterminate`                                         | `boolean`                                   | `false`               | `input.indeterminate`를 layout effect로 매 렌더 맞춤              |
    |                 | `invalid`                                               | `boolean`                                   | Field·묶음 값/`false` | `aria-invalid`·`data-invalid`                                     |
    |                 | `className`·`style`                                     | —                                           |                       | 루트 label                                                        |
    |                 | 나머지                                                  | `ComponentProps<"input">`(`type` 제외)      |                       | `ref`, `checked`/`defaultChecked`, `onChange`, `name`, `value`    |
    | `Radio`         | `value`                                                 | `string`(필수)                              | —                     |                                                                   |
    |                 | `children`·`size`·`color`·`invalid`·`className`·`style` | Checkbox와 같음                             |                       |                                                                   |
    |                 | 나머지                                                  | `ComponentProps<"input">`                   |                       | 묶음 밖에서는 `name`·`checked`/`defaultChecked`를 직접            |
    | `CheckboxGroup` | `orientation`                                           | `"vertical" \| "horizontal"`                | `"vertical"`          | `role="group"`                                                    |
    |                 | `invalid`·`disabled`                                    | `boolean`                                   | Field 값/`false`      | 안의 Checkbox로 넘김(직접 준 값이 이김). `required`는 넘기지 않음 |
    | `RadioGroup`    | `name`                                                  | `string`                                    | 자동(`useId`)         | `role="radiogroup"`                                               |
    |                 | `value`/`defaultValue`/`onValueChange`                  | `string`/`string`/`(value: string) => void` | —                     | spec 공통 규칙(콜백 인자 하나)                                    |
    |                 | `orientation`·`invalid`·`disabled`                      | CheckboxGroup과 같음                        |                       |                                                                   |
    |                 | `required`                                              | `boolean`                                   | Field 값/`false`      | 각 Radio `required`, 묶음 `aria-required`                         |
    | `Field`         | `group`                                                 | `boolean`                                   | `false`               | 위 「Field 정정」                                                 |

  - **size별 값**: 상자(원) `sm` 16px·`md` 20px, 체크·가로줄 아이콘 12/16px(선 3), 라디오 점 `CircleIcon` 6/8px 채움. 조작 영역은 두 size 모두 24×24px(span `size-6`, label 안이라 상자 밖 여백을 눌러도 바뀜). 글자 `sm` `body-sm`(14/20, 위아래 2px), `md` `body-md`(16/24). 상자와 글자 간격 8px. Checkbox radius `sm`(4px), Radio `full`. 묶음 세로 `gap-2`, 가로 `gap-x-6 gap-y-2` + 줄바꿈.
  - **색·대비**: 선택 전 `border-strong` + `bg-canvas`, 선택 후 `border-accent` + `bg-accent-solid`, 표시 `text-accent-on-solid`, 오류 `border-danger`(체크 상태에서도 이김, tailwind 4.3.5 variant 순서를 테스트로 확인). solid × 표면 층은 dark에서 3:1 미만(primary 2.88, danger 2.62)이라 선택한 상자 경계를 등록된 `border-accent`(× 표면 층 3:1)가 맡는다. 쓰는 Token은 모두 이미 등록된 대비 쌍이거나 제외 목록(disabled)이라 foundation 대비 쌍은 더하지 않았다.
  - **hover**(사용자 피드백 반영): label 전체(`group/choice`)에 올리면 활성 상태에서만 바뀐다. 체크됨·indeterminate `bg-accent-solid-hover`(on-solid × solid-hover 등록), 체크 전 `bg-accent-subtle`(경계 `border-strong`은 그대로라 오류 경계를 가리지 않음). group-hover가 `checked:`보다 우선순위가 높아 체크 전 규칙에 `not-checked:not-indeterminate:`를 붙였다. Switch(티켓 17)의 hover class는 작성 시점 브랜치에 아직 없어 맞추지 못했다.
  - **포커스·forced-colors**: `focus-visible:focus-ring`(ring, 상자 둘레). forced-colors에서는 svg가 UA 스타일 `forced-color-adjust: preserve-parent-color`라 흰 표시가 Canvas 위에서 사라졌다(Chromium 확인). Switch와 같이 상자·표시만 `forced-color-adjust-none`으로 두고 Token 변수를 시스템 색으로 바꿨다(선택 상자 `Highlight`, 표시 `HighlightText`, 선택 전 경계 `CanvasText`, 배경 `Canvas`, 비활성 `GrayText`, 포커스 `Highlight`).
  - **indeterminate**: HTML 속성이 없어 `useLayoutEffect`로 매 렌더 `input.indeterminate`를 prop 값으로 맞춘다(누르면 브라우저가 지우므로 앱이 다시 계산해 넘김). 서버 HTML에는 반영되지 않고 hydration 뒤 맞는다. `aria-checked`는 붙이지 않는다(네이티브가 mixed로 노출).
  - **"use client"**: `Checkbox`, `Radio`, `CheckboxGroup`, `RadioGroup`, `choice-group.ts`(context). `choice-style.ts`와 `Field.tsx`에는 없다. smoke가 확인한다.
  - **color**: 코디네이터가 전한 사용자 결정에 따라 `color`는 `Role`만 받는다(색 계열 이름은 타입 오류, smoke nodenext `@ts-expect-error`). 티켓 41에서 Role 타입이 앱 Role까지 넓어지면 따라간다. 색 계열 이름 테스트·story는 만들지 않았다.
  - **테스트**: components browser에 `Checkbox.test.tsx`·`Radio.test.tsx`(× instance 2). 역할·이름, 아이콘 숨김, Space·클릭 토글, 제어, form 제출, indeterminate(`toBePartiallyChecked`, 아이콘 교체, 전체 선택 패턴에서 클릭 뒤 재계산), disabled(DOM click에도 안 바뀜, cursor), 크기(상자·조작 영역 24×24·글자·아이콘·radius, 상자 밖 여백 클릭), 타입 오류, 색(Role Token 계산값), 오류 경계(체크 상태 포함), hover 계산색(체크됨·체크 전·indeterminate·비활성 불변·forced-colors Canvas), focus-ring, transition fast, forced-colors(Highlight·HighlightText·CanvasText), 루트 style·data-*, ref·className, Field group 묶음(이름·설명 순서·id·aria-invalid 위치·label이 span), Field disabled·required(CheckboxGroup은 required 안 넘김, RadioGroup은 넘기고 제출 차단), 화살표 이동·Tab 한 번·Space 선택·onValueChange 값. `focus-visible:focus-ring`을 빼면 4개, hover class를 빼면 2개가 실패함을 확인하고 되돌렸다. docs storybook에 Checkbox 11·Radio 10·Field 「묶음」 1 story(a11y `error`, 끈 것 없음).
  - **smoke**: page에 Field group + RadioGroup·CheckboxGroup(indeterminate 포함). prerender HTML에서 radiogroup `aria-labelledby`가 `<span id>`를 가리키고 묶음 id를 가리키는 `for`가 없음, `aria-describedby` 2개, 같은 `name`, 하나만 `checked`, 각 Radio `aria-invalid`·`required`를 확인. 내부 class(`checked:bg-accent-solid`, `.peer-indeterminate:block`) CSS 존재, `"use client"` 파일 목록, Check·Minus 아이콘 도형 포함, nodenext 타입(`RadioProps` value 필수, `color: "gray"` 오류). 코디네이터 지적대로 page 주석에서 `@source` 검사 대상 class 이름(Input의 `aria-invalid:border-danger`·`placeholder:text-muted`, Spinner의 `animate-spin`)을 지웠다(주석도 Tailwind 스캔 대상).
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 433, icons 18, components 466(이전 362), docs 125(이전 104) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(`@tide-tds/components` patch). 첫 실행에서 `choiceInputClass`(문자열 이어 붙이기)에 `isolatedDeclarations` 타입 주석이 없어 tsdown d.ts 생성이 실패했다(`tsc --noEmit`은 통과). 주석을 달고 다시 통과했다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. size를 `sm`/`md` 둘만 두었다(Input류 높이 규칙과 무관하게 상자 16/20px). `lg`가 필요하면 상자 24px로 더할 수 있다.
    2. CheckboxGroup은 선택 값을 모으지 않는다(`value: string[]` 없음). 각 Checkbox가 `checked`/`onChange`를 가진다. RadioGroup만 `value`/`defaultValue`/`onValueChange`다.
    3. CheckboxGroup에서 `required`는 label `*`만 보이고 검사는 앱이 한다.
    4. 체크 전 hover는 경계를 바꾸지 않고 `bg-accent-subtle` 배경만 깐다. Switch와 class 조합을 맞출지 확인이 필요하다.
    5. 항목별 설명 텍스트(label 아래 보조 문구)는 v0에 넣지 않았다.
    6. 단일 Checkbox를 Field 안에 두면(그룹 없이) Field label과 자기 label이 함께 이름이 된다(「약관 동의합니다」). 오류 메시지가 필요할 때만 쓰는 용도로 두었다.
- 2026-11-10 main(티켓 41) 위로 rebase, 누름 색 추가(코디네이터가 전한 사용자 결정).
  - **rebase**: 새 티켓 15 브랜치(main 위) 위로 `git rebase --onto`로 올렸다. 충돌은 components `index.ts`(Field류·IconButton·Link와 Checkbox류 export를 모두 두고, 타입 export는 `Color, ColorFamilyName, ColorFamilyRegistry, FillVariant, Role, RoleRegistry, Size` 유지), smoke `page.tsx`·`nodenext.ts` import 목록(IconButton·Link와 Checkbox류를 모두 이름순으로)이었다. 첫 구현 커밋 메시지의 잘못된 「ADR 0014」는 rebase 중 `exec git commit --amend`로 지웠다.
  - **41 맞춤**: `color`는 이미 `./types.ts`의 `Role`이다. `Checkbox.test.tsx`·`Radio.test.tsx`에 `RoleRegistry { brand: true }` augmentation, `color: "blue"` 타입 오류·`"brand"` 통과 단언, 앱 Role 계산색 테스트(`colorFamilyCss`로 넣은 `brand`가 체크한 상자 배경·경계 `#7c3aed`)를 더했다. changeset·MDX는 이미 「Role」이다.
  - **누름**: hover보다 한 단계 진한 `-active` 슬롯으로 Switch(티켓 17)와 맞춘다. 체크됨·indeterminate `bg-accent-solid-active`(on-solid × solid-active 4.5:1 등록), 체크 전 `bg-accent-subtle-active`. 활성 상태에서 label 전체(`group-active/choice`)에 반응한다. group-active가 group-hover보다 뒤에 만들어져 누르는 동안 이긴다(계산값 테스트로 확인). forced-colors에서는 `--tide-accent-solid-active`를 Highlight, `--tide-accent-subtle-active`를 Canvas로 바꿔 모양이 바뀌지 않는다. 테스트는 `commands.mouseDownOn`으로 누른 채 계산값을 읽는다. 누름 class를 빼면 2개가 실패함을 확인하고 되돌렸다. 판단 보류 4번(체크 전 hover)은 이 규칙으로 정해졌고, Switch 꺼짐 hover가 이쪽(`bg-accent-subtle`, 경계 그대로)을 따른다.
