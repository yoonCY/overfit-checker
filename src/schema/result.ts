import { z } from "zod";

// 개별 과도한 설계 요소
export const OverfitItemSchema = z.object({
  title: z.string().describe("과도한 설계 요소 이름"),
  reason: z.string().describe("왜 과도한지 설명"),
  risk: z.enum(["low", "medium", "high"]).describe("리스크 수준"),
});

// 더 작은 대안
export const AlternativeSchema = z.object({
  description: z.string().describe("더 작은 대안 설명"),
  savings: z.string().describe("줄일 수 있는 복잡도/작업량"),
});

// 다음 최소 작업
export const NextTaskSchema = z.object({
  order: z.number().int().min(1).max(3).describe("순서"),
  task: z.string().describe("최소 작업 설명"),
});

// 전체 분석 결과
export const OverfitResultSchema = z.object({
  complexity_score: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("복잡도 점수 (1=단순, 10=극단적 오버엔지니어링)"),
  verdict: z
    .enum(["적정", "주의", "과도"])
    .describe("1~4: 적정, 5~7: 주의, 8~10: 과도"),
  overfit_items: z
    .array(OverfitItemSchema)
    .min(0)
    .max(5)
    .describe("과도한 설계 요소 목록 (최대 5개)"),
  alternative: AlternativeSchema.describe("더 작은 대안"),
  next_tasks: z
    .array(NextTaskSchema)
    .length(3)
    .describe("다음 최소 작업 3개"),
  summary: z.string().describe("한 줄 요약"),
});

export type OverfitItem = z.infer<typeof OverfitItemSchema>;
export type Alternative = z.infer<typeof AlternativeSchema>;
export type NextTask = z.infer<typeof NextTaskSchema>;
export type OverfitResult = z.infer<typeof OverfitResultSchema>;
