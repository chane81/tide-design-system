import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { VisuallyHidden } from "./VisuallyHidden.tsx";

test("화면에는 보이지 않지만 접근 가능한 이름이 된다", async () => {
  await render(
    <button type="button">
      <VisuallyHidden>닫기</VisuallyHidden>
      <span aria-hidden="true">×</span>
    </button>,
  );

  await expect.element(page.getByRole("button", { name: "닫기" })).toBeInTheDocument();

  const text = page.getByText("닫기").element();
  const box = text.getBoundingClientRect();
  expect(getComputedStyle(text).position).toBe("absolute");
  expect(box.width).toBeLessThanOrEqual(1);
  expect(box.height).toBeLessThanOrEqual(1);
});

test("ref와 나머지 props를 루트 요소에 넘긴다", async () => {
  let node: HTMLSpanElement | null = null;
  await render(
    <VisuallyHidden
      ref={(element) => {
        node = element;
      }}
      id="hidden-label"
    >
      설명
    </VisuallyHidden>,
  );

  expect(node).toBeInstanceOf(HTMLSpanElement);
  expect(node).toHaveAttribute("id", "hidden-label");
});
