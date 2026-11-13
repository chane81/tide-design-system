import {
  fontFamily,
  fontSize,
  fontWeight,
  textStyle,
  type FontFamilyName,
  type TextStyleName,
} from "@tide-design/foundation";
// 내부 서브패스(앱 개발자용 아님). 스택을 CSS 값 그대로 보여 주려고 쓴다.
import { fontFamilyCss } from "@tide-design/foundation/internal";
import type { ReactElement } from "react";

// 타이포그래피 Token 블록: 텍스트 스타일, 굵기, font-family를 Token 원본에서 그린다(spec 「문서 앱」 Token 블록).
// 미리보기는 class 이름을 조합하지 않고 공개 계약 변수(--tide-*)를 inline style로 쓴다.
// Tailwind는 소스에 그대로 적힌 class만 만들기 때문이다.

const textStyleNames = Object.keys(textStyle) as TextStyleName[];
const fontFamilyNames = Object.keys(fontFamily) as FontFamilyName[];

/** rem 문자열을 px 숫자로 바꾼다(루트 16px 기준). */
const px = (rem: string): number => Number.parseFloat(rem) * 16;

const sample = "다람쥐 헌 쳇바퀴에 타고파 Tide 0123";

/** 텍스트 스타일 14개 표 */
export function TextStyles(): ReactElement {
  return (
    <div className="bg-canvas p-4 text-default">
      <table className="w-full border-collapse text-left">
        <caption className="mb-2 text-left">텍스트 스타일 {textStyleNames.length}개</caption>
        <thead>
          <tr className="border-b border-strong">
            <th scope="col" className="py-1 pr-4">
              class
            </th>
            <th scope="col" className="py-1 pr-4">
              크기/행간
            </th>
            <th scope="col" className="py-1 pr-4">
              굵기
            </th>
            <th scope="col" className="py-1">
              미리보기
            </th>
          </tr>
        </thead>
        <tbody>
          {textStyleNames.map((name) => {
            const style = textStyle[name];
            const size = fontSize[style.fontSize];
            return (
              <tr key={name} className="border-b border-default align-top">
                <td className="py-2 pr-4 font-mono whitespace-nowrap">text-{name}</td>
                <td className="py-2 pr-4 font-mono whitespace-nowrap">
                  {style.fontSize}/{px(style.lineHeight)}px
                  <br />
                  <span className="text-muted">
                    {size}/{style.lineHeight}
                  </span>
                </td>
                <td className="py-2 pr-4 font-mono whitespace-nowrap">
                  {fontWeight[style.fontWeight]} {style.fontWeight}
                </td>
                <td className="py-2">
                  <span
                    className="block"
                    style={{
                      fontSize: `var(--tide-text-${name})`,
                      lineHeight: `var(--tide-text-${name}--line-height)`,
                      fontWeight: `var(--tide-text-${name}--font-weight)`,
                    }}
                  >
                    {sample}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** 굵기 5개 */
export function FontWeights(): ReactElement {
  return (
    <div className="bg-canvas p-4 text-default">
      <ul className="flex flex-col gap-2">
        {Object.entries(fontWeight).map(([name, value]) => (
          <li key={name} className="flex items-baseline gap-4">
            <span className="w-40 shrink-0 font-mono">
              font-{name} {value}
            </span>
            <span style={{ fontSize: "var(--tide-font-size-20)", fontWeight: value }}>
              {sample}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** font-family 2개와 스택 */
export function FontFamilies(): ReactElement {
  return (
    <div className="bg-canvas p-4 text-default">
      <ul className="flex flex-col gap-4">
        {fontFamilyNames.map((name) => (
          <li key={name} className="flex flex-col gap-1">
            <span style={{ fontFamily: `var(--tide-font-${name})`, fontSize: "1.25rem" }}>
              font-{name}: {sample}
            </span>
            <code className="font-mono text-muted">{fontFamilyCss(name)}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
