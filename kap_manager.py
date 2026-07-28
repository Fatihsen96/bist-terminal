import time
import requests
from typing import List, Dict, Any

class KAPLiveNewsEngine:
    def __init__(self, last_index: int = 0):
        self.last_processed_index = last_index
        self.kap_api_url = "https://www.kap.org.tr/tr/api/disclosures"

    def fetch_latest_disclosures(self) -> List[Dict[str, Any]]:
        """
        Son işlenen indeksten sonra KAP'a düşen yeni bildirimleri getirir.
        """
        params = {
            "fromDate": time.strftime("%Y-%m-%d"),
            "disclosureTypes": "ODA,FR"  # Özel Durum Açıklamaları ve Finansal Raporlar
        }
        try:
            response = requests.get(self.kap_api_url, params=params, timeout=10)
            if response.status_code == 200:
                disclosures = response.json()
                new_items = [d for d in disclosures if d.get("disclosureIndex", 0) > self.last_processed_index]
                if new_items:
                    self.last_processed_index = max(d.get("disclosureIndex", 0) for d in new_items)
                return new_items
        except Exception:
            pass
        return []
