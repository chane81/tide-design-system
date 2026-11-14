# 01: 공개 Props를 `XxxOwnProps`로 나누고 JSDoc에 Tide props 목록 적기

Status: ready-for-human

## What to build

자동완성에서 Tide props가 네이티브 속성에 묻히지 않게 공개 Props마다 `XxxOwnProps`를 두고, Component JSDoc에 Tide props 이름 목록을 한 줄로 적는다([ADR 0031](../../../decisions/0031-own-props-split-and-jsdoc-list.md)).

## 할 일

- [x] icons: `IconOwnProps` 분리, 진입점 재수출, 생성기(`scripts/generate.ts`)가 아이콘마다 목록 줄을 쓴다.
- [x] components: 공개 Component·공개 하위 Component 53개에 OwnProps를 두고 폴더 `index.ts`·진입점에서 재수출한다.
- [x] Component JSDoc에 `Tide props: … ({@link XxxOwnProps})` 줄을 붙인다.
- [x] 드리프트 테스트: 패키지마다 `test/ownProps.test.ts`. JSDoc 목록을 읽어 `keyof XxxOwnProps`와 같은지 tsc로 검사하고, 진입점 OwnProps export와 목록 쪽을 맞춘다.
- [x] 변경 전후 d.ts의 `XxxProps`가 같은지(상호 대입, 키, 키별 타입) 한 번 비교했다. 유니온 Props는 분기별로 비교했다.
- [ ] PR 리뷰

## 판단한 곳

- OwnProps에 둔 것: Props 본문에 적던 것 전부. `IconButton`의 `aria-label`·`children`, Checkbox·Radio·Switch의 `className`·`style`, Pagination·Breadcrumb의 `aria-label`(기본 이름)처럼 네이티브 이름이어도 Tide가 뜻을 바꾼 것을 넣었다.
- Omit에 남긴 키: Checkbox·Radio `type`, Switch `type`·`role`, Avatar `children`·`role`·`aria-label`, Separator `children`·`role`, Spinner `children`, Tabs·Accordion `onChange`, Combobox `onChange`·`type`·`list`, Select `onChange`·`type`, Tab `type`·`role`·`id`, Tag `role`·`id`·`tabIndex`, MenuItem `role`, AccordionTrigger `type`·`id`·`disabled`·`aria-expanded`·`aria-controls`, AccordionPanel `id`·`hidden`·`aria-labelledby`, 오버레이 Content·TabPanel `id`·`role`, TabList `role`, ToastRegion `children`·`role`, PaginationLink·BreadcrumbLink `color`, Progress·TagGroup의 이름 속성들.
- OwnProps를 두지 않은 것: 네이티브 props가 없는 `Tooltip`·`Popover`·`Menu`·`Dialog`·`AlertDialog`·`MenuSection`·`ComboboxSection`·`SelectSection`, Tide props가 없는 `Table`·`TableHead`·`TableBody`·`TableRow`·`TableCell`·`PaginationItem`·`BreadcrumbItem`·`BreadcrumbCurrent`·`DialogTitle`·`DialogDescription`·`DialogFooter`·`VisuallyHidden`.
- `PaginationPrevious`·`PaginationNext`의 OwnProps는 IconButton에서 고정하지 않은 Tide props(`noPressScale`, `render`)까지 담는다.
- 생성 아이콘 파일은 `{@link IconOwnProps}`를 위해 `IconOwnProps`를 type import한다. tsc는 사용으로 보지만 oxlint `no-unused-vars`는 미사용으로 본다. 생성 파일은 gitignore라 `pnpm lint` 대상이 아니다.
