import re
import urllib.parse
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
from scrapers.base import BaseScraper

class AmazonScraper(BaseScraper):
    def __init__(self):
        super().__init__("Amazon")

    def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        encoded_query = urllib.parse.quote(query)
        search_url = f"https://www.amazon.in/s?k={encoded_query}"
        html = self.fetch_html(search_url)
        results = []

        if html:
            soup = BeautifulSoup(html, "html.parser")
            # Amazon product card containers
            cards = soup.select("div[data-component-type='s-search-result']")

            for card in cards:
                if len(results) >= limit:
                    break
                try:
                    title_elem = card.select_one("h2 a span, h2 span")
                    price_whole = card.select_one("span.a-price-whole")
                    mrp_elem = card.select_one("span.a-price.a-text-price span.a-offscreen")
                    rating_elem = card.select_one("span.a-icon-alt")
                    link_elem = card.select_one("h2 a.a-link-normal, a.a-link-normal.s-no-outline")
                    img_elem = card.select_one("img.s-image")
                    prime_badge = card.select_one("i.a-icon-prime")

                    if title_elem and price_whole:
                        title = title_elem.get_text(strip=True)
                        price_text = price_whole.get_text(strip=True).replace(",", "").replace(".", "")
                        price = float(re.sub(r"[^\d.]", "", price_text)) if price_text else 0.0

                        mrp = price
                        if mrp_elem:
                            mrp_text = mrp_elem.get_text(strip=True).replace("₹", "").replace(",", "")
                            mrp = float(re.sub(r"[^\d.]", "", mrp_text)) if mrp_text else price

                        rating = 4.3
                        if rating_elem:
                            rating_match = re.search(r"([\d.]+)\s*out of 5", rating_elem.get_text())
                            if rating_match:
                                rating = float(rating_match.group(1))

                        href = link_elem["href"] if link_elem and "href" in link_elem.attrs else ""
                        product_url = f"https://www.amazon.in{href}" if href.startswith("/") else href
                        img_url = img_elem.get("src", "") if img_elem else ""

                        if title and price > 0:
                            results.append({
                                "retailer": "amazon",
                                "title": title,
                                "url": product_url,
                                "currentPrice": price,
                                "mrp": mrp,
                                "discountPct": round(((mrp - price) / mrp) * 100) if mrp > price else 0,
                                "rating": rating,
                                "inStock": True,
                                "thumbnail": img_url,
                                "seller": "Amazon Verified Merchant",
                                "deliveryText": "Prime Free Delivery" if prime_badge else "Standard Delivery"
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
            title_elem = soup.select_one("#productTitle")
            price_elem = soup.select_one(".apexPriceToPay span.a-price-whole, #corePrice_feature_div span.a-price-whole")
            mrp_elem = soup.select_one(".basisPrice span.a-price.a-text-price span.a-offscreen")
            rating_elem = soup.select_one("#acrPopover span.a-icon-alt")
            
            title = title_elem.get_text(strip=True) if title_elem else ""
            price_text = price_elem.get_text(strip=True).replace(",", "").replace(".", "") if price_elem else "0"
            price = float(re.sub(r"[^\d.]", "", price_text))
            
            mrp = price
            if mrp_elem:
                mrp_text = mrp_elem.get_text(strip=True).replace("₹", "").replace(",", "")
                mrp = float(re.sub(r"[^\d.]", "", mrp_text))

            return {
                "retailer": "amazon",
                "title": title,
                "url": url,
                "currentPrice": price,
                "mrp": mrp,
                "discountPct": round(((mrp - price) / mrp) * 100) if mrp > price else 0,
                "rating": 4.5,
                "inStock": True
            }
        except Exception as e:
            print(f"[Amazon] get_product_details error: {e}")
            return None
