# Recovery and reset runbook

This runbook is intentionally secret-free. Never record a private key, seed phrase, wallet export, or session credential here.

## Studio/local reset

1. Stop using the affected address and record the exact source commit, source hash, and last known deployment transaction.
2. Restart the local/Studio session, reconnect the explicitly selected deployer wallet, and verify the intended network and public address.
3. Re-import the contract by address only when the deployed source and address are known to match.
4. Re-run authoritative readback and the safe failure checks before allowing any dependent write.

## Studionet reset

1. Treat the old contract state as unrecoverable if the contract is intentionally frozen or the deployment identity is uncertain.
2. Select a fresh disposable Studionet deployment target and record the public deployer address and role.
3. Deploy only after a new `PRE_DEPLOY APPROVED` checkpoint; record deployment transaction, finalized execution result, contract address, and Explorer link.
4. Re-run the post-deploy readback matrix against the new address and update the frontend contract configuration only after source parity is proven.

## Interface and Studio boundaries

- This release has no linked contracts, no IC-to-EVM interface, and no value-transfer or economic-custody path.
- Direct Mode mocks are not live deployment evidence.
- A finalized transaction without `FINISHED_WITH_RETURN` is a failure; do not continue to dependent actions.
- If source identity, wallet identity, or authoritative readback cannot be established, stop and create a new evidence package rather than retrying writes.
