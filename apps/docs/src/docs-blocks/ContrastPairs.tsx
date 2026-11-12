import {
  contrastPairs,
  type ContrastMinRatio,
  type ContrastPair,
  type ThemeName,
} from "@tide-tds/foundation";
// 내부 서브패스(앱 개발자용 아님). 문서 블록이 원본 hex로 대비비를 계산하려고 쓴다.
import {
  contrastExclusions,
  contrastPairRatio,
  opaqueSemanticHex,
} from "@tide-tds/foundation/internal";
import type { ReactElement } from "react";

// 색 Token 블록: 대비 쌍 목록과 Theme별 대비비를 Token 원본에서 그린다.
// CI(foundation unit)가 같은 목록을 검사하므로, 여기 나오는 쌍은 모두 기준을 넘는다.
// 기준은 세 등급이다(ADR 0023): 정지 상태 글자 4.5, 일시 상태 글자와 solid 위 글자 4, UI 요소 3.
// 미리보기는 현재 Theme과 무관하게 원본 hex로 칠한다. 그래서 light와 dark 표를 한 화면에서 볼 수 있다.

/** 하한 등급의 이름(ADR 0023) */
const tierLabel: Record<ContrastMinRatio, string> = {
  4.5: "글자",
  4: "일시 상태·solid 위 글자",
  3: "UI 요소",
};

function Preview({ pair, theme }: { pair: ContrastPair; theme: ThemeName }): ReactElement {
  const foreground = opaqueSemanticHex(pair.foreground, theme);
  // 반투명 배경(bg-hover·bg-active)은 쌍의 표면 위에 합성한 색으로 칠한다(대비 검사와 같은 값).
  const background = opaqueSemanticHex(pair.background, theme, pair.surface);
  if (pair.minRatio !== 3) {
    return (
      <span
        // Storybook a11y 검사가 4:1 등급 견본을 4:1로 검사하도록 등급을 적는다(.storybook/preview.tsx).
        data-contrast-tier={pair.minRatio}
        className="inline-block rounded-md px-2 py-1"
        style={{ color: foreground, backgroundColor: background }}
      >
        가나 Aa
      </span>
    );
  }
  // UI 요소(경계·포커스·thumb)는 글자가 아니라 선으로 보여 준다.
  return (
    <span
      aria-hidden="true"
      className="inline-block rounded-md p-1"
      style={{ backgroundColor: background }}
    >
      <span className="block h-5 w-12 rounded-md border-2" style={{ borderColor: foreground }} />
    </span>
  );
}

/** 대비 쌍 표. Theme 하나를 그린다. */
export function ContrastPairs({ theme }: { theme: ThemeName }): ReactElement {
  return (
    <div className="bg-canvas p-4 text-default">
      <table className="w-full border-collapse text-left">
        <caption className="mb-2 text-left">
          {theme} Theme 대비 쌍 {contrastPairs.length}개
        </caption>
        <thead>
          <tr className="border-b border-strong">
            <th scope="col" className="py-1 pr-4">
              전경
            </th>
            <th scope="col" className="py-1 pr-4">
              배경
            </th>
            <th scope="col" className="py-1 pr-4">
              미리보기
            </th>
            <th scope="col" className="py-1 pr-4">
              대비비
            </th>
            <th scope="col" className="py-1">
              기준
            </th>
          </tr>
        </thead>
        <tbody>
          {contrastPairs.map((pair) => {
            const ratio = contrastPairRatio(pair, theme);
            return (
              <tr
                key={`${pair.foreground}/${pair.background}/${pair.surface ?? ""}`}
                className="border-b border-default"
              >
                <td className="py-1 pr-4 font-mono">{pair.foreground}</td>
                <td className="py-1 pr-4 font-mono">
                  {pair.background}
                  {pair.surface ? ` (${pair.surface} 위)` : ""}
                </td>
                <td className="py-1 pr-4">
                  <Preview pair={pair} theme={theme} />
                </td>
                <td className="py-1 pr-4 font-mono">{ratio.toFixed(2)}:1</td>
                <td className="py-1 font-mono">
                  {pair.minRatio}:1 {tierLabel[pair.minRatio]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** 대비 검사에서 뺀 Token과 이유 */
export function ContrastExclusions(): ReactElement {
  return (
    <div className="bg-canvas p-4 text-default">
      <ul className="flex flex-col gap-1">
        {contrastExclusions.map((exclusion) => (
          <li key={exclusion.token}>
            <code className="font-mono">{exclusion.token}</code>: {exclusion.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}
