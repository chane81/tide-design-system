import type { Meta, StoryObj } from "@storybook/react-vite";
import { Typography } from "@tide-tds/desktop";
import { textStyle, type TextStyleName } from "@tide-tds/foundation";

const textStyleNames = Object.keys(textStyle) as TextStyleName[];

// Typography 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언은 desktop의 `Typography.test.tsx`에 있다.
const meta = {
  title: "Component/Typography",
  component: Typography,
  args: {
    variant: "body-md",
    children: "다람쥐 헌 쳇바퀴에 타고파",
  },
  // props가 union 타입이라 react-docgen이 variant를 `unknown`으로 읽고 level·render·ref를 놓친다.
  // 표와 Controls에 실제 props가 보이게 직접 적는다. 설명은 Typography.tsx의 JSDoc과 맞춘다.
  argTypes: {
    variant: {
      description: "텍스트 스타일 이름. heading·display는 항상 `<h*>`로 렌더된다.",
      control: "select",
      options: textStyleNames,
      table: {
        type: {
          summary: "TextStyleName",
          detail: textStyleNames.map((name) => `"${name}"`).join(" | "),
        },
        defaultValue: { summary: '"body-md"' },
      },
    },
    level: {
      description:
        "제목 단계. heading·display 스타일에만 있고, 주지 않으면 텍스트 스타일의 기본 단계를 쓴다.",
      control: "inline-radio",
      options: [1, 2, 3, 4, 5, 6],
      table: { type: { summary: "1 | 2 | 3 | 4 | 5 | 6" } },
    },
    render: {
      description:
        '다른 요소로 렌더한다. 예: `render={<label htmlFor="name" />}`. props, ref, className을 그 요소에 병합하고 `level`과 기본 요소는 무시한다.',
      control: false,
      table: { type: { summary: "ReactElement" } },
    },
    ref: {
      description: "루트 DOM 요소에 연결한다.",
      control: false,
      table: { type: { summary: "Ref<HTMLElement>" } },
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: body-md 문단 */
export const Basic: Story = {
  name: "기본",
};

/** 텍스트 스타일마다 기본 요소가 정해져 있다. */
export const Variants: Story = {
  name: "텍스트 스타일과 기본 요소",
  render: () => (
    <div className="flex flex-col gap-4">
      <Typography variant="display-lg">display-lg (h1)</Typography>
      <Typography variant="heading-lg">heading-lg (h2)</Typography>
      <Typography variant="heading-md">heading-md (h3)</Typography>
      <Typography variant="heading-sm">heading-sm (h4)</Typography>
      <Typography variant="heading-xs">heading-xs (h5)</Typography>
      <Typography variant="body-md">body-md (p): 읽는 글은 body를 씁니다.</Typography>
      <Typography variant="caption" className="text-muted">
        caption (p): 보조 설명
      </Typography>
      <div>
        <Typography variant="label-md">label-md (span)</Typography>
      </div>
    </div>
  ),
};

/** 보이는 크기는 그대로 두고 제목 단계만 바꾼다. */
export const Level: Story = {
  name: "level로 제목 단계 바꾸기",
  render: () => (
    <section>
      <Typography variant="heading-lg" level={3}>
        h2 크기의 h3
      </Typography>
      <Typography>문서 구조상 세 번째 단계지만 더 크게 보여야 할 때 씁니다.</Typography>
    </section>
  ),
};

/** 다른 요소로 렌더한다. props, ref, className을 병합한다. */
export const Render: Story = {
  name: "render로 다른 요소 쓰기",
  render: () => (
    <div className="flex flex-col gap-1">
      <Typography variant="label-md" render={<label htmlFor="typography-email" />}>
        이메일
      </Typography>
      <input
        id="typography-email"
        type="email"
        className="h-10 rounded-md border border-strong px-3 text-body-md"
      />
    </div>
  ),
};

/** 색은 글자색 class로 따로 고른다. */
export const WithColor: Story = {
  name: "글자색과 함께 쓰기",
  render: () => (
    <div className="flex flex-col gap-1">
      <Typography variant="body-md">기본 글자색</Typography>
      <Typography variant="body-sm" className="text-muted">
        덜 중요한 설명은 text-muted
      </Typography>
      <Typography variant="body-sm" className="text-danger">
        오류는 text-danger
      </Typography>
    </div>
  ),
};

/** Do: 제목은 heading 스타일로 쓴다. 보조 기술이 제목으로 읽는다. */
export const DoHeading: Story = {
  name: "Do: 제목은 heading 스타일로 쓴다",
  render: () => (
    <section>
      <Typography variant="heading-md" level={2}>
        알림 설정
      </Typography>
      <Typography>받을 알림의 종류를 고릅니다.</Typography>
    </section>
  ),
};

/** Don't: 굵은 본문으로 제목을 흉내 낸다. 보조 기술은 제목으로 읽지 못한다. */
export const DontFakeHeading: Story = {
  name: "Don't: 굵은 본문으로 제목을 흉내 낸다",
  render: () => (
    <section>
      <Typography variant="body-lg" className="font-bold">
        알림 설정
      </Typography>
      <Typography>받을 알림의 종류를 고릅니다.</Typography>
    </section>
  ),
};

/** Do: 화면 크기에 맞춰 스타일을 바꿀 때는 반응형 variant를 쓴다. */
export const DoResponsive: Story = {
  name: "Do: 반응형은 class로 바꾼다",
  render: () => (
    <Typography variant="heading-lg" className="md:text-heading-xl">
      넓은 화면에서 더 큰 제목
    </Typography>
  ),
};

/** Don't: Tailwind 기본 크기 class(text-xl 등)나 임의 크기를 쓴다. Tide에는 기본 크기 class가 없다. */
export const DontArbitrarySize: Story = {
  name: "Don't: 임의 크기를 쓴다",
  render: () => (
    <Typography className="text-[17px] leading-[23px]">격자에서 벗어난 크기</Typography>
  ),
};
