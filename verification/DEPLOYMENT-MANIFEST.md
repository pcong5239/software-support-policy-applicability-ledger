# Secret-free deployment manifest (draft)

This file is a deployment input and recovery record. It contains no private key, seed phrase, wallet export, or session credential.

## Target

- Network: Studionet
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Contract source: `contracts/support_policy_ledger.py`
- Constructor arguments: none
- Contract address: pending approved deployment
- Deployment transaction: pending approved deployment
- Explorer transaction: pending approved deployment

## Exact source identity

- Source revision commit: pending final source commit
- Contract source SHA-256: `314824D86E3CFF276E885E930F619717449D76D6AA5B8D364F4F37C41C4E6E8B` (refresh after source changes)
- Evidence package commit: pending package commit

## Ownership and lifecycle

- Studio deployer public address: pending human selection
- Studio deployer role: pending human selection
- Lifecycle classification: `INTENTIONALLY FROZEN` is pending explicit user confirmation.
- If frozen is confirmed, a post-deploy defect cannot be repaired in place; the recovery path is a new deployment and frontend reconfiguration.

## Interfaces and dependencies

- Linked Intelligent Contracts: none.
- IC-to-EVM interface: none.
- Value transfer or economic custody: none.
- Browser dependency: pinned runtime entrypoint `genlayer-js@1.1.8` from `https://esm.sh/genlayer-js@1.1.8`.
- Official documentation checked: [Networks](https://docs.genlayer.com/developers/networks), [GenLayerJS](https://docs.genlayer.com/api-references/genlayer-js), [First contract](https://docs.genlayer.com/developers/intelligent-contracts/first-contract), and [Web Access](https://docs.genlayer.com/developers/intelligent-contracts/features/web-access), checked 2026-09-01.

## Studio limitation

Direct Mode and local tests validate contract behavior and failure handling only. They do not prove Studio wallet identity, live consensus, finality, authoritative chain readback, deployed-source parity, or Explorer evidence. Those claims require the approved Studionet deployment and post-deploy evidence package.
