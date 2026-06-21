# overfit-checker

설계 문서 / PR 계획 / README를 넣으면 **"이거 과한가?"** 를 판독하고 더 작은 대안을 제시하는 CLI + 로컬 웹 UI 도구.

---

## 문제

AI 시대에 흔히 발생하는 패턴:

```
간단한 문제
↓
Microservice + Workflow Engine + Runtime + DSL + Plugin System
```

설계가 현재 문제보다 과도한지 빠르게 판독한다.

---

## 사용법

### CLI

```bash
# 파일 입력
overfit-check check plan.md

# stdin 파이프
cat README.md | overfit-check check --stdin

# JSON 출력
overfit-check check plan.md --format json

# Markdown 출력 (복사용)
overfit-check check plan.md --format markdown

# 모델 지정
overfit-check check plan.md --model gpt-4o-mini
```

### 로컬 웹 UI

```bash
# 웹 서버 실행 + 브라우저 자동 오픈
overfit-check ui

# 포트 지정
overfit-check ui --port 8080
```

### 출력 예시 (CLI text 모드)

```
🔍  Overfit Analysis — plan.md
──────────────────────────────────────────────────

📊  복잡도 점수   8 / 10   ████░   과도

    핵심 문제(코드 분석) 대비 인프라가 과도하게 비대함.

──────────────────────────────────────────────────

🚨  과도한 설계 요소 (4개)

  1. Runtime DSL 컴파일러   높음
     현재 문제(코드 분석)에 컴파일러가 필요 없음

  2. Actor System   중간
     단순 순차 처리로 충분. 동시성 복잡도 불필요
  ...

──────────────────────────────────────────────────

💡  더 작은 대안

  파일 읽기 → 영향도 분석 → 결과 출력
  절감: 3개 함수로 해결 가능, 인프라 제로

──────────────────────────────────────────────────

✅  다음 최소 작업

  1. 파일 경로 → 의존성 목록 반환 함수
  2. 의존성 → 변경 영향 범위 계산
  3. 결과를 JSON으로 출력
```

---

## 설치

```bash
# 레포 클론 후
pnpm install
pnpm build

# 글로벌 링크 (선택)
npm link
```

---

## 설정

```bash
cp .env.example .env
# .env 편집: LLM_BASE_URL, LLM_API_KEY, LLM_MODEL
```

| 변수 | 설명 | 기본값 |
|---|---|---|
| `LLM_BASE_URL` | OpenAI-compatible 엔드포인트 | `http://localhost:14000/v1` |
| `LLM_API_KEY` | API 키 | — |
| `LLM_MODEL` | 사용할 모델명 | `gpt-4o-mini` |

**Govail 게이트웨이 사용 시**: `LLM_BASE_URL=http://localhost:14000/v1`, `LLM_API_KEY=govail-demo-admin`

**OpenAI 직접 사용 시**: `LLM_BASE_URL=https://api.openai.com/v1`, `LLM_API_KEY=sk-...`

---

## 개발

```bash
pnpm install                                         # 의존성 설치 (루트 + frontend 워크스페이스)

# CLI 개발 실행 (빌드 없이 tsx로 직접 실행)
pnpm dev -- check examples/govail-runtime-spec.md
pnpm dev -- ui --port 3000

# 빌드 (frontend → backend 순)
pnpm build

# 빌드 후 실행
node dist/index.js check examples/govail-runtime-spec.md
node dist/index.js ui --port 3000

# 전체 검사 (lint + typecheck + test)
pnpm check

# 개별 실행
pnpm lint        # Biome 정적 분석
pnpm typecheck   # TypeScript 타입 체크
pnpm test        # Vitest 단위 테스트

# Docker 기반 실행
docker compose up --build
```

---

## 기술 스택

| 레이어 | 기술 |
|---|---|
| CLI 프레임워크 | [Commander.js](https://github.com/tj/commander.js) v12 |
| 터미널 UX | [ora](https://github.com/sindresorhus/ora), [chalk](https://github.com/chalk/chalk), [@clack/prompts](https://github.com/bombshell-dev/clack) |
| LLM 클라이언트 | [openai](https://github.com/openai/openai-node) SDK v4 (OpenAI-compatible) |
| 입력 검증 | [zod](https://zod.dev) v3 |
| 웹 서버 | [Express](https://expressjs.com) v5 |
| 프론트엔드 | [Vue 3](https://vuejs.org) + [Vite](https://vitejs.dev) v8 + TypeScript 6 |
| 린터 | [Biome](https://biomejs.dev) v1 |
| 테스트 | [Vitest](https://vitest.dev) v2 |
| 빌드 도구 | [tsup](https://tsup.egoist.dev) v8 (ESM, Node 20) |
| 패키지 매니저 | pnpm (워크스페이스: 루트 + `frontend/`) |

---

## 프로젝트 구조

```
overfit-checker/
├── src/
│   ├── index.ts              # CLI 진입점 (overfit-check 바이너리)
│   ├── server.ts             # Express API + 정적 자산 서버
│   ├── commands/
│   │   ├── check.ts          # check 서브커맨드
│   │   └── ui.ts             # ui 서브커맨드 (웹 서버 시작 + 브라우저 오픈)
│   ├── llm/
│   │   ├── client.ts         # OpenAI-compatible LLM 클라이언트
│   │   └── prompt.ts         # 시스템 프롬프트 + 분석 템플릿
│   ├── parser/
│   │   └── markdown.ts       # Markdown 파일 읽기 및 전처리 (최대 12,000자)
│   ├── schema/
│   │   └── result.ts         # Zod 스키마 (OverfitResult)
│   └── ui/
│       └── render.ts         # 터미널 출력 렌더러 (text/json/markdown)
├── frontend/                 # Vite + Vue 3 + TypeScript (워크스페이스)
│   ├── src/
│   │   ├── App.vue           # 메인 단일 페이지 컴포넌트
│   │   └── style.css         # 다크/라이트 모드 CSS 변수 + 스타일
│   └── index.html
├── examples/                 # 테스트용 샘플 설계 문서 (9종)
├── tests/                    # Vitest 단위 테스트
│   ├── parser.test.ts
│   └── schema.test.ts
├── Dockerfile                # 멀티스테이지 빌드 (Alpine, Node 20)
├── docker-compose.yml        # 컨테이너 실행 (포트 3000)
├── .env.example              # 환경 변수 템플릿
├── biome.json                # Biome 린터/포매터 설정
├── tsup.config.ts            # CLI 빌드 설정 (ESM, shebang 자동 삽입)
└── pnpm-workspace.yaml       # pnpm 모노레포 워크스페이스 설정
```

---

## 관계

```
Govail (AI Governance Runtime Platform)
    ↑ 사용
overfit-checker (설계 검증 도구)
```

Govail 개발 중 "이 Runtime 필요해?", "이 LangGraph 필요해?"를 판독하는 내부 도구로 시작. 독립 실행 가능.

---

## 라이선스

Apache-2.0
