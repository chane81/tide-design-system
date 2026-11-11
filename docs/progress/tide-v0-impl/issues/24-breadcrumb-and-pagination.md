# 24: Breadcrumb과 Pagination

Status: done
Blocked by: 18 (trusted publisher 설정과 0.2.0 CI 릴리스)

## What to build

앱 개발자가 `Breadcrumb`으로 현재 위치를, `Pagination`으로 페이지 이동을 보여 준다. 링크는 Next `Link`로 렌더할 수 있고, 스크린리더 사용자는 탐색 영역과 현재 페이지를 듣는다.

## 수용 기준

- [x] 둘 다 탐색 랜드마크와 이름을 가진다. 현재 항목은 `aria-current`로 표시한다.
- [x] Breadcrumb 구분자는 아이콘 패키지의 장식용 아이콘이다.
- [x] Pagination의 이전/다음은 IconButton(화살표 아이콘, 이름 필수)을 쓴다. 페이지 항목은 Link·Button 규칙을 따르고 24×24 이상이다.
- [x] 링크 항목은 `render`로 Next `Link`를 받을 수 있다.
- [x] `browser`: 랜드마크·이름, `aria-current`, 구분자가 읽히지 않음, 이전/다음 이름과 disabled를 단언한다.

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

- 2026-11-11 완료(브랜치 `ticket-24-breadcrumb-and-pagination`, main 4c453af 위).
  - **근거 버전**: react 19.3.1, tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, vitest-browser-react 2.3.0, playwright 1.65.0(Chromium), storybook 10.6.6, typescript 7.0.2, next(smoke·테스트의 `next/link`)는 catalog 버전 그대로. React Aria는 쓰지 않았다(spec 단계 3 「네이티브」, ADR 0004). 새 의존성은 없고 `minimumReleaseAge`는 그대로다.
  - **API 확인**: Tailwind v4 임의 변형의 `&` 자리 표시자(`[li:first-child>&]:hidden`)와 parent 상태 변형은 context7 `/tailwindlabs/tailwindcss.com`(hover-focus-and-other-states.mdx). Storybook `subcomponents`는 티켓 23에서 확인한 context7 `/storybookjs/storybook/v10.6.5` 그대로. 접근성 패턴은 1차 자료 WAI-ARIA APG Breadcrumb Pattern과 Breadcrumb Example(`nav` + `aria-label`, `ol`, 현재 페이지 `aria-current="page"`, 「현재 페이지가 링크가 아니면 aria-current는 선택」, 구분자는 접근성 트리에 나오지 않게). 이전/다음 disabled 동작은 기존 IconButton(`pressable.ts`) 규칙을 그대로 썼다.
  - **export 이름**: Breadcrumb은 `Breadcrumb`(`<nav>` + `<ol>`), `BreadcrumbItem`(`<li>`), `BreadcrumbLink`(`<a>`), `BreadcrumbCurrent`(`<span aria-current="page">`). Pagination은 `Pagination`(`<nav>` + `<ul>`), `PaginationItem`(`<li>`), `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`. 목록 요소(`ol`·`ul`)는 루트 Component가 직접 렌더해 부분 수를 줄였다(`ref`·`className`은 `<nav>`).
  - **구현 결정**:
    - 구분자: `BreadcrumbItem`이 자기 앞에 `ChevronRightIcon`(16px)을 붙이고 `[li:first-child>&]:hidden`으로 첫 항목에서 숨긴다. IconBase가 이름 없는 아이콘에 `aria-hidden`을 붙인다. 앱이 구분자를 따로 놓지 않는다(shadcn의 `BreadcrumbSeparator`와 다름).
    - 현재 페이지: 링크가 아닌 `BreadcrumbCurrent`에 `aria-current="page"`를 항상 붙인다(APG는 링크가 아니면 선택이지만 티켓 수용 기준을 따름). 현재 페이지를 링크로 두려면 `BreadcrumbLink`에 `aria-current`를 직접 준다.
    - Breadcrumb 링크는 Link와 같은 밑줄 규칙(항상 밑줄, hover 2px)에 `text-muted` → hover `text-default`, transition 없음. 탐색 영역이지만 현재 페이지와 밑줄로도 구분한다(원칙 ①, WCAG 1.4.1).
    - `PaginationLink`는 Button(ghost neutral / 현재 쪽 subtle primary, `sm` 32px)에 `render={render ?? <a />}`로 넘긴다. 포커스·커서·hover·누름 축소·forced-colors 규칙이 Button과 같다. 번호는 `min-w-8 px-2 tabular-nums`.
    - `PaginationPrevious`·`PaginationNext`는 IconButton(ghost neutral `sm`) + `ChevronLeftIcon`·`ChevronRightIcon`. 이름은 기본 「이전 페이지」·「다음 페이지」이고 `aria-label`로 바꾼다. `disabled`는 기본 `<button>`이면 네이티브, `render`로 링크면 `aria-disabled` + 이동 차단(IconButton 규칙).
    - `PaginationEllipsis`는 32px 칸에 `EllipsisIcon`(aria-hidden) + VisuallyHidden 텍스트(children, 기본 「페이지 생략」). 빈 `listitem`이 읽히지 않게 텍스트를 둔다.
    - 두 파일 모두 `"use client"`가 없다. Pagination은 client 경계인 Button·IconButton에 함수 없이 props만 넘긴다(smoke가 `Breadcrumb.js`·`Pagination.js`에 지시어가 없음을 확인).
    - 기본 class가 없는 `PaginationItem`은 `cn()`을 거치지 않는다(class 속성 없음 단언).
  - **color 결정(ADR 0016 덧붙임)**: Breadcrumb·Pagination은 탐색 구조 Component라 `color`가 없다. HTML 전역 `color`는 `BreadcrumbLink`·`PaginationLink`에서 `Omit`해 타입 오류 단언이 성립한다(이전/다음은 IconButton의 `color`를 Omit). 현재 쪽 번호는 primary subtle 고정.
  - **Token과 대비**: `text-muted`·`text-default` × 표면 층 3개(4.5:1), `text-default` × `bg-neutral-subtle-hover`(번호 hover), `text-primary` × `bg-primary-subtle`·`-hover`·`-active`(현재 쪽), `outline-focus` × 표면 층(3:1) 모두 이미 등록되어 있다. 구분자·생략 아이콘은 장식용이다. foundation 대비 쌍은 늘지 않았고 components `unit`에 등록 단언 5개를 더했다.
  - **props 표**(모두 서버 컴포넌트, `ref`는 각 요소, `className`이 기본 class를 이긴다)

    | Component                               | 요소                                    | 추가·바뀐 prop                                                                                                         |
    | --------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
    | `Breadcrumb`                            | `<nav>` + `<ol>`                        | `aria-label`(기본 `"이동 경로"`)                                                                                       |
    | `BreadcrumbItem`                        | `<li>`                                  | 없음. 앞에 구분자 아이콘                                                                                               |
    | `BreadcrumbLink`                        | `<a>`                                   | `render`, `color` 제외                                                                                                 |
    | `BreadcrumbCurrent`                     | `<span>`                                | `aria-current="page"` 고정                                                                                             |
    | `Pagination`                            | `<nav>` + `<ul>`                        | `aria-label`(기본 `"페이지 이동"`)                                                                                     |
    | `PaginationItem`                        | `<li>`                                  | 없음(class 속성 없음)                                                                                                  |
    | `PaginationLink`                        | 기본 `<a>`(Button ghost/subtle, 32px)   | `current?: boolean`(기본 `false`), `render`, `color` 제외                                                              |
    | `PaginationPrevious` / `PaginationNext` | 기본 `<button>`(IconButton ghost, 32px) | `aria-label?`(기본 `"이전 페이지"`/`"다음 페이지"`). `variant`·`color`·`size`·`loading`·`loadingLabel`·`children` 제외 |
    | `PaginationEllipsis`                    | `<span>`(32px)                          | `children`: 숨긴 텍스트(기본 `"페이지 생략"`)                                                                          |

  - **motion·포커스·forced-colors**: Breadcrumb 링크는 transition이 없어 reduced-motion과 무관하고 focus-ring·밑줄·구분자(stroke = 글자색) 계산값을 두 instance에서 단언했다. Pagination 번호는 Button 규칙이라 transition에 scale이 있고 reduced-motion instance에서는 없음을 단언했다. focus-ring(outline 2px·offset 2px·`outline-focus`)은 전환(150ms)이 끝난 뒤 읽는다. forced-colors에서는 번호의 투명 border가 경계로 보인다.
  - **테스트**: components browser에 Breadcrumb 22 tests(11 × instance 2: aria snapshot으로 navigation·list·listitem·link와 구분자 미노출, 이름 변경·aria-labelledby, `BreadcrumbCurrent` span + aria-current, 링크·현재 페이지 글자·밑줄, hover, 구분자 표시·숨김·크기·aria-hidden, forced-colors stroke, Tab 순서·focus-ring, Next Link render 병합, 부분별 ref·className, 타입 오류), Pagination 28 tests(14 × 2: aria snapshot, 이름 변경, aria-current·data-color·색, 32px 크기·두 자리 폭·tabular-nums·아이콘 16px, 이전/다음 기본 이름·aria-hidden 아이콘, button disabled(포커스 건너뜀·커서·색), Next Link disabled의 aria-disabled·onClick 차단, focus-ring, forced-colors border, reduced-motion scale, Next Link render 병합, button render, ref·class 속성 없음, 타입 오류). unit에 대비 5 tests. docs storybook에 Breadcrumb 5 + Pagination 5 story(a11y 통과, off 없음).
  - **smoke**: page에 Breadcrumb(Next `Link` render 링크 + 현재 페이지)와 Pagination(disabled 이전, Next `Link` render 현재 번호·다음, 생략). `Breadcrumb.js`·`Pagination.js`에 `"use client"`가 없음, 출력 CSS에 `li:first-child>`·`.min-w-8`·`.gap-1\.5`(@source), prerender HTML에 `<nav aria-label="이동 경로"><ol`·li 2개·`href="/"` 링크·`<span aria-current="page">`·aria-hidden svg 2개, `<nav aria-label="페이지 이동"><ul`·disabled `이전 페이지` button·`href="/?page=1"` + aria-current·`다음 페이지` 링크·「페이지 생략」·aria-hidden svg 3개, 빌드 JS에 chevron-left/right 도형, nodenext에 Props 타입 10개와 타입 오류 2개. 생략 아이콘은 path 없이 circle만 있어 도형 비교에서 뺐다(HTML 확인이 대신).
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 460, icons 18, components 1097(이전 1042), docs 226(이전 216) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(`@tide-tds/components` patch). 「Failed to import test file … Unexpected token '}'」는 나지 않았다. 첫 단일 실행에서 Pagination 2건이 실패했다: focus-ring 색을 transition 중에 읽음(IconButton 테스트처럼 250ms 대기로 해결), aria-disabled 링크를 playwright click이 누르지 않음(DOM `click()`으로 해결). smoke 첫 실행은 `ellipsis-icon.js`에 path가 없어 도형 비교가 실패했다(검사에서 뺌).
  - **ADR·티켓 어긋남**: 없다. 티켓 「이전/다음은 IconButton(이름 필수)」은 IconButton의 필수 `aria-label`을 Component가 기본값으로 채우는 것으로 읽었다(이름이 빠질 수 없다).
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 기본 이름 「이동 경로」·「페이지 이동」, 이전/다음 「이전 페이지」·「다음 페이지」, 생략 「페이지 생략」. 이름을 타입상 필수로 두지 않았다(Progress와 다름).
    2. 현재 페이지는 링크가 아닌 `BreadcrumbCurrent`(span). APG 예시는 링크 + aria-current다.
    3. 구분자는 `BreadcrumbItem`이 자동으로 붙인다(`BreadcrumbSeparator` 없음). 모양 바꾸기(「/」 등) prop도 없다.
    4. Breadcrumb 링크는 `text-muted` + 항상 밑줄. hover에만 밑줄을 두는 가벼운 모양을 원하면 바꾼다.
    5. `ol`·`ul`은 루트가 렌더하고 `className`을 받지 않는다(`BreadcrumbList`·`PaginationContent` 없음). 목록 간격을 바꾸려면 `[&>ol]:gap-3` 같은 class를 nav에 준다.
    6. 번호·이전/다음 크기는 32px(`sm`) 한 가지, `size` 축 없음. 현재 쪽은 primary subtle 고정, `color` 없음.
    7. 번호 hover는 Button 규칙(`transition-colors` fast)이다. spec 「반복되는 목록 항목의 hover는 바로 바뀐다」의 목록 항목으로 보지 않았다.
    8. 페이지 범위 계산 함수(처음·끝·앞뒤 n쪽)를 공개하지 않았다. 문서 story에 예시 함수만 있다.
    9. 처음·마지막 쪽 링크(«·») 버튼이 없다.
  - **다음 티켓 메모**: 33(Tag)·31(Tabs) 등에서 Button 모양을 다른 요소로 쓰려면 `PaginationLink`처럼 Button에 `render`로 넘기면 pressable 규칙을 다시 쓰지 않아도 된다(서버 파일에서 client Button을 렌더해도 함수만 만들지 않으면 된다). 아이콘 tree-shaking smoke의 `iconShape`는 `d:` path만 찾으므로 circle만 있는 아이콘(ellipsis 등)은 다른 방법으로 확인한다. 링크로 렌더한 `aria-disabled` 요소는 vitest browser `userEvent.click`이 「not enabled」로 기다리다 시간 초과하니 DOM `click()`을 쓴다. focus-ring 색은 Button류의 transition-colors 때문에 250ms 뒤에 읽는다.
