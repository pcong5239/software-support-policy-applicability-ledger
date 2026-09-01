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
    assert 'register_case' in app
    assert 'freeze_case' in app
    assert 'assess' in app
    assert 'get_case' in app
    assert 'tx-hash' in html and 'tx-link' in html and 'copy-tx' in html
    assert "innerHTML" not in app
    assert 'rel="noreferrer noopener"' in html


def test_frontend_modules_parse_with_node():
    for path in (ROOT / "frontend" / "app.js", ROOT / "frontend" / "config.js"):
        result = subprocess.run(
            ["node", "--check", str(path)],
            capture_output=True,
            text=True,
            check=False,
        )
        assert result.returncode == 0, result.stderr
