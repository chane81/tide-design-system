import type { TideRole } from "@tide-design/foundation";
import {
  CircleCheckIcon,
  InfoIcon,
  OctagonExclamationPointIcon,
  TriangleExclamationPointIcon,
  type IconProps,
} from "@tide-design/icons";
import type { ReactElement } from "react";

import type { Role } from "../../types";

type IconComponent = (props: IconProps) => ReactElement;

// 아이콘 모양으로도 상태를 구분한다(WCAG 1.4.1). neutral·primary는 일반 알림이라 info와 같은 아이콘이다.
const statusIcons: Record<TideRole, IconComponent> = {
  neutral: InfoIcon,
  primary: InfoIcon,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleExclamationPointIcon,
  danger: OctagonExclamationPointIcon,
};

/** Role의 상태 아이콘. 앱이 더한 Role(예: `brand`)은 일반 알림으로 보고 i 아이콘을 쓴다. */
export function alertStatusIcon(color: Role): IconComponent {
  return Object.hasOwn(statusIcons, color) ? statusIcons[color as TideRole] : InfoIcon;
}
