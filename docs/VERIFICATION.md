# Verification

## Exact identity

- Contract source commit: `c53f6156e0bf8ff2f86339df5677e2149bd5c48b`
- Contract source SHA-256: `314824D86E3CFF276E885E930F619717449D76D6AA5B8D364F4F37C41C4E6E8B`
- Network: Studionet, chain ID `61999`
- Contract: [`0x97375A261D51ec8B90D4DE44eD5Ea4711a598355`](https://explorer-studio.genlayer.com/address/0x97375A261D51ec8B90D4DE44eD5Ea4711a598355)
- Deployment transaction: [`0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5`](https://explorer-studio.genlayer.com/tx/0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5)
- Vercel project: `pcong/software-support-policy-applicability-ledger`
- Vercel production URL: [`software-support-policy-applicability-ledger-pcong.vercel.app`](https://software-support-policy-applicability-ledger-pcong.vercel.app)
- Vercel exact candidate deployment: `READY`, deployment ID `dpl_5UbN4mNaV2XrucSnXaTzQLGcoP9Z`, serving the `frontend/` static root at the stable production alias; exact deployment URL `https://software-support-policy-applicability-ledger-iiavxdlr7-pcong.vercel.app`.
- GitHub commit: [`886f7f212b642c321e1bcfa7a0c6997a7fab2ab5`](https://github.com/pcong5239/software-support-policy-applicability-ledger/commit/886f7f212b642c321e1bcfa7a0c6997a7fab2ab5)

## Local checks

```powershell
$env:PYTHONIOENCODING = 'utf-8'
genvm-lint check --json contracts/support_policy_ledger.py
py -3.13 -m pytest -q -p no:cacheprovider tests verification
node --check frontend/app.js
node --check frontend/config.js
node tests/frontend_progress.test.js
git diff --check
```

Current release result: contract lint/schema PASS; `21 passed`; frontend syntax/static checks PASS; executable provider/session integration regression PASS; exact Vercel serving PASS; initial/reload/chooser/reset/validation public UI checks PASS; public instructions and required DOM hooks present; no visible wallet-routing/RPC/debug leakage. Exact frontend commit: `cd8407a13307d549fbd5d6ef04f300fa2a097591`. The critical Vercel journey and bounded sweep are `COMPLETE` on deployment `dpl_5UbN4mNaV2XrucSnXaTzQLGcoP9Z`; the prior blocked-platform run is superseded history.

## Deployed-source parity and live proof

The deployed contract source matches the SHA-256 above. The four fresh live rows for `live-20260901-02` are recorded in [`verification/POST-DEPLOY-TEST.md`](../verification/POST-DEPLOY-TEST.md) and [`verification/studionet-receipts.json`](../verification/studionet-receipts.json): registration, freeze, assessment, and retry each reached `FINALIZED` with `SUCCESS`, `MAJORITY_AGREE`, matching receipt identity, and receipt status `0x1`. Final readback confirms `has_case=true`, `state=ASSESSED`, `outcome=POLICY_SCOPE_UNCLEAR`, and `retry_count=1`.

## Exact Vercel E2E observation

- Stable production alias served the exact deployment `dpl_5UbN4mNaV2XrucSnXaTzQLGcoP9Z`; `index.html`, `app.js`, `wallet-session.js`, `rpc-observer.js`, `styles.css`, and `tokens.css` returned HTTP 200 with hashes matching the exact frontend package.
- Clean load and reload both started disconnected with Studionet and the deployed contract address visible. The chooser detected exactly one live supported option, `OKX Wallet`, with no synthetic wallet options. Cancel and Escape both closed the chooser and restored the disconnected state.
- External OKX Wallet account `0x5d59…86e0` connected on Studionet. Case `e2e-rpc-20260905-cd8407a` completed register, freeze and assess with hashes and authoritative Studionet receipts recorded in [`verification/POST-DEPLOY-TEST.md`](../verification/POST-DEPLOY-TEST.md) and [`verification/studionet-receipts.json`](../verification/studionet-receipts.json): each was `FINALIZED`, `MAJORITY_AGREE`, leader execution `SUCCESS`, receipt status `0x1`, and readback matched the visible state.
- Reload/reconnect preserved the on-chain `ASSESSED / POLICY_SCOPE_UNCLEAR` result. Disconnect, chooser Cancel, chooser Escape, native invalid-URL validation, public-text leakage, responsive breakpoints, reduced-motion CSS, and zero console warnings/errors all passed. Physical fetch observation measured 15 HTTP GenLayer RPC requests per write: one each of `eth_getTransactionCount`, `eth_estimateGas`, and `eth_gasPrice`, eleven `eth_getTransactionByHash` polls, and one `gen_call` readback; explicit reload readback emitted one `gen_call`, and clean load emitted none. E2E state: `COMPLETE` for this exact deployment; this does not claim final anonymous approval.

## Scope and limitations

The current release batch changes only the frontend readback assertion, the evidence-only RPC observer and their regression/evidence records. Contract bytes, deployed address, deployment transaction, and Studio live evidence are unchanged. The observer captures page HTTP RPC metadata without payloads; the OKX extension request method was non-writable and is disclosed as a provider-capture limitation, with provider behavior covered by executable wallet-session tests. The frontend release is now published in the verified GitHub repository; `POST_GITHUB_VERCEL_FINAL` and final release approval are not claimed by this checkpoint record.

## Final category scorecard

Category: `PROJECT`
Validity gate: `PASS`

### GenLayer fit — 4/5

- Evidence-backed reason: the consensus-critical consequence is whether a frozen software release is supported by an external publisher policy, with validators independently deriving the outcome and the contract storing the result and digest.
- Exact evidence inspected: `contracts/support_policy_ledger.py`; `verification/studionet-receipts.json`; `verification/POST-DEPLOY-TEST.md` rows PD-03R and PD-04R; final `get_case`/`has_case` readbacks.
- Remaining weakness: policy evidence can legitimately produce `POLICY_SCOPE_UNCLEAR` or `UNRESOLVED`; the system proves a bounded fail-closed decision, not universal policy availability.

### Contract quality — 4/5

- Evidence-backed reason: bounded registration/freeze/assessment state transitions, owner authorization, HTTPS and input validation, nondeterministic policy verification, retry limits and authoritative readback are implemented and live-tested.
- Exact evidence inspected: `contracts/support_policy_ledger.py`; contract lint/schema output; `tests/`; `verification/studionet-receipts.json`; finalized PD-01R through PD-04R receipts.
- Remaining weakness: the deployed contract is intentionally frozen, so a contract defect requires a new deployment and frontend address reconfiguration.

### Engineering — 4/5

- Evidence-backed reason: the repository has incremental history, reproducible commands, 21 passing tests, source/deployment parity, bounded RPC records, finalized receipts and a public verification package.
- Exact evidence inspected: GitHub commit `886f7f212b642c321e1bcfa7a0c6997a7fab2ab5`; `README.md`; `docs/VERIFICATION.md`; `docs/RPC-BUDGET.md`; canonical release audit output; `tests/` and `verification/`.
- Remaining weakness: the pinned compatibility runtime emits an informational newer-runner warning and the local runner uses defaults because `gltest.config.yaml` is absent; both facts are documented and do not weaken the live proof.

### Frontend / UX — 4/5

- Evidence-backed reason: the public UI completes wallet selection, validation, register/freeze/assess lifecycle, finality and semantic verification, authoritative readback, reload/reconnect and safe failure/reconciliation behavior with responsive and accessibility checks.
- Exact evidence inspected: exact Vercel deployment `dpl_5UbN4mNaV2XrucSnXaTzQLGcoP9Z`; frontend revision `cd8407a13307d549fbd5d6ef04f300fa2a097591`; `frontend/`; `tests/frontend_progress.test.js`; `tests/wallet_session.test.js`; exact E2E case `e2e-rpc-20260905-cd8407a`.
- Remaining weakness: provider-extension physical request counts are not observable in the supported browser surface; the release records page HTTP RPC counts, lifecycle/readback evidence and executable wallet-session regressions, without inferring provider counts.

Overall evidence-based assessment: the exact contract, deployment, GitHub repository and Vercel application are consistent; required local, live, lifecycle, readback, public-claim and bounded RPC evidence passes, with the disclosed provider telemetry limitation handled by the approved alternative evidence plan.

Submission recommendation: `READY` for final release review. Explorer submission has not been made; it requires the separate `EXPLORER_PRE_SUBMISSION` checkpoint and same-package dual approval.
