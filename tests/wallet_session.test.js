import assert from "node:assert/strict";
import { createSessionGuard, walletPhaseFor } from "../frontend/wallet-session.js";

const account = `0x${"1".repeat(40)}`;
assert.equal(walletPhaseFor(account, "0xF22F", "0xf22f"), "CONNECTED");
assert.equal(walletPhaseFor(account, "0x1", "0xf22f"), "WRONG_CHAIN");
assert.equal(walletPhaseFor(null, "0xf22f", "0xf22f"), "DISCONNECTED");

const sessions = createSessionGuard();
const providerA = sessions.begin();
assert.equal(sessions.isCurrent(providerA), true);
const providerB = sessions.begin();
assert.equal(sessions.isCurrent(providerA), false);
assert.equal(sessions.isCurrent(providerB), true);
sessions.invalidate();
assert.equal(sessions.isCurrent(providerB), false);

console.log("wallet session regressions passed");
