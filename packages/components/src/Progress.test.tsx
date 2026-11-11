// Progress의 역할·값·이름, 모양, 색, 움직임 줄이기를 실제 Chromium에서 확인한다(tide-v0-impl 티켓 22).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서도 진행 표시가 유지되는지를 계산값으로 단언한다.
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Progress, type ProgressProps } from "./Progress.tsx";

// 앱 Role(brand)을 Role 타입에 더한다(앱의 augmentation과 같다. 티켓 41, ADR 0016).
declare module "@tide-tds/foundation" {
  interface RoleRegistry {
    brand: true;
  }
}

const reducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;

/** CSS 값 하나를 실제로 계산한 결과. 시스템 색 이름을 계산값과 비교할 때 쓴다. */
function resolve(value: string): string {
  const probe = document.createElement("div");
  probe.style.forcedColorAdjust = "none";
  probe.style.borderColor = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).borderTopColor;
  probe.remove();
  return resolved;
}

const progressbar = (): HTMLElement => page.getByRole("progressbar").element() as HTMLElement;
const bar = (): HTMLElement => progressbar().firstElementChild as HTMLElement;
/** 막대 너비 / 트랙 안쪽 너비 */
const ratio = (): number => bar().getBoundingClientRect().width / progressbar().clientWidth;

describe("역할·값·이름", () => {
  test("progressbar 역할과 aria-label 이름, 값 속성(now·min·max)을 노출한다", async () => {
    await render(<Progress value={40} aria-label="업로드" />);
    const element = page.getByRole("progressbar", { name: "업로드" });
    await expect.element(element).toBeInTheDocument();
    await expect.element(element).toHaveAttribute("aria-valuenow", "40");
    await expect.element(element).toHaveAttribute("aria-valuemin", "0");
    await expect.element(element).toHaveAttribute("aria-valuemax", "100");
  });

  test("aria-labelledby로 보이는 글자를 이름으로 쓰고, aria-valuetext를 그대로 넘긴다", async () => {
    await render(
      <div>
        <span id="upload-label">사진 업로드</span>
        <Progress value={3} max={10} aria-labelledby="upload-label" aria-valuetext="10장 중 3장" />
      </div>,
    );
    const element = page.getByRole("progressbar", { name: "사진 업로드" });
    await expect.element(element).toHaveAttribute("aria-valuenow", "3");
    await expect.element(element).toHaveAttribute("aria-valuemax", "10");
    await expect.element(element).toHaveAttribute("aria-valuetext", "10장 중 3장");
  });

  test("막대 요소는 숨겨져 따로 읽히지 않는다", async () => {
    await render(<Progress value={50} aria-label="업로드" />);
    expect(bar()).toHaveAttribute("aria-hidden", "true");
    expect(progressbar().children).toHaveLength(1);
  });

  test("이름(aria-label·aria-labelledby)이 없으면 타입 오류다", () => {
    // @ts-expect-error -- progressbar는 접근 가능한 이름이 필요하다.
    const props: ProgressProps = { value: 10 };
    const label: ProgressProps = { value: 10, "aria-label": "업로드" };
    const labelledby: ProgressProps = { value: 10, "aria-labelledby": "upload-label" };
    expect([props, label, labelledby]).toHaveLength(3);
  });

  test("value는 필수다(값을 모르는 진행은 Spinner를 쓴다)", () => {
    // @ts-expect-error -- indeterminate는 두지 않는다.
    const props: ProgressProps = { "aria-label": "업로드" };
    expect(props).toBeDefined();
  });

  test("role·aria-valuenow·children은 받지 않는다", () => {
    // @ts-expect-error -- 역할은 progressbar로 고정이다.
    const role: ProgressProps = { value: 1, "aria-label": "a", role: "meter" };
    // @ts-expect-error -- 값은 value로 준다.
    const now: ProgressProps = { value: 1, "aria-label": "a", "aria-valuenow": 3 };
    // @ts-expect-error -- 막대는 Progress가 그린다.
    const children: ProgressProps = { value: 1, "aria-label": "a", children: "50%" };
    expect([role, now, children]).toHaveLength(3);
  });
});

describe("값과 막대 너비", () => {
  test("막대 너비는 value / max 비율이다", async () => {
    await render(
      <div className="w-[200px]">
        <Progress value={30} max={60} aria-label="업로드" />
      </div>,
    );
    expect(ratio()).toBeCloseTo(0.5, 2);
  });

  test.each([
    [-10, "0", 0],
    [0, "0", 0],
    [150, "100", 1],
  ] as const)("value %d는 0~max로 잘린다(aria-valuenow %s)", async (value, now, expected) => {
    await render(
      <div className="w-[200px]">
        <Progress value={value} aria-label="업로드" />
      </div>,
    );
    await expect.element(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", now);
    expect(ratio()).toBeCloseTo(expected, 2);
  });

  test("max가 0 이하면 100으로 본다", async () => {
    await render(<Progress value={20} max={0} aria-label="업로드" />);
    await expect.element(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "100");
    await expect.element(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "20");
  });

  test("value를 바꾸면 aria-valuenow와 막대 너비가 따라간다", async () => {
    const screen = await render(
      <div className="w-[200px]">
        <Progress value={20} aria-label="업로드" />
      </div>,
    );
    await screen.rerender(
      <div className="w-[200px]">
        <Progress value={80} aria-label="업로드" />
      </div>,
    );
    await expect.element(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "80");
    // 너비 전환(motion-safe일 때 fast 150ms)이 끝나기를 기다린다.
    await expect.poll(ratio).toBeCloseTo(0.8, 2);
  });
});

describe("모양", () => {
  test.each([
    ["sm", 4],
    ["md", 8],
  ] as const)("size %s는 굵기 %ipx이고 radius full이다", async (size, px) => {
    await render(<Progress value={50} size={size} aria-label="업로드" />);
    const element = progressbar();
    expect(element.getBoundingClientRect().height).toBe(px);
    expect(bar().getBoundingClientRect().height).toBe(px - (forcedColors() ? 2 : 0));
    expect(Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)).toBeGreaterThan(px);
    expect(getComputedStyle(element).overflow).toBe("hidden");
  });

  test("size를 주지 않으면 md(8px)이고 너비는 부모를 채운다", async () => {
    await render(
      <div className="w-[240px]">
        <Progress value={50} aria-label="업로드" />
      </div>,
    );
    expect(progressbar().getBoundingClientRect().height).toBe(8);
    expect(progressbar().getBoundingClientRect().width).toBe(240);
  });

  test("지원하지 않는 size는 타입 오류다", () => {
    // @ts-expect-error -- size는 sm/md만 받는다.
    const props: ProgressProps = { value: 1, "aria-label": "a", size: "lg" };
    expect(props.size).toBe("lg");
  });
});

describe("색", () => {
  const roles = ["neutral", "primary", "success", "warning", "danger", "info"] as const;

  test.each(roles)(
    "%s: 막대는 같은 Role의 text 색, 트랙은 subtle 배경이다(light·dark)",
    async (role) => {
      for (const theme of ["light", "dark"] as const) {
        const screen = await render(
          <div data-theme={theme}>
            <Progress value={50} color={role} aria-label="업로드" />
          </div>,
        );
        expect(progressbar()).toHaveAttribute("data-color", role);
        if (!forcedColors()) {
          const probe = document.createElement("span");
          probe.dataset["theme"] = theme;
          probe.dataset["color"] = role;
          probe.className = "bg-accent-subtle text-accent";
          document.body.append(probe);
          const expected = getComputedStyle(probe);
          expect(getComputedStyle(progressbar()).backgroundColor).toBe(expected.backgroundColor);
          expect(getComputedStyle(bar()).backgroundColor).toBe(expected.color);
          probe.remove();
        }
        await screen.unmount();
      }
    },
  );

  test("기본은 primary이고 바깥 요소의 data-color를 물려받지 않는다", async () => {
    await render(
      <div data-theme="light" data-color="danger">
        <Progress value={50} aria-label="업로드" />
      </div>,
    );
    expect(progressbar()).toHaveAttribute("data-color", "primary");
    if (forcedColors()) return;
    expect(getComputedStyle(bar()).backgroundColor).toBe(resolve("var(--tide-text-primary)"));
  });

  test("color는 Role(앱 Role 포함)만 받고 색 계열 이름은 타입 오류다(ADR 0016)", () => {
    const tide: ProgressProps = { value: 1, "aria-label": "a", color: "success" };
    const app: ProgressProps = { value: 1, "aria-label": "a", color: "brand" };
    // @ts-expect-error -- 진행 상태는 뜻이 있는 표시라 뜻 없는 색 계열을 받지 않는다.
    const family: ProgressProps = { value: 1, "aria-label": "a", color: "blue" };
    expect([tide, app, family]).toHaveLength(3);
  });
});

describe("움직임 줄이기와 forced-colors", () => {
  test("움직임 줄이기에서도 진행 표시는 그대로 보이고, 너비 전환만 빠진다", async () => {
    await render(
      <div className="w-[200px]" data-theme="light">
        <Progress value={60} aria-label="업로드" />
      </div>,
    );
    // 두 번째 instance는 forced-colors와 reduced-motion을 함께 켠다. 분기가 실제로 두 쪽 다 도는지 확인한다.
    expect(reducedMotion()).toBe(forcedColors());
    const style = getComputedStyle(bar());

    // 진행 표시는 두 instance에서 같다: 막대가 보이고 너비가 값과 같다. keyframe은 없다.
    expect(style.display).toBe("block");
    expect(style.visibility).toBe("visible");
    expect(style.opacity).toBe("1");
    expect(style.animationName).toBe("none");
    expect(bar().getAnimations()).toHaveLength(0);
    expect(ratio()).toBeCloseTo(0.6, 2);
    expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

    if (reducedMotion()) {
      // motion-safe:로 감싼 전환이 빠져 값이 바로 바뀐다.
      expect(style.transitionDuration).toBe("0s");
    } else {
      expect(style.transitionProperty).toBe("width");
      // 시간을 적지 않은 transition의 기본값 fast(150ms)와 out
      expect(style.transitionDuration).toBe("0.15s");
      expect(style.transitionTimingFunction).toBe("cubic-bezier(0, 0, 0.2, 1)");
    }
  });

  test("forced-colors에서 트랙은 Canvas와 CanvasText 경계, 막대는 Highlight로 남는다", async () => {
    await render(
      <div data-theme="light">
        <Progress value={50} aria-label="업로드" />
      </div>,
    );
    const track = getComputedStyle(progressbar());
    const fill = getComputedStyle(bar());
    if (forcedColors()) {
      expect(track.forcedColorAdjust).toBe("none");
      expect(track.backgroundColor).toBe(resolve("Canvas"));
      expect(track.borderTopWidth).toBe("1px");
      expect(track.borderTopColor).toBe(resolve("CanvasText"));
      expect(fill.backgroundColor).toBe(resolve("Highlight"));
      expect(fill.backgroundColor).not.toBe(track.backgroundColor);
    } else {
      expect(track.borderTopWidth).toBe("0px");
      expect(fill.backgroundColor).not.toBe(resolve("Highlight"));
    }
  });
});

describe("공통 API", () => {
  test("ref와 나머지 props를 루트 div에 넘기고, className이 기본 class를 이긴다", async () => {
    let node: HTMLDivElement | null = null;
    await render(
      <div className="w-[300px]">
        <Progress
          ref={(element) => {
            node = element;
          }}
          value={10}
          aria-label="업로드"
          id="upload-progress"
          aria-describedby="upload-help"
          className="w-1/2 rounded-none"
          data-testid="progress"
        />
      </div>,
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
    const element = page.getByTestId("progress").element() as HTMLElement;
    expect(element).toHaveAttribute("id", "upload-progress");
    expect(element).toHaveAttribute("aria-describedby", "upload-help");
    expect(element).toHaveClass("w-1/2", "rounded-none");
    expect(element).not.toHaveClass("w-full");
    expect(element).not.toHaveClass("rounded-full");
    expect(element.getBoundingClientRect().width).toBe(150);
    expect(getComputedStyle(element).borderTopLeftRadius).toBe("0px");
  });
});
