// 서버 컴포넌트에서 래퍼 없이 바로 import한다.
// 이 파일에는 Component 내부 class(예: VisuallyHidden의 class)를 직접 쓰지 않는다.
// 그래야 출력 CSS에 그 class가 있을 때 패키지 CSS의 @source가 동작했다고 볼 수 있다.
import { cn, Spinner, Typography, VisuallyHidden } from "@tide-tds/components";
import { PlusIcon } from "@tide-tds/icons";

import { brandColor } from "./colors";

export default function Page() {
  return (
    <main>
      <h1 className={cn("p-4", "bg-primary-solid")}>Tide smoke</h1>
      <VisuallyHidden>스크린리더 전용 텍스트</VisuallyHidden>
      {/* 서버 컴포넌트에서 render 병합까지 쓴다. 텍스트 스타일 class는 이 파일에 쓰지 않는다. */}
      <Typography variant="heading-lg">제목</Typography>
      <Typography variant="caption" render={<small />}>
        보조 설명
      </Typography>
      {/* radius·Elevation·포커스 표시 Utility class를 앱 코드에서 직접 쓴다. */}
      <section className="rounded-lg border border-raised bg-raised shadow-md">
        <button type="button" className="rounded-md focus-visible:focus-ring">
          저장
        </button>
        <input aria-label="이름" className="border border-default focus:focus-field" />
      </section>
      {/* motion·쌓임 단계 Utility class를 앱 코드에서 직접 쓴다. */}
      <header className="sticky top-0 z-sticky transition-colors">
        <p className="transition-opacity duration-normal ease-out">헤더</p>
      </header>
      {/* Spinner는 서버 컴포넌트다. 회전 class(animate-spin)는 이 파일에 쓰지 않는다. */}
      <Spinner size="sm" aria-label="불러오는 중" />
      {/* 앱 브랜드 계열을 data-color로 고르고 accent Utility class로 칠한다. */}
      <p data-color={brandColor} className="bg-accent-solid text-accent-on-solid">
        브랜드
      </p>
      {/* 아이콘은 PlusIcon 하나만 쓴다. 다른 아이콘이 빌드 결과에 없는지 smoke가 확인한다. */}
      <PlusIcon aria-label="추가" />
    </main>
  );
}
