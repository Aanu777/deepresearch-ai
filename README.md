
# DeepResearch

> A multi-agent AI research system designed to break complex research tasks into smaller problems, investigate them, verify findings, and produce structured reports.

![DeepResearch](https://img.shields.io/badge/DeepResearch-AI%20Research%20System-06b6d4?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-TypeScript-black?style=flat-square&logo=next.js)
![Python](https://img.shields.io/badge/Python-Backend-3776AB?style=flat-square&logo=python)
![AI Agents](https://img.shields.io/badge/Architecture-Multi--Agent-purple?style=flat-square)

---

## Overview

DeepResearch is an AI-powered research system built around a **multi-agent architecture**.

Instead of relying on a single AI model to perform an entire research task, DeepResearch divides the workflow between specialized agents.

A typical research task moves through:

```text
User Query
    │
    ▼
┌─────────┐
│ Planner │
└────┬────┘
     │
     ▼
┌─────────┐
│ Searcher│
└────┬────┘
     │
     ▼
┌───────────┐
│ Reflection│
└─────┬─────┘
      │
      ▼
┌─────────┐
│ Verifier│
└────┬────┘
     │
     ▼
┌────────┐
│ Writer │
└────┬───┘
     │
     ▼
Research Report
