# 01: components 내부 모듈을 네 폴더로 나누기

Status: done
Blocked by: 없음 (바로 시작 가능)

## What to build

`packages/components/src/`에 공개 Component와 섞여 있는 내부 모듈을 `components`·`hooks`·`libs`·`constants`로 나누고 camelCase 이름으로 바꾼다(규칙 1·8). 공개 API(`src/index.ts`의 이름)는 바뀌지 않는다.

## 옮길 곳 (제안)

| 지금                 | 옮길 곳                                                  | 비고                                      |
| -------------------- | -------------------------------------------------------- | ----------------------------------------- |
| `cn.ts`              | `libs/cn.ts`                                             | `index.ts`가 공개 재수출                  |
| `render.ts`          | `libs/renderElement.ts`                                  |                                           |
| `alert-style.ts`     | `constants/alertClass.ts` + `libs/alertStatusIcon.ts`    | 상수와 함수를 나눈다                      |
| `choice-group.ts`    | `hooks/useChoiceGroup.ts`                                | Context 둘을 함께 둔다                    |
| `choice-style.ts`    | `constants/choiceClass.ts`                               |                                           |
| `field-context.ts`   | `hooks/useFieldControl.ts`                               | `FieldContext`를 함께 둔다                |
| `input-style.ts`     | `constants/inputClass.ts`                                |                                           |
| `list-collection.ts` | `libs/listCollection.ts`                                 |                                           |
| `list-style.ts`      | `constants/listClass.ts`                                 |                                           |
| `listbox.tsx`        | `components/ListBoxNodes.tsx`                            |                                           |
| `overlay-style.ts`   | `constants/overlayClass.ts`                              |                                           |
| `overlay.tsx`        | `hooks/`·`libs/`·`components/OverlayPortal.tsx`로 나눈다 | hook 넷, 위치 계산 함수, Portal Component |
| `pressable.ts`       | `constants/pressableClass.ts` + `libs/pressableState.ts` |                                           |
| `types.ts`           | 그대로                                                   |                                           |

- 표는 출발점이다. 나누는 단위(hook마다 파일 하나 vs 주제별 한 파일)가 애매하면 규칙 「애매할 때」대로 묻는다.
- 지금은 전용 조각을 가진 Component가 없으므로 Component 폴더는 만들지 않는다.
- `foundation-color.test.tsx` 등 `foundation-*.test.tsx`는 특정 Component 하나를 보는지, 패키지 전체를 보는지 확인해 규칙 9·10대로 둔다.

## 수용 기준

- [x] 위 모듈이 규칙에 맞는 폴더·이름으로 옮겨졌고, 내부 폴더에 `index.ts`가 없다.
- [x] `src/index.ts`의 공개 이름 목록이 이전과 같다(`test/` 또는 빌드된 `dist/index.d.ts` 비교로 확인).
- [x] `"use client"`가 hook·Context·Portal 파일에 남아 있고, class 상수·순수 함수 파일에는 없다.
- [x] 공통 수용 기준(README)을 통과한다.
- [x] changeset: `@tide-design/components` patch(내부 파일 배치 변경, `dist` 구조가 바뀜).

## Comments

### 2026-11-13 결과

- 옮긴 곳은 위 표대로다. 표에서 정하지 않은 부분은 이렇게 정했다.
  - `overlay.tsx`: 규칙 8(hook은 `useXxx.ts`)대로 hook마다 파일 하나로 나눴다. `hooks/useOverlayPresence.ts`·`usePopoverOverlay.ts`·`useOverlayTheme.ts`·`useCloseOnTab.ts`, 위치 계산은 `libs/overlayPosition.ts`(`OverlayPlacement` 타입 + `overlayPositionProps`), Portal은 `components/OverlayPortal.tsx`. 오버레이를 짜는 순서 주석은 `OverlayPortal.tsx` 머리에 두고 각 파일이 그쪽을 가리킨다.
  - `pressable.ts`: 맵 상수는 `constants/pressableClass.ts`로 옮기며 export하게 되어 `pressableColorClass`·`pressableInteractionClass`·`pressableDisabledClass`·`pressableScaleClass`로 이름에 접두를 붙였다(내부 이름이라 공개 API 영향 없음).
  - 테스트: `foundation-*.test.tsx`는 특정 Component가 아니라 패키지 CSS 전체(색 이름·motion·shape Utility)를 보므로 규칙 10대로 `test/foundationColor.test.tsx` 등으로 옮겼다. `test/cn.test.ts`는 `cn.ts` 하나를 보므로 규칙 9대로 `src/libs/cn.test.ts`로 옮겼다. vitest `include`(unit `src/**/*.test.ts`, browser `test/**/*.test.tsx`)와 `tsconfig.build.json` `exclude`(`src/**/*.test.ts`)를 맞췄다.
  - smoke: `apps/smoke-next/scripts/smoke.ts`의 `"use client"` 검사 목록이 dist 파일 이름을 직접 적으므로 새 경로로 바꾸고, 새로 생긴 hook·상수·순수 함수 파일을 목록에 더했다.
- 문서 앱(`apps/docs`)은 components 내부 경로를 import하지 않는다(`preview.css`의 `@source`는 `src` 폴더 전체라 그대로 동작).
- 검증: `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm smoke` 통과. main 빌드의 `dist/index.d.ts`와 import 경로를 뺀 내용이 같다.
