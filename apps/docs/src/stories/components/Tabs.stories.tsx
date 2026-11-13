import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, Button, Tab, TabList, TabPanel, Tabs } from "@tide-design/components";
import { BellIcon, LockIcon, UserIcon } from "@tide-design/icons";
import { useState, type ReactElement } from "react";
import { expect, userEvent, within } from "storybook/test";

// focus-ring 상태의 a11y도 보려고 story마다 play에서 Tab으로 고른 탭에 들어간다.

const meta = {
  title: "Component/Tabs",
  component: Tabs,
  subcomponents: { TabList, Tab, TabPanel },
  argTypes: {
    children: { control: false, table: { type: { summary: "ReactNode" } } },
    onValueChange: { control: false },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    activationMode: { control: "inline-radio", options: ["automatic", "manual"] },
  },
  args: { defaultValue: "overview" },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 캔버스 안 첫 탭 목록의 고른 탭에 Tab으로 들어가 키보드 포커스를 둔다. */
async function focusSelectedTab(canvasElement: HTMLElement): Promise<void> {
  const canvas = within(canvasElement);
  await userEvent.tab();
  const [selected] = canvas
    .getAllByRole("tab")
    .filter((tab) => tab.getAttribute("aria-selected") === "true");
  await expect(selected).toHaveFocus();
}

/** 프로젝트 화면의 패널 세 개. 예시마다 같은 내용을 쓴다. */
function ProjectPanels(): ReactElement {
  return (
    <>
      <TabPanel value="overview" className="pt-1 text-body-md">
        프로젝트 개요입니다. 이번 주 목표와 담당자를 봅니다.
      </TabPanel>
      <TabPanel value="activity" className="pt-1 text-body-md">
        최근 활동 기록입니다. 누가 무엇을 바꿨는지 시간 순서로 봅니다.
      </TabPanel>
      <TabPanel value="settings" className="pt-1 text-body-md">
        프로젝트 설정입니다. 이름과 공개 범위를 바꿉니다.
      </TabPanel>
    </>
  );
}

/** 기본: 가로 탭 목록과 패널. 화살표로 옮기면 바로 그 패널이 보인다. */
export const Basic: Story = {
  name: "기본",
  render: (args) => (
    <Tabs {...args}>
      <TabList aria-label="프로젝트 보기">
        <Tab value="overview">개요</Tab>
        <Tab value="activity">활동 기록</Tab>
        <Tab value="settings">설정</Tab>
      </TabList>
      <ProjectPanels />
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    await focusSelectedTab(canvasElement);
  },
};

/** 아이콘과 비활성 탭. 비활성 탭은 흐리게 보이고 고를 수 없으며 키보드 이동이 건너뛴다. */
export const IconsAndDisabled: Story = {
  name: "아이콘과 비활성 탭",
  render: () => (
    <Tabs defaultValue="account">
      <TabList aria-label="설정">
        <Tab value="account">
          <UserIcon />
          계정
        </Tab>
        <Tab value="security">
          <LockIcon />
          보안
        </Tab>
        <Tab value="notifications" disabled>
          <BellIcon />
          알림
        </Tab>
      </TabList>
      <TabPanel value="account" className="pt-1 text-body-md">
        이름과 이메일을 바꿉니다.
      </TabPanel>
      <TabPanel value="security" className="pt-1 text-body-md">
        비밀번호와 2단계 인증을 관리합니다.
      </TabPanel>
      <TabPanel value="notifications" className="pt-1 text-body-md">
        알림 설정입니다.
      </TabPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    await focusSelectedTab(canvasElement);
  },
};

/** 세로 탭 목록. ↓↑로 옮기고 탭 목록이 패널의 시작쪽에 선다. */
export const Vertical: Story = {
  name: "세로 탭",
  render: () => (
    <Tabs defaultValue="overview" orientation="vertical">
      <TabList aria-label="프로젝트 보기">
        <Tab value="overview">개요</Tab>
        <Tab value="activity">활동 기록</Tab>
        <Tab value="settings">설정</Tab>
      </TabList>
      <ProjectPanels />
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    await focusSelectedTab(canvasElement);
  },
};

/** 수동 활성화. 화살표는 포커스만 옮기고 Enter·Space로 고른다. 패널을 그리는 데 시간이 걸릴 때 쓴다. */
export const Manual: Story = {
  name: "수동 활성화",
  render: () => (
    <Tabs defaultValue="overview" activationMode="manual">
      <TabList aria-label="보고서">
        <Tab value="overview">요약</Tab>
        <Tab value="activity">월별 통계</Tab>
        <Tab value="settings">내보내기</Tab>
      </TabList>
      <ProjectPanels />
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    await focusSelectedTab(canvasElement);
    await userEvent.keyboard("{ArrowRight}");
  },
};

/** 제어: 고른 값을 앱 상태로 갖고, 패널 밖 버튼으로도 바꾼다. */
function ControlledExample(): ReactElement {
  const [value, setValue] = useState("overview");

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={value} onValueChange={setValue}>
        <TabList aria-label="프로젝트 보기">
          <Tab value="overview">개요</Tab>
          <Tab value="activity">활동 기록</Tab>
          <Tab value="settings">설정</Tab>
        </TabList>
        <ProjectPanels />
      </Tabs>
      <div className="flex items-center gap-2">
        <Badge>{value}</Badge>
        <Button size="sm" variant="outline" onClick={() => setValue("settings")}>
          설정으로 가기
        </Button>
      </div>
    </div>
  );
}

export const Controlled: Story = {
  name: "제어",
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    await focusSelectedTab(canvasElement);
  },
};

/** Do: 탭 이름은 짧은 명사로, 같은 수준의 내용끼리 나눈다. */
export const DoShortLabels: Story = {
  name: "Do: 짧은 이름",
  render: () => (
    <Tabs defaultValue="overview">
      <TabList aria-label="프로젝트 보기">
        <Tab value="overview">개요</Tab>
        <Tab value="activity">활동 기록</Tab>
        <Tab value="settings">설정</Tab>
      </TabList>
      <ProjectPanels />
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    await focusSelectedTab(canvasElement);
  },
};

/** Don't: 차례대로 거쳐야 하는 단계를 탭으로 나눈다. 단계는 한 화면씩 진행하는 흐름으로 둔다. */
export const DontSteps: Story = {
  name: "Don't: 단계 진행",
  render: () => (
    <Tabs defaultValue="overview">
      <TabList aria-label="가입 단계">
        <Tab value="overview">1. 약관 동의</Tab>
        <Tab value="activity">2. 정보 입력</Tab>
        <Tab value="settings">3. 완료</Tab>
      </TabList>
      <ProjectPanels />
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    await focusSelectedTab(canvasElement);
  },
};
