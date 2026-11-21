"use client";
import { useLayoutEffect, type ComponentProps, type ReactElement } from "react";

import { cn } from "../../_internal/libs/cn";
import { useDialogPartsContext } from "../hooks/useDialogPartsContext";
import { DialogCloseButton } from "./DialogCloseButton";

export type DialogHeaderAlign = "start" | "center";

export interface DialogHeaderOwnProps {
  /** 닫기 버튼의 세로 정렬. `start`(기본값)는 제목 첫 줄, `center`는 한 줄 내용(입력 등)의 가운데다. */
  align?: DialogHeaderAlign;
}

export interface DialogHeaderProps
  extends DialogHeaderOwnProps, Omit<ComponentProps<"div">, keyof DialogHeaderOwnProps> {}

/**
 * 제목이나 입력과 닫기 버튼을 한 줄에 놓는 머리. 있으면 `DialogContent`의 기본 닫기 버튼을 대신한다.
 * AlertDialog에서는 닫기 버튼이 없다.
 * Tide props: `align` ({@link DialogHeaderOwnProps}). 나머지는 `<div>` 속성.
 */
export function DialogHeader({
  align = "start",
  className,
  children,
  ...props
}: DialogHeaderProps): ReactElement {
  const { alert, closeLabel, setHasHeader } = useDialogPartsContext("DialogHeader");
  useLayoutEffect(() => {
    setHasHeader(true);

    return () => setHasHeader(false);
  }, [setHasHeader]);

  return (
    <div
      {...props}
      className={cn("flex gap-3", align === "center" ? "items-center" : "items-start", className)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">{children}</div>
      {!alert && (
        // 32px 버튼을 제목 첫 줄(28px) 가운데에 맞춘다.
        <DialogCloseButton
          label={closeLabel}
          className={align === "start" ? "-my-0.5" : "shrink-0"}
        />
      )}
    </div>
  );
}
