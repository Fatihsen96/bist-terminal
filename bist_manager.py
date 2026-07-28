import requests
import pandas as pd

class BISTUniverseManager:
    def __init__(self):
        self.base_isyatirim_url = "https://www.isyatirim.com.tr/_layouts/15/IsYatirim.TradableAssets/TradableAssets.aspx"
        self.cached_symbols = set()

    def fetch_live_universe(self) -> set:
        """
        Borsa İstanbul'da işlem gören güncel tüm hisse senetlerinin sembollerini 
        dinamik olarak çeker ve küme (set) olarak döndürür.
        """
        try:
            response = requests.get(self.base_isyatirim_url, timeout=10)
            if response.status_code == 200:
                df_assets = pd.read_html(response.text)[0] if "table" in response.text else pd.DataFrame()
                if not df_assets.empty and "Kod" in df_assets.columns:
                    live_symbols = set(df_assets["Kod"].dropna().str.strip().unique())
                    return live_symbols
        except Exception:
            pass
        
        return self._fetch_fallback_universe()

    def _fetch_fallback_universe(self) -> set:
        """
        Birincil servisin aksaması durumunda alternatif borsa API uç noktasını sorgular.
        """
        fallback_url = "https://garantibbvayatirim.com.tr/api/stock/getall"
        try:
            res = requests.get(fallback_url, timeout=5)
            if res.status_code == 200:
                data = res.json()
                return {item["symbol"] for item in data if item.get("market") == "BIST"}
        except Exception:
            pass
        return self.cached_symbols

    def detect_new_ipos(self, current_universe: set, known_universe: set) -> set:
        """
        Yeni halka arz edilen (IPO) hisseleri küme farkı (set difference) ile tespit eder.
        """
        new_ipos = current_universe - known_universe
        return new_ipos
