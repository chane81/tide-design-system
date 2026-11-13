# 02: components 공개 Component 주석 정리

Status: done
Blocked by: 코드 스타일 02 ([code-style/issues/02](../../code-style/issues/02-extensionless-imports.md))

## What to build

`packages/components/src/<Component>/` 폴더 전체(본문·테스트·전용 조각)의 주석을 [주석 규칙](../../../../.claude/rules/code-comments.md)대로 정리한다. 코드는 바꾸지 않는다.

## 할 일

- Combobox·Toast·Dialog·Accordion·Menu·Select·Tabs가 주석이 가장 많다.
- props JSDoc은 1~2줄로 다듬는다. Storybook props 표에서 설명이 비지 않게 한다.
- 접근성 동작을 설명하는 주석은 구현 이유가 코드로 안 보이면 1줄로 남긴다.

## 수용 기준

- [x] 범위 안 주석이 규칙의 「남긴다」에 해당하는 것만 1~2줄로 남았다.
- [x] 정리 전후 주석 줄 수를 티켓 Comments에 적었다.
- [x] 공통 수용 기준(README)을 통과한다.

## Comments

- 주석 줄 수(`//`·블록 주석 줄, 35개 Component 폴더): 2,013 → 1,093. 많이 줄어든 곳: Toast 139→65, Combobox 138→63, Menu 117→67, Accordion 110→49, Select 107→59, Tabs 102→56, Dialog 99→64, Tooltip 97→70, Popover 90→64.
- 확인: 바뀐 121개 파일에서 주석·빈 줄을 뺀 코드 줄이 정리 전과 같다. 정리 전 JSDoc이 붙어 있던 공개 props·Component는 모두 JSDoc이 남았다(빠진 9곳은 index에서 export하지 않는 내부 조각).
- MDX로 옮길 내용(티켓 04에서 판단). **06에서 반영**(`Switch.mdx` 「설명과 오류 붙이기」, `Checkbox.mdx` 「묶어서 이름 붙이기」, `Badge.mdx` 「크기 바꾸기」):
  - Switch: `invalid`면 꺼진 track 경계가 danger 색이 된다. Field 안에서는 `invalid` prop이 Field 값보다 우선한다.
  - Checkbox(CheckboxGroup): 선택 값은 각 Checkbox가 가지고, 묶음은 값을 모으지 않는다(지금은 `CheckboxGroup` JSDoc에만 있다).
  - Badge: 한 줄로만 쓴다(`whitespace-nowrap`). 줄바꿈하면 모양이 깨진다.
- 보류: 없음. 지운 결정 근거는 ADR(0004·0005·0011·0013·0015·0016·0018·0019·0022·0023·0025)과 `tide-v0`·`tide-v0-impl` 티켓·spec에 있다.
- 판단: Card의 "장식 구분선이라 WCAG 1.4.11 대상 아님"은 ADR에 없고 진행 문서에만 있어 1줄로 남겼다.
- 판단: "루트 entry에서 import한다"는 근거를 `Popover/Popover.tsx`에 1줄로 두고 다른 파일은 `(Popover.tsx 참고)`로 가리킨다(`_internal/components/DialogRoot.tsx`도 이 파일을 가리킨다). Combobox·Menu·Tag 등 일부는 참조 없이 한 줄로 이유를 적었다.
- 판단: `DialogTrigger` JSDoc의 `aria-haspopup="dialog"` 문구는 테스트(속성 없음)와 맞지 않아 뺐다.
- 판단: `ToastQueue` JSDoc의 코드 예시, `MenuTrigger`·`TagGroup`의 키보드 동작 상세는 MDX에 있어 뺐다. Table의 `scope="col"` 기본값 이유는 JSDoc에서 빼 `TableHeaderCell.tsx` 코드 위 1줄로 옮겼다.
