// Component가 함께 쓰는 공통 union 타입(spec 「`@tide-tds/components` 공통 API」 스타일 축).
// 한 곳에서 정의하고, Component마다 `Extract`로 필요한 값만 고른다.

/** Component size. 높이는 `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px다(spec size 표). */
export type Size = "xs" | "sm" | "md" | "lg";
