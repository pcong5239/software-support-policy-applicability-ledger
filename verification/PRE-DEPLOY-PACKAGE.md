# PRE_DEPLOY package

## Identity

- Project: Software Support Policy Applicability Ledger
- Category: GenLayer Intelligent Contract with browser dApp
- Exact source revision commit: `1cbbb172fefcfbc7ed02e7ded3b69c4e1014ac86`
- Contract source: `contracts/support_policy_ledger.py`
- Contract source SHA-256: `314824D86E3CFF276E885E930F619717449D76D6AA5B8D364F4F37C41C4E6E8B`
- Network target: Studionet
- Studio deployer public address and role: `MISSING — must be selected and recorded before PRE_DEPLOY review`
- Contract address / deployment transaction / explorer: not created at this checkpoint
- GitHub / live web: not created at this checkpoint

## Approved behavior implemented

- A case stores owner, exact product/version/edition/region, HTTPS policy URL, observed date, support window, outcome, digest, and bounded retry count.
- Only the owner can freeze a draft and retry an unresolved assessment.
- Assessment is available only after freeze and uses a nondeterministic web read inside `run_nondet_unsafe`.
- Leader and validator independently derive the consequence. Consensus compares outcome and support-window fields, not validator-local evidence digests.
- Version bounds and date bounds are explicit and inclusive/exclusive; edition and region exclusions are evaluated before support-window bounds.
- The browser renders contract readback as the source of truth and waits for `FINALIZED` plus `FINISHED_WITH_RETURN` before dependent actions.
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
- Direct-mode and verification suite: PASS; `15 passed`.
- Frontend JavaScript syntax: PASS.
- Static HTTP smoke: PASS; `frontend/index.html`, `frontend/app.js`, and `frontend/styles.css` each returned HTTP 200 from a local server.
- Wallet/transaction UI static checks: PASS; unsupported provider labels are excluded and the hash/copy/Explorer evidence elements are present.
- Informational warning: `I200` reports a newer runner is available. No replacement runner or package was installed.

## Feasibility and runtime note

The official Web Access page documents `response.status_code`, while the pinned Direct Mode runner exposes `response.status`. The task-local `_response_status` adapter accepts both and returns no status for missing/non-integer fields; the contract treats any result other than `200` as `UNRESOLVED`. This resolution is recorded in `verification/FEASIBILITY-BLOCKER.md`.

## PRE_DEPLOY boundary

No wallet signature, contract deployment, contract write, GitHub push, Vercel deployment, or live transaction has occurred. PRE_DEPLOY review is not yet requestable because the exact public Studio deployer address and role have not been selected and recorded. Once that human-owned checkpoint input is supplied, this exact package must be re-hashed if anything changes and sent to the anonymous co-review AI using the mandatory first-message template.
