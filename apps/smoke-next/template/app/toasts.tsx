"use client";
// Toast는 client 전용이라 큐를 client 모듈에 두고, 서버 컴포넌트 page는 이 파일의 Component만 그린다.
// Component 내부 class는 이 파일에 쓰지 않는다(page.tsx와 같다).
import { Button, ToastQueue, ToastRegion } from "@tide-design/components";

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
