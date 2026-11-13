"use client";
import { useMemo, useRef, type ComponentProps, type ReactElement, type ReactNode } from "react";
// 서브패스 말고 루트 entry에서 import한다. Vite 사전 번들 목록이 바뀌지 않게 한다.
import { mergeProps, mergeRefs, useTagGroup } from "react-aria";
import { useListState } from "react-stately";

import { cn } from "../../_internal/libs/cn";
import { resolveCollectionChildren } from "../../_internal/libs/listCollection";
import { tagGroupClass } from "../constants/tagClass";
import { TagGroupContext, type TagGroupContextValue } from "../hooks/useTagGroupContext";
import { TagView } from "./TagView";

type TagGroupNameProps =
  | {
      /** 묶음 이름(예: `"고른 필터"`). 화면에 보이는 제목이 있으면 `aria-labelledby`를 쓴다. */
      "aria-label": string;
      "aria-labelledby"?: string;
    }
  | {
      "aria-label"?: string;
      /** 묶음 이름이 되는 요소의 id. 이름(`aria-label`이나 `aria-labelledby`) 하나는 꼭 준다. */
      "aria-labelledby": string;
    };

interface TagGroupBaseProps extends Omit<
  ComponentProps<"div">,
  "role" | "children" | "aria-label" | "aria-labelledby"
> {
  /**
   * 지우기 버튼이나 Delete·Backspace로 지우려 할 때 태그의 `value`로 부른다. 주면 지우기 버튼이 생긴다.
   * 태그를 목록에서 빼는 일은 앱이 한다.
   */
  onRemove?: (value: string) => void;
  /** 지우기 버튼 이름의 앞부분. 기본값 `"제거"`. 태그 글자와 이어 읽는다(예: 「제거 디자인」). */
  removeLabel?: string;
  /** `Tag`. 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

export type TagGroupProps = TagGroupBaseProps & TagGroupNameProps;

/**
 * 고르거나 입력한 값을 보여 주는 태그 묶음(`role="grid"`). ←→·Home·End로 태그를 옮긴다.
 * 이름은 `aria-label`이나 `aria-labelledby`로 꼭 준다.
 */
export function TagGroup({
  onRemove,
  removeLabel = "제거",
  ref,
  className,
  children,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  ...props
}: TagGroupProps): ReactElement {
  const groupRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => resolveCollectionChildren(children), [children]);
  // 타입은 React Stately Item이지만, getCollectionNode를 붙인 Tide 태그 요소를 넘긴다(ADR 0019).
  const state = useListState<object>({
    children: items as unknown as Parameters<typeof useListState<object>>[0]["children"],
  });
  const { gridProps } = useTagGroup(
    {
      id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby,
      // React Aria는 key Set으로 부르지만 선택이 없어 늘 태그 하나다.
      onRemove: onRemove ? (keys) => keys.forEach((key) => onRemove(String(key))) : undefined,
    },
    state,
    groupRef,
  );
  const mergedRef = useMemo(() => mergeRefs(ref, groupRef), [ref, groupRef]);
  const context = useMemo<TagGroupContextValue>(
    () => ({ onRemove, removeLabel }),
    [onRemove, removeLabel],
  );

  return (
    <div {...mergeProps(props, gridProps)} ref={mergedRef} className={cn(tagGroupClass, className)}>
      <TagGroupContext value={context}>
        {[...state.collection].map((node) => (
          <TagView key={node.key} node={node} state={state} />
        ))}
      </TagGroupContext>
    </div>
  );
}
