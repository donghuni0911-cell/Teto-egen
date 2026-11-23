# 04. 배포 지침 (Vercel)

이 문서는 **완성한 사이트를 인터넷 주소로 공개하는 방법**을 정리합니다.
배포는 로컬에서 `docs/05-test-checklist.md`의 A~E 항목이 모두 통과한 뒤에 합니다.

---

## 1. 배포 구조 (쉽게 설명)

- Vercel은 `public/` 폴더의 파일을 **화면**으로 보여주고,
- `api/` 폴더의 파일을 **서버 함수**로 실행합니다. (`api/analyze.js` → `https://내주소/api/analyze`)
- `server.js`는 로컬 연습용이라 Vercel에서는 **사용되지 않습니다.**
- API 키는 Vercel의 **환경변수** 설정에 넣습니다. 코드에는 절대 넣지 않습니다.

## 2. GitHub에 올리기

1. GitHub에서 새 저장소(Repository)를 만든다. (예: `teto-egen`)
2. 올리기 전에 **`.gitignore`에 `.env`가 있는지 반드시 확인**한다.
3. 프로젝트 폴더에서 아래 명령을 실행한다.
   ```
   git init
   git add .
   git status          ← 목록에 .env 가 없는지 확인!
   git commit -m "테토/에겐 판별기 첫 버전"
   git branch -M main
   git remote add origin https://github.com/내아이디/teto-egen.git
   git push -u origin main
   ```
4. GitHub 저장소 화면에서 `.env` 파일이 **보이지 않는지** 확인한다. 보이면 즉시 OpenAI에서 키를 삭제하고 새로 발급받는다.

## 3. Vercel에 배포하기

1. [vercel.com](https://vercel.com)에 GitHub 계정으로 로그인한다.
2. **Add New → Project** → GitHub 저장소 `teto-egen` 선택 → **Import**
3. 설정 화면에서 아래처럼 입력한다.

   | 항목 | 값 |
   |---|---|
   | Framework Preset | `Other` |
   | Root Directory | `./` (그대로) |
   | Build Command | 비워 둠 |
   | Output Directory | `public` |
   | Install Command | 비워 둠 |

4. **Environment Variables**를 펼쳐서 2개를 추가한다.

   | Key | Value |
   |---|---|
   | `OPENAI_API_KEY` | 내 OpenAI API 키 (`sk-...`) |
   | `OPENAI_MODEL` | `gpt-4o-mini` (또는 `.env`에 쓴 모델 이름과 동일) |

5. **Deploy** 클릭 → 완료되면 `https://teto-egen-xxxx.vercel.app` 같은 주소가 생긴다.

## 4. API 키를 바꿔야 할 때 (1주일 만료 대비)

1. Vercel 프로젝트 → **Settings → Environment Variables**
2. `OPENAI_API_KEY` 값을 새 키로 수정 → 저장
3. **Deployments** 탭 → 가장 최근 배포의 `⋯` → **Redeploy**
   - 환경변수는 다시 배포해야 적용된다.
4. 로컬에서도 쓰려면 `.env` 파일의 키도 바꾼다.

키가 만료된 상태에서 분석하면 사이트는 멈추지 않고 `API_KEY_ERROR` 안내 문구("AI 연결 설정에 문제가 있어요...")가 나와야 정상이다.

## 5. 키가 만료되기 전에 꼭 할 일

- [ ] 테토형 · 에겐형 · 밸런스형 결과 화면을 각각 캡처 (모바일, PC 각 1장)
- [ ] 입력 → 로딩 → 결과 → 다시 하기 과정을 화면 녹화 (30초~1분)
- [ ] 오류 화면(빈 입력, 500자 초과) 캡처
- 저장 위치 예시: `docs/screenshots/` (Git에 올려도 됨. 단, 캡처에 API 키가 보이지 않는지 확인)

## 6. 배포 완료 기준

- [ ] 배포 주소에서 페이지가 열리고 Pretendard 글꼴로 보인다.
- [ ] 배포 주소에서 예시 문장으로 분석하면 결과가 나온다.
- [ ] `https://배포주소/api/analyze`를 브라우저 주소창에 그냥 열면(GET 요청) 405 오류 JSON이 나온다.
- [ ] 개발자 도구 → Sources/Network 어디에서도 API 키가 보이지 않는다.
- [ ] GitHub 저장소에 `.env` 파일이 없다.
- [ ] `docs/05-test-checklist.md`의 F 항목(배포 검증)이 모두 통과한다.

## 7. 자주 생기는 문제

| 증상 | 원인 | 해결 |
|---|---|---|
| 페이지가 404 | Output Directory가 `public`이 아님 | Settings → Build and Deployment에서 `public`으로 수정 후 Redeploy |
| 분석 시 "AI 연결 설정에 문제가 있어요" | 환경변수 누락, 오타, 키 만료 | 환경변수 확인 → Redeploy |
| 분석 시 "분석 중 문제가 생겼어요" | 모델 이름이 잘못됨 등 | `OPENAI_MODEL` 값 확인, Vercel → Logs에서 오류 코드 확인 |
| 로컬에서는 되는데 배포에서 안 됨 | 환경변수를 넣고 Redeploy를 안 함 | Redeploy |
