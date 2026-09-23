'use strict';

const http = require('http');
const { createStore } = require('./store');
const { createTransferService, TransferError } = require('./transfer-service');

const MAX_BODY_BYTES = 16 * 1024;

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new TransferError(413, 'PAYLOAD_TOO_LARGE', 'Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(new TransferError(400, 'VALIDATION_ERROR', 'Request body must be valid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function createApp({ store = createStore(), clock } = {}) {
  const service = createTransferService(store, { clock });

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return send(res, 200, { status: 'UP' });
      }
      if (req.method === 'GET' && parts[0] === 'accounts' && parts.length === 2) {
        return send(res, 200, service.describeAccount(parts[1]));
      }
      if (req.method === 'GET' && parts[0] === 'accounts' && parts[2] === 'transfers' && parts.length === 3) {
        return send(res, 200, { items: service.listTransfers(parts[1]) });
      }
      if (req.method === 'POST' && url.pathname === '/transfers') {
        const body = await readJson(req);
        const { replayed, transfer } = service.transfer(body, req.headers['idempotency-key']);
        return send(res, replayed ? 200 : 201, transfer);
      }
      return send(res, 404, { code: 'NOT_FOUND', message: 'Route not found' });
    } catch (err) {
      if (err instanceof TransferError) {
        return send(res, err.status, { code: err.code, message: err.message });
      }
      return send(res, 500, { code: 'INTERNAL_ERROR', message: 'Unexpected error' });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createApp().listen(port, () => {
    process.stdout.write(`Funds Transfer API listening on http://localhost:${port}\n`);
  });
}

module.exports = { createApp };
