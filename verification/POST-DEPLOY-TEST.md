# POST_DEPLOY_TEST evidence

This record is bound to the exact deployed source and Studionet instance below. It contains no private key, seed phrase, wallet export, or session credential.

## Current gate status

Fresh replacement matrix recorded after explicit user authorization on 2026-09-01. The previously unverifiable `PD-01` is superseded by `PD-01R`; no source change, contract upgrade, or redeploy occurred. Anonymous `POST_DEPLOY_TEST` re-review is pending.

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
| PD-01R register | `register_case("live-20260901-02", "support-agent", "1.0.0", "standard", "global", "https://example.com/")` | `0xa47f473653a0473ceecb168a2544c8fbe7a62e5df75b093e2972c449e48ffde4` | `"live-20260901-02"` | `get_case` at `FINALIZED`: `state=DRAFT`, owner equals deployer, all registration fields match |
| PD-02R freeze | `freeze_case("live-20260901-02")` | `0x3412087594d90dfa89ca03db5a91bf503f9689168d2ec0fec187f2132988cded` | `"live-20260901-02"` | `get_case` at `FINALIZED`: `state=FROZEN` |
| PD-03R assess | `assess("live-20260901-02", "2026-09-01")` | `0xfbc4865f99fe9e756429a114293bffde26b2c9efbeeca919ea204337c03580e4` | `POLICY_SCOPE_UNCLEAR` | `get_case` at `FINALIZED`: `state=ASSESSED`, `outcome=POLICY_SCOPE_UNCLEAR`, `observed_date=2026-09-01` |
| PD-04R retry | `retry_unresolved("live-20260901-02")` | `0xa26d1ed76a05790ef6e8fbf965eb598dfb6f6eb4ea51cbecbb35ba6125725623` | `POLICY_SCOPE_UNCLEAR` | `get_case` at `FINALIZED`: `state=ASSESSED`, `outcome=POLICY_SCOPE_UNCLEAR`, `retry_count=1` |

## View checks

- `has_case("live-20260901-02")` at `FINALIZED`: `true`.
- `get_case("live-20260901-02")` at `FINALIZED` returned the persisted owner, product, version, edition, region, HTTPS policy URL, assessed date, outcome, state, and retry count shown above.
- The live URL intentionally returns ordinary HTML rather than the required policy JSON; the contract therefore failed closed to `POLICY_SCOPE_UNCLEAR`. This validates the safe malformed-policy consequence through live Web Access without manufacturing a public policy document.
- Machine-readable receipt summary: `verification/studionet-receipts.json`.

## Authoritative Studionet API recheck

The fresh replacement matrix was queried directly at `https://studio.genlayer.com/api` using JSON-RPC methods `eth_getTransactionByHash` and `eth_getTransactionReceipt`:

Latest four-hash canonical recheck: `2026-09-01T03:36:21.0314205Z` UTC. All four returned matching transaction identities, `FINALIZED`, `MAJORITY_AGREE`, validator success, and receipt `status=0x1`.

| Case | `eth_getTransactionByHash` | `eth_getTransactionReceipt` |
|---|---|---|
| PD-01R register | hash/tx_id `0xa47f473653a0473ceecb168a2544c8fbe7a62e5df75b093e2972c449e48ffde4`; `FINALIZED`; `MAJORITY_AGREE`; validator execution `SUCCESS` | transactionHash matches; `status=0x1`; `blockNumber=0x0` |
| PD-02R freeze | hash/tx_id `0x3412087594d90dfa89ca03db5a91bf503f9689168d2ec0fec187f2132988cded`; `FINALIZED`; `MAJORITY_AGREE`; validator execution `SUCCESS` | transactionHash matches; `status=0x1`; `blockNumber=0x0` |
| PD-03R assess | hash/tx_id `0xfbc4865f99fe9e756429a114293bffde26b2c9efbeeca919ea204337c03580e4`; `FINALIZED`; `MAJORITY_AGREE`; validator execution `SUCCESS` | transactionHash matches; `status=0x1`; `blockNumber=0x0` |
| PD-04R retry | hash/tx_id `0xa26d1ed76a05790ef6e8fbf965eb598dfb6f6eb4ea51cbecbb35ba6125725623`; `FINALIZED`; `MAJORITY_AGREE`; validator execution `SUCCESS` | transactionHash matches; `status=0x1`; `blockNumber=0x0` |

The old `live-20260901-01` case and its non-reproducible PD-01 receipt remain superseded audit history. The fresh `live-20260901-02` matrix is the candidate authoritative evidence for re-review; its machine-readable receipts are in `verification/studionet-receipts.json`.

## Receipt observations

- Live receipts showed the full consensus lifecycle `PENDING → PROPOSING → COMMITTING → REVEALING → ACCEPTED → FINALIZED`.
- Validator execution cancellations after quorum were observed on some receipts; the transaction result remained `SUCCESS` and consensus/finality were authoritative.
- No source change, contract upgrade, GitHub push, or Vercel deployment occurred during this checkpoint.
