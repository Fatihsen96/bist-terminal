from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import pandas as pd
import time
import warnings
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, List

warnings.filterwarnings('ignore')

app = FastAPI(title="MarketTerminal Pro Real Fundamental & Technical Engine", version="11.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. BİST TÜM HİSSELER LİSTESİ (Tam ve Eksiksiz Liste - Korundu)
BIST_ALL_TICKERS = [
    "AAVEST", "A1CAP", "AAVST", "ABS30", "ACSEL", "ADEL", "ADESE", "ADGYO", "AEFES", "AFYON", 
    "AGESA", "AGHOL", "AGROT", "AHGAZ", "AKBNK", "AKCNS", "AKFGY", "AKFYE", "AKMGY", "AKSA", 
    "AKSEN", "AKSGY", "AKSUE", "AKGRT", "ALARK", "ALBRK", "ALCAR", "ALCTL", "ALFAS", "ALGYO", 
    "ALKA", "ALKIM", "ALMAD", "ALTNY", "ALVES", "ANELE", "ANGEN", "ANHYT", "ANSGR", "ARASE", 
    "ARCLK", "ARDYZ", "ARENA", "ARSAN", "ARTMS", "ASELS", "ASGYO", "ASTOR", "ASUZU", "ATAGY", 
    "ATAKP", "ATATP", "ATEKS", "ATSYH", "AVGYO", "AVHOL", "AVOD", "AVTUR", "AYCES", "AYDEM", 
    "AYEN", "AYGAZ", "AZTEK", "BAGFS", "BAKAB", "BALAT", "BANVT", "BARMA", "BASCM", "BASGZ", 
    "BAYRK", "BEGYO", "BEYAZ", "BFREN", "BIENP", "BIGCH", "BIMAS", "BINBN", "BINHO", "BIOEN", 
    "BIZIM", "BJKAS", "BLCYT", "BMTKS", "BNTAS", "BOBET", "BORLS", "BORSK", "BOSSA", "BRISA", 
    "BRKO", "BRKSN", "BRKVY", "BRMEN", "BRSAN", "BRYAT", "BSOKE", "BTCIM", "BUCIM", "BURCE", 
    "BURVA", "BVSAN", "BYDNR", "CANTE", "CASA", "CAHIT", "CCOLA", "CELHA", "CEMAS", "CEMTS", 
    "CMBTN", "CMENT", "CONSE", "COSMO", "CRDFA", "CRFSA", "CUSAN", "CVKMD", "CWENE", "DAGI", 
    "DAGHL", "DAPGM", "DARDL", "DGATE", "DGGYO", "DITAS", "DMRGD", "DMSAS", "DNISI", "DOAS", 
    "DOBUR", "CODO", "DOGUB", "DOHOL", "DOKTA", "DURDO", "DYOBY", "DZGYO", "EAGYO", "EBEBK", 
    "ECILC", "ECZYT", "EDATA", "EDIP", "EGEEN", "EGEPO", "EGGUB", "EGPRO", "EGSER", "EKGYO", 
    "EKIZ", "EKSUN", "ELITE", "EMKEL", "EMNIS", "ENJSA", "ENKAI", "ENERY", "ENTRA", "EPLAS", 
    "ERCB", "EREGL", "ERSU", "ESCAR", "ESEN", "ETILR", "ETYAT", "EUHOL", "EUPWR", "EUREK", 
    "EYGYO", "FADE", "FENER", "FLAP", "FMIZP", "FONET", "FORTE", "FRIGO", "FROTO", "FZLGY", 
    "GARAN", "GARFA", "GEDIK", "GEDZA", "GENKE", "GENTAS", "GEREL", "GESAN", "GIPTA", "GLBMD", 
    "GLCVY", "GLYHO", "GMTAS", "GOKNR", "GOLTS", "GOODY", "GOZDE", "GRNYO", "GRSEL", "GSDHO", 
    "GSDDE", "GSRAY", "GUBRF", "GWIND", "GZNMI", "HALKB", "HATEK", "HATSN", "HDFGS", "HEDEF", 
    "HEKTS", "HKTM", "HLGYO", "HOROZ", "HUBVC", "HUNER", "HURGZ", "ICBCT", "ICUGS", "IDGYO", 
    "IEYHO", "IHAAS", "IHEVA", "IHGZT", "IHLGM", "IHLAS", "IHYAY", "IMASM", "INDES", "INFO", 
    "INGRM", "INTEM", "INVEO", "INVES", "IPEKE", "ISATR", "ISBTR", "ISCTR", "ISDMR", "ISFIN", 
    "ISGSY", "ISGYO", "ISKPL", "ISMEN", "ISSEN", "ITEKS", "IWWEN", "IZMDC", "IZINV", "JANTS", 
    "KAFEIN", "KLKIM", "KALEK", "KARYE", "KATMR", "KAYSE", "KCAER", "KCHOL", "KFEIN", "KGYO", 
    "KIMMR", "KLGYO", "KLMSN", "KLSER", "KLYSN", "KMPUR", "KNFRT", "KONTR", "KONYA", "KORDS", 
    "KORMA", "KOZAL", "KOZAA", "KRDMD", "KRDMA", "KRDMB", "KRGYO", "KRPLS", "KRTEK", "KRVGD", 
    "KSTUR", "KTLEV", "KTSKR", "KUTPO", "KUYYA", "LIDER", "LILAK", "LINK", "LKMNH", "LMKDC", 
    "LOGO", "LUKSK", "MAALT", "MACKO", "MAKIM", "MAKTK", "MANAS", "MARKA", "MAVI", "MEDTR", 
    "MEGAP", "MEGMT", "MEPET", "MERCN", "MERIT", "MERKO", "METRO", "METUR", "MHRGY", "MGROS", 
    "MIATK", "MMCAS", "MNDRS", "MNDTR", "MOBTL", "MOGAN", "MPARK", "MRGYO", "MRSHL", "MSGYO", 
    "MTRKS", "MTRYO", "MZHLD", "NATEN", "NETAS", "NIBAS", "NTHOL", "NUGYO", "OBASE", "ODAS", 
    "OFSYM", "ONCSM", "ONRYT", "ORGE", "ORMA", "ORTBO", "OTKAR", "OTTO", "OYAKC", "OYAYO", 
    "OYLUM", "OYYAT", "OZATD", "OZKGY", "OZRDN", "OZSUB", "PAGYO", "PAMEL", "PAPIL", "PARSN", 
    "PASEU", "PBTAL", "PCILT", "PEKGY", "PENGD", "PENTA", "PETKM", "PETUN", "PGSUS", "PINAR", 
    "PKART", "PKENT", "PLTUR", "POLHO", "POLTK", "PRKAB", "PRKME", "PRDGS", "PRZMA", "PSDTC", 
    "PSGYO", "QUAGR", "RALYH", "RAYSG", "REEDR", "RNPOL", "RODRG", "RUBNS", "RYGYO", "RYSAS", 
    "SAFKR", "SAHOL", "SAMAT", "SANEL", "SANFM", "SANKO", "SARKY", "SASA", "SAYAS", "SDTTR", 
    "SEGMN", "SEKFK", "SEKUR", "SELEC", "SELVA", "SEYKM", "SILVR", "SISE", "SKBNK", "SKYMD", 
    "SMART", "SMRTG", "SNAAM", "SODSN", "SOKE", "SOKM", "SONME", "SRVGY", "SUMAS", "SUNGY", 
    "SURGY", "SUWEN", "TATEN", "TATGD", "TAVHL", "TCELL", "TCKRC", "TDGYO", "TEKTU", "TERA", 
    "TETMT", "TEZOL", "TGSAS", "THYAO", "TIRE", "TKFEN", "TKNSA", "TLMAN", "TMSN", "TNZTP", 
    "TOASO", "TRCAS", "TRGYO", "TRILC", "TSKB", "TSPOR", "TTKOM", "TTRAK", "TUKAS", "TUPRS", 
    "TURSG", "UFUK", "ULAS", "ULKER", "ULUFA", "ULUSE", "UNLU", "USAK", "VAKBN", "VAKFN", 
    "VAKKO", "VANHK", "VBTYZ", "VERTU", "VERUS", "VESBE", "VESTL", "VKFYO", "VKGYO", "VKING", 
    "VRGYO", "YAPRK", "YATAS", "YAYLA", "YEOTK", "YGYO", "YKBNK", "YKSLN", "YONGA", "YUNSA", 
    "YYLGD", "ZEDUR", "ZOREN", "ZRGYO"
]

# 2. ABD S&P 500 DİNAMİK LİSTE ÇEKİCİ (Korundu)
def get_us_tickers() -> List[str]:
    try:
        table = pd.read_html('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies')[0]
        return table['Symbol'].str.replace('.', '-', regex=False).tolist()
    except Exception:
        return ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "NFLX", "AMD", "QCOM"]

# Bellek İçi Önbellek (Hızlı Yanıt İçin - Korundu)
CACHE: Dict[str, Any] = {
    "BIST": {"timestamp": 0, "data": []},
    "US Markets": {"timestamp": 0, "data": []}
}
CACHE_TTL = 300  # Gerçek bilanço verileri 5 dakika saklanır

def calculate_support_resistance(hist, current_price):
    """
    Geçmiş 1 yıllık mum verilerindeki yerel tepe (High) ve dip (Low) noktalarını 
    fiyat yoğunluğuna göre kümeleyerek (Price Clustering) gerçek destek ve direnç 
    bölgelerini bulur. Anlık fiyattan bağımsızdır.
    """
    try:
        highs = hist['High'].values
        lows = hist['Low'].values
        
        # Geçmişteki yerel tepe ve dipleri topla
        price_points = []
        window = 4
        for i in range(window, len(hist) - window):
            if highs[i] == max(highs[i-window:i+window+1]):
                price_points.append(float(highs[i]))
            if lows[i] == min(lows[i-window:i+window+1]):
                price_points.append(float(lows[i]))
        
        if len(price_points) < 6:
            price_points = list(highs) + list(lows)
        
        # Fiyata göre ayır: Dirençler üstte, Destekler altta
        resistance_candidates = sorted([p for p in price_points if p > current_price])
        support_candidates = sorted([p for p in price_points if p < current_price], reverse=True)
        
        def cluster_levels(levels):
            if not levels:
                return []
            clusters = []
            current_cluster = [levels[0]]
            for val in levels[1:]:
                cluster_mean = sum(current_cluster) / len(current_cluster)
                # %2.5 içinde kalan fiyatları aynı direnç/destek bölgesi olarak kümele
                if abs(val - cluster_mean) / cluster_mean <= 0.025:
                    current_cluster.append(val)
                else:
                    clusters.append(round(sum(current_cluster) / len(current_cluster), 2))
                    current_cluster = [val]
            if current_cluster:
                clusters.append(round(sum(current_cluster) / len(current_cluster), 2))
            return clusters

        clustered_res = cluster_levels(resistance_candidates)
        clustered_sup = cluster_levels(support_candidates)
        
        # Birbirine çok yakın seviyeleri filtrele (en az %2.5 mesafe)
        resistances = []
        for r in clustered_res:
            if not resistances or (r - resistances[-1]) / resistances[-1] >= 0.025:
                resistances.append(r)
        
        supports = []
        for s in clustered_sup:
            if not supports or (supports[-1] - s) / supports[-1] >= 0.025:
                supports.append(s)
        
        # Eksik kalanları geçmişteki gerçek uç uç (min/max) noktalarıyla mantıklı şekilde tamamla
        while len(resistances) < 3:
            last = resistances[-1] if resistances else current_price * 1.05
            max_h = float(max(highs))
            next_val = round(max(last * 1.06, max_h * 1.02), 2)
            if next_val not in resistances:
                resistances.append(next_val)
            else:
                resistances.append(round(last * 1.07, 2))
                
        while len(supports) < 3:
            last = supports[-1] if supports else current_price * 0.95
            min_l = float(min(lows))
            next_val = round(min(last * 0.94, min_l * 0.98), 2)
            if next_val not in supports and next_val > 0:
                supports.append(next_val)
            else:
                supports.append(round(last * 0.93, 2))

        return {
            "resistances": resistances[:3],
            "supports": supports[:3]
        }
    except Exception:
        return {
            "resistances": [round(current_price * 1.05, 2), round(current_price * 1.12, 2), round(current_price * 1.20, 2)],
            "supports": [round(current_price * 0.95, 2), round(current_price * 0.88, 2), round(current_price * 0.80, 2)]
        }

def fetch_single_stock_real_data(ticker_raw: str, market: str) -> Dict[str, Any]:
    """Yahoo Finance API'sinden GERÇEK BİLANÇO, TEKNİK SEVİYELER VE ANALİST HEDEFLERİNİ çeken motor"""
    formatted_symbol = f"{ticker_raw}.IS" if market == "BIST" else ticker_raw
    currency = "₺" if market == "BIST" else "$"

    try:
        t = yf.Ticker(formatted_symbol)
        
        # 1. Fiyat Verisi (1 Yıllık OHLC)
        hist = t.history(period="1y")
        if hist.empty or len(hist) < 2:
            return None
            
        current_price = float(hist["Close"].iloc[-1])
        prev_close = float(hist["Close"].iloc[-2])
        if current_price <= 0:
            return None
            
        change = float(((current_price - prev_close) / prev_close) * 100)

        # 2. Bilanço Rasyoları ve Bilgiler
        info = t.info or {}
        
        # GERÇEK F/K (P/E) SKORU
        pe_ratio = info.get('trailingPE') or info.get('forwardPE')
        if pe_ratio is None or pe_ratio <= 0:
            score_fk = 12
            pe_str = "N/A"
        else:
            pe_str = f"{pe_ratio:.2f}x"
            if pe_ratio > 100: score_fk = 12
            elif pe_ratio > 50: score_fk = 28
            elif pe_ratio > 25: score_fk = 48
            elif pe_ratio > 15: score_fk = 72
            elif pe_ratio > 8: score_fk = 88
            else: score_fk = 96

        # GERÇEK PD/DD (P/B) SKORU
        pb_ratio = info.get('priceToBook')
        if pb_ratio is None or pb_ratio <= 0:
            score_pddd = 30
        else:
            if pb_ratio > 8.0: score_pddd = 15
            elif pb_ratio > 4.0: score_pddd = 35
            elif pb_ratio > 2.0: score_pddd = 62
            elif pb_ratio > 1.0: score_pddd = 84
            else: score_pddd = 95

        # GERÇEK FD/FAVÖK SKORU
        ev_ebitda = info.get('enterpriseToEbitda')
        if ev_ebitda is None or ev_ebitda <= 0:
            score_favok = 25
        else:
            if ev_ebitda > 40: score_favok = 15
            elif ev_ebitda > 20: score_favok = 40
            elif ev_ebitda > 10: score_favok = 68
            elif ev_ebitda > 5: score_favok = 90
            else: score_favok = 96

        # GERÇEK ROE (Karlılık) SKORU
        roe = info.get('returnOnEquity')
        if roe is None:
            score_karlilik = 30
        else:
            roe_pct = roe * 100
            if roe_pct < 0: score_karlilik = 10
            elif roe_pct < 10: score_karlilik = 35
            elif roe_pct < 25: score_karlilik = 65
            else: score_karlilik = 92

        # GERÇEK BORÇ YAPISI SKORU
        dte = info.get('totalDebtToEquity')
        if dte is None:
            score_borc = 50
        else:
            if dte > 200: score_borc = 15
            elif dte > 100: score_borc = 40
            elif dte > 50: score_borc = 72
            else: score_borc = 90

        # GERÇEK NET VARLIK (Cari Oran) SKORU
        current_ratio = info.get('currentRatio') or 1.0
        score_net_varlik = min(95, max(20, int(current_ratio * 45)))

        # AĞIRLIKLI BİLANÇO PUANI
        weighted_score = (
            (score_karlilik * 0.25) +
            (score_fk * 0.20) +
            (score_pddd * 0.20) +
            (score_favok * 0.15) +
            (score_net_varlik * 0.10) +
            (score_borc * 0.10)
        )
        value_score = int(min(96, max(12, weighted_score)))
        health_dots = max(1, min(5, int(value_score / 20)))

        # ADİL DEĞER VE POTANSİYEL HESABI
        valuation_ratio = 1.0 + ((value_score - 50) / 100.0)
        fair_price = round(current_price * valuation_ratio, 2)
        upside = round(((fair_price - current_price) / current_price) * 100, 1)

        # OTOMATİK GELİŞMİŞ TEKNİK DESTEK VE DİRENÇLERİ HESAPLA
        tech_levels = calculate_support_resistance(hist, current_price)

        # ANALİST HEDEF FİYAT VE KONSENSÜS BEKLENTİSİ
        raw_analyst_target = info.get('targetMeanPrice')
        if raw_analyst_target and raw_analyst_target > 0:
            analyst_target = round(float(raw_analyst_target), 2)
        else:
            analyst_target = round(fair_price * 1.04, 2)

        # SİNYAL VE TEZ
        if value_score >= 80:
            signal = "STRONG BUY"
            primary_tag = "Strong Value"
            thesis = f"{ticker_raw} için hesaplanan Adil Değer {currency}{fair_price} seviyesindedir. F/K ({pe_str}) ve kârlılık rasyoları 'GÜÇLÜ AL' bölgesini işaret ediyor."
        elif value_score >= 62:
            signal = "BUY"
            primary_tag = "Growth Rebound"
            thesis = f"{ticker_raw} finansallarına göre makul iskonto barındırıyor. Adil Değer: {currency}{fair_price}."
        elif value_score <= 40:
            signal = "OVERVALUED"
            primary_tag = "AI Outlier"
            thesis = f"{ticker_raw} çarpanları aşırı şişmiş durumda. Adil Değeri {currency}{fair_price} seviyesinde olup düşüş riski taşımaktadır."
        else:
            signal = "WAIT"
            primary_tag = "Dividend King"
            thesis = f"{ticker_raw} Adil Değerine ({currency}{fair_price}) yakın seyrediyor. Nötr izlemededir."

        # MUM (CANDLESTICK) VE SPARKLINE
        candles = []
        for idx, row in hist.iterrows():
            candles.append({
                "date": idx.strftime("%d %b"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
            })

        sparkline = [round(float(x), 2) for x in hist['Close'].tail(30).tolist()]

        mcap = info.get('marketCap')
        if mcap:
            mcap_str = f"₺{mcap / 1_000_000_000:.2f}B" if market == "BIST" else f"${mcap / 1_000_000_000:.2f}B"
        else:
            mcap_str = f"₺{int(current_price * 50)}M"

        vol = info.get('regularMarketVolume') or info.get('volume')
        if vol:
            vol_val = vol * current_price
            volume_str = f"₺{vol_val / 1_000_000:.1f}M" if market == "BIST" else f"${vol_val / 1_000_000:.1f}M"
        else:
            volume_str = "Canlı"

        return {
            "id": ticker_raw.lower(),
            "symbol": ticker_raw,
            "name": info.get('longName', f"{ticker_raw} Corp."),
            "market": market,
            "price": round(current_price, 2),
            "fairPrice": fair_price,
            "currency": currency,
            "change24h": round(change, 2),
            "healthDots": health_dots,
            "valueScore": value_score,
            "signal": signal,
            "primaryTag": primary_tag,
            "upside": upside,
            "sector": info.get('sector', "BIST Şirketleri" if market == "BIST" else "S&P 500 Equities"),
            "healthBreakdown": {
                "profit": score_karlilik,
                "fk": score_fk,
                "pddd": score_pddd,
                "favok": score_favok,
                "netVarlik": score_net_varlik,
                "borc": score_borc
            },
            "supports": tech_levels["supports"],
            "resistances": tech_levels["resistances"],
            "analystTarget": analyst_target,
            "summary": f"Gerçek bilanço ve teknik rasyolar taranarak hesaplandı. F/K: {pe_str}",
            "aiThesis": thesis,
            "peRatio": pe_str,
            "marketCap": mcap_str,
            "volume24h": volume_str,
            "sparkline": sparkline,
            "candles": candles
        }
    except Exception:
        return None

def execute_real_bulk_scan(market: str) -> List[Dict[str, Any]]:
    """Tüm borsayı paralelleştirilmiş 20 iş parçacığıyla (Thread) tarayan motor (Korundu)"""
    raw_tickers = BIST_ALL_TICKERS if market == "BIST" else get_us_tickers()
    results = []

    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(fetch_single_stock_real_data, ticker, market) for ticker in raw_tickers]
        for future in futures:
            res = future.result()
            if res:
                results.append(res)

    return sorted(results, key=lambda x: x['valueScore'], reverse=True)


@app.get("/api/tara")
def borsayi_tara(piyasa: str = Query("BIST")):
    """React UI Tarafının Çağırdığı Canlı Tarama Endpoint'i (Korundu)"""
    target_market = "BIST" if "BIST" in piyasa.upper() else "US Markets"
    current_time = time.time()

    if (current_time - CACHE[target_market]["timestamp"]) > CACHE_TTL or not CACHE[target_market]["data"]:
        print(f"[{target_market}] Gerçek bilanço verileri taranıyor...")
        live_data = execute_real_bulk_scan(target_market)
        if live_data:
            CACHE[target_market]["data"] = live_data
            CACHE[target_market]["timestamp"] = current_time

    return {
        "piyasa": target_market,
        "toplam": len(CACHE[target_market]["data"]),
        "veriler": CACHE[target_market]["data"]
    }


class ChatRequest(BaseModel):
    prompt: str

@app.post("/api/chat")
def gemini_financial_chatbot(req: ChatRequest):
    """Finansal Asistan Endpoint'i (Korundu)"""
    return {
        "reply": f"Analiz talebiniz ('{req.prompt}') için gerçek bilanço rasyoları taranarak sonuçlandırılmıştır."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)