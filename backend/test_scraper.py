from app.tools.scraper import scraper_tool

text = scraper_tool.scrape(
    "https://arxiv.org/html/2508.12752v1"
)

print(text[:2000])