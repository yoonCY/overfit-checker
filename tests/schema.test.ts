import { describe, expect, it } from "vitest";
import { OverfitResultSchema } from "../src/schema/result.js";

describe("OverfitResultSchema", () => {
  const validResult = {
    complexity_score: 8,
    verdict: "과도",
    problem_size: "Small",
    solution_size: "Platform",
    overfit_items: [
      {
        title: "DSL 컴파일러",
        reason: "현재 문제에 컴파일러가 필요 없음",
        risk: "high",
      },
    ],
    alternative: {
      description: "파일 읽기 → 의존성 추출 → JSON 출력",
      savings: "6주 → 1주",
    },
    next_tasks: [
      { order: 1, task: "파일 읽기 함수" },
      { order: 2, task: "의존성 파싱" },
      { order: 3, task: "JSON 출력" },
    ],
    summary: "1명 팀에 컴파일러와 Actor 시스템은 과도함",
    reasoning:
      "이 프로젝트는 1명 팀을 위한 단순한 도구입니다. 하지만 Actor 시스템과 독자적인 DSL 컴파일러를 추가하여 유지보수 비용을 크게 늘렸습니다. 이는 명백한 과적합(Overfit) 설계입니다.",
  };

  it("유효한 결과를 파싱한다", () => {
    const result = OverfitResultSchema.safeParse(validResult);
    expect(result.success).toBe(true);
  });

  it("complexity_score가 1~10 범위를 벗어나면 실패한다", () => {
    const invalid = { ...validResult, complexity_score: 0 };
    const result = OverfitResultSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("overfit_items가 5개를 초과하면 실패한다", () => {
    const tooMany = {
      ...validResult,
      overfit_items: Array.from({ length: 6 }, (_, i) => ({
        title: `항목 ${i}`,
        reason: "이유",
        risk: "low",
      })),
    };
    const result = OverfitResultSchema.safeParse(tooMany);
    expect(result.success).toBe(false);
  });

  it("next_tasks가 정확히 3개여야 한다", () => {
    const twoTasks = {
      ...validResult,
      next_tasks: [
        { order: 1, task: "작업 1" },
        { order: 2, task: "작업 2" },
      ],
    };
    const result = OverfitResultSchema.safeParse(twoTasks);
    expect(result.success).toBe(false);
  });

  it("verdict가 적정|주의|과도 중 하나여야 한다", () => {
    const invalid = { ...validResult, verdict: "unknown" };
    const result = OverfitResultSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("problem_size가 올바른 enum 값이어야 한다", () => {
    const invalid = { ...validResult, problem_size: "Gigantic" };
    const result = OverfitResultSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("solution_size가 올바른 enum 값이어야 한다", () => {
    const invalid = { ...validResult, solution_size: "Monolith" };
    const result = OverfitResultSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
