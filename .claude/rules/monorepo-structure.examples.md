---
paths:
  - "packages/**"
  - "apps/**"
  - "scripts/**"
---

# 모노레포 구조 규칙 — 예시

`monorepo-structure.md` 규칙 번호별 예시다. 규칙 본문은 그쪽이 기준이고, 여기는 판단이 갈리는 장면만 보여 준다.

---

## 1. 같은 폴더 이름을 모든 깊이에서 반복한다

```
❌ packages/components/src/utils/cn.ts
❌ packages/components/src/styles/overlay.ts
❌ apps/docs/src/docs-blocks/ColorScale.tsx

✅ packages/components/src/libs/cn.ts
✅ packages/components/src/constants/overlayClass.ts
✅ apps/docs/src/components/ColorScale.tsx
```

- class 문자열 묶음은 `constants`, 그 class를 고르는 함수는 `libs`다.
  ```
  ❌ constants/alertClass.ts 안에 alertStatusIcon(color) 함수까지 둠
  ✅ constants/alertClass.ts        # alertLayoutClass, alertSurfaceClass …
  ✅ libs/alertStatusIcon.ts        # Role → 상태 아이콘
  ```
- Context는 그것을 읽는 hook과 같은 파일에 둔다.
  ```
  ✅ hooks/useFieldControl.ts       # FieldContext + useFieldControl
  ❌ contexts/FieldContext.ts
  ```

## 2·3. 쓰는 곳 가까이 두고, 공유가 넓어지면 공통 부모로 올린다

Select의 값 동기화 hook `useSelectValue`가 처음에는 Select만 쓴다.

```
① Select만 씀             packages/components/src/Select/hooks/useSelectValue.ts
② Combobox도 씀           packages/components/src/hooks/useSelectValue.ts
```

- ❌ "Combobox도 언젠가 쓸 테니" 처음부터 ②에 두지 않는다.
- Alert와 Toast가 함께 쓰는 class는 둘의 공통 부모인 `src/constants/alertClass.ts`다. `Alert/constants/`에 두고 Toast가 그 경로를 import하지 않는다.
- Combobox가 더는 쓰지 않으면 ①로 내린다.

## 4. 패키지마다 들어가는 조건이 다르다

| 코드                       | 쓰는 곳                 | 위치                                  | 이유                                          |
| -------------------------- | ----------------------- | ------------------------------------- | --------------------------------------------- |
| `contrastRatio`            | components 테스트, docs | `packages/foundation/src/contrast.ts` | React 없이 설명된다                           |
| `cn` (tailwind-merge 래퍼) | components              | `packages/components/src/libs/cn.ts`  | foundation의 설정을 쓰는 React 패키지 쪽 함수 |
| `IconBase`                 | 생성된 아이콘 전부      | `packages/icons/src/IconBase.tsx`     | 아이콘의 것                                   |
| 색 타일 계산 `colorTiles`  | docs만                  | `apps/docs/src/libs/colorTiles.ts`    | 앱 개발자용 API가 아니다                      |

- ❌ "문서에도 쓰이니 공통 같아서" `colorTiles`를 foundation에 올리지 않는다. 앱 개발자가 쓸 이유가 생길 때 올린다.

## 5. 패키지를 넘을 때는 코드의 주인을 먼저 본다

Badge의 글자 대비를 검사하는 테스트가 대비 계산을 쓴다. 지금은 components 테스트만 쓴다.

```
❌ packages/components/test/libs/contrastRatio.ts   # 쓰는 곳 가까이 — 하지만 패키지가 다르다
✅ packages/foundation/src/contrast.ts              # 주인은 foundation (Token 대비 기준)
```

"쓰는 곳 가까이"는 **같은 패키지 안에서** 적용한다.

## 6. 의존 방향은 apps → components → {foundation, icons}

```ts
// ✅ packages/components/src/Alert.tsx
import { XIcon } from "@tide-design/icons";
import type { TideRole } from "@tide-design/foundation";

// ❌ packages/foundation/src/color.ts
import { cn } from "@tide-design/components"; // foundation → components (역방향)

// ❌ packages/icons/src/IconBase.tsx
import { color } from "@tide-design/foundation"; // icons ↔ foundation (서로 독립)

// ❌ packages/components/src/libs/cn.ts
import { colorTiles } from "../../../../apps/docs/src/libs/colorTiles.ts"; // packages → apps

// ❌ packages/components/src/Badge.tsx
import { primitiveHex } from "@tide-design/foundation/internal"; // internal은 docs·빌드 스크립트 전용
```

## 7. 파일 하나에서 폴더로

Select에 전용 hook이 생겼다.

```
전: src/Select.tsx, src/Select.test.tsx
후: src/Select/index.ts
    src/Select/Select.tsx
    src/Select/Select.test.tsx
    src/Select/hooks/useSelectValue.ts
```

- `src/index.ts`의 `export { Select } from "./Select.tsx"`는 `"./Select/index.ts"`로 바꾼다. 앱이 쓰는 공개 경로(`@tide-design/components`)는 그대로다.
- ❌ `src/Select/index.tsx`에 본문을 쓴다.
- ❌ `CheckboxGroup`을 `Checkbox/` 폴더 안에 넣는다. 따로 공개되는 Component라 자기 자리를 갖는다. 둘이 함께 쓰는 코드는 `src/hooks/useChoiceGroup.ts`처럼 공통 부모에 둔다.
- ✅ `TableRow`·`TableCell`은 `Table.tsx`(또는 `Table/components/`)에 둔다. Table 없이 쓰지 않는다.

## 8. 이름

```
❌ src/hooks/field-context.ts      ✅ src/hooks/useFieldControl.ts
❌ src/libs/render.ts              ✅ src/libs/renderElement.ts
❌ src/constants/overlay-style.ts  ✅ src/constants/overlayClass.ts
❌ foundation/src/color-family.ts  ✅ foundation/src/colorFamily.ts
```

subpath 이름은 그대로 둔다.

```json
"exports": {
  "./color-family": { "types": "./dist/colorFamily.d.ts", "default": "./dist/colorFamily.js" }
}
```

## 9·10. 테스트 위치

```
✅ packages/foundation/src/colorName.test.ts       # colorName.ts 하나를 본다
❌ packages/foundation/test/color-name.test.ts

✅ packages/foundation/test/exports.test.ts        # 공개 export 목록 전체를 본다
✅ packages/components/test/contrast.test.ts       # 모든 Role 조합을 전수 검사한다
✅ packages/components/test/browser-setup.ts       # setup
```

## import와 배럴

```ts
// ✅ packages/components/src/Select/Select.tsx
import { useFieldControl } from "../hooks/useFieldControl.ts";
import { useSelectValue } from "./hooks/useSelectValue.ts";

// ❌ packages/components/src/hooks/index.ts
export * from "./useFieldControl.ts";

// ❌ packages/components/src/index.ts
export * from "./Select/index.ts"; // 공개 이름이 진입점에 보이지 않는다
```

`"use client"`를 가진 hook을 다른 파일로 옮기면서 지시어를 두고 오면 smoke 앱의 `next build`가 실패한다. 옮긴 파일 머리에 지시어가 있는지 먼저 본다.
