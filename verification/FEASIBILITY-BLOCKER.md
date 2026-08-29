# Feasibility resolution — Web response status field

Checked: 2026-08-30 (Asia/Saigon)

The current official Web Access documentation says to inspect `response.status_code`:

- https://docs.genlayer.com/developers/intelligent-contracts/features/web-access

The installed Direct Mode runner used by `genvm-lint` and `genlayer-test` exposes `Response.status` instead. The exact runner source declares `status: int`, `headers`, and `body`; it has no `status_code` member.

Evidence captured before the adapter was added:

- Contract SHA-256: `A90A3F7DFD0C2FF42F545993ED2DCDC06D8715C34047500118F1119735F5E7BA`
- `genvm-lint`: `0.11.0`
- `genlayer-test`: `0.29.2`
- `genlayer-py`: `0.16.3`
- Direct runner: cached `v0.3.0-rc7`
- Runner source SHA-256: `FA561B021345B803B7425DFEC455B299CA55436C698E9457BFD872D6A116157B`

Impact: the documented API and installed runner disagree on the response-status attribute. Treating either attribute as universally present would make source availability handling version-fragile.

Resolution applied on user instruction: keep the current pinned environment and add the task-local `_response_status` adapter in `contracts/support_policy_ledger.py`. It reads the documented `status_code` first, falls back to the installed runner's `status`, and returns no status for missing/non-integer values. The contract then fails closed to `UNRESOLVED` unless the resolved status is exactly `200`.

Post-resolution verification:

- Contract SHA-256 after adapter: `314824D86E3CFF276E885E930F619717449D76D6AA5B8D364F4F37C41C4E6E8B`
- `genvm-lint check --json contracts/support_policy_ledger.py`: PASS; 6 methods, 2 views, 4 writes.
- `py -3.13 -m pytest -q -p no:cacheprovider tests verification/test_feasibility_probe.py`: PASS; 12 tests.
- No package installation, deployment, or transaction occurred.

Status: resolved for the pinned local runner; retain this adapter until the official documentation and runtime expose one confirmed field. The informational newer-runner warning remains separate and is not a reason to download artifacts during this task.
