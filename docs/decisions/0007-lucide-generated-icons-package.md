# 아이콘은 Lucide를 생성 복사한 `@tide-tds/icons`로 배포한다

근거 원칙: ③ 단순함이 풍부함보다 우선한다, ④ 발견할 수 있음

아이콘 세트는 Lucide다. `lucide-react`를 의존성으로 두지 않는다. 대신 `lucide-static`(ISC, 1.70.0 기준 SVG 2,322개: 정식 2,029 + alias 293)을 devDependency로 두고, 빌드 스크립트가 SVG에서 React Component를 생성해 **`@tide-tds/icons`** 로 배포한다. `@tide-tds/desktop`의 내부 아이콘(Checkbox 체크, chevron, 닫기 등)도 이 패키지에서 가져온다. 그래서 Tide의 런타임 외부 의존성은 아이콘 때문에 늘지 않는다.

- 이름은 모두 `Icon` 접미사를 붙인다(`PlusIcon`, `MenuIcon`). Lucide의 `Menu`, `Table`이 Tide Component 이름과 겹치기 때문이다.
- Tide 기본값(렌더 기준 선 두께 2px 고정, `currentColor`, `aria-hidden`)은 생성할 때 넣는다.
- 앱은 Tide와 같은 모양의 아이콘이 필요할 때 `@tide-tds/icons`에서 import한다. 다른 아이콘 라이브러리를 써도 된다. Component의 아이콘 자리는 `ReactNode`를 받는다.

상세(props, 크기 규칙, 접근성)는 [아이콘 전략 결정](../progress/tide-v0/issues/23-grilling-icon-strategy.md)에 있다.

## 검토한 대안

- **`lucide-react`를 dependency로 두고 re-export**: 코드는 짧다. 하지만 Tide 기본값을 넣으려면 결국 아이콘마다 감싸야 하고, 런타임 의존성이 생긴다. Lucide 쪽 변경이 그대로 Tide 사용자에게 전달된다.
- **desktop 안에 내부 아이콘 12개만 복사하고 공개하지 않음**: 가장 작다. 하지만 앱이 Tide와 같은 모양의 아이콘을 쓰려면 `lucide-react`를 따로 설치해야 하고, 크기·선 두께 기본값이 달라진다. 사용자가 `@tide-tds/icons`로 바로 쓰는 쪽을 원했다.
- **Tabler, Phosphor, Heroicons**: 라이선스(MIT)는 문제없다. Lucide를 고른 것은 shadcn 기본값이라 사용자가 이미 아는 세트이기 때문이다(④). Lucide는 filled 변형이 거의 없다는 단점이 있다.
- **직접 제작**: v0 범위에 비해 너무 크다.

## Consequences

- 배포 패키지가 세 개(foundation, desktop, icons)가 된다. ADR 0006의 "두 개"를 정정한다.
- 저작권 고지: Lucide LICENSE는 ISC 전문과, Feather에서 가져온 아이콘(check, x, chevron, plus, search 등)에 대한 MIT 전문을 함께 담고 있다. `@tide-tds/icons`는 이 LICENSE 전체를 그대로 포함한다. 생성 스크립트도 이 파일을 복사해야 한다.
- Lucide 업데이트는 devDependency 버전을 올리고 다시 생성해서 반영한다. Lucide가 아이콘 이름을 바꾸거나 지우면 Tide의 공개 export도 바뀐다. 이것은 semver상 breaking이다. 처리 방식은 [버전과 배포 정책 결정](../progress/tide-v0/issues/30-grilling-release.md)에서 정했다. alias 293개도 정식 Component의 다른 이름 export로 생성해, Lucide가 alias를 지울 때만 breaking이 된다.
- 아이콘이 2,000개가 넘으므로, 빌드 결과는 desktop처럼 파일 단위로 나뉘어야(`preserveModules`) tree-shaking이 된다.
- v0 아이콘 패키지는 React 전용이다. SVG 파일 자체를 export해 다른 프레임워크에서 쓰게 할지는 ADR 0001에 따라 Out of scope다.
