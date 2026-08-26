import os
from datetime import datetime, timedelta
import random
from pymongo import MongoClient

SAMPLE_PRODUCTS = [
    {
        "name": "Apple iPhone 15 (128 GB) - Black",
        "slug": "apple-iphone-15-128gb-black",
        "brand": "Apple",
        "category": "Mobiles",
        "description": "Dynamic Island bubbles up alerts and Live Activities. 48MP Main camera with 2x Telephoto.",
        "thumbnail": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
        "images": ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80"],
        "specs": {"Display": "6.1 Super Retina XDR OLED", "Chip": "A16 Bionic", "Camera": "48MP Dual"},
        "sources": [
            {
                "retailer": "flipkart",
                "url": "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4",
                "currentPrice": 65999.0,
                "mrp": 79900.0,
                "discountPct": 17.0,
                "rating": 4.6,
                "inStock": True,
                "seller": "SuperComNet",
                "deliveryText": "Free Delivery by Tomorrow",
                "lastCheckedAt": datetime.utcnow()
            },
            {
                "retailer": "amazon",
                "url": "https://www.amazon.in/dp/B0CHX1W1XY",
                "currentPrice": 68900.0,
                "mrp": 79900.0,
                "discountPct": 14.0,
                "rating": 4.5,
                "inStock": True,
                "seller": "Appario Retail",
                "deliveryText": "Prime 1-Day Delivery",
                "lastCheckedAt": datetime.utcnow()
            }
        ],
        "cheapestSource": {"retailer": "flipkart", "price": 65999.0, "savingsVsMrp": 13901.0},
        "allTimeLow": {"price": 62999.0, "retailer": "flipkart", "date": datetime.utcnow() - timedelta(days=120)},
        "allTimeHigh": {"price": 79900.0, "retailer": "amazon", "date": datetime.utcnow() - timedelta(days=300)},
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "name": "Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones",
        "slug": "sony-wh-1000xm5-headphones",
        "brand": "Sony",
        "category": "Audio",
        "description": "Two processors and 8 microphones for unprecedented noise cancellation.",
        "thumbnail": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
        "images": ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80"],
        "specs": {"Battery": "30 Hours ANC On", "Drivers": "30mm Carbon Fiber", "Connectivity": "Bluetooth 5.2 LDAC"},
        "sources": [
            {
                "retailer": "amazon",
                "url": "https://www.amazon.in/dp/B09XS7JWHH",
                "currentPrice": 26990.0,
                "mrp": 34990.0,
                "discountPct": 23.0,
                "rating": 4.6,
                "inStock": True,
                "seller": "Amazon Retail",
                "deliveryText": "Prime Delivery",
                "lastCheckedAt": datetime.utcnow()
            },
            {
                "retailer": "flipkart",
                "url": "https://www.flipkart.com/sony-wh-1000xm5-bluetooth-headset/p/itmd5b9f7a77e1ab",
                "currentPrice": 29990.0,
                "mrp": 34990.0,
                "discountPct": 14.0,
                "rating": 4.4,
                "inStock": True,
                "seller": "RetailNet",
                "deliveryText": "Free Delivery in 2 days",
                "lastCheckedAt": datetime.utcnow()
            }
        ],
        "cheapestSource": {"retailer": "amazon", "price": 26990.0, "savingsVsMrp": 8000.0},
        "allTimeLow": {"price": 24999.0, "retailer": "amazon", "date": datetime.utcnow() - timedelta(days=90)},
        "allTimeHigh": {"price": 34990.0, "retailer": "flipkart", "date": datetime.utcnow() - timedelta(days=200)},
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

def seed_mongo():
    try:
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/bachat_bazar")
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
        db = client.get_database()
        
        products_col = db["products"]
        history_col = db["pricehistories"]

        products_col.delete_many({})
        history_col.delete_many({})

        result = products_col.insert_many(SAMPLE_PRODUCTS)
        inserted_ids = result.inserted_ids

        history_items = []
        for pid, prod in zip(inserted_ids, SAMPLE_PRODUCTS):
            for src in prod["sources"]:
                base = src["currentPrice"]
                for d in range(180, 0, -7):
                    checked = datetime.utcnow() - timedelta(days=d)
                    p = round((base * (1 + random.uniform(-0.06, 0.06))) / 50) * 50
                    history_items.append({
                        "productId": pid,
                        "retailer": src["retailer"],
                        "price": float(p),
                        "checkedAt": checked
                    })
                history_items.append({
                    "productId": pid,
                    "retailer": src["retailer"],
                    "price": float(base),
                    "checkedAt": datetime.utcnow()
                })

        if history_items:
            history_col.insert_many(history_items)

        return {"success": True, "productsCount": len(SAMPLE_PRODUCTS), "historyCount": len(history_items)}
    except Exception as e:
        return {"success": False, "error": str(e)}
