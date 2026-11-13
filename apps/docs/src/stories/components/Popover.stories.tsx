import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Field,
  IconButton,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
} from "@tide-design/components";
import { SettingsIcon } from "@tide-design/icons";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

// Popover 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언(열고 닫기, 포커스, 위치, motion)은 components의 `Popover.test.tsx`에 있다.
//
// 내용은 document.body로 portal된다. 열린 상태의 a11y를 검사하려고 story마다 play에서 트리거를 눌러 연다.
// play는 Docs 페이지에서 돌지 않으므로(storybook 10.6.5 `parameters.docs.story.autoplay` 기본 false) 문서에서는 닫혀 있다.
// 열려 있는 동안 바깥은 inert가 되므로 문서 예시에 defaultOpen을 두지 않는다.

const meta = {
  title: "Component/Popover",
  component: Popover,
  // 부분 Component의 props 표도 함께 보여 준다.
  subcomponents: { PopoverTrigger, PopoverContent },
  argTypes: {
    children: { control: false, table: { type: { summary: "ReactNode" } } },
    onOpenChange: { control: false },
  },
  args: { children: null },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 트리거 이름으로 트리거를 눌러 연다. 등장 전환(opacity 0에서 시작)이 끝날 때까지 기다린다. */
async function open(canvasElement: HTMLElement, name: string): Promise<void> {
  await userEvent.click(within(canvasElement).getByRole("button", { name }));
  const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog");
  await Promise.all(dialog.getAnimations().map((animation) => animation.finished));
  await expect(dialog).toBeVisible();
}

/** 기본: Button 모양 트리거와 짧은 설명·동작 */
export const Basic: Story = {
  name: "기본",
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline" />}>공유 범위</PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-3">
          <p>링크가 있는 사람은 누구나 볼 수 있습니다. 편집은 초대한 사람만 할 수 있습니다.</p>
          <div>
            <Button size="sm" variant="subtle">
              링크 복사
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "공유 범위");
  },
};

/** 아이콘만 있는 트리거. 트리거 이름(aria-label)이 내용의 이름이 된다. */
export const IconTrigger: Story = {
  name: "IconButton 트리거",
  render: () => (
    <Popover>
      <PopoverTrigger
        render={
          <IconButton aria-label="보기 설정" variant="ghost" color="neutral">
            <SettingsIcon />
          </IconButton>
        }
      />
      <PopoverContent className="flex flex-col gap-3">
        <Switch defaultChecked>미리보기 보이기</Switch>
        <Switch>읽은 항목 숨기기</Switch>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "보기 설정");
  },
};

/** 네 방향. 공간이 모자라면 반대쪽으로 뒤집힌다. */
export const Placement: Story = {
  name: "위치",
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <Popover key={placement}>
          <PopoverTrigger render={<Button variant="outline" size="sm" />}>
            {placement}
          </PopoverTrigger>
          <PopoverContent placement={placement}>{placement} 쪽에 뜹니다.</PopoverContent>
        </Popover>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "right");
  },
};

/** 제목을 두고 aria-labelledby로 이름을 잇는다. 안의 입력에 바로 포커스가 간다. */
export const WithForm: Story = {
  name: "제목과 입력",
  render: function WithForm() {
    const [name, setName] = useState("디자인 리뷰");
    const [open, setOpen] = useState(false);
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="outline" />}>이름: {name}</PopoverTrigger>
        <PopoverContent aria-labelledby="rename-title" className="w-72">
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const value = new FormData(event.currentTarget).get("name");
              if (typeof value === "string" && value) setName(value);
              setOpen(false);
            }}
          >
            <h2 id="rename-title" className="text-heading-xs">
              이름 바꾸기
            </h2>
            <Field label="새 이름">
              {/* oxlint-disable-next-line jsx-a11y/no-autofocus -- 사용자가 열자마자 입력하는 Popover다. */}
              <Input name="name" defaultValue={name} autoFocus />
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                color="neutral"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" size="sm">
                저장
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    );
  },
  play: async ({ canvasElement }) => {
    await open(canvasElement, "이름: 디자인 리뷰");
  },
};

/** Do: 트리거와 이어지는 짧은 설명이나 몇 개의 설정을 담는다. */
export const DoShortContent: Story = {
  name: "Do: 짧은 관련 내용",
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" color="neutral" size="sm" />}>
        요금 계산 방법
      </PopoverTrigger>
      <PopoverContent>사용한 저장 공간을 매일 재서 한 달 평균으로 청구합니다.</PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "요금 계산 방법");
  },
};

/** Don't: 동작 목록을 Popover에 버튼으로 늘어놓는다. 화살표 탐색이 있는 Menu를 쓴다. */
export const DontActionList: Story = {
  name: "Don't: 동작 목록",
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>더보기</PopoverTrigger>
      <PopoverContent className="flex flex-col p-1">
        {["이름 바꾸기", "복제", "보관", "삭제"].map((label) => (
          <Button key={label} variant="ghost" color="neutral" size="sm" className="justify-start">
            {label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "더보기");
  },
};
