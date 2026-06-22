<template>
  <div class="app-container">
    <!-- 헤더 영역 -->
    <header>
      <div class="logo-section">
        <div class="logo-title-group">
          <h1><span>Overfit Checker</span> 🔍</h1>
          <div class="meta-badges">
            <span class="version-badge">{{ appVersion }}</span>
            <span class="label-badge">{{ appLabel }}</span>
          </div>
        </div>
        <p>설계 문서와 계획서의 오버엔지니어링 여부를 판독합니다.</p>
      </div>
      <button class="theme-toggle-btn" @click="toggleTheme">
        <span v-if="isDark">☀️ Light Mode</span>
        <span v-else>🌙 Dark Mode</span>
      </button>
    </header>

    <!-- 메인 콘텐츠 영역 -->
    <main>
      <!-- 입력 폼 -->
      <section class="card input-section">
        <h2>📝 마크다운 설계 문서 입력</h2>
        <div class="textarea-container">
          <textarea
            v-model="markdownText"
            placeholder="# 설계 계획안을 여기에 붙여넣으세요...&#10;&#10;예: Kafka, Cassandra, Kubernetes를 사용한 실시간 댓글 알림 서비스 설계 등"
            :disabled="isLoading"
          ></textarea>
        </div>
        <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem;">
          <button
            type="button"
            class="theme-toggle-btn"
            style="flex: 1; justify-content: center;"
            @click="loadSample('govail')"
            :disabled="isLoading"
          >
            📋 복잡한 샘플 (과적합)
          </button>
          <button
            type="button"
            class="theme-toggle-btn"
            style="flex: 1; justify-content: center;"
            @click="loadSample('simple')"
            :disabled="isLoading"
          >
            📋 심플한 샘플 (적정)
          </button>
        </div>
        <button
          class="btn-submit"
          @click="submitAnalysis"
          :disabled="isLoading || !markdownText.trim()"
        >
          <span v-if="isLoading" class="spinner"></span>
          <span>{{ isLoading ? '설계 분석 중...' : '🔍 설계 과적합 판독 시작' }}</span>
        </button>
      </section>

      <!-- 에러 알림 -->
      <div v-if="errorMessage" class="card error-card">
        <p class="error-title">⚠️ 분석 실패</p>
        <p class="error-body">{{ errorMessage }}</p>
      </div>

      <!-- 로딩 스켈레톤 -->
      <section v-if="isLoading" class="card skeleton-loader">
        <div class="skeleton-title"></div>
        <div class="skeleton-line long"></div>
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line short"></div>
      </section>

      <!-- 분석 결과 표시 -->
      <section v-if="!isLoading && result" class="card result-section">
        <div class="result-header">
          <div class="result-title">
            <h2>🔍 과적합 판독 결과</h2>
            <p class="scan-time">판독 완료 시간: {{ scanTime }}</p>
          </div>
          <div class="score-badge">
            <span class="verdict-tag" :class="result.verdict">{{ result.verdict }}</span>
            <span class="score-number" :style="{ color: getVerdictColor(result.verdict) }">
              {{ result.complexity_score }}<span class="score-denom">/10</span>
            </span>
          </div>
        </div>

        <!-- 복잡도 미터 바 -->
        <div class="score-meter">
          <div
            class="score-fill"
            :class="result.verdict"
            :style="{ width: `${result.complexity_score * 10}%` }"
          ></div>
        </div>

        <!-- 문제 규모 vs 해결책 규모 -->
        <div class="size-comparison">
          <div class="size-item">
            <span class="size-label">문제 규모</span>
            <span class="size-badge problem" :class="result.problem_size.toLowerCase()">
              {{ result.problem_size }}
            </span>
          </div>
          <div class="size-arrow">
            <span class="arrow-line"></span>
            <span class="arrow-icon" :class="getSizeGapClass(result.problem_size, result.solution_size)">
              {{ getSizeGapIcon(result.problem_size, result.solution_size) }}
            </span>
            <span class="arrow-line"></span>
          </div>
          <div class="size-item">
            <span class="size-label">해결책 규모</span>
            <span class="size-badge solution" :class="result.solution_size.toLowerCase()">
              {{ result.solution_size }}
            </span>
          </div>
          <div class="size-gap-msg" :class="getSizeGapClass(result.problem_size, result.solution_size)">
            {{ getSizeGapMessage(result.problem_size, result.solution_size) }}
          </div>
        </div>

        <!-- 한 줄 요약 -->
        <p class="summary-text">"{{ result.summary }}"</p>

        <!-- 과도한 설계 요소 리스트 -->
        <div class="section-title">
          <span>🚨</span> 과도한 설계 요소 ({{ result.overfit_items.length }}개)
        </div>

        <div v-if="result.overfit_items.length === 0" class="overfit-list">
          <div class="overfit-item ok-item">
            <p class="ok-text">✅ 적합한 범위의 설계입니다. 오버엔지니어링 요소를 발견하지 못했습니다.</p>
          </div>
        </div>

        <div v-else class="overfit-list">
          <div v-for="(item, index) in result.overfit_items" :key="index" class="overfit-item">
            <div class="overfit-item-header">
              <span class="overfit-item-title">{{ index + 1 }}. {{ item.title }}</span>
              <span class="risk-badge" :class="item.risk">위험도: {{ getRiskLabel(item.risk) }}</span>
            </div>
            <p class="overfit-item-reason">{{ item.reason }}</p>
          </div>
        </div>

        <!-- 더 작은 대안 -->
        <div class="section-title">
          <span>💡</span> 더 작은 대안 (Alternative)
        </div>
        <div class="alternative-box">
          <p class="alternative-desc">{{ result.alternative.description }}</p>
          <div class="alternative-savings">
            <span>🛡️ 절감 예상 범위:</span> {{ result.alternative.savings }}
          </div>
        </div>

        <!-- 다음 최소 작업 -->
        <div class="section-title">
          <span>✅</span> 다음 단계 최소 작업 (Next Small Steps)
        </div>
        <div class="tasks-list">
          <div v-for="task in result.next_tasks" :key="task.order" class="task-item">
            <div class="task-num">{{ task.order }}</div>
            <div class="task-text">{{ task.task }}</div>
          </div>
        </div>
      </section>
    </main>

    <!-- 푸터 -->
    <footer>
      <p>© {{ new Date().getFullYear() }} Overfit Checker — 이 설계, 과한가요?</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 결과 타입 (Zod 스키마와 동일 구조)
interface OverfitItem {
  title: string;
  reason: string;
  risk: 'low' | 'medium' | 'high';
}

interface OverfitResult {
  complexity_score: number;
  verdict: '적정' | '주의' | '과도';
  problem_size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Enterprise';
  solution_size: 'Script' | 'Library' | 'Service' | 'Platform' | 'Ecosystem';
  summary: string;
  overfit_items: OverfitItem[];
  alternative: {
    description: string;
    savings: string;
  };
  next_tasks: {
    order: number;
    task: string;
  }[];
}

const PROBLEM_RANK: Record<string, number> = {
  Tiny: 0, Small: 1, Medium: 2, Large: 3, Enterprise: 4,
};
const SOLUTION_RANK: Record<string, number> = {
  Script: 0, Library: 1, Service: 2, Platform: 3, Ecosystem: 4,
};

// @ts-ignore
const appVersion = ref('v' + __APP_VERSION__);
// @ts-ignore
const appLabel = ref(__APP_LABEL__);
const markdownText = ref('');
const isLoading = ref(false);
const result = ref<OverfitResult | null>(null);
const errorMessage = ref<string | null>(null);
const isDark = ref(false);
const scanTime = ref('');

// 샘플 마크다운 로드
const loadSample = (type: 'govail' | 'simple') => {
  if (type === 'govail') {
    markdownText.value = `# 알림 마이크로서비스 아키텍처 설계안

## 개요
사용자 로그인 및 특정 이벤트 발생 시 알림(Email, Slack, SMS)을 발송하는 서버 모듈 설계입니다.

## 상세 설계안
1. **메시지 큐 및 이벤트 브로커**:
   - 메시지 손실을 원천 차단하기 위해 3개의 노드로 구성된 Apache Kafka 클러스터를 전용 서브넷에 구성합니다.
2. **영속성 스토리지**:
   - 모든 발송 이력을 분산 노드 형태로 영구 보존하기 위해 Cassandra NoSQL DB를 클러스터링 모드로 도입합니다.
3. **분산 캐시 및 세션**:
   - 알림 템플릿 및 발송 제한 상태 관리를 위해 Redis Sentinel로 고가용성 캐시 레이어를 추가합니다.
4. **인프라 환경**:
   - 스케일링 유연성을 위해 전체 모듈을 Kubernetes에 배포하고, 템플릿 리포지토리는 매 분 동기화를 위해 Git 폴링 방식의 CronJob pod를 상시 기동시킵니다.
`;
  } else {
    markdownText.value = `# 간단한 피드백 메일 전송 기능 설계안

## 개요
사용자가 웹사이트 내 문의하기 폼을 작성해 전송하면, 담당자 이메일로 해당 피드백을 전달하는 기능입니다.

## 아키텍처 구성
- 별도의 대형 메시지 큐 인프라 구축 없이, Node.js 익스프레스 서버에서 이메일 전송 패키지(\`nodemailer\`)를 사용해 직접 메일 발송 API를 호출합니다.
- 발송 횟수 제한(Rate Limit)은 단순 인메모리(\`express-rate-limit\`) 라이브러리로 제어합니다.
- 데이터베이스 저장 역시 별도로 구성하지 않고 오류 로그만 호스트 디스크의 로컬 파일 시스템에 저장합니다.
`;
  }
};

// 테마 토글
const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  }
};

// 초기 테마 확인
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
    document.documentElement.classList.add('dark-theme');
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark-theme');
  }
});

// 과적합 분석 제출
const submitAnalysis = async () => {
  if (!markdownText.value.trim()) return;

  isLoading.value = true;
  result.value = null;
  errorMessage.value = null;

  try {
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: markdownText.value }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '분석 중 원인 미상의 오류가 발생했습니다.');
    }

    result.value = data;
    scanTime.value = new Date().toLocaleTimeString();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err);
  } finally {
    isLoading.value = false;
  }
};

// 규모 불균형 헬퍼
const getSizeGap = (problemSize: string, solutionSize: string): number => {
  return (SOLUTION_RANK[solutionSize] ?? 0) - (PROBLEM_RANK[problemSize] ?? 0);
};

const getSizeGapClass = (problemSize: string, solutionSize: string): string => {
  const gap = getSizeGap(problemSize, solutionSize);
  if (gap >= 2) return 'gap-danger';
  if (gap === 1) return 'gap-warning';
  return 'gap-ok';
};

const getSizeGapIcon = (problemSize: string, solutionSize: string): string => {
  const gap = getSizeGap(problemSize, solutionSize);
  if (gap >= 2) return '🚨';
  if (gap === 1) return '⚠️';
  return '✅';
};

const getSizeGapMessage = (problemSize: string, solutionSize: string): string => {
  const gap = getSizeGap(problemSize, solutionSize);
  if (gap >= 2) return '규모 불균형 — 해결책이 문제보다 훨씬 큽니다';
  if (gap === 1) return '규모 차이 — 약간 과도할 수 있습니다';
  return '균형 잡힌 설계입니다';
};

// 라벨링 헬퍼
const getRiskLabel = (risk: 'low' | 'medium' | 'high') => {
  const mapping = { low: '낮음', medium: '중간', high: '높음' };
  return mapping[risk] || risk;
};

const getVerdictColor = (verdict: '적정' | '주의' | '과도') => {
  const mapping = { 적정: 'var(--success)', 주의: 'var(--warning)', 과도: 'var(--danger)' };
  return mapping[verdict] || 'inherit';
};
</script>
