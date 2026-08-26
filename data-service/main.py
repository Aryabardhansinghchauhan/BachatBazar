import os
import re
from fastapi import FastAPI, BackgroundTasks, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Optional, List

from schemas.product import ScrapeSearchRequest, ScrapeUrlRequest, NormalizedProductSchema
from scrapers.flipkart import FlipkartScraper
from scrapers.amazon import AmazonScraper
from jobs.price_refresher import refresh_all_prices
from jobs.seed_service import seed_mongo

load_dotenv()

app = FastAPI(
    title="Bachat Bazar Data Service",
    description="Microservice for scraping, normalizing, and synchronizing Indian e-commerce prices (Flipkart, Amazon)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

flipkart_scraper = FlipkartScraper()
amazon_scraper = AmazonScraper()

@app.get("/")
def read_root():
    return {
        "service": "Bachat Bazar Data & Scraping Microservice",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": os.getenv("TZ", "IST"),
        "scrapers": ["flipkart", "amazon"]
    }

@app.post("/api/scrape/search")
def search_and_compare(req: ScrapeSearchRequest):
    """
    Searches both Flipkart and Amazon for a product term,
    normalizes into a unified schema, and calculates best deal.
    """
    q = req.query.strip()
    if not q:
        return {"success": True, "results": []}

    fk_results = flipkart_scraper.search(q, limit=req.limit or 5)
    amz_results = amazon_scraper.search(q, limit=req.limit or 5)

    combined_results = []

    # Map results by normalized title similarity or pair primary results
    max_len = max(len(fk_results), len(amz_results))
    
    for i in range(max_len):
        fk_item = fk_results[i] if i < len(fk_results) else None
        amz_item = amz_results[i] if i < len(amz_results) else None

        sources = []
        if fk_item:
            sources.append(fk_item)
        if amz_item:
            sources.append(amz_item)

        if not sources:
            continue

        primary = fk_item or amz_item
        title = primary["title"]
        slug = re.sub(r'[^a-zA-Z0-9]+', '-', title.lower()).strip('-')

        cheapest = min(sources, key=lambda s: s["currentPrice"])
        max_mrp = max([s.get("mrp", s["currentPrice"]) for s in sources] or [cheapest["currentPrice"]])

        combined_results.append({
            "name": title,
            "slug": slug,
            "thumbnail": primary.get("thumbnail"),
            "category": req.category or "Electronics",
            "sources": sources,
            "cheapestSource": {
                "retailer": cheapest["retailer"],
                "price": cheapest["currentPrice"],
                "savingsVsMrp": max(0, max_mrp - cheapest["currentPrice"])
            }
        })

    return {
        "success": True,
        "query": q,
        "total": len(combined_results),
        "results": combined_results
    }

@app.post("/api/scrape/product")
def get_product_details(req: ScrapeUrlRequest):
    """Scrapes live price and specs directly from a product URL"""
    url = req.url.lower()
    result = None
    if "flipkart.com" in url or req.retailer == "flipkart":
        result = flipkart_scraper.get_product_details(req.url)
    elif "amazon.in" in url or "amazon.com" in url or req.retailer == "amazon":
        result = amazon_scraper.get_product_details(req.url)
    else:
        raise HTTPException(status_code=400, detail="Unsupported retailer URL. Supported: Flipkart, Amazon.")

    if not result:
        raise HTTPException(status_code=404, detail="Could not extract product details from URL.")

    return {"success": True, "data": result}

@app.post("/api/sync/refresh-prices")
def trigger_price_refresh(background_tasks: BackgroundTasks):
    """Triggers asynchronous price refresh job for all tracked products"""
    background_tasks.add_task(refresh_all_prices)
    return {
        "success": True,
        "message": "Background price refresh initiated for catalog products."
    }

@app.post("/api/seed")
def seed_data_endpoint():
    """Seeds initial product and 6-month price history catalog into MongoDB"""
    res = seed_mongo()
    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
