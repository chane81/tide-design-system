# 01: components 내부 모듈을 네 폴더로 나누기

Status: ready-for-agent
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

- [ ] 위 모듈이 규칙에 맞는 폴더·이름으로 옮겨졌고, 내부 폴더에 `index.ts`가 없다.
- [ ] `src/index.ts`의 공개 이름 목록이 이전과 같다(`test/` 또는 빌드된 `dist/index.d.ts` 비교로 확인).
- [ ] `"use client"`가 hook·Context·Portal 파일에 남아 있고, class 상수·순수 함수 파일에는 없다.
- [ ] 공통 수용 기준(README)을 통과한다.
- [ ] changeset: `@tide-design/components` patch(내부 파일 배치 변경, `dist` 구조가 바뀜).
