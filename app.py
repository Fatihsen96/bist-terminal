import streamlit as st
import pandas as pd
import yfinance as yf
from bist_manager import BISTUniverseManager
from kap_manager import KAPLiveNewsEngine
from nlp_analyzer import FinancialTextNLPAnalyzer

# Sayfa Yapılandırması
st.set_page_config(
    page_title="BIST Market Terminal",
    page_icon="📈",
    layout="wide"
)

st.title("📈 BIST Market & Sinyal Terminali")
st.caption("Streamlit tabanlı canlı hisse analiz ve filtreleme platformu")

# NLP Analiz Motorunu Başlatıyoruz
nlp = FinancialTextNLPAnalyzer()

# ---------------------------------------------------------
# 1. Dinamik Hisse Evreni Servisi
# ---------------------------------------------------------
@st.cache_data(ttl=3600)  # Hisse listesini saatte 1 kez günceller
def get_live_tickers():
    """BISTUniverseManager üzerinden güncel sembolleri çeker ve yfinance formatına getirir."""
    manager = BISTUniverseManager()
    symbols = manager.fetch_live_universe()
    
    # Servis yanıt vermezse yedek liste
    if not symbols:
        symbols = {"THYAO", "GARAN", "ASELS", "EREGL", "KCHOL", "BIMAS"}
        
    # Yahoo Finance için BIST hisselerinin sonuna .IS ekliyoruz
    return sorted([f"{sym}.IS" for sym in symbols])

# Kenar Çubuğu (Sidebar)
st.sidebar.header("Filtreler & Ayarlar")
market_type = st.sidebar.selectbox("Pazar Seçimi", ["Dinamik BIST Evreni", "Örnek Takip Listesi"])

if market_type == "Dinamik BIST Evreni":
    tickers_to_fetch = get_live_tickers()
    st.sidebar.success(f"Canlı Evren: {len(tickers_to_fetch)} hisse aktif.")
else:
    tickers_to_fetch = ["THYAO.IS", "GARAN.IS", "ASELS.IS", "EREGL.IS", "KCHOL.IS", "BIMAS.IS"]

# ---------------------------------------------------------
# 2. Veri Çekme Alanı
# ---------------------------------------------------------
st.subheader("1. Hisse Veri Akışı")

@st.cache_data(ttl=300)
def fetch_bist_data(tickers):
    data_list = []
    # Arayüz hızını korumak için ilk aşamada ilk 50 hisseyi çekiyoruz
    for ticker in tickers[:50]:
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period="5d")
            if not hist.empty and len(hist) >= 2:
                last_price = hist['Close'].iloc[-1]
                prev_price = hist['Close'].iloc[-2]
                change_pct = ((last_price - prev_price) / prev_price) * 100
                data_list.append({
                    "Hisse": ticker.replace(".IS", ""),
                    "Son Fiyat (TL)": round(last_price, 2),
                    "Günlük Değişim (%)": round(change_pct, 2),
                    "Hacim": hist['Volume'].iloc[-1]
                })
        except Exception:
            continue
    return pd.DataFrame(data_list)

with st.spinner("BIST verileri güncelleniyor..."):
    df_stocks = fetch_bist_data(tickers_to_fetch)

st.dataframe(df_stocks, use_container_width=True)

# ---------------------------------------------------------
# 3. İstatistik Özetleri
# ---------------------------------------------------------
st.subheader("2. Pazar Özeti")
col1, col2, col3 = st.columns(3)
col1.metric("Listelenen Hisse", len(df_stocks))

if not df_stocks.empty:
    top_gainer = df_stocks.sort_values(by="Günlük Değişim (%)", ascending=False).iloc[0]
    col2.metric("En Çok Yükselen", top_gainer["Hisse"], f"%{top_gainer['Günlük Değişim (%)']}")
    
    top_loser = df_stocks.sort_values(by="Günlük Değişim (%)", ascending=True).iloc[0]
    col3.metric("En Çok Düşen", top_loser["Hisse"], f"%{top_loser['Günlük Değişim (%)']}")

# ---------------------------------------------------------
# 4. Canlı KAP Bildirim Akışı ve NLP Duygu Analizi
# ---------------------------------------------------------
st.markdown("---")
st.subheader("3. Canlı KAP Bildirim Akışı ve Duygu Analizi")

@st.cache_data(ttl=60)  # KAP haberlerini dakikada 1 kez günceller
def fetch_kap_news():
    engine = KAPLiveNewsEngine()
    return engine.fetch_latest_disclosures()

with st.spinner("KAP bildirimleri ve NLP analizi yükleniyor..."):
    kap_news = fetch_kap_news()

if kap_news:
    for item in kap_news[:10]:  # Ekranı yormamak için son 10 bildirimi gösteriyoruz
        stock_code = item.get("stockCodes", "GENEL")
        title = item.get("title", "KAP Bildirimi")
        summary = item.get("summary", "Özet açıklaması bulunmuyor.")
        
        # NLP Duygu Analizi Skorlama
        score = nlp.analyze_sentiment(title, summary)
        sentiment_label = nlp.get_sentiment_label(score)
        
        with st.expander(f"📌 [{stock_code}] {title} | {sentiment_label}"):
            st.write(f"**Duygu / Etki Skoru:** `{score}`")
            st.write(f"**Açıklama Özeti:** {summary}")
else:
    st.info("Şu an için yeni bir KAP bildirimi bulunmuyor veya canlı akış bekleniyor.")
