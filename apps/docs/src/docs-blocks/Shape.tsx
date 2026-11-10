import { radius, shadow, type RadiusName, type ShadowName } from "@tide-tds/foundation";
// 내부 서브패스(앱 개발자용 아님). 그림자 값을 CSS 그대로 보여 주려고 쓴다.
import { shadowCss } from "@tide-tds/foundation/internal";
import type { ReactElement } from "react";

// radius·Elevation Token 블록: Token 원본에서 단계 목록과 값을 그린다(spec 「문서 앱」 Token 블록).
// 미리보기는 class 이름을 조합하지 않고 공개 계약 변수(--tide-*)를 inline style로 쓴다.
// Tailwind는 소스에 그대로 적힌 class만 만들기 때문이다.

const radiusNames = Object.keys(radius) as RadiusName[];
const shadowNames = Object.keys(shadow) as ShadowName[];

/** 단계별 쓰는 곳(spec 「`@tide-tds/foundation`」 radius·Elevation) */
const radiusUsage: Record<RadiusName, string> = {
  sm: "작은 표시 요소, 목록 안 항목",
  md: "조작 요소(모든 size)",
  lg: "담는 요소(Card, Alert, Popover, 목록, Toast, Accordion)",
  xl: "Dialog류",
  full: "원·알약형",
};
const shadowUsage: Record<ShadowName, string> = {
  sm: "Switch thumb",
  md: "Popover, 목록, Tooltip, Toast",
  lg: "Dialog류",
};

/** rem 문자열을 px로 보여 준다(루트 16px 기준). full은 그대로 둔다. */
const px = (value: string): string =>
  value.endsWith("rem") ? `${Number.parseFloat(value) * 16}px` : value;

/** radius 5단계 */
export function Radii(): ReactElement {
  return (
    <div className="bg-canvas p-4 text-default">
      <ul className="grid grid-cols-5 gap-4">
        {radiusNames.map((name) => (
          <li key={name} className="flex flex-col gap-2">
            <div
              aria-hidden="true"
              className="h-16 w-16 border-2 border-strong bg-primary-subtle"
              style={{ borderRadius: `var(--tide-rounded-${name})` }}
            />
            <span className="font-mono">rounded-{name}</span>
            <span className="font-mono text-muted">
              {px(radius[name])}
              {radius[name].endsWith("rem") ? ` (${radius[name]})` : ""}
            </span>
            <span className="text-muted">{radiusUsage[name]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 한 Theme의 그림자 3단계. raised 표면(bg-raised + border-raised 1px) 위에 그린다. */
function ShadowPanel({ theme }: { theme: "light" | "dark" }): ReactElement {
  return (
    <section data-theme={theme} className="flex-1 bg-canvas p-6 text-default">
      <h3 className="mb-4 font-mono">{theme}</h3>
      <ul className="flex flex-col gap-6">
        {shadowNames.map((name) => (
          <li key={name}>
            <div
              className="rounded-lg border border-raised bg-raised p-4"
              style={{ boxShadow: `var(--tide-shadow-${name})` }}
            >
              <span className="font-mono">shadow-{name}</span>
              <span className="block text-muted">{shadowUsage[name]}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 그림자 3단계를 light와 dark에서 나란히 그린다 */
export function Shadows(): ReactElement {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <ShadowPanel theme="light" />
        <ShadowPanel theme="dark" />
      </div>
      <div className="bg-canvas p-4 text-default">
        <ul className="flex flex-col gap-1">
          {shadowNames.map((name) => (
            <li key={name}>
              <code className="font-mono">shadow-{name}</code>
              <code className="block font-mono text-muted">{shadowCss(name)}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** 포커스 표시 ring과 field. 포커스 상태를 고정해서 보여 준다(focus-ring, focus-field를 variant 없이 씀). */
export function FocusIndicators(): ReactElement {
  return (
    <div className="flex">
      {(["light", "dark"] as const).map((theme) => (
        <section key={theme} data-theme={theme} className="flex-1 bg-canvas p-6 text-default">
          <h3 className="mb-4 font-mono">{theme}</h3>
          <div className="flex flex-col items-start gap-6">
            <button
              type="button"
              tabIndex={-1}
              className="focus-ring rounded-md bg-primary-solid px-4 py-2 text-on-solid"
            >
              focus-ring
            </button>
            <label className="flex flex-col gap-1">
              <span>focus-field</span>
              <input
                tabIndex={-1}
                readOnly
                value="입력값"
                className="focus-field rounded-md border border-default bg-canvas px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>focus-field (오류 입력창)</span>
              <input
                tabIndex={-1}
                readOnly
                value="입력값"
                aria-invalid="true"
                className="focus-field rounded-md border border-default bg-canvas px-3 py-2 aria-invalid:border-danger"
              />
            </label>
          </div>
        </section>
      ))}
    </div>
  );
}
