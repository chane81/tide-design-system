# 49: 테스트 픽스처·예시 색을 Tide 값으로

Status: done
Blocked by: 48 (solid 덜 진하게 후속(브랜드 색 안내))

## What to build

저장소가 공개라 외부 팔레트 색 값을 넣지 않는다. [판단 보류 목록](../../tide-color-tone-impl/review-backlog.md) 「티켓 04」의 「외부 팔레트 값이 코드에 남아 있다」를 사용자가 2026-11-13 「Tide 값으로 바꾼다」로 정했다. 픽스처, JSDoc 예, 그 밖에 같은 출처로 보이는 값을 Tide 방식으로 만든 값으로 바꾼다.

- 앱 브랜드 계열 예(픽스처, JSDoc, Component 테스트, Storybook 예시, smoke 앱)는 브랜드 색 문서의 예시 스케일(600 `#a85c81`, 티켓 48)을 다시 쓴다.
- 밝은 계열 픽스처(yellow)는 Tide 방식으로 새로 만든다. 기본 규칙으로는 대비가 모자라고 overrides로 고치면 통과하는 테스트 의도를 지킨다.
- 과거 결정 기록(티켓, 리서치)에 인용된 값은 고치지 않고 이 티켓에 기록한다.

## 수용 기준

- [x] 픽스처·JSDoc·테스트·예시에 외부 팔레트와 같은 값이 남지 않는다(과거 기록 제외).
- [x] brand 픽스처는 대비 쌍을 모두 통과하고, yellow 픽스처는 전과 같은 쌍에서 미달하고, overrides 픽스처는 모두 통과한다.
- [x] CLI 테스트 기대 출력을 새 값에 맞춘다. 같은 경로(통과, 미달 exit 1, 덮어쓰기)를 검증한다.
- [x] 판단 보류 항목에 처리 결과를 덧붙인다.
- [x] changeset 판단.

## Comments

- 2026-11-13 완료.
  - **찾은 곳**: 저장소의 hex를 모두 모아 외부 팔레트 값과 비교했다. 같은 보라 브랜드 스케일 11단계가 foundation 픽스처·JSDoc·`color-name.test.ts`(테스트 전용 계열), components 테스트 9개(Alert, Badge, Button, Checkbox, IconButton, Link, Radio, Switch, foundation-color), Storybook 예시 2개(Button, IconButton stories), smoke 앱 `brand.ts`에 있었다. yellow 픽스처 11단계와 Badge 테스트의 다른 600 하나(`leaf` 계열)도 외부 값이었다.
  - **brand 계열**: 단계별로 브랜드 색 문서 예시 스케일 값으로 바꿨다(50 `#fcf0f5` … 600 `#a85c81` … 950 `#5c1d3f`). 테스트들은 슬롯이 가리키는 단계의 hex를 그대로 비교하므로(solid 600, dark subtle 950, dark border 400, text 700 등) 같은 단계 값으로 바꾸면 검증 경로가 같다. 이 스케일은 대비 쌍 32개를 모두 통과한다(흰 글자 × 600 4.65:1).
  - **테스트 전용 계열 이름**: `color-name.test.ts`가 Primitive에 더하는 계열 이름을 `violet`에서 `pink`로 바꿨다. 값이 분홍 계열이 되어 이름을 맞췄다. Tide 이름과 겹치지 않는다.
  - **Badge `leaf`**: 다른 600을 Tide green-600 `#428a55`로 바꿨다.
  - **yellow 픽스처**: OKLCH 색상 100 고정, 티켓 08의 채도 곡선 × 최대 0.17, sRGB를 벗어나면 채도만 줄이는 Tide 방식으로 만들었다. 밝은 계열이라 명도는 권장 범위보다 밝게 두었다(L 0.985/0.965/0.935/0.895/0.855/0.80/0.70/0.535/0.47/0.415/0.31). 값: 50 `#fbfaf3`, 100 `#f7f4e3`, 200 `#efebcc`, 300 `#e7dea6`, 400 `#e1d176`, 500 `#d4bf3a`, 600 `#b49f03`, 700 `#7c6e03`, 800 `#685b00`, 900 `#574c01`, 950 `#383102`.
  - **픽스처 의도 확인**: 기본 규칙에서 전과 같은 7쌍이 미달한다(light·dark on-solid × solid·solid-hover, light border × 표면 3층). 25/32 통과도 전과 같다. 흰 글자 × 600은 2.94에서 2.66:1이 되어 CLI 테스트 기대 문자열만 바꿨다. `yellow-overrides.ts`는 32/32 통과하고, on-solid만 950으로 덮은 계열은 on-solid × solid를 통과한다. light text 800 덮어쓰기는 이제 필요 없지만(700도 통과) 덮어쓰기 경로를 남기려고 그대로 두고 주석을 고쳤다.
  - **스냅숏**: `role-regression` 스냅숏은 Tide Role 값이라 바뀌지 않았다.
  - **남긴 곳(과거 기록)**: 티켓 13·16·17 Comments에 이전 브랜드 600 값이 인용돼 있고, 판단 보류 목록 원문에 이전 JSDoc 값이 있다. `docs/research/color-and-token-structure.md`는 외부 디자인 시스템의 이름·출처 링크·색 값을 조사 기록으로 인용하고, 티켓 08은 명도 계단의 출처를 외부 프레임워크 이름으로 적는다. 이 티켓은 기록만 하고 고치지 않았다. 공개 규칙에 맞추려면 리서치 문서에서 이름·링크·값을 빼는 별도 티켓을 추천한다.
  - **changeset**: `color-family.ts` JSDoc이 배포 d.ts에 들어가므로 `@tide-tds/foundation` patch, Storybook 예시 색이 바뀌어 `@tide-tds/docs` patch(규칙 4에 따라 파일을 나눴다). components는 테스트만 바뀌어 따로 두지 않았다(고정 버전 묶음이라 foundation patch와 같이 오른다).
