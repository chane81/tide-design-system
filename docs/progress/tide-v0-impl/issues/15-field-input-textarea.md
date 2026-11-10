# 15: Field와 Input·Textarea

Status: done
Blocked by: 07 (motion·z-index Foundation), 12 (0.1.0 첫 publish)

## What to build

앱 개발자가 `Field`로 입력창에 label, 설명, 오류 메시지를 붙이면 `id`, `aria-describedby`, `aria-invalid`가 자동으로 연결된다. `Input`·`Textarea`는 네이티브 요소라 form 제출과 브라우저 기본 동작이 그대로 되고, `<input type="date">`도 Input 스타일로 쓴다. 스크린리더 사용자는 오류 메시지를 입력창과 함께 듣는다.

## 수용 기준

- [x] Field는 label, 설명, 오류 메시지를 붙이고 `id`, `aria-describedby`, `aria-invalid`를 자동 연결한다. 이후 Select, Combobox, Checkbox 그룹에서도 쓸 수 있는 구조로 만든다.
- [x] Input·Textarea는 네이티브 요소이고 hook을 쓰지 않는다. `disabled`, `readOnly`, `required`, `invalid` DOM 이름 prop을 쓴다.
- [x] size는 `sm`/`md`/`lg`만 받는다(`xs`는 타입 오류). 같은 size의 Button과 높이가 같다. radius는 `md`다.
- [x] 포커스 표시는 `focus-field`(`:focus`, 클릭 포함)다. 오류 상태에서도 포커스 중에는 focus-field가 이기고 오류 메시지는 계속 보인다.
- [x] 오류 상태는 `data-invalid`로도 노출한다.
- [x] `browser`: label 연결로 이름 계산, 설명·오류의 `aria-describedby`, `aria-invalid`, 제어/비제어 입력, form 제출, focus-field와 error+focus 계산값, forced-colors 투명 outline을 단언한다.

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

- 2026-11-10 완료(브랜치 `ticket-15-field-input-textarea`, 티켓 13 Button 브랜치 3d6646b 위).
  - **근거 버전**: react 19.3.1(@types/react 19.3.0), tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, vitest-browser-react 2.3.0, storybook 10.6.6, next 16.4.5, typescript 7.0.2. react-aria는 쓰지 않는다(ADR 0004, 네이티브 요소). 새 의존성은 없고 `minimumReleaseAge`는 그대로다. 오류 아이콘은 이미 의존하던 `@tide-tds/icons`의 `CircleExclamationPointIcon`이다.
  - **API 확인**: `<Context value>` provider, `use(Context)`(서버 컴포넌트에서는 읽을 수 없음), 서버 컴포넌트가 `"use client"` 모듈의 context를 provider로 렌더할 수 있음, `useId`는 async 서버 컴포넌트에서만 못 씀 — context7 `/reactjs/react.dev`(createContext.md, use.md, rsc/server-components.md, useId.md). `aria-*` variant가 `[aria-<이름>="true"]`를 만들고 `data-*` variant가 `[data-<이름>]`을 만든다는 것은 context7 `/tailwindlabs/tailwindcss.com`과 설치본 `tailwindcss/dist/lib.js`(4.3.5)로 확인했다(`aria-invalid`는 제안 목록에 없지만 functional variant라 동작). `toHaveAccessibleName`·`toHaveAccessibleDescription`·`userEvent.fill`은 context7 `/vitest-dev/vitest`(docs/api/browser).
  - **구조 결정**([ADR 0013](../../../decisions/0013-field-props-and-context-connection.md)): Field는 props 하나로 label·설명·오류를 받는다(부분 Component 없음). 안의 입력 Component가 context를 읽어 `id`, `aria-describedby`, `aria-invalid`, `required`, `disabled`를 붙인다. context는 `field-context.ts`(`"use client"`)가 만들고, `Field.tsx`는 지시어 없이 서버 컴포넌트로 남는다(`useId` + provider 렌더). `Input.tsx`·`Textarea.tsx`는 `use(FieldContext)`를 쓰므로 `"use client"`다. smoke가 `Field.js`에는 지시어가 없고 `Input.js`·`Textarea.js`·`field-context.js`에는 있는지, 서버 page에서 prerender한 HTML에 `label for`=입력 id, `aria-describedby`(설명·오류 2개 id가 모두 존재), `aria-invalid="true"`, `required`가 있는지 확인한다.
  - **연결 방식**: 화면·읽는 순서는 label → 입력창 → 설명 → 오류. `aria-describedby`는 「설명 id 오류 id」 순서이고, 입력창에 직접 준 `aria-describedby`는 그 뒤에 이어 붙는다. label 뒤 `*`(required)는 `aria-hidden`이라 이름에 들어가지 않고, 네이티브 `required`로 알린다. 오류 메시지 앞 아이콘은 장식용(`aria-hidden`)이라 설명에 들어가지 않는다(색만으로 알리지 않기 1.4.1). live region은 두지 않는다(`aria-describedby`로 입력창과 함께 읽힘). `aria-errormessage`는 지원이 고르지 않아 쓰지 않는다.
  - **오류 상태 노출**: `invalid` 기본값은 「`error`가 있으면 `true`」, `invalid={false}`면 `error`를 숨긴다. 입력창에 `aria-invalid="true"`와 `data-invalid`, Field 루트에 `data-invalid`(`disabled`면 `data-disabled`). 네이티브 `:invalid`는 브라우저 제약 검사 결과라 쓰지 않는다. 경계는 `aria-invalid:border-danger`이고, 포커스 중에는 foundation `focus-field`의 `[aria-invalid="true"]` 조합(0,3,0)이 이긴다.
  - **우선순위**: 입력 Component에 직접 준 `id`, `invalid`, `disabled`, `required`가 Field 값을 이긴다. label이 가리킬 id를 앱이 정하려면 Field `htmlFor`를 쓴다(오류 요약 `#id` 링크용).
  - **props 표**:

    | Component  | prop          | 타입·값                      | 기본값                  | 비고                                                                  |
    | ---------- | ------------- | ---------------------------- | ----------------------- | --------------------------------------------------------------------- |
    | `Field`    | `label`       | `ReactNode`(필수)            | —                       | `<label for>`로 입력창 이름                                           |
    |            | `description` | `ReactNode`                  | —                       | 입력창 아래, `aria-describedby`                                       |
    |            | `error`       | `ReactNode`                  | —                       | 오류 상태일 때만 보임, 아이콘 + `text-danger`                         |
    |            | `invalid`     | `boolean`                    | `error`가 있으면 `true` | `false`면 `error`를 숨김                                              |
    |            | `required`    | `boolean`                    | `false`                 | 입력창 `required`, label 뒤 `*`                                       |
    |            | `disabled`    | `boolean`                    | `false`                 | 입력창 `disabled`, 루트 `data-disabled`                               |
    |            | `htmlFor`     | `string`                     | 자동(`useId`)           | 입력창 id                                                             |
    |            | 나머지        | `ComponentProps<"div">`      |                         | `ref`·`className`은 루트 div                                          |
    | `Input`    | `size`        | `"sm" \| "md" \| "lg"`       | `"md"`                  | `xs`는 타입 오류. native `size` 속성은 `Omit`                         |
    |            | `invalid`     | `boolean`                    | Field 값 또는 `false`   | `aria-invalid`·`data-invalid`                                         |
    |            | 나머지        | `ComponentProps<"input">`    |                         | `type`, `disabled`, `readOnly`, `required`, `value`/`defaultValue` 등 |
    | `Textarea` | `size`        | `"sm" \| "md" \| "lg"`       | `"md"`                  | `xs`는 타입 오류                                                      |
    |            | `invalid`     | `boolean`                    | Field 값 또는 `false`   |                                                                       |
    |            | `rows`        | `number`                     | `3`                     | `resize-y`(세로로만 크기 조절)                                        |
    |            | 나머지        | `ComponentProps<"textarea">` |                         |                                                                       |

  - **size별 값**: Input 높이 32/40/48px(같은 size Button과 같음, border 포함), 좌우 padding 10/12/16px, 텍스트 스타일 `label-sm`/`label-md`/`label-lg`에 `font-normal`(입력한 값은 보통 굵기). Textarea는 글자 크기를 Input과 맞추고(12/14/16px) 여러 줄을 위해 행간이 넉넉한 `caption`/`body-sm`/`body-md`, padding `px-2.5 py-1.5`/`px-3 py-2`/`px-4 py-3`(한 줄일 때 글자 위아래 여백이 Input과 같도록). radius는 모두 `md`. Field label `text-label-md text-default`, 설명 `text-body-sm text-muted`, 오류 `text-body-sm text-danger`(아이콘 16px), 간격 `gap-1.5`(6px).
  - **공통 모양**: `border-strong`(표면 층 위 3:1, 1.4.11), `bg-canvas`, `text-default`, `placeholder:text-muted`, `focus:focus-field`, `transition-colors`(fast), disabled는 `disabled:` pseudo-class로 `cursor-not-allowed`·`border-default`·`bg-disabled`·`text-disabled`. readOnly는 따로 꾸미지 않는다(포커스 표시는 그대로). 쓰는 Token은 모두 이미 등록된 대비 쌍(`text-default`·`text-muted`·`text-danger` × 표면 층 4.5, `border-strong`·`border-danger`·`outline-focus` × 표면 층 3)이거나 제외 목록(`border-default`, disabled)이라 foundation 대비 쌍을 더하지 않았다.
  - **테스트**: components browser 362 tests(× instance 2 포함, 이전 292). `Field.test.tsx`: label 이름·label 클릭 포커스, Textarea 연결, `htmlFor`, 여러 Field id 비충돌, required(`*`가 이름에 없음), disabled·`data-disabled`, 설명 `aria-describedby`, 오류(설명→오류 순서, 아이콘 숨김, `aria-invalid`·`data-invalid`), `invalid={false}`, `invalid`만, 제어 입력으로 오류 해제, 직접 준 `aria-describedby` 이어 붙이기, 직접 준 값 우선, form 제출(FormData), required 빈 값 제출 차단. `Input.test.tsx`: size 3개 높이가 같은 size Button·`type="date"`와 같음, 텍스트 스타일·굵기 400·radius 6px, Textarea 글자 크기·3줄·`resize: vertical`, `xs` `@ts-expect-error` 2개, 비제어·제어, readOnly, disabled(포커스 안 받음, `not-allowed`), Field 밖 `invalid`, ref·className(`px-8`, `resize-none`) 우선, 클릭 포커스 focus-field(border·inset 1px = `--tide-outline-focus`, 투명 outline), Textarea 키보드 포커스, error+focus(포커스 중 focus 색이 이기고 오류 메시지 보임, blur 뒤 danger 복귀), transition fast, forced-colors 경계. forced-colors instance에서는 box-shadow `none`과 outline이 투명이 아님(시스템 색)을 단언한다. `focus:focus-field`를 빼면 5개가 실패함을 확인하고 되돌렸다. docs storybook에 Field 12·Input 9·Textarea 7 story(a11y `error`, Don't 「placeholder를 label 대신」·「label 없이」만 off).
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 433, icons 18, components 362, docs 104 tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(`@tide-tds/components` patch).
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. Input 글자를 텍스트 스타일 `label-*`에 `font-normal`로 덮었다(label 스타일의 medium 굵기는 입력한 값에 무겁다). 텍스트 스타일 묶음을 그대로 쓰려면 `font-normal`만 빼면 된다.
    2. Textarea는 Input과 글자 크기를 맞추고 body 계열(sm은 `caption`) 텍스트 스타일을 썼다.
    3. 설명·오류를 입력창 아래에 둔다(설명을 label 바로 아래 두는 시스템도 있다).
    4. readOnly에 별도 모양을 두지 않았다.
    5. `invalid` 기본값을 「`error`가 있으면 `true`」로 했다(react-hook-form 등에서 `error={errors.email?.message}` 한 줄로 쓰게).
  - **다음 티켓 메모**:
    - 16(Checkbox·Radio): Field context(`field-context.ts`의 `FieldContext`, `useFieldControl`)를 읽는다. 단일 Checkbox는 자기 label을 가지므로 Field 없이 쓴다. 그룹은 `role="group"`(또는 `radiogroup`)에 `aria-labelledby={labelId}`, `aria-describedby={describedBy}`를 붙인다. 지금 Field label은 `<label for={controlId}>`라 그룹에서는 `for`가 그룹 div를 가리켜 클릭해도 아무 일이 없다. 그룹용으로 Field label을 `for` 없는 요소(또는 `fieldset`/`legend`)로 바꾸는 선택지를 Field에 더하고 ADR 0013 정정으로 남긴다. `aria-invalid`는 그룹이 아니라 개별 input에 붙인다(group 역할은 `aria-invalid`를 지원하지 않음). 포커스 표시는 ring(`focus-visible:focus-ring`)이고 field가 아니다(GLOSSARY 포커스 표시).
    - 17(Switch): 자기 label을 가진다. Field 안에 둘 필요는 없지만 설명·오류가 필요하면 `useFieldControl`로 `aria-describedby`를 받는다. `"use client"` 판단: context를 읽으면 client다.
    - 공통: 입력창 class(`input-style.ts`)는 Select·Combobox 트리거가 같이 쓸 수 있다. 높이는 같은 size Button과 같고 border 1px 포함이다.
