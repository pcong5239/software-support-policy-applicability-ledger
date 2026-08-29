def test_probe_runs_with_mocked_web_and_pickling(direct_vm, direct_deploy):
    direct_vm.check_pickling = True
    direct_vm.mock_web(
        r"policy\.example",
        {"status": 200, "body": "Supported through 2027-12-31"},
    )

    contract = direct_deploy("verification/feasibility_probe.py")

    assert contract.get_last_outcome() == ""
    assert contract.classify("case-1", "https://policy.example/support") == "SUPPORTED"
    assert contract.get_last_outcome() == "SUPPORTED"
    assert direct_vm.run_validator() is True
