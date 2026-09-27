from urllib.parse import urlparse

from tavily import TavilyClient

from app.core.config import settings


client = TavilyClient(
    api_key=settings.TAVILY_API_KEY
)


class SearchTool:

    @staticmethod
    def _domain(
        url: str,
    ) -> str:

        try:
            return (
                urlparse(
                    url
                )
                .hostname
                or ""
            ).lower().removeprefix(
                "www."
            )

        except Exception:
            return ""

    def soft_rerank(
        self,
        items: list,
        preferred_domains: list[str] | None,
    ) -> list:

        if not preferred_domains:
            return list(
                items
            )

        preferred = {
            domain
            .strip()
            .lower()
            .removeprefix(
                "www."
            )
            for domain
            in preferred_domains
            if domain.strip()
        }

        def preference_rank(
            item,
        ) -> int:

            if not isinstance(
                item,
                dict,
            ):
                return 1

            domain = (
                self._domain(
                    str(
                        item.get(
                            "url",
                            "",
                        )
                    )
                )
            )

            if not domain:
                return 1

            if domain in preferred:
                return 0

            if any(
                domain.endswith(
                    "." + candidate
                )
                for candidate
                in preferred
            ):
                return 0

            return 1

        return sorted(
            items,
            key=preference_rank,
        )

    def search(
        self,
        query: str,
        *,
        preferred_domains: list[str] | None = None,
    ):

        results = client.search(
            query=query,
            search_depth="advanced",
            max_results=5,
        )

        items = results.get(
            "results",
            [],
        )

        if not isinstance(
            items,
            list,
        ):
            return results

        results[
            "results"
        ] = self.soft_rerank(
            items,
            preferred_domains,
        )

        return results


search_tool = SearchTool()
