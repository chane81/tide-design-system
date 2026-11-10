# 17: Switch

Status: done
Blocked by: 15 (Field와 Input·Textarea)

## What to build

앱 개발자가 켜고 끄는 설정을 `Switch`로 쓴다. 네이티브 요소라 form 제출이 그대로 되고, 스크린리더는 스위치로 읽는다.

## 수용 기준

- [x] 네이티브 요소 기반이고 hook을 쓰지 않는다. 스위치 역할로 읽힌다.
- [x] thumb는 `shadow-sm`을 쓴다. 상태 변화는 `transition-colors`(`fast`)다.
- [x] Field와 함께 label·설명을 붙일 수 있다.
- [x] 조작 영역이 24×24px 이상이다. 포커스 표시는 `focus-ring`이다.
- [x] `browser`: 역할·이름·켜짐 상태, Space 토글, 제어/비제어, disabled, forced-colors에서 켜짐 상태가 구분되는지 단언한다.

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

- 2026-11-10 완료(브랜치 `ticket-17-switch`, 티켓 15 브랜치 04f7e1a 위).
  - **근거 버전**: react 19.3.1, tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, vitest-browser-react 2.3.0, storybook 10.6.6, typescript 7.0.2. react-aria·react-stately는 쓰지 않는다(ADR 0004, 네이티브 요소). 새 의존성은 없고 `minimumReleaseAge`는 그대로다.
  - **API 확인**: v4의 `peer-*`·`has-*`가 pseudo-class variant와 조합된다는 것(`has-checked`), variant가 왼쪽에서 오른쪽으로 쌓인다는 것, `rtl` 선택자(`:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)`), `forced-colors:` variant와 `forced-color-adjust-none`은 context7 `/tailwindlabs/tailwindcss.com`(hover-focus-and-other-states.mdx, upgrade-guide.mdx, forced-color-adjust.mdx). Tide `@theme`이 `inline`이라 요소에서 바꾼 `--tide-*` 변수를 utility가 바로 쓴다는 것은 빌드한 `foundation/dist/tailwind.css`로 확인했다. forced-colors 기본 동작(배경을 Canvas로, 경계를 CanvasText로 덮음)은 Chromium 실험 테스트로 확인하고 지웠다.
  - **구조**([ADR 0015](../../../decisions/0015-switch-label-root-input-ref.md)): 루트 `<label>` 안에 track(네이티브 `<input type="checkbox" role="switch">`, `appearance-none`), thumb(`aria-hidden` span, `peer-*`), `children` label. `ref`와 HTML 속성은 input에(form 라이브러리 `register`용), `className`·`style`·`data-color`·`data-disabled`·`data-invalid`는 루트 label에 붙는다. 공통 규칙 「ref는 루트 DOM 요소」의 예외라 ADR로 남겼다. `type`·`role`은 `Omit`.
  - **Field 연결**: `useFieldControl`을 읽으므로 `"use client"`. Field 안에서는 Field `<label for>`가 이름, 설명·오류는 `aria-describedby`, `aria-invalid`·`data-invalid`·`required`·`disabled`를 받는다. Field와 `field-context.ts`는 고치지 않았다(읽기만).
  - **props 표**:

    | prop                | 타입·값                                                      | 기본값                | 비고                                                                                      |
    | ------------------- | ------------------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------- |
    | `children`          | `ReactNode`                                                  | —                     | label 텍스트. Field 안에서는 비운다                                                       |
    | `size`              | `"sm" \| "md" \| "lg"`                                       | `"md"`                | `xs`는 타입 오류                                                                          |
    | `color`             | `Role`                                                       | `"primary"`           | 켜진 track 색. 루트 `data-color`. 색 계열 이름은 타입 오류                                |
    | `invalid`           | `boolean`                                                    | Field 값 또는 `false` | `aria-invalid`·`data-invalid`, 꺼진 경계 danger                                           |
    | `className`·`style` | —                                                            |                       | 루트 label. 기본 class를 이긴다                                                           |
    | 나머지              | `ComponentProps<"input">`(`type`·`role`·`size`·`color` 제외) |                       | `ref`, `name`, `value`, `checked`/`defaultChecked`, `onChange`, `disabled`, `required` 등 |

  - **size별 값**: track(border 1px 포함) 28×16 / 36×20 / 44×24px, thumb 10 / 14 / 18px, thumb 여백 2px(border 포함 3px, `start-0.75 top-0.75`), 켜짐 이동 12 / 16 / 20px(`translate-x-3/4/5`, RTL은 음수), label `text-label-sm/md/lg`, 간격 `gap-1.5/2/2.5`. 루트 `min-h-6`이라 `sm`도 누르는 영역이 24×24px 이상. radius `full`.
  - **색**: 꺼짐 track 투명 배경 + `border-strong`, thumb `text-muted`(`bg-current`). 켜짐 track `bg-accent-solid` + `border-accent`, thumb `text-accent-on-solid`. 켜짐·비활성은 `checked:enabled:`/`peer-checked:peer-enabled:`로 나눠 CSS 순서에 기대지 않는다. 비활성 `bg-disabled`·`border-default`·`text-disabled`, cursor `not-allowed`(활성 `pointer`, track과 label 모두). 쓰는 Token은 모두 등록된 대비 쌍(`border-strong`·`border-<role>`·`border-danger`·`outline-focus` × 표면 층 3, `text-muted` × 표면 층 4.5, `text-on-solid` × `bg-<role>-solid` 4.5)이거나 제외 목록(disabled, `border-default`)이라 foundation 대비 쌍을 더하지 않았다. 켜진 track의 표면 대비는 `border-accent`(border 슬롯, 3:1 규칙)가 맡는다. hover 색은 두지 않았다.
  - **color 지원**: 처음 `Color`(색 계열 포함)로 만들었다가 같은 날 사용자 결정(행동·의미 Component의 `color`는 Role만, Atlassian 방식)에 따라 `Role`로 좁혔다. `data-color` + accent class 방식은 그대로다. 색 계열 테스트·story는 없다. **티켓 41에서 Role 타입이 앱 Role(`RoleRegistry` augmentation)까지 넓어지면 따라간다.**
  - **motion**: track은 `transition-colors`(fast 150ms, out). thumb은 `transition-colors`에 `motion-safe:transition-[color,background-color,translate]`를 더해 이동은 움직임 줄이기가 아닐 때만 미끄러진다. 줄이기에서는 위치가 바로 바뀌고 색 전환은 남는다(opacity로 바꿀 대상이 아니라 판단).
  - **forced-colors**: 기본 동작은 배경을 Canvas로 덮어 켜진 track과 thumb이 사라진다. track·thumb만 `forced-color-adjust-none`으로 두고 Token 변수를 시스템 색으로 바꾼다: 켜짐 track `Highlight` + thumb `HighlightText`, 꺼짐 `CanvasText` 경계·thumb, 비활성 `GrayText`, 포커스 outline `Highlight`. 상태 class를 다시 적지 않아 우선순위 문제가 없다.
  - **테스트**: components browser 438 tests(이전 362, Switch 38 × instance 2). 역할·이름(children, aria-label, Field label), thumb 숨김, label 클릭 토글, Tab·Space, 비제어·제어·제어 고정, form 제출(꺼짐 미포함, 기본 `on`, `value`), disabled(포커스 안 받음, 토글 안 됨, cursor, `data-disabled`), Field 설명·오류·required·disabled 연결, Field 밖 `invalid`·`aria-describedby`, size 3개 track·thumb·여백·이동 끝 위치·텍스트 스타일, 24×24 영역, `xs`·`"gray"` `@ts-expect-error`, RTL, Role 6개 켜진 색, `data-color` 비상속, disabled 색, shadow-sm, focus-ring(2px, offset 2px, 색), 마우스 포커스에 링 없음, transition fast, reduced-motion에서 translate 빠짐, forced-colors 켜짐·꺼짐 구분(채움, 위치, 경계, 시스템 색). forced-colors class·RTL class·`motion-safe:`·`role="switch"`를 각각 빼면 해당 테스트가 실패함을 확인하고 되돌렸다. docs storybook에 Switch 11 story(a11y `error`, Don't 「label 없이」만 off).
  - **smoke**: page에 `<Switch name="news" defaultChecked>`(서버 컴포넌트에서 children label), `Switch.js`에 `"use client"`가 있는지, 출력 CSS에 `peer-checked:translate-x-4`가 있는지(@source), nodenext `SwitchProps`와 `xs`·`"gray"` 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 433, icons 18, components 438, docs 115 tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(`@tide-tds/components` patch).
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. ADR 0015의 `ref`(input) / `className`(루트 label) 분리. Checkbox·Radio(16)와 맞춰야 한다.
    2. 꺼짐 모양을 「투명 track + 회색 경계 + 회색 thumb」(Fluent·M3 방식)으로 했다. 「회색 채운 track + 흰 thumb」(iOS 방식)은 dark에서 흰 thumb과 회색 track의 대비 쌍이 등록되어 있지 않다.
    3. 켜진 track 경계를 `border-accent`로 둬 dark에서 solid보다 밝은 테두리가 보인다(표면 대비 3:1을 위해).
    4. ~~hover 색 변화를 두지 않았다.~~ 같은 날 사용자 피드백으로 더했다(아래).
    5. Field 안 배치는 Field 규칙대로 label 위, 스위치 아래다(가로 배치 없음).
  - **다음 티켓 메모**: 16(Checkbox·Radio)이 자기 label을 children으로 받는다면 ADR 0015 구조(루트 label, input에 ref)를 쓸 수 있다. smoke page의 Input 주석이 내부 class 이름(`aria-invalid:border-danger` 등)을 적고 있어 Tailwind가 page에서도 스캔한다. 그 @source 검사는 실제로는 page 주석으로도 통과할 수 있다(티켓 15 확인 필요).
- 2026-11-10 사용자 피드백 반영: hover 시 약간의 색 변화를 둔다.
  - **API 확인**: tailwindcss 4.3.5의 `hover`(와 `group-hover`)는 `@media (hover: hover)` 안에서 컴파일된다(context7 `/tailwindlabs/tailwindcss.com` upgrade-guide.mdx 「Hover styles on mobile」). 이름 붙인 group(`group/{name}`, `group-hover/{name}:`)과 `not-*` variant도 같은 문서(hover-focus-and-other-states.mdx, v4 blog)로 확인했다. 테스트 환경(Playwright Chromium headless)에서 `matchMedia("(hover: hover)")`가 `true`임을 테스트로 단언한다.
  - **결정**: 루트 label에 `group/switch`를 붙이고 track·thumb이 `group-hover/switch:`·`group-active/switch:`로 반응한다(label을 눌러도 토글되므로 label 전체가 hover 영역). 이름 없는 `group`은 바깥 요소의 `group` hover에도 반응해서 이름을 붙였다. 활성(`:enabled`)일 때만 붙고, 색 전환은 기존 `transition-colors`(fast)다.
    - 켜짐: track `bg-accent-solid-hover`, 누름 `bg-accent-solid-active`(Button solid와 같은 규칙). thumb `text-accent-on-solid` × solid 3단계 4.5:1은 등록된 쌍이다(Role 대비 쌍과 색 이름 규칙 모두).
    - 꺼짐: track 투명 → `bg-neutral-subtle-hover`, 누름 `bg-neutral-subtle-active`(Button ghost의 「hover subtle-hover, 누름 subtle-active」를 neutral로). thumb은 `text-muted` → `text-default`로 바꿔 등록된 쌍(`text-default` × `bg-neutral-subtle` 3단계 4.5:1) 안에 남긴다. `text-muted` × neutral subtle은 등록되어 있지 않다. 경계 `border-strong`은 바깥 표면과의 대비(3:1, 등록)라 그대로 둔다. 경계를 한 단계 진하게 하는 안은 `border-strong`보다 진한 경계 Token이 없어 쓰지 않았다. foundation은 고치지 않았다.
    - 비활성: 변화 없음.
    - forced-colors: hover·누름이 쓰는 변수(`--tide-accent-solid-hover`/`-active` → `Highlight`, `--tide-bg-neutral-subtle-hover`/`-active` → `Canvas`, thumb `--tide-text-default` → `CanvasText`)도 같은 시스템 색으로 바꿔 hover에서도 모양이 바뀌지 않는다.
  - **테스트**: components browser 452 tests(Switch 45 × instance 2). hover 지원 단언, 켜짐 hover·누름(label 텍스트에 hover, `mouseDownOn` 명령으로 `:active` 유지), 꺼짐 hover·누름(thumb `text-default`, 경계 그대로), track에 올려도 같은 색, 비활성 켜짐·꺼짐에서 hover·누름 변화 없음, 바깥 `group` 요소 hover에 반응하지 않음. forced-colors instance에서는 hover·누름에도 `Highlight`/`HighlightText`/`Canvas`/`CanvasText`가 그대로인지 본다. 루트 group을 빼면 4개, 이름 없는 `group`으로 바꾸면 바깥 group 테스트가 실패함을 확인하고 되돌렸다.
  - **문서**: MDX 「켜고 끄기」에 hover·누름 문장을 더했다(hover는 정적 story로 보일 수 없어 story는 더하지 않았다).
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 433, icons 18, components 452, docs 115 tests, smoke 「smoke 통과」, publint 「All good!」.
- 2026-11-10 티켓 16 위로 rebase, hover 통일과 41 맞춤(코디네이터가 전한 사용자·메인 결정).
  - **rebase**: 티켓 15·16(둘 다 main 위로 다시 올림) 위로 `git rebase --onto ticket-16-checkbox-radio 04f7e1a`로 올려 15 → 16 → 17이 한 줄이 됐다. 충돌은 components `index.ts`(Checkbox류 다음에 Switch export, 타입 export는 main 목록 유지), smoke `page.tsx`(Field group 묶음과 Switch를 모두 form 안에), `nodenext.ts`(import·props·values를 양쪽 모두), `smoke.ts`(`"use client"` 파일 목록에 Checkbox류와 `Switch.js`를 모두), `docs/principles/README.md`(ADR 0013·0015·0016 순서)였다. ADR 0015 파일이 들어와 티켓 16 문서의 0015 링크가 살아나고 Checkbox·Radio 주석의 ADR 0015 참조도 이 브랜치 안에서 맞는다.
  - **hover 통일**: 꺼짐 hover·누름을 Checkbox·Radio(티켓 16) 규칙에 맞췄다. 꺼짐 track hover `bg-neutral-subtle-hover` → `bg-accent-subtle`, 누름 `bg-neutral-subtle-active` → `bg-accent-subtle-active`, 경계 `border-strong`은 그대로. 켜짐은 그대로 `bg-accent-solid-hover`/`-active`이고, Checkbox·Radio도 같은 누름(`-active` 슬롯)을 더해 셋이 같다.
  - **thumb 대비**: 꺼짐 hover·누름 thumb을 `text-default` → `text-accent`로 바꿨다. accent subtle 위에 등록된 글자 쌍은 색 이름의 text × 같은 색 subtle 3단계 4.5:1(Role 대비 쌍 `text-<role>` × `bg-<role>-subtle`/`-hover`/`-active`, neutral은 text 슬롯이 `text-default`라 `text-default` × `bg-neutral-subtle` 3단계, 앱 Role은 `tide-color`의 `colorContrastRules`)뿐이다. `text-default`·`text-muted` × `bg-<role>-subtle`은 등록되지 않았다. hover가 없는 터치 기기에서도 누르는 동안 맞도록 thumb 규칙을 `group-active/switch:`에도 붙였다. forced-colors 변수도 `--tide-accent-subtle`/`-active` → `Canvas`, `--tide-accent-text` → `CanvasText`로 바꿨다.
  - **41 맞춤**: `color`는 이미 `Role`이다. JSDoc을 「Role(Tide Role 6개와 앱이 `RoleRegistry`에 더한 Role)」로 고쳤다. 테스트에 `RoleRegistry { brand: true }` augmentation, `color: "blue"`·`"gray"` 타입 오류와 `"brand"` 통과, 앱 Role 계산색(켜진 track 배경·경계 `#7c3aed`, thumb 흰색)을 더했다. MDX 「켜진 색 고르기」에 앱 Role 안내를 더했다. changeset은 이미 「Role」이다.
  - **테스트**: 꺼짐 hover·누름 단언을 primary subtle·subtle-active와 thumb `text-primary`(누르는 동안 포함)로 바꾸고, `color="neutral"` 꺼짐 hover(neutral subtle 위 `text-default` thumb)를 더했다.
  - **로컬 검증**: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm format:check`, dist·storybook-static 삭제 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 436, icons 18, components 608, docs 156 tests, 「smoke 통과」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(새 changeset 3개).
