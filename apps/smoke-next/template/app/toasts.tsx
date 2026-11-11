"use client";
// Toast는 client 전용이다(티켓 34). 큐를 client 모듈에 두고, 서버 컴포넌트 page는 이 파일의 Component만 그린다.
// Toast가 없으면 영역을 그리지 않으므로 prerender HTML에는 영역이 없다. 내부 class는 이 파일에 쓰지 않는다.
import { Button, ToastQueue, ToastRegion } from "@tide-tds/components";

export const toasts = new ToastQueue({ maxVisible: 2 });

export function AppToasts() {
  return (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toasts.add({ title: "저장했습니다", color: "success", action: { label: "되돌리기" } })
        }
      >
        알림 띄우기
      </Button>
      <ToastRegion queue={toasts} aria-label="알림" />
    </>
  );
}
