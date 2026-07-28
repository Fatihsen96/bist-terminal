import re

class FinancialTextNLPAnalyzer:
    def __init__(self):
        # BIST jargonuna özel pozitif ve negatif anahtar kelime matrisi
        self.positive_keywords = {
            "yeni iş ilişkisi": 2.5, "ciroya olumlu etki": 2.0, "ihale kazanıldı": 2.0,
            "kar artışı": 1.5, "pay alımı": 1.5, "sermaye artırımı": 1.0, "ihracat sözleşmesi": 2.0,
            "anlaşma sağlandı": 1.5, "sipariş alındı": 2.0, "bedelsiz": 1.0
        }
        self.negative_keywords = {
            "dava açıldı": -2.0, "zarar açıklandı": -2.0, "üretim durdurulması": -2.5,
            "konkordato": -3.0, "ceza uygulandı": -1.5, "pay satışı": -1.0,
            "iptal edildi": -2.0, "iflas": -3.0
        }

    def analyze_sentiment(self, title: str, summary: str) -> float:
        """
        KAP metnini analiz ederek -1.0 ile +1.0 arasında duygu skoru üretir.
        """
        text = f"{title} {summary}".lower()
        score = 0.0
        
        for kw, weight in self.positive_keywords.items():
            if re.search(r'\b' + re.escape(kw) + r'\b', text):
                score += weight
                
        for kw, weight in self.negative_keywords.items():
            if re.search(r'\b' + re.escape(kw) + r'\b', text):
                score += weight

        # Skor [-1.0, 1.0] aralığına normalize edilir
        normalized_score = max(-1.0, min(1.0, score / 3.0))
        return round(normalized_score, 2)

    def get_sentiment_label(self, score: float) -> str:
        """Skora göre görsel etiket ve emoji döndürür."""
        if score >= 0.2:
            return f"🟢 Pozitif ({score})"
        elif score <= -0.2:
            return f"🔴 Negatif ({score})"
        else:
            return f"⚪ Nötr ({score})"
