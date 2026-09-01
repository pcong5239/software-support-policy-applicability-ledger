# PRE_DEPLOY package

## Identity

- Project: Software Support Policy Applicability Ledger
- Category: GenLayer Intelligent Contract with browser dApp
- Exact source revision commit: `c53f6156e0bf8ff2f86339df5677e2149bd5c48b`
- Evidence package commit: pending commit of this package
- Contract source: `contracts/support_policy_ledger.py`
- Contract source SHA-256: `314824D86E3CFF276E885E930F619717449D76D6AA5B8D364F4F37C41C4E6E8B`
- Network target: Studionet
- Studio deployer public address and role: `0x34b92E6553eaCA11A00A9d86d75d8a7881779D78` — `deployer`; no upgrade path is advertised for the frozen release
- Contract address / deployment transaction / explorer: not created at this checkpoint
- GitHub / live web: not created at this checkpoint
- Secret-free deployment manifest: `verification/DEPLOYMENT-MANIFEST.md`
- Recovery/reset runbook: `verification/RECOVERY-RUNBOOK.md`

## Approved behavior implemented

- A case stores owner, exact product/version/edition/region, HTTPS policy URL, observed date, support window, outcome, digest, and bounded retry count.
- Only the owner can freeze a draft and retry an unresolved assessment.
- Assessment is available only after freeze and uses a nondeterministic web read inside `run_nondet_unsafe`.
- Leader and validator independently derive the consequence. Consensus compares outcome and support-window fields, not validator-local evidence digests.
- Version bounds and date bounds are explicit and inclusive/exclusive; edition and region exclusions are evaluated before support-window bounds.
- The browser renders contract readback as the source of truth and waits for `FINALIZED` plus an explicitly present `FINISHED_WITH_RETURN` before dependent actions; missing or other execution results fail closed.
- The browser wallet selector is explicit and limited to MetaMask, OKX Wallet, and Rabby; account/chain changes clear the active case context.
- Each consequential write retains the full transaction hash, offers copy, and links to the verified Studionet Explorer transaction route.

## Exact verification evidence

Command:

```powershell
$env:PYTHONIOENCODING = 'utf-8'
genvm-lint check --json contracts/support_policy_ledger.py
py -3.13 -m pytest -q -p no:cacheprovider tests verification
node --check frontend/app.js
node --check frontend/config.js
```

Results at this revision:

- `genvm-lint check`: PASS; 3 lint checks, schema valid, 6 methods, 2 views, 4 writes, 0 constructor parameters.
- Direct-mode and verification suite: PASS; `18 passed`.
- Frontend JavaScript syntax: PASS.
- Static HTTP smoke: PASS; `frontend/index.html`, `frontend/app.js`, and `frontend/styles.css` each returned HTTP 200 from a local server.
- Wallet/transaction UI static checks: PASS; unsupported provider labels are excluded and the hash/copy/Explorer evidence elements are present.
- Informational warning: `I200` reports a newer runner is available. No replacement runner or package was installed.
- Informational warning: `gltest.config.yaml` is absent, so the installed runner defaults were used; this local suite makes no Studio integration claim.

## Feasibility and runtime note

The official Web Access page documents `response.status_code`, while the pinned Direct Mode runner exposes `response.status`. The task-local `_response_status` adapter accepts both and returns no status for missing/non-integer fields; the contract treats any result other than `200` as `UNRESOLVED`. This resolution is recorded in `verification/FEASIBILITY-BLOCKER.md`.

The failure matrix includes malformed JSON, unavailable source/HTTP 503, timeout-like HTTP 504, overlong body, missing required policy field, retry recovery, product mismatch, validator disagreement, and boundary cases. The pinned browser dependency is `genlayer-js@1.1.8`; a HEAD check returned HTTP 200 for `https://esm.sh/genlayer-js@1.1.8` on 2026-09-01. Current official references checked on 2026-09-01: [GenLayerJS](https://docs.genlayer.com/api-references/genlayer-js), [first contract](https://docs.genlayer.com/developers/intelligent-contracts/first-contract), [Web Access](https://docs.genlayer.com/developers/intelligent-contracts/features/web-access), and [Networks](https://docs.genlayer.com/developers/networks).

This single-contract release has no linked Intelligent Contracts, no IC-to-EVM interface, and no value-transfer or economic-custody path. Direct Mode mocks do not prove Studio wallet identity, live consensus, finality, authoritative readback, deployed-source parity, or Explorer evidence.

Lifecycle confirmation: `INTENTIONALLY FROZEN — CONFIRMED BY USER IN PRIMARY TASK ON 2026-09-01`. The user acknowledged that a post-deploy defect may require deploying a new contract. The Studio deployer public address and role are recorded above without exposing secrets.

## PRE_DEPLOY boundary

No wallet signature, contract deployment, contract write, GitHub push, Vercel deployment, or live transaction has occurred. This package is a corrected re-review candidate, not an approval. PRE_DEPLOY remains blocked until the anonymous co-review AI approves this exact source/package identity. Any later change requires a new source hash and evidence package.
