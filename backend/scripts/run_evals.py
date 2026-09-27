from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time

from datetime import datetime, timezone
from pathlib import Path
from typing import Any


BACKEND_ROOT = (
    Path(
        __file__
    )
    .resolve()
    .parents[1]
)

EVAL_ROOT = (
    BACKEND_ROOT
    / "evals"
)

if str(
    BACKEND_ROOT
) not in sys.path:
    sys.path.insert(
        0,
        str(
            BACKEND_ROOT
        ),
    )


def bootstrap_offline_environment() -> None:

    placeholders = {
        "TAVILY_API_KEY":
            "offline-eval",

        "OPENROUTER_API_KEY":
            "offline-eval",

        "SUPABASE_URL":
            "https://offline-eval.supabase.co",

        "SUPABASE_PUBLISHABLE_KEY":
            "offline-eval",

        "DEEPGRAM_API_KEY":
            "offline-eval",

        "POLLINATIONS_API_KEY":
            "offline-eval",
    }

    for key, value in placeholders.items():
        os.environ.setdefault(
            key,
            value,
        )


def parse_args() -> argparse.Namespace:

    parser = argparse.ArgumentParser(
        description=(
            "Run DeepResearch AI regression evaluations."
        )
    )

    parser.add_argument(
        "--live",
        action="store_true",
        help=(
            "Also run live OpenRouter benchmark prompts."
        ),
    )

    parser.add_argument(
        "--category",
        action="append",
        default=[],
        help=(
            "Run only one or more categories. "
            "Repeat the flag for multiple categories."
        ),
    )

    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help=(
            "Optional JSON report destination."
        ),
    )

    return parser.parse_args()


def load_json(
    path: Path,
) -> dict[str, Any]:

    return json.loads(
        path.read_text(
            encoding="utf-8"
        )
    )


def git_sha() -> str:

    try:
        return (
            subprocess
            .check_output(
                [
                    "git",
                    "rev-parse",
                    "HEAD",
                ],
                cwd=BACKEND_ROOT,
                text=True,
                stderr=(
                    subprocess
                    .DEVNULL
                ),
            )
            .strip()
        )

    except Exception:
        return "unknown"


def selected(
    case: dict[str, Any],
    categories: set[str],
) -> bool:

    if not categories:
        return True

    return (
        str(
            case.get(
                "category",
                "",
            )
        )
        in categories
    )


def run_offline(
    cases: list[
        dict[str, Any]
    ],
    categories: set[str],
):

    from evals.evaluators import (
        EvalResult,
        evaluate_consolidation_decision,
        evaluate_memory_candidates,
        evaluate_source_rerank,
        evaluate_text,
    )

    from app.services.llm_service import (
        llm_service,
    )

    from app.services.memory_service import (
        memory_service,
    )

    from app.tools.search import (
        search_tool,
    )

    results: list[
        EvalResult
    ] = []

    for case in cases:

        if not selected(
            case,
            categories,
        ):
            continue

        case_id = str(
            case[
                "id"
            ]
        )

        category = str(
            case[
                "category"
            ]
        )

        case_type = str(
            case[
                "type"
            ]
        )

        checks = dict(
            case.get(
                "checks",
                {},
            )
        )

        try:
            if case_type == "normalize":
                output = (
                    llm_service
                    ._normalize_content(
                        case.get(
                            "input"
                        )
                    )
                )

                result = evaluate_text(
                    case_id=case_id,
                    category=category,
                    output=output,
                    checks=checks,
                )

            elif case_type == "memory_candidates":
                output = (
                    memory_service
                    ._parse_candidates(
                        str(
                            case.get(
                                "input",
                                "",
                            )
                        )
                    )
                )

                result = evaluate_memory_candidates(
                    case_id=case_id,
                    category=category,
                    output=output,
                    checks=checks,
                )

            elif case_type == "consolidation_decision":
                output = (
                    memory_service
                    ._parse_consolidation_decision(
                        str(
                            case.get(
                                "input",
                                "",
                            )
                        )
                    )
                )

                result = evaluate_consolidation_decision(
                    case_id=case_id,
                    category=category,
                    output=output,
                    checks=checks,
                )

            elif case_type == "source_rerank":
                payload = dict(
                    case.get(
                        "input",
                        {},
                    )
                )

                output = (
                    search_tool
                    .soft_rerank(
                        list(
                            payload.get(
                                "items",
                                [],
                            )
                        ),
                        list(
                            payload.get(
                                "preferred_domains",
                                [],
                            )
                        ),
                    )
                )

                result = evaluate_source_rerank(
                    case_id=case_id,
                    category=category,
                    output=output,
                    checks=checks,
                )

            else:
                result = EvalResult(
                    case_id=case_id,
                    category=category,
                    passed=False,
                    checks_passed=0,
                    checks_total=1,
                    error=(
                        "unknown offline eval type: "
                        + case_type
                    ),
                )

        except Exception as exc:
            result = EvalResult(
                case_id=case_id,
                category=category,
                passed=False,
                checks_passed=0,
                checks_total=1,
                error=(
                    type(
                        exc
                    ).__name__
                    + ": "
                    + str(
                        exc
                    )
                ),
            )

        results.append(
            result
        )

    return results


def run_live(
    cases: list[
        dict[str, Any]
    ],
    categories: set[str],
):

    from evals.evaluators import (
        EvalResult,
        evaluate_text,
    )

    from app.core.config import (
        settings,
    )

    from app.services.llm_service import (
        llm_service,
    )

    if not (
        settings
        .OPENROUTER_API_KEY
        .strip()
    ):
        raise RuntimeError(
            "OPENROUTER_API_KEY is required for --live."
        )

    results: list[
        EvalResult
    ] = []

    for case in cases:

        if not selected(
            case,
            categories,
        ):
            continue

        case_id = str(
            case[
                "id"
            ]
        )

        category = str(
            case[
                "category"
            ]
        )

        checks = dict(
            case.get(
                "checks",
                {},
            )
        )

        started = time.perf_counter()

        try:
            output = (
                llm_service
                .generate_chat(
                    list(
                        case.get(
                            "messages",
                            [],
                        )
                    )
                )
            )

            latency_ms = (
                (
                    time.perf_counter()
                    - started
                )
                * 1000
            )

            result = evaluate_text(
                case_id=case_id,
                category=category,
                output=output,
                checks=checks,
                latency_ms=latency_ms,
            )

            maximum = case.get(
                "max_latency_ms"
            )

            if (
                maximum is not None
                and latency_ms
                > float(
                    maximum
                )
            ):
                result.passed = False
                result.checks_total += 1
                result.error = (
                    (
                        result.error
                        + "; "
                    )
                    if result.error
                    else ""
                ) + (
                    "latency exceeded "
                    f"{maximum}ms "
                    f"({latency_ms:.0f}ms)"
                )

            elif maximum is not None:
                result.checks_total += 1
                result.checks_passed += 1

        except Exception as exc:
            latency_ms = (
                (
                    time.perf_counter()
                    - started
                )
                * 1000
            )

            result = EvalResult(
                case_id=case_id,
                category=category,
                passed=False,
                checks_passed=0,
                checks_total=1,
                latency_ms=latency_ms,
                error=(
                    type(
                        exc
                    ).__name__
                    + ": "
                    + str(
                        exc
                    )
                ),
            )

        results.append(
            result
        )

    return results


def threshold_failures(
    *,
    offline_results,
    live_results,
    baseline: dict[str, Any],
) -> list[str]:

    from evals.evaluators import (
        category_scores,
        overall_score,
    )

    failures: list[str] = []

    thresholds = baseline.get(
        "thresholds",
        {},
    )

    offline_score = overall_score(
        offline_results
    )

    offline_min = float(
        thresholds.get(
            "offline_overall",
            1.0,
        )
    )

    if (
        offline_results
        and offline_score
        < offline_min
    ):
        failures.append(
            (
                "offline overall "
                f"{offline_score:.1%} "
                f"< {offline_min:.1%}"
            )
        )

    if live_results:
        live_score = overall_score(
            live_results
        )

        live_min = float(
            thresholds.get(
                "live_overall",
                0.0,
            )
        )

        if live_score < live_min:
            failures.append(
                (
                    "live overall "
                    f"{live_score:.1%} "
                    f"< {live_min:.1%}"
                )
            )

    all_results = [
        *offline_results,
        *live_results,
    ]

    scores = category_scores(
        all_results
    )

    category_thresholds = dict(
        thresholds.get(
            "categories",
            {},
        )
    )

    for category, score in scores.items():

        if category not in category_thresholds:
            continue

        minimum = float(
            category_thresholds[
                category
            ]
        )

        if score < minimum:
            failures.append(
                (
                    category
                    + " "
                    + f"{score:.1%} "
                    + f"< {minimum:.1%}"
                )
            )

    return failures


def print_results(
    *,
    title: str,
    results,
) -> None:

    print(
        "\n"
        + title
    )

    print(
        "-" * len(
            title
        )
    )

    if not results:
        print(
            "(no cases selected)"
        )

        return

    for result in results:
        symbol = (
            "PASS"
            if result.passed
            else "FAIL"
        )

        latency = (
            (
                f" | {result.latency_ms:.0f}ms"
            )
            if result.latency_ms
            is not None
            else ""
        )

        print(
            (
                f"[{symbol}] "
                f"{result.case_id} "
                f"({result.category})"
                f"{latency}"
            )
        )

        if result.error:
            print(
                "       "
                + result.error
            )


def main() -> int:

    args = parse_args()

    if not args.live:
        bootstrap_offline_environment()

    cases = load_json(
        EVAL_ROOT
        / "cases.json"
    )

    baseline = load_json(
        EVAL_ROOT
        / "baseline.json"
    )

    categories = set(
        args.category
    )

    offline_results = run_offline(
        list(
            cases.get(
                "offline",
                [],
            )
        ),
        categories,
    )

    live_results = []

    if args.live:
        live_results = run_live(
            list(
                cases.get(
                    "live",
                    [],
                )
            ),
            categories,
        )

    print_results(
        title="Offline evaluations",
        results=offline_results,
    )

    if args.live:
        print_results(
            title="Live evaluations",
            results=live_results,
        )

    failures = threshold_failures(
        offline_results=offline_results,
        live_results=live_results,
        baseline=baseline,
    )

    from evals.evaluators import (
        category_scores,
        overall_score,
    )

    all_results = [
        *offline_results,
        *live_results,
    ]

    report = {
        "schema_version":
            1,

        "generated_at":
            datetime.now(
                timezone.utc
            ).isoformat(),

        "git_sha":
            git_sha(),

        "live":
            bool(
                args.live
            ),

        "offline_score":
            overall_score(
                offline_results
            ),

        "live_score":
            (
                overall_score(
                    live_results
                )
                if live_results
                else None
            ),

        "category_scores":
            category_scores(
                all_results
            ),

        "threshold_failures":
            failures,

        "results":
            [
                result.to_dict()
                for result
                in all_results
            ],
    }

    output_path = (
        args.output
        if args.output
        else (
            EVAL_ROOT
            / "results"
            / (
                "eval-"
                + datetime.now(
                    timezone.utc
                ).strftime(
                    "%Y%m%dT%H%M%SZ"
                )
                + ".json"
            )
        )
    )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_path.write_text(
        json.dumps(
            report,
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )

    print(
        "\nReport: "
        + str(
            output_path
        )
    )

    if failures:
        print(
            "\nREGRESSION DETECTED"
        )

        for failure in failures:
            print(
                " - "
                + failure
            )

        return 1

    print(
        "\nEvaluation thresholds passed."
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(
        main()
    )
