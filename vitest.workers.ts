// 패키지 vitest 설정이 함께 쓰는 worker 수. CI(CI=true)는 제한하지 않는다.
// 로컬 20%는 CPU 약 60%에 머물게 실측한 값이다(docs/agents/testing.md). TIDE_TEST_WORKERS로 덮어쓴다(turbo globalPassThroughEnv).
export const maxWorkers: number | string | undefined = process.env["CI"]
  ? undefined
  : (process.env["TIDE_TEST_WORKERS"] ?? "20%");
