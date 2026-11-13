import { DocsContainer, type DocsContainerProps } from "@storybook/addon-docs/blocks";
import type { PropsWithChildren, ReactElement } from "react";
import { useSyncExternalStore } from "react";
import { themes } from "storybook/theming";

import { getTheme, subscribeTheme } from "./theme";

/** Docs 페이지의 Storybook 글·표·코드 색을 툴바 Theme에 맞춘다. `parameters.docs.theme`은 고정 값이라 prop으로 바꾼다. */
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
