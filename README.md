# Software Support Policy Applicability Ledger

Software Support Policy Applicability Ledger records a frozen software release and produces a consensus-backed answer to whether that release is supported by the publisher's policy.

## Verified links

- Studionet contract: [`0x97375A261D51ec8B90D4DE44eD5Ea4711a598355`](https://explorer-studio.genlayer.com/address/0x97375A261D51ec8B90D4DE44eD5Ea4711a598355)
- Deployment transaction: [`0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5`](https://explorer-studio.genlayer.com/tx/0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5)
- Live application: added after the Vercel release is deployed and verified.

## The trust problem

Software support depends on facts that can drift: product identity, release version, edition, region, policy URL, and the date being assessed. A centralized UI can be changed after the fact, can hide the source policy it used, or can report a decision without proving that the same inputs were assessed. The ledger freezes the release coordinates before evaluation and records the resulting consequence with an evidence digest.

## Why GenLayer is essential

The publisher policy is fetched as external, untrusted web evidence. The policy is not a trusted executable input: validators independently derive the consequence from the fetched document, release facts, and observed date. GenLayer consensus accepts only an equivalent consequence. The Intelligent Contract then stores the outcome and digest on-chain, so a reader can verify the final state rather than trusting a server response.

## How it works

1. Connect one of the supported wallets and select the configured Studionet deployment.
2. Enter the case ID, product, version, edition, region, and HTTPS policy URL.
3. Register the facts, then freeze the case. A frozen case cannot be edited.
4. Choose an observation date and assess the frozen case.
5. Wait for wallet confirmation, finality, semantic execution verification, and authoritative readback. The interface keeps the transaction hash, copy action, and Studionet Explorer link visible.
6. Read the stored outcome and evidence digest. If the result is unresolved or unclear, the owner may use the contract retry path when the integration exposes it.

Possible outcomes are `SUPPORTED`, `OUT_OF_SUPPORT`, `POLICY_EXCLUDES_SCOPE`, `POLICY_SCOPE_UNCLEAR`, and `UNRESOLVED`.

## Architecture and source of truth

- `contracts/support_policy_ledger.py` is the source of truth for registration, freeze, policy evaluation, consensus consequence, storage, and readback.
- `frontend/` is a dependency-light browser client. It uses the pinned `genlayer-js@1.1.8` browser entrypoint, one account-free read client, and one selected-wallet write client.
- `tests/` and `verification/` contain reproducible local contract/static checks.
- On-chain case state is authoritative after finality. Browser state is presentation and transaction-reconciliation state only; it never replaces contract readback.

## Intelligent Contract

The case owner registers and controls the case. `register_case` stores the exact release coordinates in `DRAFT`; `freeze_case` changes it to `FROZEN`; `assess` retrieves and validates the external policy through nondeterministic web access, then stores an `ASSESSED` outcome and digest; `retry_unresolved` is available only to the owner for unresolved or unclear assessments. `get_case` and `has_case` are public views.

The state path is `DRAFT → FROZEN → ASSESSED`. Registration and freeze are deterministic. Assessment is the nondeterministic boundary; the validator re-fetches the policy, re-derives the consequence, and compares the outcome and support window. No funds, license custody, linked contract, or EVM interface is involved.

## Transaction lifecycle

Every browser write follows explicit public phases: `IDLE`, `WAITING_FOR_WALLET`, `SUBMITTED`, `WAITING_FOR_FINALITY`, `VERIFYING_EXECUTION`, `VERIFYING_READBACK`, `SUCCESS`, `REJECTED`, `FAILED`, and `RECONCILIATION_REQUIRED`. A successful label is shown only after finality, successful contract execution, and method-specific readback agree. A returned hash is retained through transport or readback uncertainty; the client never automatically resubmits an ambiguous write. Reload recovery offers explicit continuation for the stored hash.

## Run locally

Prerequisites: Python 3.13, Node.js, the installed GenLayer runner/linter, and a browser with MetaMask, OKX Wallet, or Rabby when testing writes.

```powershell
$env:PYTHONIOENCODING = 'utf-8'
genvm-lint check --json contracts/support_policy_ledger.py
py -3.13 -m pytest -q -p no:cacheprovider tests verification
node --check frontend/app.js
node --check frontend/config.js
node tests/frontend_progress.test.js
py -3.13 -m http.server 4173
```

Open `http://127.0.0.1:4173/frontend/index.html`. The browser client imports the pinned SDK from `https://esm.sh/genlayer-js@1.1.8`; no package install or checked-in `node_modules` is required.

## Tests and verification

The current local result is `19 passed`, contract schema/lint PASS, frontend static checks PASS, Node syntax PASS, and `git diff --check` PASS. The exact deployed source hash, Studionet receipts, live matrix, and independent checkpoint evidence are in [`docs/VERIFICATION.md`](docs/VERIFICATION.md) and [`docs/RPC-BUDGET.md`](docs/RPC-BUDGET.md).

## Deployment and recovery

The release is deployed on Studionet (chain ID `61999`) at `0x97375A261D51ec8B90D4DE44eD5Ea4711a598355`. The deployed contract source SHA-256 is `314824D86E3CFF276E885E930F619717449D76D6AA5B8D364F4F37C41C4E6E8B`. The deployment transaction is finalized and successful; the authoritative receipt and post-deploy matrix are recorded in the verification documents. This contract is intentionally frozen: a post-deploy contract defect requires a new deployment and a new frontend address configuration, followed by fresh parity and live evidence.

## Security and trust boundaries

- User-entered and fetched policy content is treated as untrusted data.
- The contract enforces bounded text, HTTPS policy URLs, semantic version syntax, date syntax, owner authorization, state transitions, and retry limits.
- The frontend starts disconnected after reload and requires an explicit wallet choice.
- Only MetaMask, OKX Wallet, and Rabby are supported; the UI does not expose provider objects, RPC details, technical chain values, or secrets.
- No private keys, seed phrases, wallet exports, or deployment credentials are stored in the repository or browser configuration.

## Known limitations

- The current release uses the pinned compatibility client `genlayer-js@1.1.8`; its legacy receipt helper is retained while feature-detecting the current `waitForFinalization` lifecycle when available. The version boundary is documented in the RPC budget record.
- A public HTTPS policy endpoint must return the bounded JSON shape described by the contract; unavailable, malformed, oversized, or contradictory policy evidence fails closed to an unresolved/unclear outcome.
- The live application URL is not claimed until the Vercel deployment and browser E2E pass on the exact final release.

## Repository layout

- `contracts/` — deployed Intelligent Contract source.
- `frontend/` — public browser client.
- `tests/` — contract behavior and validator tests.
- `verification/` — reproducible local/live evidence inputs.
- `docs/` — final reviewer-facing verification and RPC budget records.
