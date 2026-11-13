# 06: Component 파일 하나에 Component 하나

Status: ready-for-agent
Blocked by: 05 (PR #53 위에 쌓는다)

## What to build

본문 파일 하나에 여러 Component·Context가 들어 있는 곳을 구조 규칙 7-1대로 나눈다. 공개 API(`src/index.ts`의 이름)와 동작은 바꾸지 않는다.

## 대상 (2026-11-13, `function` Component 수 / 줄 수)

| 파일                                    | Component | 줄  |
| --------------------------------------- | --------- | --- |
| `Menu/Menu.tsx`                         | 8         | 391 |
| `Dialog/Dialog.tsx`                     | 8         | 338 |
| `Pagination/Pagination.tsx`             | 6         | 150 |
| `Table/Table.tsx`                       | 6         | 91  |
| `Combobox/Combobox.tsx`                 | 5         | 357 |
| `Tabs/Tabs.tsx`                         | 5         | 333 |
| `Select/Select.tsx`                     | 5         | 320 |
| `Accordion/Accordion.tsx`               | 4         | 272 |
| `Tooltip/Tooltip.tsx`                   | 4         | 246 |
| `Popover/Popover.tsx`                   | 4         | 237 |
| `Breadcrumb/Breadcrumb.tsx`             | 4         | 92  |
| `Toast/Toast.tsx`                       | 3         | 344 |
| `Tag/Tag.tsx`                           | 3         | 251 |
| `_internal/components/ListBoxNodes.tsx` | 3         | 146 |
| `Button/Button.tsx`                     | 2         | 137 |

목록은 `^(export )?function [A-Z]`로 센 값이다. `forwardRef`·화살표 함수 Component나 Context가 더 있을 수 있으니 파일마다 확인한다. 200줄이 넘는 단일 Component 파일(Switch 등)도 hook·constants로 뺄 곳이 있으면 함께 나눈다.

## 할 일

- 하위·보조 Component → `<C>/components/<Name>.tsx`, Context + 읽는 hook → `<C>/hooks/use<C>Context.ts`, 함께 쓰는 타입 → `<C>/types.ts`, class 맵 → `<C>/constants/`, 순수 함수 → `<C>/libs/`.
- `<C>/index.ts`가 공개 하위 Component와 Props를 재수출한다. `src/index.ts`의 이름 목록·순서는 그대로.
- `"use client"`: 나눈 각 파일이 hook·Context·이벤트를 쓰면 자기 머리에 적는다. 클래스 상수·타입·순수 함수 파일에는 적지 않는다.
- smoke의 `"use client"` 검사 목록을 새 파일에 맞춘다.
- 파일 하나씩(Component 하나씩) 커밋하면 리뷰가 쉽다.

## 수용 기준

- [ ] `packages/components/src` 안 어떤 파일에도 `function` Component가 둘 이상 없다(짧은 비-Component 헬퍼는 허용).
- [ ] `dist/index.d.ts`의 공개 이름 목록이 나누기 전과 같다.
- [ ] `"use client"` 파일 목록 변화가 나눈 파일로 설명된다(Comments에 표로).
- [ ] 공통 수용 기준(README)을 통과한다.
- [ ] changeset: `@tide-design/components` patch.
