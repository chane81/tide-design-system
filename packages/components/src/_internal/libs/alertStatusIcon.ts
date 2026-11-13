// Alert와 Toast(티켓 34)가 함께 쓰는 상태 아이콘 고르기(tide-v0-impl 티켓 20). 루트에서 export하지 않는다.
// class 문자열은 constants/alertClass.ts에 있다.
// 이 파일은 JSX를 렌더하지 않고 hook·이벤트도 없다. 서버 컴포넌트에서 import해도 된다.

import type { TideRole } from "@tide-design/foundation";
import {
  CircleCheckIcon,
  InfoIcon,
  OctagonExclamationPointIcon,
  TriangleExclamationPointIcon,
  type IconProps,
} from "@tide-design/icons";
import type { ReactElement } from "react";

import type { Role } from "../../types.ts";

type IconComponent = (props: IconProps) => ReactElement;

// 상태 아이콘은 모양으로도 서로 구분된다(WCAG 1.4.1): 원 안 i, 원 안 체크, 삼각형 안 느낌표, 팔각형 안 느낌표.
// neutral·primary는 「상태」가 아닌 일반 알림이라 info와 같은 i 아이콘이다.
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
