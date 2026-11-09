import { AnchorMdx } from "@storybook/addon-docs/blocks";
import type { ComponentProps, ReactElement } from "react";

type DocsAnchorProps = ComponentProps<typeof AnchorMdx>;

/**
 * 문서 링크. 외부 주소는 새 탭으로 열고, 나머지(`?path=`, `#앵커`)는 Storybook 기본 링크(AnchorMdx)에 맡긴다.
 * 문서는 iframe 안에 있어서, 같은 탭으로 열면 GitHub처럼 frame을 막는 사이트가 열리지 않는다.
 * `target="_blank"`는 브라우저가 noopener로 다루므로 rel을 따로 주지 않는다(AnchorMdx 타입에도 rel이 없다).
 */
export function DocsAnchor(props: DocsAnchorProps): ReactElement {
  if (/^https?:\/\//.test(props.href)) {
    return <AnchorMdx {...props} target="_blank" />;
  }
  return <AnchorMdx {...props} />;
}
