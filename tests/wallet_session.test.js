import assert from "node:assert/strict";
import { connectSelectedProvider, createProviderRegistry, createProviderSessionEffects, createWalletStore, getWalletState, isCallableProvider, selectWalletView, subscribeWalletState, walletPhaseFor } from "../frontend/wallet-session.js";

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

const store = createWalletStore();
let storeNotifications = 0;
const unsubscribe = subscribeWalletState(store, () => { storeNotifications += 1; });
assert.equal(getWalletState(store).phase, "DISCONNECTED");
assert.equal(selectWalletView(store).primaryAction, "Connect wallet");
store.commit({ phase: "DISCOVERING", providers: [{ brand: "metamask" }] });
assert.equal(selectWalletView(store).chooserOpen, true);
assert.equal(selectWalletView(store).providerOptions.length, 1);
store.commit({ phase: "CONNECTED", account: accountA, selected: { brand: "metamask", info: { name: "Untrusted label" } }, writeClient: {} });
assert.equal(selectWalletView(store).badge, `MetaMask · ${accountA.slice(0, 6)}…${accountA.slice(-4)}`);
assert.equal(selectWalletView(store).canWrite, true);
assert.equal(storeNotifications, 2);
unsubscribe();

// Reload starts with a disconnected canonical wallet store and no automatic resubmit.
assert.equal(createWalletStore().getWalletState().phase, "DISCONNECTED");

const registry = createProviderRegistry();
const announcedA = { request: async () => null };
const announcedB = { request: async () => null };
const providerInfo = (uuid) => ({ uuid, name: "MetaMask", icon: "data:image/svg+xml;base64,AA==" });

function connectionProvider(account = accountA, chainId = expectedChain) {
  const events = [];
  return {
    events,
    request: async ({ method }) => {
      events.push(method);
      if (method === "eth_requestAccounts" || method === "eth_accounts") return [account];
      if (method === "eth_chainId") return chainId;
      throw new Error(`Unexpected provider request: ${method}`);
    },
  };
}

// Explicit selected-provider connection: request, account confirmation, chain validation, then write client.
const selectedProvider = connectionProvider();
const unselectedProvider = connectionProvider(accountB);
const selectedConnection = await connectSelectedProvider({
  provider: selectedProvider,
  expectedChainId: () => expectedChain,
  createWriteClient: (account, provider) => {
    selectedProvider.events.push("write-client");
    return { account, provider };
  },
});
assert.deepEqual(selectedProvider.events, ["eth_requestAccounts", "eth_accounts", "eth_chainId", "write-client"]);
assert.deepEqual(unselectedProvider.events, []);
assert.equal(selectedConnection.phase, "CONNECTED");
assert.equal(selectedConnection.writeClient.provider, selectedProvider);
assert.ok(selectedProvider.events.indexOf("write-client") > selectedProvider.events.indexOf("eth_chainId"));
const connectedStore = createWalletStore();
connectedStore.commit({ phase: selectedConnection.phase, selected: { brand: "metamask", info: { name: "Untrusted label" } }, account: selectedConnection.account, writeClient: selectedConnection.writeClient });
assert.equal(selectWalletView(connectedStore).primaryAction, "Disconnect");
assert.equal(selectWalletView(connectedStore).canWrite, true);

assert.equal(isCallableProvider({ isMetaMask: true }), false);
assert.equal(isCallableProvider({ request: "not-a-function", isMetaMask: true }), false);
assert.equal(registry.upsert({ brand: "metamask", info: providerInfo("invalid-legacy"), provider: { isMetaMask: true } }).length, 0);
assert.equal(registry.upsert({ brand: "metamask", info: providerInfo("invalid-announcement"), provider: { request: "not-a-function" } }).length, 0);
assert.equal(registry.upsert({ brand: "metamask", info: providerInfo("same-uuid"), provider: announcedA }).length, 1);
assert.equal(registry.upsert({ brand: "metamask", info: providerInfo("same-uuid"), provider: announcedB }).length, 1);
assert.equal(registry.values()[0].provider, announcedB);

// Late announcement replaces the legacy/provider entry once; duplicate announcement stays one option.
assert.equal(registry.upsert({ brand: "metamask", info: providerInfo("same-uuid"), provider: announcedB }).length, 1);
assert.equal(registry.values()[0].brand, "metamask");

// Provider cardinality follows the live detected set: 0, 1, 2 and 3 supported providers.
const cardinalityRegistry = createProviderRegistry();
assert.equal(cardinalityRegistry.values().length, 0);
cardinalityRegistry.upsert({ brand: "metamask", info: providerInfo("cardinality-1"), provider: { request: async () => null } });
assert.equal(cardinalityRegistry.values().length, 1);
cardinalityRegistry.upsert({ brand: "okx", info: providerInfo("cardinality-2"), provider: { request: async () => null } });
assert.equal(cardinalityRegistry.values().length, 2);
cardinalityRegistry.upsert({ brand: "rabby", info: providerInfo("cardinality-3"), provider: { request: async () => null } });
assert.equal(cardinalityRegistry.values().length, 3);

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
// Connect wallet commits the selected provider, account and write client together.
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
