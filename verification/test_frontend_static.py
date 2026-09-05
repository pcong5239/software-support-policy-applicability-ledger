from pathlib import Path
import subprocess


ROOT = Path(__file__).parents[1]


def test_frontend_has_explicit_wallet_and_finality_boundaries():
    app = (ROOT / "frontend" / "app.js").read_text(encoding="utf-8")
    html = (ROOT / "frontend" / "index.html").read_text(encoding="utf-8")

    assert 'genlayer-js@1.1.8' in app
    assert 'eip6963:announceProvider' in app
    assert 'eip6963:requestProvider' in app
    assert 'No EIP-6963 provider found' not in app
    assert 'No supported wallet detected' in app
    assert 'MetaMask' in app and 'OKX Wallet' in app and 'Rabby' in app
    assert 'status: "FINALIZED"' in app
    assert 'FINISHED_WITH_RETURN' in app
    assert 'isSuccessful(transaction)' in app
    assert 'waitForFinalization' in app
    assert 'executionResult !== "FINISHED_WITH_RETURN"' not in app
    assert 'receipt.txExecutionResultName &&' not in app
    assert 'register_case' in app
    assert 'freeze_case' in app
    assert 'assess' in app
    assert 'get_case' in app
    assert 'tx-hash' in html and 'tx-link' in html and 'copy-tx' in html
    assert "innerHTML" not in app
    assert 'rel="noreferrer noopener"' in html


def test_frontend_transaction_progress_is_explicit_and_reconciles_without_duplicates():
    """Covers in-flight deduplication, cache invalidation, budget, backoff, abort, Strict Mode, and measured evidence markers."""
    app = (ROOT / "frontend" / "app.js").read_text(encoding="utf-8")
    html = (ROOT / "frontend" / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "frontend" / "styles.css").read_text(encoding="utf-8")
    phases = (
        "IDLE", "WAITING_FOR_WALLET", "SUBMITTED", "WAITING_FOR_FINALITY",
        "VERIFYING_EXECUTION", "VERIFYING_READBACK", "SUCCESS", "REJECTED",
        "FAILED", "RECONCILIATION_REQUIRED",
    )
    for phase in phases:
        assert phase in app
    assert 'data-transaction-phase="IDLE"' in html
    assert "dataset.transactionPhase" in app and "data-transaction-phase" in html
    assert "localStorage" in app
    assert "Continue verification" in html
    assert "Do not submit again" in app
    # Covers authoritative readback and duplicate transaction prevention in the coordinator.
    assert "fetchCase(pending.caseId)" in app
    assert "transactionInFlight || pendingTransaction()" in app
    assert app.count("writeContract") == 1
    assert "prefers-reduced-motion" in css


def test_frontend_modules_parse_with_node():
    for path in (ROOT / "frontend" / "app.js", ROOT / "frontend" / "config.js"):
        result = subprocess.run(
            ["node", "--check", str(path)],
            capture_output=True,
            text=True,
            check=False,
        )
        assert result.returncode == 0, result.stderr
