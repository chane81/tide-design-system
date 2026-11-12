"use client";
// 지울 수 있는 라벨 묶음 Tag(tide-v0-impl 티켓 33). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useTagGroup, useTag, mergeProps, mergeRefs), react-stately 3.51.0(useListState).
// 태그는 목록 공통 부분(list-collection.ts, ADR 0019)으로 모은다. 태그의 `value`가 컬렉션 key다(`valueItemCollectionNode`).
//
// 구조(react-aria 3.53.1 useTagGroup·useTag 설치본 소스로 확인):
// - `TagGroup`: `role="grid"`(태그가 없으면 `group`). 안의 `Tag`를 컬렉션으로 모아 `useListState`·`useTagGroup`에 넘긴다.
//   ←→(끝에서 처음으로 돈다, RTL이면 반대)·Home/End로 태그를 옮기고 비활성 태그는 건너뛴다. Tab 순서에는 태그 하나만 든다.
// - `Tag`: `role="row"` 안의 `role="gridcell"`. 렌더하지 않는 표시 요소이고 `TagGroup`이 node로 그린다.
//   `onRemove`가 있으면 Delete·Backspace로 지우고, 끝에 지우기 IconButton이 붙는다.
// - 지운 뒤 포커스: useListState가 지운 태그의 다음(없으면 앞) 태그로 focusedKey를 옮기고, React Aria가 그 태그에
//   포커스를 준다. 마지막 태그까지 지우면 useTagGroup이 묶음에 포커스를 준다.
//
// 선택(켜고 끄기)은 받지 않는다. Tag는 고르거나 입력한 값을 보여 주는 라벨이고, 눌러서 켜고 끄는 칩과 다르다(GLOSSARY).
// 상호작용이 없는 상태 표시는 Badge(서버 컴포넌트)다. Tag는 키보드 탐색에 hook·state가 필요해 client Component다.

import { XIcon } from "@tide-tds/icons";
import {
  createContext,
  use,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, useTag, useTagGroup } from "react-aria";
import { useListState, type ListState } from "react-stately";

import { cn } from "./cn.ts";
import { IconButton } from "./IconButton.tsx";
import {
  asCollectionComponent,
  resolveCollectionChildren,
  valueItemCollectionNode,
  type CollectionValueItemProps,
} from "./list-collection.ts";
import type { ColorFamilyName } from "./types.ts";

interface TagGroupContextValue {
  readonly onRemove: ((value: string) => void) | undefined;
  readonly removeLabel: string;
}

const TagGroupContext = createContext<TagGroupContextValue | null>(null);

// 묶음: 태그를 줄바꿈하며 늘어놓는다. 가로·세로 간격 8px.
const tagGroupClass = "flex flex-wrap items-center gap-2 outline-none";

// 태그(spec radius 「작은 표시 요소는 sm」):
// - 높이 32px(지우기 버튼 24px + 위아래 3px + border 1px). 글자 `text-label-md`, 시작쪽 여백 10px.
//   지우기 버튼이 있으면 끝쪽 여백 3px(버튼이 끝을 채운다), 없으면 10px.
// - 색: accent 슬롯의 subtle 배경 + on-subtle 글자 + subtle-border 테두리(ADR 0022). 색 이름 규칙(colorContrastRules)의
//   on-subtle × subtle 4.5:1이다. 파스텔 테두리는 꾸밈이라 대비 검사에서 뺐다.
// - forced-colors에서는 브라우저가 테두리를 CanvasText로 덮어 배경 없이도 모양이 남는다.
// - 지우기 버튼 hover·누름 배경에 쓸 태그 색을 변수로 남긴다. IconButton은 루트에 자기 `data-color`(Role)를 붙여
//   accent 슬롯을 바꾸므로, 태그 요소에서 계산한 값(custom property는 계산값으로 상속된다)을 넘겨야 태그 색을 따른다.
// - 비활성: `aria-disabled`(React Aria가 붙인다)면 `bg-disabled`·`text-disabled`.
// - 포커스: `focus-visible:focus-ring`(ring 2px, offset 2px). 태그 radius sm을 따른다.
const tagClass = [
  "inline-flex h-8 max-w-full min-w-0 shrink-0 items-center rounded-sm border border-accent-subtle bg-accent-subtle ps-2.5 align-middle text-label-md whitespace-nowrap text-accent-on-subtle outline-none select-none",
  "[--tag-remove-hover:var(--tide-accent-subtle-hover)] [--tag-remove-active:var(--tide-accent-subtle-active)]",
  "aria-disabled:bg-disabled aria-disabled:text-disabled focus-visible:focus-ring",
].join(" ");

// 칸: 글자와 지우기 버튼을 한 줄로 둔다. 글자 앞 아이콘(장식용)은 텍스트 옆 아이콘 크기 16px, 글자와 4px.
const tagCellClass = "flex min-w-0 items-center gap-1";
const tagLabelClass = "inline-flex min-w-0 items-center gap-1 [&>svg]:size-4 [&>svg]:shrink-0";

// 지우기 버튼: IconButton ghost `xs`(24×24). 글자색은 태그 글자(on-subtle)를 따르고(`text-current`), hover·누름 배경은 태그 색의
// subtle-hover·subtle-active다(덮기로 계산된 값. 색 이름 규칙 on-subtle × subtle-hover·subtle-active 4:1, ADR 0023). radius는 태그와 같은 sm이다.
const removeClass = "rounded-sm text-current";
const removeInteractionClass = "hover:bg-(--tag-remove-hover) active:bg-(--tag-remove-active)";

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
  // Tide 태그 요소를 넘긴다(list-collection.ts). 선택은 쓰지 않는다(selectionMode 기본 none).
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

export interface TagProps
  extends
    Omit<ComponentProps<"div">, "color" | "role" | "id" | "tabIndex" | "children">,
    CollectionValueItemProps {
  /** 태그 글자. 필수다. 아이콘(장식용)을 앞에 함께 둘 수 있다. */
  children: ReactNode;
  /**
   * 색 계열 이름. Tide 색 계열 8개(장식 계열 purple·mint 포함)와 앱이 `ColorFamilyRegistry`에 더한 계열을 받는다. 기본값은 `gray`다.
   * 분류를 구분하는 뜻 없는 색이라 Role(`primary`·`danger` 등)은 받지 않는다(ADR 0016·0017 후속).
   * 루트에 `data-color`로 붙고 바깥 요소의 색을 물려받지 않는다.
   */
  color?: ColorFamilyName;
}

/**
 * 태그 하나(`role="row"`). `TagGroup` 바로 안에 둔다. `value`가 묶음 안의 key이고 `onRemove`에 넘어오는 값이다.
 * `disabled`면 지울 수 없고 키보드 이동도 건너뛴다(`aria-disabled`).
 */
export function Tag(_props: TagProps): null {
  // 렌더하지 않는다. TagGroup이 컬렉션으로 모아 TagView로 그린다.
  return null;
}
asCollectionComponent(Tag, valueItemCollectionNode);

type CollectionNode = ListState<object>["collection"] extends Iterable<infer N> ? N : never;

interface TagViewProps {
  readonly node: CollectionNode;
  readonly state: ListState<object>;
}

/** 태그 하나를 그린다. node.props는 앱이 Tag에 준 props(와 컬렉션이 더한 isDisabled)다. */
function TagView({ node, state }: TagViewProps): ReactElement {
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
            // 이름은 aria-labelledby(버튼 자신 + 태그 행)로 「제거 디자인」처럼 읽힌다(React Aria removeButtonProps).
            aria-label={context.removeLabel}
            aria-labelledby={removeButtonProps["aria-labelledby"]}
            id={removeButtonProps.id}
            variant="ghost"
            color="neutral"
            size="xs"
            disabled={isDisabled}
            // Tab 순서에서 뺀다. 키보드는 태그에서 Delete·Backspace로 지운다(태그 설명으로 알린다). 버튼이 Tab 순서에
            // 있으면 태그마다 Tab 자리가 생겨 grid의 「Tab 자리 하나」가 깨진다.
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
