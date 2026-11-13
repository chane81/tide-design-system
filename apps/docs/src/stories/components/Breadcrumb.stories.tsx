import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  Typography,
} from "@tide-design/components";

const meta = {
  title: "Component/Breadcrumb",
  component: Breadcrumb,
  subcomponents: { BreadcrumbItem, BreadcrumbLink, BreadcrumbCurrent },
  argTypes: {
    children: { control: false, table: { type: { summary: "ReactNode" } } },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: 상위 페이지 링크 둘과 현재 페이지. 구분자는 Component가 붙인다. */
export const Basic: Story = {
  name: "기본",
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbItem>
        <BreadcrumbLink href="#home">홈</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="#settings">설정</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbCurrent>알림</BreadcrumbCurrent>
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};

/** Next.js: BreadcrumbLink에 render로 Next Link를 넘긴다. 문서에서는 `<a>`로 대신 보인다. */
export const WithRender: Story = {
  name: "render로 다른 링크 Component 쓰기",
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem>
        {/* Next.js에서는 render={<NextLink href="/docs" />} */}
        <BreadcrumbLink render={<a href="#docs" />}>문서</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbCurrent>설치</BreadcrumbCurrent>
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};

/** 긴 경로: 좁은 폭에서는 줄을 바꾼다. */
export const Wrapping: Story = {
  name: "좁은 폭에서 줄 바꿈",
  render: () => (
    <div className="max-w-64">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">홈</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#org">조직 설정</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#members">구성원과 권한</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbCurrent>초대 기록</BreadcrumbCurrent>
        </BreadcrumbItem>
      </Breadcrumb>
    </div>
  ),
};

/** Do: 페이지 제목 위에 두고, 마지막 항목은 현재 페이지(BreadcrumbCurrent)로 둔다. */
export const DoAboveTitle: Story = {
  name: "Do: 제목 위에 두고 현재 페이지로 끝낸다",
  render: () => (
    <div className="flex flex-col gap-2">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="#projects">프로젝트</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbCurrent>Tide</BreadcrumbCurrent>
        </BreadcrumbItem>
      </Breadcrumb>
      <Typography variant="heading-lg" level={2}>
        Tide
      </Typography>
    </div>
  ),
};

/** Don't: 구분자 문자를 직접 넣는다. 스크린리더가 「/」를 읽고, Component의 구분자와 겹친다. */
export const DontManualSeparator: Story = {
  name: "Don't: 구분자를 직접 넣는다",
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink href="#home">홈</BreadcrumbLink> /
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbCurrent>설정</BreadcrumbCurrent>
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};
