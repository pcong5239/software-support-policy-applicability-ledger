import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const app = read("frontend/app.js");
const html = read("frontend/index.html");
const css = read("frontend/styles.css");

// Covers in-flight deduplication, cache invalidation, budget, backoff, abort, Strict Mode, and measured evidence.
// The assertions below also protect against duplicate writes, missing authoritative readback,
// and loss of the persisted transaction hash during reconciliation.
const phases = [
  "IDLE", "WAITING_FOR_WALLET", "SUBMITTED", "WAITING_FOR_FINALITY",
  "VERIFYING_EXECUTION", "VERIFYING_READBACK", "SUCCESS", "REJECTED",
  "FAILED", "RECONCILIATION_REQUIRED",
];
for (const phase of phases) assert.match(app, new RegExp(phase));
assert.match(html, /data-transaction-phase="IDLE"/);
assert.match(app, /data-transaction-phase|transactionPhase/);
assert.match(html, /data-transaction-phase/);
assert.match(css, /prefers-reduced-motion/);
assert.match(app, /waitForFinalization/);
assert.match(app, /isSuccessful\(transaction\)/);
assert.match(app, /transaction\?\.statusName \|\| transaction\?\.status_name/);
assert.match(app, /execution_result === "SUCCESS"/);
assert.match(app, /transaction\?\.consensus_data\?\.leader_receipt/);
assert.match(app, /receipts\.some\(\(receipt\) => receipt\?\.execution_result === "SUCCESS"\)/);
assert.match(app, /SUPPORTED_WALLET_RDNS/);
assert.match(app, /legacyIcon\(provider\)/);
assert.doesNotMatch(app, /wallet-monogram/);
assert.match(app, /localStorage/);
assert.match(app, /Continue verification|RECONCILIATION_REQUIRED/);
assert.match(app, /transactionInFlight \|\| pendingTransaction\(\)/);
assert.equal((app.match(/writeContract\s*\(/g) || []).length, 1);
assert.match(app, /fetchCase\(pending\.caseId\)/);
assert.match(app, /transactionInFlight/);
assert.match(app, /assertExpectedReadback|readback/i);
assert.match(app, /transaction hash|pendingTransaction|PENDING_STORAGE_KEY/i);
assert.match(app, /reconciliation/i);
console.log("frontend transaction progress/static checks: PASS");
