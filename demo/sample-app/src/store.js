'use strict';

/**
 * In-memory data store. Balances are held in integer cents.
 */
function defaultAccounts() {
  return [
    { id: 'ACC-1001', owner: 'Asha Menon', currency: 'USD', balanceCents: 5000000 },
    { id: 'ACC-1002', owner: 'Asha Menon', currency: 'USD', balanceCents: 120000 },
    { id: 'ACC-1003', owner: 'Daniel Ortiz', currency: 'USD', balanceCents: 2500 },
    { id: 'ACC-2001', owner: 'Ravi Kumar', currency: 'EUR', balanceCents: 300000 }
  ];
}

function createStore(seedAccounts = defaultAccounts()) {
  return {
    accounts: new Map(seedAccounts.map(account => [account.id, { ...account }])),
    transfers: [],
    idempotency: new Map()
  };
}

module.exports = { createStore, defaultAccounts };
