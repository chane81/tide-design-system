# @tide-tds/docs

## 0.3.4

### 수정 (patch)

- [#34](https://github.com/chane81/tide-design-system/pull/34) [`c74eefd`](https://github.com/chane81/tide-design-system/commit/c74eefd91af40f786f7ea1fab6ecee864f7063f3) [@chane81](https://github.com/chane81) - 모양과 깊이·Input·Textarea·Select·Combobox·Field 문서를 오류 입력창의 포커스 표시(오류 색 2px)에 맞췄다.

## 0.3.3

### 수정 (patch)

- [#33](https://github.com/chane81/tide-design-system/pull/33) [`83df8f4`](https://github.com/chane81/tide-design-system/commit/83df8f42d65c7e6d9f7dffea83d162d9c7a3bee5) [@chane81](https://github.com/chane81) - Button·IconButton 예시의 앱 브랜드 색을 브랜드 색 문서 예시 스케일과 같은 값으로 바꿨다.

## 0.3.2

### 수정 (patch)

- [#30](https://github.com/chane81/tide-design-system/pull/30) [`681864b`](https://github.com/chane81/tide-design-system/commit/681864b63f84cb7c4fb1818343a4f45c693efc57) [@chane81](https://github.com/chane81) - Button·Color·브랜드 색 문서를 outline·ghost의 같은 색 호버·누름(`faint`·`subtle`)에 맞췄다. 「raised 안 outline·ghost는 `neutral`로」 안내를 지웠다.

## 0.3.1

### 수정 (patch)

- [#27](https://github.com/chane81/tide-design-system/pull/27) [`230e474`](https://github.com/chane81/tide-design-system/commit/230e474008d7dc704590de01ff40b2b25162c41b) [@chane81](https://github.com/chane81) - Button·Input·Textarea·Switch 문서의 size 표를 바뀐 글자 스타일(`sm` 14px, Switch 라벨 `body-*`)에 맞췄다.

- [#27](https://github.com/chane81/tide-design-system/pull/27) [`230e474`](https://github.com/chane81/tide-design-system/commit/230e474008d7dc704590de01ff40b2b25162c41b) [@chane81](https://github.com/chane81) - Foundation 「모양과 깊이」 문서의 `focus-field` 설명을 고쳤다. 투명 outline은 고대비 모드에서만 둔다.

- [#31](https://github.com/chane81/tide-design-system/pull/31) [`a2a59f0`](https://github.com/chane81/tide-design-system/commit/a2a59f06042ee5bbd2e60151e887df5ba0d442b1) [@chane81](https://github.com/chane81) - 「브랜드 색 더하기」 문서가 앱 브랜드 색의 600을 Tide solid처럼 덜 진하게(흰 글자 4:1 이상) 권한다. 권장 범위와 예시 스케일을 새 기준으로 고쳤다.

- [#28](https://github.com/chane81/tide-design-system/pull/28) [`104a6c9`](https://github.com/chane81/tide-design-system/commit/104a6c91d1117ed20c11844d1777d06c1944d2b7) [@chane81](https://github.com/chane81) - story의 axe 대비 검사가 Tide 하한 등급(ADR 0023)을 따른다. solid 위 글자와 대비 쌍 견본의 4:1 등급은 4:1로, 나머지 글자는 4.5:1로 검사한다. 색 스케일·대비 블록은 새 600 값을 보여 준다.

## 0.3.0

### 추가와 개편 (minor)

- [#25](https://github.com/chane81/tide-design-system/pull/25) [`418b7b8`](https://github.com/chane81/tide-design-system/commit/418b7b8363198a48b125ff1e6a427d3a097b8a47) [@chane81](https://github.com/chane81) - 컬러 Foundation 「대비」에 하한 세 등급(글자 4.5:1, 일시 상태·solid 위 글자 4:1, UI 요소 3:1) 표를 더했다. 대비 쌍 표가 등급 이름을 적고, 색 이름별 대비 표가 정지·호버·누름을 나눠 등급마다 최저값을 보여 준다. 브랜드 색 검사 표와 Component 문서의 대비 줄을 새 등급에 맞췄다.

## 0.2.1

### 수정 (patch)

- [#23](https://github.com/chane81/tide-design-system/pull/23) [`7568516`](https://github.com/chane81/tide-design-system/commit/7568516833fe78f43889170c6eae533691900c87) [@chane81](https://github.com/chane81) - 컬러 Foundation 「색 스케일」을 계열 카드와 큰 타일로 바꿨다. 11단계 타일 안에 단계·hex·OKLCH 채도를 적고 글자색은 바탕에 맞춰 대비가 높은 쪽(4.5:1 이상)을 고른다. 계열마다 실제 Badge·Button·Link로 칠한 「쓰임」 견본을 더했다.

## 0.2.0

### 추가와 개편 (minor)

- [#21](https://github.com/chane81/tide-design-system/pull/21) [`5bb63bc`](https://github.com/chane81/tide-design-system/commit/5bb63bccd73b4fc1f05ce3d37a842d365bcb3d40) [@chane81](https://github.com/chane81) - 컬러 문서를 파스텔 강도와 덮기 방식 호버에 맞춰 고쳤다(ADR 0022). 컬러 Foundation에 강도 세 가지(solid·subtle·faint), 파스텔 글자·테두리, `bg-hover`·`bg-active`, 슬롯 규칙 표를 더했고, 브랜드 색 더하기에 스케일 단계별 역할과 권장 범위를 적었다. Badge `faint` 예시를 더하고 Alert·Tag·Avatar·Button·Toast·Pagination·Table의 색 설명을 바뀐 슬롯에 맞췄다.

## 0.1.0

### 추가와 개편 (minor)

- [#11](https://github.com/chane81/tide-design-system/pull/11) [`3a81cf3`](https://github.com/chane81/tide-design-system/commit/3a81cf3890b9fd86b8a0207e09632ef648c6caca) [@chane81](https://github.com/chane81) - Storybook 문서 사이트에 TDS와 따로 가는 버전을 붙였다. 첫 Storybook 릴리스다. 이제 문서 사이트 변경 이력이 이 CHANGELOG에 남는다.
