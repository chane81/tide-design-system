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

// 서버 컴포넌트에서 쓰도록 "use client"를 두지 않는다. `onClose`는 만들지 않고 IconButton(client)에 그대로 넘긴다.

export interface AlertProps extends Omit<
  ComponentProps<"div">,
  "color" | "title" | "role" | "onClose"
> {
  /**
   * Role(Tide Role + 앱 Role). 기본값 `info`. 색 계열 이름은 받지 않는다.
   * `info`·`success`·`warning`·`danger`는 상태마다 다른 아이콘, 나머지는 `info` 아이콘이다.
   */
  color?: Role;
  /** 제목. 본문 위 굵은 글자다. HTML `title` 속성(툴팁)이 아니다. */
  title?: ReactNode;
  /** 본문. 문장, 목록, 같은 Role의 `Link`를 넣는다. */
  children?: ReactNode;
  /**
   * live region 역할. 기본값은 없음(정적 표시). 새로 나타나 바로 알려야 할 때만 준다.
   * `"alert"`는 읽던 것을 끊고, `"status"`는 끊지 않고 알린다.
   */
  role?: "alert" | "status";
  /** 주면 닫기 버튼이 생기고 누를 때 부른다. Alert를 빼는 일은 앱이 한다. */
  onClose?: () => void;
  /** 닫기 버튼 이름. 기본값 `"닫기"`. Alert가 여럿이면 `"결제 알림 닫기"`처럼 구분한다. */
  closeLabel?: string;
}

/** 화면 안에서 상태나 알릴 내용을 보여 주는 표면. 서버 컴포넌트로 쓸 수 있다. */
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
      // 바깥 data-color를 물려받지 않게 항상 붙인다(ADR 0011).
      data-color={color}
      className={cn(alertLayoutClass, alertSurfaceClass, className)}
    >
      {/* 아이콘은 장식용이다. 상태의 뜻은 제목·본문 텍스트가 전한다. */}
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
