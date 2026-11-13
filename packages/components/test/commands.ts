// browser project의 사용자 정의 명령(vitest 5.1.0 docs/api/browser/commands.md).
// 명령은 Node에서 돌고 Playwright `page`·`iframe`(FrameLocator)을 받는다.
// `userEvent.click`은 누르고 바로 떼므로 `:active` 상태를 붙잡아 둘 수 없다. 그래서 마우스를 직접 누른다.
import type { BrowserCommand } from "vitest/node";

/** data-testid로 찾은 요소의 가운데에서 마우스 왼쪽 버튼을 누른 채로 둔다. */
export const mouseDownOn: BrowserCommand<[testId: string]> = async (context, testId) => {
  if (context.provider.name !== "playwright") {
    throw new Error(`playwright provider만 지원한다: ${context.provider.name}`);
  }
  const box = await context.iframe.getByTestId(testId).boundingBox();
  if (!box) throw new Error(`요소를 찾지 못했다: ${testId}`);
  await context.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await context.page.mouse.down();
};

/**
 * data-testid로 찾은 요소의 왼쪽 위 모서리(안쪽 4px)에서 마우스 왼쪽 버튼을 누른 채로 둔다.
 * 가운데가 다른 요소로 덮인 요소(Dialog 뒤의 막)를 누를 때 쓴다(티켓 30).
 */
export const mouseDownAtCorner: BrowserCommand<[testId: string]> = async (context, testId) => {
  if (context.provider.name !== "playwright") {
    throw new Error(`playwright provider만 지원한다: ${context.provider.name}`);
  }
  const box = await context.iframe.getByTestId(testId).boundingBox();
  if (!box) throw new Error(`요소를 찾지 못했다: ${testId}`);
  await context.page.mouse.move(box.x + 4, box.y + 4);
  await context.page.mouse.down();
};

/**
 * 마우스를 페이지 바깥(-1, -1)으로 뺀다. 테스트 iframe이 viewport 전체(0,0 기준)를 덮어 안쪽에는 빈 자리가 없다.
 * 마우스가 앞 테스트 자리에 멈춰 있으면, 새로 그린 요소가 그 아래에 올 때 Chromium이 약 0.1초 뒤 가짜 mouse move로
 * pointerenter를 보낸다(2026-11-11 실험). 바깥으로 빼면 포인터가 문서를 떠나서 다음 hover 전까지 아무 요소에도 들어가지 않는다.
 */
export const mouseLeavePage: BrowserCommand<[]> = async (context) => {
  if (context.provider.name !== "playwright") {
    throw new Error(`playwright provider만 지원한다: ${context.provider.name}`);
  }
  await context.page.mouse.move(-1, -1);
};

/** 눌러 둔 마우스 버튼을 뗀다. */
export const mouseUp: BrowserCommand<[]> = async (context) => {
  if (context.provider.name !== "playwright") {
    throw new Error(`playwright provider만 지원한다: ${context.provider.name}`);
  }
  await context.page.mouse.up();
};

/**
 * data-testid로 찾은 요소를 PNG로 찍어 base64로 돌려준다(Playwright `Locator.screenshot`).
 * 브라우저 JS는 그려진 픽셀을 읽을 수 없어서, 이미지가 실제로 그려졌는지는 화면을 찍어 비교한다(Avatar fallback 단언용).
 */
export const screenshotTestId: BrowserCommand<[testId: string]> = async (context, testId) => {
  if (context.provider.name !== "playwright") {
    throw new Error(`playwright provider만 지원한다: ${context.provider.name}`);
  }
  const buffer = await context.iframe.getByTestId(testId).screenshot({ animations: "disabled" });

  return buffer.toString("base64");
};

declare module "vitest/browser" {
  interface BrowserCommands {
    mouseDownOn: (testId: string) => Promise<void>;
    mouseDownAtCorner: (testId: string) => Promise<void>;
    mouseLeavePage: () => Promise<void>;
    mouseUp: () => Promise<void>;
    screenshotTestId: (testId: string) => Promise<string>;
  }
}
