# Verification

## Exact identity

- Contract source commit: `c53f6156e0bf8ff2f86339df5677e2149bd5c48b`
- Contract source SHA-256: `314824D86E3CFF276E885E930F619717449D76D6AA5B8D364F4F37C41C4E6E8B`
- Network: Studionet, chain ID `61999`
- Contract: [`0x97375A261D51ec8B90D4DE44eD5Ea4711a598355`](https://explorer-studio.genlayer.com/address/0x97375A261D51ec8B90D4DE44eD5Ea4711a598355)
- Deployment transaction: [`0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5`](https://explorer-studio.genlayer.com/tx/0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5)
- Vercel project: `pcong/software-support-policy-applicability-ledger`
- Vercel production URL: [`software-support-policy-applicability-ledger-pcong.vercel.app`](https://software-support-policy-applicability-ledger-pcong.vercel.app)
- Vercel exact candidate deployment: `READY`, deployment ID `dpl_DeeZFKg7TjiQcpg2ZaMS918VtHVC`, serving the `frontend/` static root at the stable production alias.
- GitHub commit: [`e055cd548ba22fb62786f410190a2f837bec5832`](https://github.com/pcong5239/software-support-policy-applicability-ledger/commit/e055cd548ba22fb62786f410190a2f837bec5832)

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

Current candidate result: contract lint/schema PASS; `21 passed`; frontend syntax/static checks PASS; executable provider/session integration regression PASS; exact Vercel candidate serving PASS; initial/reload/chooser/reset public UI checks PASS; public instructions and required DOM hooks present; no visible wallet-routing/RPC/debug leakage. Frontend candidate commit: `0e0c7a69e0ffbf476612b95343e930c6d24b81dd`. The critical Vercel wallet journey is recorded as `BLOCKED_PLATFORM`: the only detected OKX provider rejected two explicit connection attempts without opening a wallet popup, so no account, write, finality or readback was reached.

## Deployed-source parity and live proof

The deployed contract source matches the SHA-256 above. The four fresh live rows for `live-20260901-02` are recorded in [`verification/POST-DEPLOY-TEST.md`](../verification/POST-DEPLOY-TEST.md) and [`verification/studionet-receipts.json`](../verification/studionet-receipts.json): registration, freeze, assessment, and retry each reached `FINALIZED` with `SUCCESS`, `MAJORITY_AGREE`, matching receipt identity, and receipt status `0x1`. Final readback confirms `has_case=true`, `state=ASSESSED`, `outcome=POLICY_SCOPE_UNCLEAR`, and `retry_count=1`.

## Exact Vercel E2E observation

- Stable production alias served the exact candidate deployment `dpl_DeeZFKg7TjiQcpg2ZaMS918VtHVC`; `index.html`, `app.js`, `wallet-session.js`, `styles.css`, and `tokens.css` returned HTTP 200 with hashes matching the candidate package.
- Clean load and reload both started disconnected with Studionet and the deployed contract address visible. The chooser detected exactly one live supported option, `OKX Wallet`, with no synthetic wallet options. Cancel and Escape both closed the chooser and restored the disconnected state.
- Two explicit clicks on the detected OKX option produced the same user-facing wallet-request-cancelled state. No wallet popup/tab appeared, no account was returned, no transaction was submitted, and browser console logs contained zero warnings/errors. A read-only provider-presence check after rejection found no injected wallet globals in the page context.
- E2E state: `BLOCKED_PLATFORM`; the critical journey cannot be marked PASS until a callable external wallet is available and the exact release completes the signature, transaction, finality, readback and bounded sweep path. No final release approval is claimed.

## Scope and limitations

The current public release batch changes only frontend presentation, Studionet-only configuration, transaction-progress handling, and public verification documentation. Contract bytes, deployed address, deployment transaction, and Studio live evidence are unchanged. Exact Vercel serving is verified, but the browser E2E is currently `BLOCKED_PLATFORM` by the unavailable/rejecting wallet provider and measured frontend RPC evidence is incomplete; `POST_GITHUB_VERCEL_FINAL` and final release approval are not claimed.
