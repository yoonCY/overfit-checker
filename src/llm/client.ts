import "dotenv/config";
import OpenAI from "openai";
import { OverfitResultSchema, type OverfitResult } from "../schema/result.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.js";

/**
 * LLM 클라이언트 설정
 * .env에서 LLM_BASE_URL, LLM_API_KEY, LLM_MODEL 읽음
 */
function createClient(): OpenAI {
  const baseURL = process.env.LLM_BASE_URL ?? "http://localhost:14000/v1";
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error(
      "LLM_API_KEY 환경 변수가 설정되지 않았습니다.\n" +
        "cp .env.example .env 후 LLM_API_KEY를 설정해주세요.",
    );
  }

  return new OpenAI({ baseURL, apiKey });
}

/**
 * 설계 문서를 LLM에 전송하고 분석 결과를 반환한다.
 */
export async function analyzeDocument(documentContent: string): Promise<OverfitResult> {
  const client = createClient();
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(documentContent) },
    ],
    temperature: 0.3, // 일관된 판단을 위해 낮게 설정
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content;

  if (!raw) {
    throw new Error("LLM이 빈 응답을 반환했습니다.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`LLM 응답 JSON 파싱 실패:\n${raw}`);
  }

  const result = OverfitResultSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(`LLM 응답 스키마 검증 실패:\n${result.error.message}`);
  }

  return result.data;
}
