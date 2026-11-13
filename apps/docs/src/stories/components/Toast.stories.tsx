import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ToastQueue, ToastRegion, type ToastOptions } from "@tide-design/components";
import { useState, type ReactElement } from "react";
import { expect, userEvent, within } from "storybook/test";

// 뜬 상태의 a11y를 보려고 story마다 play에서 띄운다(play는 Docs 페이지에서 돌지 않는다).
// story마다 큐를 새로 만든다.

const meta = {
  title: "Component/Toast",
  component: ToastRegion,
  argTypes: {
    queue: { control: false, table: { type: { summary: "ToastQueue" } } },
    "aria-label": {
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "「N개 알림.」(locale)" } },
    },
  },
  args: { queue: new ToastQueue() },
} satisfies Meta<typeof ToastRegion>;

export default meta;

type Story = StoryObj<typeof meta>;

interface DemoProps {
  /** 버튼 하나와 그 버튼이 띄울 Toast들 */
  readonly buttons: readonly { label: string; toasts: readonly ToastOptions[] }[];
  readonly maxVisible?: number;
}

/** 버튼을 누르면 Toast를 띄우는 예시. 큐는 이 예시 안에서만 쓴다. */
function Demo({ buttons, maxVisible }: DemoProps): ReactElement {
  const [queue] = useState(() => new ToastQueue({ maxVisible }));

  return (
    <div className="flex flex-wrap gap-3">
      {buttons.map(({ label, toasts }) => (
        <Button
          key={label}
          variant="outline"
          onClick={() => {
            for (const toast of toasts) queue.add(toast);
          }}
        >
          {label}
        </Button>
      ))}
      <ToastRegion queue={queue} />
    </div>
  );
}

/** 버튼 이름으로 버튼을 눌러 Toast를 띄운다. 등장 전환이 끝날 때까지 기다린다. */
async function show(canvasElement: HTMLElement, name: string, count = 1): Promise<void> {
  await userEvent.click(within(canvasElement).getByRole("button", { name }));
  const body = within(canvasElement.ownerDocument.body);
  const toasts = await body.findAllByRole("alertdialog");
  await expect(toasts).toHaveLength(count);
  await Promise.all(
    toasts.flatMap((toast) => toast.getAnimations().map((animation) => animation.finished)),
  );
  for (const toast of toasts) await expect(toast).toBeVisible();
}

/** 기본: 결과를 알리고 5초 뒤 스스로 닫힌다. 마우스를 올리거나 포커스가 있으면 멈춘다. */
export const Basic: Story = {
  name: "기본",
  render: () => (
    <Demo
      buttons={[
        {
          label: "저장",
          toasts: [
            {
              title: "저장했습니다",
              description: "변경 사항이 모든 기기에 반영되었습니다.",
              color: "success",
            },
          ],
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    await show(canvasElement, "저장");
  },
};

/** 상태: info(기본)·success·warning은 5초 뒤 닫히고, danger(오류)는 닫기 버튼을 누를 때까지 남는다. */
export const States: Story = {
  name: "상태",
  render: () => (
    <Demo
      buttons={[
        {
          label: "상태 4개 띄우기",
          toasts: [
            { title: "새 버전이 있습니다", color: "info" },
            { title: "업로드했습니다", color: "success" },
            { title: "저장 공간이 부족합니다", color: "warning" },
            {
              title: "결제하지 못했습니다",
              description: "카드 유효 기간이 지났습니다.",
              color: "danger",
            },
          ],
        },
      ]}
      maxVisible={4}
    />
  ),
  play: async ({ canvasElement }) => {
    await show(canvasElement, "상태 4개 띄우기", 4);
  },
};

/** 액션: 되돌리기처럼 바로 할 수 있는 동작을 하나 둔다. 액션이 있으면 자동으로 닫히지 않는다. */
export const WithAction: Story = {
  name: "액션",
  render: () => (
    <Demo
      buttons={[
        {
          label: "파일 삭제",
          toasts: [
            {
              title: "파일을 휴지통으로 옮겼습니다",
              description: "「디자인 리뷰.pdf」",
              color: "neutral",
              action: { label: "되돌리기" },
            },
          ],
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    await show(canvasElement, "파일 삭제");
  },
};

/** 큐: 한 번에 3개(maxVisible 기본)까지 보이고, 나머지는 앞의 것이 닫힐 때까지 기다린다. 새 Toast가 아래에 온다. */
export const Queue: Story = {
  name: "큐",
  render: () => (
    <Demo
      buttons={[
        {
          label: "4개 띄우기",
          toasts: [
            { title: "1번째 알림" },
            { title: "2번째 알림" },
            { title: "3번째 알림" },
            { title: "4번째 알림" },
          ],
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    await show(canvasElement, "4개 띄우기", 3);
  },
};

/** Do: 끝난 동작의 결과를 짧게 알리고, 되돌릴 수 있으면 액션을 하나 둔다. */
export const DoShortResult: Story = {
  name: "Do: 결과를 짧게 알린다",
  render: () => (
    <Demo
      buttons={[
        {
          label: "보관",
          toasts: [{ title: "대화를 보관했습니다", action: { label: "되돌리기" } }],
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    await show(canvasElement, "보관");
  },
};

/** Don't: 확인을 받아야 하는 질문을 Toast로 묻는다. 놓치기 쉽고 흐름을 막지 않는다. AlertDialog를 쓴다. */
export const DontAskConfirmation: Story = {
  name: "Don't: Toast로 확인을 묻는다",
  render: () => (
    <Demo
      buttons={[
        {
          label: "프로젝트 삭제",
          toasts: [
            {
              title: "프로젝트를 삭제할까요?",
              description: "되돌릴 수 없습니다.",
              color: "danger",
              action: { label: "삭제" },
            },
          ],
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    await show(canvasElement, "프로젝트 삭제");
  },
};
