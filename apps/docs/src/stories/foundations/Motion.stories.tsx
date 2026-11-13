import type { Meta, StoryObj } from "@storybook/react-vite";

import { Motion as MotionBlock } from "../../components/Motion";

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
