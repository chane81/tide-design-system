import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  IconButton,
  Menu,
  MenuContent,
  MenuItem,
  MenuSection,
  MenuTrigger,
} from "@tide-design/components";
import {
  ArchiveIcon,
  ArrowUpDownIcon,
  CopyIcon,
  DownloadIcon,
  EllipsisIcon,
  PencilIcon,
  TrashIcon,
} from "@tide-design/icons";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

// Menu 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언(키보드 탐색, 실행, highlight, motion)은 components의 `Menu.test.tsx`에 있다.
//
// 목록은 document.body로 portal된다. 열린 상태(키보드 위치 highlight 포함)의 a11y를 검사하려고 story마다 play에서
// 트리거에 포커스하고 Enter로 연다. play는 Docs 페이지에서 돌지 않으므로 문서에서는 닫혀 있다.

const meta = {
  title: "Component/Menu",
  component: Menu,
  // 부분 Component의 props 표도 함께 보여 준다.
  subcomponents: { MenuTrigger, MenuContent, MenuItem, MenuSection },
  argTypes: {
    children: { control: false, table: { type: { summary: "ReactNode" } } },
    onOpenChange: { control: false },
  },
  args: { children: null },
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 트리거 이름으로 트리거에 포커스하고 Enter로 연다. 첫 항목이 키보드 위치(highlight)가 된다. */
async function open(canvasElement: HTMLElement, name: string): Promise<void> {
  const body = within(canvasElement.ownerDocument.body);
  // 키보드 입력 방식으로 바꾸려고 Tab을 누른 뒤 트리거로 포커스를 옮긴다.
  await userEvent.tab();
  within(canvasElement).getByRole("button", { name }).focus();
  await userEvent.keyboard("{Enter}");
  const menu = await body.findByRole("menu");
  await expect(menu).toBeVisible();
  await expect(menu.querySelector("[data-highlighted]")).not.toBeNull();
}

/** 기본: Button 모양 트리거와 아이콘이 있는 동작 항목 */
export const Basic: Story = {
  name: "기본",
  render: (args) => (
    <Menu {...args}>
      <MenuTrigger render={<Button variant="outline" />}>문서 동작</MenuTrigger>
      <MenuContent>
        <MenuItem>
          <PencilIcon />
          이름 바꾸기
        </MenuItem>
        <MenuItem>
          <CopyIcon />
          복제
        </MenuItem>
        <MenuItem>
          <DownloadIcon />
          내려받기
        </MenuItem>
        <MenuItem>
          <TrashIcon />
          삭제
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "문서 동작");
  },
};

/** 아이콘만 있는 트리거. 트리거 이름(aria-label)이 목록의 이름이 된다. */
export const IconTrigger: Story = {
  name: "IconButton 트리거",
  render: () => (
    <Menu>
      <MenuTrigger
        render={
          <IconButton aria-label="더보기" variant="ghost" color="neutral">
            <EllipsisIcon />
          </IconButton>
        }
      />
      <MenuContent>
        <MenuItem>링크 복사</MenuItem>
        <MenuItem>새 탭에서 열기</MenuItem>
        <MenuItem>신고</MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "더보기");
  },
};

/** 묶음과 비활성 항목. 묶음 사이에 구분선이 그려지고, 비활성 항목은 키보드 위치가 건너뛴다. */
export const Sections: Story = {
  name: "묶음과 비활성 항목",
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>보기</MenuTrigger>
      <MenuContent>
        <MenuSection heading="정렬">
          <MenuItem>이름순</MenuItem>
          <MenuItem>수정한 날짜순</MenuItem>
          <MenuItem disabled>크기순</MenuItem>
        </MenuSection>
        <MenuSection heading="보관">
          <MenuItem>
            <ArchiveIcon />
            보관함으로 옮기기
          </MenuItem>
        </MenuSection>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "보기");
  },
};

/** 실행 결과를 화면에 보이고, 위쪽(`top start`)에 띄운다. */
export const Actions: Story = {
  name: "실행과 위치",
  render: function Actions() {
    const [last, setLast] = useState("없음");

    return (
      <div className="flex flex-col items-start gap-3 pt-48">
        <Menu>
          <MenuTrigger render={<Button variant="subtle" />}>
            <ArrowUpDownIcon />
            정렬 바꾸기
          </MenuTrigger>
          <MenuContent placement="top start">
            {["최신순", "오래된순", "이름순"].map((label) => (
              <MenuItem key={label} onClick={() => setLast(label)}>
                {label}
              </MenuItem>
            ))}
          </MenuContent>
        </Menu>
        <output className="text-body-sm text-muted">마지막 실행: {last}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await open(canvasElement, "정렬 바꾸기");
  },
};

/** Do: 지금 대상에 할 수 있는 동작을 짧은 동사로 둔다. */
export const DoActions: Story = {
  name: "Do: 동작 목록",
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" color="neutral" />}>댓글 동작</MenuTrigger>
      <MenuContent>
        <MenuItem>수정</MenuItem>
        <MenuItem>링크 복사</MenuItem>
        <MenuItem>삭제</MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "댓글 동작");
  },
};

/** Don't: 폼 값 하나를 고르는 데 Menu를 쓴다. 고른 값이 보이고 폼에 들어가는 Select를 쓴다. */
export const DontSelectValue: Story = {
  name: "Don't: 값 고르기",
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" color="neutral" />}>국가: 한국</MenuTrigger>
      <MenuContent>
        <MenuItem>한국</MenuItem>
        <MenuItem>일본</MenuItem>
        <MenuItem>미국</MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "국가: 한국");
  },
};
