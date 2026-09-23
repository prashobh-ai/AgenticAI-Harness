# Feature Spec: Funds Transfer (Retail Banking API)

> Demo requirements used by the Qualizeal Agentic AI Harness walkthrough.
> Target implementation: `demo/sample-app`.

## Context

Retail customers move money between accounts held at the bank through a
REST API. The API is consumed by the mobile app and by partner channels, so
retries on flaky networks are expected.

## User Stories

### US-101 — Transfer funds between accounts

As a retail customer, I want to transfer money from one of my accounts to
another account at the bank so that I can manage my funds.

Acceptance criteria:

1. `POST /transfers` accepts `fromAccountId`, `toAccountId`, `amount`, and
   `currency`, and returns `201` with a transfer record on success.
2. `amount` must be greater than `0.00` and have **at most two decimal places**.
   Anything else is rejected with `400 VALIDATION_ERROR`.
3. A single transfer may be **up to and including 10,000.00**. Above that, the
   API returns `422 LIMIT_EXCEEDED`.
4. The **cumulative amount sent from one account per UTC calendar day** may not
   exceed **25,000.00**. A transfer that would take the day's total above the
   limit is rejected with `422 LIMIT_EXCEEDED`.
5. The source account must have sufficient available balance, otherwise
   `422 INSUFFICIENT_FUNDS`; no balance changes on rejection.
6. The transfer currency must match both accounts, otherwise
   `422 CURRENCY_MISMATCH`.
7. Source and destination must be different accounts, otherwise
   `400 VALIDATION_ERROR`.
8. Unknown accounts return `404 ACCOUNT_NOT_FOUND`.

### US-102 — Safe retries (idempotency)

As a mobile-app user on an unreliable network, I want retried transfer
requests not to move my money twice.

Acceptance criteria:

1. Clients may send an `Idempotency-Key` header with `POST /transfers`.
2. Re-sending a request with the same key returns the **original transfer
   record** (same `transferId`) with status `200`, and **no additional money
   moves**.

### US-103 — View balance and history

As a retail customer, I want to see my balance and my transfer history.

Acceptance criteria:

1. `GET /accounts/{id}` returns id, owner, currency, and balance.
2. `GET /accounts/{id}/transfers` returns transfers where the account is the
   source or destination.

## Non-functional notes

- Money must never be created or destroyed: the sum of all balances is
  invariant across transfers.
- Error responses use the shape `{ "code": string, "message": string }`.
