import type { ComponentProps, ReactNode } from "react";
import type { ListState } from "react-stately";

import type { CollectionSectionProps, CollectionValueItemProps } from "../../libs/listCollection";

/** 목록 상태 컬렉션의 node */
export type ListNode = ListState<object>["collection"] extends Iterable<infer N> ? N : never;

/** 옵션 Component(Select·Combobox 옵션)의 props. 옵션 요소는 `<div role="option">`이다. */
export interface ListBoxOptionOwnProps extends CollectionValueItemProps {
  /** 옵션 내용. 아이콘(장식용)과 글자를 함께 둘 수 있다. Select 트리거에도 이 내용이 보인다. */
  children?: ReactNode;
}

export interface ListBoxOptionProps
  extends
    ListBoxOptionOwnProps,
    Omit<ComponentProps<"div">, keyof ListBoxOptionOwnProps | "role"> {}

/** 옵션 묶음 Component의 props */
export interface ListBoxSectionProps extends CollectionSectionProps {
  /** 묶음 감싸개(`<div role="presentation">`)에 붙는 class */
  className?: string;
  /** 옵션. 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

export interface ViewProps {
  readonly node: ListNode;
  readonly state: ListState<object>;
}
