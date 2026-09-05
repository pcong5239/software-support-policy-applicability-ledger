export const walletPhaseFor = (account, chainId, expectedChainId) => {
  if (!account) return "DISCONNECTED";
  return String(chainId || "").toLowerCase() === String(expectedChainId || "").toLowerCase() ? "CONNECTED" : "WRONG_CHAIN";
};

export const isCallableProvider = (provider) => typeof provider?.request === "function";

export function createSessionGuard() {
  let generation = 0;
  return Object.freeze({
    begin: () => ++generation,
    invalidate: () => ++generation,
    isCurrent: (candidate) => candidate === generation,
  });
}

export function createProviderRegistry() {
  const byBrand = new Map();
  const byUuid = new Map();
  const brandByProvider = new WeakMap();

  function removeBrand(brand) {
    const current = byBrand.get(brand);
    if (!current) return;
    byBrand.delete(brand);
    byUuid.delete(current.info.uuid);
    brandByProvider.delete(current.provider);
  }

  function upsert(entry) {
    if (!isCallableProvider(entry?.provider)) return [...byBrand.values()];
    const uuidOwner = byUuid.get(entry.info.uuid);
    if (uuidOwner && uuidOwner !== entry.brand) return [...byBrand.values()];
    const existingBrand = brandByProvider.get(entry.provider);
    if (existingBrand && existingBrand !== entry.brand) removeBrand(existingBrand);
    const current = byBrand.get(entry.brand);
    if (current) {
      if (current.provider === entry.provider && current.info.uuid === entry.info.uuid && current.info.icon === entry.info.icon && current.info.name === entry.info.name) return [...byBrand.values()];
      byUuid.delete(current.info.uuid);
      brandByProvider.delete(current.provider);
    }
    byBrand.set(entry.brand, entry);
    byUuid.set(entry.info.uuid, entry.brand);
    brandByProvider.set(entry.provider, entry.brand);
    return [...byBrand.values()];
  }

  return Object.freeze({
    has: (brand) => byBrand.has(brand),
    upsert,
    values: () => [...byBrand.values()],
  });
}

export function createProviderSessionEffects({ expectedChainId, getAccount, createWriteClient, onSnapshot, onReset, onNotice }) {
  const guard = createSessionGuard();
  let removeProviderListeners = () => {};

  function begin() {
    removeProviderListeners();
    return guard.begin();
  }

  function invalidate() {
    removeProviderListeners();
    return guard.invalidate();
  }

  function bind(provider, token) {
    removeProviderListeners();
    if (!provider?.on || !guard.isCurrent(token)) return;

    const accountsChanged = async (accounts) => {
      if (!guard.isCurrent(token)) return;
      const account = accounts?.[0] || null;
      if (!account) {
        invalidate();
        onSnapshot({ phase: "DISCONNECTED", account: null, writeClient: null });
        onReset();
        onNotice("Wallet disconnected. Connect again.");
        return;
      }
      onReset();
      onSnapshot({ phase: "CONNECTING", account, writeClient: null });
      let chainId;
      try { chainId = await provider.request({ method: "eth_chainId" }); }
      catch {
        if (guard.isCurrent(token)) {
          onSnapshot({ phase: "WRONG_CHAIN", account, writeClient: null });
          onReset();
          onNotice("We couldn't verify your wallet network. Connect again when the wallet is available.", true);
        }
        return;
      }
      if (!guard.isCurrent(token)) return;
      const phase = walletPhaseFor(account, chainId, expectedChainId());
      onSnapshot({ phase, account, writeClient: phase === "CONNECTED" ? createWriteClient(account, provider) : null });
      onNotice(phase === "CONNECTED" ? "Account changed. Readback context was cleared." : "Account changed while the wallet is on another network.", phase !== "CONNECTED");
    };

    const chainChanged = (chainId) => {
      if (!guard.isCurrent(token)) return;
      const account = getAccount();
      const valid = String(chainId).toLowerCase() === String(expectedChainId()).toLowerCase();
      onSnapshot({ phase: valid && account ? "CONNECTED" : "WRONG_CHAIN", writeClient: valid && account ? createWriteClient(account, provider) : null });
      onReset();
      onNotice(valid ? "Network updated. The ledger is ready." : "Switch your wallet to the selected network.", !valid);
    };

    const disconnected = () => {
      if (!guard.isCurrent(token)) return;
      invalidate();
      onSnapshot({ phase: "DISCONNECTED", selected: null, account: null, writeClient: null, error: "" });
      onReset();
      onNotice("Wallet disconnected. Connect again.");
    };

    provider.on("accountsChanged", accountsChanged);
    provider.on("chainChanged", chainChanged);
    provider.on("disconnect", disconnected);
    removeProviderListeners = () => {
      provider.removeListener?.("accountsChanged", accountsChanged);
      provider.removeListener?.("chainChanged", chainChanged);
      provider.removeListener?.("disconnect", disconnected);
      removeProviderListeners = () => {};
    };
  }

  return Object.freeze({ begin, invalidate, isCurrent: guard.isCurrent, bind });
}
