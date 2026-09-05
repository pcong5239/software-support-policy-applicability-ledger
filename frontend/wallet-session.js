export const walletPhaseFor = (account, chainId, expectedChainId) => {
  if (!account) return "DISCONNECTED";
  return String(chainId || "").toLowerCase() === String(expectedChainId || "").toLowerCase() ? "CONNECTED" : "WRONG_CHAIN";
};

export function createSessionGuard() {
  let generation = 0;
  return Object.freeze({
    begin: () => ++generation,
    invalidate: () => ++generation,
    isCurrent: (candidate) => candidate === generation,
  });
}
