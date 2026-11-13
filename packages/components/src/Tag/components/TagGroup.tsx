"use client";
import { useMemo, useRef, type ComponentProps, type ReactElement, type ReactNode } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, useTagGroup } from "react-aria";
import { useListState } from "react-stately";

import { cn } from "../../_internal/libs/cn.ts";
import { resolveCollectionChildren } from "../../_internal/libs/listCollection.ts";
import { tagGroupClass } from "../constants/tagClass.ts";
import { TagGroupContext, type TagGroupContextValue } from "../hooks/useTagGroupContext.ts";
import { TagView } from "./TagView.tsx";

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
   * 태그를 지우려 할 때 지울 태그의 `value`로 부른다. 지우기 버튼을 누르거나 태그에서 Delete·Backspace를 누르면 불린다.
   * 주면 태그마다 지우기 버튼이 생긴다. 태그를 목록에서 빼는 일은 앱이 한다.
   */
  onRemove?: (value: string) => void;
  /**
   * 지우기 버튼 이름의 앞부분. 기본값은 `"제거"`다. 버튼 이름은 이 글자와 태그 글자를 이어 읽는다(예: 「제거 디자인」).
   */
  removeLabel?: string;
  /** `Tag`. 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

export type TagGroupProps = TagGroupBaseProps & TagGroupNameProps;

/**
 * 고르거나 입력한 값을 보여 주는 태그 묶음(`role="grid"`). ←→로 태그를 옮기고(끝에서 처음으로 돈다) Home·End로
 * 처음·마지막 태그에 간다. `onRemove`를 주면 Delete·Backspace와 지우기 버튼으로 태그를 지운다.
 * 지운 뒤 포커스는 옆 태그로 옮겨 간다. 이름은 `aria-label`이나 `aria-labelledby`로 꼭 준다.
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
  // useListState의 children 타입은 React Stately 요소(Item)지만, 같은 방식으로 getCollectionNode를 붙인
  // Tide 태그 요소를 넘긴다(_internal/libs/listCollection.ts). 선택은 쓰지 않는다(selectionMode 기본 none).
  const state = useListState<object>({
    children: items as unknown as Parameters<typeof useListState<object>>[0]["children"],
  });
  const { gridProps } = useTagGroup(
    {
      id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby,
      // React Aria는 key Set으로 부른다. 선택이 없어 늘 태그 하나이므로 그 값 하나로 알린다.
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
