import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";
import { Avatar, Skeleton } from "@tide-tds/components";

// Skeleton 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언(숨김, 깜빡임 정지)은 components의 `Skeleton.test.tsx`에 있다.

// Storybook의 Meta 타입은 variant에 따라 size가 갈리는 union props를 풀지 못한다(never가 된다).
// story에서는 평평한 args 타입을 쓴다. 실제 타입 제약은 components의 `Skeleton.test.tsx`가 단언한다.
interface SkeletonStoryArgs {
  variant?: "text" | "rect" | "circle";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const meta = {
  title: "Component/Skeleton",
  // args의 variant·size 조합은 story가 맞게 준다(text·rect에 size를 주어도 Skeleton은 무시한다).
  component: Skeleton as ComponentType<SkeletonStoryArgs>,
  args: {
    variant: "text",
  },
  // react-docgen이 union props를 풀지 못한다. 선택지와 타입을 직접 적는다.
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["text", "rect", "circle"],
      table: {
        type: { summary: '"text" | "rect" | "circle"' },
        defaultValue: { summary: '"text"' },
      },
    },
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg"],
      description: "`circle`에만 있다. Avatar size와 같다.",
      table: {
        type: { summary: '"xs" | "sm" | "md" | "lg"' },
        defaultValue: { summary: '"md"' },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<SkeletonStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: 글 한 줄 */
export const Basic: Story = {
  name: "기본",
};

/** 모양 3가지 */
export const Variants: Story = {
  name: "variant",
  render: () => (
    <div className="flex flex-col gap-4">
      <Skeleton variant="text" />
      <Skeleton variant="rect" className="h-24" />
      <Skeleton variant="circle" />
    </div>
  ),
};

/** circle size 4개. Avatar와 같은 크기다. */
export const CircleSizes: Story = {
  name: "circle size(Avatar와 같다)",
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {(["xs", "sm", "md", "lg"] as const).map((size) => (
          <Skeleton key={size} variant="circle" size={size} />
        ))}
      </div>
      <div className="flex items-center gap-3">
        {(["xs", "sm", "md", "lg"] as const).map((size) => (
          <Avatar key={size} alt="" size={size} />
        ))}
      </div>
    </div>
  ),
};

/** 글 여러 줄: 줄 높이는 글자 크기(1em)를 따르고 너비는 className으로 준다. */
export const Paragraph: Story = {
  name: "글 여러 줄",
  render: () => (
    <div className="flex flex-col gap-2 text-body-md">
      <Skeleton className="w-1/2 text-heading-sm" />
      <Skeleton />
      <Skeleton />
      <Skeleton className="w-2/3" />
    </div>
  ),
};

/** Do: 나중에 올 내용과 같은 모양·크기로 둔다. 영역에 aria-busy를 붙인다. */
export const DoMatchLayout: Story = {
  name: "Do: 나중에 올 내용과 같은 모양으로 둔다",
  render: () => (
    <section aria-label="댓글" aria-busy="true" className="flex items-start gap-3">
      <Skeleton variant="circle" size="sm" />
      <div className="flex flex-1 flex-col gap-2 text-body-md">
        <Skeleton className="w-24" />
        <Skeleton />
        <Skeleton className="w-3/4" />
      </div>
    </section>
  ),
};

/** Don't: Skeleton 안에 글을 넣거나 Skeleton만으로 불러오는 중임을 알린다. */
export const DontOnlySkeleton: Story = {
  name: "Don't: Skeleton만으로 불러오는 중임을 알린다",
  render: () => (
    <div className="flex flex-col gap-2">
      <Skeleton variant="rect" className="h-32" />
    </div>
  ),
};
