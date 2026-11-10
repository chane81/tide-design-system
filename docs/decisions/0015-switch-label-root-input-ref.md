# Switch는 `<label>` 루트에 `className`을, 네이티브 input에 `ref`와 HTML 속성을 붙인다

근거 원칙: ① 접근성이 미려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

`Switch`는 루트 `<label>` 안에 track(네이티브 `<input type="checkbox" role="switch">`, `appearance: none`), thumb(`aria-hidden` span), label 텍스트(`children`)를 둔다. 공통 API 규칙(「`ref`와 props는 루트 DOM 요소」)의 예외로, **`ref`와 HTML 속성은 input에**, **`className`과 `style`은 루트 label에** 붙는다(2026-11-10, [티켓 17](../progress/tide-v0-impl/issues/17-switch.md)).

- **input에 붙는 것**: `ref`, `name`, `value`, `checked`/`defaultChecked`, `onChange`, `disabled`, `required`, `id`, `aria-*`, `data-*` 등 `ComponentProps<"input">`의 나머지. `type`과 `role`은 고정이라 받지 않는다.
- **루트 label에 붙는 것**: `className`, `style`, `data-color`(ADR 0011), 상태 노출용 `data-disabled`·`data-invalid`.
- **이름**: `children`이 있으면 감싼 label의 텍스트가 이름이 된다. Field 안에서는 Field의 `<label for>`가 이름이 되고 `children`은 비운다. thumb은 이름에 들어가지 않는다.
- **누르는 영역**: 루트 label이 최소 24px 높이라 track(`sm` 28×16px)이 작아도 24×24px 이상을 누를 수 있다(WCAG 2.5.8). label을 눌러도 네이티브로 토글된다.

## 검토한 대안

- **루트 label에 `ref`도 붙이기(규칙 그대로)**: react-hook-form의 `register`처럼 `ref`로 input을 받아 값을 읽는 form 라이브러리가 동작하지 않는다. `focus()`도 label에서는 의미가 없다.
- **input에 `className`도 붙이기**: input이 track이라 `ms-2` 같은 배치 class가 track만 옮기고 thumb은 남는다. 앱이 바꾸려는 것은 대개 배치(간격, 여백)이고, 모양은 `size`·`color`가 맡는다(③).
- **input 하나만 렌더(label 없음)**: 규칙과 그대로 맞지만, 스위치 옆 label을 매번 앱이 `<label>`로 감싸야 하고 누르는 영역이 track 크기로 줄어든다(①).
- **thumb을 input의 `::before`로 그리기**: 요소 하나로 끝나지만 input의 가상 요소 렌더는 브라우저마다 보장되지 않는다. span 형제 + `peer-*`를 쓴다.

## Consequences

- Switch의 `className`은 track과 thumb 모양을 바꾸지 않는다. 문서 Props 절과 JSDoc에 적는다.
- Checkbox·Radio(티켓 16)처럼 자기 label을 가진 네이티브 조작 요소가 같은 모양이면 이 규칙을 따를 수 있다. 다르게 정하면 둘 중 하나를 맞춘다.
- forced-colors에서는 track과 thumb만 `forced-color-adjust: none`으로 두고, 쓰는 Token 변수를 시스템 색(`Highlight`, `HighlightText`, `CanvasText`, `GrayText`)으로 바꾼다. 기본 동작은 배경을 Canvas로 덮어 켜진 track과 thumb이 사라지기 때문이다(Chromium에서 확인).
