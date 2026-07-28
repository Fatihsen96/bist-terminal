from bist_manager import BISTUniverseManager

# Servisi başlatın
universe_mgr = BISTUniverseManager()

# Canlı hisse listesini çekin
live_symbols = universe_mgr.fetch_live_universe()

# Örnek: Bilinen sembollerle yeni IPO'ları tespit edin
known_symbols = {"THYAO", "GARAN", "ASELS"}  # Veritabanınızdaki mevcut liste
new_ipos = universe_mgr.detect_new_ipos(live_symbols, known_symbols)
