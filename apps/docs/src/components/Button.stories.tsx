import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tide-tds/components";
import { colorFamilyCss, defineColorFamily } from "@tide-tds/foundation/color-family";
import { ArrowRightIcon, PlusIcon, TrashIcon } from "@tide-tds/icons";
import { useState, type ReactElement } from "react";

// Button 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언은 components의 `Button.test.tsx`에 있다.

const variants = ["solid", "subtle", "outline", "ghost"] as const;
const colors = ["neutral", "primary", "success", "warning", "danger", "info"] as const;
const sizes = ["xs", "sm", "md", "lg"] as const;

const union = (values: readonly string[]): string =>
  values.map((value) => `"${value}"`).join(" | ");

// 예시 앱 Role(brand)을 Role 타입에 더한다. 앱도 같은 augmentation을 쓴다(「브랜드 색 더하기」, ADR 0016).
declare module "@tide-tds/components" {
  interface RoleRegistry {
    brand: true;
  }
}

const meta = {
  title: "Component/Button",
  component: Button,
  args: {
    children: "저장",
    variant: "solid",
    color: "primary",
    size: "md",
  },
  // react-docgen이 `Extract<...>` 별칭을 풀지 못한다. 선택지와 타입을 직접 적는다.
  argTypes: {
    variant: {
      control: "inline-radio",
      options: variants,
      table: { type: { summary: union(variants) }, defaultValue: { summary: '"solid"' } },
    },
    color: {
      control: "select",
      options: colors,
      table: {
        type: { summary: "Role", detail: `${union(colors)} | 앱이 더한 Role` },
        defaultValue: { summary: '"primary"' },
      },
    },
    size: {
      control: "inline-radio",
      options: sizes,
      table: { type: { summary: union(sizes) }, defaultValue: { summary: '"md"' } },
    },
    startIcon: { control: false, table: { type: { summary: "ReactNode" } } },
    endIcon: { control: false, table: { type: { summary: "ReactNode" } } },
    render: { control: false, table: { type: { summary: "ReactElement" } } },
    loading: { table: { defaultValue: { summary: "false" } } },
    loadingLabel: { table: { defaultValue: { summary: '"로딩 중"' } } },
    noPressScale: { table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: solid·primary·md */
export const Basic: Story = {
  name: "기본",
};

/** 채움 방식 4개 */
export const Variants: Story = {
  name: "채움 방식",
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

/** Role 6개 × 채움 방식 4개 */
export const Colors: Story = {
  name: "Role",
  render: (args) => (
    <div className="flex flex-col gap-3">
      {colors.map((color) => (
        <div key={color} className="flex flex-wrap items-center gap-3">
          {variants.map((variant) => (
            <Button key={variant} {...args} variant={variant} color={color}>
              {color}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

// 예시 앱 Role의 색. 앱에서는 `tide-color build brand.ts`로 만든 CSS를 Tide CSS 다음에 불러온다.
const brand = defineColorFamily({
  name: "brand",
  scale: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
    950: "#2e1065",
  },
});
const brandCss = colorFamilyCss([brand]);

/** 앱 Role. `RoleRegistry`에 `brand`를 더하면 `color="brand"`로 씁니다. */
export const Brand: Story = {
  name: "앱 브랜드 색",
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {/* 문서에서만 예시 CSS를 페이지에 넣는다. */}
      <style>{brandCss}</style>
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant} color="brand">
          {variant}
        </Button>
      ))}
    </div>
  ),
};

/** size 4개. 높이 24/32/40/48px */
export const Sizes: Story = {
  name: "size",
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <Button key={size} {...args} size={size} startIcon={<PlusIcon />}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

/** 텍스트 앞뒤 아이콘. 크기는 size가 정한다. */
export const WithIcons: Story = {
  name: "아이콘",
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} startIcon={<PlusIcon />}>
        추가
      </Button>
      <Button {...args} variant="outline" endIcon={<ArrowRightIcon />}>
        다음
      </Button>
    </div>
  ),
};

/** 다른 라이브러리의 아이콘도 아이콘 자리에 넣는다. */
export const OtherIcon: Story = {
  name: "다른 아이콘",
  render: (args) => (
    <Button
      {...args}
      variant="subtle"
      startIcon={
        <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
          <path d="M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-4.5-6.5 4.5 2-7.5L2 9h7z" />
        </svg>
      }
    >
      즐겨찾기
    </Button>
  ),
};

function LoadingDemo(props: { children?: string }): ReactElement {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      {...props}
      loading={loading}
      loadingLabel="저장하는 중"
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
      }}
    >
      저장
    </Button>
  );
}

/** 로딩 중에는 앞 아이콘 자리에 Spinner가 보이고 클릭이 막힌다. */
export const Loading: Story = {
  name: "로딩",
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} loading>
        저장
      </Button>
      <Button {...args} variant="outline" loading startIcon={<PlusIcon />}>
        추가
      </Button>
      <LoadingDemo />
    </div>
  ),
};

/** 비활성 */
export const Disabled: Story = {
  name: "비활성",
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant} disabled>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

/** 링크로 렌더한다. Next.js에서는 `render={<Link href="/settings" />}`로 씁니다. */
export const AsLink: Story = {
  name: "링크로 렌더",
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="outline" render={<a href="#settings" />}>
        설정으로 이동
      </Button>
      <Button {...args} variant="outline" render={<a href="#settings" />} disabled>
        비활성 링크
      </Button>
    </div>
  ),
};

/** 누를 때 줄어드는 반응을 끈다. */
export const NoPressScale: Story = {
  name: "누름 축소 끄기",
  args: { noPressScale: true, children: "줄어들지 않음" },
};

/** Do: 한 영역의 주요 동작 하나만 solid로 둔다. */
export const DoOnePrimary: Story = {
  name: "Do: 주요 동작 하나만 solid",
  render: () => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" color="neutral">
        취소
      </Button>
      <Button>저장</Button>
    </div>
  ),
};

/** Don't: solid를 나란히 여러 개 둔다. 무엇이 주요 동작인지 알 수 없다. */
export const DontManySolid: Story = {
  name: "Don't: solid를 여러 개 둔다",
  render: () => (
    <div className="flex items-center gap-2">
      <Button color="neutral">취소</Button>
      <Button color="danger" startIcon={<TrashIcon />}>
        삭제
      </Button>
      <Button>저장</Button>
    </div>
  ),
};

/** Do: 위험한 동작은 danger로 두고 무엇을 하는지 적는다. */
export const DoDangerLabel: Story = {
  name: "Do: 위험한 동작은 무엇을 하는지 적는다",
  render: () => (
    <Button color="danger" startIcon={<TrashIcon />}>
      프로젝트 삭제
    </Button>
  ),
};

/** Don't: 아이콘만 넣는다. 이름이 없는 버튼이 된다. 아이콘만 쓰려면 IconButton을 쓴다. */
export const DontIconOnly: Story = {
  name: "Don't: 아이콘만 넣는다",
  // 의도적으로 이름이 없는 버튼이라 a11y 검사를 끈다.
  parameters: { a11y: { test: "off" } },
  render: () => <Button startIcon={<TrashIcon />} />,
};
