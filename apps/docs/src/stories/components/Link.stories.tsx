import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "@tide-design/components";

// Link 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언은 components의 `Link.test.tsx`에 있다.

const colors = ["neutral", "primary", "success", "warning", "danger", "info"] as const;

const union = (values: readonly string[]): string =>
  values.map((value) => `"${value}"`).join(" | ");

const meta = {
  title: "Component/Link",
  component: Link,
  args: {
    href: "#install",
    children: "설치 안내",
    color: "primary",
  },
  argTypes: {
    color: {
      control: "select",
      options: colors,
      table: {
        type: { summary: "Role", detail: `${union(colors)} | 앱이 더한 Role` },
        defaultValue: { summary: '"primary"' },
      },
    },
    render: { control: false, table: { type: { summary: "ReactElement" } } },
  },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: primary, 문장 안 */
export const Basic: Story = {
  name: "기본",
  // 문장 안에서 쓰는 Component라 예시를 본문 텍스트 안에 둔다.
  render: (args) => (
    <p className="text-body-md text-default">
      처음이라면 <Link {...args} /> 문서부터 봅니다.
    </p>
  ),
};

/** Role 6개 */
export const Colors: Story = {
  name: "색",
  render: (args) => (
    <div className="flex flex-wrap gap-4 text-body-md">
      {colors.map((color) => (
        <Link key={color} {...args} color={color}>
          {color} 링크
        </Link>
      ))}
    </div>
  ),
};

/** 주변 텍스트의 크기와 굵기를 따른다. */
export const InheritText: Story = {
  name: "글자 크기 따르기",
  render: (args) => (
    <div className="flex flex-col gap-2">
      <p className="text-heading-sm text-default">
        <Link {...args}>제목 안 링크</Link>
      </p>
      <p className="text-body-sm text-muted">
        보조 설명 안 <Link {...args}>링크</Link>
      </p>
    </div>
  ),
};

/** Next.js에서는 `render={<NextLink href="/docs" />}`로 씁니다. 여기서는 `<a>`로 보여 줍니다. */
export const AsNextLink: Story = {
  name: "Next Link로 렌더",
  args: { render: <a href="#docs" />, children: "시작하기" },
};

/** 새 탭으로 열 때는 텍스트로 알린다. */
export const External: Story = {
  name: "새 탭으로 열기",
  args: {
    href: "https://www.w3.org/TR/WCAG22/",
    target: "_blank",
    rel: "noreferrer",
    children: "WCAG 2.2(새 탭)",
  },
};

/** Do: 어디로 가는지 링크 텍스트에 적는다. */
export const DoDescriptive: Story = {
  name: "Do: 어디로 가는지 적는다",
  render: (args) => (
    <p className="text-body-md text-default">
      <Link {...args}>설치 안내</Link>를 따라 패키지를 설치합니다.
    </p>
  ),
};

/** Don't: 「여기」처럼 뜻 없는 텍스트를 쓴다. 링크 목록만 듣는 사용자는 어디로 가는지 모른다. */
export const DontHere: Story = {
  name: "Don't: 「여기」라고 쓴다",
  render: (args) => (
    <p className="text-body-md text-default">
      패키지를 설치하려면 <Link {...args}>여기</Link>를 누릅니다.
    </p>
  ),
};

/** Don't: 동작을 링크로 둔다. 저장·삭제처럼 페이지를 옮기지 않으면 Button을 쓴다. */
export const DontAction: Story = {
  name: "Don't: 동작을 링크로 둔다",
  render: () => (
    <p className="text-body-md text-default">
      <Link href="#save">변경 사항 저장</Link>
    </p>
  ),
};
