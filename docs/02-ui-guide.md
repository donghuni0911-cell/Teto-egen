# 02. UI 구현 지침

이 문서는 **화면에 무엇을, 어떻게 보여줄지** 정리합니다.
대상 파일: `public/index.html`, `public/style.css`, `public/app.js`

---

## 1. 참고 UI 파일 적용 규칙

- 사용자가 참고 UI 파일(이미지, HTML, 디자인 시안)을 `docs/reference/` 폴더에 넣으면, **그 파일의 색상 · 간격 · 모서리 둥글기 · 그림자 · 배치**를 우선 적용한다.
- 이때 4장의 CSS 변수 **값만** 참고 파일에 맞게 바꾸고, **변수 이름과 2장의 화면 구성 요소는 바꾸지 않는다.**
- 참고 파일이 없으면 4장의 기본값을 그대로 쓴다.
- 참고 파일에 2장에 없는 요소(예: 로그인 버튼, 메뉴)가 있어도 **추가하지 않는다.** (`PRD.md` 4장 범위 밖)

## 2. 화면 구성 (한 페이지, 위에서 아래 순서)

```
┌─────────────────────────────────┐
│ [헤더]                           │
│  💪🌸 테토/에겐 판별기             │
│  내 말투로 알아보는 테토력 · 에겐력   │
├─────────────────────────────────┤
│ [입력 카드]                       │
│  라벨: 문장이나 자기소개를 입력해 주세요 │
│  ┌───────────────────────────┐  │
│  │ textarea (5줄 높이)          │  │
│  └───────────────────────────┘  │
│  예시: [예시1] [예시2] [예시3]  0/500 │
│  [오류 안내 영역 — 평소엔 숨김]       │
│  [        분석하기        ]        │
├─────────────────────────────────┤
│ [결과 카드 — 평소엔 숨김]            │
│        💪                        │
│      테토형                       │
│  신뢰도  ███████████░░░  82%      │
│  판단 근거                        │
│   • ...                          │
│   • ...                          │
│  "한 줄 요약"                     │
│  ⓘ 재미로 보는 결과예요             │
│  [ 다시 하기 ]                    │
├─────────────────────────────────┤
│ [푸터] 입력한 문장은 저장되지 않아요   │
└─────────────────────────────────┘
```

### HTML 요소와 id (app.js가 이 id로 요소를 찾으므로 그대로 쓸 것)

| 요소 | 태그 | id / class | 비고 |
|---|---|---|---|
| 페이지 제목 | `h1` | — | "테토/에겐 판별기" |
| 부제목 | `p` | `.subtitle` | "내 말투로 알아보는 테토력 · 에겐력" |
| 입력 라벨 | `label` | `for="inputText"` | "문장이나 자기소개를 입력해 주세요" |
| 입력창 | `textarea` | `#inputText` | `rows="5"`, placeholder 아래 참고, **`maxlength` 넣지 않음** |
| 예시 버튼 3개 | `button type="button"` | `.example-btn`, `data-example="1~3"` | 문구는 5장 |
| 글자 수 | `span` | `#charCount` | `0 / 500` 형식 |
| 오류 안내 | `div` | `#errorBox` | `role="alert"`, 평소 `hidden` |
| 분석 버튼 | `button type="button"` | `#analyzeBtn` | "분석하기" |
| 결과 카드 | `section` | `#resultCard` | `aria-live="polite"`, 평소 `hidden` |
| 결과 이모지 | `div` | `#resultEmoji` | |
| 결과 성향 이름 | `h2` | `#resultLabel` | |
| 신뢰도 숫자 | `span` | `#confidenceValue` | `82%` 형식 |
| 신뢰도 막대 | `div` | `#confidenceBar` (안쪽 `#confidenceFill`) | `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` |
| 판단 근거 목록 | `ul` | `#reasonList` | `li` 2~3개 |
| 한 줄 요약 | `p` | `#summaryText` | |
| 안내 문구 | `p` | `.notice` | "재미로 보는 결과예요" (고정 문구, 항상 표시) |
| 다시 하기 | `button type="button"` | `#retryBtn` | "다시 하기" |
| 푸터 | `footer` | — | "입력한 문장은 저장되지 않아요" |

- 입력창 placeholder: `예) 일단 해보고 생각하자. 고민은 짧게, 실행은 빠르게!`
- `<html lang="ko">`, `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, `<title>테토/에겐 판별기</title>`를 반드시 넣는다.
- CSS는 `<link rel="stylesheet" href="/style.css">`, JS는 `</body>` 바로 앞에 `<script type="module" src="/app.js"></script>`로 불러온다.

## 3. 글꼴 (Pretendard 웹폰트)

`public/style.css` **맨 위**에 아래 코드를 그대로 넣는다. (사용자가 제공한 코드)

```css
@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Thin.woff2') format('woff2');
    font-weight: 100;
    font-display: swap;
}
@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-ExtraLight.woff2') format('woff2');
    font-weight: 200;
    font-display: swap;
}
@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Light.woff2') format('woff2');
    font-weight: 300;
    font-display: swap;
}
@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Regular.woff2') format('woff2');
    font-weight: 400;
    font-display: swap;
}
@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Medium.woff2') format('woff2');
    font-weight: 500;
    font-display: swap;
}
@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-SemiBold.woff2') format('woff2');
    font-weight: 600;
    font-display: swap;
}
@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Bold.woff2') format('woff2');
    font-weight: 700;
    font-display: swap;
}
@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-ExtraBold.woff2') format('woff2');
    font-weight: 800;
    font-display: swap;
}
@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Black.woff2') format('woff2');
    font-weight: 900;
    font-display: swap;
}
@font-face {
    font-family: 'PretendardVariable';
    src: url('https://cdn.jsdelivr.net/gh/Project-Noonnu/2611030106@font-variable-694/variable-694/PretendardVariable.woff2') format('woff2');
    font-weight: 45 930;
    font-display: swap;
}
/* 가변: font-family: 'PretendardVariable'; font-variation-settings: "wght" 400; */
```

### 글꼴 사용 규칙
- 기본 글꼴: `font-family: 'Pretendard', system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;`
  - 웹폰트가 늦게 불러와지거나 실패해도 뒤의 시스템 글꼴로 글자가 보이게 하기 위함이다.
- `PretendardVariable`은 이번 프로젝트에서 **사용하지 않는다.** (코드는 그대로 두되 `font-family`에 쓰지 않음)
- 사용할 굵기: 400(본문), 500(버튼), 600(소제목), 700(결과 성향 이름), 800(페이지 제목). 그 외 굵기는 쓰지 않는다.

| 용도 | 크기 | 굵기 |
|---|---|---|
| 페이지 제목 `h1` | 28px (모바일 24px) | 800 |
| 부제목 | 15px | 400 |
| 본문, 입력창, 근거 목록 | 16px | 400 |
| 버튼 | 16px | 500 |
| 결과 이모지 | 56px | — |
| 결과 성향 이름 `h2` | 28px | 700 |
| 소제목 ("판단 근거", "신뢰도") | 14px | 600 |
| 글자 수, 안내 문구, 푸터 | 13px | 400 |

- 줄 간격(`line-height`): 본문 1.6, 제목 1.3

## 4. 기본 디자인 값 (CSS 변수)

`style.css`의 `:root`에 아래 변수를 정의하고, **모든 색 · 크기는 이 변수로만** 지정한다.
(참고 UI 파일이 있으면 값만 바꾼다.)

```css
:root {
  /* 기본 색 */
  --color-bg: #F6F5FB;          /* 페이지 배경 */
  --color-surface: #FFFFFF;     /* 카드 배경 */
  --color-text: #1F1F2E;        /* 기본 글자 */
  --color-text-sub: #6B6B80;    /* 보조 글자 */
  --color-border: #E3E1EE;      /* 테두리 */
  --color-primary: #6C5CE7;     /* 분석하기 버튼, 포커스 */
  --color-primary-hover: #5A4BD4;
  --color-disabled: #C9C6D9;    /* 비활성 버튼 */
  --color-error: #E5484D;       /* 오류 글자, 글자 수 초과 */
  --color-error-bg: #FFF0F0;    /* 오류 박스 배경 */

  /* 성향별 색 */
  --color-teto: #FF6B35;        /* 테토형: 주황 */
  --color-teto-bg: #FFF1EB;
  --color-egen: #F06292;        /* 에겐형: 핑크 */
  --color-egen-bg: #FDEEF4;
  --color-balance: #7C6CF2;     /* 밸런스형: 보라 */
  --color-balance-bg: #F1EFFE;

  /* 모양 */
  --radius-card: 20px;
  --radius-input: 12px;
  --radius-button: 12px;
  --radius-pill: 999px;
  --shadow-card: 0 4px 20px rgba(31, 31, 46, 0.06);

  /* 간격 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;

  /* 레이아웃 */
  --max-width: 560px;
}
```

### 레이아웃 규칙
- 전체 내용은 가로 가운데 정렬, 최대 너비 `--max-width`(560px).
- 좌우 여백: 모바일 `--space-md`, PC `--space-lg`.
- 카드: 배경 `--color-surface`, 모서리 `--radius-card`, 그림자 `--shadow-card`, 안쪽 여백 `--space-lg`, 카드 사이 간격 `--space-lg`.
- 기준 화면: **360px(모바일)**, **1280px(PC)**. 화면 너비 480px 이하를 모바일로 본다. (`@media (max-width: 480px)`)
- 가로 스크롤이 생기면 안 된다.

### 요소별 스타일
- **입력창**: 너비 100%, 테두리 1px `--color-border`, 모서리 `--radius-input`, 안쪽 여백 `--space-md`, 세로 크기 조절만 허용(`resize: vertical`). 포커스 시 테두리 `--color-primary` 2px.
- **예시 버튼**: 알약 모양(`--radius-pill`), 배경 `--color-bg`, 글자 13px. 모바일에서는 줄바꿈되어도 된다.
- **글자 수**: 오른쪽 정렬, `--color-text-sub`. 500자 초과 시 `--color-error`.
- **분석하기 버튼**: 너비 100%, 높이 52px, 배경 `--color-primary`, 흰 글자. 마우스를 올리면 `--color-primary-hover`. 비활성 시 배경 `--color-disabled`, 커서 `not-allowed`.
- **오류 박스**: 배경 `--color-error-bg`, 글자 `--color-error`, 모서리 `--radius-input`, 안쪽 여백 `--space-md`, 앞에 `⚠️` 표시.
- **결과 카드**: 성향에 따라 테두리 상단 6px 색과 배경 강조 색이 바뀐다. (6장)
- **신뢰도 막대**: 높이 12px, 배경 `--color-border`, 채움 막대는 성향 색, 모서리 `--radius-pill`. 결과가 나타날 때 0%에서 실제 값까지 **0.6초** 동안 늘어나는 애니메이션.
- **한 줄 요약**: 성향 배경색 위에 큰따옴표로 감싸서 표시, 가운데 정렬, 굵기 600.
- **다시 하기 버튼**: 흰 배경, 테두리 1px `--color-border`, 너비 100%, 높이 48px.

## 5. 고정 문구

| 위치 | 문구 |
|---|---|
| 예시 버튼 1 이름 / 내용 | `직진형` / `고민할 시간에 일단 해보는 편이야. 하기로 했으면 끝까지 밀어붙여야 직성이 풀려.` |
| 예시 버튼 2 이름 / 내용 | `감성형` / `친구가 힘들어 보이면 먼저 연락해서 괜찮냐고 물어봐. 분위기 좋은 카페에서 이야기 나누는 걸 좋아해.` |
| 예시 버튼 3 이름 / 내용 | `반반형` / `계획은 세우는 편인데 상황 봐서 바꾸기도 해. 친구 고민은 들어주되 필요하면 현실적인 조언도 해줘.` |
| 로딩 중 버튼 | `분석 중...` |
| 결과 안내 | `ⓘ 재미로 보는 결과예요` |
| 푸터 | `입력한 문장은 저장되지 않아요 · AI 분석 결과는 정확하지 않을 수 있어요` |

## 6. 화면 상태 (app.js가 관리)

화면은 항상 아래 4가지 상태 중 하나입니다.

| 상태 | 입력창 | 분석 버튼 | 오류 박스 | 결과 카드 |
|---|---|---|---|---|
| **대기** (처음) | 사용 가능 | "분석하기", 사용 가능 | 숨김 | 숨김 |
| **로딩** | 비활성(`disabled`) | "분석 중..." + 회전 아이콘, 비활성 | 숨김 | 숨김 |
| **성공** | 사용 가능 | "분석하기", 사용 가능 | 숨김 | 표시 |
| **오류** | 사용 가능 (입력 내용 유지) | "분석하기", 사용 가능 | 표시 | 숨김 |

- 상태 전환은 `setState('idle' | 'loading' | 'success' | 'error')` 함수 하나로 처리한다.
- 결과 카드가 나타나면 결과 카드 위치로 부드럽게 스크롤한다. (`scrollIntoView({ behavior: 'smooth', block: 'start' })`)
- 사용자가 입력창에 다시 타이핑하면 오류 박스를 숨긴다.

### 성향별 표시 값 (서버 응답의 `type` 값 → 화면 표시)

| `type` | 이모지 | 이름 | 강조 색 | 배경 색 |
|---|---|---|---|---|
| `teto` | 💪 | 테토형 | `--color-teto` | `--color-teto-bg` |
| `egen` | 🌸 | 에겐형 | `--color-egen` | `--color-egen-bg` |
| `balance` | ⚖️ | 밸런스형 | `--color-balance` | `--color-balance-bg` |

- 결과 카드에 `data-type="teto"`처럼 속성을 달고, CSS에서 `[data-type="teto"]`로 색을 바꾼다.
- 위 3가지 외의 `type` 값이 오면 결과를 보여주지 말고 `AI_ERROR` 오류 문구를 보여준다.

## 7. 접근성 (모두 필수)

- 모든 버튼은 키보드 `Tab`으로 이동하고 `Enter`/`Space`로 누를 수 있다. (`button` 태그 사용으로 해결)
- 포커스된 요소에는 눈에 보이는 테두리가 있다. (`:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }`)
- 결과 카드는 `aria-live="polite"`, 오류 박스는 `role="alert"`로 화면 낭독기가 읽게 한다.
- 결과를 색으로만 구분하지 않는다. (이모지 + 이름 글자를 항상 함께 표시)
- 글자와 배경의 명도 대비는 4.5:1 이상.

## 8. UI 완료 기준

- [ ] 2장의 모든 요소가 정해진 id/class로 존재한다.
- [ ] 개발자 도구 → Network에서 Pretendard 글꼴 파일(`.woff2`)이 불러와지고, 화면 글자가 Pretendard로 보인다.
- [ ] 360px, 1280px 너비에서 가로 스크롤이 없고 요소가 겹치지 않는다.
- [ ] 6장의 4가지 상태가 표와 똑같이 보인다.
- [ ] 테토/에겐/밸런스 3가지 결과 색이 각각 다르게 표시된다.
- [ ] 마우스 없이 키보드만으로 입력 → 분석 → 다시 하기까지 할 수 있다.
- [ ] CSS 파일에서 `:root` 밖에 색상 코드(`#...`, `rgb(...)`)를 직접 쓴 곳이 없다. (단, `rgba()` 그림자 값은 `:root` 변수로 정의된 것만 사용)
