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
    tarballs[`@tide-tds/${name}`] = `file:${join(tarballDir, created)}`;
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
  const componentsDist = join(consumerDir, "node_modules/@tide-tds/components/dist");
  const startsWithUseClient = async (file: string): Promise<boolean> =>
    /^["']use client["']/.test(await readFile(join(componentsDist, file), "utf8"));
  // IconButton도 같은 이유로 client 경계다(티켓 14). Link와 공유 모듈(pressable.js)은 이벤트를 DOM에 넘기지 않는다.
  const clientFiles = ["Button.js", "IconButton.js"];
  // Badge·Card·Separator는 표시만 하는 서버 컴포넌트다(티켓 19).
  const serverFiles = [
    "Spinner.js",
    "Link.js",
    "pressable.js",
    "Badge.js",
    "Card.js",
    "Separator.js",
    // Alert는 onClose를 IconButton에 그대로 넘길 뿐 핸들러를 만들지 않는다. 공유 스타일 모듈도 서버용이다(티켓 20).
    "Alert.js",
    "alert-style.js",
    // Avatar는 hook·state·이벤트 없이 로드 실패 fallback을 CSS 층으로 처리한다(티켓 21).
    "Avatar.js",
    // Skeleton·Progress는 표시만 하는 서버 컴포넌트다(티켓 22).
    "Skeleton.js",
    "Progress.js",
    // Table은 시맨틱 표 요소만 쓰는 서버 컴포넌트다(티켓 23).
    "Table.js",
    // Breadcrumb·Pagination은 함수를 만들지 않고 Button·IconButton에 props만 넘기는 서버 컴포넌트다(티켓 24).
    "Breadcrumb.js",
    "Pagination.js",
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
    "Input.js",
    "Textarea.js",
    "field-context.js",
    "Checkbox.js",
    "CheckboxGroup.js",
    "Radio.js",
    "RadioGroup.js",
    "choice-group.js",
    "Switch.js",
  ]) {
    if (!(await startsWithUseClient(file))) {
      throw new Error(`"use client" 확인 실패: ${file}에 지시어가 없다`);
    }
  }
  if (await startsWithUseClient("Field.js")) {
    throw new Error('"use client" 확인 실패: Field.js는 서버 컴포넌트라 지시어가 없어야 한다');
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

  // 5. 아이콘 tree-shaking: 페이지가 쓴 아이콘만 빌드 결과에 들어간다.
  // 도형 데이터는 원본 SVG에서 생성되므로, 쓰지 않은 아이콘의 도형 문자열이 없으면 파일 단위로 빠진 것이다.
  const builtJs = (
    await Promise.all(
      (await filesUnder(join(consumerDir, ".next"), ".js")).map((file) => readFile(file, "utf8")),
    )
  ).join("\n");
  const iconShape = async (file: string): Promise<string> => {
    const source = await readFile(
      join(consumerDir, "node_modules/@tide-tds/icons/dist/generated", file),
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
