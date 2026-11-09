// 서버 컴포넌트에서 래퍼 없이 바로 import한다.
// 이 파일에는 Component 내부 class(예: VisuallyHidden의 class)를 직접 쓰지 않는다.
// 그래야 출력 CSS에 그 class가 있을 때 패키지 CSS의 @source가 동작했다고 볼 수 있다.
import { cn, VisuallyHidden } from "@tide-tds/desktop";
import { PlusIcon } from "@tide-tds/icons";

export default function Page() {
  return (
    <main>
      <h1 className={cn("p-4", "bg-primary-solid")}>Tide smoke</h1>
      <VisuallyHidden>스크린리더 전용 텍스트</VisuallyHidden>
      {/* 아이콘은 PlusIcon 하나만 쓴다. 다른 아이콘이 빌드 결과에 없는지 smoke가 확인한다. */}
      <PlusIcon aria-label="추가" />
    </main>
  );
}
