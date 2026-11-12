// Alert와 Toast(티켓 34)가 함께 쓰는 내부 모듈(tide-v0-impl 티켓 20). 루트에서 export하지 않는다.
// 배치(아이콘·내용·닫기 버튼), 글자, subtle 표면, 상태 아이콘 고르기를 한 곳에 둔다.
// 두 Component의 모양이 어긋나지 않게 하려는 것이다. Toast는 표면만 raised(shadow-md)로 바꾸고 나머지를 그대로 쓴다.
// 이 파일은 JSX를 렌더하지 않고 hook·이벤트도 없다. 서버 컴포넌트에서 import해도 된다.

import type { TideRole } from "@tide-tds/foundation";
import {
  CircleCheckIcon,
  InfoIcon,
  OctagonExclamationPointIcon,
  TriangleExclamationPointIcon,
  type IconProps,
} from "@tide-tds/icons";
import type { ReactElement } from "react";

import type { Role } from "./types.ts";

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// 색은 accent 슬롯이다(ADR 0011). 루트의 data-color가 Role을 고른다.

/**
 * 배치. 아이콘·내용·닫기 버튼을 한 줄로 놓고 위에 맞춘다. 여백은 16px, radius는 담는 요소의 lg다(spec radius 「쓰는 곳」).
 * border 1px는 항상 둔다. forced-colors에서 브라우저가 경계를 CanvasText로 덮어 배경 없이도 영역이 남는다.
 */
export const alertLayoutClass = "flex items-start gap-3 rounded-lg border p-4";

/**
 * Alert의 subtle 표면(ADR 0022 §1).
 * - 글자·아이콘: text-accent-on-subtle × bg-accent-subtle 4.5:1(Role `text-<role>-on-subtle` × `bg-<role>-subtle`, neutral은
 *   text-default × bg-neutral-subtle, 앱 Role은 색 이름 규칙 on-subtle × subtle)
 * - 경계: 파스텔 테두리 border-accent-subtle. 바탕과 글자만으로 알아볼 수 있어 꾸밈이고 대비 검사에서 뺐다.
 */
export const alertSurfaceClass = "border-accent-subtle bg-accent-subtle text-accent-on-subtle";

/** 상태 아이콘 자리. 글자 첫 줄 높이(body-sm 20px)와 같은 20px라 첫 줄 가운데에 맞는다. */
export const alertIconClass = "size-5 shrink-0";

/** 제목과 본문을 세로로 쌓는다. 긴 단어가 닫기 버튼을 밀어내지 않게 min-w-0을 둔다. */
export const alertContentClass = "flex min-w-0 flex-1 flex-col gap-1";

/** 제목. 본문과 같은 크기에 굵기만 올린다. 제목 수준(h1~h6)은 화면마다 다르므로 heading 요소를 쓰지 않는다. */
export const alertTitleClass = "text-body-sm font-semibold";

/** 본문 */
export const alertDescriptionClass = "text-body-sm";

/** 닫기 버튼(IconButton xs, 24px). 위아래 2px를 겹쳐 첫 줄 높이(20px)를 늘리지 않고, 끝쪽 4px를 여백에 겹친다. */
export const alertCloseClass = "-my-0.5 -me-1";

/**
 * Alert(subtle 표면) 안 닫기 버튼의 색. ghost의 기본(text-accent, bg-hover·bg-active)을 덮어쓴다.
 * subtle 바탕 위라 글자는 on-subtle이고, hover·누름은 같은 색의 subtle-hover·subtle-active다
 * (on-subtle × subtle 3단계 4.5:1 등록. text × subtle-active는 일부 색에서 4.5:1에 못 미친다, ADR 0022).
 */
export const alertSubtleCloseClass =
  "text-accent-on-subtle hover:bg-accent-subtle-hover active:bg-accent-subtle-active";

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
