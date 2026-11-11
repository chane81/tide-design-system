# Field는 label·설명·오류를 props로 받고, 입력 Component는 context로 연결한다

근거 원칙: ① 접근성이 미려함보다 우선한다, ③ 단순함이 유연함보다 우선한다, ④ 발견할 수 있음이 외워야 함보다 우선한다

`Field`는 부분 Component(`FieldLabel`, `FieldError` 등)로 나누지 않고 **props 하나로** label, 설명, 오류 메시지를 받는다(`<Field label description error invalid required disabled htmlFor>`). 안의 입력 Component는 Field가 내려 주는 **context**를 읽어 `id`, `aria-describedby`, `aria-invalid`, `required`, `disabled`를 스스로 붙인다(2026-11-10, [티켓 15](../progress/tide-v0-impl/issues/15-field-input-textarea.md)).

- **화면 순서와 읽는 순서**: label → 입력창 → 설명 → 오류다. `aria-describedby`는 설명 id, 오류 id 순서다.
- **오류 상태**: `invalid`의 기본값은 「`error`가 있으면 `true`」다. `invalid={false}`면 `error`가 있어도 숨긴다. 오류 상태는 입력창의 `aria-invalid="true"`와 boolean `data-invalid`로 나타낸다(Field 루트에도 `data-invalid`). 네이티브 `:invalid`는 브라우저 제약 검사 결과라 앱이 정한 오류와 다르므로 쓰지 않는다.
- **우선순위**: 입력 Component에 직접 준 `id`, `invalid`, `disabled`, `required`가 Field 값을 이긴다. `aria-describedby`는 Field 것 뒤에 이어 붙인다.
- **연결 계약(context)**: `controlId`(label `for`가 가리키는 id), `labelId`, `describedBy`, `invalid`, `disabled`, `required`. 단일 입력은 `controlId`를 자기 id로 쓴다. 그룹(Checkbox 그룹)이나 버튼형 트리거(Select, Combobox)는 `labelId`를 `aria-labelledby`로 쓴다. 이 context는 공개 계약이 아니다(`@tide-tds/components` 내부).
- **서버 컴포넌트 경계**: context는 `"use client"` 모듈이 만든다. `Field`는 `useId`와 provider 렌더만 하므로 서버 컴포넌트로 남는다. 값을 읽는 `Input`·`Textarea`는 client Component다(React 19.3.1, react.dev 「Server Components」·`useId` 문서. Next 16.4.5 prerender로 smoke에서 확인).

## 검토한 대안

- **부분 Component(`Field` + `FieldLabel` + `FieldDescription` + `FieldError`, Base UI 방식)**: 배치를 앱이 바꿀 수 있다. 하지만 v0의 필요(위아래 한 줄 배치)에 비해 import와 조합이 늘고, 순서·연결을 앱이 맞춰야 한다(③). label을 빠뜨려도 타입이 막지 못한다(①). Field props에 `label`이 필수라 이름 없는 입력창을 타입이 막는다.
- **자식 복제(`cloneElement`로 id·aria 주입)**: context 없이 서버 컴포넌트로 끝난다. 하지만 자식이 앱의 래퍼 Component면 주입이 닿지 않고, 동작이 암묵적이다(ADR 0005에서 `asChild`를 버린 이유와 같다).
- **입력 Component가 id를 등록(state·effect)**: 입력창 `id`를 앱이 줘도 label이 따라간다. 하지만 첫 렌더(서버 HTML)에서는 연결이 비어 hydration 뒤에야 맞는다. 대신 `htmlFor` prop으로 id를 Field에서 정한다.
- **`aria-errormessage`**: 오류 전용 속성이지만 스크린리더 지원이 고르지 않다. 설명과 같은 `aria-describedby`로 읽힌다.

## Consequences

- 이후 Select(28), Combobox(29), Checkbox·Radio 그룹(16)은 같은 context를 읽어 연결한다. 그룹은 `<label for>` 대신 `labelId`로 이름을 받으므로, 그룹용 label 요소(예: `legend` 또는 `for` 없는 label)가 필요하면 그 티켓에서 Field에 선택지를 더한다(이 ADR의 정정으로 남긴다). → 아래 「정정」에서 `group` prop으로 정했다.
- label을 앞이 아닌 옆에 두는 배치(가로 폼)는 v0에 없다. 필요하면 부분 Component를 더하는 쪽으로 다시 검토한다(Field props는 그대로 둘 수 있다).
- `Input`·`Textarea`는 hook(`use`)을 쓰므로 `"use client"`가 붙는다. 표시만 하는 Component는 아니어서 공통 규칙과 맞는다.

## 정정

- **2026-11-10, [티켓 16](../progress/tide-v0-impl/issues/16-checkbox-and-radio.md): 묶음용 `group` prop.** Field props에 `group?: boolean`(기본 `false`)을 더한다. `group`이면 label이 `<label for>` 대신 `for` 없는 `<span id={labelId}>`가 된다. `<label for>`는 입력 요소 하나만 가리킬 수 있어, 묶음 div를 가리키면 눌러도 아무 일이 없고 HTML 규칙에도 어긋나기 때문이다.
  - 묶음(`CheckboxGroup` `role="group"`, `RadioGroup` `role="radiogroup"`)은 context의 `labelId`를 `aria-labelledby`로, `describedBy`를 `aria-describedby`로 받는다. `controlId`는 묶음의 `id`가 된다(오류 요약 `#id` 링크용, `htmlFor`로 정할 수 있다).
  - 오류 상태는 묶음이 아니라 안의 input 하나하나에 `aria-invalid="true"`로 붙인다. 묶음 루트에는 `data-invalid`만 붙인다.
  - 묶음은 안쪽에 Field context를 `null`로 다시 내려 항목이 `controlId`를 자기 id로 쓰지 않게 한다(id 중복 방지). 대신 묶음 전용 context로 `invalid`·`disabled`(RadioGroup은 `name`·선택 값·`required`까지)를 넘긴다.
  - `required`: RadioGroup은 안의 Radio에 네이티브 `required`를 넘긴다(라디오 묶음 하나가 필수). CheckboxGroup은 넘기지 않는다. 체크박스마다 `required`가 붙으면 모두 체크해야 제출되기 때문이다. label의 `*`만 보이고 「하나 이상」 검사는 앱이 한다.
  - 검토한 대안: **`fieldset`/`legend`** 는 네이티브 묶음 이름이고 `fieldset disabled`가 안을 모두 끈다. 하지만 Field 루트 요소의 타입이 `div`에서 바뀌어 `ref`·props 타입이 갈리고, legend의 특수 렌더링 때문에 Field의 세로 배치(`flex gap`)가 그대로 맞지 않는다. 또 `fieldset`의 `aria-describedby`는 스크린리더 지원이 고르지 않다. **prop 없이 그대로 `<label for={묶음 id}>`** 도 `aria-labelledby`로 이름은 붙지만 유효하지 않은 HTML이 남는다.
- **2026-11-11, [티켓 28](../progress/tide-v0-impl/issues/28-select.md): 버튼형 트리거(Select).** Select 트리거(`<button>`)는 `controlId`를 자기 id로 쓴다. 버튼은 label을 붙일 수 있는 요소라 Field의 `<label for>`가 그대로 유효하고, 오류 요약 `#id` 링크와 label 누름(트리거 포커스, 목록은 열지 않음)이 트리거로 간다. 이름은 `labelId`를 `aria-labelledby`로 받아 고른 값 글자와 함께 읽는다(React Aria `useSelect`가 값 요소 id를 앞에 붙인다). 설명·오류는 `describedBy`만 `aria-describedby`로 쓴다(`useField`가 만든 빈 자리 id는 쓰지 않는다). `required`는 숨은 `<select>`의 네이티브 `required`(React Aria `validationBehavior: "native"`)라 비면 제출을 막고 트리거로 포커스를 옮기며 `aria-invalid`가 붙는다. 버튼 역할에는 `aria-required`를 쓸 수 없어 보조기술은 필수 여부를 label의 `*`(숨김)로 알 수 없다(판단 보류). Field `group`은 쓰지 않는다.
