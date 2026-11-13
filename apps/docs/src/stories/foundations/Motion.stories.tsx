import type { Meta, StoryObj } from "@storybook/react-vite";

import { Motion as MotionBlock } from "../../components/Motion.tsx";

// motion Foundation 문서의 Token 블록. MDX에서 Canvas로 보여 주고, storybook project가 렌더·a11y를 검사한다.
const meta = {
  title: "Foundation/움직임",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** duration 2단계와 easing 재생 */
export const Motion: Story = {
  name: "motion",
  render: () => <MotionBlock />,
};
