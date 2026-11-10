import { color, type ColorFamily, type ColorStep, type Role } from "@tide-tds/foundation";
// 내부 서브패스(앱 개발자용 아님). 문서 블록이 원본 hex로 대비비를 계산하려고 쓴다.
import { contrastRatio, roleFamily, semanticHex } from "@tide-tds/foundation/internal";
import type { ReactElement } from "react";

// 색 Token 블록: Primitive 스케일을 Token 원본에서 그린다(spec 「문서 앱」 Token 블록).
// 각 단계 아래에 light canvas(흰색)와 dark canvas 위 대비비를 적는다. 값은 CSS가 아니라 원본 hex로 계산한다.

const steps = Object.keys(color.blue).map(Number) as ColorStep[];
const canvasLight = semanticHex("bg-canvas", "light");
const canvasDark = semanticHex("bg-canvas", "dark");

const familyRole = Object.fromEntries(
  Object.entries(roleFamily).map(([role, family]) => [family, role]),
) as Record<ColorFamily, Role>;
const families = Object.values(roleFamily);

// 칸 수를 고정하지 않고, 이름(`amber-950`)과 hex가 한 줄에 들어가는 최소 폭(6rem)으로 들어가는 만큼 둔다.
const gridClass = "grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2";

function ratio(foreground: string, background: string): string {
  return contrastRatio(foreground, background).toFixed(2);
}

function Swatch({ name, hex }: { name: string; hex: string }): ReactElement {
  return (
    <li className="flex min-w-0 flex-col gap-1">
      <div
        aria-hidden="true"
        className="h-12 rounded-md border border-default"
        style={{ backgroundColor: hex }}
      />
      <span className="font-mono">{name}</span>
      <span className="font-mono text-muted">{hex}</span>
      <span className="font-mono text-muted">
        <abbr title="light canvas 위 대비비">L</abbr> {ratio(hex, canvasLight)}
      </span>
      <span className="font-mono text-muted">
        <abbr title="dark canvas 위 대비비">D</abbr> {ratio(hex, canvasDark)}
      </span>
    </li>
  );
}

/** Primitive 색 스케일. 계열마다 쓰는 Role을 함께 적는다. */
export function ColorScale(): ReactElement {
  return (
    <div className="flex flex-col gap-6 bg-canvas p-4 text-default">
      {families.map((family) => (
        <section key={family} aria-labelledby={`color-scale-${family}`}>
          <h3 id={`color-scale-${family}`} className="mb-2">
            {family} <span className="text-muted">({familyRole[family]})</span>
          </h3>
          <ul className={gridClass}>
            {steps.map((step) => (
              <Swatch key={step} name={`${family}-${step}`} hex={color[family][step]} />
            ))}
          </ul>
        </section>
      ))}
      <section aria-labelledby="color-scale-base">
        <h3 id="color-scale-base" className="mb-2">
          white, black
        </h3>
        <ul className={gridClass}>
          <Swatch name="white" hex={color.white} />
          <Swatch name="black" hex={color.black} />
        </ul>
      </section>
    </div>
  );
}
