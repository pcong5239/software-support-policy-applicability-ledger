# POST_DEPLOY_TEST evidence

This record is bound to the exact deployed source and Studionet instance below. It contains no private key, seed phrase, wallet export, or session credential.

## Current gate status

Fresh replacement matrix recorded after explicit user authorization on 2026-09-01. The previously unverifiable `PD-01` is superseded by `PD-01R`. The Studio contract and live matrix remain unchanged. The refreshed Vercel E2E plan is bound to frontend candidate commit `0e0c7a69e0ffbf476612b95343e930c6d24b81dd`; only frontend source, presentation tokens and frontend tests changed after the prior checkpoint.

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
- GitHub release: pending exact candidate push; prior public release remains `279db208cecb440165c828fa2e0cd21a4d1ce680`
- Vercel project: `pcong/software-support-policy-applicability-ledger`
- Vercel production URL: `https://software-support-policy-applicability-ledger-pcong.vercel.app`
- Vercel serving root: `frontend/`; production entrypoint returned HTTP 200 and the expected application title.
- Frontend candidate revision: `0e0c7a69e0ffbf476612b95343e930c6d24b81dd` (local exact source; not pushed or deployed at this checkpoint).
- Candidate artifact SHA-256: `app.js` `ED4BEC32EF86C68ABC3D4CE3B46F057390B91A8828C53180CFF8BB4E52D3D321`; `wallet-session.js` `3E88124C4C765800EB41A71A84FEE98C440D252E5930B762578C503A809FFE6B`; `tests/wallet_session.test.js` `14E30C0543EC1987047BE027AF4766A82A3926874F9DF3C7BA970FA8C977065A`; `index.html` `34F1153BB749910B6CE833CC7E2DD3E2F92FD32C7783B5218E793BE7DA17281B`; `styles.css` `A255AF3F84411A461F6C681A8E333820907340B46A568F965A01423D95CEC913`; `tokens.css` `80E5B33CB4C974E3C68ED7D9BA1F926CBA9BB023FCED3E8D302D08C38D889749`.

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

## Vercel E2E plan

This plan is for the production URL above after it is updated to exact frontend candidate commit `0e0c7a69e0ffbf476612b95343e930c6d24b81dd`. It is a browser acceptance run, not a substitute for the contract matrix. The test wallet must be a separate supported wallet account and must not be the Studio deployer account.

### Initial state and actor boundary

- Open the production URL in Google Chrome from a clean page state.
- Confirm the visible initial state is disconnected, the network selector shows Studionet, the contract address is the deployed address, and the chooser shows exactly the supported wallets actually detected (0–3), without requesting accounts until a wallet option is clicked.
- Use one fresh external wallet account for the complete case. The user only confirms or rejects wallet popups; all navigation, form entry, waiting, readback and evidence capture remain under primary-AI control.
- Do not use seeded case IDs or the Studio deployer account. Generate one unique case ID for this run and use the public HTTPS endpoint `https://example.com/` as the intentionally non-policy response; the expected safe outcome is `POLICY_SCOPE_UNCLEAR`.

### Ordered critical journey

1. Open the chooser, select one detected wallet and connect. Verify its canonical name/icon, displayed account, correct Studionet connection, and atomic `Disconnect` action before enabling writes. Exercise wrong-network recovery only on `4902` if encountered; do not add the network otherwise.
2. Enter the unique case ID, product `support-agent`, version `1.0.0`, edition `standard`, region `global`, and `https://example.com/`. Submit registration.
3. For each write, capture the visible phase sequence `WAITING_FOR_WALLET` → `SUBMITTED` → `WAITING_FOR_FINALITY` → `VERIFYING_EXECUTION` → `VERIFYING_READBACK` → `SUCCESS`. Capture the full transaction hash, copy control and current Studionet Explorer link. Treat rejection, missing hash, non-finality, non-success execution or mismatched readback as failure; never submit a second transaction automatically.
4. Freeze the registered case and verify authoritative readback is `FROZEN` before assessment is enabled.
5. Assess the frozen case for the current date. Verify finality, semantic execution success, consensus/finality and authoritative readback `ASSESSED` with `POLICY_SCOPE_UNCLEAR`.
6. Reload after the completed journey, reconnect the same external wallet explicitly, read the case back, and verify the visible result remains the on-chain result rather than browser-only state. The contract retry path is already covered by the Studio matrix; it is not a browser-advertised control in this frontend release.

### Risk-based sweep and evidence capture

- During the journey, record the exact URL, viewport, provider, account role (external wallet), every transaction hash, phase transitions, finality/semantic result, consensus result, authoritative readback and visible outcome.
- Measure browser RPC traffic separately from Studio traffic using the browser's captured request/resource entries. For each action, record request source, method where exposed, planned maximum, actual count, polling attempts/interval, retry count/delay, cache/in-flight behavior, invalidation and transaction count in `docs/RPC-BUDGET.md`.
- Sweep the shared risk surface after the first complete journey: disconnected reload, provider cardinality/deduplication, chooser Escape/focus/close behavior, wrong-network/account/disconnect handling, invalid form inputs, wallet rejection without a transaction, retained-hash/reconciliation controls, reload/reconnect, desktop and 360px layout, accessible live status, console errors and visible technical leakage.
- If any defect appears, preserve the exact evidence, finish only safe bounded checks, batch shared root causes, run the affected automated tests, deploy once for that batch, and rerun all failed/affected cases on the new exact release. Do not create a replacement transaction for an ambiguous write.

### Terminal criteria

The plan is `COMPLETE` only when the critical journey and bounded sweep pass on the exact production release, every required write has finality plus semantic execution success plus authoritative readback, the public phase indicator matches observations, and the frontend RPC evidence is complete. Otherwise record `FAIL` or a verified `BLOCKED_PLATFORM` with the exact evidence and preserve the session for recovery.

## Receipt observations

- Live receipts showed the full consensus lifecycle `PENDING → PROPOSING → COMMITTING → REVEALING → ACCEPTED → FINALIZED`.
- Validator execution cancellations after quorum were observed on some receipts; the transaction result remained `SUCCESS` and consensus/finality were authoritative.
- No contract source change, contract upgrade or additional Studio transaction occurred during the frontend release; GitHub and Vercel release identity are recorded above. Browser E2E remains unclaimed until the plan completes.
