import type { TextStyleName } from "@tide-design/foundation";
import type { HTMLAttributes, ReactElement, Ref } from "react";

import { renderElement } from "../_internal/libs/renderElement";

type HeadingVariant = Extract<TextStyleName, `display-${string}` | `heading-${string}`>;

type TextVariant = Exclude<TextStyleName, HeadingVariant>;

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface TypographyBaseProps extends HTMLAttributes<HTMLElement> {
  /** 루트 DOM 요소에 연결한다. */
  ref?: Ref<HTMLElement>;
  /** 다른 요소로 렌더한다. 예: `render={<label htmlFor="name" />}`. 이때 `level`은 무시한다. */
  render?: ReactElement;
}

interface TypographyHeadingProps extends TypographyBaseProps {
  /** 텍스트 스타일 이름 */
  variant: HeadingVariant;
  /** 제목 단계. 주지 않으면 텍스트 스타일의 기본 단계를 쓴다. */
  level?: HeadingLevel;
}

interface TypographyTextProps extends TypographyBaseProps {
  /** 텍스트 스타일 이름. 기본값 `body-md`. */
  variant?: TextVariant;
  /** heading·display 텍스트 스타일에만 있다. */
  level?: never;
}

export type TypographyProps = TypographyHeadingProps | TypographyTextProps;

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
const variantClass: Record<TextStyleName, string> = {
  "display-lg": "text-display-lg",
  "display-md": "text-display-md",
  "heading-xl": "text-heading-xl",
  "heading-lg": "text-heading-lg",
  "heading-md": "text-heading-md",
  "heading-sm": "text-heading-sm",
  "heading-xs": "text-heading-xs",
  "body-lg": "text-body-lg",
  "body-md": "text-body-md",
  "body-sm": "text-body-sm",
  "label-lg": "text-label-lg",
  "label-md": "text-label-md",
  "label-sm": "text-label-sm",
  caption: "text-caption",
};

// heading·display는 `level`로 바꿀 수 있게 단계 숫자로 적는다.
const elementByVariant: Record<HeadingVariant, HeadingLevel> & Record<TextVariant, "p" | "span"> = {
  "display-lg": 1,
  "display-md": 1,
  "heading-xl": 1,
  "heading-lg": 2,
  "heading-md": 3,
  "heading-sm": 4,
  "heading-xs": 5,
  "body-lg": "p",
  "body-md": "p",
  "body-sm": "p",
  "label-lg": "span",
  "label-md": "span",
  "label-sm": "span",
  caption: "p",
};

/**
 * 텍스트 스타일 하나로 크기·행간·굵기를 정하고 알맞은 시맨틱 요소로 렌더한다.
 * heading·display는 항상 `<h*>`다. 다른 요소는 `render`로. 서버 컴포넌트로 쓸 수 있다.
 */
export function Typography({
  variant = "body-md",
  level,
  render,
  ...props
}: TypographyProps): ReactElement {
  const element = elementByVariant[variant];

  return renderElement({
    defaultElement: typeof element === "number" ? `h${level ?? element}` : element,
    render,
    baseClassName: variantClass[variant],
    props,
  });
}
