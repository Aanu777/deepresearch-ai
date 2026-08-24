from tavily import TavilyClient

from app.core.config import settings


client = TavilyClient(api_key=settings.TAVILY_API_KEY)


class SearchTool:

    def search(self, query: str):

        results = client.search(
            query=query,
            search_depth="advanced",
            max_results=5,
        )

        return results


search_tool = SearchTool()