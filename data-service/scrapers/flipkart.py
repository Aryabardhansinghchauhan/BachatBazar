import os
import re
import urllib.parse
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
from scrapers.base import BaseScraper

class FlipkartScraper(BaseScraper):
    def __init__(self):
        super().__init__("Flipkart")
        self.affiliate_id = os.getenv("FLIPKART_AFFILIATE_ID", "")
        self.affiliate_token = os.getenv("FLIPKART_AFFILIATE_TOKEN", "")

    def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        # If Flipkart Affiliate API credentials are provided, use official API
        if self.affiliate_id and self.affiliate_token:
            return self._search_affiliate_api(query, limit)
        
        # Otherwise use web scraping fallback
        return self._search_web_scrape(query, limit)

    def _search_affiliate_api(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        try:
            url = f"https://affiliate-api.flipkart.net/affiliate/1.0/search.json?query={urllib.parse.quote(query)}&resultCount={limit}"
            headers = {
                "Fk-Affiliate-Id": self.affiliate_id,
                "Fk-Affiliate-Token": self.affiliate_token
            }
            res = self.session.get(url, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                products = []
                for item in data.get("products", [])[:limit]:
                    base_info = item.get("productBaseInfo", {}).get("productAttributes", {})
                    price = float(base_info.get("sellingPrice", {}).get("amount", 0))
                    mrp = float(base_info.get("maximumRetailPrice", {}).get("amount", price))
                    products.append({
                        "retailer": "flipkart",
                        "title": base_info.get("title", ""),
                        "url": base_info.get("productUrl", ""),
                        "currentPrice": price,
                        "mrp": mrp,
                        "discountPct": round(((mrp - price) / mrp) * 100) if mrp > price else 0,
                        "rating": float(base_info.get("rating", 4.2)),
                        "inStock": base_info.get("inStock", True),
                        "thumbnail": base_info.get("imageUrls", {}).get("400x400", ""),
                        "seller": "Flipkart Assured Seller",
                        "deliveryText": "Free Delivery"
                    })
                return products
        except Exception as e:
            print(f"[Flipkart Affiliate API] Error: {e}")
        
        return self._search_web_scrape(query, limit)

    def _search_web_scrape(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        encoded_query = urllib.parse.quote(query)
        search_url = f"https://www.flipkart.com/search?q={encoded_query}"
        html = self.fetch_html(search_url)
        results = []

        if html:
            soup = BeautifulSoup(html, "html.parser")
            # Flipkart search result card patterns (standard grid/row classes)
            cards = soup.select("div._75nlfW, div._1AtVbE, div._2kHMtA, div._1xHGtK, div[data-id]")
            
            for card in cards:
                if len(results) >= limit:
                    break
                try:
                    title_elem = card.select_one("div.KzDlHZ, a.s1Q9rs, div._4rR01T, a.wjcEIp")
                    price_elem = card.select_one("div.Nx9bqj, div._30jeq3")
                    mrp_elem = card.select_one("div.yRaY8j, div._3I9_wc")
                    discount_elem = card.select_one("div.UkUFwK, div._3Ay6Sb")
                    rating_elem = card.select_one("div.XQDdHH, div._3LWZlK")
                    link_elem = card.select_one("a[href]")
                    img_elem = card.select_one("img.DByuf4, img._396cs4")

                    if title_elem and price_elem:
                        title = title_elem.get_text(strip=True)
                        price_text = price_elem.get_text(strip=True).replace("₹", "").replace(",", "")
                        price = float(re.sub(r"[^\d.]", "", price_text)) if price_text else 0.0

                        mrp = price
                        if mrp_elem:
                            mrp_text = mrp_elem.get_text(strip=True).replace("₹", "").replace(",", "")
                            mrp = float(re.sub(r"[^\d.]", "", mrp_text)) if mrp_text else price

                        discount_pct = 0
                        if discount_elem:
                            disc_match = re.search(r"(\d+)%", discount_elem.get_text())
                            if disc_match:
                                discount_pct = int(disc_match.group(1))

                        rating = 4.2
                        if rating_elem:
                            try:
                                rating = float(rating_elem.get_text(strip=True))
                            except ValueError:
                                pass

                        product_url = f"https://www.flipkart.com{link_elem['href']}" if link_elem and link_elem.get("href", "").startswith("/") else (link_elem.get("href", "") if link_elem else "")
                        img_url = img_elem.get("src", "") if img_elem else ""

                        if title and price > 0:
                            results.append({
                                "retailer": "flipkart",
                                "title": title,
                                "url": product_url,
                                "currentPrice": price,
                                "mrp": mrp,
                                "discountPct": discount_pct or (round(((mrp - price)/mrp)*100) if mrp > price else 0),
                                "rating": rating,
                                "inStock": True,
                                "thumbnail": img_url,
                                "seller": "Flipkart Assured",
                                "deliveryText": "Free Delivery by Tomorrow"
                            })
                except Exception as ex:
                    continue

        return results

    def get_product_details(self, url: str) -> Optional[Dict[str, Any]]:
        html = self.fetch_html(url)
        if not html:
            return None
        
        soup = BeautifulSoup(html, "html.parser")
        try:
            title_elem = soup.select_one("span.VU-ZEz, span.B_NuCI")
            price_elem = soup.select_one("div.Nx9bqj.CxhGGd, div._30jeq3._16Jk6d")
            mrp_elem = soup.select_one("div.yRaY8j.A6+E6v, div._3I9_wc._2p6cM5")
            rating_elem = soup.select_one("div.XQDdHH, div._3LWZlK")
            
            title = title_elem.get_text(strip=True) if title_elem else ""
            price_text = price_elem.get_text(strip=True).replace("₹", "").replace(",", "") if price_elem else "0"
            price = float(re.sub(r"[^\d.]", "", price_text))
            
            mrp = price
            if mrp_elem:
                mrp_text = mrp_elem.get_text(strip=True).replace("₹", "").replace(",", "")
                mrp = float(re.sub(r"[^\d.]", "", mrp_text))

            return {
                "retailer": "flipkart",
                "title": title,
                "url": url,
                "currentPrice": price,
                "mrp": mrp,
                "discountPct": round(((mrp - price) / mrp) * 100) if mrp > price else 0,
                "rating": float(rating_elem.get_text(strip=True)) if rating_elem else 4.3,
                "inStock": True
            }
        except Exception as e:
            print(f"[Flipkart] get_product_details error: {e}")
            return None
