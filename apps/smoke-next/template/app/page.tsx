// 서버 컴포넌트에서 래퍼 없이 바로 import한다.
// 이 파일에는 Component 내부 class(예: VisuallyHidden의 class)를 직접 쓰지 않는다.
// 그래야 출력 CSS에 그 class가 있을 때 패키지 CSS의 @source가 동작했다고 볼 수 있다.
import {
  Badge,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  cn,
  Field,
  IconButton,
  Input,
  Link as TideLink,
  Radio,
  RadioGroup,
  Separator,
  Spinner,
  Switch,
  Textarea,
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
        {/* Switch는 Field context를 읽는 client Component다. 서버 컴포넌트에서 children label로 쓴다.
            thumb 이동 class는 이 파일에 쓰지 않는다(이름을 주석에 적어도 Tailwind가 스캔한다). */}
        <Switch name="news" defaultChecked>
          소식 받기
        </Switch>
      </form>
      {/* Badge·Card·Separator는 서버 컴포넌트다(티켓 19). 내부 class는 이 파일에 쓰지 않는다(주석에도 이름을 적지 않는다). */}
      <Card render={<article aria-label="배포" />}>
        <p>
          배포 상태 <Badge color="success">완료</Badge>
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
      {/* 아이콘은 PlusIcon 하나만 쓴다. 다른 아이콘이 빌드 결과에 없는지 smoke가 확인한다. */}
      <PlusIcon aria-label="추가" />
    </main>
  );
}
