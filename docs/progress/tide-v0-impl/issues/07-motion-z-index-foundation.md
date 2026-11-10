# 07: motion·z-index Foundation

Status: done
Blocked by: 06 (radius·Elevation·포커스 표시 Foundation)

## What to build

앱 개발자가 `duration-fast`, `duration-normal`, `ease-out`을 쓰고, 시간을 적지 않은 `transition-colors`도 Tide 기본값을 따른다. 쌓임 단계를 `z-modal` 같은 class로 쓰고, 100 간격 사이에 자기 단계를 끼울 수 있다. 이로써 Foundation이 완성된다.

## 수용 기준

- [x] duration `fast` 150ms, `normal` 300ms(`--transition-duration-*`). easing은 `out` 하나다.
- [x] `--default-transition-duration`과 `--default-transition-timing-function`을 Tide 값으로 지정한다.
- [x] 공개 계약 `--tide-duration-fast`, `--tide-duration-normal`, `--tide-ease-out`.
- [x] 쌓임 단계: `--z-index-*` namespace, `sticky` 100, `modal` 200, `popover` 300, `toast` 400, `tooltip` 500. 공개 계약은 `--tide-z-*`다.
- [x] tailwind-merge 설정이 z-index와 duration 이름 충돌을 해결한다(`z-modal`, `duration-fast`).
- [x] `unit`: 컴파일한 CSS에 z-index 5개와 duration 2개, 기본 transition 값이 있다. 공개 계약 목록이 갱신된다.
- [x] 문서: motion 블록(재생 가능)을 Token 원본에서 그린다. z-index 페이지에 sticky 헤더용 `scroll-padding-top` 가이드를 둔다.

## Comments

- 2026-11-10 완료(브랜치 `ticket/07-motion-z-index`).
  - **근거 버전**: tailwindcss·@tailwindcss/node·@tailwindcss/vite 4.3.5, tailwind-merge 3.7.0, vitest·@vitest/browser-playwright 5.1.0, playwright 1.65.0, storybook 10.6.6. 새 의존성은 없다. `pnpm-lock.yaml`·`pnpm-workspace.yaml`·`package.json`은 바꾸지 않았다.
  - **API 확인**: context7 `/tailwindlabs/tailwindcss.com`(theme.mdx, transition-property.mdx. 문서 사이트는 버전이 없어 v4 최신 문서)에서 `--ease-*` namespace와 기본값, 시간 없는 transition class가 `--default-transition-duration`(150ms)·`--default-transition-timing-function`(`cubic-bezier(0.4, 0, 0.2, 1)`)을 읽는다는 것을 확인했다. `--z-index-*`·`--transition-duration-*` namespace는 문서 표에 없어 설치본 4.3.5 `dist/lib.mjs`(`z`의 `themeKeys: ["--z-index"]`, `supportsNegative`, `duration`의 `["--transition-duration"]`과 숫자 → ms 해석)와 `theme.css`(두 namespace 모두 기본값 없음)로 확인했다. 실제 출력은 4.3.5로 컴파일해 다시 확인했다: `@theme inline`의 `--default-transition-*`는 class 안에 그대로 들어가 `transition-duration: var(--tw-duration, var(--tide-duration-fast))`가 되고, 출력 CSS에 `--default-transition-*` 변수와 Tailwind 기본 150ms·`cubic-bezier(0.4, 0, 0.2, 1)`이 남지 않는다. `motion-safe:`는 `@media (prefers-reduced-motion: no-preference)`로 나온다. 앱 `@theme`의 `--z-index-banner`는 `z-banner`를 만든다(문서 예시). tailwind-merge는 설치본 3.7.0 `bundle-mjs.mjs`의 class group `z`(`isInteger`, `auto`, 임의 값), `duration`(`isNumber`, `initial`, 임의 값), `ease`(theme `ease` = `in`/`out`/`in-out`)로 확인했다.
  - **Token**: `packages/foundation/src/motion.ts`(`duration` fast/normal, `easing` out), `packages/foundation/src/stacking.ts`(`zIndex` 5단계, 숫자). 루트 export에 Token 객체 3개와 타입(`DurationName`, `EasingName`, `ZIndexName`)을 더했다. 새 도우미가 없어 internal은 바꾸지 않았다.
  - **공개 계약**(tokens.css): `--tide-duration-fast`/`normal`, `--tide-ease-out`, `--tide-z-<단계>`를 Theme 무관 `:root` 블록에 둔다. 이름은 `--tide-<Utility class 이름>` 규칙(`z-modal` → `--tide-z-modal`)을 따른다. spec motion·z-index 항목에 공개 계약 위치와 남는 기본값을 한 줄씩 더했다.
  - **tailwind.css**: `@theme inline`에 `--transition-duration-<이름>`, `--ease-out`, `--z-index-<이름>`을 공개 계약에 연결하고 `--default-transition-duration: var(--tide-duration-fast)`, `--default-transition-timing-function: var(--tide-ease-out)`을 더했다. 기본 theme에 duration·z-index 값이 없어 `initial`로 지울 것이 없다. `ease-in`, `ease-in-out`은 티켓 21대로 남겼다. 숫자 해석(`duration-150`, `z-10`)은 끌 수 없어 그대로다.
  - **tailwind-merge**: `extend.classGroups`에 `duration: [{ duration: ["fast", "normal"] }]`, `z: [{ z: [5단계] }]`. 그래서 `duration-fast duration-normal` → `duration-normal`, `z-10 z-modal` → `z-modal`, `z-popover z-[350]` → `z-[350]`이고 Tide에 없는 `z-dropdown`, `duration-slow`는 분류하지 않는다. easing은 기본 theme에 `out`이 있어 바꾸지 않았다.
  - **테스트**: foundation `unit` 364 tests(334 → 364). `tokens.test.ts`(공개 계약 목록, :root 블록 구성, duration 2개·easing 1개·z-index 5개 값과 100 간격), `tailwind.test.ts`(duration·z 5개 class가 공개 계약을 가리킴, 시간 없는 `transition`·`transition-colors`·`opacity`·`transform`·`shadow`가 fast·out, Tailwind 기본 transition 값이 남지 않음, `ease-in`/`in-out` 남음, `motion-safe:` variant, 숫자 해석 남음), `tailwind-merge.test.ts`, `exports.test.ts`. desktop `browser`(`src/foundation-motion.test.tsx`, chromium과 forced-colors·reduced-motion instance에서 5개씩): `transition-colors` 계산값 0.15s·`cubic-bezier(0, 0, 0.2, 1)`(reduced-motion instance에서도 같음), `duration-fast`/`normal`·`ease-out`, `motion-safe:transition-[opacity,translate] motion-safe:duration-normal`이 reduced-motion에서 빠져 `opacity`·0.15s로 돌아옴(분기가 두 instance에서 각각 도는지도 단언), `z-<단계>` 계산값, DOM 순서를 거꾸로 둬도 `elementFromPoint`가 popover → 앱 단계 `z-[250]` → modal 순서. desktop `unit`의 `cn`에 쌓임 단계·duration 경우를 더했다. smoke: 앱 코드에 `sticky z-sticky transition-colors`, `transition-opacity duration-normal ease-out`을 쓰고 출력 CSS에 `.duration-normal`·`--tide-duration-normal`, `.transition-colors`·`--tide-duration-fast`·`--tide-ease-out`(그리고 `--default-transition-duration` 없음), `.z-sticky`·`--tide-z-sticky`가 있는지.
  - **대조 실험**: dist `tailwind.css`에서 `--default-transition-*` 두 줄을 잠시 지우면 browser 테스트 2개가 `cubic-bezier(0.4, 0, 0.2, 1)`(Tailwind 기본 곡선)을 받아 실패했다. 되돌렸다.
  - **문서**: `Foundation/움직임`(`apps/docs/src/foundations/Motion.mdx`)과 `Foundation/쌓임 단계`(`Stacking.mdx`) 두 페이지로 나눴다. 블록 `Motion`은 Token 원본(`duration`, `easing`)을 import해 단계·값·쓰는 곳을 적고, 재생 버튼으로 공개 계약 변수(`--tide-duration-*`, `--tide-ease-out`)를 inline style로 쓴 이동을 돌린다. easing 곡선은 `easing.out`의 `cubic-bezier` 값을 읽어 SVG로 그린다. OS 움직임 줄이기가 켜져 있으면 이동 대신 opacity 전환으로 보여 준다. 움직임 페이지에는 티켓 21의 「무엇을 움직이나」 표, `transition-all` 금지, `motion-safe:` 규칙, Theme 전환 링크를 뒀다. 블록 `StackingTiers`(`zIndex`에서 겹친 카드와 표)와 `StickyHeaderScrollPadding`(스크롤 영역에 `scroll-pt-14`, `sticky top-0 z-sticky h-12` 헤더, Tab으로 확인)을 쓰고, 쌓임 단계 페이지에 `scroll-padding-top` 가이드(WCAG 2.4.11, `<html className="scroll-pt-16">`, Tailwind 없는 CSS, 앵커 링크·아래 고정 영역), 내 단계 끼우기(`z-[250]`, 앱 `@theme`의 `--z-index-*`와 그 이름은 `cn`이 모른다는 점), 내부 겹침 `isolate` 규칙, top-layer 미사용을 적었다. 티켓 10의 `ThemeSwitching.mdx`에는 색 전환이 `transition-colors`·`duration-fast`(`--tide-duration-fast`, 150ms)라는 문장과 움직임 페이지 링크를 더했다(끄는 방법 코드는 그대로다). storybook project가 렌더·axe를 통과했다(docs 45 → 48 tests).
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/*/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force`(15개 태스크) 통과. foundation 364 tests, icons 18 tests, desktop 96 tests(85 → 96: browser 새 5개 × instance 2, unit cn 1개), docs 48 tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(새 changeset 1개, `@tide-tds/foundation` patch).
  - **판단 보류(추천안대로 구현)**:
    1. Token 객체 이름과 파일: `duration`·`easing`(`motion.ts`), `zIndex`(`stacking.ts`). spec은 공개 계약 CSS 변수만 정하고 JS 이름은 정하지 않았다.
    2. 문서를 「움직임」과 「쌓임 단계」 두 페이지로 나눴다(spec은 「z-index 페이지」를 따로 말한다).
    3. 음수 class(`-z-modal`)는 Tailwind가 `supportsNegative`로 만든다. 막을 방법이 없고 쓸 일도 없어 문서에 적지 않았다.
