import os
from datetime import datetime
from pymongo import MongoClient
from scrapers.flipkart import FlipkartScraper
from scrapers.amazon import AmazonScraper

def get_mongo_db():
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/bachat_bazar")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
    return client.get_database()

def refresh_all_prices():
    """Iterates tracked products in DB, scrapes latest prices and saves PriceHistory"""
    try:
        db = get_mongo_db()
        products_col = db["products"]
        history_col = db["pricehistories"]

        products = list(products_col.find({}))
        print(f"🔄 Starting background price refresh for {len(products)} products...")

        flipkart_scraper = FlipkartScraper()
        amazon_scraper = AmazonScraper()

        updated_count = 0

        for product in products:
            product_id = product["_id"]
            sources = product.get("sources", [])
            modified = False

            for src in sources:
                retailer = src.get("retailer")
                url = src.get("url")
                
                details = None
                if retailer == "flipkart":
                    details = flipkart_scraper.get_product_details(url)
                elif retailer == "amazon":
                    details = amazon_scraper.get_product_details(url)

                if details and details.get("currentPrice"):
                    new_price = details["currentPrice"]
                    if new_price != src.get("currentPrice"):
                        src["currentPrice"] = new_price
                        src["lastCheckedAt"] = datetime.utcnow()
                        modified = True

                        # Add new PriceHistory point
                        history_col.insert_one({
                            "productId": product_id,
                            "retailer": retailer,
                            "price": new_price,
                            "checkedAt": datetime.utcnow()
                        })

            if modified:
                # Recalculate cheapest source
                valid_sources = [s for s in sources if s.get("inStock", True) and s.get("currentPrice", 0) > 0]
                if valid_sources:
                    cheapest = min(valid_sources, key=lambda s: s["currentPrice"])
                    max_mrp = max([s.get("mrp", s["currentPrice"]) for s in sources] or [cheapest["currentPrice"]])
                    products_col.update_one(
                        {"_id": product_id},
                        {
                            "$set": {
                                "sources": sources,
                                "cheapestSource": {
                                    "retailer": cheapest["retailer"],
                                    "price": cheapest["currentPrice"],
                                    "savingsVsMrp": max(0, max_mrp - cheapest["currentPrice"])
                                }
                            }
                        }
                    )
                updated_count += 1

        print(f"✅ Price refresh completed. {updated_count} products updated.")
        return {"success": True, "updatedCount": updated_count}
    except Exception as e:
        print(f"❌ Error refreshing prices: {e}")
        return {"success": False, "error": str(e)}
