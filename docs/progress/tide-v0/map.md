# Tide v0 지도

Label: wayfinder:map

## Destination

Tide v0를 `/to-spec`에 넘길 수 있는 상태. 원칙(Principle)은 최종 문안이 `docs/principles/`에 완성되어 있고, Foundation과 Component는 결정이 모두 끝나 있다. Component는 목록, 우선순위, 공통 API 규칙까지만 정한다. 컴포넌트별 세부 API는 spec 단계에서 정한다.

## Notes

- **도메인**: `#3183f5`(blue)를 primary로 하는 범용 디자인 시스템. 개인 사이드 프로젝트이자 포트폴리오이며 npm에 공개 배포한다. 한글을 우선으로 하고 영문을 병행한다.
- **먼저 읽을 것**: `GLOSSARY.md`, `docs/decisions/`(ADR), `docs/research/`
- **grilling 티켓**: Skill `mattpocock-skills:grilling`과 `mattpocock-skills:domain-modeling`을 함께 호출한다.
- **research 티켓**: 결과는 `docs/research/<주제>.md`에 main 브랜치로 커밋한다. 별도 `research/*` 브랜치는 만들지 않는다(wayfinder 기본 동작을 바꾼 부분).
- **라이브러리 API**: 기억에 의존해 추측하지 않는다. 실제 버전을 확인한 뒤 context7 또는 공식 문서로 검증하고, 근거가 된 버전을 문서에 적는다.
- **"Plan, don't do"의 예외**: 원칙(Principle)은 지도 안에서 최종 문안까지 `docs/principles/`에 작성한다. 파운데이션과 컴포넌트는 결정만 한다.
- **모든 문서는 한글로 작성한다.**

### 지도를 그리면서 이미 확정한 것

- [ADR 0001](../../decisions/0001-framework-agnostic-tokens-react-components.md): Token/CSS는 프레임워크 무관, v0 Component는 React 전용
- [ADR 0002](../../decisions/0002-monorepo-tailwind.md): pnpm workspace 모노레포와 Tailwind. Component를 쓰는 앱도 Tailwind가 peer로 필요함. 기본 컬러 팔레트는 교체하고, 간격은 Tailwind 숫자 규칙을 유지함
- 모노레포 태스크 러너는 Turborepo(pnpm workspace 위에 얹음). 구성은 「모노레포 패키지 구조와 빌드 결정」에서 정함
- 의존성 버전은 pnpm catalog(`catalog:` 프로토콜)로 한곳에서 관리함
- Token은 Primitive와 Semantic 두 층으로 나눔. light와 dark Theme 모두 v0에 포함함
- Component 내부의 색은 Semantic Token만 씀
- 접근성은 WCAG 2.2 AA를 최소 기준으로 삼음
- `#3183f5`는 브랜드 기준색으로 스케일 안에 둠. 흰색 대비가 약 3.7:1이라 AA에 못 미치므로, 텍스트와 solid 배경에는 더 진한 단계를 씀
- 공개 문서 사이트는 Storybook 하나로 함(MDX 사용)
- Tailwind는 최신 안정 버전을 씀. className 충돌 처리는 Component 공통 API 규칙 티켓에서 다룸
- **배포 목표**: npm scope는 `@tide-tds`. Next.js(App Router) 앱에서 `@tide-tds/<패키지>`로 import해 바로 쓸 수 있어야 함. 패키지는 `@tide-tds/foundation`과 `@tide-tds/desktop`([ADR 0006](../../decisions/0006-foundation-and-target-packages.md))
- 리서치 대상: Material 3, IBM Carbon, Atlassian, GitHub Primer, Radix Colors/Themes, 당근 SEED Design

## Decisions so far

<!-- 닫힌 티켓마다 한 줄: [티켓 제목](issues/NN-slug.md): 답 요약 -->

- [레퍼런스 디자인 시스템의 원칙 조사](issues/01-research-principles.md): 시스템마다 원칙은 3~6개. "A가 B보다 우선" 형식을 기본으로 쓰는 곳은 Atlassian뿐. 원칙과 ADR을 연결한 사례는 없음
- [컬러 시스템과 Token 구조 조사](issues/02-research-color-token.md): 스케일은 10~12단계. `#3183f5`의 흰색 대비는 3.69:1. 생성 알고리즘 결과가 원래 hex와 정확히 맞지 않으므로 앵커 단계는 원래 값으로 고정해야 함. 생성 방법 후보 5가지 정리
- [Tailwind theme 노출과 자동완성 조사](issues/03-research-tailwind.md): Tailwind 4.3.5. `@theme`와 `--color-*: initial`로 기본 팔레트만 교체할 수 있음. node_modules는 `@source`로 등록해야 스캔됨. 커스텀 이름은 tailwind-merge에 직접 등록해야 함
- [한글 타이포그래피 조사](issues/04-research-korean-typography.md): 11,172자 전체와 동적 subset을 공식 제공하는 폰트는 Pretendard와 Noto Sans KR뿐. 본문 행간 약 1.5, 자간 0
- [모노레포 툴링 조사](issues/05-research-monorepo-tooling.md): 최신 버전끼리 충돌은 없음. TS 7에 프로그래밍 API가 없어 TS 6 병행 여부가 쟁점. d.ts 생성은 별도 도구가 필요함. oxfmt는 아직 beta
- [레퍼런스 Component 구성과 공통 API 관례 조사](issues/06-research-component-conventions.md): 초기 버전 Component는 26~44개. 스타일 축은 `variant`가 가장 흔함. shadcn은 새 프로젝트 기본값을 Base UI로 바꿈. Radix에는 약 10개월 릴리스 공백이 있었음
- [Tide 원칙 확정](issues/07-grilling-principles.md): 원칙 4개를 "A가 B보다" 형식으로 정함. ① 접근성 > ② 명확함 > ③ 단순함 > ④ 발견할 수 있음. WCAG는 Standard로 분리했고, ADR마다 근거 원칙을 적음
- [컬러 스케일 후보 시각 비교](issues/08-prototype-color-scale.md): A(OKLCH L 계단, 50~950의 11단계, blue 500은 `#3183f5`로 고정)를 채택함. 모든 계열에서 흰 배경 4.5:1을 처음 넘는 단계는 600. gray 초안, 상태색 hue, dark 반전 매핑은 문제없다고 봄
- [Next.js App Router 호환성 조사](issues/17-research-nextjs-consumption.md): Next.js 16.4.5. Vite 8 기본 빌드는 `"use client"`를 지우므로 `preserveModules` 등이 필요함. 컴파일된 ESM dist를 배포하면 `transpilePackages`가 필요 없음. 폰트는 앱이 로드함
- [컬러 Foundation 결정](issues/09-grilling-color-foundation.md): 역할 6개 × 속성 6개(bg, text, border, focus-ring, overlay, shadow). dark Theme은 같은 스케일 반전. solid는 두 Theme 모두 600, 역할 text는 800/200. Primitive 정본은 hex. 명시한 대비 쌍 128개를 WCAG 2.x 대비비로 CI에서 검사(APCA는 쓰지 않음)
- [Token 네이밍과 Utility class 노출 규칙 결정](issues/10-grilling-token-naming.md): Semantic 색은 Tailwind 속성별 namespace(`bg-primary-solid`, `text-muted`)로 노출하고 CI로 확인함. 공개 계약은 `--tide-*`. Primitive 계열은 색상 이름(blue/gray/green/amber/red/cyan). Theme은 `[data-theme]`. 원본은 TS 객체와 직접 만든 스크립트([ADR 0003](../../decisions/0003-token-source-and-utility-namespaces.md))
- [타이포그래피 Foundation 결정](issues/11-grilling-typography.md): Pretendard Variable을 우선하는 스택. 웹폰트 로드는 앱이 함. 단위는 rem이고 루트 16px 유지. class로는 텍스트 스타일 14개(display, heading, body, label, caption)만 노출하고, 스타일마다 크기·행간·굵기가 묶임. display와 heading-xs는 「v0 Component 목록과 우선순위 결정」에서 추가함. 굵기는 300~700의 5개, 자간 0, base CSS에 `keep-all`
- [v0 Foundation 범위 결정](issues/12-grilling-foundation-scope.md): 간격과 breakpoint는 Tailwind 기본값 유지, radius(sm/md/lg/xl/full)와 그림자는 교체. focus ring 형태, motion(최소), z-index 층, 아이콘을 v0에 넣음. border width와 opacity는 Token을 두지 않음
- [접근성 동작 구현 방식 결정](issues/13-grilling-headless.md): 구조와 스타일은 직접 구현하고, 접근성 동작은 React Aria hooks(`react-aria`, `react-stately`)로 가져옴. 네이티브 HTML로 완결되는 요소에는 hook을 쓰지 않음. 외부 컴포넌트 라이브러리는 기본적으로 쓰지 않고, 필요하면 사용자에게 물음([ADR 0004](../../decisions/0004-react-aria-hooks-own-markup.md))
- [Component 공통 API 규칙 결정](issues/14-grilling-component-api.md): React 19 이상, `ref`는 일반 prop. 스타일 축은 `variant`(solid/subtle/outline/ghost) × `color`(Role 6개) × `size`(xs/sm/md/lg, 높이 24~48px)이고, Component마다 `Extract`로 필요한 값만 고름. 병합은 `cn`(clsx + 생성된 tailwind-merge 설정), variant 맵은 직접 작성(cva·tv 안 씀). 조합은 `render` prop([ADR 0005](../../decisions/0005-hand-written-variant-maps-and-render-prop.md)). 공개 API는 DOM 이름을 쓰고 콜백 인자는 값 하나
- [v0 Component 목록과 우선순위 결정](issues/15-grilling-component-list.md): 33개를 의존 순서에 따라 5단계로 나눔(기반 → 액션·폼 → 표시·피드백 → hook 위젯 → Toast). Heading과 Text는 Typography 하나로 합침. Variant를 "Component마다 정의되는 스타일 축"으로 넓혔고, `render` 범위도 넓힘(ADR 0005 정정). 뺀 것은 모두 v0 이후 후보
- [npm scope @tide-tds 확보](issues/18-task-npm-scope.md): org `tide-tds`를 만들어 scope를 확보함(owner `charles-green`, 2FA 켜짐). 예비 org로 `tide-green`, `tide-factory`도 있음. `@tide`는 다른 사람이 쓰고 있어 쓸 수 없음
- [Next.js 소비 흐름 end-to-end 검증](issues/19-prototype-nextjs-consumption.md): `preserveModules` 빌드에서 `"use client"`가 남음. 패키지 CSS 안의 `@source "./"`와 `exports` 경로 `@import`가 pnpm에서 동작하고, IntelliSense에도 뜸. d.ts는 TS 7 `tsc`로 만들 수 있음(`vite-plugin-dts`는 TS 6이 필요함). workspace symlink로 연결한 앱에만 `transpilePackages`가 필요함
- [모노레포 패키지 구조와 빌드 결정](issues/16-grilling-monorepo-structure.md): 배포 패키지는 `@tide-tds/foundation`(Token, `tokens.css`, `tailwind.css`, tailwind-merge 설정)과 `@tide-tds/desktop`(desktop Target React Component, `styles.css`) 두 개이고, Storybook은 private `apps/docs`([ADR 0006](../../decisions/0006-foundation-and-target-packages.md)). TS 7.0.2 단독(Storybook은 `react-docgen` 기본값 고정). desktop은 Vite `preserveModules` + `tsc` d.ts, ESM 전용. react-aria는 dependencies, React·Tailwind는 peer. turbo 태스크는 build, typecheck, test, dev. catalog는 기본 하나에 `strict`
- [radius·elevation·focus ring 형태 결정](issues/20-grilling-shape-radius-elevation-focus.md): radius는 Tailwind 기본값과 같은 4/6/8/12px/full이고 size와 짝짓지 않음(조작 요소는 모두 `md`). 그림자는 raised에서만 쓰는 sm/md/lg 3단계, 2레이어, dark에서도 그림. 포커스 표시는 입력창용 field(테두리 색 + 2px, `:focus`)와 나머지용 ring(outline 2px, offset 2px, `:focus-visible`)으로 나눔(토스증권 참고). `focus-ring`, `focus-field` Utility class 제공. 그림자 숫자는 24번 prototype에서 확정. 21번에서 목록 안 항목 radius `sm`(중첩 규칙)과 light raised의 투명 border(forced-colors)를 보완함
- [motion Foundation 결정](issues/21-grilling-motion.md): jakub.kr 자료를 참고해 "자주 쓰는 UI일수록 덜 움직인다"를 기준으로 삼음. duration은 `fast` 150ms, `normal` 300ms 두 단계, easing은 `ease-out` 하나. Menu·Select 목록·Tooltip은 바로 나타나고 사라질 때만 fade. Popover·Toast·Dialog는 300ms로 나타나고 150ms로 약하게 사라짐. 목록 항목 hover는 바로 바뀜. Button은 누르면 0.96으로 축소(`static`으로 끔). 이동·확대·blur는 `motion-safe:`일 때만 쓰고, 줄이기를 원하면 opacity 전환으로 바꿈. Theme 전환 시 transition 끄기는 가이드로만 제공

## Not yet specified

- **Storybook 문서 구성**: 원칙, 파운데이션, 컴포넌트 페이지의 MDX 구조와 토큰 시각화 방식. 폰트 로드 가이드(next/font/local, CDN 동적 subset)와 텍스트 스타일 시각화 페이지 포함. 원칙별 Do/Don't 예시를 실제 Component로 렌더링하는 것과, Theme 전환 시 transition을 끄는 가이드(motion Foundation 결정)도 포함.
- **테스트 전략**: vitest로 어디까지 테스트할지, 시각 회귀 테스트와 접근성 자동 검사를 넣을지. `pnpm pack` tarball을 Next 앱에 설치하는 smoke test(`"use client"` 보존, d.ts의 nodenext 해석 확인 포함)를 어디서 언제 돌릴지도 포함.
- **버전과 배포 정책**: changesets 등 릴리스 흐름, v0의 semver 정책. CI publish 인증(trusted publishing, 토큰)과 npm의 2FA 우회 토큰 제한에 대한 대응도 포함.

## Out of scope

- Vue, Svelte 등 React 외 프레임워크용 Component (ADR 0001)
- Storybook 외 별도 문서 사이트
- 특정 서비스 전용 Component
- mobile Target Component(`@tide-tds/mobile`, 터치 중심 모바일 웹). 이름 공간만 정해 둠. 이유는 [ADR 0006](../../decisions/0006-foundation-and-target-packages.md)
- v0 이후 후보 Component: Box/Stack/Flex/Grid, DatePicker/Calendar, DataTable, Combobox 확장, Slider, Drawer/Sheet, 토글 Chip. 이유는 [v0 Component 목록과 우선순위 결정](issues/15-grilling-component-list.md)에 있음
