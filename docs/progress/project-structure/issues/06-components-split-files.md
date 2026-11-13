# 06: Component 파일 하나에 Component 하나

Status: done
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

- [x] `packages/components/src` 안 어떤 파일에도 `function` Component가 둘 이상 없다(짧은 비-Component 헬퍼는 허용).
- [x] `dist/index.d.ts`의 공개 이름 목록이 나누기 전과 같다.
- [x] `"use client"` 파일 목록 변화가 나눈 파일로 설명된다(Comments에 표로).
- [x] 공통 수용 기준(README)을 통과한다.
- [x] changeset: `@tide-design/components` patch.

## Comments

### 2026-11-13 결과

- 대상 표 15곳을 모두 나눴다. 표 밖에서 `function`·`forwardRef`·화살표 Component가 둘 이상인 파일, Context와 Component가 함께 있는 파일은 더 없었다(나눈 뒤 다시 셌다). 코드는 옮기기만 했고 필요한 `export`·import만 더했다. 옮긴 코드의 주석은 그대로 따라갔다.
- 나눈 결과(본문 파일 수, `index.ts`·테스트 제외):

  | Component                | 전  | 후  | 나눈 곳                                                                                           |
  | ------------------------ | --- | --- | ------------------------------------------------------------------------------------------------- |
  | Menu                     | 1   | 10  | `components/` 7, `hooks/useMenuContext.ts`, `types.ts`                                            |
  | Dialog                   | 1   | 12  | `components/` 7, `hooks/useDialogPartsContext.ts`·`usePartId.ts`, `constants/`, `types.ts`        |
  | Pagination               | 1   | 8   | `components/` 5, `constants/`, `types.ts`(`PaginationArrowProps`)                                 |
  | Table                    | 1   | 7   | `components/` 5, `constants/`                                                                     |
  | Combobox                 | 1   | 6   | `components/` 4, `constants/`                                                                     |
  | Tabs                     | 1   | 8   | `components/` 4, `hooks/useTabsContext.ts`, `constants/`, `types.ts`                              |
  | Select                   | 1   | 6   | `components/` 4, `constants/`                                                                     |
  | Accordion                | 1   | 8   | `components/` 3, `hooks/` 2, `constants/`, `types.ts`                                             |
  | Tooltip                  | 1   | 7   | `components/` 3, `hooks/useTooltipContext.ts`, `constants/`, `types.ts`                           |
  | Popover                  | 1   | 7   | `components/` 3, `hooks/usePopoverContext.ts`, `constants/`, `types.ts`                           |
  | Breadcrumb               | 1   | 5   | `components/` 3, `constants/`                                                                     |
  | Toast                    | 1   | 7   | `components/Region`·`ToastItem`, `libs/toastQueue.ts`·`mergeEntries.ts`, `constants/`, `types.ts` |
  | Tag                      | 1   | 6   | `components/TagGroup`·`TagView`, `hooks/useTagGroupContext.ts`, `constants/`, `types.ts`          |
  | `_internal` ListBoxNodes | 1   | 4   | 폴더로 바꿈(규칙 7): `components/` 2, `types.ts`                                                  |
  | Button                   | 1   | 4   | `components/Icon.tsx`, `constants/`, `types.ts`                                                   |

- 판단:
  - 대표 파일 이름은 폴더 이름을 따른다. Tag 폴더의 `Tag.tsx`에는 `Tag`, `TagGroup`은 `components/`로 갔다. Toast 폴더의 `Toast.tsx`에는 `ToastRegion`이 남고, `ToastQueue` 클래스는 Component가 아니라 `libs/toastQueue.ts`로 갔다.
  - Context를 읽는 hook이 따로 없던 곳(`AccordionContext`, `TagGroupContext`)도 `hooks/use<이름>Context.ts`에 Context만 둔다. Dialog의 부분 Context는 이미 `_internal/hooks/useDialogContext.ts`가 있어 `useDialogPartsContext.ts`로 이름을 갈랐다.
  - 대표 Component의 `XxxPlacement`·`TabsOrientation` 같은 공개 타입은 `types.ts`에 두고 폴더 `index.ts`가 재수출한다. `DialogProps`는 05대로 `Dialog.tsx`가 재수출한다.
  - 짧은 비-Component 헬퍼(`idPart`, `isComposingKey`, `checkClass`, `SelectListState` 등)는 쓰는 파일에 남겼다. `Combobox.tsx`는 220줄이지만 Component 하나와 Props 설명이라 더 나누지 않았다.
  - 테스트는 공개 이름을 `./index.ts`(다른 Component 테스트는 `../X/index.ts`)에서 import하도록 바꿨다.
  - ListBoxNodes 경로가 바뀌어 Select·Combobox 주석 속 경로만 새 경로로 고쳤다(README 공통 기준). 주석 내용은 손대지 않았다.
  - 사용자 요청으로 이번에 나눈 파일에서 `return` 문이 위 코드와 붙은 곳에 빈 줄을 하나 넣었다(별도 style 커밋).
- `"use client"`(dist): 30개 → 79개. 원래 있던 파일은 모두 지시어를 그대로 갖고, `_internal/components/ListBoxNodes.js`만 `ListBoxNodes/ListBoxNodes.js`로 경로가 바뀌었다. 더해진 49개:

  | 묶음                       | 새 client 파일                                                                                                                   | 까닭                                    |
  | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
  | Context 파일               | `hooks/use{Menu,DialogParts,Tabs,Accordion,AccordionItem,Tooltip,Popover,TagGroup}Context`, `Dialog/hooks/usePartId`             | `createContext`·hook                    |
  | hook을 쓰는 하위 Component | Trigger·Content·ContentInner·View·Popover(Inner)·TabList·TabPanel·Accordion 부분·Dialog 부분·Tag·Toast 조각, ListBoxNodes 조각 2 | React Aria hook·context·이벤트          |
  | 컬렉션 항목                | `MenuItem`·`MenuSection`·`SelectItem`·`SelectSection`·`ComboboxItem`·`ComboboxSection`·`Tab`                                     | hook은 없지만 아래 이유로 지시어를 둔다 |
  - 컬렉션 항목은 렌더하지 않는 표시 요소이고 `getCollectionNode`가 붙은 type으로 목록이 모은다. 서버 컴포넌트에서 쓰면 항목 요소가 client 참조로 목록에 넘어가야 `resolveCollectionChildren`이 실제 Component로 바꾼다. 지시어가 없으면 서버에서 `null`로 렌더돼 항목이 사라진다. 그래서 원래 파일의 지시어를 유지했다(`Tag.tsx`도 같은 이유로 그대로).
  - 지시어 없는 새 파일: Table·Breadcrumb·Pagination 하위 Component(원래 서버 파일), `Dialog/components/DialogFooter`, `Button/components/Icon`(hook·이벤트 없음), 모든 `constants/`·`types.ts`·`libs/`(`Toast/libs/toastQueue`·`mergeEntries` 포함). DialogFooter·Icon·ToastQueue는 client 파일에서 나와 서버 모듈이 됐지만 hook·이벤트가 없어 동작은 같다.
  - smoke 검사 목록에 새 client 49개와 서버 쪽 조각 23개를 더하고 ListBoxNodes 경로를 고쳤다.

- 검증: `pnpm build`, `pnpm typecheck`, `pnpm test`(components 70파일 1878개), `pnpm lint`, `pnpm format:check`, `pnpm smoke` 통과. `dist/index.d.ts` 공개 이름 166개가 브랜치 시작 시점과 같다(목록 diff 없음).
- changeset: `.changeset/components-split-files.md`(`@tide-design/components` patch).
