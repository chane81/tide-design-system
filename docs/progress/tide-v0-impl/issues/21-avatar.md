# 21: Avatar

Status: done
Blocked by: 18 (trusted publisher 설정과 0.2.0 CI 릴리스)

## What to build

앱 개발자가 `Avatar`로 사용자 이미지를 보여 주고, 이미지가 없거나 불러오지 못하면 fallback 아이콘이 보인다.

## 수용 기준

- [x] 이미지에 대체 텍스트를 줄 수 있다. 장식용일 때는 읽히지 않는다.
- [x] 이미지가 없거나 로드에 실패하면 fallback 아이콘(아이콘 패키지)을 보인다.
- [x] radius는 `full`이다. size 축은 공통 규칙 안에서 정한다.
- [x] hook, state, 이벤트 처리 없이 만들어 서버 컴포넌트로 남긴다(`"use client"` 없음). smoke 앱의 서버 컴포넌트에서 렌더된다.
- [x] 로드 실패 fallback도 JS 없이 처리한다(예: fallback 아이콘을 이미지 아래 층에 깔아 두기). JS 없이는 불가능하다고 판단되면 구현을 멈추고 근거를 들고 사용자에게 묻는다.
- [x] 클릭이 필요하면 Avatar 루트에 `onClick`을 다는 대신 Button이나 IconButton 안에 Avatar를 넣는다. MDX의 Do/Don't에 두 예시를 둔다(Do: Button·IconButton으로 감싸기, Don't: Avatar에 `onClick`만 달기. Don't story는 a11y 검사를 끈다).
- [x] `browser`: 이미지 대체 텍스트, 로드 실패 시 fallback 전환을 단언한다.

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

- 2026-11-11 완료(브랜치 `ticket-21-avatar`, main 48d87cb 위).
  - **근거 버전**: react 19.3.1, tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, vitest-browser-react 2.3.0, playwright 1.65.0(Chromium 158.0.8127.18), storybook 10.6.6, typescript 7.0.2. React Aria는 쓰지 않았다(ADR 0004, 네이티브로 완결). 새 의존성은 없고 `minimumReleaseAge`는 그대로다. fallback 아이콘은 `@tide-tds/icons`의 기존 `UserIcon`이라 아이콘 패키지는 바뀌지 않았다.
  - **API 확인**: `ref`를 일반 prop으로 받는 것은 티켓 19·20과 같다(context7 `/reactjs/react.dev`). `bg-cover`·`bg-center`·`bg-no-repeat`는 context7 `/tailwindlabs/tailwindcss.com`(background-size·background-position·background-repeat.mdx). 요소 화면 찍기 명령(`BrowserCommand`, `context.iframe` FrameLocator의 `screenshot()`)은 context7 `/vitest-dev/vitest`(docs/api/browser/commands.md).
  - **JS 없는 fallback 방식**: 루트(`span`) 안 아래 층에 fallback 아이콘을 늘 그리고, 위 층(`span aria-hidden`, `absolute inset-0`)에 이미지를 CSS `background-image`(`bg-cover bg-center bg-no-repeat`)로 깐다. 받으면 아이콘을 덮고, 받지 못하면(404, 이미지가 아닌 응답, 깨진 데이터) 배경 이미지는 아무것도 그리지 않아 아이콘이 그대로 보인다. 이름은 `<img alt>` 대신 루트의 `role="img"` + `aria-label`이다. `src`는 CSS escape(`\HH `)로 `url("…")` 문자열 안에 가둔다.
  - **실험 근거(Playwright 1.65.0, Chromium 158, 테스트 밖 스크립트)**: ① `<img>`를 아이콘 위 층에 겹치면 실패했을 때 Chromium이 상자 안에 깨진 이미지 아이콘과 alt 텍스트를 fallback 위에 그린다. `alt=""`여도 크기가 있으면 깨진 이미지 아이콘이 보이고, forced-colors에서는 alt 텍스트와 테두리가 더 또렷하다. ② 이를 CSS로 지우는 시도: `color: transparent`는 alt 텍스트만 숨기고 아이콘과 회색 테두리가 남는다. `font-size: 0`, `text-indent`도 아이콘을 못 숨긴다. `content-visibility: hidden`은 깨진 표시를 숨기지만 정상 이미지도 숨긴다. `contain: paint`는 효과가 없다. `img::after`로 덮는 방법(깨진 이미지에만 pseudo가 그려짐)은 Chromium에서 되지만 아래 층 fallback 아이콘까지 덮으므로 아이콘을 CSS(mask + SVG data URL)로 다시 그려야 하고, Safari는 깨진 이미지에 pseudo를 그리지 않는 것으로 알려져 있다(확인 불가). ③ 배경 이미지 층은 200 이미지에서만 그려지고 404(text/html)·200 text/html·깨진 PNG 데이터에서는 아무것도 그리지 않았다. forced-colors에서도 배경 이미지(url)는 그대로 그려졌다. 그래서 `<img>`를 버리고 ③으로 정했다.
  - **color 결정(ADR 0017 후속 줄, ADR 0016 덧붙임)**: `color`는 `ColorFamilyName`만(Tide 색 계열 6개 + 앱 장식 계열), 기본 `gray`. Avatar의 색은 fallback 배경·아이콘에만 쓰이고 사람을 구분하는 데 돕는 뜻 없는 장식 색이다. Badge처럼 상태를 전하는 두 번째 쓰임이 없어 Role이 필요 없다(③). `neutral`은 Role이라 받지 않는다. color prop 자체는 둔다. 목록에서 사진 없는 사람이 여럿일 때 색으로 구분을 돕는 일이 흔하고, ADR 0016 표가 Avatar를 장식·분류로 둔 것과도 맞다. 구조적 결정이 아니라 ADR 0017의 열린 질문에 답한 것이라 새 ADR(0018) 대신 ADR 0017 후속 줄로 남겼다.
  - **ADR·티켓 어긋남**: spec 「스타일 축」의 「Component는 루트에 `data-color`를 항상 붙여서(기본 `primary`)」는 Avatar에 맞지 않는다(`primary`는 Role). Badge(`neutral`)처럼 Component 기본값을 따로 두고 `gray`로 했다. spec에 Avatar 줄을 더했다. 티켓 본문 「이미지에 대체 텍스트를 줄 수 있다」는 `<img alt>`를 전제한 문장으로 읽힐 수 있으나, 대체 텍스트는 `alt` prop → 루트 `aria-label`로 준다(위 실험 근거).
  - **props 표**:

    Avatar(`span`, 서버 컴포넌트)

    | prop        | 타입·값                                                               | 기본값   | 비고                                                                       |
    | ----------- | --------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------- |
    | `alt`       | `string`                                                              | — (필수) | 주면 루트 `role="img"`·`aria-label`. `""`이면 장식용(역할·이름 없음)       |
    | `src`       | `string`                                                              | —        | 없거나 `""`이거나 불러오지 못하면 fallback 아이콘                          |
    | `size`      | `"xs" \| "sm" \| "md" \| "lg"`                                        | `"md"`   | 원 24·32·40·48px, 아이콘 16·20·24·28px                                     |
    | `color`     | `ColorFamilyName`                                                     | `"gray"` | fallback 배경(`bg-accent-subtle`)·아이콘(`text-accent`). 루트 `data-color` |
    | `className` | —                                                                     |          | 기본 class를 이긴다(`rounded-md`)                                          |
    | 나머지      | `ComponentProps<"span">`(`color`·`children`·`role`·`aria-label` 제외) |          | `ref`, `id`, `title` 등                                                    |

  - **모양**: `inline-flex` 원(radius `full`), `overflow-hidden`, `shrink-0`, `select-none`, `align-middle`. 이미지는 `object-fit: cover`와 같은 `bg-cover bg-center`.
  - **Token·대비**: fallback 아이콘 `text-accent` × `bg-accent-subtle`은 색 이름 규칙 `colorContrastRules`의 text × subtle(4.5:1)이고, Tide 색 계열 6개는 foundation이 light·dark로 검사한다. 새로 등록한 쌍은 없다. components `unit`에 색 계열 6개가 text × subtle을 light·dark에서 통과하는지와 앱 장식 계열 규칙 단언을 더했다. 이미지 층은 사용자 사진이라 대비 검사 대상이 아니다.
  - **forced-colors**: 따로 class를 두지 않았다. 배경이 Canvas, 아이콘이 CanvasText가 되고 배경 이미지는 그대로 그려진다(browser 테스트로 단언).
  - **테스트**: components browser에 Avatar 60 tests(30 × instance 2). 이름(alt → `role="img"` 이름, 이미지 없을 때도 이름, `alt=""`는 역할·이름 없음, Button 안에서 버튼 이름 「홍길동 프로필」, `alt` 누락·`role`·`aria-label`·`children` 타입 오류), fallback(src 없음·빈 문자열이면 이미지 층 없음, 받은 이미지가 아이콘 자리를 덮음(화면 찍기 픽셀), **깨진 데이터·없는 경로에서 src 없는 Avatar와 화면 찍기가 바이트까지 같음**, 대조로 `<img>`를 겹치면 화면이 달라짐, `src`의 따옴표·역슬래시·괄호가 url 하나로 남음, 이미지 층 cover·크기), 모양(size 4개 원·아이콘 크기, radius full, overflow), 색(기본 gray, 색 계열 6개 dark 계산색과 아이콘 stroke, `data-color` 비상속, `ColorFamilyName`·앱 계열 `leaf` 통과와 `primary`·`neutral`·없는 이름 타입 오류), forced-colors(CanvasText·Canvas), ref·className 우선. escape를 빼면 url 테스트가 실패함을 확인하고 되돌렸다. 화면 찍기용 browser 명령 `screenshotTestId`를 `test/commands.ts`에 더했다. unit에 대비 2 tests. docs storybook에 Avatar 7 story(Don't `onClick`만 a11y off).
  - **smoke**: page에 `<Avatar alt="홍길동" src="/avatar.png" size="lg" color="cyan" />`과 장식용 `<Avatar alt="" />`. `Avatar.js`에 `"use client"`가 없는지, 출력 CSS에 `bg-cover`·`[&_svg]:size-7`(@source), prerender HTML에 `role="img"`·`aria-label`·`data-color`·숨긴 이미지 층의 `background-image`·장식용은 역할 없음·아이콘 `aria-hidden`·`<img>` 없음, `user-icon.js` 도형이 빌드 결과에 있음, nodenext `AvatarProps`와 `"primary"`·`alt` 누락 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과(첫 실행). foundation 460, icons 18, components 915(이전 853), docs 198(이전 191) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(`@tide-tds/components` patch). 티켓 20의 「Failed to import test file … Unexpected token '}'」는 이번 cold 실행에서 나지 않았다(테스트 실행 중에는 파일을 편집·포맷하지 않았다).
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 이미지를 `<img>`가 아니라 CSS 배경으로 그린다. 그래서 `srcSet`·`sizes`·`loading="lazy"`·`crossOrigin`·`referrerPolicy`와 Next `<Image>`를 쓸 수 없고, 화면 밖 Avatar도 이미지를 바로 받는다. 인쇄 시 배경 그래픽을 끈 브라우저는 사진 대신 fallback을 인쇄한다. 긴 목록에서 lazy loading이 필요해지면 client 변형(로드 이벤트로 `<img>` 숨김)을 따로 둘지 정해야 한다.
    2. `alt`를 필수로 했다(Badge `children`처럼). 장식용은 `""`를 명시한다.
    3. `color` 기본값 `gray`, `size`는 공통 4개(기본 `md` 40px), 아이콘은 원의 약 60%(16·20·24·28px).
    4. 이니셜(글자) fallback, 상태 점(온라인), AvatarGroup은 두지 않았다. 이니셜은 `children`을 받게 되면 이름 중복 읽기 규칙을 다시 정해야 한다.
    5. IconButton 안에 넣으면 IconButton의 아이콘 칸(`*:size-full`, md 20px·lg 24px)이 Avatar 크기를 덮는다. Do story는 `lg`(24px)로 두었다.
  - **다음 티켓 메모**: 33(Tag)은 ADR 0017 후속에 따라 Role을 받을지 따로 정한다(Avatar는 받지 않음). 표시만 하는 Component가 「불러오기 실패」 같은 브라우저 동작을 단언해야 하면 `screenshotTestId` 명령으로 화면을 찍어 비교한다(픽셀은 `pixelAt` 방식으로 canvas에서 읽는다). 22(Skeleton)는 Avatar 자리 표시용으로 `rounded-full` 크기를 Avatar size와 맞추면 된다.
