import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "@tide-design/components";
import { colorFamilyCss, defineColorFamily } from "@tide-design/foundation/color-family";
import { PlusIcon, RefreshCwIcon, SettingsIcon, TrashIcon, XIcon } from "@tide-design/icons";
import { useState, type ReactElement } from "react";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
const colors = ["neutral", "primary", "success", "warning", "danger", "info"] as const;
const sizes = ["xs", "sm", "md", "lg"] as const;

const union = (values: readonly string[]): string =>
  values.map((value) => `"${value}"`).join(" | ");

// 예시 앱 Role(brand)을 Role 타입에 더한다. 앱도 같은 augmentation을 쓴다(ADR 0016).
declare module "@tide-design/components" {
  interface RoleRegistry {
    brand: true;
  }
}

const meta = {
  title: "Component/IconButton",
  component: IconButton,
  args: {
    "aria-label": "설정",
    children: <SettingsIcon />,
    variant: "solid",
    color: "primary",
    size: "md",
  },
  // react-docgen이 `Extract<...>` 별칭을 풀지 못한다. 선택지와 타입을 직접 적는다.
  argTypes: {
    "aria-label": { control: "text", table: { type: { summary: "string" } } },
    children: { control: false, table: { type: { summary: "ReactNode" } } },
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
    render: { control: false, table: { type: { summary: "ReactElement" } } },
    loading: { table: { defaultValue: { summary: "false" } } },
    loadingLabel: { table: { defaultValue: { summary: '"로딩 중"' } } },
    noPressScale: { table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
} satisfies Meta<typeof IconButton>;

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
        <IconButton key={variant} {...args} variant={variant} aria-label={`설정(${variant})`} />
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
            <IconButton
              key={variant}
              {...args}
              variant={variant}
              color={color}
              aria-label={`설정(${color} ${variant})`}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

// 예시 앱 Role의 색. 앱에서는 `tide-color build brand.ts`로 만든 CSS를 Tide CSS 다음에 불러온다.
const brandCss = colorFamilyCss([
  defineColorFamily({
    name: "brand",
    scale: {
      50: "#fcf0f5",
      100: "#fee5f0",
      200: "#ebcbd9",
      300: "#e1adc4",
      400: "#dc7dac",
      500: "#c75b93",
      600: "#a85c81",
      700: "#90406a",
      800: "#793157",
      900: "#68274a",
      950: "#5c1d3f",
    },
  }),
]);

/** 앱 Role. `RoleRegistry`에 `brand`를 더하면 `color="brand"`로 씁니다. */
export const Brand: Story = {
  name: "앱 브랜드 색",
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {/* 문서에서만 예시 CSS를 페이지에 넣는다. */}
      <style>{brandCss}</style>
      {variants.map((variant) => (
        <IconButton
          key={variant}
          {...args}
          variant={variant}
          color="brand"
          aria-label={`설정(brand ${variant})`}
        />
      ))}
    </div>
  ),
};

/** size 4개. 24/32/40/48px 정사각형, 아이콘 16/16/20/24px */
export const Sizes: Story = {
  name: "size",
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <IconButton key={size} {...args} size={size} aria-label={`추가(${size})`}>
          <PlusIcon />
        </IconButton>
      ))}
    </div>
  ),
};

/** 다른 라이브러리의 아이콘이나 svg도 넣는다. */
export const OtherIcon: Story = {
  name: "다른 아이콘",
  args: {
    "aria-label": "즐겨찾기",
    variant: "subtle",
    children: (
      <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
        <path d="M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-4.5-6.5 4.5 2-7.5L2 9h7z" />
      </svg>
    ),
  },
};

function LoadingDemo(): ReactElement {
  const [loading, setLoading] = useState(false);

  return (
    <IconButton
      aria-label="새로 고침"
      variant="outline"
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
      }}
    >
      <RefreshCwIcon />
    </IconButton>
  );
}

/** 로딩 중에는 아이콘 자리에 Spinner가 보이고 클릭이 막힌다. */
export const Loading: Story = {
  name: "로딩",
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton {...args} loading />
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
        <IconButton
          key={variant}
          {...args}
          variant={variant}
          aria-label={`설정(${variant})`}
          disabled
        />
      ))}
    </div>
  ),
};

/** 링크로 렌더한다. Next.js에서는 `render={<Link href="/settings" />}`로 씁니다. */
export const AsLink: Story = {
  name: "링크로 렌더",
  args: { "aria-label": "설정으로 이동", variant: "outline", render: <a href="#settings" /> },
};

/** 누를 때 줄어드는 반응을 끈다. */
export const NoPressScale: Story = {
  name: "누름 축소 끄기",
  args: { noPressScale: true },
};

/** Do: 툴바처럼 여러 개 모일 때는 ghost로 낮춘다. */
export const DoToolbarGhost: Story = {
  name: "Do: 툴바는 ghost로 둔다",
  render: () => (
    <div className="flex items-center gap-1">
      <IconButton variant="ghost" color="neutral" aria-label="추가">
        <PlusIcon />
      </IconButton>
      <IconButton variant="ghost" color="neutral" aria-label="설정">
        <SettingsIcon />
      </IconButton>
      <IconButton variant="ghost" color="danger" aria-label="삭제">
        <TrashIcon />
      </IconButton>
    </div>
  ),
};

/** Don't: 아이콘 이름이 아니라 동작을 적어야 한다. 「X」가 아니라 「닫기」. */
export const DontIconName: Story = {
  name: "Don't: 아이콘 모양을 이름으로 쓴다",
  render: () => (
    <IconButton variant="ghost" color="neutral" aria-label="X 아이콘">
      <XIcon />
    </IconButton>
  ),
};

/** Do: 동작을 이름으로 쓴다. */
export const DoActionName: Story = {
  name: "Do: 동작을 이름으로 쓴다",
  render: () => (
    <IconButton variant="ghost" color="neutral" aria-label="닫기">
      <XIcon />
    </IconButton>
  ),
};
