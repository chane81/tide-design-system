import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@tide-tds/components";
import { CopyIcon, InfoIcon, SettingsIcon } from "@tide-tds/icons";
import { expect, userEvent, waitFor, within } from "storybook/test";

// Tooltip 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언(hover·focus 열림, Esc, 설명 연결, motion)은 components의 `Tooltip.test.tsx`에 있다.
//
// 설명은 document.body로 portal된다. 열린 상태의 a11y를 검사하려고 story마다 play에서 트리거에 키보드 포커스를 줘서 연다.
// React Aria는 마지막 입력이 키보드일 때만 포커스로 연다(useTooltipTrigger, react-aria 3.53.1). 그래서 Tab을 누른 뒤
// 포커스한다. play는 Docs 페이지에서 돌지 않으므로(storybook 10.6.5 `parameters.docs.story.autoplay` 기본 false) 문서에서는 닫혀 있다.

const meta = {
  title: "Component/Tooltip",
  component: Tooltip,
  // 부분 Component의 props 표도 함께 보여 준다.
  subcomponents: { TooltipTrigger, TooltipContent },
  argTypes: {
    children: { control: false, table: { type: { summary: "ReactNode" } } },
    onOpenChange: { control: false },
  },
  args: { children: null },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 이름으로 찾은 트리거에 키보드 포커스를 줘서 연다. 설명은 바로 나타난다. */
async function open(canvasElement: HTMLElement, name: string): Promise<void> {
  const trigger = within(canvasElement.ownerDocument.body).getByRole("button", { name });
  // 수식 키(Shift 등)는 입력 방식을 바꾸지 않으므로 Tab을 누른다. 그 뒤 포커스를 트리거로 옮긴다.
  await userEvent.tab();
  trigger.focus();
  // Tab이 다른 트리거에 먼저 닿으면 그 Tooltip이 잠깐 남는다. 이 트리거가 가리키는 설명을 찾는다.
  const tooltip = await waitFor(() => {
    const id = trigger.getAttribute("aria-describedby");
    const element = id ? canvasElement.ownerDocument.getElementById(id) : null;
    if (!element) throw new Error(`${name}의 설명이 아직 없다`);
    return element;
  });
  await expect(tooltip).toHaveAttribute("role", "tooltip");
  await expect(tooltip).toBeVisible();
  await expect(trigger).toHaveAccessibleDescription(tooltip.textContent ?? "");
}

/** 기본: 아이콘만 있는 버튼에 동작을 설명한다. 이름은 aria-label, 설명은 Tooltip이다. */
export const Basic: Story = {
  name: "기본",
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger
        render={
          <IconButton aria-label="링크 복사" variant="ghost" color="neutral">
            <CopyIcon />
          </IconButton>
        }
      />
      <TooltipContent>공유 링크를 클립보드에 복사합니다</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "링크 복사");
  },
};

/** Button 트리거에 단축키를 알린다. */
export const ButtonTrigger: Story = {
  name: "Button 트리거",
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>저장</TooltipTrigger>
      <TooltipContent>Ctrl+S로도 저장합니다</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "저장");
  },
};

/** 네 방향. 기본은 위(`top`)이고 공간이 모자라면 반대쪽으로 뒤집힌다. */
export const Placement: Story = {
  name: "위치",
  render: () => (
    <div className="flex flex-wrap gap-3 p-8">
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <Tooltip key={placement}>
          <TooltipTrigger render={<Button variant="outline" size="sm" />}>
            {placement}
          </TooltipTrigger>
          <TooltipContent placement={placement}>{placement} 쪽 설명</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "bottom");
  },
};

/** Popover 안의 트리거. Tooltip은 `z-tooltip`이라 Popover 위에 그려지고, Esc는 Tooltip부터 닫는다. */
export const InPopover: Story = {
  name: "Popover 위",
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>보기 설정</PopoverTrigger>
      <PopoverContent className="flex items-center gap-2">
        <span>목록 밀도</span>
        <Tooltip>
          <TooltipTrigger
            render={
              <IconButton aria-label="밀도 설명" variant="ghost" color="neutral" size="sm">
                <InfoIcon />
              </IconButton>
            }
          />
          <TooltipContent>한 화면에 보이는 행 수를 바꿉니다</TooltipContent>
        </Tooltip>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "보기 설정" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog");
    await Promise.all(dialog.getAnimations().map((animation) => animation.finished));
    await open(canvasElement, "밀도 설명");
  },
};

/** Do: 아이콘 버튼의 동작을 짧은 한 줄로 설명한다. */
export const DoShortHint: Story = {
  name: "Do: 짧은 한 줄",
  render: () => (
    <Tooltip>
      <TooltipTrigger
        render={
          <IconButton aria-label="설정" variant="ghost" color="neutral">
            <SettingsIcon />
          </IconButton>
        }
      />
      <TooltipContent>알림·언어 설정</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "설정");
  },
};

/** Don't: 꼭 알아야 하는 내용이나 긴 안내를 Tooltip에만 둔다. 터치 기기에서는 보이지 않는다. 화면에 쓰거나 Popover를 쓴다. */
export const DontEssentialInfo: Story = {
  name: "Don't: 꼭 필요한 안내",
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button color="danger" />}>계정 삭제</TooltipTrigger>
      <TooltipContent>
        삭제하면 30일 뒤 모든 문서가 지워지고 되돌릴 수 없습니다. 팀 문서는 먼저 다른 사람에게
        넘기세요.
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "계정 삭제");
  },
};
