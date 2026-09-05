const evidenceEnabled = (() => {
  try { return new URL(globalThis.location.href).searchParams.get("evidence") === "1"; }
  catch { return false; }
})();

let sequence = 0;
const observedProviders = new WeakMap();

function emit(event) {
  if (!evidenceEnabled) return;
  const entry = { sequence: ++sequence, at: new Date().toISOString(), ...event };
  globalThis.console?.info?.(`LEDGER_RPC_OBS ${JSON.stringify(entry)}`);
}

function requestDetails(input, init) {
  const url = typeof input === "string" ? input : input?.url || "";
  const method = init?.method || input?.method || "GET";
  const body = init?.body;
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return { url, method, rpcMethod: Array.isArray(parsed) ? parsed.map((item) => item?.method).filter(Boolean).join(",") : parsed?.method || null };
    } catch { /* Non-JSON requests are still recorded without their payload. */ }
  }
  return { url, method, rpcMethod: null };
}

const originalFetch = globalThis.fetch;
if (evidenceEnabled && typeof originalFetch === "function") {
  globalThis.fetch = async function observedFetch(input, init) {
    const started = Date.now();
    const details = requestDetails(input, init);
    try {
      const response = await Reflect.apply(originalFetch, this, arguments);
      emit({ kind: "request", source: "fetch", ...details, status: response.status, duration_ms: Date.now() - started });
      return response;
    } catch (error) {
      emit({ kind: "request", source: "fetch", ...details, status: "ERROR", error: String(error?.message || error), duration_ms: Date.now() - started });
      throw error;
    }
  };
}

export const rpcEvidence = Object.freeze({
  enabled: evidenceEnabled,
  mark: (label) => emit({ kind: "phase", label }),
});

export function observeProvider(provider, label = "wallet") {
  if (!evidenceEnabled || typeof provider?.request !== "function") return provider;
  if (observedProviders.has(provider)) return provider;
  const originalRequest = provider.request;
  const observedRequest = async function observedProviderRequest(args) {
    const started = Date.now();
    const method = args?.method || "UNKNOWN";
    emit({ kind: "request", source: "provider", provider: label, method, status: "START" });
    try {
      const result = await Reflect.apply(originalRequest, this, arguments);
      emit({ kind: "response", source: "provider", provider: label, method, status: "OK", duration_ms: Date.now() - started });
      return result;
    } catch (error) {
      emit({ kind: "response", source: "provider", provider: label, method, status: "ERROR", error: String(error?.message || error), duration_ms: Date.now() - started });
      throw error;
    }
  };
  try {
    provider.request = observedRequest;
    if (provider.request !== observedRequest) return provider;
    observedProviders.set(provider, originalRequest);
  } catch { /* Some providers expose a read-only request method. */ }
  return provider;
}
