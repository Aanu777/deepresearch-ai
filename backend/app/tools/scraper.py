import trafilatura


class ScraperTool:

    def scrape(self, url: str):

        downloaded = trafilatura.fetch_url(url)

        if downloaded is None:
            return None

        text = trafilatura.extract(downloaded)

        return text


scraper_tool = ScraperTool()