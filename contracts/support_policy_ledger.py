# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from dataclasses import dataclass
from datetime import date
import hashlib
import json
import re
import typing

from genlayer import *


MAX_TEXT = 256
MAX_POLICY_BYTES = 32_768
OUTCOMES = (
    "SUPPORTED",
    "OUT_OF_SUPPORT",
    "POLICY_EXCLUDES_SCOPE",
    "POLICY_SCOPE_UNCLEAR",
    "UNRESOLVED",
)


@allow_storage
@dataclass
class SupportCase:
    owner: Address
    product_id: str
    version: str
    edition: str
    region: str
    policy_url: str
    support_start: str
    support_end: str
    observed_date: str
    state: str
    outcome: str
    evidence_digest: str
    retry_count: u8


def _text(value: str, label: str, maximum: int = MAX_TEXT) -> str:
    value = value.strip()
    if not value or len(value) > maximum:
        raise gl.vm.UserError(f"Invalid {label}.")
    return value


def _https_url(value: str) -> str:
    value = _text(value, "policy URL", 2_048)
    if not value.startswith("https://"):
        raise gl.vm.UserError("Policy URL must use HTTPS.")
    host = value[8:].split("/", 1)[0]
    if not host or " " in host or "@" in host:
        raise gl.vm.UserError("Policy URL must contain a valid HTTPS host.")
    return value


def _response_status(response: typing.Any) -> int | None:
    documented = getattr(response, "status_code", None)
    installed = getattr(response, "status", None)
    status = documented if documented is not None else installed
    return status if isinstance(status, int) else None


def _parse_version(value: str) -> tuple[int, int, int]:
    value = value.strip()
    match = re.fullmatch(r"(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)", value)
    if match is None:
        raise gl.vm.UserError("Version must be MAJOR.MINOR.PATCH without metadata.")
    parts = tuple(int(part) for part in match.groups())
    if any(part > 18_446_744_073_709_551_615 for part in parts):
        raise gl.vm.UserError("Version component is too large.")
    return typing.cast(tuple[int, int, int], parts)


def _parse_date(value: str, label: str) -> date:
    value = value.strip()
    if re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", value) is None:
        raise ValueError(f"Invalid {label}.")
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(f"Invalid {label}.") from exc


def _version_in_bounds(
    version: tuple[int, int, int],
    minimum: tuple[int, int, int] | None,
    maximum: tuple[int, int, int] | None,
    minimum_inclusive: bool,
    maximum_inclusive: bool,
) -> bool:
    if minimum is not None and (version < minimum or (version == minimum and not minimum_inclusive)):
        return False
    if maximum is not None and (version > maximum or (version == maximum and not maximum_inclusive)):
        return False
    return True


def _string_list(value: typing.Any, field: str) -> list[str]:
    if not isinstance(value, list) or len(value) > 64:
        raise ValueError(f"{field} must be a bounded list.")
    result: list[str] = []
    for item in value:
        if not isinstance(item, str) or not item.strip() or len(item) > MAX_TEXT:
            raise ValueError(f"{field} contains an invalid item.")
        result.append(item.strip())
    return result


def _policy_facts(body: bytes, product_id: str, version: str, edition: str, region: str, observed_date: str) -> dict[str, str]:
    if len(body) == 0 or len(body) > MAX_POLICY_BYTES:
        return {"outcome": "UNRESOLVED", "support_start": "", "support_end": "", "digest": ""}

    try:
        policy = json.loads(body.decode("utf-8"))
        if not isinstance(policy, dict):
            raise ValueError("policy is not an object")

        published_product = policy.get("product_id")
        minimum_raw = policy.get("min_version")
        maximum_raw = policy.get("max_version")
        start_raw = policy.get("support_start")
        end_raw = policy.get("support_end")
        if not isinstance(published_product, str):
            raise ValueError("missing product_id")
        if not isinstance(start_raw, str) or not isinstance(end_raw, str):
            raise ValueError("missing support dates")
        if not isinstance(minimum_raw, str) or not isinstance(maximum_raw, str):
            raise ValueError("missing version bounds")

        minimum = _parse_version(minimum_raw)
        maximum = _parse_version(maximum_raw)
        start = _parse_date(start_raw, "support_start")
        end = _parse_date(end_raw, "support_end")
        observed = _parse_date(observed_date, "observed_date")
        if start > end or minimum > maximum:
            raise ValueError("reversed policy bounds")

        minimum_inclusive = policy.get("min_inclusive", True)
        maximum_inclusive = policy.get("max_inclusive", True)
        if not isinstance(minimum_inclusive, bool) or not isinstance(maximum_inclusive, bool):
            raise ValueError("invalid bound inclusivity")

        excluded_editions = _string_list(policy.get("excluded_editions", []), "excluded_editions")
        excluded_regions = _string_list(policy.get("excluded_regions", []), "excluded_regions")
        requested_version = _parse_version(version)

        facts = {
            "product_id": published_product,
            "min_version": minimum_raw,
            "max_version": maximum_raw,
            "min_inclusive": str(minimum_inclusive),
            "max_inclusive": str(maximum_inclusive),
            "support_start": start.isoformat(),
            "support_end": end.isoformat(),
            "excluded_editions": ",".join(sorted(excluded_editions)),
            "excluded_regions": ",".join(sorted(excluded_regions)),
        }
        canonical = json.dumps(facts, sort_keys=True, separators=(",", ":"))
        digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()

        if published_product != product_id:
            outcome = "UNRESOLVED"
        elif edition in excluded_editions or region in excluded_regions:
            outcome = "POLICY_EXCLUDES_SCOPE"
        elif not _version_in_bounds(
            requested_version,
            minimum,
            maximum,
            minimum_inclusive,
            maximum_inclusive,
        ) or observed < start or observed > end:
            outcome = "OUT_OF_SUPPORT"
        else:
            outcome = "SUPPORTED"
        return {
            "outcome": outcome,
            "support_start": start.isoformat(),
            "support_end": end.isoformat(),
            "digest": digest,
        }
    except (TypeError, ValueError, UnicodeDecodeError, json.JSONDecodeError):
        return {"outcome": "POLICY_SCOPE_UNCLEAR", "support_start": "", "support_end": "", "digest": ""}


def _same_consequence(left: typing.Any, right: dict[str, str]) -> bool:
    return (
        isinstance(left, dict)
        and left.get("outcome") == right.get("outcome")
        and left.get("support_start") == right.get("support_start")
        and left.get("support_end") == right.get("support_end")
    )


class SupportPolicyApplicabilityLedger(gl.Contract):
    cases: TreeMap[str, SupportCase]

    def __init__(self):
        pass

    def _case(self, case_id: str) -> SupportCase:
        case = self.cases.get(case_id)
        if case is None:
            raise gl.vm.UserError("Case not found.")
        return case

    def _owner_case(self, case_id: str) -> SupportCase:
        case = self._case(case_id)
        if case.owner != gl.message.sender_address:
            raise gl.vm.UserError("Only the case owner may perform this action.")
        return case

    @gl.public.write
    def register_case(
        self,
        case_id: str,
        product_id: str,
        version: str,
        edition: str,
        region: str,
        policy_url: str,
    ) -> str:
        case_id = _text(case_id, "case ID", 64)
        if self.cases.get(case_id) is not None:
            raise gl.vm.UserError("Case ID already exists.")
        product_id = _text(product_id, "product ID")
        version = _text(version, "version")
        _parse_version(version)
        edition = _text(edition, "edition")
        region = _text(region, "region")
        policy_url = _https_url(policy_url)
        self.cases[case_id] = SupportCase(
            owner=gl.message.sender_address,
            product_id=product_id,
            version=version,
            edition=edition,
            region=region,
            policy_url=policy_url,
            support_start="",
            support_end="",
            observed_date="",
            state="DRAFT",
            outcome="",
            evidence_digest="",
            retry_count=u8(0),
        )
        return case_id

    @gl.public.write
    def freeze_case(self, case_id: str) -> str:
        case = self._owner_case(case_id)
        if case.state != "DRAFT":
            raise gl.vm.UserError("Only draft cases can be frozen.")
        case.state = "FROZEN"
        return case_id

    def _assess_case(self, case: SupportCase, observed_date: str) -> dict[str, str]:
        product_id = case.product_id
        version = case.version
        edition = case.edition
        region = case.region
        policy_url = case.policy_url

        def leader_fn() -> dict[str, str]:
            response = gl.nondet.web.get(policy_url)
            if _response_status(response) != 200:
                return {"outcome": "UNRESOLVED", "support_start": "", "support_end": "", "digest": ""}
            return _policy_facts(response.body, product_id, version, edition, region, observed_date)

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False
            response = gl.nondet.web.get(policy_url)
            if _response_status(response) != 200:
                own = {"outcome": "UNRESOLVED", "support_start": "", "support_end": "", "digest": ""}
            else:
                own = _policy_facts(response.body, product_id, version, edition, region, observed_date)
            return _same_consequence(leader_result.calldata, own)

        return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

    def _save_assessment(self, case: SupportCase, observed_date: str, result: dict[str, str]) -> str:
        outcome = result.get("outcome", "")
        if outcome not in OUTCOMES:
            raise gl.vm.UserError("Consensus returned an invalid outcome.")
        case.observed_date = observed_date
        case.support_start = result.get("support_start", "")
        case.support_end = result.get("support_end", "")
        case.outcome = outcome
        case.evidence_digest = result.get("digest", "")
        case.state = "ASSESSED"
        return outcome

    @gl.public.write
    def assess(self, case_id: str, observed_date: str) -> str:
        case = self._case(case_id)
        if case.state != "FROZEN":
            raise gl.vm.UserError("Only frozen cases can be assessed.")
        try:
            _parse_date(observed_date, "observed_date")
        except ValueError as exc:
            raise gl.vm.UserError(str(exc))
        result = self._assess_case(case, observed_date)
        return self._save_assessment(case, observed_date, result)

    @gl.public.write
    def retry_unresolved(self, case_id: str) -> str:
        case = self._owner_case(case_id)
        if case.state != "ASSESSED" or case.outcome not in ("UNRESOLVED", "POLICY_SCOPE_UNCLEAR"):
            raise gl.vm.UserError("Only unresolved assessments can be retried.")
        if case.retry_count >= 255:
            raise gl.vm.UserError("Retry limit reached.")
        result = self._assess_case(case, case.observed_date)
        case.retry_count = u8(int(case.retry_count) + 1)
        return self._save_assessment(case, case.observed_date, result)

    @gl.public.view
    def get_case(self, case_id: str) -> SupportCase:
        return self._case(case_id)

    @gl.public.view
    def has_case(self, case_id: str) -> bool:
        return self.cases.get(case_id) is not None
