import chalk from "chalk";
import type { OverfitResult } from "../schema/result.js";

const RISK_BADGE = {
  low: chalk.green("낮음"),
  medium: chalk.yellow("중간"),
  high: chalk.red("높음"),
} as const;

const VERDICT_STYLE = {
  적정: chalk.green,
  주의: chalk.yellow,
  과도: chalk.red,
} as const;

/**
 * 분석 결과를 터미널에 출력한다.
 */
export function renderResult(result: OverfitResult, label: string): void {
  const bar = chalk.dim("─".repeat(50));

  console.log();
  console.log(chalk.bold(`🔍  Overfit Analysis — ${chalk.cyan(label)}`));
  console.log(bar);
  console.log();

  // 복잡도 점수
  const scoreStyle = VERDICT_STYLE[result.verdict];
  const scoreBar = buildScoreBar(result.complexity_score);
  console.log(
    `📊  복잡도 점수   ${scoreStyle.bold(String(result.complexity_score))} / 10   ${scoreBar}   ${scoreStyle.bold(result.verdict)}`,
  );
  console.log();
  console.log(chalk.dim(`    ${result.summary}`));
  console.log();
  console.log(bar);

  // 과도한 설계 요소
  if (result.overfit_items.length === 0) {
    console.log();
    console.log(chalk.green("✅  과도한 설계 요소 없음 — 적정한 설계입니다."));
  } else {
    console.log();
    console.log(chalk.bold.red(`🚨  과도한 설계 요소 (${result.overfit_items.length}개)`));
    console.log();
    for (const [i, item] of result.overfit_items.entries()) {
      console.log(`  ${chalk.bold(`${i + 1}.`)} ${chalk.yellow(item.title)}   ${RISK_BADGE[item.risk]}`);
      console.log(`     ${chalk.dim(item.reason)}`);
      console.log();
    }
  }

  console.log(bar);

  // 더 작은 대안
  console.log();
  console.log(chalk.bold("💡  더 작은 대안"));
  console.log();
  console.log(`  ${result.alternative.description}`);
  console.log(`  ${chalk.dim("절감: " + result.alternative.savings)}`);
  console.log();
  console.log(bar);

  // 다음 최소 작업
  console.log();
  console.log(chalk.bold("✅  다음 최소 작업"));
  console.log();
  for (const task of result.next_tasks) {
    console.log(`  ${chalk.bold.green(task.order + ".")} ${task.task}`);
  }
  console.log();
}

/**
 * JSON 포맷으로 출력한다.
 */
export function renderJson(result: OverfitResult): void {
  console.log(JSON.stringify(result, null, 2));
}

function buildScoreBar(score: number): string {
  const filled = Math.round(score / 2); // 10점 → 5칸
  const empty = 5 - filled;
  const color = score >= 8 ? chalk.red : score >= 5 ? chalk.yellow : chalk.green;
  return color("█".repeat(filled)) + chalk.dim("░".repeat(empty));
}
