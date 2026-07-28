import requests

class TelegramNotificationService:
    def __init__(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.api_url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"

    def send_signal_alert(self, signal_payload: dict) -> bool:
        """
        4/4 teknik ve temel uyum sağlandığında zengin içerikli Telegram mesajı atar.
        """
        message_text = (
            f"🎯 *BIST-TERMINAL: 4/4 ALIM SİNYALİ ONAYLANDI*\n\n"
            f"📌 *Hisse Senedi:* `{signal_payload.get('symbol', 'N/A')}`\n"
            f"💵 *Güncel Fiyat:* {signal_payload.get('price', 0.0):.2f} TL\n"
            f"📊 *Piotroski F-Skoru:* {signal_payload.get('piotroski_score', 0)}/9\n"
            f"📈 *Trend Durumu:* {signal_payload.get('technical_trend', 'N/A')}\n"
            f"📰 *Haber Duygusu:* {signal_payload.get('sentiment_label', 'N/A')} ({signal_payload.get('sentiment_score', 0.0):.2f})\n"
            f"⚡ *Hacim Artışı:* %{signal_payload.get('volume_surge', 0.0):.1f}\n\n"
            f"⏰ *Sinyal Zamanı:* {signal_payload.get('timestamp', 'N/A')}"
        )
        
        payload = {
            "chat_id": self.chat_id,
            "text": message_text,
            "parse_mode": "Markdown",
            "disable_web_page_preview": True
        }
        
        try:
            response = requests.post(self.api_url, json=payload, timeout=5)
            return response.status_code == 200
        except Exception:
            return False
