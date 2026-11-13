# 02: foundation·icons 파일 이름과 테스트 위치

Status: done
Blocked by: 없음 (바로 시작 가능)

## What to build

foundation 원본 파일 이름을 camelCase로 바꾸고(규칙 8), 파일 하나를 보는 단위 테스트를 원본 옆으로 옮긴다(규칙 9·10). icons도 테스트 위치를 같은 기준으로 맞춘다.

## 할 일

- foundation `src/`: `color-css.ts`→`colorCss.ts`, `color-family.ts`→`colorFamily.ts`, `color-name.ts`→`colorName.ts`, `color-slot.ts`→`colorSlot.ts`. 한 단어 파일(`color.ts`, `contrast.ts` 등)은 그대로.
- `package.json` `exports`·`publishConfig`(있으면)와 `tsdown.config.ts` `entry`를 새 파일 이름에 맞춘다. subpath 이름(`./color-family` 등)은 그대로 둔다.
- `scripts/build.ts`가 원본·`dist` 파일 이름을 직접 가리키면 함께 고친다.
- foundation `test/`의 테스트를 하나씩 보고, 원본 파일 하나를 보는 것은 `src/<file>.test.ts`로 옮긴다. 공개 export 목록·Token 스냅샷·전수 검사처럼 패키지 전체를 보는 것과 `fixtures/`, `__snapshots__/`는 `test/`에 남긴다. vitest `include`를 맞춘다.
- `tsconfig.build.json`이 `*.test.ts`를 빌드에서 빼는지 확인한다(`dist`에 테스트가 실리면 안 된다).
- icons: `test/name-removal.test.ts`는 `scripts/name-removal.ts`를 보므로 `scripts/` 옆으로 옮긴다. `test/icons.test.tsx`는 생성 아이콘 전체를 보므로 남긴다.

## 수용 기준

- [x] `@tide-design/foundation`의 subpath(`.`, `./internal`, `./color-family`, CSS, `./tailwind-merge`)가 이전과 같은 이름으로 resolve된다(smoke 통과).
- [x] `dist`에 테스트 파일이 없다.
- [x] 공통 수용 기준(README)을 통과한다.
- [x] changeset: `@tide-design/foundation` patch, icons는 테스트만 바뀌면 empty changeset.

## Comments

테스트 위치 판단(규칙 9·10):

| 테스트                                      | 위치                    | 근거                                                                           |
| ------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------ |
| `scale.test.ts`                             | `src/color.test.ts`     | `color.ts`의 Primitive 스케일 하나만 본다                                      |
| `color-name.test.ts`                        | `src/colorName.test.ts` | 색 이름 목록·슬롯·등록 타입(`colorName.ts`)을 본다(규칙 예시와 같음)           |
| `color-family.test.ts`                      | `test/` 유지            | 빌드한 `dist/colorFamily.js`와 bin(`dist/cli.js`)을 fixture로 돌리는 출력 검사 |
| `contrast.test.ts`                          | `test/` 유지            | 모든 Semantic Token의 대비 쌍 등록·하한을 전수 검사한다                        |
| `overlay-values.test.ts`                    | `test/` 유지            | 결정 표 대조. `colorSlot.ts`(mixHex)와 `semantic.ts`(Token 값)에 걸친다        |
| `role-regression.test.ts`, `__snapshots__/` | `test/` 유지            | Token 스냅샷                                                                   |
| `exports.test.ts`                           | `test/` 유지            | 공개 export 목록                                                               |
| `tokens.test.ts`, `tailwind*.test.ts`       | `test/` 유지            | 빌드한 CSS·tailwind-merge 설정(공개 계약) 검사                                 |
| icons `name-removal.test.ts`                | `scripts/` 옆           | `scripts/name-removal.ts` 하나를 본다                                          |

changeset: `@tide-design/foundation` patch 하나. `scripts/check-changesets.ts`는 changeset이 하나라도 있으면 통과하고, icons는 `fixed` 묶음이라 함께 오르므로 icons용 empty changeset은 더하지 않았다.
