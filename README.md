# Software Support Policy Applicability Ledger

An Intelligent Contract that records a frozen software-support applicability case and uses consensus-backed web evidence to classify it as `SUPPORTED`, `OUT_OF_SUPPORT`, `POLICY_EXCLUDES_SCOPE`, `POLICY_SCOPE_UNCLEAR`, or `UNRESOLVED`.

## Repository layout

- `contracts/support_policy_ledger.py` — contract source.
- `tests/test_support_policy_ledger.py` — direct-mode behavior and validator tests.
- `verification/feasibility_probe.py` — no-product-logic current-runner probe.
- `frontend/` — dependency-light browser client using the documented `genlayer-js` CDN entrypoint.
- `DESIGN.md` — UI intent and safety rules.
- `STAGE-1.md`, `STAGE-2.md` — approved research baseline.

## Local verification

```powershell
$env:PYTHONIOENCODING = 'utf-8'
genvm-lint check --json contracts/support_policy_ledger.py
py -3.13 -m pytest -q -p no:cacheprovider tests verification/test_feasibility_probe.py
```

The current pinned environment passes the contract schema/lint check and the direct-mode suite. The newer-runner notice from `genvm-lint` is informational; this repository does not download or install a replacement runner as part of the build.

## Frontend configuration

Serve the repository from a local HTTP server, then open `frontend/index.html`. Enter the deployed contract address and choose the target GenLayer network in the UI. The browser client discovers wallet providers through EIP-6963 and only enables writes after an explicit provider/account selection.

The frontend intentionally has no checked-in `node_modules` or package install. It imports the pinned SDK entrypoint from `genlayer-js@1.1.8` at runtime; a release review must verify that this external runtime is acceptable for the target deployment environment.

## Scope boundary

This project records applicability decisions. It does not custody funds, issue licenses, make regulatory determinations, or treat a policy URL as trusted executable input.

