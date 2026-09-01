import { createClient } from "https://esm.sh/genlayer-js@1.1.8";
import { localnet, studionet, testnetBradbury } from "https://esm.sh/genlayer-js@1.1.8/chains";
import { DEFAULT_CONFIG, EXPLORERS, NETWORKS } from "./config.js";

const CHAINS = { localnet, studionet, testnetBradbury };
const SUPPORTED_WALLETS = Object.freeze({ metamask: "MetaMask", okx: "OKX Wallet", rabby: "Rabby" });
const boundProviders = new WeakSet();
const state = {
  network: DEFAULT_CONFIG.network,
  contractAddress: DEFAULT_CONFIG.contractAddress,
  provider: null,
  providerInfo: new Map(),
  account: null,
  readClient: null,
  writeClient: null,
  lastCaseId: "",
};

const $ = (id) => document.getElementById(id);
const elements = {
  network: $("network-select"), address: $("contract-address"), providers: $("provider-select"), connect: $("connect-button"),
  connection: $("connection-state"), networkLabel: $("network-label"), account: $("account-label"), notice: $("notice-text"),
  register: $("register-form"), freeze: $("freeze-button"), assess: $("assess-button"), refresh: $("refresh-button"),
  caseId: $("case-id"), productId: $("product-id"), version: $("version"), edition: $("edition"), region: $("region"), policyUrl: $("policy-url"), observedDate: $("observed-date"),
  empty: $("empty-result"), result: $("result-content"), outcome: $("outcome"), caseState: $("case-state"), readCaseId: $("read-case-id"), readProduct: $("read-product"), readScope: $("read-scope"), readDate: $("read-date"), readWindow: $("read-window"), readRetries: $("read-retries"), digest: $("evidence-digest"), policyLink: $("policy-link"), txEvidence: $("tx-evidence"), txHash: $("tx-hash"), copyTx: $("copy-tx"), txLink: $("tx-link"),
};

function showNotice(message, error = false) {
  elements.notice.textContent = message;
  elements.notice.parentElement.style.background = error ? "#f5e3df" : "#e9e6dc";
  elements.notice.parentElement.style.color = error ? "#7b3029" : "#5b625c";
  elements.notice.parentElement.setAttribute("role", error ? "alert" : "status");
}

function selectedChain() { return CHAINS[state.network]; }
function configured() { return Boolean(state.contractAddress && /^0x[0-9a-fA-F]{40}$/.test(state.contractAddress)); }
function clients() {
  state.readClient = createClient({ chain: selectedChain() });
  state.writeClient = state.provider && state.account ? createClient({ chain: selectedChain(), account: state.account, provider: state.provider }) : null;
}
function short(value) { return value ? `${value.slice(0, 8)}…${value.slice(-6)}` : "—"; }
function setBusy(button, busy, label) { button.disabled = busy; if (busy) { button.dataset.label = button.textContent; button.textContent = label; } else if (button.dataset.label) { button.textContent = button.dataset.label; } }
function assertReady(write = false) {
  if (!configured()) throw new Error("Enter a deployed contract address first.");
  if (write && (!state.provider || !state.account)) throw new Error("Connect and select a wallet provider before writing.");
}
function currentFormCase() { return { case_id: elements.caseId.value.trim(), product_id: elements.productId.value.trim(), version: elements.version.value.trim(), edition: elements.edition.value.trim(), region: elements.region.value.trim(), policy_url: elements.policyUrl.value.trim() }; }

function announceProvider(event) {
  const detail = event.detail;
  const brand = supportedBrand(detail?.info);
  if (!detail?.provider || !detail.info?.uuid || !brand) return;
  state.providerInfo.delete("legacy");
  state.providerInfo.set(brand, { info: { ...detail.info, brand }, provider: detail.provider });
  renderProviders();
}
function supportedBrand(info) {
  const rdns = String(info?.rdns || "").toLowerCase();
  const name = String(info?.name || "").toLowerCase();
  if (rdns.includes("metamask") || name.includes("metamask")) return "metamask";
  if (rdns.includes("okex") || rdns.includes("okx") || name.includes("okx")) return "okx";
  if (rdns.includes("rabby") || name.includes("rabby")) return "rabby";
  return "";
}
function renderProviders() {
  const entries = [...state.providerInfo.values()];
  elements.providers.replaceChildren();
  if (!entries.length) { elements.providers.add(new Option("No supported wallet detected", "")); return; }
  entries.forEach(({ info }) => elements.providers.add(new Option(SUPPORTED_WALLETS[info.brand] || "Supported wallet", info.brand || info.uuid)));
}
async function discoverProviders() {
  window.addEventListener("eip6963:announceProvider", announceProvider);
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  await new Promise((resolve) => setTimeout(resolve, 350));
  if (!state.providerInfo.size && window.ethereum?.isMetaMask) state.providerInfo.set("metamask", { info: { name: "MetaMask", brand: "metamask", uuid: "legacy" }, provider: window.ethereum });
  renderProviders();
}
async function connectWallet() {
  try {
    assertReady();
    const selected = state.providerInfo.get(elements.providers.value);
    if (!selected) throw new Error("Select a discovered wallet provider first.");
    state.provider = selected.provider;
    const accounts = await state.provider.request({ method: "eth_requestAccounts" });
    if (!accounts?.[0]) throw new Error("The wallet returned no account.");
    state.account = accounts[0];
    clients();
    bindProviderEvents(state.provider);
    if (state.writeClient?.connect) await state.writeClient.connect(state.network);
    elements.connection.textContent = "Wallet ready";
    elements.account.textContent = `${short(state.account)} · ${selected.info.name}`;
    elements.networkLabel.textContent = state.network;
    elements.networkLabel.parentElement.querySelector(".dot").style.color = "var(--accent)";
    elements.connect.textContent = "Wallet connected";
    showNotice("Wallet connected. Register and freeze a case to begin.");
    updateButtons();
  } catch (error) { showNotice(error.message || String(error), true); }
}
function bindProviderEvents(provider) {
  if (!provider?.on || boundProviders.has(provider)) return;
  boundProviders.add(provider);
  provider.on("accountsChanged", (accounts) => {
    state.account = accounts?.[0] || null;
    state.writeClient = state.account ? createClient({ chain: selectedChain(), account: state.account, provider }) : null;
    resetCaseContext();
    elements.account.textContent = state.account ? short(state.account) : "No account selected.";
    elements.connection.textContent = state.account ? "Wallet ready" : "Reconnect required";
    showNotice(state.account ? "Account changed. Readback context was cleared." : "Wallet disconnected. Connect again.", !state.account);
    updateButtons();
  });
  provider.on("chainChanged", () => {
    state.account = null;
    state.writeClient = null;
    resetCaseContext();
    elements.connection.textContent = "Reconnect required";
    elements.account.textContent = "Network changed; connect again.";
    showNotice("Wallet network changed. Reconnect to the selected GenLayer network.", true);
    updateButtons();
  });
}

async function waitFinalized(hash) {
  const receipt = await state.readClient.waitForTransactionReceipt({ hash, status: "FINALIZED" });
  const executionResult = receipt?.txExecutionResultName;
  if (executionResult !== "FINISHED_WITH_RETURN") throw new Error(`Transaction finalized without successful contract execution (${executionResult ?? "missing execution result"}).`);
  return receipt;
}
async function write(functionName, args, button, pendingLabel) {
  assertReady(true); setBusy(button, true, pendingLabel);
  try { const hash = await state.writeClient.writeContract({ address: state.contractAddress, functionName, args, value: 0n }); renderTransaction(hash); showNotice(`Submitted ${functionName}. Waiting for finality…`); await waitFinalized(hash); showNotice(`${functionName} finalized: ${short(hash)}`); return hash; }
  finally { setBusy(button, false); updateButtons(); }
}
async function register(event) {
  event.preventDefault();
  try { const value = currentFormCase(); await write("register_case", [value.case_id, value.product_id, value.version, value.edition, value.region, value.policy_url], event.submitter, "Registering…"); state.lastCaseId = value.case_id; elements.freeze.disabled = false; elements.assess.disabled = true; await readCase(value.case_id); }
  catch (error) { showNotice(error.message || String(error), true); }
}
async function freeze() {
  try { await write("freeze_case", [elements.caseId.value.trim()], elements.freeze, "Freezing…"); elements.assess.disabled = false; await readCase(elements.caseId.value.trim()); }
  catch (error) { showNotice(error.message || String(error), true); }
}
async function assess() {
  try { const caseId = elements.caseId.value.trim(); const date = elements.observedDate.value; if (!caseId || !date) throw new Error("Enter a case ID and observed date."); await write("assess", [caseId, date], elements.assess, "Assessing…"); await readCase(caseId); }
  catch (error) { showNotice(error.message || String(error), true); }
}
async function readCase(caseId = state.lastCaseId || elements.caseId.value.trim()) {
  try { assertReady(); if (!caseId) throw new Error("Enter a case ID to read back."); const record = await state.readClient.readContract({ address: state.contractAddress, functionName: "get_case", args: [caseId] }); state.lastCaseId = caseId; renderRecord(record); showNotice(`Authoritative readback loaded for ${caseId}.`); }
  catch (error) { showNotice(error.message || String(error), true); }
}
function renderRecord(record) {
  const value = record || {}; const policy = value.policy_url || "";
  elements.empty.classList.add("hidden"); elements.result.classList.remove("hidden"); elements.outcome.textContent = value.outcome || "DRAFT"; elements.caseState.textContent = value.state || "—";
  elements.readCaseId.textContent = value.case_id || state.lastCaseId || "—"; elements.readProduct.textContent = `${value.product_id || "—"} / ${value.version || "—"}`; elements.readScope.textContent = `${value.edition || "—"} / ${value.region || "—"}`; elements.readDate.textContent = value.observed_date || "—"; elements.readWindow.textContent = value.support_start && value.support_end ? `${value.support_start} → ${value.support_end}` : "—"; elements.readRetries.textContent = String(value.retry_count ?? 0); elements.digest.textContent = value.evidence_digest || "—"; elements.policyLink.href = /^https:\/\//i.test(policy) ? policy : "#";
}
function renderTransaction(hash) {
  elements.txEvidence.classList.remove("hidden");
  elements.txHash.textContent = hash;
  elements.txLink.href = `${EXPLORERS[state.network]}/tx/${hash}`;
}
async function copyTransaction() {
  const hash = elements.txHash.textContent;
  if (!hash || hash === "—") return;
  try { await navigator.clipboard.writeText(hash); showNotice("Transaction hash copied."); }
  catch { showNotice("Copy is unavailable; select the transaction hash manually.", true); }
}
function resetCaseContext() {
  state.lastCaseId = "";
  elements.empty.classList.remove("hidden");
  elements.result.classList.add("hidden");
  elements.freeze.disabled = true;
  elements.assess.disabled = true;
}
function updateButtons() { const ready = configured() && Boolean(state.account); elements.connect.disabled = !configured(); elements.freeze.disabled = !ready || !state.lastCaseId; elements.assess.disabled = !ready || !state.lastCaseId; }

elements.network.value = state.network; elements.address.value = state.contractAddress; elements.observedDate.value = new Date().toISOString().slice(0, 10);
elements.network.addEventListener("change", () => { state.network = elements.network.value; state.provider = null; state.account = null; resetCaseContext(); clients(); elements.connection.textContent = "Reconnect required"; elements.account.textContent = "Network changed; connect again."; elements.networkLabel.textContent = state.network; updateButtons(); });
elements.address.addEventListener("input", () => { state.contractAddress = elements.address.value.trim(); resetCaseContext(); updateButtons(); });
elements.providers.addEventListener("change", () => { state.provider = state.providerInfo.get(elements.providers.value)?.provider || null; });
elements.connect.addEventListener("click", connectWallet); elements.register.addEventListener("submit", register); elements.freeze.addEventListener("click", freeze); elements.assess.addEventListener("click", assess); elements.refresh.addEventListener("click", () => readCase()); elements.copyTx.addEventListener("click", copyTransaction);
clients(); discoverProviders(); updateButtons();
