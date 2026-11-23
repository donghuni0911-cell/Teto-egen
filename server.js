// 내 컴퓨터에서 실행할 때만 쓰는 로컬 개발 서버

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeText } from './lib/analyze.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 요청 본문을 JSON 문자열/객체로 읽는 헬퍼 함수
async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve(null);
        return;
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', err => reject(err));
  });
}

// HTTP 서버 인스턴스 생성
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. /api/analyze 엔드포인트 처리
  if (pathname === '/api/analyze') {
    if (req.method !== 'POST') {
      res.writeHead(405, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      res.end(JSON.stringify({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.'
        }
      }));
      return;
    }

    let parsedBody;
    try {
      parsedBody = await parseJsonBody(req);
    } catch {
      res.writeHead(400, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      res.end(JSON.stringify({
        error: {
          code: 'INVALID_REQUEST',
          message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.'
        }
      }));
      return;
    }

    if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
      res.writeHead(400, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      res.end(JSON.stringify({
        error: {
          code: 'INVALID_REQUEST',
          message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.'
        }
      }));
      return;
    }

    const { status, body } = await analyzeText(parsedBody.text);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(body));
    return;
  }

  // 2. 정적 파일 서비스 (GET 요청)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  // 보안 검사: URL 디코딩 및 상위 경로(..) 접근 차단
  let decodedPathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  if (decodedPathname.includes('..')) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('페이지를 찾을 수 없어요');
    return;
  }

  const relativePath = decodedPathname === '/' ? 'index.html' : decodedPathname.replace(/^\/+/, '');
  const filePath = path.normalize(path.join(PUBLIC_DIR, relativePath));

  // 정규화된 경로가 PUBLIC_DIR 내부인지 다시 확인
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('페이지를 찾을 수 없어요');
    return;
  }

  try {
    const fileStat = await fs.stat(filePath);
    if (!fileStat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('페이지를 찾을 수 없어요');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const content = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('페이지를 찾을 수 없어요');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('서버 오류가 발생했어요');
    }
  }
});

// 서버 시작 시 환경변수 확인 및 안내 출력
server.listen(PORT, '0.0.0.0', () => {
  console.log(`http://localhost:${PORT} 에서 실행 중`);
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
    console.log('⚠️ .env에 OPENAI_API_KEY가 없습니다');
  }
});
