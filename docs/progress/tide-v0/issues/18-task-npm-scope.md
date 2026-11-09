# npm scope @tide-tds 확보

Type: task
Status: resolved
Blocked by: 없음

## Question

npm에 `tide-tds` organization이 없으면 만들어서 `@tide-tds` scope를 확보한다. 2026-11-08에 `@tide-tds/react`와 `@tide-tds/tokens`는 registry에서 404로 확인됨(아직 아무도 쓰지 않음). org 페이지는 봇 접근이 차단되어 org가 이미 있는지는 확인하지 못함. 사람이 해야 하는 작업(HITL): npmjs.com 로그인 → Add Organization → 이름 `tide-tds`.

## Answer

`@tide-tds` scope를 확보했다(2026-11-09).

- **org**: `tide-tds`, 무료 플랜(Unlimited public packages). scope는 org 이름과 같은 `@tide-tds`다. npm 공식 문서 [Creating an organization](https://docs.npmjs.com/creating-an-organization)에 "Your organization name will also be your organization scope"라고 되어 있다.
- **owner**: npm 계정 `charles-green`. `npm org ls tide-tds` 결과는 `charles-green - owner`다. 2FA가 켜져 있다.
- **예비 org**: 같은 계정으로 `tide-green`, `tide-factory`도 만들었다. 현재 계획에서는 쓰지 않는다. 한 계정이 org를 여러 개 만들 수 있다는 것을 이 과정에서 확인했다(문서에는 개수 제한에 대한 언급이 없다).
- **바꾸지 않은 것**: 원래 쓰던 개인 계정은 비밀번호와 2FA를 잃어버려 npm support에 복구를 문의 중이다. 복구되더라도 `@tide`는 쓸 수 없다. `tide`라는 이름은 이미 다른 사용자나 org가 쓰고 있다(`npm org ls tide`가 `tide - owner`를 돌려준다).
- **이후 작업**: CI에서 publish하는 방식(trusted publishing, 토큰)과 2FA 우회 토큰 제한에 대한 대응은 지도의 "버전과 배포 정책"에서 다룬다. 이번 로그인에서 npm은 "npm tokens that bypass 2FA are being restricted for account changes and direct publishing"이라고 안내했다.

## Comments

- 2026-11-09 진행 중. `npm org ls tide-tds`가 `404 Scope not found`를 돌려줬다. 따라서 `tide-tds` org는 아직 없다. 로그인했던 계정은 전 직장 계정이라 쓰지 않는다. 개인 계정은 비밀번호와 2FA를 모두 잃어버린 상태여서 npm support에 계정 복구를 문의한다. 복구되면 그 계정으로 org를 만든다. 기다리는 동안 새 계정으로 org를 먼저 만들어 둘 수도 있다(나중에 owner를 넘기면 된다).
