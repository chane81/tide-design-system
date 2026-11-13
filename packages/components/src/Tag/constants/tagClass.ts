// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
export const tagGroupClass = "flex flex-wrap items-center gap-2 outline-none";

// IconButton은 자기 data-color로 accent를 바꾸므로, 지우기 버튼 hover·누름에 쓸 태그 색을 태그 요소에서 변수로 넘긴다.
export const tagClass = [
  "inline-flex h-8 max-w-full min-w-0 shrink-0 items-center rounded-sm border border-accent-subtle bg-accent-subtle ps-2.5 align-middle text-label-md whitespace-nowrap text-accent-on-subtle outline-none select-none",
  "[--tag-remove-hover:var(--tide-accent-subtle-hover)] [--tag-remove-active:var(--tide-accent-subtle-active)]",
  "aria-disabled:bg-disabled aria-disabled:text-disabled focus-visible:focus-ring",
].join(" ");

export const tagCellClass = "flex min-w-0 items-center gap-1";
export const tagLabelClass =
  "inline-flex min-w-0 items-center gap-1 [&>svg]:size-4 [&>svg]:shrink-0";

export const removeClass = "rounded-sm text-current";
export const removeInteractionClass =
  "hover:bg-(--tag-remove-hover) active:bg-(--tag-remove-active)";
