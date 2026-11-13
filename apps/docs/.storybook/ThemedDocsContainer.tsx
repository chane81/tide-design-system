import { DocsContainer, type DocsContainerProps } from "@storybook/addon-docs/blocks";
import type { PropsWithChildren, ReactElement } from "react";
import { useSyncExternalStore } from "react";
import { themes } from "storybook/theming";

import { getTheme, subscribeTheme } from "./theme.ts";

/**
 * Docs 페이지의 Storybook 글·표·코드 색을 툴바 Theme에 맞춘다.
 * `parameters.docs.theme`은 고정 값이라, Theme이 바뀔 때마다 `DocsContainer`의 `theme` prop을 바꿔 준다
 * (@storybook/addon-docs 10.6.6 `DocsContainerProps.theme`, `storybook/theming`의 `themes`).
 * 페이지와 예시 배경은 preview.css가 Tide `bg-canvas`로 덮는다.
 */
export function ThemedDocsContainer({
  children,
  context,
}: PropsWithChildren<DocsContainerProps>): ReactElement {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getTheme);

  return (
    <DocsContainer context={context} theme={theme === "dark" ? themes.dark : themes.light}>
      {children}
    </DocsContainer>
  );
}
