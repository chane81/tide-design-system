// 서버 컴포넌트에서 래퍼 없이 바로 import한다.
// 이 파일에는 Component 내부 class(예: VisuallyHidden의 class)를 직접 쓰지 않는다.
// 그래야 출력 CSS에 그 class가 있을 때 패키지 CSS의 @source가 동작했다고 볼 수 있다.
import {
  Alert,
  AlertDialog,
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Field,
  IconButton,
  Input,
  Link as TideLink,
  Menu,
  MenuContent,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  SelectSection,
  Combobox,
  ComboboxItem,
  ComboboxSection,
  Progress,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Typography,
  VisuallyHidden,
} from "@tide-tds/components";
import { PlusIcon } from "@tide-tds/icons";
import Link from "next/link";

import { brandColor } from "./colors";

export default function Page() {
  return (
    <main>
      <h1 className={cn("p-4", "bg-primary-solid")}>Tide smoke</h1>
      <VisuallyHidden>스크린리더 전용 텍스트</VisuallyHidden>
      {/* 서버 컴포넌트에서 render 병합까지 쓴다. 텍스트 스타일 class는 이 파일에 쓰지 않는다. */}
      <Typography variant="heading-lg">제목</Typography>
      <Typography variant="caption" render={<small />}>
        보조 설명
      </Typography>
      {/* radius·Elevation·포커스 표시 Utility class를 앱 코드에서 직접 쓴다. */}
      <section className="rounded-lg border border-raised bg-raised shadow-md">
        <button type="button" className="rounded-md focus-visible:focus-ring">
          저장
        </button>
        <input aria-label="이름" className="border border-default focus:focus-field" />
      </section>
      {/* motion·쌓임 단계 Utility class를 앱 코드에서 직접 쓴다. */}
      <header className="sticky top-0 z-sticky transition-colors">
        <p className="transition-opacity duration-normal ease-out">헤더</p>
      </header>
      {/* Spinner는 서버 컴포넌트다. 회전 class는 이 파일에 쓰지 않는다(주석에도 이름을 적지 않는다). */}
      <Spinner size="sm" aria-label="불러오는 중" />
      {/* 앱 브랜드 색(앱 Role)을 data-color로 고르고 accent Utility class로 칠한다. */}
      <p data-color={brandColor} className="bg-accent-solid text-accent-on-solid">
        브랜드
      </p>
      {/* Button은 client Component다. 서버 컴포넌트에서 Next Link를 render로 넘긴다. 누름 축소 class는 이 파일에 쓰지 않는다. */}
      <Button variant="outline" size="sm">
        저장
      </Button>
      <Button render={<Link href="/settings" />}>설정</Button>
      {/* 앱 Role을 Button color로 쓴다(RoleRegistry augmentation은 colors.ts). */}
      <Button color="brand">브랜드 버튼</Button>
      {/* IconButton은 client Component다. 서버 컴포넌트에서 아이콘과 Next Link render를 넘긴다. */}
      <IconButton aria-label="추가" size="xs">
        <PlusIcon />
      </IconButton>
      <IconButton aria-label="설정" variant="ghost" render={<Link href="/settings" />}>
        <PlusIcon />
      </IconButton>
      {/* Link는 서버 컴포넌트다. Next Link를 render로 넘긴다. 밑줄 class는 이 파일에 쓰지 않는다. */}
      <p>
        <TideLink render={<Link href="/docs" />} color="brand">
          문서
        </TideLink>
      </p>
      {/* Field는 서버 컴포넌트로 client 모듈의 context provider를 렌더하고, Input·Textarea(client)가 값을 읽는다.
          입력창 내부 class는 이 파일에 쓰지 않는다(주석도 Tailwind 스캔 대상이라 이름도 적지 않는다). */}
      <form>
        <Field label="이메일" description="회사 메일" error="형식이 아닙니다." required>
          <Input name="email" type="email" size="sm" placeholder="tide@example.com" />
        </Field>
        <Field label="메모">
          <Textarea name="memo" />
        </Field>
        {/* 묶음은 Field group 안에 둔다. CheckboxGroup·RadioGroup·Checkbox·Radio는 client Component다.
            상자 내부 class는 이 파일에 쓰지 않는다(주석에도 이름을 적지 않는다). */}
        <Field label="배송" description="하나를 고릅니다." error="배송을 고르세요." group required>
          <RadioGroup name="shipping" defaultValue="fast">
            <Radio value="normal">일반</Radio>
            <Radio value="fast">빠른</Radio>
          </RadioGroup>
        </Field>
        <Field label="알림" group>
          <CheckboxGroup>
            <Checkbox name="notify" value="email" defaultChecked>
              이메일
            </Checkbox>
            <Checkbox name="notify" value="sms" indeterminate>
              문자
            </Checkbox>
          </CheckboxGroup>
        </Field>
        {/* Select는 Field context를 읽는 client Component다(티켓 28). 서버 컴포넌트에서 옵션·묶음 요소를 넘기며, 옵션
            요소는 client 참조(lazy)로 가서 prerender 때 컬렉션으로 모인다(ADR 0019). 폼 제출용 숨은 select가 함께 그려진다. */}
        <Field label="과일" description="하나를 고릅니다." error="과일을 고르세요." required>
          <Select name="fruit" defaultValue="banana" size="sm">
            <SelectItem value="apple">사과</SelectItem>
            <SelectSection heading="노란 과일">
              <SelectItem value="banana">바나나</SelectItem>
              <SelectItem value="lemon" disabled>
                레몬
              </SelectItem>
            </SelectSection>
          </Select>
        </Field>
        {/* Combobox도 Field context를 읽는 client Component다(티켓 29). 옵션은 Select와 같이 lazy 참조로 넘어가 prerender
            때 모인다. 고른 옵션의 value는 숨은 input으로 제출되고 입력에는 옵션 글자가 보인다. */}
        <Field
          label="국가"
          description="이름 일부를 쳐서 찾습니다."
          error="국가를 고르세요."
          required
        >
          <Combobox name="country" defaultValue="jp" size="lg" placeholder="국가 이름">
            <ComboboxItem value="kr">대한민국</ComboboxItem>
            <ComboboxSection heading="이웃 나라">
              <ComboboxItem value="jp">일본</ComboboxItem>
              <ComboboxItem value="cn" disabled>
                중국
              </ComboboxItem>
            </ComboboxSection>
          </Combobox>
        </Field>
        {/* Switch는 Field context를 읽는 client Component다. 서버 컴포넌트에서 children label로 쓴다.
            thumb 이동 class는 이 파일에 쓰지 않는다(이름을 주석에 적어도 Tailwind가 스캔한다). */}
        <Switch name="news" defaultChecked>
          소식 받기
        </Switch>
      </form>
      {/* Badge·Card·Separator는 서버 컴포넌트다(티켓 19). 내부 class는 이 파일에 쓰지 않는다(주석에도 이름을 적지 않는다). */}
      <Card render={<article aria-label="배포" />}>
        <p>
          배포 상태 <Badge color="success">완료</Badge> <Badge color="cyan">디자인</Badge>
        </p>
        <Separator />
        <p>
          알림 서버{" "}
          <Badge color="brand" variant="solid" size="sm">
            브랜드
          </Badge>
        </p>
        <Separator orientation="vertical" decorative />
      </Card>
      {/* Alert는 서버 컴포넌트다(티켓 20). onClose가 없어 닫기 버튼이 없다. 내부 class는 이 파일에 쓰지 않는다(주석에도 이름을 적지 않는다). */}
      <Alert color="warning" title="점검 예정">
        11월 15일 새벽 2시에 점검합니다.
      </Alert>
      <Alert color="brand" role="status" title="새 요금제" />
      {/* Avatar는 서버 컴포넌트다(티켓 21). 로드 실패 fallback도 JS 없이 처리한다. 내부 class는 이 파일에 쓰지 않는다(주석에도 이름을 적지 않는다). */}
      <p>
        <Avatar alt="홍길동" src="/avatar.png" size="lg" color="cyan" />
        <Avatar alt="" />
      </p>
      {/* Skeleton·Progress는 서버 컴포넌트다(티켓 22). 내부 class는 이 파일에 쓰지 않는다(주석에도 이름을 적지 않는다). */}
      <div aria-busy="true">
        <Skeleton variant="circle" size="sm" />
        <Skeleton />
      </div>
      <Progress value={30} max={60} color="success" aria-label="업로드" />
      {/* Table은 서버 컴포넌트다(티켓 23). 내부 class는 이 파일에 쓰지 않는다(주석에도 이름을 적지 않는다). */}
      <Table aria-label="요금제">
        <TableHead>
          <TableRow>
            <TableHeaderCell>요금제</TableHeaderCell>
            <TableHeaderCell>월 요금</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableHeaderCell scope="row">기본</TableHeaderCell>
            <TableCell>10,000원</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {/* Breadcrumb·Pagination은 서버 컴포넌트다(티켓 24). 링크는 render로 Next Link를 받는다.
          구분자·화살표·생략 아이콘은 Component가 쓴다. 내부 class는 이 파일에 쓰지 않는다(주석에도 이름을 적지 않는다). */}
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/" />}>홈</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbCurrent>설정</BreadcrumbCurrent>
        </BreadcrumbItem>
      </Breadcrumb>
      <Pagination>
        <PaginationItem>
          <PaginationPrevious disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink render={<Link href="/?page=1" />} current>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext render={<Link href="/?page=2" />} />
        </PaginationItem>
      </Pagination>
      {/* Popover는 client Component다(티켓 25). 서버 컴포넌트에서 함수 없이 요소만 넘긴다.
          닫힌 채로 prerender되고 내용은 열 때 body로 portal된다. 내부 class는 이 파일에 쓰지 않는다. */}
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>공유 범위</PopoverTrigger>
        <PopoverContent placement="bottom start">링크가 있는 사람은 볼 수 있습니다.</PopoverContent>
      </Popover>
      {/* Dialog·AlertDialog는 client Component다(티켓 30). 서버 컴포넌트에서 함수 없이 요소만 넘긴다.
          닫힌 채로 prerender되고 막·내용은 열 때 body로 portal된다. 내부 class는 이 파일에 쓰지 않는다. */}
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>이름 바꾸기</DialogTrigger>
        <DialogContent size="sm">
          <DialogTitle>이름 바꾸기</DialogTitle>
          <DialogDescription>새 이름은 모든 멤버에게 보입니다.</DialogDescription>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" color="neutral" />}>취소</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog>
        <DialogTrigger render={<Button color="danger" variant="outline" />}>
          프로젝트 삭제
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>프로젝트를 삭제할까요?</DialogTitle>
          <DialogFooter>
            <DialogClose render={<Button color="danger" />}>삭제</DialogClose>
          </DialogFooter>
        </DialogContent>
      </AlertDialog>
      {/* Tooltip은 client Component다(티켓 26). 서버 컴포넌트에서 IconButton 요소를 render로 넘긴다.
          닫힌 채로 prerender되고 설명은 열 때 body로 portal된다. 내부 class는 이 파일에 쓰지 않는다. */}
      <Tooltip>
        <TooltipTrigger
          render={
            <IconButton aria-label="새 항목" variant="ghost" color="neutral">
              <PlusIcon />
            </IconButton>
          }
        />
        <TooltipContent placement="bottom">새 항목을 만듭니다</TooltipContent>
      </Tooltip>
      {/* Menu는 client Component다(티켓 27). 서버 컴포넌트에서 항목·묶음 요소를 넘긴다. 항목 요소는 client 참조(lazy)로
          가고 목록이 열릴 때 컬렉션으로 모은다(ADR 0019). 닫힌 채로 prerender되고 목록은 열 때 body로 portal된다. */}
      <Menu>
        <MenuTrigger render={<Button variant="outline" />}>문서 동작</MenuTrigger>
        <MenuContent>
          <MenuItem>이름 바꾸기</MenuItem>
          <MenuSection heading="위험">
            <MenuItem disabled>삭제</MenuItem>
          </MenuSection>
        </MenuContent>
      </Menu>
      {/* 아이콘은 PlusIcon 하나만 쓴다(Alert 상태 아이콘은 Component가 쓴다). 다른 아이콘이 빌드 결과에 없는지 smoke가 확인한다. */}
      <PlusIcon aria-label="추가" />
    </main>
  );
}
