from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass
class EvalResult:
    case_id: str
    category: str
    passed: bool
    checks_passed: int
    checks_total: int
    latency_ms: float | None = None
    error: str | None = None
    output_preview: str | None = None

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return asdict(
            self
        )


def _preview(
    value: Any,
    limit: int = 240,
) -> str:

    text = str(
        value
    )

    if len(text) <= limit:
        return text

    return (
        text[:limit]
        + "…"
    )


def evaluate_text(
    *,
    case_id: str,
    category: str,
    output: str,
    checks: dict[str, Any],
    latency_ms: float | None = None,
) -> EvalResult:

    passed = 0
    total = 0
    failures: list[str] = []

    if "empty" in checks:
        total += 1

        expected = bool(
            checks[
                "empty"
            ]
        )

        actual = (
            output.strip()
            == ""
        )

        if actual == expected:
            passed += 1

        else:
            failures.append(
                (
                    "empty expected "
                    f"{expected}, got {actual}"
                )
            )

    if "equals" in checks:
        total += 1

        expected = str(
            checks[
                "equals"
            ]
        )

        if output.strip() == expected:
            passed += 1

        else:
            failures.append(
                "exact output mismatch"
            )

    for needle in checks.get(
        "contains",
        [],
    ):
        total += 1

        if str(
            needle
        ) in output:
            passed += 1

        else:
            failures.append(
                (
                    "missing required text: "
                    + str(
                        needle
                    )
                )
            )

    for needle in checks.get(
        "forbidden",
        [],
    ):
        total += 1

        if str(
            needle
        ) not in output:
            passed += 1

        else:
            failures.append(
                (
                    "found forbidden text: "
                    + str(
                        needle
                    )
                )
            )

    if "min_chars" in checks:
        total += 1

        minimum = int(
            checks[
                "min_chars"
            ]
        )

        if len(
            output.strip()
        ) >= minimum:
            passed += 1

        else:
            failures.append(
                (
                    "output shorter than "
                    f"{minimum} characters"
                )
            )

    return EvalResult(
        case_id=case_id,
        category=category,
        passed=(
            passed == total
        ),
        checks_passed=passed,
        checks_total=total,
        latency_ms=latency_ms,
        error=(
            "; ".join(
                failures
            )
            if failures
            else None
        ),
        output_preview=_preview(
            output
        ),
    )


def evaluate_memory_candidates(
    *,
    case_id: str,
    category: str,
    output: list[
        dict[str, Any]
    ],
    checks: dict[str, Any],
) -> EvalResult:

    passed = 0
    total = 0
    failures: list[str] = []

    if "count" in checks:
        total += 1

        expected = int(
            checks[
                "count"
            ]
        )

        if len(
            output
        ) == expected:
            passed += 1

        else:
            failures.append(
                (
                    "candidate count expected "
                    f"{expected}, got {len(output)}"
                )
            )

    if "first_kind" in checks:
        total += 1

        actual = (
            output[0].get(
                "kind"
            )
            if output
            else None
        )

        expected = checks[
            "first_kind"
        ]

        if actual == expected:
            passed += 1

        else:
            failures.append(
                (
                    "first kind expected "
                    f"{expected}, got {actual}"
                )
            )

    if "first_content" in checks:
        total += 1

        actual = (
            output[0].get(
                "content"
            )
            if output
            else None
        )

        expected = checks[
            "first_content"
        ]

        if actual == expected:
            passed += 1

        else:
            failures.append(
                "first content mismatch"
            )

    return EvalResult(
        case_id=case_id,
        category=category,
        passed=(
            passed == total
        ),
        checks_passed=passed,
        checks_total=total,
        error=(
            "; ".join(
                failures
            )
            if failures
            else None
        ),
        output_preview=_preview(
            output
        ),
    )


def evaluate_consolidation_decision(
    *,
    case_id: str,
    category: str,
    output: dict[str, Any] | None,
    checks: dict[str, Any],
) -> EvalResult:

    passed = 0
    total = 0
    failures: list[str] = []

    if checks.get(
        "null"
    ):
        total += 1

        if output is None:
            passed += 1

        else:
            failures.append(
                "expected parser rejection"
            )

    if "action" in checks:
        total += 1

        actual = (
            output.get(
                "action"
            )
            if output
            else None
        )

        expected = checks[
            "action"
        ]

        if actual == expected:
            passed += 1

        else:
            failures.append(
                (
                    "action expected "
                    f"{expected}, got {actual}"
                )
            )

    if "merged_content" in checks:
        total += 1

        actual = (
            output.get(
                "merged_content"
            )
            if output
            else None
        )

        expected = checks[
            "merged_content"
        ]

        if actual == expected:
            passed += 1

        else:
            failures.append(
                "merged_content mismatch"
            )

    return EvalResult(
        case_id=case_id,
        category=category,
        passed=(
            passed == total
        ),
        checks_passed=passed,
        checks_total=total,
        error=(
            "; ".join(
                failures
            )
            if failures
            else None
        ),
        output_preview=_preview(
            output
        ),
    )


def category_scores(
    results: list[
        EvalResult
    ],
) -> dict[str, float]:

    grouped: dict[
        str,
        list[EvalResult],
    ] = {}

    for result in results:
        grouped.setdefault(
            result.category,
            [],
        ).append(
            result
        )

    return {
        category:
            (
                sum(
                    1
                    for result
                    in category_results
                    if result.passed
                )
                / len(
                    category_results
                )
            )
        for category, category_results
        in grouped.items()
        if category_results
    }


def overall_score(
    results: list[
        EvalResult
    ],
) -> float:

    if not results:
        return 0.0

    return (
        sum(
            1
            for result
            in results
            if result.passed
        )
        / len(
            results
        )
    )


def evaluate_source_rerank(
    *,
    case_id: str,
    category: str,
    output: list,
    checks: dict[str, Any],
) -> EvalResult:

    passed = 0
    total = 0
    failures: list[str] = []

    if "count" in checks:
        total += 1

        expected = int(
            checks[
                "count"
            ]
        )

        if len(
            output
        ) == expected:
            passed += 1

        else:
            failures.append(
                (
                    "result count expected "
                    f"{expected}, got {len(output)}"
                )
            )

    if "first_url_contains" in checks:
        total += 1

        expected = str(
            checks[
                "first_url_contains"
            ]
        )

        first_url = (
            str(
                output[0].get(
                    "url",
                    "",
                )
            )
            if (
                output
                and isinstance(
                    output[0],
                    dict,
                )
            )
            else ""
        )

        if expected in first_url:
            passed += 1

        else:
            failures.append(
                (
                    "preferred domain was not "
                    "moved to the first position"
                )
            )

    if "preserve_urls" in checks:
        total += 1

        expected_urls = {
            str(
                url
            )
            for url
            in checks[
                "preserve_urls"
            ]
        }

        actual_urls = {
            str(
                item.get(
                    "url",
                    "",
                )
            )
            for item
            in output
            if isinstance(
                item,
                dict,
            )
        }

        if actual_urls == expected_urls:
            passed += 1

        else:
            failures.append(
                "soft rerank changed the source set"
            )

    return EvalResult(
        case_id=case_id,
        category=category,
        passed=(
            passed == total
        ),
        checks_passed=passed,
        checks_total=total,
        error=(
            "; ".join(
                failures
            )
            if failures
            else None
        ),
        output_preview=_preview(
            output
        ),
    )
