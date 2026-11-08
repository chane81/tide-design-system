# Token/CSS는 프레임워크 무관, v0 Component는 React 전용

근거 원칙: ③ 단순함이 유연함보다 우선한다

Token과 CSS 변수는 어떤 프레임워크에서도 쓸 수 있는 형태로 만들고, v0의 Component는 React로만 구현한다. Foundation 층은 특정 UI 런타임에 묶지 않고 재사용할 수 있게 하되, 컴포넌트를 여러 프레임워크로 구현하는 비용은 v0에서 지지 않기로 했다. Web Components만 쓰는 방식, React 하나로 모든 층을 만드는 방식도 검토했으나 채택하지 않았다.

## Consequences

- Token 패키지는 React에 의존하면 안 된다. 이 제약은 모노레포의 패키지 경계로 강제한다(ADR 0002).
- Vue, Svelte 등 다른 프레임워크용 Component는 v0 범위에 포함하지 않는다.
