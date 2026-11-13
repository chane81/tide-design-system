import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Field, Input, Select, SelectItem, SelectSection } from "@tide-design/components";
import { BikeIcon, BusIcon, CarIcon, PlaneIcon, TrainFrontIcon } from "@tide-design/icons";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

// Select 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언(키보드로 열고 고르기, 타입어헤드, 폼 제출, focus-field)은
// components의 `Select.test.tsx`에 있다.
//
// 목록은 document.body로 portal된다. 열린 상태(키보드 위치 highlight 포함)의 a11y를 검사하려고 목록이 있는 story는
// play에서 트리거에 포커스하고 Enter로 연다. play는 Docs 페이지에서 돌지 않으므로 문서에서는 닫혀 있다.

const meta = {
  title: "Component/Select",
  component: Select,
  subcomponents: { SelectItem, SelectSection },
  argTypes: {
    children: { control: false, table: { type: { summary: "ReactNode" } } },
    onValueChange: { control: false },
    onOpenChange: { control: false },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: { size: "md", children: null },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 트리거에 포커스하고 Enter로 연다. 고른 옵션(없으면 첫 옵션)이 키보드 위치(highlight)가 된다. */
async function open(canvasElement: HTMLElement, index = 0): Promise<void> {
  const body = within(canvasElement.ownerDocument.body);
  // 키보드 입력 방식으로 바꾸려고 Tab을 누른 뒤 트리거로 포커스를 옮긴다.
  await userEvent.tab();
  const triggers = canvasElement.querySelectorAll<HTMLButtonElement>('[aria-haspopup="listbox"]');
  triggers[index]?.focus();
  await userEvent.keyboard("{Enter}");
  const listbox = await body.findByRole("listbox");
  await expect(listbox).toBeVisible();
  await expect(listbox.querySelector("[data-highlighted]")).not.toBeNull();
}

const fruits = (
  <>
    <SelectItem value="apple">사과</SelectItem>
    <SelectItem value="banana">바나나</SelectItem>
    <SelectItem value="grape">포도</SelectItem>
    <SelectItem value="peach">복숭아</SelectItem>
  </>
);

/** 기본: Field 안의 Select. label·설명이 자동으로 연결된다. */
export const Basic: Story = {
  name: "기본",
  render: (args) => (
    <div className="w-72">
      <Field label="과일" description="하나를 고릅니다.">
        <Select {...args} name="fruit" defaultValue="banana">
          {fruits}
        </Select>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement);
  },
};

/** size: 같은 size의 Input·Button과 높이가 같다. */
export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex w-[28rem] items-center gap-2">
          <Select size={size} aria-label={`정렬 ${size}`} defaultValue="new" className="w-40">
            <SelectItem value="new">최신순</SelectItem>
            <SelectItem value="old">오래된순</SelectItem>
          </Select>
          <Input size={size} aria-label={`검색 ${size}`} placeholder="검색어" />
          <Button size={size}>검색</Button>
        </div>
      ))}
    </div>
  ),
};

/** 묶음·아이콘·비활성 옵션. 고른 옵션은 배경과 체크 아이콘으로 보이고 트리거에도 아이콘이 보인다. */
export const Sections: Story = {
  name: "묶음·아이콘·비활성 옵션",
  render: () => (
    <div className="w-72">
      <Field label="이동 수단">
        <Select defaultValue="train">
          <SelectSection heading="대중교통">
            <SelectItem value="bus">
              <BusIcon />
              버스
            </SelectItem>
            <SelectItem value="train">
              <TrainFrontIcon />
              기차
            </SelectItem>
            <SelectItem value="plane" disabled>
              <PlaneIcon />
              비행기(매진)
            </SelectItem>
          </SelectSection>
          <SelectSection heading="직접">
            <SelectItem value="car">
              <CarIcon />
              자동차
            </SelectItem>
            <SelectItem value="bike">
              <BikeIcon />
              자전거
            </SelectItem>
          </SelectSection>
        </Select>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement);
  },
};

/** 제어: 고른 값을 상태로 갖고 화면에 보인다. 비우기는 `value={null}`이다. */
export const Controlled: Story = {
  name: "제어",
  render: function Controlled() {
    const [value, setValue] = useState<string | null>("grape");

    return (
      <div className="flex w-72 flex-col items-start gap-3">
        <Field label="과일">
          <Select value={value} onValueChange={setValue}>
            {fruits}
          </Select>
        </Field>
        <output className="text-body-sm text-muted">고른 값: {value ?? "없음"}</output>
        <Button size="sm" variant="ghost" color="neutral" onClick={() => setValue(null)}>
          비우기
        </Button>
      </div>
    );
  },
};

/** 폼: `name`으로 고른 값이 제출된다. `required`면 비어 있을 때 제출이 막히고 트리거로 포커스가 온다. */
export const InForm: Story = {
  name: "폼 제출과 오류",
  render: function InForm() {
    const [submitted, setSubmitted] = useState("아직 없음");

    return (
      <form
        className="flex w-72 flex-col items-start gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const entries = [...new FormData(event.currentTarget)];
          setSubmitted(entries.map(([key, value]) => `${key}=${String(value)}`).join("&"));
        }}
      >
        <Field label="배송 지역" error="배송 지역을 고르세요." required>
          <Select name="region">
            <SelectItem value="seoul">서울</SelectItem>
            <SelectItem value="busan">부산</SelectItem>
            <SelectItem value="jeju">제주</SelectItem>
          </Select>
        </Field>
        <Field label="포장" disabled>
          <Select name="wrap" defaultValue="basic">
            <SelectItem value="basic">기본 포장</SelectItem>
            <SelectItem value="gift">선물 포장</SelectItem>
          </Select>
        </Field>
        <Button type="submit">주문</Button>
        <output className="text-body-sm text-muted">제출한 값: {submitted}</output>
      </form>
    );
  },
};

/** Do: label이 있고 옵션이 짧은 명사다. */
export const DoLabeled: Story = {
  name: "Do: label과 짧은 옵션",
  render: () => (
    <div className="w-72">
      <Field label="언어">
        <Select defaultValue="ko">
          <SelectItem value="ko">한국어</SelectItem>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="ja">日本語</SelectItem>
        </Select>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement);
  },
};

/** Don't: 동작(실행)을 Select로 고르게 한다. 고른 값이 남고 폼 값처럼 읽힌다. 동작은 Menu로 둔다. */
export const DontActions: Story = {
  name: "Don't: 동작 실행",
  render: () => (
    <div className="w-72">
      <Select aria-label="문서 동작" placeholder="동작 고르기">
        <SelectItem value="rename">이름 바꾸기</SelectItem>
        <SelectItem value="delete">삭제</SelectItem>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement);
  },
};
