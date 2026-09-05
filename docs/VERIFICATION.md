# Verification

## Exact identity

- Contract source commit: `c53f6156e0bf8ff2f86339df5677e2149bd5c48b`
- Contract source SHA-256: `314824D86E3CFF276E885E930F619717449D76D6AA5B8D364F4F37C41C4E6E8B`
- Network: Studionet, chain ID `61999`
- Contract: [`0x97375A261D51ec8B90D4DE44eD5Ea4711a598355`](https://explorer-studio.genlayer.com/address/0x97375A261D51ec8B90D4DE44eD5Ea4711a598355)
- Deployment transaction: [`0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5`](https://explorer-studio.genlayer.com/tx/0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5)
- Vercel project: `pcong/software-support-policy-applicability-ledger`
- Vercel production URL: [`software-support-policy-applicability-ledger-pcong.vercel.app`](https://software-support-policy-applicability-ledger-pcong.vercel.app)
- Vercel exact candidate deployment: `READY`, deployment ID `dpl_56S4bbjwbQa4Qu21jyCewUFd32x9`, serving the `frontend/` static root at the stable production alias; exact deployment URL `https://software-support-policy-applicability-ledger-2e6t3lwky-pcong.vercel.app`.
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

Current release result: contract lint/schema PASS; `21 passed`; frontend syntax/static checks PASS; executable provider/session integration regression PASS; exact Vercel serving PASS; initial/reload/chooser/reset/validation public UI checks PASS; public instructions and required DOM hooks present; no visible wallet-routing/RPC/debug leakage. Exact frontend commit: `03ae2fb704393c4380f8566f79ce268ff69e6c88`. The critical Vercel journey and bounded sweep are `COMPLETE` on deployment `dpl_56S4bbjwbQa4Qu21jyCewUFd32x9`; the prior blocked-platform run is superseded history.

## Deployed-source parity and live proof

The deployed contract source matches the SHA-256 above. The four fresh live rows for `live-20260901-02` are recorded in [`verification/POST-DEPLOY-TEST.md`](../verification/POST-DEPLOY-TEST.md) and [`verification/studionet-receipts.json`](../verification/studionet-receipts.json): registration, freeze, assessment, and retry each reached `FINALIZED` with `SUCCESS`, `MAJORITY_AGREE`, matching receipt identity, and receipt status `0x1`. Final readback confirms `has_case=true`, `state=ASSESSED`, `outcome=POLICY_SCOPE_UNCLEAR`, and `retry_count=1`.

## Exact Vercel E2E observation

- Stable production alias served the exact deployment `dpl_56S4bbjwbQa4Qu21jyCewUFd32x9`; `index.html`, `app.js`, `wallet-session.js`, `styles.css`, and `tokens.css` returned HTTP 200 with hashes matching the exact frontend package.
- Clean load and reload both started disconnected with Studionet and the deployed contract address visible. The chooser detected exactly one live supported option, `OKX Wallet`, with no synthetic wallet options. Cancel and Escape both closed the chooser and restored the disconnected state.
- External OKX Wallet account `0x5d59…86e0` connected on Studionet. Case `e2e-20260905-03ae2fb` completed register, freeze and assess with hashes and authoritative Studionet receipts recorded in [`verification/POST-DEPLOY-TEST.md`](../verification/POST-DEPLOY-TEST.md) and [`verification/studionet-receipts.json`](../verification/studionet-receipts.json): each was `FINALIZED`, `MAJORITY_AGREE`, receipt status `0x1`, and readback matched the visible state.
- Reload/reconnect preserved the on-chain `ASSESSED / POLICY_SCOPE_UNCLEAR` result. Disconnect, chooser Cancel, chooser Escape, native invalid-URL validation, public-text leakage, responsive breakpoints, reduced-motion CSS, and zero console warnings/errors all passed. E2E state: `COMPLETE` for this exact deployment; this does not claim final anonymous approval.

## Scope and limitations

The current release batch changes only the frontend readback assertion and its regression coverage plus the exact Vercel/evidence records. Contract bytes, deployed address, deployment transaction, and Studio live evidence are unchanged. The browser client exposed no CDP request/resource-count API and no page `performance` object; frontend RPC evidence is therefore a bounded logical call ledger rather than an invented wire-level method count. The current frontend fix is not pushed to GitHub; `POST_GITHUB_VERCEL_FINAL` and final release approval are not claimed.
