import requests
import random
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1"
]

class BaseScraper(ABC):
    def __init__(self, name: str):
        self.name = name
        self.session = requests.Session()

    def get_headers(self) -> Dict[str, str]:
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0"
        }

    def fetch_html(self, url: str, retries: int = 2) -> Optional[str]:
        for attempt in range(retries + 1):
            try:
                headers = self.get_headers()
                response = self.session.get(url, headers=headers, timeout=10)
                if response.status_code == 200:
                    return response.text
                elif response.status_code == 429:
                    time.sleep(1.5 * (attempt + 1))
            except Exception as e:
                print(f"[{self.name}] Attempt {attempt + 1} failed for {url}: {e}")
                time.sleep(1.0)
        return None

    @abstractmethod
    def search(self, query: str, limit: int = 5) -> list:
        pass

    @abstractmethod
    def get_product_details(self, url: str) -> Optional[Dict[str, Any]]:
        pass
