from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class RetailerSourceSchema(BaseModel):
    retailer: str = Field(..., description="flipkart, amazon, croma, or reliance")
    url: str
    currentPrice: float
    mrp: Optional[float] = 0.0
    discountPct: Optional[float] = 0.0
    rating: Optional[float] = 0.0
    inStock: bool = True
    seller: Optional[str] = "Verified Seller"
    deliveryText: Optional[str] = "Standard Delivery"
    lastCheckedAt: datetime = Field(default_factory=datetime.utcnow)

class CheapestSourceSchema(BaseModel):
    retailer: str
    price: float
    savingsVsMrp: float = 0.0

class NormalizedProductSchema(BaseModel):
    name: str
    slug: str
    brand: Optional[str] = ""
    category: str = "Electronics"
    description: Optional[str] = ""
    images: List[str] = []
    thumbnail: Optional[str] = ""
    specs: Dict[str, str] = {}
    sources: List[RetailerSourceSchema] = []
    cheapestSource: Optional[CheapestSourceSchema] = None

class ScrapeSearchRequest(BaseModel):
    query: str
    category: Optional[str] = "All"
    limit: Optional[int] = 10

class ScrapeUrlRequest(BaseModel):
    url: str
    retailer: Optional[str] = None

class PriceHistoryItem(BaseModel):
    productId: str
    retailer: str
    price: float
    checkedAt: datetime = Field(default_factory=datetime.utcnow)
