import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeDocument } from "../src/llm/client.js";

/**
 * Vercel Serverless Function — POST /api/check
 *
 * Express 없이 analyzeDocument()를 직접 호출합니다.
 * 로컬 테스트: vercel dev
 * 프로덕션: Vercel 자동 배포
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 (Vercel 도메인에서 프론트엔드가 API 호출 시 필요)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "POST 메서드만 허용됩니다." });
    return;
  }

  const { content } = req.body as { content?: string };

  if (!content || typeof content !== "string" || !content.trim()) {
    res.status(400).json({
      error: "분석할 마크다운 텍스트(content)가 누락되었거나 올바르지 않습니다.",
    });
    return;
  }

  try {
    const result = await analyzeDocument(content);
    res.status(200).json(result);
  } catch (err) {
    console.error("설계 분석 오류:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "서버 분석 과정에서 알 수 없는 오류가 발생했습니다.",
    });
  }
}
