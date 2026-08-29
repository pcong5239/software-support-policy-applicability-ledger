import json


def policy(**overrides):
    value = {
        "product_id": "acme-suite",
        "min_version": "1.2.3",
        "max_version": "2.0.0",
        "min_inclusive": True,
        "max_inclusive": True,
        "support_start": "2025-01-01",
        "support_end": "2027-12-31",
        "excluded_editions": [],
        "excluded_regions": [],
    }
    value.update(overrides)
    return json.dumps(value)


def mock_policy(direct_vm, body, status=200):
    direct_vm.clear_mocks()
    direct_vm.mock_web(r"policy\.example", {"status": status, "body": body})


def deploy(direct_deploy):
    return direct_deploy("contracts/support_policy_ledger.py")


def register_and_freeze(contract, direct_vm, **overrides):
    args = {
        "case_id": "case-1",
        "product_id": "acme-suite",
        "version": "1.2.3",
        "edition": "enterprise",
        "region": "eu",
        "policy_url": "https://policy.example/support.json",
    }
    args.update(overrides)
    assert contract.register_case(**args) == "case-1"
    assert contract.freeze_case("case-1") == "case-1"


def test_register_freeze_and_supported_readback(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    register_and_freeze(contract, direct_vm)
    mock_policy(direct_vm, policy())

    assert contract.assess("case-1", "2026-06-15") == "SUPPORTED"
    record = contract.get_case("case-1")
    assert record.state == "ASSESSED"
    assert record.outcome == "SUPPORTED"
    assert record.support_start == "2025-01-01"
    assert record.support_end == "2027-12-31"
    assert record.observed_date == "2026-06-15"
    assert len(record.evidence_digest) == 64


def test_response_status_adapter_accepts_documented_and_runner_shapes(direct_deploy):
    deploy(direct_deploy)
    import sys

    module = sys.modules["_contract_support_policy_ledger"]
    assert module._response_status(type("Documented", (), {"status_code": 200})()) == 200
    assert module._response_status(type("Runner", (), {"status": 200})()) == 200
    assert module._response_status(type("Missing", (), {})()) is None


def test_predicate_order_exclusion_precedes_date_and_version(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    register_and_freeze(contract, direct_vm, version="9.9.9", edition="community", region="eu")
    mock_policy(
        direct_vm,
        policy(
            min_version="1.2.3",
            max_version="2.0.0",
            excluded_editions=["community"],
            support_start="2026-01-01",
            support_end="2026-01-31",
        ),
    )

    assert contract.assess("case-1", "2030-01-01") == "POLICY_EXCLUDES_SCOPE"


def test_inclusive_lower_version_and_date_boundary(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    register_and_freeze(contract, direct_vm, version="1.2.3")
    mock_policy(direct_vm, policy())
    assert contract.assess("case-1", "2025-01-01") == "SUPPORTED"


def test_inclusive_upper_version_and_date_boundary(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    register_and_freeze(contract, direct_vm, version="2.0.0")
    mock_policy(direct_vm, policy())
    assert contract.assess("case-1", "2027-12-31") == "SUPPORTED"


def test_exclusive_lower_version_boundary(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    register_and_freeze(contract, direct_vm, version="1.2.3")
    mock_policy(direct_vm, policy(min_inclusive=False))
    assert contract.assess("case-1", "2026-01-01") == "OUT_OF_SUPPORT"


def test_exclusive_upper_version_boundary(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    register_and_freeze(contract, direct_vm, version="2.0.0")
    mock_policy(direct_vm, policy(max_inclusive=False))
    assert contract.assess("case-1", "2026-01-01") == "OUT_OF_SUPPORT"


def test_scope_errors_unavailable_source_and_retry(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    register_and_freeze(contract, direct_vm)
    mock_policy(direct_vm, "not json")
    assert contract.assess("case-1", "2026-01-01") == "POLICY_SCOPE_UNCLEAR"

    mock_policy(direct_vm, policy())
    assert contract.retry_unresolved("case-1") == "SUPPORTED"
    assert contract.get_case("case-1").retry_count == 1


def test_unavailable_source_is_retryable(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    register_and_freeze(contract, direct_vm)
    mock_policy(direct_vm, "", status=503)
    assert contract.assess("case-1", "2026-01-01") == "UNRESOLVED"
    mock_policy(direct_vm, policy())
    assert contract.retry_unresolved("case-1") == "SUPPORTED"
    assert contract.get_case("case-1").retry_count == 1


def test_product_mismatch_is_unresolved(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    register_and_freeze(contract, direct_vm)
    mock_policy(direct_vm, policy(product_id="other-product"))

    assert contract.assess("case-1", "2026-01-01") == "UNRESOLVED"


def test_malformed_registration_and_owner_authorization(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_deploy)
    with direct_vm.expect_revert("Version must be"):
        contract.register_case(
            "bad",
            "acme-suite",
            "1.2",
            "enterprise",
            "eu",
            "https://policy.example/support.json",
        )

    register_and_freeze(contract, direct_vm)
    with direct_vm.prank(direct_alice):
        with direct_vm.expect_revert("case owner"):
            contract.retry_unresolved("case-1")


def test_validator_rederives_consequence(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    register_and_freeze(contract, direct_vm)
    mock_policy(direct_vm, policy())
    assert contract.assess("case-1", "2026-01-01") == "SUPPORTED"

    mock_policy(direct_vm, policy(max_version="1.2.2"))
    assert direct_vm.run_validator() is False
