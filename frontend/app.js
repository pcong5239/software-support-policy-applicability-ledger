import { createClient } from "https://esm.sh/genlayer-js@1.1.8";
import { studionet } from "https://esm.sh/genlayer-js@1.1.8/chains";
import { DEFAULT_CONFIG, EXPLORERS } from "./config.js";

const CHAINS = { studionet };
const SUPPORTED_WALLETS = Object.freeze({ metamask: "MetaMask", okx: "OKX Wallet", rabby: "Rabby" });
const NETWORK_LABELS = Object.freeze({ studionet: "Studionet" });
const ACTION_LABELS = Object.freeze({ assess: "Policy assessment", freeze_case: "Case freeze", register_case: "Case registration", retry_unresolved: "Assessment retry" });
const TRANSACTION_COPY = Object.freeze({
  IDLE: ["Transaction status", "No transaction is in progress."],
  WAITING_FOR_WALLET: ["Confirm in your wallet", "Review the request and confirm or reject it in your wallet."],
  SUBMITTED: ["Transaction submitted", "Your wallet returned a transaction hash."],
  WAITING_FOR_FINALITY: ["Waiting for finality", "The network is reaching consensus on this transaction."],
  VERIFYING_EXECUTION: ["Verifying execution", "The transaction is finalized; its result is being checked."],
  VERIFYING_READBACK: ["Verifying the result", "The finalized result is being compared with the ledger state."],
  SUCCESS: ["Transaction complete", "Finality, execution, and the resulting ledger state were verified."],
  REJECTED: ["Request rejected", "No transaction was submitted. Review the form and try again."],
  FAILED: ["Transaction failed", "The finalized transaction did not complete successfully."],
  RECONCILIATION_REQUIRED: ["Verification interrupted", "Do not submit again. Continue verification of the existing transaction."],
});
const PENDING_PHASES = new Set(["WAITING_FOR_WALLET", "SUBMITTED", "WAITING_FOR_FINALITY", "VERIFYING_EXECUTION", "VERIFYING_READBACK"]);
const PENDING_STORAGE_KEY = "support-policy-ledger.pending.v1";
const boundProviders = new WeakSet();
let transactionInFlight = false;
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
  empty: $("empty-result"), result: $("result-content"), outcome: $("outcome"), caseState: $("case-state"), readCaseId: $("read-case-id"), readProduct: $("read-product"), readScope: $("read-scope"), readDate: $("read-date"), readWindow: $("read-window"), readRetries: $("read-retries"), digest: $("evidence-digest"), policyLink: $("policy-link"), txEvidence: $("tx-evidence"), txTitle: $("transaction-title"), txDetail: $("transaction-detail"), txSpinner: $("transaction-spinner"), txHashBlock: $("transaction-hash-block"), txHash: $("tx-hash"), copyTx: $("copy-tx"), txLink: $("tx-link"), txReconcile: $("transaction-reconcile"),
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
function networkLabel(value) { return NETWORK_LABELS[value] || "Selected network"; }
function actionLabel(value) { return ACTION_LABELS[value] || "Ledger action"; }
function userFacingError(error, context = "request") {
  const message = String(error?.message || error);
  if (/rejected|denied|cancelled|canceled|4001/i.test(message)) return "The wallet request was cancelled. Choose a wallet and try again.";
  if (/no account|empty account/i.test(message)) return "No wallet account was returned. Choose a wallet and connect again.";
  if (/insufficient|balance/i.test(message)) return "This wallet does not have enough GEN to complete the action.";
  if (/unknown chain|chain.?id|network/i.test(message)) return "The wallet is on the wrong network. Switch networks and connect again.";
  if (/429|rate.?limit|timeout|504|fetch|network request/i.test(message)) return "The network is temporarily unavailable. Wait a moment and try again.";
  if (/FINISHED_WITH_RETURN|execution result|finalized without successful/i.test(message)) return "The transaction finished without a successful ledger result. Review the current state before trying again.";
  if (/UserError|contract/i.test(message)) return "The ledger rejected this action. Check the case details and current state.";
  if (context === "read") return "The current case state could not be loaded. Check your connection and try again.";
  if (/^(Enter|Connect|Select|The wallet returned)/i.test(message)) return message;
  return "We couldn't complete that request. Check the current state and try again.";
}
function setBusy(button, busy, label) { button.disabled = busy; if (busy) { button.dataset.label = button.textContent; button.textContent = label; } else if (button.dataset.label) { button.textContent = button.dataset.label; } }
function isHash(value) { return /^0x[0-9a-fA-F]{64}$/.test(String(value || "")); }
function isUserRejection(error) { return error?.code === 4001 || error?.cause?.code === 4001 || /rejected|denied|cancelled|canceled/i.test(String(error?.message || error)); }
function isSuccessful(transaction) { return transaction?.statusName === "FINALIZED" && transaction?.txExecutionResultName === "FINISHED_WITH_RETURN"; }
function pendingTransaction() {
  try {
    const value = JSON.parse(localStorage.getItem(PENDING_STORAGE_KEY) || "null");
    return value && value.version === 1 && typeof value.operation === "string" && isHash(value.hash) && typeof value.caseId === "string" && value.caseId && typeof value.expectedState === "string" ? value : null;
  } catch { return null; }
}
function assertRecoveryStorage() {
  const probe = `${PENDING_STORAGE_KEY}.probe`;
  try { localStorage.setItem(probe, "1"); if (localStorage.getItem(probe) !== "1") throw new Error("storage mismatch"); localStorage.removeItem(probe); }
  catch { throw new Error("Transaction recovery is unavailable. No write was submitted."); }
}
function savePendingTransaction(pending) {
  try { localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(pending)); return true; }
  catch { return false; }
}
function clearPendingTransaction() {
  localStorage.removeItem(PENDING_STORAGE_KEY);
}
function setTransactionProgress(phase, details = {}) {
  const [title, detail] = TRANSACTION_COPY[phase] || TRANSACTION_COPY.IDLE;
  const alert = phase === "FAILED" || phase === "REJECTED";
  elements.txEvidence.dataset.transactionPhase = phase;
  elements.txEvidence.setAttribute("role", alert ? "alert" : "status");
  elements.txEvidence.setAttribute("aria-live", alert ? "assertive" : "polite");
  elements.txTitle.textContent = title;
  elements.txDetail.textContent = details.message || detail;
  elements.txSpinner.classList.toggle("hidden", !PENDING_PHASES.has(phase));
  elements.txEvidence.classList.toggle("hidden", phase === "IDLE");
  const hash = details.hash || pendingTransaction()?.hash || "";
  elements.txHashBlock.classList.toggle("hidden", !hash);
  elements.txHash.textContent = hash || "—";
  elements.copyTx.disabled = !hash;
  elements.txLink.classList.toggle("hidden", !hash);
  elements.txLink.href = hash ? `${EXPLORERS[state.network]}/tx/${hash}` : "#";
  elements.txReconcile.classList.toggle("hidden", phase !== "RECONCILIATION_REQUIRED" || !hash);
}
function writeExpectedState(functionName) { return functionName === "register_case" ? "DRAFT" : functionName === "freeze_case" ? "FROZEN" : "ASSESSED"; }
function assertExpectedReadback(record, pending) {
  if (!record || record.case_id !== pending.caseId || record.state !== pending.expectedState) throw new Error("The verified ledger state does not match the requested action.");
}
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
    elements.networkLabel.textContent = networkLabel(state.network);
    elements.networkLabel.parentElement.querySelector(".dot").style.color = "var(--accent)";
    elements.connect.textContent = "Wallet connected";
    showNotice("Wallet connected. Register and freeze a case to begin.");
    updateButtons();
  } catch (error) { showNotice(userFacingError(error, "wallet"), true); }
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
  if (typeof state.readClient.waitForFinalization === "function") return state.readClient.waitForFinalization({ hash });
  return state.readClient.waitForTransactionReceipt({ hash, status: "FINALIZED" });
}
async function fetchCase(caseId) {
  assertReady();
  return state.readClient.readContract({ address: state.contractAddress, functionName: "get_case", args: [caseId] });
}
async function reconcilePending(pending) {
  setTransactionProgress("WAITING_FOR_FINALITY", { hash: pending.hash });
  let receipt;
  try { receipt = await waitFinalized(pending.hash); }
  catch (error) { setTransactionProgress("RECONCILIATION_REQUIRED", { hash: pending.hash, message: "Verification is temporarily unavailable. Keep this transaction hash and continue when the network responds." }); throw error; }
  setTransactionProgress("VERIFYING_EXECUTION", { hash: pending.hash });
  if (!isSuccessful(receipt)) {
    clearPendingTransaction();
    setTransactionProgress("FAILED", { hash: pending.hash, message: "The finalized transaction did not complete successfully." });
    throw new Error("Transaction execution failed.");
  }
  setTransactionProgress("VERIFYING_READBACK", { hash: pending.hash });
  let record;
  try { record = await fetchCase(pending.caseId); assertExpectedReadback(record, pending); }
  catch (error) { setTransactionProgress("RECONCILIATION_REQUIRED", { hash: pending.hash, message: "The transaction is finalized, but its ledger state could not be verified. Do not submit again." }); throw error; }
  clearPendingTransaction();
  renderRecord(record);
  setTransactionProgress("SUCCESS", { hash: pending.hash });
  return record;
}
async function resumePendingTransaction() {
  const pending = pendingTransaction();
  if (!pending) return;
  setTransactionProgress("RECONCILIATION_REQUIRED", { hash: pending.hash });
  if (pending.contractAddress !== state.contractAddress || pending.network !== state.network) {
    elements.txDetail.textContent = "The saved transaction belongs to a different ledger configuration. Restore that configuration before continuing.";
    return;
  }
}
async function continuePendingTransaction() {
  const pending = pendingTransaction();
  if (!pending || pending.contractAddress !== state.contractAddress || pending.network !== state.network) return;
  if (transactionInFlight) return;
  transactionInFlight = true;
  try { await reconcilePending(pending); showNotice(`Verified case state loaded for ${pending.caseId}.`); }
  catch (error) { showNotice(userFacingError(error, "read"), true); }
  finally { transactionInFlight = false; updateButtons(); }
}
async function write(functionName, args, button, pendingLabel) {
  assertReady(true);
  if (transactionInFlight || pendingTransaction()) throw new Error("A transaction is waiting for verification. Continue verification before submitting another.");
  assertRecoveryStorage();
  transactionInFlight = true;
  setBusy(button, true, pendingLabel);
  setTransactionProgress("WAITING_FOR_WALLET");
  const pending = { version: 1, operation: functionName, caseId: String(args[0]), expectedState: writeExpectedState(functionName), contractAddress: state.contractAddress, network: state.network, account: state.account, hash: "" };
  try {
    let hash;
    try { hash = await state.writeClient.writeContract({ address: state.contractAddress, functionName, args, value: 0n }); }
    catch (error) { setTransactionProgress(isUserRejection(error) ? "REJECTED" : "RECONCILIATION_REQUIRED", { message: isUserRejection(error) ? "The wallet request was cancelled. Review the form and try again." : "The wallet response was uncertain. Check the wallet activity before trying again." }); throw error; }
    if (!isHash(hash)) { setTransactionProgress("RECONCILIATION_REQUIRED", { message: "The wallet did not return a usable transaction reference. Check the wallet activity before trying again." }); throw new Error("Invalid transaction hash."); }
    pending.hash = hash;
    const persisted = savePendingTransaction(pending);
    setTransactionProgress("SUBMITTED", { hash });
    if (!persisted) elements.txDetail.textContent = "Keep this page open until verification finishes. Do not submit again.";
    return await reconcilePending(pending);
  } finally {
    transactionInFlight = false;
    setBusy(button, false);
    updateButtons();
  }
}
async function register(event) {
  event.preventDefault();
  try { const value = currentFormCase(); state.lastCaseId = value.case_id; await write("register_case", [value.case_id, value.product_id, value.version, value.edition, value.region, value.policy_url], event.submitter, "Registering…"); elements.freeze.disabled = false; elements.assess.disabled = true; }
  catch (error) { showNotice(userFacingError(error, "write"), true); }
}
async function freeze() {
  try { await write("freeze_case", [elements.caseId.value.trim()], elements.freeze, "Freezing…"); elements.assess.disabled = false; }
  catch (error) { showNotice(userFacingError(error, "write"), true); }
}
async function assess() {
  try { const caseId = elements.caseId.value.trim(); const date = elements.observedDate.value; if (!caseId || !date) throw new Error("Enter a case ID and observed date."); state.lastCaseId = caseId; await write("assess", [caseId, date], elements.assess, "Assessing…"); }
  catch (error) { showNotice(userFacingError(error, "write"), true); }
}
async function readCase(caseId = state.lastCaseId || elements.caseId.value.trim()) {
  try { if (!caseId) throw new Error("Enter a case ID to read back."); const record = await fetchCase(caseId); state.lastCaseId = caseId; renderRecord(record); showNotice(`Verified case state loaded for ${caseId}.`); }
  catch (error) { showNotice(userFacingError(error, "read"), true); }
}
function renderRecord(record) {
  const value = record || {}; const policy = value.policy_url || "";
  elements.empty.classList.add("hidden"); elements.result.classList.remove("hidden"); elements.outcome.textContent = value.outcome || "DRAFT"; elements.caseState.textContent = value.state || "—";
  elements.readCaseId.textContent = value.case_id || state.lastCaseId || "—"; elements.readProduct.textContent = `${value.product_id || "—"} / ${value.version || "—"}`; elements.readScope.textContent = `${value.edition || "—"} / ${value.region || "—"}`; elements.readDate.textContent = value.observed_date || "—"; elements.readWindow.textContent = value.support_start && value.support_end ? `${value.support_start} → ${value.support_end}` : "—"; elements.readRetries.textContent = String(value.retry_count ?? 0); elements.digest.textContent = value.evidence_digest || "—"; elements.policyLink.href = /^https:\/\//i.test(policy) ? policy : "#";
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
function updateButtons() { const ready = configured() && Boolean(state.account); const locked = transactionInFlight || Boolean(pendingTransaction()); elements.connect.disabled = !configured() || transactionInFlight; elements.freeze.disabled = locked || !ready || !state.lastCaseId; elements.assess.disabled = locked || !ready || !state.lastCaseId; }

elements.network.value = state.network; elements.address.value = state.contractAddress; elements.observedDate.value = new Date().toISOString().slice(0, 10);
elements.network.addEventListener("change", () => { state.network = elements.network.value; state.provider = null; state.account = null; resetCaseContext(); clients(); elements.connection.textContent = "Reconnect required"; elements.account.textContent = "Network changed; connect again."; elements.networkLabel.textContent = networkLabel(state.network); updateButtons(); });
elements.address.addEventListener("input", () => { state.contractAddress = elements.address.value.trim(); resetCaseContext(); updateButtons(); });
elements.providers.addEventListener("change", () => { state.provider = state.providerInfo.get(elements.providers.value)?.provider || null; });
elements.connect.addEventListener("click", connectWallet); elements.register.addEventListener("submit", register); elements.freeze.addEventListener("click", freeze); elements.assess.addEventListener("click", assess); elements.refresh.addEventListener("click", () => readCase()); elements.copyTx.addEventListener("click", copyTransaction); elements.txReconcile.addEventListener("click", continuePendingTransaction);
clients(); discoverProviders(); updateButtons(); resumePendingTransaction();
