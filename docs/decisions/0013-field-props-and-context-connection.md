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

- 이후 Select(28), Combobox(29), Checkbox·Radio 그룹(16)은 같은 context를 읽어 연결한다. 그룹은 `<label for>` 대신 `labelId`로 이름을 받으므로, 그룹용 label 요소(예: `legend` 또는 `for` 없는 label)가 필요하면 그 티켓에서 Field에 선택지를 더한다(이 ADR의 정정으로 남긴다).
- label을 앞이 아닌 옆에 두는 배치(가로 폼)는 v0에 없다. 필요하면 부분 Component를 더하는 쪽으로 다시 검토한다(Field props는 그대로 둘 수 있다).
- `Input`·`Textarea`는 hook(`use`)을 쓰므로 `"use client"`가 붙는다. 표시만 하는 Component는 아니어서 공통 규칙과 맞는다.
