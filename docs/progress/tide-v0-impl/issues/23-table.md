# 23: Table

Status: done
Blocked by: 18 (trusted publisher 설정과 0.2.0 CI 릴리스)

## What to build

앱 개발자가 시맨틱 `<table>`을 Tide 스타일로 쓴다. `Table`, `Head`, `Row`, `Cell`을 평평한 이름으로 import한다. 행에 마우스를 올리면 배경이 바로 바뀐다.

## 수용 기준

- [x] 시맨틱 table 요소를 쓰고 hook을 쓰지 않는다. 정렬, 행 선택, 가상화는 없다.
- [x] 부분 Component를 평평한 이름으로 export하고 부분마다 `className`을 받는다(`classNames` 객체 없음). 실제 export 이름은 기존 Component와 겹치지 않게 정한다.
- [x] 행 hover는 transition 없이 즉시 바뀐다(반복되는 목록 항목 규칙).
- [x] 숫자 열은 `tabular-nums`로 맞출 수 있다.
- [x] `browser`: table·row·cell·columnheader 역할과 헤더 연결을 단언한다.

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

- 2026-11-11 완료(브랜치 `ticket-23-table`, main 3f31d1f 위).
  - **근거 버전**: react 19.3.1, tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, vitest-browser-react 2.3.0, playwright 1.65.0(Chromium), storybook 10.6.6, typescript 7.0.2. React Aria는 쓰지 않았다(spec 「네이티브로 완결되는 요소(… Table 등)에는 hook을 쓰지 않는다」, ADR 0004). 새 의존성은 없고 `minimumReleaseAge`는 그대로다.
  - **API 확인**: Tailwind v4의 변형 쌓기 순서(왼쪽 → 오른쪽)와 `&` 자리 표시자를 쓰는 임의 변형(`[&.is-dragging]:active:`)은 context7 `/tailwindlabs/tailwindcss.com`(upgrade-guide.mdx, hover-focus-and-other-states.mdx). Storybook `subcomponents`가 `ArgTypes` 블록에 탭으로 나오는 것은 context7 `/storybookjs/storybook/v10.6.5`(stories-for-multiple-components.mdx, autodocs.mdx, MIGRATION.md 「ArgsTable 제거와 subcomponents 복귀」). 헤더 범위는 1차 자료 W3C WAI Tables Tutorial 「Tables with Two Headers」(머리 행 `scope="col"`, 머리 열 `scope="row"`)와 「Tables with Irregular Headers」(`colgroup`·`rowgroup`).
  - **export 이름**: `Table`(`<table>`), `TableHead`(`<thead>`), `TableBody`(`<tbody>`), `TableRow`(`<tr>`), `TableHeaderCell`(`<th>`), `TableCell`(`<td>`). 티켓의 Head·Row·Cell을 `Table` 접두사로 바꿔 다른 Component(앞으로 올 Dialog 머리 등)와 겹치지 않게 했다. HTML 요소 이름과 맞춰 `TableHead` = thead, 머리 칸은 `TableHeaderCell`로 구분했다(shadcn은 `TableHeader` = thead, `TableHead` = th라 헷갈린다). `<tbody>` 없이 `<tr>`을 `<table>`에 바로 두면 React가 hydration 경고를 내므로 `TableBody`를 더했다. `<caption>`·`<tfoot>`는 네이티브 요소를 그대로 쓴다.
  - **행 hover 구현**: `TableRow`에 `[:where(tbody>&)]:hover:bg-neutral-subtle-hover`. ① `<tbody>` 바로 아래 행만 바뀌어 머리 행·바닥 행은 그대로다. ② `:where()`로 감싸 선택자 특이도가 (0,1,0)이라 사용자 className `hover:bg-transparent`((0,2,0))가 CSS 순서와 상관없이 이긴다(tailwind-merge는 변형이 달라 둘 다 남긴다). 실험으로 `:where` 없이 `[tbody>&]:hover:`로 바꾸면 「사용자 className의 hover 배경이 이긴다」가 실패하고, `transition-colors`를 더하면 「transition 없이 바로」 단언이 실패함을 확인하고 되돌렸다. 색은 spec 「raised 위 항목: ghost 규칙(hover subtle-hover)」을 따른 neutral `subtle-hover`(Button ghost hover와 같은 단계).
  - **`scope` 기본 `"col"`**: 처음에는 scope를 붙이지 않았는데, vitest 5.1.0 aria snapshot이 scope 없는 `<thead>`의 `<th>`를 `columnheader`가 아니라 `cell`로 계산했다(scope="row"는 `rowheader`). 보조 기술·도구마다 scope 자동 계산이 다를 수 있어 `TableHeaderCell`은 기본 `scope="col"`을 붙이고, 행 머리는 `scope="row"`를 주게 했다(WAI 튜토리얼 권장과 같다). `scope` 타입은 `"col" | "row" | "colgroup" | "rowgroup"`으로 좁혔다(React 타입은 `string`).
  - **color 결정(ADR 0016 덧붙임)**: Table은 데이터를 담는 구조 Component라 색 prop이 없다. 글자 `text-default`, 행 구분선 `border-default`, hover neutral `subtle-hover` 고정. 색으로 뜻을 붙이려면 칸 안에 Badge를 넣는다. React 타입의 HTML 전역 속성 `color`(문자열)는 Card처럼 `Omit`하지 않았다.
  - **Token과 대비**: `text-default` × 표면 층 3개, `text-default` × `bg-neutral-subtle-hover`(4.5:1)가 이미 등록되어 있다. 머리 칸도 `text-muted`가 아니라 `text-default`로 두어 hover 행 안의 행 머리 칸이 등록된 쌍 밖으로 나가지 않게 했다(`text-muted` × `bg-neutral-subtle-hover`는 등록되어 있지 않다). `border-default`는 장식용 제외 Token이다. foundation 대비 쌍은 늘지 않았고, components `unit`에 등록 단언 3개를 더했다.
  - **props 표**(모두 서버 컴포넌트, `render` 없음, `ref`는 각 요소, `className`이 기본 class를 이긴다)

    | Component         | 요소      | 기본 class                                                          | 추가·바뀐 prop                                                     |
    | ----------------- | --------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
    | `Table`           | `<table>` | `w-full border-collapse text-body-sm text-default`                  | 없음(`ComponentProps<"table">`)                                    |
    | `TableHead`       | `<thead>` | 없음(class 속성도 붙이지 않는다)                                    | 없음                                                               |
    | `TableBody`       | `<tbody>` | 없음                                                                | 없음                                                               |
    | `TableRow`        | `<tr>`    | `border-b border-default`, tbody 안 hover `bg-neutral-subtle-hover` | 없음                                                               |
    | `TableHeaderCell` | `<th>`    | `px-3 py-2.5 text-start align-middle text-label-md`                 | `scope?: "col" \| "row" \| "colgroup" \| "rowgroup"`(기본 `"col"`) |
    | `TableCell`       | `<td>`    | `px-3 py-2.5 text-start align-middle`                               | 없음                                                               |

    칸 높이 40px(10 + 20 + 10, spec size `md` 높이와 같다), 가로 여백 12px. 숫자 열은 `className="tabular-nums text-end"`(Tailwind 기본 Utility class, spec 사용자 이야기 20).

  - **motion·포커스·forced-colors**: hover는 transition이 없어(`transitionDuration` 0s) reduced-motion과 관계없다. 포커스 가능한 부분이 없어 포커스 표시 단언은 해당 없다. forced-colors에서는 행 경계가 CanvasText, 칸 글자가 CanvasText임을 단언했다(hover 배경은 브라우저가 Canvas로 덮는다).
  - **테스트**: components browser에 Table 32 tests(16 × instance 2: aria snapshot으로 table·rowgroup·row·columnheader·rowheader·cell, 요소 태그와 열 번호·행 머리로 본 헤더 연결, 기본 scope·scope 타입 오류, `id`·`headers` 통과, variant·size 타입 오류, 본문 행 즉시 hover light·dark, 머리·바닥 행 hover 없음, 사용자 hover className 우선, 너비·collapse·글자, 행 경계, 칸 여백·높이·정렬·굵기, tabular-nums, forced-colors, 부분별 ref·className, thead·tbody class 속성 없음). unit에 대비 3 tests. docs storybook에 Table 6 story(a11y 통과, off 없음).
  - **smoke**: page에 `Table`(aria-label, 머리 2칸, 행 머리 1칸 + 칸 1개). `Table.js`에 `"use client"`가 없는지, 출력 CSS에 `border-collapse`·`:where(tbody>`·`py-2.5`(@source), prerender HTML에 `<thead>`·`<tbody>`(class 없음), `scope="col"` 2개, `scope="row"` 1개, `<td>` 1개, nodenext에 Props 타입 6개와 타입 오류 2개(scope 값, variant). 직전 메모대로 `data-color` div는 더하지 않아 Alert 정규식과 겹치지 않는다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 460, icons 18, components 1042(이전 1007), docs 216(이전 210) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(`@tide-tds/components` patch). 「Failed to import test file … Unexpected token '}'」는 나지 않았다. 첫 전체 실행은 `TableProps`에 `color`(HTML 전역 속성)가 있어 `@ts-expect-error`가 쓰이지 않은 타입 오류로 실패했고, 단언을 variant·size로 바꾼 뒤 통과했다. 단일 파일 첫 실행은 foundation·icons dist가 없어 import에 실패했다(빌드 후 해결, 코드 문제 아님).
  - **ADR·티켓 어긋남**: 티켓의 부분 이름(Head, Row, Cell)과 spec 「Table, Head, Row, Cell」은 「겹치지 않게 정한다」에 따라 `Table` 접두사 6개(`TableBody`·`TableHeaderCell` 추가)로 정했고 spec Table 줄에 적었다. ADR과 어긋난 것은 없다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 부분 이름: `TableHead` = `<thead>`, `TableHeaderCell` = `<th>`. shadcn(`TableHeader`/`TableHead`)과 다르다.
    2. `TableHeaderCell` 기본 `scope="col"`. 행 머리는 앱이 `scope="row"`를 준다(잊으면 열 머리로 읽힌다).
    3. `TableCaption`·`TableFoot`은 두지 않았다. 네이티브 `<caption>`·`<tfoot>`을 쓴다(caption은 브라우저 기본 가운데 정렬이라 문서 예시는 className으로 맞췄다).
    4. 숫자 열 정렬은 prop(`numeric` 등) 없이 `className="tabular-nums text-end"`.
    5. hover 색은 neutral `subtle-hover`, 머리 칸 글자는 `text-default`(+ label-md 굵기). `text-muted` 머리 칸을 원하면 foundation에 `text-muted` × `bg-neutral-subtle-hover` 대비 쌍이 필요하다.
    6. 칸 높이 40px·가로 12px 한 가지. 밀도(`size`) 축은 없다.
    7. 가로 스크롤 감싸개는 Component에 넣지 않고 문서에서 `overflow-x-auto` + `tabIndex={0}` + 이름을 안내했다.
  - **다음 티켓 메모**: 24(Breadcrumb·Pagination)도 「네이티브」 단계 서버 컴포넌트 패턴이다. 여러 부분 Component는 `subcomponents`로 MDX `ArgTypes` 탭에 함께 나온다. 기본 class가 없는 부분은 `cn()`을 거치지 않고 props를 그대로 넘기면 빈 `class=""`가 생기지 않는다. React 타입의 HTML 전역 속성 `color`가 있어 `color` 타입 오류 단언은 `Omit`한 Component에서만 쓸 수 있다. vitest aria snapshot은 scope 없는 `<th>`를 cell로 계산하니 표 형태 마크업(Pagination 등은 해당 없음)에서는 scope를 명시한다.
