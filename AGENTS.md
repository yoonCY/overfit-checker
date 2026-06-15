# Overfit Checker — AI Collaboration Guide

이 파일은 Codex, Antigravity 등 AI 코딩 에이전트가 이 레포지토리에 기여할 때 따라야 할 작업 가이드입니다.

---

## 프로젝트 방향

**Overfit Checker**는 설계 문서, PR 계획, README를 입력받아
"이거 과한가?"를 판독하고 더 작은 대안을 제시하는 **독립 CLI 도구**입니다.

### 관계
```text
Govail (AI Governance Platform)
    ↑ 사용
overfit-checker (설계 검증 도구)
```

Govail의 일부가 아닙니다. 독립 실행 가능해야 합니다.

---

## 컴포넌트 구조

| 디렉토리/파일 | 역할 |
|---|---|
| `src/index.ts` | CLI 진입점 (`overfit-check` 바이너리) |
| `src/commands/check.ts` | `check` 서브커맨드 |
| `src/llm/client.ts` | OpenAI-compatible LLM 클라이언트 |
| `src/llm/prompt.ts` | 시스템 프롬프트 + 분석 템플릿 |
| `src/parser/markdown.ts` | Markdown 파일 읽기 및 전처리 |
| `src/schema/result.ts` | Zod 스키마 (OverfitResult) |
| `src/ui/render.ts` | 터미널 출력 렌더러 (chalk) |
| `examples/` | 테스트용 샘플 문서 |
| `tests/` | Vitest 단위 테스트 |

---

## 제품 원칙

- **Minimal**: 의존성을 최소화한다. Docker, DB, 외부 인프라 없이 동작해야 한다.
- **Standalone**: Govail 게이트웨이 없이도 `.env`에서 LLM URL만 바꾸면 동작한다.
- **Honest**: 탐지 결과는 근거와 함께 제시한다. 막연한 "복잡하다"는 금지.
- **Safe Demos**: 예제는 실제 API 키 없이 mock 환경에서 실행 가능해야 한다.

---

## 엔지니어링 워크플로우

```bash
# 의존성 설치
pnpm install

# 개발 실행 (빌드 없이)
pnpm dev -- check examples/govail-runtime-spec.md

# 빌드
pnpm build

# 빌드 후 실행
node dist/index.js check examples/govail-runtime-spec.md

# 전체 검사
pnpm check   # lint + typecheck + test
```

---

## 현재 하지 말 것

- 웹 UI 추가 (CLI가 MVP)
- DB 또는 영속성 레이어 추가 (상태 없는 도구)
- Govail 내부 컴포넌트(Temporal, SurrealDB)에 의존
- 실제 API 키 또는 내부 호스트명 커밋
- 분석 결과 서버 전송 (로컬 전용)

---

## 버전 관리

- API 스키마 불안정 기간: `v0.x.y` 태그 사용
- `pnpm-lock.yaml` 커밋 유지
- `.env`는 절대 커밋 금지, `.env.example`만 커밋
