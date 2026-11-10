import type { ThemeName } from "@tide-tds/foundation";
// 내부 서브패스(앱 개발자용 아님). 문서 블록이 Tide 색 이름 목록과 원본 hex로 대비비를 계산하려고 쓴다.
import {
  checkColorContrast,
  colorSlotHex,
  isRole,
  tideColorNames,
} from "@tide-tds/foundation/internal";
import type { ReactElement } from "react";

// 색 Token 블록: 색 이름(Color)마다 data-color로 accent 슬롯을 꽂아 그린다(tide-v0-impl 티켓 40).
// 미리보기는 실제 CSS(data-color + accent Utility class)로 칠하므로 현재 Theme을 따른다.

/** 색 이름 미리보기. 행마다 data-color 하나와 accent class 네 가지 */
export function ColorNames(): ReactElement {
  return (
    <div className="bg-canvas p-4 text-default">
      <table className="w-full border-collapse text-left">
        <caption className="mb-2 text-left">
          색 이름 {tideColorNames.length}개. 행마다 <code className="font-mono">data-color</code>를
          주고 accent class로 칠했습니다.
        </caption>
        <thead>
          <tr className="border-b border-strong">
            <th scope="col" className="py-1 pr-4">
              <code className="font-mono">data-color</code>
            </th>
            <th scope="col" className="py-1 pr-4">
              solid
            </th>
            <th scope="col" className="py-1 pr-4">
              subtle
            </th>
            <th scope="col" className="py-1">
              글자·테두리
            </th>
          </tr>
        </thead>
        <tbody>
          {tideColorNames.map((name) => (
            <tr key={name} data-color={name} className="border-b border-default">
              <th scope="row" className="py-2 pr-4 text-left font-mono font-normal">
                {name} <span className="text-muted">{isRole(name) ? "Role" : "계열"}</span>
              </th>
              <td className="py-2 pr-4">
                <span className="inline-block rounded-md bg-accent-solid px-2 py-1 text-accent-on-solid">
                  가나 Aa
                </span>
              </td>
              <td className="py-2 pr-4">
                <span className="inline-block rounded-md bg-accent-subtle px-2 py-1 text-accent">
                  가나 Aa
                </span>
              </td>
              <td className="py-2">
                <span className="inline-block rounded-md border-2 border-accent px-2 py-1 text-accent">
                  가나 Aa
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const groups = [
  { label: "글자", foreground: "text" },
  { label: "solid 위 글자", foreground: "on-solid" },
  { label: "UI 경계", foreground: "border" },
] as const;

/** 색 이름마다 대비 쌍 규칙의 최저 대비비. Theme 하나를 그린다. */
export function ColorNameContrast({ theme }: { theme: ThemeName }): ReactElement {
  return (
    <div className="bg-canvas p-4 text-default">
      <table className="w-full border-collapse text-left">
        <caption className="mb-2 text-left">{theme} Theme 색 이름별 최저 대비비</caption>
        <thead>
          <tr className="border-b border-strong">
            <th scope="col" className="py-1 pr-4">
              색 이름
            </th>
            {groups.map((group) => (
              <th key={group.foreground} scope="col" className="py-1 pr-4">
                {group.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tideColorNames.map((name) => {
            const results = checkColorContrast({
              light: colorSlotHex(name, "light"),
              dark: colorSlotHex(name, "dark"),
            }).filter((result) => result.theme === theme);
            return (
              <tr key={name} className="border-b border-default">
                <th scope="row" className="py-1 pr-4 text-left font-mono font-normal">
                  {name}
                </th>
                {groups.map((group) => {
                  const inGroup = results.filter(
                    (result) => result.foreground === group.foreground,
                  );
                  const lowest = Math.min(...inGroup.map((result) => result.ratio));
                  return (
                    <td key={group.foreground} className="py-1 pr-4 font-mono">
                      {lowest.toFixed(2)}:1{" "}
                      <span className="text-muted">≥ {inGroup[0]!.minRatio}</span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
