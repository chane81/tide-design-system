# 04: 문서: 컬러 Foundation, 앱 계열 가이드, Component 문서

Status: done
Blocked by: 03

## What to build

[문서 작성 기준](../../../standards/docs-writing.md)을 따라 Storybook 문서를 고친다.

- `apps/docs/src/foundations/Color.mdx`: 강도 세 가지(solid·subtle·faint), 새 슬롯 셋, 덮기로 만드는 호버·클릭, `bg-hover`·`bg-active`, 장식 계열 purple·mint(의미 표시에는 Role을 쓴다는 Do/Don't). 슬롯 표와 견본이 Token에서 자동으로 나오는지 확인한다.
- `apps/docs/src/getting-started/BrandColor.mdx`: `defineColorFamily`에 넣는 11단계 스케일의 단계별 역할(50 faint, 100 파스텔 바탕, 200 테두리, 600 solid, 700 링크, 950 파스텔 글자)과 권장 밝기·채도 범위(ADR 0022 §4). 대비 검사가 무엇을 강제하는지.
- Badge 문서: `variant="faint"` 예와 쓰임(덜 중요한 표시).
- Alert·Tag·Button 문서의 색 설명이 바뀐 슬롯과 맞는지 확인한다.

## 수용 기준

- [x] 위 문서가 ADR 0022과 맞고, GLOSSARY 용어(강도, 덮기, accent 슬롯)를 쓴다.
- [x] 외부 제품 이름·값이 없다.
- [x] Storybook 빌드와 문서 테스트가 통과한다.
- [x] changeset(docs).

## Comments

### 2026-11-12 결과

- 바뀐 문서
  - `foundations/Color.mdx`: 강도 세 가지(표), 파스텔 글자·테두리 Token, 「호버와 누름」(덮기, `bg-hover`·`bg-active`), 공통 Token에 호버·누름 줄, accent class 손 표를 슬롯 Canvas로 바꿈, Do/Don't(뜻은 Role, 장식 계열로 뜻 나타내지 않기, subtle 위 바탕 없는 글자 쓰지 않기), 「표면에 따른 주의」(raised 위 outline·ghost는 neutral, subtle 안 ghost는 파스텔 글자), 색 이름별 대비 범위 표.
  - `getting-started/BrandColor.mdx`: 「단계별 역할」(50 faint, 100 파스텔 바탕, 200 파스텔 테두리, 600 solid·border, 700 text, 950 파스텔 글자)과 ADR 0022 §4 권장 범위, 대비 검사가 강제하는 쌍 표(범위·파스텔 테두리는 검사하지 않음), overrides의 덮기·섞기 값, 옛 슬롯 손 표를 슬롯 Canvas로 교체. 예시 스케일과 「Tide Role의 색을 바꿀 때」 값을 외부 팔레트 값에서 Tide가 만든 예시 값으로 바꿨다(권장 범위 안, `tide-color build` 32쌍 통과를 임시 파일로 확인 후 지움). 노랑 overrides 예는 CLI 테스트 픽스처와 같게 `text: { light: 800 }`를 더했다.
  - Badge: 채움 방식 표(subtle·faint·solid), 「덜 중요한 표시」 + `Faint` story, 「Don't: 급한 상태를 faint로 둔다」 + story, 대비 줄에 faint와 파스텔 테두리. neutral·gray faint가 dark에서 페이지와 같은 색이라는 사실을 적었다.
  - Alert(닫기 버튼 색, 경계 3:1 문장 삭제), Tag(on-subtle, 파스텔 테두리 검사 제외), Avatar(파스텔 글자), Button(채움 방식 표, 호버 설명, 대비 줄, 앱이 할 일에 raised·subtle 표면 안내), Toast(첫 줄 요약으로 줄이고 위치·시간은 해당 절로, 상태 문단, 대비 줄 정정), Pagination·Table(호버 배경 `bg-hover`, 현재 쪽 `text-primary-on-subtle`).
- 문서 블록: `ColorNames.tsx`에 `ColorSlotRules`(colorSlots·accentUtilities·slotRule에서 슬롯·class·단계를 그림, 쓰는 곳 설명은 `Record<ColorSlot, string>`이라 슬롯이 늘면 타입 검사가 실패), 색 이름 미리보기에 faint 열·파스텔 글자·테두리, 색 이름별 대비에 「파스텔 글자」 묶음. `Color.stories.tsx`에 `Slots` story. BrandColor는 `<Canvas of meta>`로 같은 story를 쓴다. 문서에 손으로 넣은 hex는 앱 입력 예시(BrandColor)뿐이다.
- changeset: `color-tone-docs.md`(docs minor). 쌓인 TDS changeset이 minor라 ADR 0021 자동 changeset과 같은 단계로 맞췄다(사람이 쓴 docs changeset이 있으면 자동으로 더하지 않는다).
- 검증: lint, format:check, typecheck, test(foundation 541, components 1838, docs 295, icons 18), build 통과.
- 라이브러리 근거: Storybook 10.6.6(설치본), context7 `/storybookjs/storybook/v10.6.5` doc-block-canvas 「Render story from unattached CSF file using meta prop」(`<Canvas of meta>`). oxfmt 0.77.0. 새 의존성 없음.
- backlog 처리 결과와 새 판단 보류는 [review-backlog.md](../review-backlog.md).
