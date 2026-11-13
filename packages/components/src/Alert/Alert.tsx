import { XIcon } from "@tide-design/icons";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import {
  alertCloseClass,
  alertSubtleCloseClass,
  alertContentClass,
  alertDescriptionClass,
  alertIconClass,
  alertLayoutClass,
  alertSurfaceClass,
  alertTitleClass,
} from "../_internal/constants/alertClass";
import { alertStatusIcon } from "../_internal/libs/alertStatusIcon";
import { cn } from "../_internal/libs/cn";
import { IconButton } from "../IconButton/IconButton";
import type { Role } from "../types";

// 이 파일은 hook·state를 쓰지 않고 이벤트 핸들러를 만들지도 않으므로 "use client"가 없다. 서버 컴포넌트에서 쓸 수 있다.
// 닫기는 제어형이다. 받은 `onClose`를 IconButton(client)에 그대로 넘기고, Alert를 화면에서 빼는 일은 앱이 한다.
// 서버 컴포넌트는 함수를 넘길 수 없으므로 `onClose`를 쓰는 곳은 앱의 client Component다.

export interface AlertProps extends Omit<
  ComponentProps<"div">,
  "color" | "title" | "role" | "onClose"
> {
  /**
   * Role. Tide Role 6개와 앱이 `RoleRegistry`에 더한 Role을 받는다. 기본값은 `info`다.
   * 상태 알림은 `info`·`success`·`warning`·`danger`를 쓰고, 상태마다 모양이 다른 아이콘이 붙는다.
   * `neutral`·`primary`·앱 Role은 일반 알림이라 `info`와 같은 아이콘이다.
   * 색 계열 이름(`blue` 등)은 받지 않는다. 알림의 뜻을 색으로 전하기 때문이다(ADR 0016).
   * 루트에 `data-color`로 붙고 바깥 요소의 색을 물려받지 않는다.
   */
  color?: Role;
  /** 제목. 굵은 글자로 본문 위에 놓인다. HTML `title` 속성(툴팁)은 받지 않는다. */
  title?: ReactNode;
  /** 본문. 문장, 목록, 같은 Role의 `Link`를 넣는다. */
  children?: ReactNode;
  /**
   * live region 역할. 기본값은 없음(정적 표시)이다.
   * 처음부터 화면에 있는 Alert는 스크린 리더가 알리지 않으므로 역할을 붙이지 않는다.
   * 사용자 동작 뒤에 새로 나타나 바로 알려야 하면 `"alert"`(급하고 중요함, 읽던 것을 끊음),
   * 끊지 않고 알리면 되면 `"status"`(정중하게 알림)를 준다.
   */
  role?: "alert" | "status";
  /** 닫기 버튼을 눌렀을 때 부른다. 주면 끝쪽에 닫기 버튼(IconButton)이 생긴다. Alert를 빼는 일은 앱이 한다. */
  onClose?: () => void;
  /** 닫기 버튼 이름. 기본값은 `"닫기"`다. 같은 화면에 Alert가 여럿이면 `"결제 알림 닫기"`처럼 구분한다. */
  closeLabel?: string;
}

/**
 * 화면 안에서 상태(info·success·warning·danger)나 알릴 내용을 보여 주는 표면.
 * 상태 아이콘(장식용), 제목, 본문, 닫기 버튼으로 이뤄진다. 서버 컴포넌트로 쓸 수 있다.
 */
export function Alert({
  color = "info",
  title,
  children,
  onClose,
  closeLabel = "닫기",
  className,
  ...props
}: AlertProps): ReactElement {
  const StatusIcon = alertStatusIcon(color);

  return (
    <div
      {...props}
      // 색은 항상 붙인다(기본 info). 바깥 data-color를 물려받지 않게 한다(ADR 0011).
      data-color={color}
      className={cn(alertLayoutClass, alertSurfaceClass, className)}
    >
      {/* 아이콘은 장식용이다. 상태의 뜻은 제목·본문 텍스트가 전한다. IconBase는 이름이 없으면 aria-hidden이다. */}
      <StatusIcon size={20} aria-hidden="true" className={alertIconClass} />
      <div className={alertContentClass}>
        {title !== undefined && <div className={alertTitleClass}>{title}</div>}
        {children !== undefined && <div className={alertDescriptionClass}>{children}</div>}
      </div>
      {onClose !== undefined && (
        <IconButton
          aria-label={closeLabel}
          variant="ghost"
          color={color}
          size="xs"
          onClick={onClose}
          className={`${alertCloseClass} ${alertSubtleCloseClass}`}
        >
          <XIcon />
        </IconButton>
      )}
    </div>
  );
}
