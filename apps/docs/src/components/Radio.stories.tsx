import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, Radio, RadioGroup } from "@tide-tds/components";
import { useState, type ReactElement } from "react";

// Radio 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언은 components의 `Radio.test.tsx`에 있다.
// Props 표는 RadioGroup을 그린다. Radio 자신의 props는 MDX에 따로 ArgTypes로 둔다.

const sizes = ["sm", "md"] as const;
const roles = ["primary", "neutral", "success", "warning", "danger", "info"] as const;

const meta = {
  title: "Component/Radio",
  component: RadioGroup,
  args: {
    defaultValue: "normal",
    orientation: "vertical",
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
      table: {
        type: { summary: '"vertical" | "horizontal"' },
        defaultValue: { summary: '"vertical"' },
      },
    },
    name: { control: "text", table: { defaultValue: { summary: "자동 생성" } } },
    value: { control: false },
    defaultValue: { control: "text" },
    onValueChange: { control: false, table: { type: { summary: "(value: string) => void" } } },
    invalid: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    required: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  render: (args) => (
    <Field label="배송 방법" group>
      <RadioGroup {...args}>
        <Radio value="normal">일반 배송</Radio>
        <Radio value="fast">빠른 배송</Radio>
        <Radio value="pickup">방문 수령</Radio>
      </RadioGroup>
    </Field>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: Field group 안의 RadioGroup */
export const Basic: Story = {
  name: "기본",
};

/** size 2개. 누르는 영역은 둘 다 24×24px이다. */
export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-col gap-4">
      {sizes.map((size) => (
        <RadioGroup key={size} aria-label={`${size} 라디오`} defaultValue="a">
          <Radio value="a" size={size}>{`${size} 첫째`}</Radio>
          <Radio value="b" size={size}>{`${size} 둘째`}</Radio>
        </RadioGroup>
      ))}
    </div>
  ),
};

/** 선택한 원 색은 Role로 고른다. */
export const Colors: Story = {
  name: "색",
  render: () => (
    <RadioGroup aria-label="색" orientation="horizontal" defaultValue="primary">
      {roles.map((color) => (
        <Radio key={color} value={color} color={color}>
          {color}
        </Radio>
      ))}
    </RadioGroup>
  ),
};

/** 가로로 늘어놓는다. 화살표 키는 방향과 상관없이 동작한다. */
export const Horizontal: Story = {
  name: "가로 묶음",
  args: { orientation: "horizontal" },
};

function ControlledExample(): ReactElement {
  const [value, setValue] = useState("fast");
  return (
    <div className="flex flex-col gap-2">
      <Field label="배송 방법" group>
        <RadioGroup value={value} onValueChange={setValue}>
          <Radio value="normal">일반 배송</Radio>
          <Radio value="fast">빠른 배송</Radio>
        </RadioGroup>
      </Field>
      <p className="text-body-sm text-muted">{`선택: ${value}`}</p>
    </div>
  );
}

/** 제어: value와 onValueChange */
export const Controlled: Story = {
  name: "제어",
  render: () => <ControlledExample />,
};

/** 오류·필수: Field의 error·required가 묶음과 각 Radio에 연결된다. */
export const Invalid: Story = {
  name: "오류",
  render: () => (
    <Field label="결제 수단" error="결제 수단을 고르세요." required group>
      <RadioGroup name="payment">
        <Radio value="card">카드</Radio>
        <Radio value="bank">계좌 이체</Radio>
      </RadioGroup>
    </Field>
  ),
};

/** 비활성: 묶음 전체 또는 항목 하나 */
export const Disabled: Story = {
  name: "비활성",
  render: () => (
    <Field label="배송 방법" group>
      <RadioGroup defaultValue="normal">
        <Radio value="normal">일반 배송</Radio>
        <Radio value="fast" disabled>
          빠른 배송(품절)
        </Radio>
      </RadioGroup>
    </Field>
  ),
};

/** Do: 기본값을 하나 골라 둔다. */
export const DoDefault: Story = {
  name: "Do: 기본값을 골라 둔다",
};

/** Don't: 선택지가 하나뿐인데 Radio를 쓴다. 켜고 끄는 값은 Checkbox를 쓴다. */
export const DontSingleOption: Story = {
  name: "Don't: 선택지 하나",
  render: () => (
    <Field label="약관" group>
      <RadioGroup>
        <Radio value="agree">동의합니다</Radio>
      </RadioGroup>
    </Field>
  ),
};
