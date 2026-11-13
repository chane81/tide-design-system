// 배포 tarball 소비 검사(seam ④). workspace 밖 임시 폴더에 실제 npm 사용자와 같은 구조로 설치한다.
// 순서: pnpm pack → publint → 앱 설치 → 브랜드 계열 CSS(tide-color) → next build → tsc(bundler) → tsc(nodenext) → 출력 CSS 확인 → 아이콘 tree-shaking 확인.
// workspace symlink로 연결하면 transpilePackages가 필요해져 사용자 구조와 달라진다(tide-v0 티켓 19).
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = fileURLToPath(new URL("../", import.meta.url));
const repoRoot = join(appDir, "../..");

/** tarball로 만들 배포 패키지. 의존 순서와 무관하다. */
const tidePackages = ["foundation", "icons", "components"] as const;

/** 임시 앱에 설치할 외부 패키지. 버전은 workspace에 설치된 것(catalog)을 그대로 쓴다. */
const appDependencies = ["next", "react", "react-dom"];
const appDevDependencies = [
  "@tailwindcss/postcss",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "tailwindcss",
  "typescript",
];

function run(command: string, args: string[], cwd: string): void {
  console.log(`\n$ ${command} ${args.join(" ")}  (${cwd})`);
  const result = spawnSync(command, args, { cwd, stdio: "inherit", env: cleanEnv() });
  if (result.status !== 0) {
    throw new Error(`실패: ${command} ${args.join(" ")} (exit ${result.status})`);
  }
}

/** 부모 pnpm 실행에서 넘어온 설정이 임시 앱 설치에 섞이지 않게 한다. */
function cleanEnv(): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !/^(npm|pnpm)_(config|package|lifecycle)_/i.test(key),
    ),
  );
}

async function installedVersion(name: string): Promise<string> {
  const manifest = JSON.parse(
    await readFile(join(appDir, "node_modules", name, "package.json"), "utf8"),
  ) as {
    version: string;
  };

  return manifest.version;
}

async function filesUnder(dir: string, extension: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => join(entry.parentPath, entry.name));
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`CSS 확인 실패: ${message}`);
  }
}

const workDir = await mkdtemp(join(tmpdir(), "tide-smoke-"));
const tarballDir = join(workDir, "tarballs");
const consumerDir = join(workDir, "app");

try {
  // 1. tarball을 만들고 publint로 검사한다.
  await mkdir(tarballDir);
  const tarballs: Record<string, string> = {};
  for (const name of tidePackages) {
    const before = new Set(await readdir(tarballDir));
    run("pnpm", ["pack", "--pack-destination", tarballDir], join(repoRoot, "packages", name));
    const created = (await readdir(tarballDir)).find((file) => !before.has(file));
    if (!created) {
      throw new Error(`${name} tarball을 찾지 못했다.`);
    }
    tarballs[`@tide-design/${name}`] = `file:${join(tarballDir, created)}`;
    run(
      join(appDir, "node_modules/.bin/publint"),
      ["run", join(tarballDir, created), "--strict"],
      appDir,
    );
  }

  // 2. workspace 밖에 앱을 만든다.
  await cp(join(appDir, "template"), consumerDir, { recursive: true });
  const versions = async (names: string[]): Promise<Record<string, string>> =>
    Object.fromEntries(
      await Promise.all(names.map(async (name) => [name, await installedVersion(name)] as const)),
    );
  const rootManifest = JSON.parse(await readFile(join(repoRoot, "package.json"), "utf8")) as {
    packageManager: string;
  };
  const manifest = {
    name: "tide-smoke-consumer",
    // 저장소와 같은 pnpm 버전으로 설치한다.
    packageManager: rootManifest.packageManager,
    private: true,
    type: "module",
    dependencies: { ...tarballs, ...(await versions(appDependencies)) },
    devDependencies: await versions(appDevDependencies),
  };
  await writeFile(join(consumerDir, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  // components tarball이 foundation·icons를 정확한 버전으로 의존하므로, registry 대신 tarball로 연결한다.
  const overrides = Object.entries(tarballs)
    .map(([name, spec]) => `  "${name}": "${spec}"`)
    .join("\n");
  await writeFile(
    join(consumerDir, "pnpm-workspace.yaml"),
    `packages: []\noverrides:\n${overrides}\n`,
  );

  run("pnpm", ["install"], consumerDir);

  // 앱 브랜드 계열 CSS를 설치된 foundation의 bin(tide-color)으로 만든다(티켓 40). 대비가 미달이면 exit 1로 여기서 멈춘다.
  console.log(`\n$ pnpm exec tide-color build brand.ts > app/brand.css  (${consumerDir})`);
  const brand = spawnSync("pnpm", ["exec", "tide-color", "build", "brand.ts"], {
    cwd: consumerDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    env: cleanEnv(),
  });
  if (brand.status !== 0) {
    throw new Error(`실패: tide-color build brand.ts (exit ${brand.status})`);
  }
  await writeFile(join(consumerDir, "app/brand.css"), brand.stdout);

  // 3. "use client" 경계와 prerender, d.ts 해석을 확인한다.
  run("pnpm", ["exec", "next", "build"], consumerDir);
  run("pnpm", ["exec", "tsc", "-p", "tsconfig.json"], consumerDir);
  run("pnpm", ["exec", "tsc", "-p", "tsconfig.nodenext.json"], consumerDir);

  // 4. 출력 CSS: 패키지 CSS의 @import와 @source가 동작했는지 본다.
  const cssFiles = await filesUnder(join(consumerDir, ".next/static"), ".css");
  const css = (await Promise.all(cssFiles.map((file) => readFile(file, "utf8")))).join("\n");
  assert(css.includes(".bg-primary-solid"), "앱이 쓴 Tide class(bg-primary-solid)가 없다");
  assert(css.includes("--tide-bg-primary-solid"), "foundation의 --tide-* 변수가 없다");
  assert(
    css.includes(".sr-only"),
    "components 내부 class(sr-only)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  assert(!css.includes("--color-red-500"), "Tailwind 기본 팔레트가 남아 있다");
  assert(
    css.includes(".text-heading-lg") && css.includes("--tide-text-heading-lg"),
    "Typography의 텍스트 스타일 class(text-heading-lg)가 없다",
  );
  assert(/word-break:\s*keep-all/.test(css), "base CSS의 word-break: keep-all이 없다");
  assert(css.includes("--tide-font-sans"), "기본 글꼴이 Tide sans 스택을 쓰지 않는다");
  assert(!/--text-xl\b|--font-serif\b/.test(css), "Tailwind 기본 크기나 font-serif가 남아 있다");
  assert(
    css.includes(".rounded-lg") && css.includes("--tide-rounded-lg"),
    "radius class(rounded-lg)나 --tide-rounded-lg가 없다",
  );
  assert(
    css.includes(".border-raised") && css.includes("--tide-border-raised"),
    "raised 표면 경계 class(border-raised)나 --tide-border-raised가 없다",
  );
  assert(
    css.includes(".shadow-md") && css.includes("--tide-shadow-md"),
    "그림자 class(shadow-md)나 --tide-shadow-md가 없다",
  );
  assert(
    /focus-visible\\:focus-ring:focus-visible/.test(css) && /focus\\:focus-field:focus/.test(css),
    "포커스 표시 utility(focus-ring, focus-field)가 없다",
  );
  assert(!/--radius-2xl\b|--shadow-xl\b/.test(css), "Tailwind 기본 radius나 그림자가 남아 있다");
  assert(
    css.includes(".duration-normal") && css.includes("--tide-duration-normal"),
    "duration class(duration-normal)나 --tide-duration-normal이 없다",
  );
  assert(
    css.includes(".transition-colors") &&
      css.includes("--tide-duration-fast") &&
      css.includes("--tide-ease-out") &&
      !css.includes("--default-transition-duration"),
    "시간을 적지 않은 transition-colors가 Tide 기본값(--tide-duration-fast, --tide-ease-out)을 쓰지 않는다",
  );
  assert(
    css.includes(".z-sticky") && css.includes("--tide-z-sticky"),
    "쌓임 단계 class(z-sticky)나 --tide-z-sticky가 없다",
  );
  assert(
    css.includes(".animate-spin") && /@keyframes spin\b/.test(css),
    "Spinner 내부 class(animate-spin)나 @keyframes spin이 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );

  // 색 이름과 앱 브랜드 계열(티켓 40): accent Utility class, Tide [data-color] 규칙, 앱 계열 변수와 규칙
  assert(
    css.includes(".bg-accent-solid") &&
      css.includes(".text-accent-on-solid") &&
      css.includes("--tide-accent-solid"),
    "accent class(bg-accent-solid, text-accent-on-solid)나 --tide-accent-solid가 없다",
  );
  assert(
    /\[data-color=("?)danger\1\]/.test(css) && css.includes("--tide-red-solid"),
    "Tide [data-color] 규칙이나 계열 변수(--tide-red-solid)가 없다",
  );
  assert(
    /\[data-color=("?)brand\1\]/.test(css) &&
      css.includes("--tide-brand-solid") &&
      css.includes("--tide-color-brand-600"),
    "tide-color가 만든 앱 브랜드 계열 CSS([data-color=brand], --tide-brand-solid)가 없다",
  );
  assert(
    /motion-safe\\:active\\:scale-96/.test(css) && css.includes(".text-label-sm"),
    "Button 내부 class(motion-safe:active:scale-96, text-label-sm)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  assert(
    css.includes(".size-6") &&
      /hover\\:decoration-2/.test(css) &&
      css.includes(".underline-offset-2"),
    "IconButton·Link 내부 class(size-6, hover:decoration-2, underline-offset-2)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  assert(
    /aria-invalid\\:border-danger\[aria-invalid=("?)true\1\]/.test(css) &&
      /placeholder\\:text-muted::placeholder/.test(css),
    "Input 내부 class(aria-invalid:border-danger, placeholder:text-muted)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  assert(
    /checked\\:bg-accent-solid:checked/.test(css) && css.includes(".peer-indeterminate\\:block"),
    "Checkbox 내부 class(checked:bg-accent-solid, peer-indeterminate:block)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  // Button은 클릭을 막는 핸들러를 만들므로 client 경계다. 표시만 하는 Component에는 지시어가 없어야 한다.
  const componentsDist = join(consumerDir, "node_modules/@tide-design/components/dist");
  const startsWithUseClient = async (file: string): Promise<boolean> =>
    /^["']use client["']/.test(await readFile(join(componentsDist, file), "utf8"));
  // IconButton도 같은 이유로 client 경계다(티켓 14). Link와 공유 모듈(_internal/constants/pressableClass.js, _internal/libs/pressableState.js)은 이벤트를 DOM에 넘기지 않는다.
  const clientFiles = ["Button/Button.js", "IconButton/IconButton.js"];
  // Badge·Card·Separator는 표시만 하는 서버 컴포넌트다(티켓 19).
  const serverFiles = [
    "Spinner/Spinner.js",
    "Link/Link.js",
    "_internal/constants/pressableClass.js",
    "_internal/libs/pressableState.js",
    "Badge/Badge.js",
    "Card/Card.js",
    "Separator/Separator.js",
    // Alert는 onClose를 IconButton에 그대로 넘길 뿐 핸들러를 만들지 않는다. 공유 스타일 모듈도 서버용이다(티켓 20).
    "Alert/Alert.js",
    "_internal/constants/alertClass.js",
    "_internal/libs/alertStatusIcon.js",
    // Avatar는 hook·state·이벤트 없이 로드 실패 fallback을 CSS 층으로 처리한다(티켓 21).
    "Avatar/Avatar.js",
    // Skeleton·Progress는 표시만 하는 서버 컴포넌트다(티켓 22).
    "Skeleton/Skeleton.js",
    "Progress/Progress.js",
    // Table은 시맨틱 표 요소만 쓰는 서버 컴포넌트다(티켓 23).
    "Table/Table.js",
    // Breadcrumb·Pagination은 함수를 만들지 않고 Button·IconButton에 props만 넘기는 서버 컴포넌트다(티켓 24).
    "Breadcrumb/Breadcrumb.js",
    "Pagination/Pagination.js",
    // 오버레이 공통 class 모듈은 문자열만 있고, 위치 props 정리는 순수 함수다(티켓 25).
    "_internal/constants/overlayClass.js",
    "_internal/libs/overlayPosition.js",
    // 목록 공통 class·컬렉션 모듈은 문자열과 순수 함수만 있다(티켓 27).
    "_internal/constants/listClass.js",
    "_internal/libs/listCollection.js",
    // class 합치기·render prop 병합도 순수 함수다.
    "_internal/libs/cn.js",
    "_internal/libs/renderElement.js",
    "_internal/constants/choiceClass.js",
    "_internal/constants/inputClass.js",
    // CheckboxGroup·RadioGroup 묶음 배치 class도 문자열만 있다(구조 티켓 05에서 승격).
    "_internal/constants/choiceGroupClass.js",
    // 파일 하나에 Component 하나로 나눈 서버 쪽 조각(구조 티켓 06). 하위 Component는 hook·이벤트가 없고,
    // class·타입·순수 함수 모듈은 문자열과 함수만 있다.
    "Table/components/TableHead.js",
    "Table/components/TableBody.js",
    "Table/components/TableRow.js",
    "Table/components/TableHeaderCell.js",
    "Table/components/TableCell.js",
    "Table/constants/tableClass.js",
    "Breadcrumb/components/BreadcrumbItem.js",
    "Breadcrumb/components/BreadcrumbLink.js",
    "Breadcrumb/components/BreadcrumbCurrent.js",
    "Breadcrumb/constants/breadcrumbClass.js",
    "Pagination/components/PaginationItem.js",
    "Pagination/components/PaginationLink.js",
    "Pagination/components/PaginationPrevious.js",
    "Pagination/components/PaginationNext.js",
    "Pagination/components/PaginationEllipsis.js",
    "Pagination/constants/paginationClass.js",
    "Button/components/Icon.js",
    "Button/constants/buttonClass.js",
    "Dialog/components/DialogFooter.js",
    "Dialog/constants/dialogClass.js",
    "Toast/libs/toastQueue.js",
    "Toast/libs/mergeEntries.js",
    "Toast/constants/toastClass.js",
  ];
  for (const file of clientFiles) {
    if (!(await startsWithUseClient(file))) {
      throw new Error(`"use client" 확인 실패: ${file}에 지시어가 있어야 한다`);
    }
  }
  for (const file of serverFiles) {
    if (await startsWithUseClient(file)) {
      throw new Error(`"use client" 확인 실패: ${file}에는 지시어가 없어야 한다`);
    }
  }
  // Input·Textarea는 Field context를 읽고, context는 client 모듈이 만든다. Field는 서버 컴포넌트로 남는다(티켓 15).
  // Checkbox·Radio와 묶음은 Field·묶음 context를 읽으므로 client다(티켓 16).
  // Switch도 Field context를 읽으므로 client Component다(티켓 17).
  for (const file of [
    "Input/Input.js",
    "Textarea/Textarea.js",
    "_internal/hooks/useFieldControl.js",
    "Checkbox/Checkbox.js",
    "CheckboxGroup/CheckboxGroup.js",
    "Radio/Radio.js",
    "RadioGroup/RadioGroup.js",
    "_internal/hooks/useChoiceGroup.js",
    "Switch/Switch.js",
    // Popover와 오버레이 공통 hook·portal은 React Aria hooks·state를 쓰므로 client다(티켓 25).
    "Popover/Popover.js",
    "_internal/components/OverlayPortal.js",
    "_internal/hooks/useOverlayPresence.js",
    "_internal/hooks/usePopoverOverlay.js",
    "_internal/hooks/useOverlayTheme.js",
    "_internal/hooks/useCloseOnTab.js",
    // Tooltip도 React Aria hooks·state를 쓰므로 client다(티켓 26).
    "Tooltip/Tooltip.js",
    // Menu도 React Aria hooks·state를 쓰므로 client다(티켓 27).
    "Menu/Menu.js",
    // Select와 옵션 공통 모듈(ListBoxNodes)도 React Aria hooks·state를 쓰므로 client다(티켓 28).
    "Select/Select.js",
    "_internal/components/ListBoxNodes/ListBoxNodes.js",
    "_internal/components/ListBoxNodes/components/ListBoxOptionView.js",
    "_internal/components/ListBoxNodes/components/ListBoxSectionView.js",
    // Combobox도 React Aria hooks·state를 쓰므로 client다(티켓 29).
    "Combobox/Combobox.js",
    // Dialog·AlertDialog도 React Aria hooks·state를 쓰므로 client다(티켓 30).
    "Dialog/Dialog.js",
    "AlertDialog/AlertDialog.js",
    // 두 Component가 함께 쓰는 열림 상태와 그 context(구조 티켓 05에서 승격).
    "_internal/components/DialogRoot.js",
    "_internal/hooks/useDialogContext.js",
    // Tabs도 React Aria hooks·state를 쓰므로 client다(티켓 31).
    "Tabs/Tabs.js",
    // Accordion도 React Aria hooks·state를 쓰므로 client다(티켓 32).
    "Accordion/Accordion.js",
    // Tag도 React Aria hooks·state를 쓰므로 client다(티켓 33).
    "Tag/Tag.js",
    // Toast도 React Aria hooks·state를 쓰므로 client다(티켓 34).
    "Toast/Toast.js",
    // 파일 하나에 Component 하나로 나눈 client 조각(구조 티켓 06). hook·context·이벤트를 쓰거나,
    // 컬렉션 항목(MenuItem·SelectItem·Tab·Tag 등)이라 서버에서 만든 요소가 client 참조로 목록에 넘어가야 한다.
    "Menu/hooks/useMenuContext.js",
    "Menu/components/MenuTrigger.js",
    "Menu/components/MenuContent.js",
    "Menu/components/MenuContentInner.js",
    "Menu/components/MenuItem.js",
    "Menu/components/MenuSection.js",
    "Menu/components/MenuItemView.js",
    "Menu/components/MenuSectionView.js",
    "Dialog/hooks/useDialogPartsContext.js",
    "Dialog/hooks/usePartId.js",
    "Dialog/components/DialogTrigger.js",
    "Dialog/components/DialogContent.js",
    "Dialog/components/DialogContentInner.js",
    "Dialog/components/DialogTitle.js",
    "Dialog/components/DialogDescription.js",
    "Dialog/components/DialogClose.js",
    "Select/components/SelectPopover.js",
    "Select/components/SelectPopoverInner.js",
    "Select/components/SelectItem.js",
    "Select/components/SelectSection.js",
    "Combobox/components/ComboboxPopover.js",
    "Combobox/components/ComboboxPopoverInner.js",
    "Combobox/components/ComboboxItem.js",
    "Combobox/components/ComboboxSection.js",
    "Tabs/hooks/useTabsContext.js",
    "Tabs/components/TabList.js",
    "Tabs/components/Tab.js",
    "Tabs/components/TabView.js",
    "Tabs/components/TabPanel.js",
    "Accordion/hooks/useAccordionContext.js",
    "Accordion/hooks/useAccordionItemContext.js",
    "Accordion/components/AccordionItem.js",
    "Accordion/components/AccordionTrigger.js",
    "Accordion/components/AccordionPanel.js",
    "Tooltip/hooks/useTooltipContext.js",
    "Tooltip/components/TooltipTrigger.js",
    "Tooltip/components/TooltipContent.js",
    "Tooltip/components/TooltipContentInner.js",
    "Popover/hooks/usePopoverContext.js",
    "Popover/components/PopoverTrigger.js",
    "Popover/components/PopoverContent.js",
    "Popover/components/PopoverContentInner.js",
    "Tag/hooks/useTagGroupContext.js",
    "Tag/components/TagGroup.js",
    "Tag/components/TagView.js",
    "Toast/components/Region.js",
    "Toast/components/ToastItem.js",
  ]) {
    if (!(await startsWithUseClient(file))) {
      throw new Error(`"use client" 확인 실패: ${file}에 지시어가 없다`);
    }
  }
  if (await startsWithUseClient("Field/Field.js")) {
    throw new Error(
      '"use client" 확인 실패: Field/Field.js는 서버 컴포넌트라 지시어가 없어야 한다',
    );
  }
  // 진입점 index.js는 재수출만 하므로 지시어가 없어야 한다(구조 규칙 import와 진입점).
  // 공개 Component 폴더의 index.ts는 재수출만 해서 unbundle 빌드가 JS로 내지 않고(index.d.ts만 남는다)
  // 진입점이 본문 파일(`Button/Button.js`)을 바로 import한다.
  if (await startsWithUseClient("index.js")) {
    throw new Error('"use client" 확인 실패: index.js는 재수출만 하므로 지시어가 없어야 한다');
  }

  assert(
    /peer-checked\\:translate-x-4/.test(css),
    "Switch 내부 class(peer-checked:translate-x-4)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );

  assert(
    /\[\\&_svg\\\]\\:size-3/.test(css) &&
      css.includes(".bg-surface") &&
      css.includes(".self-stretch"),
    "Badge·Card·Separator 내부 class([&_svg]:size-3, bg-surface, self-stretch)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );

  assert(
    css.includes(".-me-1") && css.includes(".-my-0\\.5"),
    "Alert 내부 class(-me-1, -my-0.5)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );

  assert(
    css.includes(".bg-cover") && /\[\\&_svg\\\]\\:size-7/.test(css),
    "Avatar 내부 class(bg-cover, [&_svg]:size-7)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );

  assert(
    /motion-safe\\:animate-pulse/.test(css) &&
      /\.h-\\\[1em\\\]/.test(css) &&
      /motion-safe\\:transition-\\\[width\\\]/.test(css) &&
      /forced-colors\\:text-\\\[Highlight\\\]/.test(css),
    "Skeleton·Progress 내부 class(motion-safe:animate-pulse, h-[1em], motion-safe:transition-[width], forced-colors:text-[Highlight])가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );

  assert(
    css.includes(".border-collapse") && css.includes(":where(tbody>") && css.includes(".py-2\\.5"),
    "Table 내부 class(border-collapse, [:where(tbody>&)]:hover:bg-neutral-subtle-hover, py-2.5)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );

  assert(
    css.includes("li:first-child>") && css.includes(".min-w-8") && css.includes(".gap-1\\.5"),
    "Breadcrumb·Pagination 내부 class([li:first-child>&]:hidden, min-w-8, gap-1.5)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );

  assert(
    css.includes(".z-popover") &&
      css.includes("--tide-z-popover") &&
      css.includes("@starting-style") &&
      /transition-behavior:\s*allow-discrete/.test(css) &&
      /not-data-open\\:hidden/.test(css) &&
      /motion-safe\\:starting\\:blur-xs/.test(css),
    "Popover 내부 class(z-popover, starting:, transition-discrete, not-data-open:hidden, motion-safe:starting:blur-xs)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  assert(
    css.includes(".z-modal") &&
      css.includes("--tide-z-modal") &&
      css.includes(".bg-overlay") &&
      /motion-safe\\:starting\\:scale-96/.test(css) &&
      /motion-safe\\:not-data-open\\:scale-98/.test(css) &&
      css.includes(".max-w-128"),
    "Dialog 내부 class(z-modal, bg-overlay, motion-safe:starting:scale-96, motion-safe:not-data-open:scale-98, max-w-128)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  assert(
    css.includes("motion-safe\\:data-selected\\:after\\:scale-x-100") &&
      css.includes("data-selected\\:after\\:opacity-100") &&
      css.includes("forced-colors\\:after\\:border-\\[Highlight\\]") &&
      css.includes("after\\:border-primary"),
    "Tabs 내부 class(motion-safe:data-selected:after:scale-x-100, data-selected:after:opacity-100, forced-colors:after:border-[Highlight], after:border-primary)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  assert(
    css.includes("group-aria-expanded\\:rotate-180") &&
      css.includes("motion-safe\\:transition-\\[rotate\\]") &&
      css.includes("\\[\\&\\[hidden\\]\\]\\:p-0") &&
      css.includes("forced-colors\\:text-current"),
    "Accordion 내부 class(group-aria-expanded:rotate-180, motion-safe:transition-[rotate], [&[hidden]]:p-0, forced-colors:text-current)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  assert(
    css.includes("hover\\:bg-\\(--tag-remove-hover\\)") &&
      css.includes("--tag-remove-hover") &&
      css.includes("aria-disabled\\:bg-disabled") &&
      css.includes("pe-0\\.75"),
    "Tag 내부 class(hover:bg-(--tag-remove-hover), [--tag-remove-hover:…], aria-disabled:bg-disabled, pe-0.75)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  assert(
    css.includes(".z-toast") &&
      css.includes("--tide-z-toast") &&
      css.includes("flex-col-reverse") &&
      css.includes("max-w-96") &&
      css.includes("w-\\[calc\\(100\\%-2rem\\)\\]"),
    "Toast 내부 class(z-toast, flex-col-reverse, max-w-96, w-[calc(100%-2rem)])가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  assert(
    css.includes(".z-tooltip") &&
      css.includes("--tide-z-tooltip") &&
      /data-open\\:transition-none/.test(css),
    "Tooltip 내부 class(z-tooltip, data-open:transition-none)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  assert(
    /data-highlighted\\:bg-primary-subtle/.test(css) && /p-\\\[3px\\\]/.test(css),
    "Menu 내부 class(data-highlighted:bg-primary-subtle, p-[3px])가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );

  assert(
    /group-disabled\\:text-disabled/.test(css),
    "Select 내부 class(group-disabled:text-disabled)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );

  // Field(서버 컴포넌트)가 prerender한 HTML에서 label·설명·오류가 입력창과 연결되어 있다(티켓 15).
  const htmlFiles = await filesUnder(join(consumerDir, ".next/server/app"), ".html");
  const html = (await Promise.all(htmlFiles.map((file) => readFile(file, "utf8")))).find((text) =>
    text.includes("Tide smoke"),
  );
  const emailInput = html && /<input[^>]*name="email"[^>]*>/.exec(html)?.[0];
  const inputId = emailInput && /\sid="([^"]+)"/.exec(emailInput)?.[1];
  const describedBy = emailInput && /aria-describedby="([^"]+)"/.exec(emailInput)?.[1];
  assert(
    html !== undefined &&
      inputId !== undefined &&
      html.includes(`for="${inputId}"`) &&
      /aria-invalid="true"/.test(emailInput ?? "") &&
      /\srequired=""/.test(emailInput ?? "") &&
      describedBy?.split(" ").length === 2 &&
      describedBy.split(" ").every((id) => html.includes(`id="${id}"`)),
    "Field가 prerender한 HTML에서 label for·aria-describedby·aria-invalid·required가 입력창과 연결되지 않았다",
  );

  // Field group(서버 컴포넌트) 안의 RadioGroup이 prerender한 HTML에서 묶음 이름·설명이 연결되고,
  // 같은 name, 기본 선택, 각 Radio의 aria-invalid·required가 있다(티켓 16).
  const radioGroup = html && /<div[^>]*role="radiogroup"[^>]*>/.exec(html)?.[0];
  const groupLabel = radioGroup && /aria-labelledby="([^"]+)"/.exec(radioGroup)?.[1];
  const groupDescribedBy = radioGroup && /aria-describedby="([^"]+)"/.exec(radioGroup)?.[1];
  const groupId = radioGroup && /\sid="([^"]+)"/.exec(radioGroup)?.[1];
  const radios = html ? [...html.matchAll(/<input[^>]*type="radio"[^>]*>/g)].map((m) => m[0]) : [];
  assert(
    groupLabel !== undefined &&
      html?.includes(`<span id="${groupLabel}"`) === true &&
      groupId !== undefined &&
      !html.includes(`for="${groupId}"`) &&
      groupDescribedBy?.split(" ").length === 2 &&
      radios.length === 2 &&
      radios.every(
        (radio) =>
          radio.includes('name="shipping"') &&
          /aria-invalid="true"/.test(radio) &&
          /\srequired=""/.test(radio),
      ) &&
      radios.filter((radio) => /\schecked=""/.test(radio)).length === 1,
    "Field group이 prerender한 HTML에서 radiogroup 이름·설명·name·checked·aria-invalid·required가 연결되지 않았다",
  );

  // Badge·Card·Separator(서버 컴포넌트)가 prerender한 HTML: Card가 render로 article이 되고,
  // Badge에 data-color(Role, 앱 Role, 색 계열)가 붙고, Separator가 네이티브 hr(의미 구분은 역할 속성 없음, 장식용은 role="none")이다(티켓 19).
  const hrs = html ? [...html.matchAll(/<hr[^>]*>/g)].map((m) => m[0]) : [];
  assert(
    html !== undefined &&
      /<article[^>]*aria-label="배포"/.test(html) &&
      /<span[^>]*data-color="success"[^>]*>완료<\/span>/.test(html) &&
      /<span[^>]*data-color="brand"[^>]*>브랜드<\/span>/.test(html) &&
      /<span[^>]*data-color="cyan"[^>]*>디자인<\/span>/.test(html) &&
      hrs.length === 2 &&
      hrs.some((hr) => !hr.includes("role=") && !hr.includes("aria-orientation")) &&
      hrs.some((hr) => hr.includes('role="none"') && !hr.includes("aria-orientation")),
    "Badge·Card·Separator가 prerender한 HTML에서 article·data-color·hr 역할이 기대와 다르다",
  );

  // Alert(서버 컴포넌트)가 prerender한 HTML: 정적 Alert는 역할이 없고, role="status"는 그대로 붙고,
  // 루트에 data-color가 붙고, 상태 아이콘은 aria-hidden이며, onClose가 없어 닫기 버튼이 없다(티켓 20).
  const alerts = html
    ? [...html.matchAll(/<div[^>]*data-color="(warning|brand)"[^>]*>.*?<\/svg>/g)].map((m) => m[0])
    : [];
  assert(
    alerts.length === 2 &&
      alerts.some((alert) => alert.includes('data-color="warning"') && !alert.includes("role=")) &&
      alerts.some(
        (alert) => alert.includes('data-color="brand"') && alert.includes('role="status"'),
      ) &&
      alerts.every((alert) => /<svg[^>]*aria-hidden="true"/.test(alert)) &&
      !html?.includes('aria-label="닫기"'),
    "Alert가 prerender한 HTML에서 역할·data-color·아이콘 숨김·닫기 버튼이 기대와 다르다",
  );

  // Avatar(서버 컴포넌트)가 prerender한 HTML: alt가 있으면 role="img"와 aria-label, 장식용(alt="")은 역할이 없고,
  // 루트에 data-color(기본 gray)가 붙고, fallback 아이콘은 aria-hidden이며, 이미지는 숨긴 층의 CSS 배경이다(티켓 21).
  const avatars = html
    ? [
        ...html.matchAll(
          /<span[^>]*data-color="(cyan|gray)"[^>]*><svg.*?<\/svg>(<span[^>]*><\/span>)?<\/span>/g,
        ),
      ].map((m) => m[0])
    : [];
  assert(
    avatars.length === 2 &&
      avatars.some(
        (avatar) =>
          avatar.includes('role="img"') &&
          avatar.includes('aria-label="홍길동"') &&
          avatar.includes('data-color="cyan"') &&
          /<span aria-hidden="true"[^>]*style="background-image:url\(&quot;\/avatar\.png&quot;\)"/.test(
            avatar,
          ),
      ) &&
      avatars.some(
        (avatar) =>
          avatar.includes('data-color="gray"') &&
          !avatar.includes("role=") &&
          !avatar.includes("aria-label") &&
          !avatar.includes("background-image"),
      ) &&
      avatars.every((avatar) => /<svg[^>]*aria-hidden="true"/.test(avatar)) &&
      !html?.includes("<img"),
    "Avatar가 prerender한 HTML에서 역할·이름·data-color·아이콘 숨김·이미지 층이 기대와 다르다",
  );

  // Skeleton·Progress(서버 컴포넌트)가 prerender한 HTML(티켓 22).
  // Skeleton은 aria-hidden이고, Progress는 progressbar 역할·이름·값 속성·data-color와 값 비율만큼의 막대 너비를 갖는다.
  const skeletons = html
    ? [...html.matchAll(/<div aria-busy="true">(.*?)<\/div><div[^>]*role="progressbar"/g)].map(
        (m) => m[1] ?? "",
      )
    : [];
  const progress = html?.match(/<div[^>]*role="progressbar"[^>]*>.*?<\/div>/)?.[0] ?? "";
  assert(
    skeletons.length === 1 &&
      (skeletons[0]?.match(/<div aria-hidden="true"/g) ?? []).length === 2 &&
      progress.includes('aria-label="업로드"') &&
      progress.includes('aria-valuenow="30"') &&
      progress.includes('aria-valuemin="0"') &&
      progress.includes('aria-valuemax="60"') &&
      progress.includes('data-color="success"') &&
      /<span aria-hidden="true"[^>]*style="width:50%"/.test(progress),
    "Skeleton·Progress가 prerender한 HTML에서 숨김·역할·이름·값·data-color·막대 너비가 기대와 다르다",
  );

  // Table(서버 컴포넌트)이 prerender한 HTML(티켓 23). 시맨틱 표 요소이고 머리 칸은 기본 scope="col",
  // 행 머리는 scope="row"다. 기본 class가 없는 thead·tbody에는 class 속성이 없다.
  const table = html?.match(/<table[^>]*aria-label="요금제"[^>]*>.*?<\/table>/)?.[0] ?? "";
  assert(
    /<thead>/.test(table) &&
      /<tbody>/.test(table) &&
      (table.match(/<th scope="col"/g) ?? []).length === 2 &&
      (table.match(/<th scope="row"/g) ?? []).length === 1 &&
      (table.match(/<td /g) ?? []).length === 1 &&
      (table.match(/<tr /g) ?? []).length === 2,
    "Table이 prerender한 HTML에서 표 요소·머리 칸 scope가 기대와 다르다",
  );

  // Breadcrumb·Pagination(서버 컴포넌트)이 prerender한 HTML(티켓 24). 이름 있는 nav 랜드마크, 현재 항목의 aria-current,
  // 장식용 아이콘(aria-hidden), 이전/다음 이름과 disabled, Next Link로 렌더한 href.
  const breadcrumb = html?.match(/<nav aria-label="이동 경로">.*?<\/nav>/)?.[0] ?? "";
  const pagination = html?.match(/<nav aria-label="페이지 이동">.*?<\/nav>/)?.[0] ?? "";
  assert(
    breadcrumb.startsWith('<nav aria-label="이동 경로"><ol ') &&
      (breadcrumb.match(/<li /g) ?? []).length === 2 &&
      /<a [^>]*href="\/"[^>]*>홈<\/a>/.test(breadcrumb) &&
      /<span aria-current="page"[^>]*>설정<\/span>/.test(breadcrumb) &&
      (breadcrumb.match(/<svg [^>]*aria-hidden="true"/g) ?? []).length === 2,
    "Breadcrumb이 prerender한 HTML에서 랜드마크·목록·aria-current·구분자 숨김이 기대와 다르다",
  );
  assert(
    pagination.startsWith('<nav aria-label="페이지 이동"><ul ') &&
      /<li><button [^>]*aria-label="이전 페이지"/.test(pagination) &&
      /<button [^>]*disabled=""[^>]*aria-label="이전 페이지"|<button [^>]*aria-label="이전 페이지"[^>]*disabled=""/.test(
        pagination,
      ) &&
      /<a [^>]*href="\/\?page=1"[^>]*aria-current="page"|<a [^>]*aria-current="page"[^>]*href="\/\?page=1"/.test(
        pagination,
      ) &&
      /<a [^>]*aria-label="다음 페이지"[^>]*href="\/\?page=2"|<a [^>]*href="\/\?page=2"[^>]*aria-label="다음 페이지"/.test(
        pagination,
      ) &&
      pagination.includes("페이지 생략") &&
      (pagination.match(/<svg [^>]*aria-hidden="true"/g) ?? []).length === 3,
    "Pagination이 prerender한 HTML에서 랜드마크·이전/다음 이름·disabled·aria-current·아이콘 숨김이 기대와 다르다",
  );

  // Popover(client)가 prerender한 HTML(티켓 25). 트리거는 Button 모양의 type=button이고 닫혀 있다(aria-expanded="false",
  // aria-controls·data-open 없음). 내용은 열 때 body로 portal되므로 HTML에 dialog가 없다.
  const popoverTrigger =
    html?.match(/<button[^>]*>공유 범위<\/button>/)?.[0] ??
    html?.match(/<button(?:(?!<\/button>).)*공유 범위(?:(?!<\/button>).)*<\/button>/)?.[0] ??
    "";
  assert(
    popoverTrigger.includes('type="button"') &&
      popoverTrigger.includes('aria-expanded="false"') &&
      popoverTrigger.includes('data-color="primary"') &&
      !popoverTrigger.includes("aria-controls") &&
      !popoverTrigger.includes("data-open") &&
      !html?.includes('role="dialog"'),
    "Popover가 prerender한 HTML에서 트리거 속성·닫힌 상태가 기대와 다르다",
  );

  // Dialog·AlertDialog(client)가 prerender한 HTML(티켓 30). 트리거는 Button 모양의 type=button이고 닫혀 있다
  // (aria-expanded="false", aria-controls·data-open 없음, React Aria는 dialog 트리거에 aria-haspopup을 붙이지 않는다).
  // 막과 내용은 열 때 body로 portal되므로 HTML에 alertdialog 요소와 제목 요소가 없다(제목 글자는 서버 컴포넌트가
  // 넘긴 children으로 RSC payload에는 들어 있다).
  const buttonWith = (text: string): string =>
    html?.match(new RegExp(`<button(?:(?!</button>).)*${text}(?:(?!</button>).)*</button>`))?.[0] ??
    "";
  const dialogTrigger = buttonWith("이름 바꾸기");
  const alertDialogTrigger = buttonWith("프로젝트 삭제");
  assert(
    [dialogTrigger, alertDialogTrigger].every(
      (trigger) =>
        trigger.includes('type="button"') &&
        trigger.includes('aria-expanded="false"') &&
        !trigger.includes("aria-haspopup") &&
        !trigger.includes("aria-controls") &&
        !trigger.includes("data-open"),
    ) &&
      alertDialogTrigger.includes('data-color="danger"') &&
      !html?.includes('role="alertdialog"') &&
      !html?.includes("프로젝트를 삭제할까요?</h2>"),
    "Dialog·AlertDialog가 prerender한 HTML에서 트리거 속성·닫힌 상태가 기대와 다르다",
  );

  // Tabs(client)가 prerender한 HTML(티켓 31). 서버 컴포넌트가 넘긴 탭(lazy 참조)이 prerender 때 모여 tablist 안에
  // type=button 탭으로 그려지고, defaultValue의 탭이 고른 상태이며 그 패널만 tabpanel로 있다(id로 서로 잇는다).
  // 고르지 않은 패널의 글자는 서버 컴포넌트가 넘긴 children으로 RSC payload에는 있으므로 패널 요소의 부재로 본다.
  const tabWith = (text: string): string =>
    html?.match(new RegExp(`<button[^>]*role="tab"[^>]*>${text}</button>`))?.[0] ?? "";
  const activityTab = tabWith("활동 기록");
  const overviewTab = tabWith("개요");
  const archiveTab = tabWith("보관함");
  const activityPanel = html?.match(/<div[^>]*role="tabpanel"[^>]*>활동 패널<\/div>/)?.[0] ?? "";
  const attribute = (element: string, name: string): string | undefined =>
    element.match(new RegExp(`${name}="([^"]*)"`))?.[1];
  assert(
    html?.includes('role="tablist"') === true &&
      html.includes('aria-label="프로젝트 보기"') &&
      activityTab.includes('aria-selected="true"') &&
      activityTab.includes("data-selected") &&
      activityTab.includes('type="button"') &&
      overviewTab.includes('aria-selected="false"') &&
      !overviewTab.includes("aria-controls") &&
      archiveTab.includes("disabled") &&
      activityPanel !== "" &&
      attribute(activityTab, "aria-controls") === attribute(activityPanel, "id") &&
      attribute(activityPanel, "aria-labelledby") === attribute(activityTab, "id") &&
      (html.match(/role="tabpanel"/g) ?? []).length === 1,
    "Tabs가 prerender한 HTML에서 탭·패널 역할·고른 상태·연결이 기대와 다르다",
  );

  // Accordion(client)이 prerender한 HTML(티켓 32). 제목(h3) 안의 type=button 트리거가 aria-expanded를 노출하고
  // aria-controls가 패널 id를 가리키며 패널은 aria-labelledby로 트리거를 가리킨다(React useId라 서버와 hydration이 같다).
  // 펼친 항목의 패널만 보이고 접힌 패널은 hidden이다(hydration 뒤 React Aria가 until-found로 바꾼다). 비활성 트리거는 disabled다.
  const accordionTrigger = (text: string): string =>
    html?.match(new RegExp(`<h3[^>]*><button[^>]*>${text}<svg`))?.[0] ?? "";
  const accordionPanel = (text: string): string =>
    html?.match(new RegExp(`<div[^>]*role="region"[^>]*>${text}</div>`))?.[0] ?? "";
  const shippingTrigger = accordionTrigger("배송 안내");
  const refundTrigger = accordionTrigger("환불 안내");
  const archiveTrigger = accordionTrigger("보관 안내");
  const shippingPanel = accordionPanel("배송 패널");
  const refundPanel = accordionPanel("환불 패널");
  const htmlAttribute = (element: string, name: string): string | undefined =>
    element.match(new RegExp(` ${name}="([^"]*)"`))?.[1];
  assert(
    shippingTrigger.includes('aria-expanded="true"') &&
      shippingTrigger.includes('type="button"') &&
      shippingTrigger.includes("data-open") &&
      refundTrigger.includes('aria-expanded="false"') &&
      archiveTrigger.includes("disabled") &&
      shippingPanel !== "" &&
      !/ hidden[ =>]/.test(shippingPanel) &&
      / hidden[ =>]/.test(refundPanel) &&
      htmlAttribute(shippingTrigger, "aria-controls") === htmlAttribute(shippingPanel, "id") &&
      htmlAttribute(shippingPanel, "aria-labelledby") === htmlAttribute(shippingTrigger, "id") &&
      htmlAttribute(refundTrigger, "aria-controls") === htmlAttribute(refundPanel, "id"),
    "Accordion이 prerender한 HTML에서 트리거·패널 역할·펼침 상태·연결이 기대와 다르다",
  );

  // Toast(client, 티켓 34): 큐가 비어 있으면 영역을 그리지 않는다. 서버 컴포넌트 page가 client 모듈의 영역을
  // 그려도 prerender HTML에는 띄우는 버튼만 있고 영역(aria-label="알림")·alertdialog는 없다.
  assert(
    html?.includes("알림 띄우기") === true && !html.includes('aria-label="알림"'),
    "Toast 영역이 prerender HTML에 그려졌거나 client Component(AppToasts)가 렌더되지 않았다",
  );

  // TagGroup(client)이 prerender한 HTML(티켓 33). 서버 컴포넌트가 넘긴 태그(lazy 참조)가 prerender 때 모여
  // 이름 있는 grid 안의 row·gridcell로 그려진다. 태그 색은 data-color(기본 gray), 비활성 태그는 aria-disabled다.
  // onRemove가 없어 지우기 버튼이 없다.
  const tagGroupName = html?.indexOf('aria-label="입력한 키워드"') ?? -1;
  const tagGroupStart = tagGroupName >= 0 ? (html?.lastIndexOf("<div", tagGroupName) ?? -1) : -1;
  const tagGroupEnd = tagGroupStart >= 0 ? (html?.indexOf("보관</span>", tagGroupStart) ?? -1) : -1;
  const tagGroupHtml =
    tagGroupStart >= 0 && tagGroupEnd >= 0
      ? (html?.slice(tagGroupStart, tagGroupEnd + 20) ?? "")
      : "";
  const tagRow = (text: string): string =>
    tagGroupHtml.match(
      new RegExp(`<div[^>]*role="row"[^>]*><div[^>]*role="gridcell"[^>]*><span[^>]*>${text}<`),
    )?.[0] ?? "";
  assert(
    tagGroupHtml !== "" &&
      (tagGroupHtml.match(/role="row"/g) ?? []).length === 3 &&
      tagRow("리액트").includes('data-color="gray"') &&
      tagRow("디자인").includes('data-color="blue"') &&
      tagRow("보관").includes('aria-disabled="true"') &&
      tagGroupHtml.slice(0, tagGroupHtml.indexOf(">")).includes('role="grid"') &&
      !tagGroupHtml.includes("<button"),
    "TagGroup이 prerender한 HTML에서 grid·row·gridcell 역할, 색, 비활성 상태가 기대와 다르다",
  );

  // Select(client)가 Field 안에서 prerender한 HTML(티켓 28). 서버 컴포넌트가 넘긴 옵션(lazy 참조)이 prerender 때
  // 모여, 트리거가 기본값 글자를 보이고 숨은 select에 옵션과 고른 값이 있다. 트리거 id는 label for가 가리키고
  // aria-labelledby에 label, aria-describedby에 설명·오류가 있으며 오류 상태다. 목록은 열 때 portal되어 HTML에 없다.
  const selectTrigger =
    html?.match(/<button[^>]*aria-haspopup="listbox"[^>]*>.*?<\/button>/)?.[0] ?? "";
  const selectId = /\sid="([^"]+)"/.exec(selectTrigger)?.[1];
  const selectLabelledBy = /aria-labelledby="([^"]+)"/.exec(selectTrigger)?.[1]?.split(" ") ?? [];
  const selectDescribedBy = /aria-describedby="([^"]+)"/.exec(selectTrigger)?.[1]?.split(" ") ?? [];
  const hiddenSelect = html?.match(/<select[^>]*name="fruit"[^>]*>.*?<\/select>/)?.[0] ?? "";
  assert(
    selectId !== undefined &&
      html?.includes(`for="${selectId}"`) === true &&
      selectTrigger.includes('type="button"') &&
      selectTrigger.includes('aria-expanded="false"') &&
      /aria-invalid="true"/.test(selectTrigger) &&
      selectTrigger.includes("바나나") &&
      selectLabelledBy.length === 2 &&
      selectLabelledBy.every((id) => html.includes(`id="${id}"`)) &&
      selectDescribedBy.length === 2 &&
      /<option[^>]*value="apple"/.test(hiddenSelect) &&
      /<option[^>]*value="banana"[^>]*selected=""/.test(hiddenSelect) &&
      /\srequired=""/.test(hiddenSelect) &&
      !html.includes('role="listbox"'),
    "Select가 prerender한 HTML에서 트리거 이름·설명·오류·기본값이나 숨은 select가 기대와 다르다",
  );

  // Combobox(client)가 Field 안에서 prerender한 HTML(티켓 29). 입력은 combobox 역할이고 id를 label for가 가리키며,
  // aria-describedby는 Field의 설명·오류 두 개뿐이다(React Aria가 만든 값·설명·오류 빈 자리 id가 남지 않는다).
  // 기본값 옵션의 글자가 입력 value에, 옵션 value가 숨은 input에 있다. 목록은 열 때 portal되어 HTML에 없다.
  const comboboxInput = html?.match(/<input[^>]*role="combobox"[^>]*>/)?.[0] ?? "";
  const comboboxId = /\sid="([^"]+)"/.exec(comboboxInput)?.[1];
  const comboboxDescribedBy =
    /aria-describedby="([^"]+)"/.exec(comboboxInput)?.[1]?.split(" ") ?? [];
  const comboboxHidden = html?.match(/<input[^>]*name="country"[^>]*>/)?.[0] ?? "";
  assert(
    comboboxId !== undefined &&
      html?.includes(`for="${comboboxId}"`) === true &&
      comboboxInput.includes('aria-expanded="false"') &&
      comboboxInput.includes('aria-autocomplete="list"') &&
      comboboxInput.includes('value="일본"') &&
      /aria-invalid="true"/.test(comboboxInput) &&
      /\srequired=""/.test(comboboxInput) &&
      comboboxDescribedBy.length === 2 &&
      comboboxDescribedBy.every((id) => html.includes(`id="${id}"`)) &&
      comboboxHidden.includes('type="hidden"') &&
      comboboxHidden.includes('value="jp"'),
    "Combobox가 prerender한 HTML에서 입력 이름·설명·오류·기본값이나 숨은 input이 기대와 다르다",
  );

  // Menu(client)가 prerender한 HTML(티켓 27). 트리거는 Button 모양의 type=button이고 닫혀 있어 aria-expanded가
  // false다. 목록은 열 때 body로 portal되므로 HTML에 menu 역할이 없다.
  const menuTrigger = html?.match(/<button[^>]*aria-haspopup="true"[^>]*>/)?.[0] ?? "";
  assert(
    menuTrigger.includes('type="button"') &&
      menuTrigger.includes('aria-expanded="false"') &&
      !html?.includes('role="menu"'),
    "Menu가 prerender한 HTML에서 트리거 속성·닫힌 상태가 기대와 다르다",
  );

  // Tooltip(client)이 prerender한 HTML(티켓 26). 트리거는 IconButton 모양의 type=button이고 닫혀 있어
  // aria-describedby가 없다. 설명은 열 때 body로 portal되므로 HTML에 tooltip 역할이 없다.
  const tooltipTrigger = html?.match(/<button[^>]*aria-label="새 항목"[^>]*>/)?.[0] ?? "";
  assert(
    tooltipTrigger.includes('type="button"') &&
      tooltipTrigger.includes('data-color="neutral"') &&
      !tooltipTrigger.includes("aria-describedby") &&
      !html?.includes('role="tooltip"'),
    "Tooltip이 prerender한 HTML에서 트리거 속성·닫힌 상태가 기대와 다르다",
  );

  // 5. 아이콘 tree-shaking: 페이지가 쓴 아이콘만 빌드 결과에 들어간다.
  // 도형 데이터는 원본 SVG에서 생성되므로, 쓰지 않은 아이콘의 도형 문자열이 없으면 파일 단위로 빠진 것이다.
  const builtJs = (
    await Promise.all(
      (await filesUnder(join(consumerDir, ".next"), ".js")).map((file) => readFile(file, "utf8")),
    )
  ).join("\n");
  const iconShape = async (file: string): Promise<string> => {
    const source = await readFile(
      join(consumerDir, "node_modules/@tide-design/icons/dist/generated", file),
      "utf8",
    );
    const d = /d: "([^"]+)"/.exec(source)?.[1];
    if (!d) {
      throw new Error(`${file}에서 도형을 찾지 못했다.`);
    }

    return d;
  };
  if (!builtJs.includes(await iconShape("plus-icon.js"))) {
    throw new Error("아이콘 확인 실패: 페이지가 쓴 PlusIcon의 도형이 빌드 결과에 없다");
  }
  // Checkbox·Radio 표시 아이콘은 Component가 쓰므로 빌드 결과에 있다.
  for (const file of ["check-icon.js", "minus-icon.js"]) {
    if (!builtJs.includes(await iconShape(file))) {
      throw new Error(`아이콘 확인 실패: Checkbox가 쓰는 ${file}의 도형이 빌드 결과에 없다`);
    }
  }
  // Alert 상태 아이콘도 Component가 쓰므로 빌드 결과에 있다(티켓 20).
  for (const file of ["info-icon.js", "triangle-exclamation-point-icon.js"]) {
    if (!builtJs.includes(await iconShape(file))) {
      throw new Error(`아이콘 확인 실패: Alert가 쓰는 ${file}의 도형이 빌드 결과에 없다`);
    }
  }
  // Avatar fallback 아이콘도 Component가 쓰므로 빌드 결과에 있다(티켓 21).
  if (!builtJs.includes(await iconShape("user-icon.js"))) {
    throw new Error("아이콘 확인 실패: Avatar가 쓰는 user-icon.js의 도형이 빌드 결과에 없다");
  }
  // Breadcrumb 구분자와 Pagination 화살표 아이콘도 Component가 쓰므로 빌드 결과에 있다(티켓 24).
  // 생략 아이콘(ellipsis-icon.js)은 path 없이 circle만 있어 이 도형 비교로는 보지 않는다. prerender HTML 확인이 대신한다.
  for (const file of ["chevron-right-icon.js", "chevron-left-icon.js"]) {
    if (!builtJs.includes(await iconShape(file))) {
      throw new Error(
        `아이콘 확인 실패: Breadcrumb·Pagination이 쓰는 ${file}의 도형이 빌드 결과에 없다`,
      );
    }
  }
  if (builtJs.includes(await iconShape("house-icon.js"))) {
    throw new Error(
      "아이콘 확인 실패: 쓰지 않은 HouseIcon이 빌드 결과에 들어갔다(tree-shaking 실패)",
    );
  }

  console.log("\nsmoke 통과");
  await rm(workDir, { recursive: true, force: true });
} catch (error) {
  console.error(`\nsmoke 실패. 작업 폴더를 남겨 둔다: ${workDir}`);
  throw error;
}
