import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox, CheckboxGroup, Field } from "@tide-design/components";
import { useState, type ReactElement } from "react";

// Checkbox 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언은 components의 `Checkbox.test.tsx`에 있다.

const sizes = ["sm", "md"] as const;
const roles = ["primary", "neutral", "success", "warning", "danger", "info"] as const;

const meta = {
  title: "Component/Checkbox",
  component: Checkbox,
  args: {
    children: "약관에 동의합니다",
    size: "md",
    color: "primary",
  },
  // react-docgen이 별칭 타입을 풀지 못한다. 선택지와 타입을 직접 적는다.
  argTypes: {
    children: { control: "text", table: { type: { summary: "ReactNode" } } },
    size: {
      control: "inline-radio",
      options: sizes,
      table: { type: { summary: '"sm" | "md"' }, defaultValue: { summary: '"md"' } },
    },
    color: {
      control: "select",
      options: roles,
      table: { type: { summary: "Role" }, defaultValue: { summary: '"primary"' } },
    },
    indeterminate: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    invalid: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    defaultChecked: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: md, primary */
export const Basic: Story = {
  name: "기본",
};

/** size 2개. 누르는 영역은 둘 다 24×24px이다. */
export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-col gap-2">
      {sizes.map((size) => (
        <Checkbox key={size} size={size} defaultChecked>
          {`${size} 체크박스`}
        </Checkbox>
      ))}
    </div>
  ),
};

/** 체크한 상자 색은 Role로 고른다. */
export const Colors: Story = {
  name: "색",
  render: () => (
    <div className="flex flex-wrap gap-4">
      {roles.map((color) => (
        <Checkbox key={color} color={color} defaultChecked>
          {color}
        </Checkbox>
      ))}
    </div>
  ),
};

/** 전체 선택: 일부만 고르면 indeterminate가 된다. */
function SelectAllExample(): ReactElement {
  const labels = ["이메일", "문자", "앱 푸시"];
  const [items, setItems] = useState([true, false, false]);
  const all = items.every(Boolean);
  const some = items.some(Boolean);

  return (
    <div className="flex flex-col gap-2">
      <Checkbox
        checked={all}
        indeterminate={some && !all}
        onChange={(event) => setItems(items.map(() => event.target.checked))}
      >
        전체 선택
      </Checkbox>
      <div className="flex flex-col gap-2 ps-6">
        {labels.map((label, index) => (
          <Checkbox
            key={label}
            checked={items[index]}
            onChange={(event) =>
              setItems(items.map((item, i) => (i === index ? event.target.checked : item)))
            }
          >
            {label}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}

export const Indeterminate: Story = {
  name: "indeterminate",
  render: () => <SelectAllExample />,
};

/** Field로 감싸 이름·설명·오류를 붙인다. */
export const Group: Story = {
  name: "묶음",
  render: () => (
    <div className="max-w-sm">
      <Field label="알림 받을 곳" description="하나 이상 고릅니다." group>
        <CheckboxGroup>
          <Checkbox name="notify" value="email" defaultChecked>
            이메일
          </Checkbox>
          <Checkbox name="notify" value="sms">
            문자
          </Checkbox>
          <Checkbox name="notify" value="push">
            앱 푸시
          </Checkbox>
        </CheckboxGroup>
      </Field>
    </div>
  ),
};

/** 가로로 늘어놓는다. */
export const Horizontal: Story = {
  name: "가로 묶음",
  render: () => (
    <Field label="요일" group>
      <CheckboxGroup orientation="horizontal">
        {["월", "화", "수", "목", "금"].map((day) => (
          <Checkbox key={day} name="day" value={day}>
            {day}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </Field>
  ),
};

/** 오류: Field의 error가 묶음에 연결되고 각 Checkbox 경계가 danger 색이 된다. */
export const Invalid: Story = {
  name: "오류",
  render: () => (
    <div className="max-w-sm">
      <Field label="관심사" error="하나 이상 고르세요." group>
        <CheckboxGroup>
          <Checkbox name="topic" value="design">
            디자인
          </Checkbox>
          <Checkbox name="topic" value="dev">
            개발
          </Checkbox>
        </CheckboxGroup>
      </Field>
    </div>
  ),
};

/** 비활성 */
export const Disabled: Story = {
  name: "비활성",
  render: () => (
    <div className="flex flex-col gap-2">
      <Checkbox disabled>꺼진 항목</Checkbox>
      <Checkbox disabled defaultChecked>
        꺼진 체크 항목
      </Checkbox>
      <Checkbox disabled indeterminate>
        꺼진 일부 선택
      </Checkbox>
    </div>
  ),
};

/** 글자 없이 쓸 때(표의 행 선택)는 aria-label로 이름을 붙인다. */
export const WithoutLabel: Story = {
  name: "글자 없이",
  render: () => <Checkbox aria-label="1행 선택" />,
};

/** Do: label을 누를 수 있는 문장으로 쓴다. */
export const DoClearLabel: Story = {
  name: "Do: 무엇을 고르는지 쓴 label",
  render: () => <Checkbox>주문 내역을 메일로 받습니다</Checkbox>,
};

/** Don't: 하나만 고르는 선택에 Checkbox를 쓴다. 이때는 Radio를 쓴다. */
export const DontSingleChoice: Story = {
  name: "Don't: 하나만 고르는 선택",
  render: () => (
    <Field label="배송 방법" group>
      <CheckboxGroup>
        <Checkbox name="shipping" value="normal">
          일반 배송
        </Checkbox>
        <Checkbox name="shipping" value="fast">
          빠른 배송
        </Checkbox>
      </CheckboxGroup>
    </Field>
  ),
};
