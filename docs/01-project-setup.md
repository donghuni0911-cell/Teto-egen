# 01. 프로젝트 생성 지침

이 문서는 **폴더와 기본 파일을 만들고, 내 컴퓨터에서 실행하는 방법**을 정리합니다.

---

## 1. 준비물

| 준비물 | 확인 방법 | 비고 |
|---|---|---|
| Node.js **20.6 이상** | 터미널에 `node -v` 입력 → `v20.6.0` 이상 | `--env-file` 옵션 때문에 20.6 이상 필요 |
| OpenAI API 키 | OpenAI 대시보드에서 발급 | `sk-`로 시작, 1주일 사용 가능 |
| GitHub 계정 | — | 배포할 때 필요 |
| Vercel 계정 | — | GitHub 계정으로 가입 |

## 2. 폴더 구조 (이 구조 그대로 만들 것)

```
teto-egen/
├─ AGENTS.md               # AI 작업 규칙
├─ PRD.md                  # 제품 요구사항
├─ docs/                   # 세부 구현 문서
│  ├─ 01-project-setup.md
│  ├─ 02-ui-guide.md
│  ├─ 03-feature-guide.md
│  ├─ 04-deployment.md
│  ├─ 05-test-checklist.md
│  └─ reference/           # (선택) 참고 UI 파일을 넣는 곳
├─ public/                 # 브라우저가 받는 파일 (화면)
│  ├─ index.html           # 페이지 구조
│  ├─ style.css            # 디자인
│  └─ app.js               # 화면 동작 (버튼, 결과 표시)
├─ api/
│  └─ analyze.js           # Vercel 서버 함수: /api/analyze 주소
├─ lib/
│  └─ analyze.js           # 실제 분석 로직 (입력 검사 + OpenAI 호출)
├─ server.js               # 내 컴퓨터에서 실행할 때만 쓰는 서버
├─ package.json            # 프로젝트 정보
├─ .env.example            # 환경변수 예시 (Git에 올림)
├─ .env                    # 진짜 API 키 (Git에 올리지 않음!)
└─ .gitignore              # Git에 올리지 않을 파일 목록
```

### 파일 역할을 쉽게 설명하면

- `public/` = **가게 매장**: 손님(브라우저)이 직접 보는 곳. 비밀(API 키)을 두면 안 된다.
- `lib/analyze.js` = **주방**: 실제 요리(분석)를 하는 곳. API 키는 여기서만 쓴다.
- `api/analyze.js` = **배포용 주문 창구**: Vercel에서 주문(요청)을 받아 주방에 전달한다.
- `server.js` = **연습용 주문 창구**: 내 컴퓨터에서 테스트할 때만 쓴다. Vercel에서는 쓰이지 않는다.

`api/analyze.js`와 `server.js`는 **둘 다 `lib/analyze.js`를 불러서 쓴다.** 분석 로직을 두 번 쓰지 않기 위해서다.

## 3. 설정 파일 내용 (그대로 작성)

### `package.json`
```json
{
  "name": "teto-egen",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --env-file=.env server.js"
  },
  "engines": {
    "node": ">=20.6.0"
  }
}
```
- `dependencies`는 넣지 않는다. (npm 패키지 설치 금지)

### `.env.example`
```
# OpenAI API 키 (sk-로 시작). 실제 값은 .env 파일에만 넣으세요.
OPENAI_API_KEY=
# 사용할 OpenAI 모델 이름 (예: gpt-4o-mini). 내 키로 쓸 수 있는 모델인지 OpenAI 대시보드에서 확인하세요.
OPENAI_MODEL=gpt-4o-mini
```

### `.env` (사용자가 직접 만듦)
`.env.example`을 복사해서 이름을 `.env`로 바꾸고, `OPENAI_API_KEY=` 뒤에 실제 키를 붙여 넣는다.
**AI 에이전트는 `.env`에 실제 키 값을 써 넣지 않는다.** 사용자에게 넣어 달라고 안내만 한다.

### `.gitignore`
```
node_modules/
.env
.env.local
.vercel/
.DS_Store
```

## 4. 로컬 서버(`server.js`) 요구사항

내 컴퓨터에서 `http://localhost:3000`으로 사이트를 열기 위한 파일입니다.

| 항목 | 요구사항 |
|---|---|
| 사용 모듈 | Node.js 내장 `http`, `fs/promises`, `path`, `url`만 사용 |
| 포트 | `3000` 고정 |
| `POST /api/analyze` | 요청 본문(JSON)을 읽어서 `lib/analyze.js`의 `analyzeText(text)`를 호출하고, 돌려받은 `status`와 `body`로 응답 |
| 요청 본문이 JSON이 아님 | 400 + `INVALID_REQUEST` 오류 (03 문서 6장 형식) |
| `/api/analyze`에 POST 외 방식 | 405 + `METHOD_NOT_ALLOWED` 오류 |
| `GET /` | `public/index.html` 응답 |
| `GET /style.css` 등 | `public/` 폴더 안의 파일 응답 |
| 없는 파일 | 404 + "페이지를 찾을 수 없어요" 텍스트 |
| 보안 | 경로에 `..`이 들어간 요청은 404 처리 (public 폴더 밖 파일 접근 차단) |
| Content-Type | `.html` → `text/html; charset=utf-8`, `.css` → `text/css; charset=utf-8`, `.js` → `text/javascript; charset=utf-8`, JSON 응답 → `application/json; charset=utf-8` |
| 시작 메시지 | 실행 시 콘솔에 `http://localhost:3000 에서 실행 중` 출력 |
| 키 확인 | 실행 시 `OPENAI_API_KEY`가 비어 있으면 콘솔에 `⚠️ .env에 OPENAI_API_KEY가 없습니다` 경고 출력 (키 값 자체는 출력 금지) |

## 5. 실행 방법 (비전공자용)

1. 터미널에서 프로젝트 폴더로 이동: `cd teto-egen`
2. `.env.example`을 복사해 `.env` 파일을 만들고 API 키를 넣는다.
3. `npm run dev` 입력
4. 브라우저에서 `http://localhost:3000` 접속
5. 끌 때는 터미널에서 `Ctrl + C`

> `npm install`은 필요 없습니다. 설치할 패키지가 없기 때문입니다.

## 6. 이 단계의 완료 기준

- [ ] 2장의 폴더 구조와 파일이 모두 있다. (내용이 빈 파일이라도 위치와 이름이 맞아야 함)
- [ ] `package.json`, `.env.example`, `.gitignore`가 3장 내용과 같다.
- [ ] `npm run dev` 실행 시 오류 없이 `http://localhost:3000 에서 실행 중`이 출력된다.
- [ ] 브라우저에서 `http://localhost:3000`을 열면 `public/index.html` 내용이 보인다.
- [ ] `http://localhost:3000/../package.json`처럼 폴더 밖 파일을 요청하면 404가 나온다.
