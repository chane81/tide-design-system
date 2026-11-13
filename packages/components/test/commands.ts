// `userEvent.click`은 누르고 바로 떼서 `:active`를 붙잡을 수 없어 마우스를 직접 누른다.
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

/** 요소의 왼쪽 위 모서리(안쪽 4px)를 누른 채로 둔다. 가운데가 덮인 요소(Dialog 뒤의 막)에 쓴다. */
export const mouseDownAtCorner: BrowserCommand<[testId: string]> = async (context, testId) => {
  if (context.provider.name !== "playwright") {
    throw new Error(`playwright provider만 지원한다: ${context.provider.name}`);
  }
  const box = await context.iframe.getByTestId(testId).boundingBox();
  if (!box) throw new Error(`요소를 찾지 못했다: ${testId}`);
  await context.page.mouse.move(box.x + 4, box.y + 4);
  await context.page.mouse.down();
};

/** 마우스를 페이지 바깥(-1, -1)으로 뺀다. 테스트 iframe이 viewport 전체를 덮어 안쪽에는 빈 자리가 없다. */
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

/** 요소를 PNG(base64)로 찍는다. 브라우저 JS는 그려진 픽셀을 읽을 수 없어 이미지가 그려졌는지 화면으로 비교한다. */
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
