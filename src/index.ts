import "dotenv/config";
import { Command } from "commander";
import { createCheckCommand } from "./commands/check.js";
import { createUiCommand } from "./commands/ui.js";

const program = new Command();

program
  .name("overfit-check")
  .description("설계 문서의 오버엔지니어링 여부를 판독하고 더 작은 대안을 제시합니다")
  .version("0.1.0");

program.addCommand(createCheckCommand());
program.addCommand(createUiCommand());

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});

