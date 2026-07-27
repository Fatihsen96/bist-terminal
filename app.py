import streamlit as st
import pandas as pd
import yfinance as yf

# Sayfa Yapılandırması
st.set_page_config(
    page_title="BIST Market Terminal",
    page_icon="📈",
    layout="wide"
)

st.title("📈 BIST Market & Sinyal Terminali")
st.caption("Streamlit tabanlı canlı hisse analiz ve filtreleme platformu")

# Kenar Çubuğu (Sidebar)
st.sidebar.header("Filtreler & Ayarlar")
market_type = st.sidebar.selectbox("Pazar Seçimi", ["BIST ALL", "BIST 100", "BIST 30"])

# Veri Çekme Test Alanı
st.subheader("1. Hisse Veri Akışı Testi")

# Örnek BIST Sembol Listesi (Arkadaşınız buradaki listeyi genişletebilir/düzenleyebilir)
sample_tickers = ["THYAO.IS", "GARAN.IS", "ASELS.IS", "EREGL.IS", "KCHOL.IS", "BIMAS.IS"]

@st.cache_data(ttl=300)
def fetch_bist_data(tickers):
    data_list = []
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period="5d")
            if not hist.empty:
                last_price = hist['Close'].iloc[-1]
                prev_price = hist['Close'].iloc[-2]
                change_pct = ((last_price - prev_price) / prev_price) * 100
                data_list.append({
                    "Hisse": ticker.replace(".IS", ""),
                    "Son Fiyat (TL)": round(last_price, 2),
                    "Günlük Değişim (%)": round(change_pct, 2),
                    "Hacim": hist['Volume'].iloc[-1]
                })
        except Exception as e:
            continue
    return pd.DataFrame(data_list)

with st.spinner("BIST verileri güncelleniyor..."):
    df_stocks = fetch_bist_data(sample_tickers)

st.dataframe(df_stocks, use_container_width=True)

# İstatistik Özetleri
st.subheader("2. Pazar Özeti")
col1, col2, col3 = st.columns(3)
col1.metric("Takip Edilen Hisse", len(df_stocks))
if not df_stocks.empty:
    top_gainer = df_stocks.sort_values(by="Günlük Değişim (%)", ascending=False).iloc[0]
    col2.metric("En Çok Yükselen", top_gainer["Hisse"], f"%{top_gainer['Günlük Değişim (%)']}")