# DeepResearch AI Evaluation Framework

Phase 5 adds repeatable regression evaluation for the adaptive AI stack.

## What it measures

### Offline deterministic suite

The default suite runs without external network/model calls and checks:

- provider safety-metadata removal
- leaked tool-call markup normalization
- Markdown code formatting recovery
- durable-memory extraction parsing
- low-confidence memory rejection
- memory-consolidation decision parsing

### Live model suite

The optional live suite sends benchmark prompts through the configured OpenRouter path and checks:

- non-empty useful output
- normal Markdown code fencing
- no leaked internal tool-call tokens
- no provider safety-label artifacts
- bounded response latency

The live suite is intentionally small because free routed models are variable.

## Run

From the `backend` directory:

```powershell
python scripts/run_evals.py
```

Run offline + live provider checks:

```powershell
python scripts/run_evals.py --live
```

Run one category:

```powershell
python scripts/run_evals.py --category provider_cleanup
```

Run multiple categories:

```powershell
python scripts/run_evals.py --category code_generation --category conversation_quality --live
```

Write to a specific report path:

```powershell
python scripts/run_evals.py --output eval-report.json
```

## Regression behavior

Thresholds live in `evals/baseline.json`.

The runner exits:

- `0` when all required thresholds pass
- `1` when a regression is detected

Generated reports are stored under `evals/results/` by default and are ignored by Git.

This makes the runner suitable for future CI integration.


## CI gate

`.github/workflows/ai-regression-evals.yml` runs the deterministic
offline suite on every pull request to `MAIN` and every push to `MAIN`.

The workflow requires no API secrets. A threshold regression returns a
non-zero exit code and fails the check.
