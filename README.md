# overfit-checker

설계 문서 / PR 계획 / README를 넣으면 **"이거 과한가?"** 를 판독하고 더 작은 대안을 제시하는 CLI 도구.

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

```bash
# 파일 입력
overfit-check check plan.md

# stdin 파이프
cat README.md | overfit-check check --stdin

# JSON 출력
overfit-check check plan.md --format json

# 모델 지정
overfit-check check plan.md --model gpt-4o-mini
```

### 출력 예시

```
🔍  Overfit Analysis — plan.md
────────────────────────────────────────

📊  복잡도 점수   8 / 10   ⚠️  과도함

🚨  과도한 설계 요소 (4개)
  1. Runtime DSL 컴파일러
     현재 문제(코드 분석)에 컴파일러가 필요 없음
  2. Actor System
     단순 순차 처리로 충분. 동시성 복잡도 불필요
  ...

💡  더 작은 대안
  파일 읽기 → 영향도 분석 → 결과 출력
  3개 함수로 해결 가능

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

---

## 개발

```bash
pnpm install          # 의존성 설치
pnpm dev -- check examples/govail-runtime-spec.md  # 빌드 없이 실행
pnpm build            # 빌드
pnpm check            # lint + typecheck + test
```

---

## 관계

```
Govail (AI Governance Runtime Platform)
    ↑ 사용
overfit-checker (설계 검증 도구)
```

Govail 개발 중 "이 Runtime 필요해?", "이 LangGraph 필요해?"를 판독하는 내부 도구로 시작.

---

## 라이선스

Apache-2.0
