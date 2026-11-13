import { zIndex, type ZIndexName } from "@tide-design/foundation";
import type { ReactElement } from "react";

// 쌓임 단계 Token 블록: Token 원본에서 단계 목록과 값을 그린다(spec 「문서 앱」).
// 미리보기는 class 이름을 조합하지 않고 공개 계약 변수(--tide-z-*)를 inline style로 쓴다.

const names = Object.keys(zIndex) as ZIndexName[];

/** 단계별 쓰는 곳(tide-v0 티켓 22 「쌓임 단계」) */
const usage: Record<ZIndexName, string> = {
  sticky: "앱의 sticky 헤더·사이드바(v0 Tide Component는 쓰지 않음)",
  modal: "Dialog·AlertDialog와 그 backdrop",
  popover: "Popover, Menu, Select·Combobox 목록",
  toast: "Toast 영역",
  tooltip: "Tooltip",
};

/** 쌓임 단계 5개를 겹쳐 그리고 값과 쓰는 곳을 적는다 */
export function StackingTiers(): ReactElement {
  return (
    <div className="flex flex-wrap gap-8 bg-canvas p-6 text-default">
      {/* 겹친 카드: DOM 순서를 거꾸로 둬도 z-index가 앞뒤를 정한다. isolate로 이 블록 밖과 섞이지 않게 한다. */}
      <div aria-hidden="true" className="relative isolate h-56 w-72 shrink-0">
        {[...names].reverse().map((name, index) => {
          const step = names.length - 1 - index;

          return (
            <div
              key={name}
              className="absolute flex h-20 w-40 items-start rounded-lg border border-raised bg-raised p-2 font-mono shadow-md"
              style={{
                zIndex: `var(--tide-z-${name})`,
                top: `${step * 2.25}rem`,
                left: `${step * 1.75}rem`,
              }}
            >
              z-{name}
            </div>
          );
        })}
      </div>
      <table className="self-start text-left">
        <thead>
          <tr>
            <th className="pr-4 pb-2">class</th>
            <th className="pr-4 pb-2">값</th>
            <th className="pb-2">쓰는 곳</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => (
            <tr key={name}>
              <td className="pr-4 font-mono">z-{name}</td>
              <td className="pr-4 font-mono text-muted">{zIndex[name]}</td>
              <td className="text-muted">{usage[name]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * sticky 헤더 아래로 포커스가 숨지 않게 하는 예시. 스크롤 영역에 헤더 높이만큼 scroll-padding-top을 준다.
 * Tab으로 아래 버튼을 옮겨 다니면 포커스된 버튼이 헤더 아래로 들어가지 않는다.
 */
export function StickyHeaderScrollPadding(): ReactElement {
  return (
    <div className="bg-canvas p-6 text-default">
      <div className="h-56 overflow-y-auto rounded-lg border border-default scroll-pt-14">
        <div className="sticky top-0 z-sticky flex h-12 items-center border-b border-default bg-surface px-4 text-label-md">
          sticky 헤더(h-12, z-sticky)
        </div>
        <ul className="flex flex-col gap-2 p-4">
          {Array.from({ length: 12 }, (_, index) => (
            <li key={index}>
              <button type="button" className="rounded-sm focus-visible:focus-ring">
                항목 {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
