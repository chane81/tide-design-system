"use client";
import { XIcon } from "@tide-design/icons";
import { use, useMemo, useRef, type ReactElement } from "react";
// 서브패스 말고 루트 entry에서 import한다. Vite 사전 번들 목록이 바뀌지 않게 한다.
import { mergeProps, mergeRefs, useTag } from "react-aria";
import type { ListState } from "react-stately";

import { cn } from "../../_internal/libs/cn";
import { IconButton } from "../../IconButton/IconButton";
import {
  removeClass,
  removeInteractionClass,
  tagCellClass,
  tagClass,
  tagLabelClass,
} from "../constants/tagClass";
import { TagGroupContext } from "../hooks/useTagGroupContext";
import type { TagProps } from "../Tag";
import type { CollectionNode } from "../types";

export interface TagViewProps {
  readonly node: CollectionNode;
  readonly state: ListState<object>;
}

// node.props는 앱이 Tag에 준 props에 컬렉션이 더한 isDisabled다.
export function TagView({ node, state }: TagViewProps): ReactElement {
  const context = use(TagGroupContext);
  const rowRef = useRef<HTMLDivElement>(null);
  const {
    ref,
    className,
    color = "gray",
    value: _value,
    disabled: _disabled,
    isDisabled: _isDisabled,
    textValue: _textValue,
    children: _children,
    "aria-label": _ariaLabel,
    // useTag가 태그 props로 useFocusable을 불러 이 처리기들을 이미 붙인다. 다시 병합하면 두 번 불린다.
    onFocus: _onFocus,
    onBlur: _onBlur,
    onKeyDown: _onKeyDown,
    onKeyUp: _onKeyUp,
    autoFocus: _autoFocus,
    ...props
  } = node.props as TagProps & { isDisabled?: boolean };
  const { rowProps, gridCellProps, removeButtonProps, allowsRemoving, isDisabled } = useTag(
    { item: node },
    state,
    rowRef,
  );
  const mergedRef = useMemo(() => mergeRefs(ref, rowRef), [ref, rowRef]);
  const onRemove = context?.onRemove;

  return (
    <div
      {...mergeProps(props, rowProps)}
      ref={mergedRef}
      // 색은 항상 붙인다(기본 gray). 바깥 data-color를 물려받지 않게 한다(ADR 0011).
      data-color={color}
      className={cn(tagClass, allowsRemoving ? "pe-0.75" : "pe-2.5", className)}
    >
      <div {...gridCellProps} className={tagCellClass}>
        <span className={tagLabelClass}>{node.rendered}</span>
        {allowsRemoving && onRemove ? (
          <IconButton
            // aria-labelledby(버튼 자신 + 태그 행)로 「제거 디자인」처럼 읽힌다.
            aria-label={context.removeLabel}
            aria-labelledby={removeButtonProps["aria-labelledby"]}
            id={removeButtonProps.id}
            variant="ghost"
            color="neutral"
            size="xs"
            disabled={isDisabled}
            // 버튼이 Tab 순서에 있으면 grid의 「Tab 자리 하나」가 깨진다. 키보드는 태그에서 Delete로 지운다.
            tabIndex={-1}
            onClick={() => onRemove(String(node.key))}
            className={cn(removeClass, isDisabled ? undefined : removeInteractionClass)}
          >
            <XIcon />
          </IconButton>
        ) : null}
      </div>
    </div>
  );
}
