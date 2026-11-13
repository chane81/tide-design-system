// 항목 Component는 렌더하지 않는 표시 요소이고, 여기 함수를 `getCollectionNode`로 붙여 React Stately가 모은다(ADR 0019).
// 항목은 목록의 바로 아래(또는 Fragment·배열 안)에 있어야 한다.

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
  /** 컬렉션 key. 없으면 빌더가 요소 key 또는 자리 번호로 만든다. */
  readonly key?: string;
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

/** children에서 글자만 모은다. 항목의 기본 타입어헤드 글자다. */
export function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map((child: ReactNode) => textOf(child)).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);

  return "";
}

/**
 * 서버 컴포넌트가 만든 항목은 type이 React lazy 참조로 오므로 풀어 실제 Component로 바꾼다(ADR 0019). Fragment는 펼친다.
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
      // `_init`·`_payload`는 React 공개 API가 아니다. React를 올리면 Menu의 lazy 항목 테스트를 확인한다.
      const type = child.type._init(child.type._payload) as CollectionComponent<object>;
      resolved.push(createElement(type, { ...child.props, key: child.key }));

      return;
    }
    resolved.push(child);
  });

  return resolved;
}

/** node props에 `isDisabled`를 더한다. React Stately 선택·키보드 이동이 그 이름을 읽는다. */
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

/** 값을 고르는 옵션 Component(Select·Combobox 옵션)의 공통 props. `value`가 컬렉션 key가 된다. */
export interface CollectionValueItemProps extends CollectionItemProps {
  /** 옵션의 값. 고르면 이 값이 목록의 값이 되고 폼에 제출된다. 같은 목록 안에서 겹치지 않아야 한다. */
  value: string;
}

/** `value`를 node key로 yield해, 묶음 안에서도 목록의 선택 key가 곧 앱의 값이 된다. */
export function* valueItemCollectionNode(props: CollectionValueItemProps): Generator<PartialNode> {
  for (const node of itemCollectionNode(props)) yield { ...node, key: props.value };
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

/** 렌더하지 않는 표시 Component에 컬렉션 node 생성 함수를 붙인다. 공개 타입에는 드러나지 않는다. */
export function asCollectionComponent<P>(
  component: (props: P) => null,
  getCollectionNode: (props: P) => Generator<PartialNode>,
): void {
  (component as CollectionComponent<P>).getCollectionNode = getCollectionNode;
}
