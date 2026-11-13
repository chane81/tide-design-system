import { semanticPrefix, type ColorSlot, type ThemeName } from "@tide-design/foundation";
// 내부 서브패스(앱 개발자용 아님).
import {
  accentUtilities,
  checkColorContrast,
  colorSlotHex,
  colorSlots,
  isRole,
  slotRule,
  tideColorNames,
  type SlotValue,
} from "@tide-design/foundation/internal";
import type { ReactElement } from "react";

// 미리보기는 실제 CSS(data-color + accent class)로 칠하므로 현재 Theme을 따른다(ADR 0022 §1).

/** 색 이름 미리보기. 행마다 data-color 하나와 강도 세 가지, 바탕 없는 글자·테두리 */
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
            <th scope="col" className="py-1 pr-4">
              faint
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
                <span className="inline-block rounded-md border border-accent-subtle bg-accent-subtle px-2 py-1 text-accent-on-subtle">
                  가나 Aa
                </span>
              </td>
              <td className="py-2 pr-4">
                <span className="inline-block rounded-md bg-accent-faint px-2 py-1 text-accent-on-subtle">
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

// 같은 슬롯이라도 하한 등급(ADR 0023)이 다르면 최저값을 따로 보여 준다.
const groups = [
  { key: "text-rest", label: "글자", match: { foreground: "text", minRatio: 4.5 } },
  { key: "text-transient", label: "글자 호버·누름", match: { foreground: "text", minRatio: 4 } },
  {
    key: "on-subtle-rest",
    label: "파스텔 글자",
    match: { foreground: "on-subtle", minRatio: 4.5 },
  },
  {
    key: "on-subtle-transient",
    label: "파스텔 글자 호버·누름",
    match: { foreground: "on-subtle", minRatio: 4 },
  },
  { key: "on-solid", label: "solid 위 글자", match: { foreground: "on-solid", minRatio: 4 } },
  { key: "ui", label: "UI 요소", match: { minRatio: 3 } },
] as const;

function inGroup(
  result: { readonly foreground: string; readonly minRatio: number },
  match: { readonly foreground?: string; readonly minRatio: number },
): boolean {
  return (
    result.minRatio === match.minRatio &&
    (match.foreground === undefined || result.foreground === match.foreground)
  );
}

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
              <th key={group.key} scope="col" className="py-1 pr-4">
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
                  const matched = results.filter((result) => inGroup(result, group.match));
                  const lowest = Math.min(...matched.map((result) => result.ratio));

                  return (
                    <td key={group.key} className="py-1 pr-4 font-mono">
                      {lowest.toFixed(2)}:1{" "}
                      <span className="text-muted">≥ {group.match.minRatio}</span>
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

// Record라 슬롯이 늘면 여기를 채우지 않은 채로는 타입 검사가 실패한다.
const slotRole: Record<ColorSlot, string> = {
  solid: "진한 바탕",
  "solid-hover": "진한 바탕 호버",
  "solid-active": "진한 바탕 누름",
  subtle: "파스텔 바탕",
  "subtle-hover": "파스텔 바탕 호버",
  "subtle-active": "파스텔 바탕 누름",
  faint: "가장 옅은 바탕",
  text: "바탕 없이 쓰는 색 글자",
  border: "UI 경계, 선택 표시",
  "subtle-border": "파스텔 테두리(꾸밈)",
  "on-solid": "solid 위 글자",
  "on-subtle": "subtle·faint 위 글자",
};

function percent(amount: number): string {
  return `${Math.round(amount * 100)}%`;
}

/** 슬롯 값을 읽는 글로 바꾼다. 예: 600, 100 + gray-950 4%, gray-950·950 반씩 */
function slotValueLabel(value: SlotValue): string {
  if (typeof value !== "object") return String(value);
  if ("mix" in value) return `${value.mix[0]}·${value.mix[1]} 반씩`;

  return `${value.step} + ${value.overlay} ${percent(value.amount)}`;
}

/** 슬롯 규칙 표. 슬롯 목록, accent class, 단계는 foundation 원본(colorSlots, accentUtilities, slotRule)에서 읽는다. */
export function ColorSlotRules(): ReactElement {
  return (
    <div className="bg-canvas p-4 text-default">
      <table className="w-full border-collapse text-left">
        <caption className="mb-2 text-left">
          슬롯 {colorSlots.length}개. 숫자는 그 색 이름의 스케일 단계이고,{" "}
          <code className="font-mono">+</code>는 덮기입니다.
        </caption>
        <thead>
          <tr className="border-b border-strong">
            <th scope="col" className="py-1 pr-4">
              슬롯
            </th>
            <th scope="col" className="py-1 pr-4">
              accent class
            </th>
            <th scope="col" className="py-1 pr-4">
              쓰는 곳
            </th>
            <th scope="col" className="py-1 pr-4">
              light
            </th>
            <th scope="col" className="py-1">
              dark
            </th>
          </tr>
        </thead>
        <tbody>
          {colorSlots.map((slot) => {
            const utility = accentUtilities.find((item) => item.slot === slot);

            return (
              <tr key={slot} className="border-b border-default">
                <th scope="row" className="py-1 pr-4 text-left font-mono font-normal">
                  {slot}
                </th>
                <td className="py-1 pr-4 font-mono">
                  {utility ? `${semanticPrefix[utility.namespace]}-${utility.key}` : "없음"}
                </td>
                <td className="py-1 pr-4">{slotRole[slot]}</td>
                <td className="py-1 pr-4 font-mono">{slotValueLabel(slotRule[slot].light)}</td>
                <td className="py-1 font-mono">{slotValueLabel(slotRule[slot].dark)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
