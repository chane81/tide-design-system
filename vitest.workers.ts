// 패키지 vitest 설정이 함께 쓰는 동시 실행 수(test worker 수).
// - CI: 제한하지 않는다(vitest 기본값, 가능한 병렬 전부). GitHub Actions는 CI=true를 주고 turbo도 이 값을 task에 넘긴다.
// - 로컬: 테스트가 다른 작업을 막지 않게 줄인다. 퍼센트는 os.availableParallelism() 기준이다(vitest 5.1.0 maxWorkers).
//   `pnpm test`는 turbo가 components·docs 브라우저 테스트를 함께 돌린다. 브라우저 탭 하나가 화면 그리기까지 CPU로 해서
//   1코어 넘게 쓰므로, 두 패키지 합이 CPU 약 60%가 되는 값을 실측으로 골랐다(10코어, 2026-11-13):
//   제한 없음 평균 59%·p90 81%·1분 15초, 30% 평균 37%·p90 72%, 20% 평균 25%·p90 60%·1분 34초,
//   1개 평균 13%·p90 38%·2분 58초. 시작할 때 Vite 변환과 첫 렌더로 잠깐 더 튈 수 있다.
//   더 줄이거나 늘리려면 TIDE_TEST_WORKERS(예: "1", "50%")로 덮어쓴다. turbo.json의 globalPassThroughEnv에 있어 task까지 간다.
export const maxWorkers: number | string | undefined = process.env["CI"]
  ? undefined
  : (process.env["TIDE_TEST_WORKERS"] ?? "20%");
