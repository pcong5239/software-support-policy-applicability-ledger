# POST_DEPLOY_TEST evidence

This record is bound to the exact deployed source and Studionet instance below. It contains no private key, seed phrase, wallet export, or session credential.

## Current gate status

The previously unverifiable `PD-01` remains superseded by `PD-01R`. The Studio contract and live matrix remain unchanged. The exact Vercel E2E release was repaired, redeployed once, and completed on 2026-09-05 UTC. The earlier frontend candidate `0e0c7a69e0ffbf476612b95343e930c6d24b81dd` and its blocked-platform run are superseded by frontend fix commit `03ae2fb704393c4380f8566f79ce268ff69e6c88`; anonymous re-review is required for this refreshed package.

## Identity and deployment

- Project: Software Support Policy Applicability Ledger
- Network: Studionet; chain ID `61999`
- Source commit (contract/deployment identity): `c53f6156e0bf8ff2f86339df5677e2149bd5c48b`
- Source SHA-256: `314824D86E3CFF276E885E930F619717449D76D6AA5B8D364F4F37C41C4E6E8B`
- Contract: `0x97375A261D51ec8B90D4DE44eD5Ea4711a598355`
- Deployment transaction: `0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5`
- Explorer route: `https://explorer-studio.genlayer.com/tx/0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5`
- Studio account/role: `0x34b92E6553eaCA11A00A9d86d75d8a7881779D78` / `deployer`
- Deployment status/result: `FINALIZED` / `SUCCESS`; execution mode `NORMAL`.
- Frontend deployment configuration: `frontend/config.js` points to this exact contract address.
- GitHub release: `https://github.com/pcong5239/software-support-policy-applicability-ledger/commit/e055cd548ba22fb62786f410190a2f837bec5832` (inherited; current frontend fix is not pushed)
- Vercel project: `pcong/software-support-policy-applicability-ledger`
- Vercel production URL: `https://software-support-policy-applicability-ledger-pcong.vercel.app`
- Vercel serving root: `frontend/`; production entrypoint returned HTTP 200 and the expected application title.
- Exact frontend release revision: `03ae2fb704393c4380f8566f79ce268ff69e6c88` (local source deployed to Vercel; not pushed).
- Exact frontend artifact SHA-256: `app.js` `7D474F7157044A6BBBE33547C3C24A1DADF1FCE4B997DF7C046840654EA42AA1`; `wallet-session.js` `3E88124C4C765800EB41A71A84FEE98C440D252E5930B762578C503A809FFE6B`; `tests/wallet_session.test.js` `14E30C0543EC1987047BE027AF4766A82A3926874F9DF3C7BA970FA8C977065A`; `index.html` `34F1153BB749910B6CE833CC7E2DD3E2F92FD32C7783B5218E793BE7DA17281B`; `styles.css` `D2F17465893A56EA7A71CF3983B7B85D76E271D84149319ECBEC29850DFD0570`; `tokens.css` `80E5B33CB4C974E3C68ED7D9BA1F926CBA9BB023FCED3E8D302D08C38D889749`.

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

This plan is for the production URL above, exact frontend release commit `03ae2fb704393c4380f8566f79ce268ff69e6c88`, and deployment `dpl_56S4bbjwbQa4Qu21jyCewUFd32x9`. The deployment URL was `https://software-support-policy-applicability-ledger-2e6t3lwky-pcong.vercel.app`; the project production alias is `https://software-support-policy-applicability-ledger-pcong.vercel.app`. It is a browser acceptance run, not a substitute for the contract matrix. The test wallet was a separate external OKX Wallet account and was not the Studio deployer account.

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

### Exact-release execution record

- State: `COMPLETE` for the critical journey and bounded sweep.
- Exact deployment: `dpl_56S4bbjwbQa4Qu21jyCewUFd32x9`, `READY`; exact deployment URL and stable project alias are recorded above.
- Clean-load PASS: page opened in the existing Chrome tab at the exact deployment; initial state was disconnected; Studionet and the deployed contract address were visible; the chooser exposed one real `OKX Wallet` option and no fake MetaMask option; no account request occurred merely from opening the chooser.
- Critical journey PASS: external OKX Wallet account `0x5d59…86e0` connected on Studionet. Unique case `e2e-20260905-03ae2fb` used `support-agent`, `1.0.0`, `standard`, `global`, and `https://example.com/`.
- Register PASS: hash `0x19fa2cff93641e4988d3cb626d9d0fba93a2742bdbc109114854d352fecfa36d`; UI reached transaction complete with visible hash and `DRAFT` readback; canonical receipt was `FINALIZED`, `MAJORITY_AGREE`, status `0x1`, matching transaction hash.
- Freeze PASS: hash `0x63049d946b36418d66effb6fd80b07afbf88d91eb6f0a95e740c829f0660d84f`; UI reached transaction complete with authoritative `FROZEN` readback; canonical receipt was `FINALIZED`, `MAJORITY_AGREE`, status `0x1`, matching transaction hash.
- Assess PASS: hash `0x08218b0a57b65993c8ea212d668f83ec93ff4856e2d1fdf1f2ce50edeeefa8d6`; UI reached transaction complete with `ASSESSED`, `POLICY_SCOPE_UNCLEAR`, observed date `2026-09-05`, retry count `0`; canonical receipt was `FINALIZED`, `MAJORITY_AGREE`, status `0x1`, matching transaction hash.
- Reload/reconnect/readback PASS: reloaded the same deployment in the same tab, explicitly reconnected the same external wallet, entered only the case ID, and loaded the on-chain result showing `ASSESSED / POLICY_SCOPE_UNCLEAR` with the original case fields.
- Safe sweep PASS: disconnect restored `Not connected` and cleared readback; chooser Cancel and Escape both returned to stable disconnected state; native invalid-URL validation blocked submission before any transaction; the public rendered text contained no EIP-6963, provider-object, RPC, chain-ID, debug, test-state, injected-provider or wallet-routing language; browser console logs were empty; responsive breakpoints and `prefers-reduced-motion` are present in the final CSS.
- Evidence boundary: the current Node REPL browser client exposes no CDP request/resource-count API and its page context exposes no `performance` object. The frontend RPC record therefore reports bounded logical call maxima from the single-client/single-write implementation and browser lifecycle observations, not an invented wire-level method count.
- Superseded evidence: the prior `BLOCKED_PLATFORM` run on deployment `dpl_DeeZFKg7TjiQcpg2ZaMS918VtHVC` and the pre-fix failed readback run are retained only as history; they do not qualify as evidence for this exact release.

### Terminal criteria

The plan is `COMPLETE` for this exact release: the critical journey and bounded sweep passed, every required write has finality plus semantic execution success plus authoritative readback, the public phase indicator matched observations, and the bounded frontend RPC ledger is recorded. This does not claim `POST_GITHUB_VERCEL_FINAL`; the current frontend fix remains unpushed and requires the checkpoint-specific anonymous re-review before release progression.

## Receipt observations

- Live receipts showed the full consensus lifecycle `PENDING → PROPOSING → COMMITTING → REVEALING → ACCEPTED → FINALIZED`.
- Validator execution cancellations after quorum were observed on some receipts; the transaction result remained `SUCCESS` and consensus/finality were authoritative.
- No contract source change, contract upgrade or additional Studio transaction occurred during the frontend repair/redeploy. GitHub identity is inherited as recorded above; the current frontend revision was deployed only to the locked Vercel project. Browser E2E is complete only for the exact release identity recorded above.
