import { afterEach, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Typography, type TypographyProps } from "./Typography";

// [variant, 요소, heading 단계]
const defaults: [NonNullable<TypographyProps["variant"]>, string, number | undefined][] = [
  ["display-lg", "H1", 1],
  ["display-md", "H1", 1],
  ["heading-xl", "H1", 1],
  ["heading-lg", "H2", 2],
  ["heading-md", "H3", 3],
  ["heading-sm", "H4", 4],
  ["heading-xs", "H5", 5],
  ["body-lg", "P", undefined],
  ["body-md", "P", undefined],
  ["body-sm", "P", undefined],
  ["caption", "P", undefined],
  ["label-lg", "SPAN", undefined],
  ["label-md", "SPAN", undefined],
  ["label-sm", "SPAN", undefined],
];

afterEach(() => {
  document.documentElement.style.fontSize = "";
});

describe("기본 요소", () => {
  test.each(defaults)("%s → %s", async (variant, tagName, level) => {
    await render(<Typography variant={variant}>텍스트</Typography>);
    const element = page.getByText("텍스트").element();
    expect(element.tagName).toBe(tagName);
    expect(element).toHaveClass(`text-${variant}`);
    if (level) {
      await expect
        .element(page.getByRole("heading", { level, name: "텍스트" }))
        .toBeInTheDocument();
    } else {
      expect(page.getByRole("heading").elements()).toHaveLength(0);
    }
  });

  test("variant를 주지 않으면 body-md 문단이다", async () => {
    await render(<Typography>본문</Typography>);
    const element = page.getByText("본문").element();
    expect(element.tagName).toBe("P");
    expect(element).toHaveClass("text-body-md");
  });
});

describe("level", () => {
  test("heading의 단계만 바꾸고 스타일은 그대로 둔다", async () => {
    await render(
      <Typography variant="heading-lg" level={3}>
        h2처럼 보이는 h3
      </Typography>,
    );
    const heading = page.getByRole("heading", { level: 3, name: "h2처럼 보이는 h3" });
    await expect.element(heading).toBeInTheDocument();
    expect(heading.element().tagName).toBe("H3");
    expect(heading.element()).toHaveClass("text-heading-lg");
  });

  test.each([1, 2, 3, 4, 5, 6] as const)("display도 level %i로 렌더된다", async (level) => {
    await render(
      <Typography variant="display-md" level={level}>
        큰 제목
      </Typography>,
    );
    await expect.element(page.getByRole("heading", { level, name: "큰 제목" })).toBeInTheDocument();
  });
});

describe("render", () => {
  test("다른 요소로 렌더하고 props, ref, className을 병합한다", async () => {
    let node: HTMLElement | null = null;
    let elementRef: HTMLElement | null = null;
    await render(
      <>
        <Typography
          variant="label-md"
          ref={(element) => {
            node = element;
          }}
          className="text-muted"
          data-from="typography"
          render={
            <label
              htmlFor="name"
              className="block"
              data-from="render"
              ref={(element) => {
                elementRef = element;
              }}
            />
          }
        >
          이름
        </Typography>
        <input id="name" />
      </>,
    );

    const label = page.getByText("이름").element();
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "name");
    expect(label).toHaveAttribute("data-from", "typography");
    // className: 기본 class → render 요소 class → 사용자 className
    expect(label.className).toBe("text-label-md block text-muted");
    expect(node).toBe(label);
    expect(elementRef).toBe(label);
    await expect.element(page.getByRole("textbox", { name: "이름" })).toBeInTheDocument();
  });

  test("heading 스타일도 render로 바꿀 수 있고, 사용자 className이 충돌하면 이긴다", async () => {
    await render(
      <Typography
        variant="heading-md"
        level={2}
        className="text-heading-sm"
        render={<div className="text-heading-xs" />}
      >
        제목 모양
      </Typography>,
    );
    const element = page.getByText("제목 모양").element();
    expect(element.tagName).toBe("DIV");
    expect(element.className).toBe("text-heading-sm");
    expect(page.getByRole("heading").elements()).toHaveLength(0);
  });

  test("이벤트 핸들러는 render 요소의 것 다음에 Typography의 것을 부른다", async () => {
    const calls: string[] = [];
    await render(
      <Typography
        variant="label-md"
        onClick={() => calls.push("typography")}
        render={<button type="button" onClick={() => calls.push("render")} />}
      >
        누르기
      </Typography>,
    );
    await page.getByRole("button", { name: "누르기" }).click();
    expect(calls).toEqual(["render", "typography"]);
  });

  test("children이 없으면 render 요소의 children을 쓴다", async () => {
    await render(<Typography variant="caption" render={<span>요소 안 글자</span>} />);
    expect(page.getByText("요소 안 글자").element().tagName).toBe("SPAN");
  });
});

describe("props", () => {
  test("ref와 나머지 props를 루트 요소에 넘기고 사용자 className이 이긴다", async () => {
    let node: HTMLElement | null = null;
    await render(
      <Typography
        variant="body-sm"
        id="intro"
        ref={(element) => {
          node = element;
        }}
        className="text-body-lg text-muted"
      >
        소개
      </Typography>,
    );
    const element = page.getByText("소개").element();
    expect(node).toBe(element);
    expect(element).toHaveAttribute("id", "intro");
    expect(element.className).toBe("text-body-lg text-muted");
  });
});

describe("계산된 스타일", () => {
  test("텍스트 스타일이 크기, 행간, 굵기를 정하고 자간은 0이다", async () => {
    await render(
      <>
        <Typography variant="heading-lg">제목</Typography>
        <Typography variant="label-sm">라벨</Typography>
      </>,
    );
    const heading = getComputedStyle(page.getByText("제목").element());
    expect([heading.fontSize, heading.lineHeight, heading.fontWeight]).toEqual([
      "32px",
      "40px",
      "700",
    ]);
    const label = getComputedStyle(page.getByText("라벨").element());
    expect([label.fontSize, label.lineHeight, label.fontWeight]).toEqual(["12px", "16px", "500"]);
    expect(["normal", "0px"]).toContain(label.letterSpacing);
  });

  test("브라우저 글자 크기를 키우면 함께 커진다(rem)", async () => {
    document.documentElement.style.fontSize = "20px";
    await render(<Typography variant="body-md">본문</Typography>);
    const style = getComputedStyle(page.getByText("본문").element());
    expect(style.fontSize).toBe("20px");
    expect(style.lineHeight).toBe("30px");
  });

  test("한글은 어절 단위로 줄을 바꾸고 긴 영문은 끊는다", async () => {
    await render(<Typography>어절 단위 줄바꿈</Typography>);
    const style = getComputedStyle(page.getByText("어절 단위 줄바꿈").element());
    expect(style.wordBreak).toBe("keep-all");
    expect(style.overflowWrap).toBe("break-word");
  });

  test("기본 글꼴은 Pretendard Variable 우선 스택이다", async () => {
    await render(<Typography>글꼴</Typography>);
    expect(getComputedStyle(page.getByText("글꼴").element()).fontFamily).toMatch(
      /^"Pretendard Variable", Pretendard, /,
    );
  });
});

// 타입 검사(tsc --noEmit)가 확인한다. 실행하지 않는다.
function typeChecks(): void {
  // @ts-expect-error 지원하지 않는 variant
  void (<Typography variant="heading-2xl" />);
  // @ts-expect-error heading·display가 아니면 level이 없다
  void (<Typography variant="body-md" level={2} />);
  // @ts-expect-error level은 1~6이다
  void (<Typography variant="heading-md" level={7} />);
}
void typeChecks;
