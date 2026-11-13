import { duration, easing, type DurationName } from "@tide-design/foundation";
import { useEffect, useState, type ReactElement } from "react";

// motion Token 블록: Token 원본에서 단계 목록과 값을 그리고, 버튼으로 실제 duration·easing을 재생한다
// (spec 「문서 앱」 Token 블록). 미리보기는 class 이름을 조합하지 않고 공개 계약 변수(--tide-*)를 inline style로 쓴다.
// 움직임 줄이기를 켠 사용자에게는 이동 대신 opacity 전환으로 보여 준다(tide-v0 티켓 21 「prefers-reduced-motion」).

const durationNames = Object.keys(duration) as DurationName[];

/** 단계별 쓰는 곳(tide-v0 티켓 21 「Token」) */
const durationUsage: Record<DurationName, string> = {
  fast: "hover·press, 색 전환, Switch thumb, 오버레이가 사라질 때. 시간을 적지 않은 transition의 기본값",
  normal: "가끔 쓰는 오버레이(Popover, Toast, Dialog류)가 나타날 때",
};

/** OS의 움직임 줄이기 설정을 따른다 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (): void => setReduced(query.matches);
    query.addEventListener("change", onChange);

    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** `cubic-bezier(x1, y1, x2, y2)`에서 조절점 네 값을 꺼낸다 */
function bezierPoints(value: string): [number, number, number, number] {
  const numbers = /cubic-bezier\(([^)]+)\)/.exec(value)?.[1]?.split(",").map(Number) ?? [];
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = numbers;

  return [x1, y1, x2, y2];
}

/** easing 곡선. x축은 시간, y축은 진행도다. */
function EasingCurve({ value }: { value: string }): ReactElement {
  const size = 80;
  const [x1, y1, x2, y2] = bezierPoints(value);
  // SVG는 y가 아래로 커지므로 뒤집는다.
  const point = (x: number, y: number): string => `${x * size} ${size - y * size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-2 -2 ${size + 4} ${size + 4}`}
      aria-hidden="true"
      className="shrink-0 overflow-visible"
    >
      <rect
        x={0}
        y={0}
        width={size}
        height={size}
        fill="none"
        className="stroke-current opacity-20"
      />
      <path
        d={`M ${point(0, 0)} C ${point(x1, y1)}, ${point(x2, y2)}, ${point(1, 1)}`}
        fill="none"
        strokeWidth={2}
        className="stroke-current"
      />
    </svg>
  );
}

/** duration 2단계와 easing을 재생한다 */
export function Motion(): ReactElement {
  const [played, setPlayed] = useState(false);
  const reduced = usePrefersReducedMotion();

  return (
    <div className="flex flex-col gap-6 bg-canvas p-6 text-default">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setPlayed((value) => !value)}
          className="rounded-md bg-primary-solid px-4 py-2 text-label-md text-on-solid transition-colors hover:bg-primary-solid-hover focus-visible:focus-ring active:bg-primary-solid-active"
        >
          {played ? "되돌리기" : "재생"}
        </button>
        {reduced ? (
          <span className="text-muted">
            움직임 줄이기 설정이 켜져 있어 이동 대신 opacity 전환으로 보여 줍니다.
          </span>
        ) : null}
      </div>
      <ul className="flex flex-col gap-4">
        {durationNames.map((name) => (
          <li key={name} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-mono">duration-{name}</span>
              <span className="font-mono text-muted">{duration[name]}</span>
              <span className="text-muted">{durationUsage[name]}</span>
            </div>
            {/* 트랙을 inline-size container로 두어 이동 거리를 트랙 폭(100cqw)에서 잰다. */}
            <div
              className="relative h-8 rounded-md bg-surface"
              style={{ containerType: "inline-size" }}
            >
              <div
                aria-hidden="true"
                className="absolute top-1 left-1 h-6 w-6 rounded-sm bg-primary-solid"
                style={{
                  transitionProperty: reduced ? "opacity" : "translate",
                  transitionDuration: `var(--tide-duration-${name})`,
                  transitionTimingFunction: "var(--tide-ease-out)",
                  ...(reduced
                    ? { opacity: played ? 1 : 0.3 }
                    : // 점 폭 1.5rem과 좌우 여백 0.25rem씩을 뺀 거리
                      { translate: played ? "calc(100cqw - 2rem) 0" : "0 0" }),
                }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-4">
        <EasingCurve value={easing.out} />
        <div className="flex flex-col gap-1">
          <span className="font-mono">ease-out</span>
          <span className="font-mono text-muted">{easing.out}</span>
          <span className="text-muted">
            Tide Component 전부. 나타날 때와 사라질 때 모두 씁니다. 시간을 적지 않은 transition의
            기본값입니다.
          </span>
        </div>
      </div>
    </div>
  );
}
