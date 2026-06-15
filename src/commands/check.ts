import { Command } from "commander";
import ora from "ora";
import { parseFile, parseStdin } from "../parser/markdown.js";
import { analyzeDocument } from "../llm/client.js";
import { renderResult, renderJson } from "../ui/render.js";

export function createCheckCommand(): Command {
  const cmd = new Command("check");

  cmd
    .description("설계 문서를 분석하여 오버엔지니어링 여부를 판독합니다")
    .argument("[file]", "분석할 Markdown 파일 경로 (생략 시 --stdin 필요)")
    .option("--stdin", "stdin에서 문서를 읽습니다")
    .option("--format <format>", "출력 형식: text | json", "text")
    .option("--model <model>", "사용할 LLM 모델 (LLM_MODEL 환경변수 오버라이드)")
    .action(async (file: string | undefined, options: { stdin?: boolean; format: string; model?: string }) => {
      // 모델 오버라이드
      if (options.model) {
        process.env.LLM_MODEL = options.model;
      }

      // 문서 로딩
      let doc;
      try {
        if (options.stdin || !file) {
          const chunks: Buffer[] = [];
          for await (const chunk of process.stdin) {
            chunks.push(chunk as Buffer);
          }
          const raw = Buffer.concat(chunks).toString("utf-8");
          if (!raw.trim()) {
            console.error("오류: stdin이 비어 있습니다. 파일 경로 또는 --stdin과 파이프를 사용하세요.");
            process.exit(1);
          }
          doc = parseStdin(raw);
        } else {
          doc = parseFile(file);
        }
      } catch (err) {
        console.error(`파일 읽기 실패: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
      }

      // LLM 분석
      const spinner = ora({
        text: `분석 중... (약 ${doc.estimatedTokens.toLocaleString()} 토큰)`,
        color: "cyan",
      }).start();

      let result;
      try {
        result = await analyzeDocument(doc.content);
        spinner.succeed("분석 완료");
      } catch (err) {
        spinner.fail("분석 실패");
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }

      // 출력
      if (options.format === "json") {
        renderJson(result);
      } else {
        renderResult(result, doc.label);
      }
    });

  return cmd;
}
