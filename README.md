# Software Support Policy Applicability Ledger

An Intelligent Contract that records a frozen software-support applicability case and uses consensus-backed web evidence to classify it as `SUPPORTED`, `OUT_OF_SUPPORT`, `POLICY_EXCLUDES_SCOPE`, `POLICY_SCOPE_UNCLEAR`, or `UNRESOLVED`.

## Repository layout

- `contracts/support_policy_ledger.py` — contract source.
- `tests/test_support_policy_ledger.py` — direct-mode behavior and validator tests.
- `verification/feasibility_probe.py` — no-product-logic current-runner probe.
- `frontend/` — dependency-light browser client using the documented `genlayer-js` CDN entrypoint.
- `verification/DEPLOYMENT-MANIFEST.md` — secret-free Studionet deployment identity and interface manifest.
- `verification/RECOVERY-RUNBOOK.md` — Studio/local and Studionet reset boundaries.
- `DESIGN.md` — UI intent and safety rules.
- `STAGE-1.md`, `STAGE-2.md` — approved research baseline.

## Local verification

```powershell
$env:PYTHONIOENCODING = 'utf-8'
genvm-lint check --json contracts/support_policy_ledger.py
py -3.13 -m pytest -q -p no:cacheprovider tests verification/test_feasibility_probe.py
node --check frontend/app.js
node --check frontend/config.js
```

The current pinned environment passes the contract schema/lint check and the direct-mode suite. The newer-runner notice from `genvm-lint` is informational; this repository does not download or install a replacement runner as part of the build.

The repository intentionally has no checked-in `gltest.config.yaml`; the installed Direct Mode runner supplies its documented defaults. This local suite does not claim Studio integration, wallet identity, live consensus, finality, or deployed-source parity.

## Frontend configuration

Serve the repository from a local HTTP server, then open `frontend/index.html`. Enter the deployed contract address and choose the target GenLayer network in the UI. The browser client discovers wallet providers through EIP-6963 and only enables writes after an explicit provider/account selection.

The frontend intentionally has no checked-in `node_modules` or package install. It imports the pinned SDK entrypoint from `genlayer-js@1.1.8` at runtime. The current official [GenLayerJS](https://docs.genlayer.com/api-references/genlayer-js), [first contract](https://docs.genlayer.com/developers/intelligent-contracts/first-contract), [Web Access](https://docs.genlayer.com/developers/intelligent-contracts/features/web-access), and [Networks](https://docs.genlayer.com/developers/networks) pages were checked on 2026-09-01; the pinned CDN entrypoint is recorded in the deployment manifest.

## Scope boundary

This project records applicability decisions. It does not custody funds, issue licenses, make regulatory determinations, or treat a policy URL as trusted executable input.
