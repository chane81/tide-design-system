// moduleResolution: nodenext에서 배포된 d.ts가 해석되는지 확인한다.
import { cn, VisuallyHidden, type VisuallyHiddenProps } from "@tide-tds/desktop";
import { color, semantic } from "@tide-tds/foundation";
import { tailwindMergeConfig } from "@tide-tds/foundation/tailwind-merge";

const className: string = cn("p-4", "p-2");
const props: VisuallyHiddenProps = { children: "텍스트" };
const anchor: "#3183f5" = color.blue[500];
const primary: "blue-600" = semantic.background["primary-solid"].light;

export const values = [
  className,
  props,
  VisuallyHidden,
  anchor,
  primary,
  tailwindMergeConfig,
] as const;
