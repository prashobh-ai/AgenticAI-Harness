'use strict';

const crypto = require('crypto');

const PER_TRANSFER_LIMIT_CENTS = 1000000; // 10,000.00
const DAILY_LIMIT_CENTS = 2500000; // 25,000.00

class TransferError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function toAmount(cents) {
  return Number((cents / 100).toFixed(2));
}

function sameUtcDay(a, b) {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function createTransferService(store, { clock = () => new Date() } = {}) {
  function getAccount(id) {
    const account = store.accounts.get(id);
    if (!account) {
      throw new TransferError(404, 'ACCOUNT_NOT_FOUND', `Account ${id} does not exist`);
    }
    return account;
  }

  function describeAccount(id) {
    const { balanceCents, ...rest } = getAccount(id);
    return { ...rest, balance: toAmount(balanceCents) };
  }

  function listTransfers(accountId) {
    getAccount(accountId);
    return store.transfers.filter(t => t.fromAccountId === accountId || t.toAccountId === accountId);
  }

  function sentTodayCents(accountId, now) {
    return store.transfers
      .filter(t => t.fromAccountId === accountId && sameUtcDay(new Date(t.createdAt), now))
      .reduce((sum, t) => sum + Math.round(t.amount * 100), 0);
  }

  function validate(request) {
    const { fromAccountId, toAccountId, amount, currency } = request || {};
    if (!fromAccountId || !toAccountId || typeof currency !== 'string') {
      throw new TransferError(400, 'VALIDATION_ERROR', 'fromAccountId, toAccountId and currency are required');
    }
    if (typeof amount !== 'number' || !Number.isFinite(amount) || !(amount > 0)) {
      throw new TransferError(400, 'VALIDATION_ERROR', 'amount must be a positive number');
    }
    if (fromAccountId === toAccountId) {
      throw new TransferError(400, 'VALIDATION_ERROR', 'Source and destination accounts must differ');
    }
    return { fromAccountId, toAccountId, amountCents: Math.round(amount * 100), currency };
  }

  function transfer(request, idempotencyKey) {
    if (idempotencyKey && store.idempotency.has(idempotencyKey)) {
      return { replayed: true, transfer: store.idempotency.get(idempotencyKey) };
    }

    const { fromAccountId, toAccountId, amountCents, currency } = validate(request);
    const from = getAccount(fromAccountId);
    const to = getAccount(toAccountId);
    const now = clock();

    if (from.currency !== currency || to.currency !== currency) {
      throw new TransferError(422, 'CURRENCY_MISMATCH', 'Transfer currency must match both accounts');
    }
    if (amountCents >= PER_TRANSFER_LIMIT_CENTS) {
      throw new TransferError(422, 'LIMIT_EXCEEDED', 'Amount exceeds the per-transfer limit');
    }
    const dailyUsedCents = sentTodayCents(from.id, now);
    if (amountCents > DAILY_LIMIT_CENTS) {
      throw new TransferError(422, 'LIMIT_EXCEEDED', 'Amount exceeds the daily transfer limit');
    }
    if (from.balanceCents < amountCents) {
      throw new TransferError(422, 'INSUFFICIENT_FUNDS', 'Insufficient funds in source account');
    }

    from.balanceCents -= amountCents;
    to.balanceCents += amountCents;

    const record = {
      transferId: `TRF-${crypto.randomUUID()}`,
      status: 'COMPLETED',
      fromAccountId,
      toAccountId,
      amount: toAmount(amountCents),
      currency,
      dailyRemaining: toAmount(DAILY_LIMIT_CENTS - dailyUsedCents - amountCents),
      createdAt: now.toISOString()
    };
    store.transfers.push(record);
    if (idempotencyKey) {
      store.idempotency.set(`${fromAccountId}:${idempotencyKey}`, record);
    }
    return { replayed: false, transfer: record };
  }

  return { describeAccount, listTransfers, transfer };
}

module.exports = {
  createTransferService,
  TransferError,
  PER_TRANSFER_LIMIT_CENTS,
  DAILY_LIMIT_CENTS
};
