import { radius, shadow, type RadiusName, type ShadowName } from "@tide-design/foundation";
import type { ReactElement } from "react";

// Tailwind는 소스에 그대로 적힌 class만 만들므로 class를 조합하지 않고 변수(--tide-*)를 inline style로 쓴다.

const radiusNames = Object.keys(radius) as RadiusName[];
const shadowNames = Object.keys(shadow) as ShadowName[];

/** 단계별 쓰는 곳(spec 「`@tide-design/foundation`」 radius·Elevation) */
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

/** 그림자 레이어 하나를 box-shadow 값으로 쓴다. 합친 값은 `--tide-shadow-<단계>`를 쓴다. */
const layerCss = ({ x, y, blur, spread, mix }: (typeof shadow)[ShadowName][number]): string =>
  `${x}px ${y}px ${blur}px ${spread}px color-mix(in srgb, var(--tide-shadow-color) ${mix}%, transparent)`;

const shadowParts = [
  { label: "가까운", style: (name: ShadowName) => layerCss(shadow[name][0]) },
  { label: "먼", style: (name: ShadowName) => layerCss(shadow[name][1]) },
  { label: "합침", style: (name: ShadowName) => `var(--tide-shadow-${name})` },
] as const;

/** 한 Theme의 그림자 3단계. 단계마다 두 레이어를 따로, 그리고 합쳐 raised 표면 위에 그린다. */
function ShadowPanel({ theme }: { theme: "light" | "dark" }): ReactElement {
  return (
    <section data-theme={theme} className="flex-1 bg-canvas p-6 text-default">
      <h3 className="mb-4 font-mono">{theme}</h3>
      <ul className="flex flex-col gap-6">
        {shadowNames.map((name) => (
          <li key={name} className="flex flex-col gap-3">
            <div>
              <span className="font-mono">shadow-{name}</span>
              <span className="ml-2 text-muted">{shadowUsage[name]}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {shadowParts.map((part) => (
                <div
                  key={part.label}
                  className="flex h-14 items-center justify-center rounded-lg border border-raised bg-raised text-muted"
                  style={{ boxShadow: part.style(name) }}
                >
                  {part.label}
                </div>
              ))}
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
    <div className="flex">
      <ShadowPanel theme="light" />
      <ShadowPanel theme="dark" />
    </div>
  );
}

/** 포커스 표시 ring과 field. 포커스 상태를 고정해서 보여 준다(focus-ring, focus-field를 variant 없이 씀). */
// focus-field 예시에는 border 색 class를 붙이지 않는다. variant 없이는 뒤에 오는 border-default가 이겨 실제와 달라진다.
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
              className="focus-ring rounded-md bg-primary-solid px-4 py-2 text-on-solid inset-ring-2 inset-ring-(color:--tide-bg-canvas)"
            >
              focus-ring (solid, canvas 틈)
            </button>
            <button
              type="button"
              tabIndex={-1}
              className="focus-ring rounded-md px-4 py-2 text-primary"
            >
              focus-ring (ghost)
            </button>
            <button
              type="button"
              tabIndex={-1}
              data-color="success"
              className="focus-ring rounded-md bg-accent-solid px-4 py-2 text-accent-on-solid inset-ring-2 inset-ring-(color:--tide-bg-canvas)"
            >
              focus-ring (success)
            </button>
            <button
              type="button"
              tabIndex={-1}
              className="focus-field rounded-md border bg-canvas px-4 py-2 text-primary"
            >
              focus-field (outline 버튼)
            </button>
            <label className="flex flex-col gap-1">
              <span>focus-field</span>
              <input
                tabIndex={-1}
                readOnly
                value="입력값"
                className="focus-field rounded-md border bg-canvas px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>focus-field (오류 입력창)</span>
              <input
                tabIndex={-1}
                readOnly
                value="입력값"
                aria-invalid="true"
                className="focus-field rounded-md border bg-canvas px-3 py-2"
              />
            </label>
          </div>
        </section>
      ))}
    </div>
  );
}
