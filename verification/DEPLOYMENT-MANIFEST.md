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

- Source revision commit: `c53f6156e0bf8ff2f86339df5677e2149bd5c48b`
- Contract source SHA-256: `314824D86E3CFF276E885E930F619717449D76D6AA5B8D364F4F37C41C4E6E8B`
- Evidence package commit: pending package commit

## Ownership and lifecycle

- Studio deployer public address: `0x34b92E6553eaCA11A00A9d86d75d8a7881779D78`
- Studio deployer role: `deployer` for this intentionally frozen release; no upgrade path is advertised.
- Lifecycle classification: `INTENTIONALLY FROZEN`.
- User confirmation: received in the primary Task on 2026-09-01: "I confirm this contract is INTENTIONALLY FROZEN; a post-deploy defect may require deploying a new contract."
- If frozen is confirmed, a post-deploy defect cannot be repaired in place; the recovery path is a new deployment and frontend reconfiguration.

## Interfaces and dependencies

- Linked Intelligent Contracts: none.
- IC-to-EVM interface: none.
- Value transfer or economic custody: none.
- Browser dependency: pinned runtime entrypoint `genlayer-js@1.1.8` from `https://esm.sh/genlayer-js@1.1.8`.
- Official documentation checked: [Networks](https://docs.genlayer.com/developers/networks), [GenLayerJS](https://docs.genlayer.com/api-references/genlayer-js), [First contract](https://docs.genlayer.com/developers/intelligent-contracts/first-contract), and [Web Access](https://docs.genlayer.com/developers/intelligent-contracts/features/web-access), checked 2026-09-01.

## Studio limitation

Direct Mode and local tests validate contract behavior and failure handling only. They do not prove Studio wallet identity, live consensus, finality, authoritative chain readback, deployed-source parity, or Explorer evidence. Those claims require the approved Studionet deployment and post-deploy evidence package.
