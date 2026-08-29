# Stage 1 — Software Support Policy Applicability Ledger

Trust problem: support policy scope differs by product version, edition and region; product-name matching is insufficient. Actors: vendor publisher, customer/reviewer, assessor, validators, reader. Workflow: bind policy and exact product facts -> freeze -> assess -> `SUPPORTED`, `OUT_OF_SUPPORT`, `POLICY_EXCLUDES_EDITION`, `POLICY_SCOPE_UNCLEAR`, or `UNRESOLVED`. Closest projects: `license-scope`, `regulatory-edition-applicability-lock`, `airworthiness-directive-applicability-ledger`; this is support policy only. Evidence: policy URL, version bounds, edition/region scope, dates and readback.

## Revision 2 — differentiation and bounded grammar

Distinct value: this candidate records vendor support-window applicability for software release operations, using vendor lifecycle evidence and an integration-readable `support_end_date`; it does not interpret licenses, regulation or safety directives. Restricted version grammar is exactly `MAJOR.MINOR.PATCH` with three unsigned decimal components, no leading zeros except zero, no prerelease/build metadata or abbreviated forms. Policy dates are UTC ISO dates, both endpoints inclusive; exclusions are applied before date/version inclusion.

## Mechanism-level duplicate delta

| Closest project | Overlap | Non-overlapping trust/evidence/API/state/workflow value |
|---|---|---|
| `license-scope` | Freeze artifact/version; fetch public evidence; consensus outcome; retry | `license-scope` evaluates repository license terms against a declared use policy and returns `ALLOW/CONDITIONAL/BLOCK`. This candidate reads vendor lifecycle policy, evaluates version+edition+region+date, exposes exact `support_end_date`, and produces operational support status; it never interprets license rights or usage policy. |
| `regulatory-edition-applicability-lock` | Date-bound applicability and immutable evidence record | That project derives a legally incorporated regulatory edition from eCFR/Federal Register lineage and locks a downstream regulatory baseline. This candidate uses vendor-controlled lifecycle evidence, restricted software version grammar and an expiring support window; it creates no regulatory baseline, legal applicability or authority lineage. |
| `airworthiness-directive-applicability-ledger` | Version/configuration applicability and conservative unresolved behavior | ADAL evaluates FAA directives against aircraft configuration and creates a maintenance-review hold. This candidate evaluates software release support only, has no safety profile, directive supersession, reviewer hold or operational authorization consequence. |
| Existing support-window concepts | Vendor lifecycle source and support dates may overlap | Required differentiator is the reusable API projection `(product_id, version, edition, region, observed_date) -> outcome + support_end_date + evidence_digest`, with a deterministic bounded version parser and integration readback. If an existing project already exposes this same trust relation, evidence, API and state consequence, this candidate must be consolidated rather than built. |

The preserved value is an integration-readable, exact-date support-expiry primitive for release operations. The on-chain consequence is `SUPPORTED/OUT_OF_SUPPORT/POLICY_EXCLUDES_SCOPE/POLICY_SCOPE_UNCLEAR/UNRESOLVED` plus normalized `support_end_date`; no other compared project exposes this vendor-lifecycle projection. Duplicate audit must be rerun before build against any newer project added after this revision.
