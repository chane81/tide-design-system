# 45: 색 스케일 블록을 계열 카드와 큰 타일로

Status: done
Blocked by: 40 (열린 색 이름과 앱 브랜드 색 계열)

## What to build

문서 사이트 컬러 Foundation의 「색 스케일」은 계열마다 작은 색 막대 아래에 이름·hex·대비비를 4줄로 적어 글자가 막대 밖으로 늘어진다. 계열마다 카드 하나에 11단계를 한 줄의 큰 타일로 두고, 단계 정보는 모두 타일 안에 적어 깔끔하게 보이게 한다. 계열 색이 실제로 어떻게 쓰이는지 타일 아래 견본 줄로 보여 준다. 2026-11-12 사용자 결정.

## 수용 기준

- [x] 계열마다 카드 하나. 제목은 굵은 계열 이름 + 흐린 Role 이름(장식 계열은 「장식」). white·black 묶음도 같은 카드·타일 형식.
- [x] 11단계(50~950)를 둥근 모서리 타일 한 줄로 두고 타일끼리 작은 간격을 둔다. 타일 밖에는 글자를 두지 않는다(스크린리더용 숨김 텍스트만 예외).
- [x] 타일 안 세 줄: 굵은 단계 숫자, 고정폭 hex, 고정폭 OKLCH 채도(`C 0.188`, 소수 셋째 자리).
- [x] 타일 글자색은 바탕에 따라 대비가 더 높은 쪽을 자동으로 고르고, 4.5:1 이상인지 테스트로 확인한다(원칙 ① 접근성).
- [x] 스크린리더에는 전체 이름(`blue-50`)을 읽히고 목록 의미를 유지한다.
- [x] 타일 아래 「쓰임」 패널에 이 계열로 칠한 실제 Component를 둔다(Role 계열: Badge 세 강도·Button 두 채움·Link, 장식 계열: Badge 세 강도·accent 글자).
- [x] 좁은 폭에서 11칸이 깨지지 않는다.
- [x] dark Theme에서 카드·제목·견본이 읽힌다. 카드는 Semantic class만, 임의 hex는 타일 바탕과 글자색에만 쓴다.
- [x] 값은 foundation 원본에서 읽는다.
- [x] OKLCH 채도 변환을 단위 테스트로 확인한다(blue-500 C ≈ 0.188, white·black C 0.000).
- [x] Color.mdx 「색 스케일」 설명을 새 표기에 맞춘다.
- [x] changeset 판단.

## Comments

- 2026-11-12 완료(main 00e7e05 위로 rebase).
  - **근거 버전**: react 19.3.1, storybook·@storybook/addon-vitest 10.6.6, vitest 5.1.0(Chromium). 새 의존성 없음. 새로 쓴 라이브러리 API는 없다(기존 `@tide-tds/components`의 `Card` `render`, `Badge`·`Button`·`Link` `color`, `VisuallyHidden`, `storybook/test`의 `expect`·`within`을 같은 저장소의 다른 story와 같은 방식으로 썼다).
  - **구현**:
    - `apps/docs/src/docs-blocks/colorTiles.ts`(새 파일): 카드·타일 데이터, 글자색 선택(`tileTextColor`), OKLCH 채도(`oklchChroma`·`formatChroma`). 값은 `color`·`roleFamily`·`colorFamilyNames`에서 읽는다.
    - `ColorScale.tsx`: Card(`render={<section aria-labelledby>}`) 안에 제목, 타일 `ul`, 「쓰임」 패널. 카드·제목·패널은 `Card`(bg-surface·border-default)와 `text-muted`·`border-default`만 쓰고, 인라인 스타일은 타일 바탕·글자색뿐이다.
    - 스크린리더 이름: 타일 첫 줄 앞에 `VisuallyHidden`(`sr-only`)으로 `blue-`를 넣어 `blue-50`으로 읽힌다. `aria-label`은 `li`에서 읽히지 않는 보조기술이 있어 쓰지 않았다. `ul`/`li` 목록 의미는 그대로다.
  - **글자색 자동 선택**: 후보는 `black`(#000000)과 `white`(#ffffff), `contrastRatio`가 더 높은 쪽(같으면 검정). 두 후보 중 높은 쪽은 어떤 바탕에서도 √21 ≈ 4.58:1 이상이라 4.5:1을 늘 넘는다. 진한 글자 후보로 `gray-950`도 봤지만 500단계 여러 개(green·amber·red·cyan·purple·mint-500)에서 흰색·`gray-950` 둘 다 4.5:1 미만이라 뺐다. 실제 최저는 green-600 위 흰 글자 4.70:1이다.
  - **OKLCH 채도 위치**: foundation `src`에는 sRGB→OKLCH 변환이 없고, `packages/foundation/test/scale.test.ts`에 테스트용 L 계산만 있다. 채도는 문서 블록만 쓰므로 `colorTiles.ts`에 작은 함수로 두었다. foundation internal로 옮기면 foundation 공개 범위·changeset과 기존 테스트까지 바뀌어 범위가 커진다. 행렬은 OKLab 정의(Björn Ottosson, 2020)의 값이고 scale.test.ts와 같다. 다른 곳에서도 쓰게 되면 그때 internal로 옮긴다.
  - **좁은 폭 처리**: 블록 전체를 가로 스크롤 영역(`overflow-x-auto`, `tabIndex={0}`, `role="region"`, `aria-label="색 스케일"`)으로 감쌌다. Table 문서가 좁은 화면에 안내하는 방식과 같다. 줄바꿈 대신 스크롤을 고른 이유는 11단계가 한 줄이어야 단계 사이 명도 변화를 한눈에 비교할 수 있기 때문이다. 타일 최소 폭은 4.5rem이고, 문서 페이지(본문 폭 약 966px)에서는 스크롤 없이 11칸이 한 줄로 들어간다(scrollWidth = 폭, 로컬 확인). 스크롤 영역은 카드마다가 아니라 블록 하나라 Tab 정지가 하나다.
  - **쓰임 견본**: Role 계열은 Role 이름으로 Badge(`faint`·`subtle`·`solid`), Button(`solid`·`subtle`, `size="sm"`), Link를 둔다. gray는 Role `neutral`이라 Button·Link도 받는다. 장식 계열(purple·mint)은 Badge 세 강도와 `data-color` + `text-accent` 글자. 모두 등록된 대비 쌍이고 Scale story의 axe 검사를 통과한다. Link의 `href`는 자기 카드(`#color-scale-<계열>`)다.
  - **테스트**:
    - unit `colorTiles.test.ts`(8): 밝은/어두운 바탕 글자색, 고른 쪽이 높은 대비인지, 전 타일 4.5:1 이상, blue-500 `C 0.188`·white·black `0.000`, 8계열+white·black 카드, 11단계와 원본 값, Role/「장식」 표기.
    - storybook `색 스케일` play: 계열 카드마다 `listitem` 11개, white·black 2개, `blue-50` 접근 이름 텍스트, 렌더된 모든 타일의 계산된 글자색·바탕색 대비 4.5:1 이상.
  - **Color.mdx**: 「읽는 법」을 새 표기(Role 표기, 단계·hex·C, 자동 글자색, 대비는 「대비」 절)로 고치고 「쓰임」 한 줄을 더했다.
  - **changeset**: `@tide-tds/docs` patch(`.changeset/color-scale-tile-layout.md`). 문서 앱만 바뀌었고, ADR 0020·0021 표의 「docs만」 경우라 Storybook만 patch로 오른다. 기존 블록 개편이라 minor(추가와 개편)보다 patch로 봤다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `node scripts/check-changesets.ts main`, `pnpm turbo run typecheck test build --force` 14/14 통과. foundation 541, icons 18, components 1838, docs 303 tests. Icons 「검색」 flaky는 나지 않았다.
  - **화면 확인**: Storybook dev에서 light·dark로 문서 페이지와 story(1440px, 600px)를 캡처해 봤다(저장소에 넣지 않음). 600px에서는 블록이 가로로 스크롤된다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 진한 글자는 `gray-950`이 아니라 순수 검정이다(위 「글자색 자동 선택」). 부드러운 진회색을 원하면 500단계에서 4.5:1을 못 맞춘다.
    2. 타일 테두리 `border-default`를 모든 타일에 두었다. 밝은 50단계·white가 카드 바탕과 구분되게 하려는 것이다.
    3. 견본 Button은 `size="sm"`, 라벨은 「안내·확인·완료·저장·취소·자세히」(장식은 「분류」·「강조 글자」)로 정했다.
    4. changeset 단계를 patch로 봤다.
