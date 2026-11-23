// Vercel Serverless Function: /api/analyze

import { analyzeText } from '../lib/analyze.js';

// Vercel이 /api/analyze 요청을 받으면 이 함수를 실행한다.
export default async function handler(req, res) {
  // 1. req.method가 POST가 아니면 405 반환
  if (req.method !== 'POST') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.'
      }
    });
  }

  // 2. 요청 본문 검사
  let bodyData = req.body;
  if (typeof bodyData === 'string') {
    try {
      bodyData = JSON.parse(bodyData);
    } catch {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.'
        }
      });
    }
  }

  if (!bodyData || typeof bodyData !== 'object' || Array.isArray(bodyData)) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.'
      }
    });
  }

  // 3. 분석 수행
  const result = await analyzeText(bodyData.text);

  // 4. Cache-Control 헤더 설정 및 응답
  res.setHeader('Cache-Control', 'no-store');
  return res.status(result.status).json(result.body);
}
