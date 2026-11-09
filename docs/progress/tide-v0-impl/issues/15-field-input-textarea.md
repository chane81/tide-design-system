# 15: Field와 Input·Textarea

Status: ready-for-agent
Blocked by: 07 (motion·z-index Foundation), 12 (0.1.0 첫 publish)

## What to build

앱 개발자가 `Field`로 입력창에 label, 설명, 오류 메시지를 붙이면 `id`, `aria-describedby`, `aria-invalid`가 자동으로 연결된다. `Input`·`Textarea`는 네이티브 요소라 form 제출과 브라우저 기본 동작이 그대로 되고, `<input type="date">`도 Input 스타일로 쓴다. 스크린리더 사용자는 오류 메시지를 입력창과 함께 듣는다.

## 수용 기준

- [ ] Field는 label, 설명, 오류 메시지를 붙이고 `id`, `aria-describedby`, `aria-invalid`를 자동 연결한다. 이후 Select, Combobox, Checkbox 그룹에서도 쓸 수 있는 구조로 만든다.
- [ ] Input·Textarea는 네이티브 요소이고 hook을 쓰지 않는다. `disabled`, `readOnly`, `required`, `invalid` DOM 이름 prop을 쓴다.
- [ ] size는 `sm`/`md`/`lg`만 받는다(`xs`는 타입 오류). 같은 size의 Button과 높이가 같다. radius는 `md`다.
- [ ] 포커스 표시는 `focus-field`(`:focus`, 클릭 포함)다. 오류 상태에서도 포커스 중에는 focus-field가 이기고 오류 메시지는 계속 보인다.
- [ ] 오류 상태는 `data-invalid`로도 노출한다.
- [ ] `browser`: label 연결로 이름 계산, 설명·오류의 `aria-describedby`, `aria-invalid`, 제어/비제어 입력, form 제출, focus-field와 error+focus 계산값, forced-colors 투명 outline을 단언한다.

### 공통 API 규칙

- [ ] `ref`는 일반 prop으로 받아 루트 DOM 요소에 연결한다(`forwardRef` 없음).
- [ ] props는 루트 DOM 요소의 props를 확장하고 겹치는 HTML 속성은 `Omit`한다. `XxxProps` 타입을 루트에서 export한다.
- [ ] prop 이름은 DOM 이름을 쓰고, React Aria 이름(`isDisabled`, `onPress` 등)은 드러내지 않는다.
- [ ] 사용자 `className`은 `cn`의 마지막에 넣어 충돌 시 이긴다.
- [ ] 상태는 네이티브 pseudo-class가 있으면 그것을, 없으면 boolean `data-*` 속성으로 노출한다.
- [ ] `"use client"`는 hook·state·이벤트를 쓰는 파일에만 붙인다.
- [ ] Semantic Token만 쓰고, 지원하지 않는 `variant`·`size` 값은 타입 오류가 된다.
- [ ] 세부 props(값, 기본값, padding)는 공통 규칙 안에서 정하고 props 표로 확정한다.
- [ ] changeset을 포함한다.

### Component 완료 기준 (spec Testing Decisions)

- [ ] `*.test.tsx`에 동작 단언이 있다(`browser` project).
- [ ] 모든 예시가 story로 있고 a11y 검사를 통과한다(`storybook` project).
- [ ] 포커스 표시, forced-colors, reduced-motion 계산값을 단언한다(해당하는 경우).
- [ ] MDX 문서가 고정된 섹션 순서(설명 → 사용 시점/쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 표)를 따른다.
- [ ] 쓰는 Token이 대비 쌍에 등록되어 있다(`unit` project).
- [ ] smoke 앱에서 import해 빌드가 통과한다(`smoke`).

## Comments
