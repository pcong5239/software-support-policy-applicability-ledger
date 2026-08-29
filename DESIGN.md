# Design brief — Support Policy Applicability Ledger

## Product promise

Make a software-support decision auditable in one glance: the exact product facts, the policy source, the observed date, the consensus-backed outcome, and the evidence digest stay together.

## Audience and primary task

The primary user is a reviewer who registers a frozen case, asks the contract to assess it, and returns later to verify the readback. The interface therefore favors a short workflow and visible state over a broad dashboard.

## Visual direction

- Quiet, documentation-like surface with a warm paper background and dark ink.
- One accent color for actions; outcome colors are reserved for outcome semantics.
- Dense enough for review work, but with generous spacing around the decision and evidence digest.
- No decorative animation; status changes are communicated with text and a compact progress rail.

## Interaction rules

- The wallet and network are explicit before any write action is enabled.
- Every write waits for finality and checks the execution result before the next dependent action.
- A case is read back after assessment; the outcome shown is contract state, not client-side prediction.
- The policy URL is displayed as untrusted source input and is never rendered as HTML.
- Missing contract configuration is a visible setup state, not a silently failing button.

