# Foundation·Component 화면 리뷰

2026-11-12, Storybook 정적 빌드의 story를 light·dark로 찍어 Foundation과 Component 33개를 훑었다. 색 값·대비 기준은 같은 시기에 다른 작업(ADR 0023 대비 기준 차등)이 다루므로 이 리뷰에서 제외했다.

## 고친 것

- **조작 요소 `sm` 글자 12px → 14px**: [ADR 0024](../../decisions/0024-control-text-sizes.md). Input·Select·Combobox `sm`은 입력한 값까지 12px였다.
- **Switch 라벨 `body-*`, 목록 항목 14px**: 아래 판단 항목에서 정했다(ADR 0024 §2·§3).

## 문제 아님으로 확인

- Tabs 패널·Accordion 트리거에 포커스 링이 보이는 것은 story `play`가 키보드 포커스 a11y를 보려고 일부러 넣은 상태다.

## 판단 항목

### 정함: Switch 라벨만 굵기가 다르다

**결정(사용자, 2026-11-13): (a) 맞춘다.** ADR 0024 §2.

Checkbox·Radio 라벨은 `body-*`(보통 굵기 400)인데 Switch 라벨은 `label-*`(500)다. 같은 화면에 둘을 섞으면 선택 컨트롤 라벨의 굵기와 크기(md 기준 Checkbox 16px, Switch 14px)가 다르다.

- 고를 수 있는 길: (a) Switch를 `body-sm`/`body-md`/`body-lg`로 바꾼다(track과 첫 줄 가운데 맞춤을 다시 잡아야 함). (b) 지금처럼 둔다. 설정 목록의 라벨 성격이라 굵게 둔다는 근거를 문서에 적는다.

### 정함: 목록 항목 글자가 트리거보다 크다

**결정(사용자, 2026-11-13): (a) 맞춘다.** ADR 0024 §3.

Menu·Select·Combobox 목록 항목은 `body-md`(16/24, 높이 36px)인데, 트리거(Button·Select `md`)는 14px다. Select를 열면 같은 값이 14px → 16px로 커져 보인다.

- 고를 수 있는 길: (a) 항목을 `body-sm`(14/20, 높이 32px)으로 내려 트리거와 맞춘다. (b) 지금처럼 둔다. 한글 목록의 읽기 쉬움을 우선한 결정(티켓 27)으로 본다.
