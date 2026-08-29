# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from dataclasses import dataclass

from genlayer import *


@allow_storage
@dataclass
class ProbeRecord:
    label: str
    retry_count: u8


class Contract(gl.Contract):
    records: TreeMap[str, ProbeRecord]
    last_outcome: str

    def __init__(self):
        self.last_outcome = ""

    @gl.public.view
    def get_last_outcome(self) -> str:
        return self.last_outcome

    @gl.public.write
    def classify(self, key: str, policy_url: str) -> str:
        def leader_fn() -> str:
            response = gl.nondet.web.get(policy_url)
            body = response.body.decode("utf-8").lower()
            return "SUPPORTED" if "support" in body else "UNRESOLVED"

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False
            response = gl.nondet.web.get(policy_url)
            body = response.body.decode("utf-8").lower()
            expected = "SUPPORTED" if "support" in body else "UNRESOLVED"
            return expected == leader_result.calldata

        outcome = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        self.last_outcome = outcome
        return outcome
