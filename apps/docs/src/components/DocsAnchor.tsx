import { AnchorMdx } from "@storybook/addon-docs/blocks";
import type { ComponentProps, ReactElement } from "react";

type DocsAnchorProps = ComponentProps<typeof AnchorMdx>;

/**
 * 외부 주소는 새 탭으로 연다. 문서가 iframe 안이라 같은 탭이면 frame을 막는 사이트가 열리지 않는다.
 * `target="_blank"`는 브라우저가 noopener로 다루므로 rel을 따로 주지 않는다.
 */
export function DocsAnchor(props: DocsAnchorProps): ReactElement {
  if (/^https?:\/\//.test(props.href)) {
    return <AnchorMdx {...props} target="_blank" />;
  }

  return <AnchorMdx {...props} />;
}
