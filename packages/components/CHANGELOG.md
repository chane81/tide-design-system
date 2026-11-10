# @tide-tds/components

## 0.1.0

### 호환되지 않는 변경 (minor)

- [`81183fd`](https://github.com/chane81/tide-design-system/commit/81183fdd015ecf3c197ebe410fb9a4d9dc8a801b) [@chane81](https://github.com/chane81) - Tide 첫 공개 릴리스입니다. `@tide-tds/components` 하나를 설치하면 Foundation과 아이콘이 함께 설치됩니다. 설치 방법은 문서 사이트의 「시작하기」를 따릅니다.

  - `@tide-tds/foundation`: 컬러(Role 6개, light/dark Theme, 대비 검사), 타이포그래피, radius·그림자·포커스 표시, 움직임·쌓임 단계 Token과 Tailwind CSS 연동, tailwind-merge 설정을 제공합니다.
  - `@tide-tds/icons`: Lucide 기반 아이콘 2,029개를 Tide 이름(`PlusIcon` 등)으로 제공합니다. 쓰지 않는 아이콘은 번들에 들어가지 않습니다.
  - `@tide-tds/components`: `VisuallyHidden`, `Typography`, `Spinner`를 제공합니다. 모두 서버 컴포넌트로 쓸 수 있습니다.

### 기능 추가와 수정 (patch)

- [`f95340c`](https://github.com/chane81/tide-design-system/commit/f95340c6103fba5cdd0f107ebace97603a7c7825) [@chane81](https://github.com/chane81) - 로딩 표시 Component `Spinner`를 더했다. 서버 컴포넌트로 쓸 수 있다.

  - 역할은 `status`이고 접근 가능한 이름 「로딩 중」이 기본으로 붙는다. `aria-label`(또는 `aria-labelledby`)로 바꾼다.
  - `size`는 `xs`·`sm` 14px, `md` 16px(기본값), `lg` 20px다. 같은 size Component의 텍스트 옆 아이콘 크기와 같다.
  - 회전은 `animate-spin`이고 움직임 줄이기에서도 멈추지 않는다. 색은 `currentColor`라 주변 글자색을 따른다.
  - 공통 size union 타입 `Size`(`xs`/`sm`/`md`/`lg`)를 루트에서 export한다.

- 의존성 업데이트 [[`81183fd`](https://github.com/chane81/tide-design-system/commit/81183fdd015ecf3c197ebe410fb9a4d9dc8a801b), [`3c5ad7f`](https://github.com/chane81/tide-design-system/commit/3c5ad7f5a14ae2b4a432ce5bd34c783eb799e168), [`c3badd4`](https://github.com/chane81/tide-design-system/commit/c3badd47219db4e6a6263be2e6fa2c03669fdaa7)]:
  - @tide-tds/foundation@0.1.0
  - @tide-tds/icons@0.1.0
