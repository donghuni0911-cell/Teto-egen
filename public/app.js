// 프론트엔드 UI 동작 및 서버 통신 모듈

const ERROR_MESSAGES = {
  EMPTY_INPUT: '분석할 문장을 입력해 주세요.',
  TOO_SHORT: '10자 이상 입력해 주세요. 조금만 더 길게 써 주시면 더 정확해요!',
  TOO_LONG: '500자 이하로 입력해 주세요.',
  INVALID_REQUEST: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.',
  METHOD_NOT_ALLOWED: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.',
  API_KEY_ERROR: 'AI 연결 설정에 문제가 있어요. API 키가 없거나 만료되었을 수 있어요.',
  RATE_LIMIT: '요청이 많아 잠시 쉬는 중이에요. 1분 뒤에 다시 시도해 주세요.',
  TIMEOUT: 'AI 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.',
  NETWORK_ERROR: '인터넷 연결을 확인하고 다시 시도해 주세요.',
  AI_ERROR: '분석 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.'
};

const EXAMPLES = {
  '1': '고민할 시간에 일단 해보는 편이야. 하기로 했으면 끝까지 밀어붙여야 직성이 풀려.',
  '2': '친구가 힘들어 보이면 먼저 연락해서 괜찮냐고 물어봐. 분위기 좋은 카페에서 이야기 나누는 걸 좋아해.',
  '3': '계획은 세우는 편인데 상황 봐서 바꾸기도 해. 친구 고민은 들어주되 필요하면 현실적인 조언도 해줘.'
};

const TYPE_CONFIG = {
  teto: { emoji: '💪', label: '테토형' },
  egen: { emoji: '🌸', label: '에겐형' },
  balance: { emoji: '⚖️', label: '밸런스형' }
};

// DOM 요소 참조
const inputText = document.getElementById('inputText');
const charCount = document.getElementById('charCount');
const errorBox = document.getElementById('errorBox');
const errorMessage = document.getElementById('errorMessage');
const analyzeBtn = document.getElementById('analyzeBtn');
const exampleButtons = document.querySelectorAll('.example-btn');

const resultCard = document.getElementById('resultCard');
const resultEmoji = document.getElementById('resultEmoji');
const resultLabel = document.getElementById('resultLabel');
const confidenceValue = document.getElementById('confidenceValue');
const confidenceBar = document.getElementById('confidenceBar');
const confidenceFill = document.getElementById('confidenceFill');
const reasonList = document.getElementById('reasonList');
const summaryText = document.getElementById('summaryText');
const retryBtn = document.getElementById('retryBtn');

let isLoading = false;

// 화면 상태 변경 함수
function setState(state, message = '') {
  switch (state) {
    case 'idle':
      isLoading = false;
      inputText.disabled = false;
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '분석하기';
      errorBox.hidden = true;
      resultCard.hidden = true;
      break;

    case 'loading':
      isLoading = true;
      inputText.disabled = true;
      analyzeBtn.disabled = true;
      // 로딩 스피너 및 문구 구성 (안전하게 DOM 생성)
      analyzeBtn.textContent = '';
      const spinner = document.createElement('span');
      spinner.className = 'spinner';
      spinner.setAttribute('aria-hidden', 'true');
      const loadingText = document.createTextNode(' 분석 중...');
      analyzeBtn.appendChild(spinner);
      analyzeBtn.appendChild(loadingText);

      errorBox.hidden = true;
      resultCard.hidden = true;
      break;

    case 'success':
      isLoading = false;
      inputText.disabled = false;
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '분석하기';
      errorBox.hidden = true;
      resultCard.hidden = false;
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;

    case 'error':
      isLoading = false;
      inputText.disabled = false;
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '분석하기';
      errorMessage.textContent = message;
      errorBox.hidden = false;
      resultCard.hidden = true;
      break;
  }
}

// 글자 수 업데이트 함수
function updateCharCount() {
  const length = inputText.value.trim().length;
  charCount.textContent = `${length} / 500`;

  if (length > 500) {
    charCount.classList.add('over');
  } else {
    charCount.classList.remove('over');
  }
}

// 결과 카드 렌더링 함수
function renderResult(data) {
  const { type, confidence, reasons, summary } = data;
  const config = TYPE_CONFIG[type];

  if (!config) {
    setState('error', ERROR_MESSAGES.AI_ERROR);
    return;
  }

  resultCard.setAttribute('data-type', type);
  resultEmoji.textContent = config.emoji;
  resultLabel.textContent = config.label;

  const confNumber = Math.min(100, Math.max(0, Number(confidence) || 0));
  confidenceValue.textContent = `${confNumber}%`;
  confidenceBar.setAttribute('aria-valuenow', String(confNumber));

  // 신뢰도 바 0%에서 채워지는 애니메이션
  confidenceFill.style.width = '0%';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      confidenceFill.style.width = `${confNumber}%`;
    });
  });

  // 근거 목록 생성 (textContent로만 안전하게 삽입)
  while (reasonList.firstChild) {
    reasonList.removeChild(reasonList.firstChild);
  }

  if (Array.isArray(reasons)) {
    for (const r of reasons) {
      const li = document.createElement('li');
      li.textContent = r;
      reasonList.appendChild(li);
    }
  }

  summaryText.textContent = summary || '';

  setState('success');
}

// 분석 요청 메인 함수
async function handleAnalyze() {
  if (isLoading) return;

  const text = inputText.value;
  const trimmed = text.trim();
  const length = trimmed.length;

  // 브라우저 단 입력 사전 검증
  if (length === 0) {
    setState('error', ERROR_MESSAGES.EMPTY_INPUT);
    return;
  }

  if (length < 10) {
    setState('error', ERROR_MESSAGES.TOO_SHORT);
    return;
  }

  if (length > 500) {
    setState('error', `500자 이하로 입력해 주세요. (지금 ${length}자)`);
    return;
  }

  setState('loading');

  // 20초 타임아웃 컨트롤러
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch {
      setState('error', ERROR_MESSAGES.AI_ERROR);
      return;
    }

    if (!response.ok) {
      const code = data?.error?.code;
      const serverMsg = data?.error?.message;
      let displayMsg = ERROR_MESSAGES[code] || serverMsg || ERROR_MESSAGES.AI_ERROR;

      if (code === 'TOO_LONG') {
        displayMsg = `500자 이하로 입력해 주세요. (지금 ${length}자)`;
      }

      setState('error', displayMsg);
      return;
    }

    renderResult(data);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      setState('error', ERROR_MESSAGES.TIMEOUT);
    } else {
      setState('error', ERROR_MESSAGES.NETWORK_ERROR);
    }
  }
}

// 이벤트 리스너 바인딩
inputText.addEventListener('input', () => {
  updateCharCount();
  if (!errorBox.hidden) {
    errorBox.hidden = true;
  }
});

// 키보드 단축키 Ctrl+Enter / Cmd+Enter 지원
inputText.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    handleAnalyze();
  }
});

analyzeBtn.addEventListener('click', handleAnalyze);

// 예시 버튼 클릭 핸들러
for (const btn of exampleButtons) {
  btn.addEventListener('click', () => {
    const exampleId = btn.getAttribute('data-example');
    const exampleText = EXAMPLES[exampleId];
    if (exampleText) {
      inputText.value = exampleText;
      updateCharCount();
      errorBox.hidden = true;
      inputText.focus();
    }
  });
}

// 다시 하기 버튼 클릭 핸들러
retryBtn.addEventListener('click', () => {
  inputText.value = '';
  updateCharCount();
  setState('idle');
  inputText.focus();
});

// 초기화
updateCharCount();
setState('idle');
