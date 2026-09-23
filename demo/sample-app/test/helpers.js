'use strict';

const { createApp } = require('../src/server');

async function startApp(options) {
  const server = createApp(options);
  await new Promise(resolve => server.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function request(method, path, { body, headers } = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: res.status, body: await res.json() };
  }

  return { request, close: () => new Promise(resolve => server.close(resolve)) };
}

module.exports = { startApp };
