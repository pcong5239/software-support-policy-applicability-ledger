# RPC Budget Record

RPC_BUDGET_REVISION: contract c53f6156e0bf8ff2f86339df5677e2149bd5c48b; frontend release commit 279db208cecb440165c828fa2e0cd21a4d1ce680
OFFICIAL_DOCS_CHECKED: https://docs.genlayer.com/api-references/genlayer-js and https://docs.genlayer.com/api-references/genlayer-node/gen/gen_getTransactionStatus; checked 2026-09-05 UTC

The Studio and frontend scopes are measured separately. Studio evidence is inherited from the approved deployed package because this release batch does not change contract bytes, ABI, address, network, or Studio transactions. The exact Vercel production URL is deployed and serves the frontend; browser transaction measurements remain pending the controlled E2E run.

## STUDIO_SCOPE

STUDIO_SCOPE: APPLICABLE

### STUDIO RPC BUDGET MATRIX

| Operation | Trigger | Planned maximum | Transactions | Terminal condition |
|---|---|---:|---:|---|
| Network/account/source checks | Before deployment and live matrix | 1 bounded check per item | 0 | Network, deployer role, source and schema match |
| Deployment | One approved deployment | 1 | 1 | `FINALIZED`, execution `SUCCESS`, parity readback |
| Register case | Unique live transition | 1 write plus bounded status/terminal receipt | 1 | `FINALIZED`, `SUCCESS`, case is `DRAFT` |
| Freeze case | Unique live transition | 1 write plus bounded status/terminal receipt | 1 | `FINALIZED`, `SUCCESS`, case is `FROZEN` |
| Assess case | Unique nondeterministic transition | 1 write plus bounded status/terminal receipt | 1 | `FINALIZED`, `SUCCESS`, case is `ASSESSED` |
| Retry unresolved | Unique retry transition | 1 write plus bounded status/terminal receipt | 1 | `FINALIZED`, `SUCCESS`, retry count increments |
| Authoritative readback | After each terminal write | 1 per transition plus final views | 0 | `get_case`/`has_case` matches expected state |
| Retry/cooldown | Only on transport/rate-limit uncertainty | 0 automatic retries | 0 | Preserve hash and stop on terminal/cooldown |

### STUDIO RPC BUDGET EVIDENCE

- Scope: Studionet, chain ID `61999`, contract `0x97375A261D51ec8B90D4DE44eD5Ea4711a598355`, deployer role recorded in the deployment manifest.
- Deployment: one finalized successful deployment transaction, hash recorded in [`docs/VERIFICATION.md`](VERIFICATION.md).
- Live matrix: four unique writes (`register_case`, `freeze_case`, `assess`, `retry_unresolved`) for `live-20260901-02`; each has an authoritative hash, `FINALIZED`, `MAJORITY_AGREE`, validator `SUCCESS`, matching receipt hash, and receipt status `0x1`.
- No duplicate Studio write or redeploy was created for the frontend-only batch. The earlier non-reproducible register receipt remains superseded history and is not reused as proof.
- Status polling was bounded by the Studio session and stopped at terminal state; the canonical recheck time and all four hashes are in `verification/studionet-receipts.json`.
- Variance: the legacy Studio evidence package did not expose a machine-counted per-RPC total. This record therefore claims only the measured transaction/readback facts above and does not invent a call count.
- STUDIO_MATRIX_STATUS: COMPLETE
- STUDIO_EVIDENCE_STATUS: COMPLETE

## FRONTEND_SCOPE

FRONTEND_SCOPE: APPLICABLE

### FRONTEND RPC BUDGET MATRIX

| Screen/workflow | Request source | Planned maximum | Polling/retry | Cache/invalidation | Expected transactions |
|---|---|---:|---|---|---:|
| Initial load | One account-free `createClient` and provider discovery | 1 client setup; 0 contract reads | None | No stale cache | 0 |
| Wallet connection | Explicit selected provider and client connection | 1 account request plus bounded chain validation | No automatic retry | Reset case context on account/network change | 0 |
| Register / freeze / assess | One selected-provider `writeContract` | 1 write; one bounded lifecycle wait; one readback | No automatic resubmission | Persist hash; invalidate case context after write | 1 each |
| Finality and execution | `waitForFinalization({ hash })` when available, compatibility receipt helper otherwise | One bounded wait; terminal receipt only | Stop at finality/error | Retain hash through uncertainty | 0 |
| Readback | Shared `readClient.readContract(get_case)` | 1 deliberate post-write read | No polling loop | No cache for verdict state | 0 |
| Reconciliation | Explicit `Continue verification` for saved hash | 1 resume attempt per user action | No automatic retry | Clear storage only after verified terminal state | 0 |
| Copy/Explorer | Clipboard and verified Explorer link | 0 RPC calls | None | No invalidation | 0 |

`MULTI_CLIENT_JUSTIFICATION: the account-free read client and provider-backed write client are the two roles required by the browser wallet integration; there are no competing read clients or pollers.`

### FRONTEND RPC BUDGET EVIDENCE

- The current frontend batch uses one shared `readClient` per selected network and one provider-bound write client; it has no interval poller, recursive retry, duplicate write path, or competing read cache.
- The coordinator emits `WAITING_FOR_WALLET`, `SUBMITTED`, `WAITING_FOR_FINALITY`, `VERIFYING_EXECUTION`, `VERIFYING_READBACK`, and terminal phases from actual promise/lifecycle outcomes.
- A valid hash is persisted before verification; readback uncertainty becomes `RECONCILIATION_REQUIRED`, and no automatic write retry exists.
- Local rendered review verified the disconnected initial state, no visible technical leakage, complete DOM hooks, desktop layout, 360px layout without horizontal overflow, and zero console warnings/errors.
- Vercel production: [`software-support-policy-applicability-ledger-pcong.vercel.app`](https://software-support-policy-applicability-ledger-pcong.vercel.app), `READY`, HTTP 200 for the application entrypoint from the `frontend/` static root. Browser request counts, wallet path, transaction hashes, finality, readback, and bounded defect-sweep evidence remain pending the controlled E2E run and must be added before `POST_GITHUB_VERCEL_FINAL`.
- FRONTEND_MATRIX_STATUS: COMPLETE
- FRONTEND_EVIDENCE_STATUS: PENDING_VERCEL_EXACT_RELEASE
