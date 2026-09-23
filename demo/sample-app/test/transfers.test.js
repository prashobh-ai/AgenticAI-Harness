'use strict';

const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { startApp } = require('./helpers');

let app;

beforeEach(async () => {
  app = await startApp();
});

afterEach(async () => {
  await app.close();
});

test('health endpoint reports UP', async () => {
  const res = await app.request('GET', '/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'UP');
});

test('returns account details with balance', async () => {
  const res = await app.request('GET', '/accounts/ACC-1002');
  assert.equal(res.status, 200);
  assert.equal(res.body.balance, 1200);
  assert.equal(res.body.currency, 'USD');
});

test('transfers funds between two USD accounts', async () => {
  const res = await app.request('POST', '/transfers', {
    body: { fromAccountId: 'ACC-1001', toAccountId: 'ACC-1002', amount: 100, currency: 'USD' }
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'COMPLETED');

  const from = await app.request('GET', '/accounts/ACC-1001');
  const to = await app.request('GET', '/accounts/ACC-1002');
  assert.equal(from.body.balance, 49900);
  assert.equal(to.body.balance, 1300);
});

test('rejects transfer when funds are insufficient', async () => {
  const res = await app.request('POST', '/transfers', {
    body: { fromAccountId: 'ACC-1003', toAccountId: 'ACC-1002', amount: 50, currency: 'USD' }
  });
  assert.equal(res.status, 422);
  assert.equal(res.body.code, 'INSUFFICIENT_FUNDS');
});

test('returns 404 for unknown account', async () => {
  const res = await app.request('GET', '/accounts/ACC-9999');
  assert.equal(res.status, 404);
  assert.equal(res.body.code, 'ACCOUNT_NOT_FOUND');
});

test('lists transfers for an account', async () => {
  await app.request('POST', '/transfers', {
    body: { fromAccountId: 'ACC-1001', toAccountId: 'ACC-1002', amount: 25.5, currency: 'USD' }
  });
  const res = await app.request('GET', '/accounts/ACC-1002/transfers');
  assert.equal(res.status, 200);
  assert.equal(res.body.items.length, 1);
  assert.equal(res.body.items[0].amount, 25.5);
});
