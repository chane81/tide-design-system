# Tide 색감 조정 구현 티켓

근거: [ADR 0022](../../decisions/0022-pastel-intensity-and-overlay-states.md), 결정 기록은 [Tide 색감 조정 지도](../tide-color-tone/map.md)와 그 티켓 01~05.

> **상태: 발행됨 (2026-11-12).** 01 → 02 → 03 → 04 한 줄이다. 01·02는 foundation의 같은 파일(Token 원본, CSS 생성, 대비 쌍)을 고치고, 03·04는 그 결과에 기대므로 병렬로 돌리지 않는다.

## 실행 규칙

[Tide v0 구현 티켓의 실행 규칙](../tide-v0-impl/README.md#실행-규칙-멀티-에이전트)을 그대로 따른다. 프런티어 계산, worktree별 에이전트, claim과 완료(`Status: claimed` → `done`, `## Comments`에 결과), Component 완료 기준이 같다.

## 공통 주의

- 외부 제품 이름·URL·색 값을 코드, 주석, 문서, 커밋, PR에 넣지 않는다. 값은 ADR 0022과 02·05 결정 표의 Tide 값만 쓴다.
- 라이브러리 API는 설치 버전을 확인하고 context7이나 공식 문서로 검증한 뒤 쓰고, 근거 버전을 `## Comments`에 적는다.
- 대비 쌍은 모두 기존 기준(텍스트 4.5, UI 3)을 통과해야 한다. 예외는 없다. 미달이 나오면 값을 바꾸지 말고 멈춘 뒤 보고한다.

## 티켓

| 번호                                                    | 제목                                                          | Blocked by |
| ------------------------------------------------------- | ------------------------------------------------------------- | ---------- |
| [01](issues/01-scale-values-and-decorative-families.md) | 스케일 값 교체와 장식 계열 purple·mint 추가                   | —          |
| [02](issues/02-slot-rules-overlay-and-new-slots.md)     | 슬롯 규칙 확장: 새 슬롯 셋, 덮기·섞기, `bg-hover`·`bg-active` | 01         |
| [03](issues/03-components-pastel-and-overlay.md)        | Component 반영: 파스텔 글자·테두리, Badge faint, 무채색 호버  | 02         |
| [04](issues/04-docs-color-foundation.md)                | 문서: 컬러 Foundation, 앱 계열 가이드, Component 문서         | 03         |
