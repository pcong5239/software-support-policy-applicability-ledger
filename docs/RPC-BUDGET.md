# RPC Budget Record

RPC_BUDGET_REVISION: contract c53f6156e0bf8ff2f86339df5677e2149bd5c48b; frontend release commit cd8407a13307d549fbd5d6ef04f300fa2a097591; Vercel deployment dpl_5UbN4mNaV2XrucSnXaTzQLGcoP9Z
OFFICIAL_DOCS_CHECKED: https://docs.genlayer.com/api-references/genlayer-js and https://docs.genlayer.com/api-references/genlayer-node/gen/gen_getTransactionStatus; checked 2026-09-05 UTC

The Studio and frontend scopes are measured separately. Studio evidence is inherited from the approved deployed package because this release batch does not change contract bytes, ABI, address, network, or Studio transactions. The exact Vercel release completed the controlled E2E run in the existing Chrome session. The evidence-enabled release observer captured actual page HTTP GenLayer RPC method counts and timings without request payloads; the OKX extension provider method itself was not wire-captured because its request property is non-writable, while provider behavior remains covered by executable wallet-session tests.

## STUDIO_SCOPE

STUDIO_SCOPE: APPLICABLE

## STUDIO RPC MEASUREMENT CAPABILITY PROBE

STUDIO_CAPABILITY_PROBE_STATUS: COMPLETE
STUDIO_MEASUREMENT_MODE: OBSERVABLE_ACTION_LEDGER
STUDIO_MEASUREMENT_TIMING: RETROSPECTIVE_LEGACY
STUDIO_CAPABILITY_PROBE_AT: 2026-09-05T17:58:17Z
STUDIO_FIRST_ACTION_AT: 2026-09-01T02:20:51.464Z
STUDIO_E2E_STARTED_AT: 2026-09-01T02:52:16.178Z
STUDIO_CAPABILITY_TOOL_OR_API: Codex Browser runtime documentation, capability listing, and retained Studio action trace
STUDIO_CAPABILITY_CHECK: The retained browser surface exposes DOM, screenshots and developer logs but no request-event/CDP/performance network stream; direct canonical JSON-RPC reads can verify existing hashes only.
STUDIO_CAPABILITY_RESULT: Physical Studio request telemetry is unavailable. Existing primary-AI Studio actions, transaction hashes, bounded status checkpoints, terminal receipt observations and authoritative readbacks are observable and recorded below.
STUDIO_PHYSICAL_COUNT_SOURCE: NOT_APPLICABLE
STUDIO_PHYSICAL_COUNT_CLAIM: NONE
STUDIO_REPLAY_FOR_MEASUREMENT: NO

### STUDIO RPC BUDGET MATRIX

STUDIO_MATRIX_STATUS: COMPLETE

| Operation/case | RPC method or Studio action | Trigger | Planned maximum | Poll interval / attempts | Retry/cooldown | Terminal condition | Transaction count | Evidence |
|---|---|---|---:|---|---|---|---:|---|
| Network/account/source checks | Studio UI/API checks | Before deployment and live matrix | 1 bounded check per item | Not wire-observable | No retry | Network, role, source and schema match | 0 | deployment manifest and Studio trace |
| Deployment | Deploy exact approved source | One approved deployment | 1 submission | Bounded terminal observation | 0 automatic retries | `FINALIZED`, execution `SUCCESS`, parity readback | 1 | `0xda771a...0ba6b5` |
| Register case | `register_case` | Unique live transition | 1 submission | Bounded terminal observation | 0 automatic retries | `FINALIZED`, `SUCCESS`, case `DRAFT` | 1 | `0xa47f47...e48ffde4` |
| Freeze case | `freeze_case` | Unique live transition | 1 submission | Bounded terminal observation | 0 automatic retries | `FINALIZED`, `SUCCESS`, case `FROZEN` | 1 | `0x341208...2988cded` |
| Assess case | `assess` | Unique nondeterministic transition | 1 submission | Bounded terminal observation | 0 automatic retries | `FINALIZED`, `SUCCESS`, case `ASSESSED` | 1 | `0xfbc486...c03580e4` |
| Retry unresolved | `retry_unresolved` | Unique retry transition | 1 submission | Bounded terminal observation | 0 automatic retries | `FINALIZED`, `SUCCESS`, retry count increments | 1 | `0xa26d1e...25725623` |
| Authoritative readback | `get_case` / `has_case` | After terminal transitions and final state | 1 per required read | No polling loop | 0 | Stored state matches expected state | 0 | Studio trace and canonical readback |
| Retry/cooldown | Studio session control | Only on transport/rate-limit uncertainty | 0 automatic retries | Stop on terminal/cooldown | No replay | Preserve exact hash | 0 | no replay/redeploy for measurement |

### STUDIO RPC BUDGET EVIDENCE

STUDIO_EVIDENCE_STATUS: COMPLETE
STUDIO_ACTION_LEDGER_STATUS: COMPLETE
STUDIO_PHYSICAL_REQUESTS: NOT_APPLICABLE
STUDIO_ACTIONS: 5
STUDIO_TRANSACTIONS: 5
STUDIO_TRANSACTION_HASHES: deployment `0xda771a...0ba6b5`; register `0xa47f47...e48ffde4`; freeze `0x341208...2988cded`; assess `0xfbc486...c03580e4`; retry `0xa26d1e...25725623`
STUDIO_STATUS_POLL_ATTEMPTS: 10
STUDIO_TERMINAL_RECEIPT_READS: 5
STUDIO_AUTHORITATIVE_READBACKS: 7
STUDIO_RETRIES: 0
STUDIO_DUPLICATE_TRANSACTIONS: 0
STUDIO_MATRIX_VARIANCE: 0 unexplained variance; physical request total is not observable and is intentionally not claimed

The counts above are primary-AI Studio action-ledger counts from the retained exact-run trace, not physical network-request counts. `STUDIO_STATUS_POLL_ATTEMPTS` counts the ten bounded terminal-status checkpoints across deployment and the four live writes; `STUDIO_TERMINAL_RECEIPT_READS` counts one terminal receipt observation per transaction; `STUDIO_AUTHORITATIVE_READBACKS` counts five per-transition readbacks plus the final `get_case` and `has_case` views. No missing physical metric is represented as zero.

| Operation/case | Physical requests if observable | Studio actions | Transactions | Hash | Status polls | Terminal receipt reads | Authoritative readbacks | Retries | Variance/result |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Deployment | NOT_APPLICABLE | 1 | 1 | `0xda771a...0ba6b5` | 1 | 1 | 1 | 0 | `FINALIZED` / `SUCCESS` / parity verified |
| `live-20260901-02` register | NOT_APPLICABLE | 1 | 1 | `0xa47f47...e48ffde4` | 3 | 1 | 1 | 0 | `FINALIZED` / `MAJORITY_AGREE` / `DRAFT` |
| `live-20260901-02` freeze | NOT_APPLICABLE | 1 | 1 | `0x341208...2988cded` | 2 | 1 | 1 | 0 | `FINALIZED` / `MAJORITY_AGREE` / `FROZEN` |
| `live-20260901-02` assess | NOT_APPLICABLE | 1 | 1 | `0xfbc486...c03580e4` | 2 | 1 | 1 | 0 | `FINALIZED` / `MAJORITY_AGREE` / `ASSESSED` |
| `live-20260901-02` retry | NOT_APPLICABLE | 1 | 1 | `0xa26d1e...25725623` | 2 | 1 | 1 | 0 | `FINALIZED` / `MAJORITY_AGREE` / retry `1` |
| Final views (`get_case`, `has_case`) | NOT_APPLICABLE | 0 | 0 | none | 0 | 0 | 2 | 0 | authoritative final state confirmed |

- Scope: Studionet, chain ID `61999`, contract `0x97375A261D51ec8B90D4DE44eD5Ea4711a598355`, deployer role recorded in the deployment manifest.
- Deployment: one finalized successful deployment transaction, hash recorded in [`docs/VERIFICATION.md`](VERIFICATION.md).
- Live matrix: four unique writes (`register_case`, `freeze_case`, `assess`, `retry_unresolved`) for `live-20260901-02`; each has an authoritative hash, `FINALIZED`, `MAJORITY_AGREE`, validator `SUCCESS`, matching receipt hash, and receipt status `0x1`.
- No duplicate Studio write or redeploy was created for the frontend-only batch. The earlier non-reproducible register receipt remains superseded history and is not reused as proof.
- Status polling was bounded by the Studio session and stopped at terminal state; the canonical recheck time and all four hashes are in `verification/studionet-receipts.json`. The action-ledger count is retrospective and does not claim physical request visibility.

## FRONTEND_SCOPE

FRONTEND_SCOPE: APPLICABLE

## FRONTEND EVIDENCE-PLAN ADJUSTMENT

FRONTEND_EVIDENCE_PLAN_ADJUSTMENT_STATUS: APPROVED_BY_USER
FRONTEND_PROVIDER_MEASUREMENT_STATUS: NOT_OBSERVABLE_ON_EXACT_RELEASE
FRONTEND_PROVIDER_MEASUREMENT_SCOPE: `eth_requestAccounts`, `eth_accounts`, `eth_chainId`, and any `wallet_switchEthereumChain`/`wallet_addEthereumChain` call actually invoked
FRONTEND_PROVIDER_MEASUREMENT_SOURCE: Exact Vercel page observer plus retained Chrome capability probe; provider request property was non-writable and Chrome exposed no Network/CDP/performance request stream
FRONTEND_ALTERNATIVE_EVIDENCE: Exact-release page HTTP RPC counts and lifecycle markers; exact-release wallet journey/readback; executable wallet-session call-path and state-machine regressions; explicit provider limitation and no inferred physical counts
FRONTEND_ADJUSTMENT_NO_REPLAY: YES
FRONTEND_ADJUSTMENT_NO_REDEPLOY: YES
FRONTEND_ADJUSTMENT_APPROVAL: USER_APPROVED_IN_TASK_2026-09-06

This evidence-plan adjustment was approved by the user for the current frontend RPC gate. It does not convert executable tests into exact-release physical counts and does not claim the provider calls were observed.

### FRONTEND RPC BUDGET MATRIX

| Screen/workflow | Request source | Planned maximum | Polling/retry | Cache/invalidation | Expected transactions |
|---|---|---:|---|---|---:|
| Initial load | One account-free `createClient` and provider discovery | 1 client setup; 0 contract reads | None | No stale cache | 0 |
| Wallet discovery | Page-lifetime announcements plus one bounded legacy scan when chooser opens | 0 account requests; 0 contract reads | One 350 ms discovery window; no retry loop | Dedupe by wallet and provider identity | 0 |
| Wallet connection | Explicit wallet-option click | 1 `eth_requestAccounts`; 1 `eth_accounts` confirmation; up to 2 `wallet_switchEthereumChain` calls; up to 1 `wallet_addEthereumChain` only after `4902`; 1 `eth_chainId` validation | One switch retry only after successful add; no automatic retry for other errors | Atomically reset session/case context on account, chain or disconnect | 0 |
| Register / freeze / assess | One selected-provider `writeContract` | 1 write; 3 HTTP preflight RPC; 11 status RPC; 1 readback RPC | No automatic resubmission | Persist hash; invalidate case context after write | 1 each |
| Finality and execution | `waitForFinalization({ hash })` when available, compatibility receipt helper otherwise | Up to 11 `eth_getTransactionByHash` polls per write; 10 measured intervals | Stop at finality/error | Retain hash through uncertainty | 0 |
| Readback | Shared `readClient.readContract(get_case)` | 1 deliberate `gen_call` post-write read | No polling loop | No cache for verdict state | 0 |
| Reconciliation | Explicit `Continue verification` for saved hash | 1 resume attempt per user action | No automatic retry | Clear storage only after verified terminal state | 0 |
| Copy/Explorer | Clipboard and verified Explorer link | 0 RPC calls | None | No invalidation | 0 |

`MULTI_CLIENT_JUSTIFICATION: the account-free read client and provider-backed write client are the two roles required by the browser wallet integration; there are no competing read clients or pollers.`

### FRONTEND RPC BUDGET EVIDENCE

- The current frontend batch uses one shared `readClient` per selected network and one provider-bound write client; it has no interval poller, recursive retry, duplicate write path, or competing read cache.
- The coordinator emits `WAITING_FOR_WALLET`, `SUBMITTED`, `WAITING_FOR_FINALITY`, `VERIFYING_EXECUTION`, `VERIFYING_READBACK`, and terminal phases from actual promise/lifecycle outcomes.
- A valid hash is persisted before verification; readback uncertainty becomes `RECONCILIATION_REQUIRED`, and no automatic write retry exists.
- Local integrated-browser review verified the disconnected initial state, native chooser focus, zero-wallet cardinality without fake options, no account request on chooser open, complete public instructions, and no visible technical leakage. Executable wallet-session regressions cover canonical provider updates, conflicting-identity preservation, non-callable provider rejection, wrong-chain account changes, stale-session invalidation, listener teardown, and disconnect. Automated checks report `21 passed`.
- Vercel production: [`software-support-policy-applicability-ledger-pcong.vercel.app`](https://software-support-policy-applicability-ledger-pcong.vercel.app), exact deployment `dpl_5UbN4mNaV2XrucSnXaTzQLGcoP9Z`, `READY`, HTTP 200 for the application entrypoint from the `frontend/` static root. The exact browser run used case `e2e-rpc-20260905-cd8407a`, external OKX Wallet, three finalized writes, reload/reconnect/readback, and the bounded safety sweep; full hashes and canonical receipts are in `verification/POST-DEPLOY-TEST.md` and `verification/studionet-receipts.json`.
- Physical browser RPC evidence: clean load logged one `client:created` marker and `0` GenLayer HTTP requests; provider discovery made `0` account requests until explicit option click. Each register/freeze/assess action emitted exactly `1 eth_getTransactionCount + 1 eth_estimateGas + 1 eth_gasPrice + 11 eth_getTransactionByHash + 1 gen_call`, for `15` HTTP RPC requests per write and one transaction. The 10 status intervals were register `3482–3873 ms`, freeze `3479–3925 ms`, and assess `3723–3894 ms`; no automatic retry or duplicate submission occurred. Explicit reload/reconnect readback emitted exactly `1 gen_call`; copy/Explorer controls emitted `0` GenLayer RPC calls. Console log inspection returned no warnings/errors.
- Provider capture limitation: the OKX extension provider's request function was non-writable in this session, so `eth_requestAccounts`, `eth_accounts`, and `eth_chainId` were not wire-counted by the observer. The canonical wallet-session regression suite covers those provider methods and the live flow completed with the separate external OKX account on Studionet.
- FRONTEND_MATRIX_STATUS: COMPLETE
- FRONTEND_EVIDENCE_STATUS: COMPLETE_WITH_USER_APPROVED_EVIDENCE_PLAN_ADJUSTMENT (provider-extension method capture limitation disclosed above)
