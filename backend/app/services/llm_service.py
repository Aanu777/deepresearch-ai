from typing import List, Dict

from openai import OpenAI

from app.core.config import settings


class LLMService:

    def __init__(self):

        self.client = OpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
        )

    # ========================================================
    # NORMAL GENERATION
    # ========================================================

    def generate(
        self,
        prompt: str,
    ) -> str:

        response = self.client.chat.completions.create(
            model=settings.OPENROUTER_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful, intelligent AI assistant. "
                        "Have natural conversations with the user. "
                        "Be clear, accurate, and conversational. "
                        "Do not behave like a research report generator "
                        "unless the user specifically asks for research."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.7,
            max_tokens=1000,
        )

        return (
            response.choices[0]
            .message
            .content
            or ""
        )

    # ========================================================
    # CONVERSATION GENERATION
    # ========================================================

    def generate_chat(
        self,
        messages: List[Dict[str, str]],
    ) -> str:

        conversation = [
            {
                "role": "system",
                "content": (
                    "You are DeepResearch AI in Conversation Mode. "
                    "You are a helpful, intelligent, natural AI assistant. "
                    "Talk with the user conversationally, like a modern "
                    "AI assistant. "
                    "\n\n"
                    "Rules:"
                    "\n"
                    "- Remember and use the conversation history."
                    "\n"
                    "- Answer the user's latest message directly."
                    "\n"
                    "- Be concise when a short answer is enough."
                    "\n"
                    "- Explain things clearly when the user needs detail."
                    "\n"
                    "- Do not automatically turn normal conversations "
                    "into research reports."
                    "\n"
                    "- Do not invent information."
                    "\n"
                    "- If the user asks for deep research, that should "
                    "be handled by Deep Research Mode instead."
                ),
            }
        ]

        # ----------------------------------------------------
        # Add conversation history
        # ----------------------------------------------------

        for message in messages:

            role = message.get("role")
            content = message.get("content")

            if role not in {
                "user",
                "assistant",
            }:
                continue

            if not content:
                continue

            conversation.append(
                {
                    "role": role,
                    "content": content,
                }
            )

        # ----------------------------------------------------
        # Call model
        # ----------------------------------------------------

        response = self.client.chat.completions.create(
            model=settings.OPENROUTER_MODEL,
            messages=conversation,
            temperature=0.7,
            max_tokens=1500,
        )

        return (
            response.choices[0]
            .message
            .content
            or ""
        )


llm_service = LLMService()