# POST_DEPLOY_TEST evidence

This record is bound to the exact deployed source and Studionet instance below. It contains no private key, seed phrase, wallet export, or session credential.

## Current gate status

`POST_DEPLOY_TEST BLOCKED` — P0: PD-01 is not independently reproducible from the canonical Studionet API. The prior local observation is retained for audit history only; it is not sufficient authoritative evidence. No replacement transaction was created.

## Identity and deployment

- Project: Software Support Policy Applicability Ledger
- Network: Studionet; chain ID `61999`
- Source commit: `c53f6156e0bf8ff2f86339df5677e2149bd5c48b`
- Source SHA-256: `314824D86E3CFF276E885E930F619717449D76D6AA5B8D364F4F37C41C4E6E8B`
- Contract: `0x97375A261D51ec8B90D4DE44eD5Ea4711a598355`
- Deployment transaction: `0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5`
- Explorer route: `https://explorer-studio.genlayer.com/tx/0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5`
- Studio account/role: `0x34b92E6553eaCA11A00A9d86d75d8a7881779D78` / `deployer`
- Deployment status/result: `FINALIZED` / `SUCCESS`; execution mode `NORMAL`.
- Frontend deployment configuration: `frontend/config.js` points to this exact contract address.

## Live transaction matrix

All rows were executed in Codex In-app Browser Studio with Simulation Mode disabled and Normal (Full Consensus) selected. Every write reached `FINALIZED` with `SUCCESS`; consensus reached `ACCEPTED` before finality.

| Case | Method and arguments | Transaction hash | Output | Final readback |
|---|---|---|---|---|
| PD-01 register | `register_case("live-20260901-01", "support-agent", "1.0.0", "standard", "global", "https://example.com/")` | `0xc0f0348850dc66de14e8ac958fd7c94ebb9db2a39ff715e0d590c21ea163121a` | `"live-20260901-01"` | `get_case` at `FINALIZED`: `state=DRAFT`, owner equals deployer, all registration fields match |
| PD-02 freeze | `freeze_case("live-20260901-01")` | `0xed97ace7d19c9071765764076fb559e539adb74d7f3d6d95aaa3050f76e56bf8` | `"live-20260901-01"` | `get_case` at `FINALIZED`: `state=FROZEN` |
| PD-03 assess | `assess("live-20260901-01", "2026-09-01")` | `0xa5dc1cb6842c556d80bd1717c2d16efb4ddc4e20f3b1f0b4242712fc1b70b412` | `POLICY_SCOPE_UNCLEAR` | `get_case` at `FINALIZED`: `state=ASSESSED`, `outcome=POLICY_SCOPE_UNCLEAR`, `observed_date=2026-09-01` |
| PD-04 retry | `retry_unresolved("live-20260901-01")` | `0x4da42bfe136cff265a388e30ff36431a7b5b8af61f7ce22365a1c1d33d653d38` | `POLICY_SCOPE_UNCLEAR` | `get_case` at `FINALIZED`: `state=ASSESSED`, `outcome=POLICY_SCOPE_UNCLEAR`, `retry_count=1` |

## View checks

- `has_case("live-20260901-01")` at `FINALIZED`: `true`.
- `get_case("live-20260901-01")` at `FINALIZED` returned the persisted owner, product, version, edition, region, HTTPS policy URL, assessed date, outcome, state, and retry count shown above.
- The live URL intentionally returns ordinary HTML rather than the required policy JSON; the contract therefore failed closed to `POLICY_SCOPE_UNCLEAR`. This validates the safe malformed-policy consequence through live Web Access without manufacturing a public policy document.
- Machine-readable receipt summary: `verification/studionet-receipts.json`.

## Authoritative Studionet API recheck

An earlier local check on 2026-09-01 queried each live write hash at `https://studio.genlayer.com/api` using JSON-RPC methods `eth_getTransactionByHash` and `eth_getTransactionReceipt`. The following is historical evidence only; fresh independent review cannot reproduce PD-01, so the POST_DEPLOY gate remains blocked:

| Case | `eth_getTransactionByHash` | `eth_getTransactionReceipt` |
|---|---|---|
| PD-01 register | Historical observation: hash/tx_id `0xc0f0348850dc66de14e8ac958fd7c94ebb9db2a39ff715e0d590c21ea163121a`; `FINALIZED`; `MAJORITY_AGREE`; validator execution `SUCCESS` | Historical observation: transactionHash matched; `status=0x1`; `blockNumber=0x0`; current reproducibility `UNVERIFIABLE` |
| PD-02 freeze | hash/tx_id `0xed97ace7d19c9071765764076fb559e539adb74d7f3d6d95aaa3050f76e56bf8`; `FINALIZED`; `MAJORITY_AGREE`; validator execution `SUCCESS` | transactionHash matches; `status=0x1`; `blockNumber=0x0` |
| PD-03 assess | hash/tx_id `0xa5dc1cb6842c556d80bd1717c2d16efb4ddc4e20f3b1f0b4242712fc1b70b412`; `FINALIZED`; `MAJORITY_AGREE`; validator execution `SUCCESS` | transactionHash matches; `status=0x1`; `blockNumber=0x0` |
| PD-04 retry | hash/tx_id `0x4da42bfe136cff265a388e30ff36431a7b5b8af61f7ce22365a1c1d33d653d38`; `FINALIZED`; `MAJORITY_AGREE`; validator execution `SUCCESS` | transactionHash matches; `status=0x1`; `blockNumber=0x0` |

An earlier local observation at `2026-09-01T03:22:02.9116649Z` UTC returned PD-01 from both methods, but the fresh independent review reports `-32001 Transaction not found` and `result: null` for the same hash. Because the result is not independently reproducible, this package does not treat PD-01 as authoritative. The machine-readable record preserves that distinction in `verification/studionet-receipts.json`.

## Receipt observations

- Live receipts showed the full consensus lifecycle `PENDING → PROPOSING → COMMITTING → REVEALING → ACCEPTED → FINALIZED`.
- Validator execution cancellations after quorum were observed on some receipts; the transaction result remained `SUCCESS` and consensus/finality were authoritative.
- No source change, contract upgrade, GitHub push, or Vercel deployment occurred during this checkpoint.
