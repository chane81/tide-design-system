// reduced-motion instance에서는 motion-safe: class만 빠지고 색 전환 Token(fast)은 그대로다.
import { duration, easing, zIndex, type ZIndexName } from "@tide-design/foundation";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

const seconds = (ms: string): string => `${Number.parseFloat(ms) / 1000}s`;
const reducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;

describe("motion", () => {
  test("시간을 적지 않은 transition-colors는 Tide 기본값(fast, out)을 쓴다", async () => {
    await render(
      <button type="button" data-testid="target" className="transition-colors">
        저장
      </button>,
    );
    const style = getComputedStyle(page.getByTestId("target").element());

    // reduced-motion instance에서도 색 전환은 그대로 fast다(Token이 바뀌지 않는다).
    expect(style.transitionDuration).toBe(seconds(duration.fast));
    expect(style.transitionTimingFunction).toBe(easing.out);
    expect(style.transitionProperty).toContain("background-color");
  });

  test("duration-fast, duration-normal, ease-out이 Token 값을 쓴다", async () => {
    await render(
      <div>
        <div data-testid="fast" className="transition-opacity duration-fast ease-out" />
        <div data-testid="normal" className="transition-opacity duration-normal ease-out" />
      </div>,
    );

    for (const name of ["fast", "normal"] as const) {
      const style = getComputedStyle(page.getByTestId(name).element());
      expect(style.transitionDuration, name).toBe(seconds(duration[name]));
      expect(style.transitionTimingFunction, name).toBe(easing.out);
    }
  });

  test("motion-safe:로 감싼 값은 reduced-motion에서 빠지고 기본값(fast)으로 돌아간다", async () => {
    await render(
      <div
        data-testid="overlay"
        className="transition-opacity motion-safe:transition-[opacity,translate] motion-safe:duration-normal"
      />,
    );
    const style = getComputedStyle(page.getByTestId("overlay").element());

    // 두 번째 instance는 forced-colors와 reduced-motion을 함께 켠다. 분기가 실제로 두 쪽 다 도는지 확인한다.
    expect(reducedMotion()).toBe(matchMedia("(forced-colors: active)").matches);
    if (reducedMotion()) {
      expect(style.transitionProperty).toBe("opacity");
      expect(style.transitionDuration).toBe(seconds(duration.fast));
    } else {
      expect(style.transitionProperty).toBe("opacity, translate");
      expect(style.transitionDuration).toBe(seconds(duration.normal));
    }
  });
});

describe("쌓임 단계", () => {
  const names = Object.keys(zIndex) as ZIndexName[];
  // class는 문자열 그대로 적는다. Tailwind가 소스를 스캔한다.
  const tierClass: Record<ZIndexName, string> = {
    sticky: "z-sticky",
    modal: "z-modal",
    popover: "z-popover",
    toast: "z-toast",
    tooltip: "z-tooltip",
  };
  const box = "fixed top-0 left-0 h-10 w-10";

  test("z-<단계>가 Token 값을 쓴다", async () => {
    await render(
      <div>
        {names.map((name) => (
          <div key={name} data-testid={name} className={`${box} ${tierClass[name]}`} />
        ))}
      </div>,
    );

    for (const name of names) {
      expect(getComputedStyle(page.getByTestId(name).element()).zIndex, name).toBe(
        String(zIndex[name]),
      );
    }
  });

  test("DOM 순서와 관계없이 뒤 단계가 앞에 그려지고, 앱 단계를 사이에 끼울 수 있다", async () => {
    // 앞 단계를 DOM 뒤쪽에 둬도 z-index가 이긴다. 앱 단계 z-[250]은 modal과 popover 사이다.
    await render(
      <div>
        <div data-testid="popover" className={`${box} z-popover`} />
        <div data-testid="app-tier" className={`${box} z-[250]`} />
        <div data-testid="modal" className={`${box} z-modal`} />
        <div data-testid="sticky" className={`${box} z-sticky`} />
      </div>,
    );
    const topAt = (): Element | null => document.elementFromPoint(5, 5);

    expect(topAt()).toBe(page.getByTestId("popover").element());
    page.getByTestId("popover").element().remove();
    expect(topAt()).toBe(page.getByTestId("app-tier").element());
    page.getByTestId("app-tier").element().remove();
    expect(topAt()).toBe(page.getByTestId("modal").element());
  });
});
