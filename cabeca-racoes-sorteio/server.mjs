import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(projectDir, 'public');
const dataDir = path.join(projectDir, 'data');
const port = Number(process.env.PORT || 3000);
const raffleDate = process.env.RAFFLE_DATE || '25/10';
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};
const publicFiles = new Map([
  ['/', 'index.html'],
  ['/styles.css', 'styles.css'],
  ['/app.js', 'app.js'],
]);
const submissionAttempts = new Map();
const submissionWindowMs = 15 * 60 * 1000;
const maxSubmissionsPerWindow = 5;

await mkdir(dataDir, { recursive: true });
const database = new DatabaseSync(path.join(dataDir, 'registrations.sqlite'));
database.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    follows_instagram INTEGER NOT NULL CHECK (follows_instagram = 1),
    reviewed_google INTEGER NOT NULL CHECK (reviewed_google = 1),
    created_at TEXT NOT NULL
  );
`);
const insertRegistration = database.prepare(`
  INSERT INTO registrations (id, name, phone, follows_instagram, reviewed_google, created_at)
  VALUES (?, ?, ?, 1, 1, ?)
`);

function sendJson(response, status, data) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(data));
}

function getClientKey(request) {
  return request.socket.remoteAddress || 'unknown';
}

function isRateLimited(request) {
  const now = Date.now();
  const clientKey = getClientKey(request);
  const attempts = (submissionAttempts.get(clientKey) || []).filter((time) => now - time < submissionWindowMs);

  if (attempts.length >= maxSubmissionsPerWindow) {
    submissionAttempts.set(clientKey, attempts);
    return true;
  }

  attempts.push(now);
  submissionAttempts.set(clientKey, attempts);
  return false;
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16_384) {
      throw new Error('PAYLOAD_TOO_LARGE');
    }
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function normalizePhone(value) {
  const digits = value.replace(/\D/g, '');
  if (!/^\d{10,13}$/.test(digits)) return null;

  if (digits.length === 12 || digits.length === 13) {
    if (!digits.startsWith('55')) return null;
    return `+${digits}`;
  }

  return `+55${digits}`;
}

function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' https://images.unsplash.com; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  };
}

const server = createServer(async (request, response) => {
  for (const [name, value] of Object.entries(securityHeaders())) {
    response.setHeader(name, value);
  }

  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'GET' && requestUrl.pathname === '/api/config') {
    return sendJson(response, 200, {
      raffleDate,
      instagramUrl: process.env.INSTAGRAM_URL || '',
      googleReviewUrl: process.env.GOOGLE_REVIEW_URL || '',
    });
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/registrations') {
    if (!request.headers['content-type']?.includes('application/json')) {
      return sendJson(response, 415, { error: 'Envie os dados no formato JSON.' });
    }
    if (isRateLimited(request)) {
      return sendJson(response, 429, { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' });
    }

    let body;
    try {
      body = await readJsonBody(request);
    } catch (error) {
      const tooLarge = error.message === 'PAYLOAD_TOO_LARGE';
      return sendJson(response, tooLarge ? 413 : 400, {
        error: tooLarge ? 'Os dados enviados excedem o limite permitido.' : 'Não foi possível interpretar os dados enviados.',
      });
    }

    const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
    const phone = typeof body?.phone === 'string' ? normalizePhone(body.phone) : null;
    if (name.length < 2 || name.length > 80) {
      return sendJson(response, 400, { error: 'Informe um nome com até 80 caracteres.' });
    }
    if (!phone) {
      return sendJson(response, 400, { error: 'Informe um telefone brasileiro válido com DDD.' });
    }
    if (body.followsInstagram !== true || body.reviewedGoogle !== true) {
      return sendJson(response, 400, { error: 'Confirme os dois requisitos para participar.' });
    }

    const id = randomUUID();
    try {
      insertRegistration.run(id, name, phone, new Date().toISOString());
      return sendJson(response, 201, { id });
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed: registrations.phone')) {
        return sendJson(response, 409, { error: 'Este telefone já possui um cadastro.' });
      }
      console.error('Falha ao salvar cadastro:', error);
      return sendJson(response, 500, { error: 'Não foi possível concluir o cadastro agora.' });
    }
  }

  if (request.method === 'GET' && publicFiles.has(requestUrl.pathname)) {
    const fileName = publicFiles.get(requestUrl.pathname);
    try {
      const content = await readFile(path.join(publicDir, fileName));
      response.writeHead(200, {
        'Content-Type': mimeTypes[path.extname(fileName)],
        'Cache-Control': 'no-cache',
      });
      return response.end(content);
    } catch {
      return sendJson(response, 500, { error: 'Não foi possível carregar a página.' });
    }
  }

  return sendJson(response, 404, { error: 'Página não encontrada.' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Sorteio Cabeça Rações em http://localhost:${port}`);
});
