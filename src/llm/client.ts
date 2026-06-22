import "dotenv/config";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import { type OverfitResult, OverfitResultSchema } from "../schema/result.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.js";

/**
 * 고베일 게이트웨이 전용 단기 만료형(15분) JWT 토큰을 발행합니다.
 */
function generateGatewayToken(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET 환경 변수가 정의되지 않았습니다.\n" +
        "고베일 게이트웨이 연동을 위해 발급받은 JWT_SECRET가 필수로 요구됩니다.",
    );
  }

  const payload = {
    sub: "vercel-overfit-checker-prod",
    project: "overfit-checker", // 게이트웨이가 JWT Secret을 조회할 프로젝트 식별자
    role: "developer",
    allowed_models: ["auto"],
    rpm: 60,
    jti: crypto.randomUUID(), // 토큰 고유 식별자 (SurrealDB 실시간 블랙리스트 조회용)
  };

  return jwt.sign(payload, secret, { expiresIn: "15m" });
}

/**
 * LLM 클라이언트 설정
 * .env에서 LLM_BASE_URL, JWT_SECRET, LLM_MODEL 읽음
 */
function createClient(): OpenAI {
  const baseURL = process.env.LLM_BASE_URL ?? "http://localhost:14000/v1";
  const apiKey = generateGatewayToken();

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
    max_tokens: 2048,
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
