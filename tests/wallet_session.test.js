import assert from "node:assert/strict";
import { createProviderRegistry, createProviderSessionEffects, isCallableProvider, walletPhaseFor } from "../frontend/wallet-session.js";

const accountA = `0x${"1".repeat(40)}`;
const accountB = `0x${"2".repeat(40)}`;
const expectedChain = "0xf22f";
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function mockProvider({ chainId = expectedChain, rejectChain = false } = {}) {
  const listeners = new Map();
  const removed = [];
  return {
    removed,
    request: async ({ method }) => {
      if (method === "eth_chainId") {
        if (rejectChain) throw new Error("network unavailable");
        return chainId;
      }
      return null;
    },
    on(method, callback) { listeners.set(method, callback); },
    removeListener(method, callback) { removed.push([method, callback]); },
    emit(method, value) { return listeners.get(method)?.(value); },
    callbacks: listeners,
  };
}

assert.equal(walletPhaseFor(accountA, expectedChain, expectedChain), "CONNECTED");
assert.equal(walletPhaseFor(accountA, "0x1", expectedChain), "WRONG_CHAIN");
assert.equal(walletPhaseFor(null, expectedChain, expectedChain), "DISCONNECTED");

const registry = createProviderRegistry();
const announcedA = { request: async () => null };
const announcedB = { request: async () => null };
const providerInfo = (uuid) => ({ uuid, name: "MetaMask", icon: "data:image/svg+xml;base64,AA==" });
assert.equal(isCallableProvider({ isMetaMask: true }), false);
assert.equal(isCallableProvider({ request: "not-a-function", isMetaMask: true }), false);
assert.equal(registry.upsert({ brand: "metamask", info: providerInfo("invalid-legacy"), provider: { isMetaMask: true } }).length, 0);
assert.equal(registry.upsert({ brand: "metamask", info: providerInfo("invalid-announcement"), provider: { request: "not-a-function" } }).length, 0);
assert.equal(registry.upsert({ brand: "metamask", info: providerInfo("same-uuid"), provider: announcedA }).length, 1);
assert.equal(registry.upsert({ brand: "metamask", info: providerInfo("same-uuid"), provider: announcedB }).length, 1);
assert.equal(registry.values()[0].provider, announcedB);

const conflictRegistry = createProviderRegistry();
const metaMaskProvider = { request: async () => null };
const okxProvider = { request: async () => null };
const conflictResult = conflictRegistry.upsert({ brand: "metamask", info: providerInfo("owned-by-metamask"), provider: metaMaskProvider });
assert.equal(conflictResult.length, 1);
conflictRegistry.upsert({ brand: "okx", info: providerInfo("owned-by-okx"), provider: okxProvider });
const unchanged = conflictRegistry.upsert({ brand: "rabby", info: providerInfo("owned-by-metamask"), provider: okxProvider });
assert.deepEqual(unchanged.map(({ brand }) => brand), ["metamask", "okx"]);
assert.equal(unchanged[1].provider, okxProvider);

const snapshots = [];
const notices = [];
let resets = 0;
let account = accountA;
const effects = createProviderSessionEffects({
  expectedChainId: () => expectedChain,
  getAccount: () => account,
  createWriteClient: (activeAccount, provider) => ({ activeAccount, provider }),
  onSnapshot: (snapshot) => snapshots.push(snapshot),
  onReset: () => { resets += 1; },
  onNotice: (message, error) => notices.push({ message, error }),
});

const providerA = mockProvider();
const tokenA = effects.begin();
effects.bind(providerA, tokenA);
assert.equal(providerA.callbacks.has("accountsChanged"), true);

effects.begin();
assert.equal(providerA.removed.length, 3);
const providerB = mockProvider({ rejectChain: true });
const tokenB = effects.begin();
effects.bind(providerB, tokenB);
effects.invalidate();
providerA.emit("accountsChanged", [accountB]);
providerB.emit("chainChanged", "0x1");
await flush();
assert.equal(snapshots.length, 0);
assert.equal(providerB.removed.length, 3);

const connectedProvider = mockProvider();
const connectedToken = effects.begin();
effects.bind(connectedProvider, connectedToken);
account = accountA;
await connectedProvider.emit("accountsChanged", [accountB]);
assert.equal(snapshots.at(-1).phase, "CONNECTED");
assert.equal(snapshots.at(-1).writeClient.provider, connectedProvider);
assert.equal(snapshots.at(-1).writeClient.activeAccount, accountB);

await connectedProvider.emit("chainChanged", "0x1");
assert.equal(snapshots.at(-1).phase, "WRONG_CHAIN");
assert.equal(snapshots.at(-1).writeClient, null);

const failingProvider = mockProvider({ rejectChain: true });
const failingToken = effects.begin();
effects.bind(failingProvider, failingToken);
await failingProvider.emit("accountsChanged", [accountA]);
assert.equal(snapshots.at(-1).phase, "WRONG_CHAIN");
assert.equal(snapshots.at(-1).writeClient, null);
assert.ok(resets >= 3);
assert.equal(notices.at(-1).error, true);

await failingProvider.emit("disconnect");
assert.equal(snapshots.at(-1).phase, "DISCONNECTED");
assert.equal(failingProvider.removed.length, 3);

console.log("wallet session integration regressions passed");
