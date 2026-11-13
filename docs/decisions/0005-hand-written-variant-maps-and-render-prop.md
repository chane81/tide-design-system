# variant 맵은 직접 작성하고, 조합은 `render` prop으로 한다

> **ADR 0011로 일부 정정됨(2026-11-10)**: [`color`는 열린 색 이름이고, `data-color`로 accent 슬롯에 꽂는다](0011-open-color-names-data-color-accent.md). 아래 「정정 (2026-11-10)」을 본다.

근거 원칙: ③ 단순함이 유연함보다 우선한다, ④ 발견할 수 있음이 외워야 함보다 우선한다

Component의 `variant` × `color` × `size` 클래스는 cva나 tailwind-variants 없이 **직접 작성한 객체 맵**으로 정의한다. 맵에는 타입을 붙인다(예: `Record<Variant, Record<Color, string>>`). 클래스 병합은 `cn()` 하나로 한다. `cn()`은 `clsx`와 `extendTailwindMerge`로 만들고, `extendTailwindMerge`에는 Token TS 원본에서 생성한 설정을 넣는다(ADR 0003).

다른 요소로 렌더해야 할 때(예: Button을 Next.js `<Link>`로)는 `render` prop에 요소를 넘긴다(`render={<Link href="/x" />}`). Tide는 props, ref, className을 그 요소에 병합한다. `asChild`와 `as`는 쓰지 않는다. `render`는 루트가 상호작용 요소 하나인 Component에만 둔다. 함수 형태의 `render`는 v0에 넣지 않는다.

상세는 [Component 공통 API 규칙 결정](../progress/tide-v0/issues/14-grilling-component-api.md)에 있다. 아래 버전은 2026-11-09에 npm과 context7로 확인했다.

## 검토한 대안

- **`class-variance-authority`(cva)**: shadcn이 쓰는 사실상 표준이다. 하지만 0.7.1(2024-11) 이후 릴리스가 없고, 후속 패키지 `cva` 1.0은 아직 `1.0.0-beta.12`다.
- **`tailwind-variants` 4.0.1**: slots와 compound variant를 지원한다. 하지만 v3.3부터 tailwind-merge 대신 자체 병합 엔진을 기본 빌드에 넣었다. 기존 twMerge 설정은 "대체로 호환"된다고만 적혀 있다. 쓰면 병합기가 둘이 되고(tv 내부와 `cn`), 우리가 생성하는 tailwind-merge 설정과 결과가 어긋날 수 있다.
- **`asChild`(Slot)**: Radix, Ark와 참고한 디자인 시스템 한 곳이 쓴다. 하지만 자식 요소를 복제해 props를 합치는 방식이라 동작이 암묵적이다. Tide는 headless 라이브러리를 쓰지 않으므로(ADR 0004) Slot도 직접 구현하거나 따로 가져와야 한다. shadcn도 Base UI로 옮기면서 `asChild`를 `render`로 바꿨다.
- **`as`(polymorphic)**: 참고한 디자인 시스템 두 곳이 쓴다. 넘긴 요소 타입에 따라 props 타입이 달라지므로 타입 정의가 복잡해지고, 에러 메시지도 읽기 어려워진다.

## Consequences

- variant 4 × color 6 조합을 맵에 모두 손으로 채워야 한다. 하나라도 빠뜨리면 타입 검사가 실패하므로 누락은 컴파일 단계에서 드러난다.
- 여러 부분으로 된 Component는 tv의 slots 같은 기능 없이 부분마다 맵을 따로 둔다. 각 부분은 자기 `className`을 받는다.
- 나중에 cva 1.0이 안정화되거나 tv의 병합이 tailwind-merge와 완전히 호환되면 도구를 다시 검토할 수 있다. 맵을 옮기는 작업은 기계적이고 공개 API에도 영향이 없다.
- `render`를 쓰는 Component는 넘겨받은 요소와 props를 병합하는 유틸(이벤트 핸들러 연결, ref 합치기, `cn` 병합)을 하나 가진다. 이 유틸은 Tide가 직접 작성한다.

## 정정 (2026-11-09)

[v0 Component 목록과 우선순위 결정](../progress/tide-v0/issues/15-grilling-component-list.md)에서 다음 두 가지를 바꿨다.

- `render`는 **루트가 DOM 요소 하나인 Component**에 둔다. 처음에는 "루트가 상호작용 요소 하나인 Component"로 한정했다. 그런데 Typography는 `<p>`, `<span>`, `<label>` 등으로 렌더할 수 있어야 한다. `as`를 따로 허용하면 조합 방식이 둘로 갈린다(③). 그래서 `render` 하나로 범위를 넓혔다.
- 맵 타입 예시의 `Variant`는 채움 방식(`solid | subtle | outline | ghost`) 값 집합을 뜻한다. Variant가 "Component마다 정의되는 주된 스타일 축"으로 넓어졌으므로, 공통 타입 이름은 채움 방식을 드러내도록 바꾼다(GLOSSARY 참고).

## 정정 (2026-11-10)

[ADR 0011](0011-open-color-names-data-color-accent.md)에서 variant 맵의 색 축을 뺐다. `color`는 열린 색 이름(Color)이라 맵으로 모든 색을 채울 수 없다. 맵은 `Record<FillVariant, string>`이고 accent Utility class(`bg-accent-solid`, `text-accent` 등)로 쓴다. 색은 Component 루트에 붙인 `data-color`가 accent 슬롯에 꽂는다. Consequences의 「variant 4 × color 6 조합을 맵에 모두 손으로 채운다」는 「채움 방식 4개를 채운다」로 읽는다. 맵을 직접 작성하고 `cn` 하나로 병합한다는 결정은 그대로다.
