// 목록 Component의 항목을 React Stately 컬렉션으로 모으는 공통 부분(tide-v0-impl 티켓 27, ADR 0019).
// Menu가 처음 쓰고 Select·Combobox(28·29)가 옵션·묶음에 다시 쓴다. hook·state를 쓰지 않으므로 "use client"가 없다.
//
// React Stately의 `useTreeState`·`useListState`는 children 요소의 type에 붙은 `getCollectionNode`로 항목을 모은다
// (react-stately 3.51.0 `Item`·`Section`과 같은 방식, 설치본 CollectionBuilder 소스로 확인). Tide 항목 Component
// (`MenuItem` 등)는 렌더하지 않는 표시 요소이고, 여기 함수를 `getCollectionNode`로 붙인다. 마크업은 목록 Component가
// 컬렉션의 node를 돌며 직접 그린다(ADR 0004).
//
// 이 방식은 항목이 목록의 바로 아래(또는 Fragment·배열 안)에 있어야 한다. 서버 컴포넌트에서 만든 항목 요소는 type이
// client 참조(React lazy)로 오므로 `resolveCollectionChildren`으로 실제 Component로 바꿔 넘긴다.

import {
  Children,
  createElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

/** React Stately 컬렉션 빌더가 읽는 부분 node. react-stately 3.51.0 `PartialNode`의 쓰는 필드만 적는다. */
interface PartialNode {
  readonly type: "item" | "section";
  readonly props?: object;
  readonly rendered?: ReactNode;
  readonly textValue?: string;
  readonly "aria-label"?: string;
  readonly hasChildNodes?: boolean;
  readonly element?: ReactElement;
  readonly childNodes?: () => Iterable<PartialNode>;
}

/** 컬렉션 빌더가 알아보는 Component type. */
type CollectionComponent<P> = ((props: P) => null) & {
  getCollectionNode?: (props: P) => Generator<PartialNode>;
};

/** 항목 Component의 공통 props. Tide 이름(`disabled`)을 React Stately 이름(`isDisabled`)으로 바꿔 node에 넣는다. */
export interface CollectionItemProps {
  /** `true`면 고르거나 실행할 수 없고 키보드 위치도 건너뛴다. */
  disabled?: boolean;
  /** 타입어헤드(글자를 쳐서 항목으로 옮겨 가기)에 쓰는 글자. 없으면 children의 글자를 모은다. */
  textValue?: string;
  "aria-label"?: string;
  children?: ReactNode;
}

/** 항목 묶음 Component의 공통 props */
export interface CollectionSectionProps {
  /** 묶음 제목. 화면에 보이고 묶음(`group`)의 이름이 된다. */
  heading?: ReactNode;
  /** 제목이 없을 때 묶음의 이름 */
  "aria-label"?: string;
  children?: ReactNode;
}

const lazyType = Symbol.for("react.lazy");

interface LazyComponent {
  readonly $$typeof: symbol;
  readonly _payload: unknown;
  readonly _init: (payload: unknown) => unknown;
}

const isLazy = (type: unknown): type is LazyComponent =>
  typeof type === "object" && type !== null && (type as LazyComponent).$$typeof === lazyType;

/**
 * children 안의 React node에서 글자만 모은다. 항목의 기본 타입어헤드 글자다. 아이콘(글자 없는 요소)은 빠진다.
 */
export function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map((child: ReactNode) => textOf(child)).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/**
 * 목록에 넘길 children을 컬렉션 빌더가 읽을 수 있게 고친다.
 *
 * - 서버 컴포넌트가 만든 요소는 client Component type이 React lazy 참조(RSC payload의 `$L`)로 온다. 컬렉션 빌더는
 *   type의 `getCollectionNode`를 직접 보므로 lazy를 풀어 실제 Component로 바꾼다. 목록 Component와 항목 Component는
 *   같은 모듈이라 목록이 렌더되는 시점에는 이미 불러와져 있다(풀 때 기다리지 않는다).
 * - Fragment는 펼친다. 배열·Fragment 안의 lazy도 같이 푼다.
 * - 묶음 안의 항목은 묶음의 `getCollectionNode`(`sectionCollectionNode`)가 같은 함수로 푼다.
 */
export function resolveCollectionChildren(children: ReactNode): ReactNode[] {
  const resolved: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) {
      if (child != null && typeof child !== "boolean") resolved.push(child);
      return;
    }
    if (child.type === Fragment) {
      resolved.push(...resolveCollectionChildren(child.props.children));
      return;
    }
    if (isLazy(child.type)) {
      // React lazy의 `_init(_payload)`는 불러온 Component를 돌려준다(아직이면 Promise를 던져 Suspense로 기다린다).
      const type = child.type._init(child.type._payload) as CollectionComponent<object>;
      resolved.push(createElement(type, { ...child.props, key: child.key }));
      return;
    }
    resolved.push(child);
  });
  // 항목 key는 컬렉션 빌더가 요소의 key로, 없으면 자리 번호로 만든다.
  return resolved;
}

/**
 * 항목 Component의 `getCollectionNode`. node의 props에 `isDisabled`를 더한다(React Stately `SelectionManager`·
 * 키보드 이동이 `props.isDisabled`를 읽는다). 렌더는 목록 Component가 node.props(항목에 준 props 그대로)로 한다.
 */
export function* itemCollectionNode(props: CollectionItemProps): Generator<PartialNode> {
  yield {
    type: "item",
    props: { ...props, isDisabled: props.disabled ?? false },
    rendered: props.children,
    textValue: props.textValue ?? textOf(props.children).trim(),
    "aria-label": props["aria-label"],
    hasChildNodes: false,
  };
}

/** 묶음 Component의 `getCollectionNode`. 안의 항목도 `resolveCollectionChildren`으로 고쳐 넘긴다. */
export function* sectionCollectionNode(props: CollectionSectionProps): Generator<PartialNode> {
  yield {
    type: "section",
    props,
    rendered: props.heading,
    "aria-label": props["aria-label"],
    hasChildNodes: true,
    *childNodes() {
      for (const child of resolveCollectionChildren(props.children)) {
        if (isValidElement(child)) yield { type: "item", element: child };
      }
    },
  };
}

/**
 * 렌더하지 않는 표시 Component에 컬렉션 node 생성 함수를 붙인다. 공개 타입에는 드러나지 않는다.
 */
export function asCollectionComponent<P>(
  component: (props: P) => null,
  getCollectionNode: (props: P) => Generator<PartialNode>,
): void {
  (component as CollectionComponent<P>).getCollectionNode = getCollectionNode;
}
