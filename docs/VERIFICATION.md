# Verification

## Exact identity

- Contract source commit: `c53f6156e0bf8ff2f86339df5677e2149bd5c48b`
- Contract source SHA-256: `314824D86E3CFF276E885E930F619717449D76D6AA5B8D364F4F37C41C4E6E8B`
- Network: Studionet, chain ID `61999`
- Contract: [`0x97375A261D51ec8B90D4DE44eD5Ea4711a598355`](https://explorer-studio.genlayer.com/address/0x97375A261D51ec8B90D4DE44eD5Ea4711a598355)
- Deployment transaction: [`0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5`](https://explorer-studio.genlayer.com/tx/0xda771a514a82cdbb214dc1864f6ee7479bcf8929a8763f65eb8839512d0ba6b5)
- Vercel project: `pcong/software-support-policy-applicability-ledger`
- Vercel production URL: [`software-support-policy-applicability-ledger-pcong.vercel.app`](https://software-support-policy-applicability-ledger-pcong.vercel.app)
- Vercel production serving: `READY` at the stable production alias; the frontend is deployed from the `frontend/` static root.
- GitHub commit: [`20bfb61adee39de2436e3030a58f4aa4a805124e`](https://github.com/pcong5239/software-support-policy-applicability-ledger/commit/20bfb61adee39de2436e3030a58f4aa4a805124e)

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

Current candidate result: contract lint/schema PASS; `21 passed`; frontend syntax/static checks PASS; executable provider/session integration regression PASS; integrated-browser disconnected load and zero-wallet chooser PASS; public instructions and required DOM hooks present; no visible wallet-routing/RPC/debug leakage. Frontend candidate commit: `0e0c7a69e0ffbf476612b95343e930c6d24b81dd`. The existing Vercel production alias still serves the prior release; exact-candidate Vercel E2E and measured frontend RPC evidence remain pending.

## Deployed-source parity and live proof

The deployed contract source matches the SHA-256 above. The four fresh live rows for `live-20260901-02` are recorded in [`verification/POST-DEPLOY-TEST.md`](../verification/POST-DEPLOY-TEST.md) and [`verification/studionet-receipts.json`](../verification/studionet-receipts.json): registration, freeze, assessment, and retry each reached `FINALIZED` with `SUCCESS`, `MAJORITY_AGREE`, matching receipt identity, and receipt status `0x1`. Final readback confirms `has_case=true`, `state=ASSESSED`, `outcome=POLICY_SCOPE_UNCLEAR`, and `retry_count=1`.

## Scope and limitations

The current public release batch changes only frontend presentation, Studionet-only configuration, transaction-progress handling, and public verification documentation. Contract bytes, deployed address, deployment transaction, and Studio live evidence are unchanged. Vercel production serving is verified; browser E2E and measured frontend RPC evidence are deliberately not claimed until the exact final public release completes that gate.
