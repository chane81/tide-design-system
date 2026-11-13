import {
  cloneElement,
  createElement,
  type CSSProperties,
  type ReactElement,
  type Ref,
  type RefCallback,
} from "react";

import { cn } from "./cn.ts";

// `render` prop 병합 유틸(ADR 0005). 루트가 DOM 요소 하나인 Component가 함께 쓴다.
// 넘겨받은 요소에 Component의 props를 얹는다. 규칙:
// - className: Component 기본 class → render 요소의 class → 사용자 className 순서로 `cn`에 넣는다(사용자가 이긴다).
// - style: render 요소의 style 위에 Component(사용자) style을 덮는다.
// - 이벤트 핸들러(`on` + 대문자): 둘 다 있으면 render 요소의 것을 먼저, Component(사용자)의 것을 나중에 부른다.
// - ref: 둘 다 있으면 하나로 합친다. 하나만 있으면 그대로 넘긴다(서버 컴포넌트에서 함수를 새로 만들지 않게).
// - children: Component에 준 children이 있으면 그것을, 없으면 render 요소의 children을 쓴다.
// - 그 밖의 props는 Component(사용자) 쪽이 이긴다.
// 이 파일은 hook·state·이벤트를 쓰지 않으므로 "use client"가 없다. 서버 컴포넌트에서도 쓸 수 있다.

/** `renderElement`의 인자 */
export interface RenderOptions {
  /** 기본으로 렌더할 DOM 요소 이름 */
  readonly defaultElement: string;
  /** 사용자가 넘긴 `render` 요소 */
  readonly render: ReactElement | undefined;
  /** Component 기본 class */
  readonly baseClassName: string;
  /** 루트에 넘길 props(사용자 className, ref 포함). className은 기본 class와 합치기 전 값이다. */
  readonly props: { readonly className?: string | undefined };
}

type AnyProps = Record<string, unknown>;
type Handler = (...args: unknown[]) => unknown;

const isHandlerName = (name: string): boolean => /^on[A-Z]/.test(name);

/** ref 여러 개를 하나로 합친다. React 19의 cleanup 함수 반환도 지원한다. */
function mergeRefs<T>(...refs: Ref<T>[]): RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === "function") return ref(node);
      if (ref) ref.current = node;
      return undefined;
    });
    return () => {
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index];
        if (typeof cleanup === "function") cleanup();
        else if (typeof ref === "function") ref(null);
        else if (ref) ref.current = null;
      });
    };
  };
}

/** render 요소의 props와 Component props를 위 규칙대로 합친다. */
function mergeProps(elementProps: AnyProps, props: AnyProps): AnyProps {
  const merged: AnyProps = { ...elementProps };
  for (const [name, value] of Object.entries(props)) {
    const existing = elementProps[name];
    if (value === undefined) continue;
    if (isHandlerName(name) && typeof existing === "function" && typeof value === "function") {
      merged[name] = (...args: unknown[]) => {
        (existing as Handler)(...args);
        return (value as Handler)(...args);
      };
    } else if (name === "style" && existing && typeof existing === "object") {
      merged[name] = { ...(existing as CSSProperties), ...(value as CSSProperties) };
    } else if (name === "ref" && existing) {
      merged[name] = mergeRefs(existing as Ref<unknown>, value as Ref<unknown>);
    } else {
      merged[name] = value;
    }
  }
  return merged;
}

/** `render`가 있으면 그 요소에 props를 병합하고, 없으면 기본 요소를 렌더한다. */
export function renderElement({
  defaultElement,
  render,
  baseClassName,
  props,
}: RenderOptions): ReactElement {
  const { className, ...rest } = props as AnyProps & { className?: string };
  if (!render) {
    return createElement(defaultElement, { ...rest, className: cn(baseClassName, className) });
  }
  const elementProps = render.props as AnyProps;
  const merged = mergeProps(elementProps, rest);
  merged["className"] = cn(baseClassName, elementProps["className"] as string, className);
  return cloneElement(render, merged);
}
