import json
import re

from app.graph.state import ResearchState
from app.services.llm_service import llm_service


class ReflectionAgent:

    def _extract_json(self, response: str) -> dict:
        """
        Safely extract a JSON object from the LLM response.

        Handles:
        - Normal JSON
        - JSON wrapped in ```json ... ```
        - Extra text before/after JSON
        """

        response = response.strip()

        # First attempt: response is already valid JSON
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            pass

        # Remove markdown code fences
        cleaned = re.sub(
            r"```(?:json)?",
            "",
            response,
            flags=re.IGNORECASE,
        ).replace("```", "").strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        # Find the first JSON object inside the response
        match = re.search(
            r"\{.*\}",
            cleaned,
            flags=re.DOTALL,
        )

        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass

        return {}

    def _clamp_score(self, score) -> float:
        """
        Keep the quality score safely between 1 and 10.
        """

        try:
            score = float(score)
        except (TypeError, ValueError):
            return 5.0

        return max(1.0, min(10.0, score))

    def _build_research_context(self, state: ResearchState) -> str:
        """
        Build a compact research snapshot for the reviewer.

        We intentionally limit the amount of raw search data sent to
        the LLM so reflection doesn't consume unnecessary context.
        """

        query = state.get("query", "")
        summary = state.get("summary", "")
        extracted_information = state.get(
            "extracted_information",
            [],
        )
        search_results = state.get(
            "search_results",
            [],
        )

        # Keep the extracted information manageable.
        extracted_preview = extracted_information[:8]

        # Keep source information manageable as well.
        sources_preview = search_results[:8]

        return f"""
RESEARCH QUESTION:
{query}

CURRENT SUMMARY:
{summary}

EXTRACTED INFORMATION:
{json.dumps(extracted_preview, ensure_ascii=False, default=str)}

SEARCH RESULTS / SOURCES:
{json.dumps(sources_preview, ensure_ascii=False, default=str)}
"""

    def run(self, state: ResearchState):

        reflection_count = state.get(
            "reflection_count",
            0,
        )

        research_context = self._build_research_context(state)

        prompt = f"""
You are the senior quality-control researcher inside an autonomous
deep research system.

Your job is NOT to rewrite the research.

Your job is to critically inspect the current research and determine
whether it is good enough to become a final answer.

{research_context}

Evaluate the research using these dimensions:

1. COMPLETENESS
Does the research actually answer the user's question?
Are important aspects missing?

2. EVIDENCE
Does the summary appear to be supported by the extracted information
and available research results?

3. DEPTH
Is the research sufficiently detailed for the question?

4. CONSISTENCY
Are there contradictions, uncertainty, unsupported claims, or obvious
logical problems?

5. CLARITY
Is the information organized well enough for a final writer to use?

6. RESEARCH GAPS
Identify the most important missing information that should be researched
if another research iteration is possible.

QUALITY SCORE:

1-3:
Very poor. Major information or evidence is missing.

4-5:
Incomplete. Significant gaps remain.

6-7:
Useful research, but important information or verification is still needed.

8:
Strong research with only minor gaps.

9:
Very strong research with excellent coverage and support.

10:
Exceptional, comprehensive, well-supported research with essentially
no meaningful gaps.

IMPORTANT DECISION RULES:

- Give a score based on the ACTUAL research shown above.
- Do not automatically give a high score.
- Do not punish the research simply because it is concise.
- A research task should only receive 9-10 when the important aspects
  of the question are genuinely covered.
- If important information is missing, explain the gap.
- If another search iteration could materially improve the answer,
  recommend continuing research.
- If the research is already strong enough for a final report,
  recommend writing.

This is reflection iteration #{reflection_count + 1}.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "quality_score": 0,
    "completeness": 0,
    "evidence_quality": 0,
    "depth": 0,
    "consistency": 0,
    "clarity": 0,
    "gaps": [],
    "contradictions": [],
    "reason": "",
    "recommendation": "continue_research"
}}

Scoring for the individual dimensions is also 1-10.

The recommendation MUST be exactly one of:

"continue_research"

or

"write_report"
"""

        try:
            response = llm_service.generate(prompt)

            result = self._extract_json(response)

        except Exception:
            # Reflection should never destroy the entire research job.
            result = {}

        # ---------------------------------------------------------
        # Extract and validate quality score
        # ---------------------------------------------------------

        score = self._clamp_score(
            result.get("quality_score", 5.0)
        )

        state["quality_score"] = score

        # ---------------------------------------------------------
        # Increment reflection counter
        # ---------------------------------------------------------

        state["reflection_count"] = reflection_count + 1

        # ---------------------------------------------------------
        # Determine whether research should continue
        #
        # We intentionally preserve compatibility with the existing
        # workflow.py reflection_router.
        # ---------------------------------------------------------

        recommendation = result.get(
            "recommendation",
            "continue_research",
        )

        if not isinstance(recommendation, str):
            recommendation = "continue_research"

        recommendation = recommendation.strip().lower()

        # A score of 8+ is considered ready by the current workflow.
        if score >= 8:
            state["completed"] = True

        # Prevent endless research loops.
        elif state["reflection_count"] >= 2:
            state["completed"] = True

        # Explicitly allow the reflection model to request another pass.
        elif recommendation == "continue_research":
            state["completed"] = False

        else:
            state["completed"] = False

        # ---------------------------------------------------------
        # Build a useful live status message for the frontend.
        # ---------------------------------------------------------

        gaps = result.get("gaps", [])
        contradictions = result.get(
            "contradictions",
            [],
        )

        reason = result.get(
            "reason",
            "",
        )

        if not isinstance(gaps, list):
            gaps = []

        if not isinstance(contradictions, list):
            contradictions = []

        if not isinstance(reason, str):
            reason = str(reason)

        status_parts = [
            f"Reflection (Score: {score}/10)"
        ]

        if gaps:
            status_parts.append(
                f"{len(gaps)} research gap(s) identified"
            )

        if contradictions:
            status_parts.append(
                f"{len(contradictions)} contradiction(s) detected"
            )

        if state["completed"]:
            status_parts.append(
                "Research quality sufficient for final report"
            )
        else:
            status_parts.append(
                "Additional research recommended"
            )

        state["current_step"] = " — ".join(status_parts)

        # ---------------------------------------------------------
        # Log the reflection internally.
        # This is useful while developing the system.
        # ---------------------------------------------------------

        print("\n========== RESEARCH REFLECTION ==========")
        print(f"Score: {score}/10")
        print(
            f"Completeness: "
            f"{result.get('completeness', 'N/A')}/10"
        )
        print(
            f"Evidence quality: "
            f"{result.get('evidence_quality', 'N/A')}/10"
        )
        print(
            f"Depth: "
            f"{result.get('depth', 'N/A')}/10"
        )
        print(
            f"Consistency: "
            f"{result.get('consistency', 'N/A')}/10"
        )
        print(
            f"Clarity: "
            f"{result.get('clarity', 'N/A')}/10"
        )

        if gaps:
            print("\nResearch gaps:")
            for gap in gaps:
                print(f"- {gap}")

        if contradictions:
            print("\nContradictions:")
            for contradiction in contradictions:
                print(f"- {contradiction}")

        if reason:
            print("\nReviewer reasoning:")
            print(reason)

        print(
            f"\nRecommendation: "
            f"{recommendation}"
        )

        print(
            f"Continue research: "
            f"{not state['completed']}"
        )

        print("==========================================\n")

        return state


reflection_agent = ReflectionAgent()