// Switch의 모양과 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 17).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는
// 켜짐·꺼짐이 시스템 색 채움과 thumb 위치로 구분되는지, thumb 이동 transition이 빠지는지를 계산값으로 단언한다.
import { useState, type ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Field } from "./Field.tsx";
import { Switch, type SwitchProps } from "./Switch.tsx";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const reducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const transparent = "rgba(0, 0, 0, 0)";

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(value: string): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  // 시스템 색 이름(Highlight 등)을 forced-colors가 덮지 않고 그대로 계산하게 한다.
  probe.style.forcedColorAdjust = "none";
  probe.style.borderColor = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).borderTopColor;
  probe.remove();
  return resolved;
}

/** transition(fast 150ms)이 끝난 뒤 계산값을 읽는다. */
const settle = (): Promise<void> => new Promise((done) => setTimeout(done, 250));

/** track(네이티브 input)과 thumb(바로 뒤 형제 span) */
function parts(name: string): { track: HTMLInputElement; thumb: HTMLElement; root: HTMLElement } {
  const track = page.getByRole("switch", { name }).element() as HTMLInputElement;
  return {
    track,
    thumb: track.nextElementSibling as HTMLElement,
    root: track.closest("label")!,
  };
}

describe("역할과 이름", () => {
  test("스위치 역할로 읽히고 children이 이름이 된다", async () => {
    await render(<Switch>알림 받기</Switch>);
    const toggle = page.getByRole("switch", { name: "알림 받기" });
    await expect.element(toggle).toBeInTheDocument();
    await expect.element(toggle).not.toBeChecked();
    expect(toggle.element()).toHaveAttribute("type", "checkbox");
  });

  test("thumb은 장식이라 이름에 들어가지 않는다", async () => {
    await render(<Switch>다크 모드</Switch>);
    const { thumb } = parts("다크 모드");
    expect(thumb).toHaveAttribute("aria-hidden", "true");
    await expect.element(page.getByRole("switch")).toHaveAccessibleName("다크 모드");
  });

  test("children 없이 aria-label로 이름을 줄 수 있다", async () => {
    await render(<Switch aria-label="자동 저장" />);
    await expect.element(page.getByRole("switch", { name: "자동 저장" })).toBeInTheDocument();
  });

  test("label 텍스트를 누르면 켜지고 꺼진다", async () => {
    await render(<Switch>알림 받기</Switch>);
    const toggle = page.getByRole("switch", { name: "알림 받기" });
    await userEvent.click(page.getByText("알림 받기"));
    await expect.element(toggle).toBeChecked();
    await userEvent.click(page.getByText("알림 받기"));
    await expect.element(toggle).not.toBeChecked();
  });
});

describe("키보드", () => {
  test("Tab으로 포커스하고 Space로 켜고 끈다", async () => {
    await render(<Switch>알림 받기</Switch>);
    const toggle = page.getByRole("switch", { name: "알림 받기" });
    await userEvent.tab();
    await expect.element(toggle).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect.element(toggle).toBeChecked();
    await userEvent.keyboard(" ");
    await expect.element(toggle).not.toBeChecked();
  });
});

describe("제어와 비제어", () => {
  test("비제어: defaultChecked에서 시작하고 onChange가 불린다", async () => {
    const onChange = vi.fn();
    await render(
      <Switch defaultChecked onChange={onChange}>
        알림 받기
      </Switch>,
    );
    const toggle = page.getByRole("switch", { name: "알림 받기" });
    await expect.element(toggle).toBeChecked();
    await userEvent.click(toggle);
    await expect.element(toggle).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("제어: checked와 onChange로 앱이 상태를 정한다", async () => {
    function Controlled(): ReactElement {
      const [on, setOn] = useState(false);
      return (
        <div>
          <Switch checked={on} onChange={(event) => setOn(event.target.checked)}>
            알림 받기
          </Switch>
          <output>{on ? "켜짐" : "꺼짐"}</output>
        </div>
      );
    }
    await render(<Controlled />);
    const toggle = page.getByRole("switch", { name: "알림 받기" });
    await userEvent.click(toggle);
    await expect.element(toggle).toBeChecked();
    await expect.element(page.getByRole("status")).toHaveTextContent("켜짐");
  });

  test("제어: 앱이 상태를 바꾸지 않으면 눌러도 그대로다", async () => {
    await render(
      <Switch checked={false} onChange={() => {}}>
        잠김
      </Switch>,
    );
    const toggle = page.getByRole("switch", { name: "잠김" });
    await userEvent.click(toggle);
    await expect.element(toggle).not.toBeChecked();
  });

  test("네이티브 form으로 name·value가 제출된다", async () => {
    const submitted: FormData[] = [];
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted.push(new FormData(event.currentTarget));
        }}
      >
        <Switch name="news">소식 받기</Switch>
        <Switch name="ads" value="yes" defaultChecked>
          광고 받기
        </Switch>
        <button type="submit">저장</button>
      </form>,
    );
    await userEvent.click(page.getByRole("button", { name: "저장" }));
    await userEvent.click(page.getByRole("switch", { name: "소식 받기" }));
    await userEvent.click(page.getByRole("button", { name: "저장" }));

    expect(submitted).toHaveLength(2);
    expect(submitted[0]!.get("news")).toBeNull();
    expect(submitted[0]!.get("ads")).toBe("yes");
    expect(submitted[1]!.get("news")).toBe("on");
  });
});

describe("disabled", () => {
  test("포커스를 받지 않고, 눌러도 바뀌지 않으며, cursor가 not-allowed다", async () => {
    await render(
      <Switch disabled defaultChecked>
        알림 받기
      </Switch>,
    );
    const toggle = page.getByRole("switch", { name: "알림 받기" });
    const { root } = parts("알림 받기");
    await expect.element(toggle).toBeDisabled();
    expect(root).toHaveAttribute("data-disabled", "");
    expect(getComputedStyle(toggle.element()).cursor).toBe("not-allowed");
    expect(getComputedStyle(root).cursor).toBe("not-allowed");

    await userEvent.tab();
    expect(document.activeElement).toBe(document.body);
    await userEvent.click(page.getByText("알림 받기"), { force: true });
    await expect.element(toggle).toBeChecked();
  });

  test("활성 상태에서는 track과 label 모두 cursor가 pointer다", async () => {
    await render(<Switch>알림 받기</Switch>);
    const { track, root } = parts("알림 받기");
    expect(getComputedStyle(track).cursor).toBe("pointer");
    expect(getComputedStyle(root).cursor).toBe("pointer");
  });
});

describe("Field", () => {
  test("Field의 label이 이름이 되고 설명이 aria-describedby로 연결된다", async () => {
    await render(
      <Field label="자동 업데이트" description="새 버전을 밤에 설치합니다.">
        <Switch />
      </Field>,
    );
    const toggle = page.getByRole("switch", { name: "자동 업데이트" });
    await expect.element(toggle).toHaveAccessibleDescription("새 버전을 밤에 설치합니다.");
    await userEvent.click(page.getByText("자동 업데이트"));
    await expect.element(toggle).toBeChecked();
  });

  test("Field 오류는 aria-invalid·data-invalid와 설명으로 붙는다", async () => {
    await render(
      <Field label="약관 동의" error="동의해야 가입할 수 있습니다." required>
        <Switch name="terms" />
      </Field>,
    );
    const toggle = page.getByRole("switch", { name: "약관 동의" });
    await expect.element(toggle).toHaveAttribute("aria-invalid", "true");
    await expect.element(toggle).toHaveAttribute("data-invalid", "");
    await expect.element(toggle).toBeRequired();
    await expect.element(toggle).toHaveAccessibleDescription("동의해야 가입할 수 있습니다.");
    expect(parts("약관 동의").root).toHaveAttribute("data-invalid", "");
    if (!forcedColors()) {
      expect(getComputedStyle(toggle.element()).borderTopColor).toBe(
        resolve("var(--tide-border-danger)"),
      );
    }
  });

  test("Field의 disabled를 따른다", async () => {
    await render(
      <Field label="자동 업데이트" disabled>
        <Switch />
      </Field>,
    );
    await expect.element(page.getByRole("switch", { name: "자동 업데이트" })).toBeDisabled();
  });

  test("Field 밖에서 invalid와 aria-describedby를 직접 줄 수 있다", async () => {
    await render(
      <div>
        <Switch invalid aria-describedby="hint">
          약관 동의
        </Switch>
        <p id="hint">필수입니다.</p>
      </div>,
    );
    const toggle = page.getByRole("switch", { name: "약관 동의" });
    await expect.element(toggle).toHaveAttribute("aria-invalid", "true");
    await expect.element(toggle).toHaveAccessibleDescription("필수입니다.");
  });
});

describe("size", () => {
  const sizes: [NonNullable<SwitchProps["size"]>, number, number, number, string][] = [
    // size, track 폭, track 높이, thumb 크기, 텍스트 스타일
    ["sm", 28, 16, 10, "label-sm"],
    ["md", 36, 20, 14, "label-md"],
    ["lg", 44, 24, 18, "label-lg"],
  ];

  test.each(sizes)(
    "%s는 track %ix%ipx, thumb %ipx이고 안쪽 여백 2px로 끝까지 움직이며, label은 %s다",
    async (size, width, height, thumbSize, textStyle) => {
      await render(
        <div>
          <Switch size={size}>꺼짐</Switch>
          <Switch size={size} defaultChecked>
            켜짐
          </Switch>
          <span data-testid="text" className={`text-${textStyle}`}>
            글자
          </span>
        </div>,
      );
      const off = parts("꺼짐");
      const on = parts("켜짐");
      const track = off.track.getBoundingClientRect();
      const offThumb = off.thumb.getBoundingClientRect();
      const text = getComputedStyle(page.getByTestId("text").element());

      expect(track.width).toBe(width);
      expect(track.height).toBe(height);
      expect(offThumb.width).toBe(thumbSize);
      expect(offThumb.height).toBe(thumbSize);
      // border 1px + 여백 2px
      expect(offThumb.left - track.left).toBe(3);
      expect(offThumb.top - track.top).toBe(3);

      await settle();
      const onTrack = on.track.getBoundingClientRect();
      const onThumb = on.thumb.getBoundingClientRect();
      expect(onTrack.right - onThumb.right).toBe(3);

      expect(getComputedStyle(off.root).fontSize).toBe(text.fontSize);
      expect(getComputedStyle(off.root).lineHeight).toBe(text.lineHeight);
    },
  );

  test("기본 size는 md다", async () => {
    await render(<Switch>알림</Switch>);
    expect(parts("알림").track.getBoundingClientRect().width).toBe(36);
  });

  test("가장 작은 sm도 누르는 영역(루트 label)이 24×24px 이상이다", async () => {
    await render(<Switch size="sm" aria-label="알림" />);
    const rect = parts("알림").root.getBoundingClientRect();
    expect(rect.width).toBeGreaterThanOrEqual(24);
    expect(rect.height).toBeGreaterThanOrEqual(24);
  });

  test("지원하지 않는 size와 color는 타입 오류다", () => {
    // @ts-expect-error Switch는 xs를 받지 않는다.
    const xs: SwitchProps = { size: "xs" };
    // @ts-expect-error 색 계열 이름은 받지 않는다. color는 Role만 받는다.
    const gray: SwitchProps = { color: "gray" };
    expect([xs, gray]).toHaveLength(2);
  });

  test("RTL에서는 켜면 thumb이 왼쪽으로 간다", async () => {
    await render(
      <div dir="rtl">
        <Switch defaultChecked>켜짐</Switch>
      </div>,
    );
    await settle();
    const { track, thumb } = parts("켜짐");
    expect(thumb.getBoundingClientRect().left - track.getBoundingClientRect().left).toBe(3);
  });
});

describe("색", () => {
  test("켜진 track은 기본 primary solid, 경계는 border-accent이고 thumb은 on-solid다", async () => {
    await render(
      <div data-theme="light">
        <Switch defaultChecked>켜짐</Switch>
        <Switch>꺼짐</Switch>
      </div>,
    );
    const on = parts("켜짐");
    const off = parts("꺼짐");
    expect(on.root).toHaveAttribute("data-color", "primary");
    await settle();
    if (forcedColors()) return;
    expect(getComputedStyle(on.track).backgroundColor).toBe(
      resolve("var(--tide-bg-primary-solid)"),
    );
    expect(getComputedStyle(on.track).borderTopColor).toBe(resolve("var(--tide-border-primary)"));
    expect(getComputedStyle(on.thumb).backgroundColor).toBe(resolve("var(--tide-text-on-solid)"));
    // 꺼짐: 투명 track에 border-strong 경계, text-muted thumb
    expect(getComputedStyle(off.track).backgroundColor).toBe(transparent);
    expect(getComputedStyle(off.track).borderTopColor).toBe(resolve("var(--tide-border-strong)"));
    expect(getComputedStyle(off.thumb).backgroundColor).toBe(resolve("var(--tide-text-muted)"));
  });

  test.each(["neutral", "primary", "success", "warning", "danger", "info"] as const)(
    "color=%s: 켜진 track은 그 Role의 solid, thumb은 on-solid다",
    async (role) => {
      await render(
        <div data-theme="light">
          <Switch defaultChecked color={role}>
            켜짐
          </Switch>
        </div>,
      );
      await settle();
      if (forcedColors()) return;
      const { track, thumb } = parts("켜짐");
      expect(getComputedStyle(track).backgroundColor).toBe(resolve(`var(--tide-bg-${role}-solid)`));
      expect(getComputedStyle(thumb).backgroundColor).toBe(resolve("var(--tide-text-on-solid)"));
    },
  );

  test("color로 켜진 색을 고르고, 바깥 data-color를 물려받지 않는다", async () => {
    await render(
      <div data-theme="light" data-color="danger">
        <Switch defaultChecked color="success">
          성공
        </Switch>
        <Switch defaultChecked>기본</Switch>
      </div>,
    );
    expect(parts("성공").root).toHaveAttribute("data-color", "success");
    expect(parts("기본").root).toHaveAttribute("data-color", "primary");
    await settle();
    if (forcedColors()) return;
    expect(getComputedStyle(parts("성공").track).backgroundColor).toBe(
      resolve("var(--tide-bg-success-solid)"),
    );
    expect(getComputedStyle(parts("기본").track).backgroundColor).toBe(
      resolve("var(--tide-bg-primary-solid)"),
    );
  });

  test("비활성은 disabled Token 색이다", async () => {
    await render(
      <div data-theme="light">
        <Switch disabled defaultChecked>
          켜짐
        </Switch>
      </div>,
    );
    if (forcedColors()) return;
    const { track, thumb, root } = parts("켜짐");
    expect(getComputedStyle(track).backgroundColor).toBe(resolve("var(--tide-bg-disabled)"));
    expect(getComputedStyle(thumb).backgroundColor).toBe(resolve("var(--tide-text-disabled)"));
    expect(getComputedStyle(root).color).toBe(resolve("var(--tide-text-disabled)"));
  });

  test("thumb은 shadow-sm 그림자다", async () => {
    await render(
      <div data-theme="light">
        <Switch>알림</Switch>
        <span data-testid="probe" className="shadow-sm" />
      </div>,
    );
    if (forcedColors()) return;
    const shadow = getComputedStyle(parts("알림").thumb).boxShadow;
    expect(shadow).not.toBe("none");
    expect(shadow).toBe(getComputedStyle(page.getByTestId("probe").element()).boxShadow);
  });
});

describe("포커스 표시", () => {
  test("키보드 포커스에 focus-ring(outline 2px, offset 2px)이 보인다", async () => {
    await render(
      <div data-theme="light">
        <Switch>알림</Switch>
      </div>,
    );
    await userEvent.tab();
    await settle();
    const style = getComputedStyle(parts("알림").track);
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("2px");
    if (forcedColors()) {
      expect(style.outlineColor).not.toBe(transparent);
    } else {
      expect(style.outlineColor).toBe(resolve("var(--tide-outline-focus)"));
    }
  });

  test("마우스로 누르면 포커스 표시가 보이지 않는다", async () => {
    await render(<Switch>알림</Switch>);
    await userEvent.click(page.getByRole("switch"));
    expect(getComputedStyle(parts("알림").track).outlineStyle).toBe("none");
  });
});

describe("motion", () => {
  test("track 색은 transition-colors(fast 150ms)로 바뀐다", async () => {
    await render(<Switch>알림</Switch>);
    const style = getComputedStyle(parts("알림").track);
    expect(style.transitionProperty).toContain("background-color");
    expect(style.transitionDuration.split(",")[0]).toBe("0.15s");
  });

  test("thumb 이동은 움직임 줄이기에서만 transition에서 빠진다", async () => {
    await render(<Switch>알림</Switch>);
    const style = getComputedStyle(parts("알림").thumb);
    expect(style.transitionProperty).toContain("background-color");
    expect(style.transitionDuration.split(",")[0]).toBe("0.15s");
    if (reducedMotion()) {
      expect(style.transitionProperty).not.toContain("translate");
    } else {
      expect(style.transitionProperty).toContain("translate");
    }
  });
});

describe("forced-colors", () => {
  test("켜짐과 꺼짐이 track 채움, thumb 위치, 경계로 구분된다", async () => {
    await render(
      <div>
        <Switch defaultChecked>켜짐</Switch>
        <Switch>꺼짐</Switch>
      </div>,
    );
    await settle();
    const on = parts("켜짐");
    const off = parts("꺼짐");
    const onTrack = getComputedStyle(on.track);
    const offTrack = getComputedStyle(off.track);
    const onThumb = getComputedStyle(on.thumb);
    const offThumb = getComputedStyle(off.thumb);

    // 경계가 보인다.
    expect(offTrack.borderTopWidth).toBe("1px");
    expect(offTrack.borderTopColor).not.toBe(transparent);
    // 켜진 track은 채워지고, 꺼진 track과 배경이 다르다.
    expect(onTrack.backgroundColor).not.toBe(transparent);
    expect(onTrack.backgroundColor).not.toBe(offTrack.backgroundColor);
    // thumb은 각 track 배경과 다른 색이다.
    expect(onThumb.backgroundColor).not.toBe(onTrack.backgroundColor);
    expect(offThumb.backgroundColor).not.toBe(transparent);
    // thumb 위치가 다르다(꺼짐 시작 쪽, 켜짐 끝 쪽).
    const onOffset = on.thumb.getBoundingClientRect().left - on.track.getBoundingClientRect().left;
    const offOffset =
      off.thumb.getBoundingClientRect().left - off.track.getBoundingClientRect().left;
    expect(onOffset).toBeGreaterThan(offOffset);

    if (forcedColors()) {
      // 시스템 색으로 그린다: 켜짐 Highlight 채움, 꺼짐은 Canvas 위 CanvasText 경계와 thumb.
      expect(onTrack.backgroundColor).toBe(resolve("Highlight"));
      expect(onThumb.backgroundColor).toBe(resolve("HighlightText"));
      expect(offTrack.borderTopColor).toBe(resolve("CanvasText"));
      expect(offThumb.backgroundColor).toBe(resolve("CanvasText"));
    }
  });
});

describe("props", () => {
  test("ref와 HTML 속성은 input에, className은 루트 label에 붙고 기본 class를 이긴다", async () => {
    let input: HTMLInputElement | null = null;
    await render(
      <Switch
        ref={(node) => {
          input = node;
        }}
        id="wifi"
        name="wifi"
        data-testid="wifi"
        className="gap-6"
        style={{ marginInlineStart: 8 }}
      >
        Wi-Fi
      </Switch>,
    );
    const { track, root } = parts("Wi-Fi");
    expect(input).toBe(track);
    expect(track).toHaveAttribute("id", "wifi");
    expect(track).toHaveAttribute("name", "wifi");
    expect(track).toHaveAttribute("data-testid", "wifi");
    expect(getComputedStyle(root).columnGap).toBe("24px");
    expect(getComputedStyle(root).marginInlineStart).toBe("8px");
  });
});

describe("hover와 누름", () => {
  /** label 텍스트 위에 마우스를 올린 뒤 transition이 끝난 계산값 */
  async function hoverLabel(text: string): Promise<void> {
    await userEvent.hover(page.getByText(text));
    await settle();
  }

  test("테스트 환경은 hover를 지원한다(Tailwind v4 hover variant는 @media (hover: hover) 안에 있다)", () => {
    expect(matchMedia("(hover: hover)").matches).toBe(true);
  });

  test("켜짐: label에 올리면 track이 solid-hover, 누르면 solid-active이고 thumb은 on-solid다", async () => {
    await render(
      <div data-theme="light">
        <Switch defaultChecked>
          <span data-testid="on">켜짐</span>
        </Switch>
      </div>,
    );
    const { track, thumb } = parts("켜짐");
    await hoverLabel("켜짐");
    const hovered = getComputedStyle(track).backgroundColor;
    if (forcedColors()) {
      // forced-colors에서는 hover에도 켜짐 채움(Highlight)이 그대로다.
      expect(hovered).toBe(resolve("Highlight"));
      expect(getComputedStyle(thumb).backgroundColor).toBe(resolve("HighlightText"));
    } else {
      expect(hovered).toBe(resolve("var(--tide-bg-primary-solid-hover)"));
      expect(getComputedStyle(thumb).backgroundColor).toBe(resolve("var(--tide-text-on-solid)"));
    }

    await commands.mouseDownOn("on");
    await settle();
    const pressed = getComputedStyle(track).backgroundColor;
    await commands.mouseUp();
    expect(pressed).toBe(
      forcedColors() ? resolve("Highlight") : resolve("var(--tide-bg-primary-solid-active)"),
    );
  });

  test("꺼짐: label에 올리면 track이 neutral subtle-hover, 누르면 subtle-active이고 thumb은 text-default다", async () => {
    await render(
      <div data-theme="light">
        <Switch>
          <span data-testid="off">꺼짐</span>
        </Switch>
      </div>,
    );
    const { track, thumb } = parts("꺼짐");
    await hoverLabel("꺼짐");
    const hovered = getComputedStyle(track).backgroundColor;
    if (forcedColors()) {
      expect(hovered).toBe(resolve("Canvas"));
      expect(getComputedStyle(thumb).backgroundColor).toBe(resolve("CanvasText"));
      expect(getComputedStyle(track).borderTopColor).toBe(resolve("CanvasText"));
    } else {
      expect(hovered).toBe(resolve("var(--tide-bg-neutral-subtle-hover)"));
      expect(getComputedStyle(thumb).backgroundColor).toBe(resolve("var(--tide-text-default)"));
      // 경계는 그대로 border-strong이다.
      expect(getComputedStyle(track).borderTopColor).toBe(resolve("var(--tide-border-strong)"));
    }

    await commands.mouseDownOn("off");
    await settle();
    const pressed = getComputedStyle(track).backgroundColor;
    await commands.mouseUp();
    expect(pressed).toBe(
      forcedColors() ? resolve("Canvas") : resolve("var(--tide-bg-neutral-subtle-active)"),
    );
  });

  test("track에 올려도 같은 hover 색이다", async () => {
    await render(
      <div data-theme="light">
        <Switch defaultChecked>켜짐</Switch>
      </div>,
    );
    const { track } = parts("켜짐");
    await userEvent.hover(page.getByRole("switch"));
    await settle();
    if (forcedColors()) return;
    expect(getComputedStyle(track).backgroundColor).toBe(
      resolve("var(--tide-bg-primary-solid-hover)"),
    );
  });

  test.each([
    ["켜짐", true],
    ["꺼짐", false],
  ] as const)("비활성 %s은 hover·누름에 색이 바뀌지 않는다", async (label, checked) => {
    await render(
      <div data-theme="light">
        <Switch disabled defaultChecked={checked}>
          <span data-testid="target">{label}</span>
        </Switch>
      </div>,
    );
    const { track, thumb } = parts(label);
    const before = [
      getComputedStyle(track).backgroundColor,
      getComputedStyle(thumb).backgroundColor,
    ];
    await userEvent.hover(page.getByText(label));
    await settle();
    expect([
      getComputedStyle(track).backgroundColor,
      getComputedStyle(thumb).backgroundColor,
    ]).toEqual(before);
    await commands.mouseDownOn("target");
    await settle();
    const pressed = getComputedStyle(track).backgroundColor;
    await commands.mouseUp();
    expect(pressed).toBe(before[0]);
    if (!forcedColors()) expect(before[0]).toBe(resolve("var(--tide-bg-disabled)"));
  });

  test("Switch를 감싼 바깥 group 요소에 올려도 반응하지 않는다", async () => {
    await render(
      <div data-theme="light" data-testid="card" className="group p-8">
        <Switch defaultChecked>켜짐</Switch>
      </div>,
    );
    const { track } = parts("켜짐");
    const before = getComputedStyle(track).backgroundColor;
    // 카드 왼쪽 위 여백(padding)에 마우스를 올린다.
    await userEvent.hover(page.getByTestId("card"), { position: { x: 4, y: 4 } });
    await settle();
    expect(getComputedStyle(track).backgroundColor).toBe(before);
  });
});
