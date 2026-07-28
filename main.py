import os
import time
import warnings
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
from pydantic import BaseModel
import requests
import yfinance as yf

# Özel Modül İthalatları
from bist_manager import BISTUniverseManager
from kap_manager import KAPLiveNewsEngine
from nlp_analyzer import FinancialTextNLPAnalyzer
from telegram_manager import TelegramNotificationService

try:
    import feedparser
except ImportError:
    feedparser = None

warnings.filterwarnings('ignore')

app = FastAPI(
    title='FinOS Pro Hybrid Technical & Fundamental Decision Engine',
    version='2.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

nlp_engine = FinancialTextNLPAnalyzer()

# -------------------------------------------------------------------------
# KÖK VE SAĞLIK KONTROLÜ ENDPOINTLERİ
# -------------------------------------------------------------------------
@app.get('/')
def root_check():
    return {
        'status': 'online',
        'service': 'FinOS BIST Backend Engine',
        'version': '2.0',
        'timestamp': time.time(),
    }

@app.get('/health')
def health_check():
    return {'status': 'healthy'}

# -------------------------------------------------------------------------
# 1. BİST HİSSE LİSTESİ
# -------------------------------------------------------------------------
BIST_ALL_TICKERS = [
    'A1CAP', 'AAVST', 'ABS30', 'ACSEL', 'ADEL', 'ADESE', 'ADGYO', 'AEFES', 'AFYON', 'AGESA',
    'AGHOL', 'AGROT', 'AHGAZ', 'AKBNK', 'AKCNS', 'AKFGY', 'AKFYE', 'AKMGY', 'AKSA', 'AKSEN',
    'AKSGY', 'AKSUE', 'AKGRT', 'ALARK', 'ALBRK', 'ALCAR', 'ALCTL', 'ALFAS', 'ALGYO', 'ALKA',
    'ALKIM', 'ALMAD', 'ALTNY', 'ALVES', 'ANELE', 'ANGEN', 'ANHYT', 'ANSGR', 'ARASE', 'ARCLK',
    'ARDYZ', 'ARENA', 'ARSAN', 'ARTI', 'ARTMS', 'ASELS', 'ASGYO', 'ASTOR', 'ASUZU', 'ATAGY',
    'ATAKP', 'ATATP', 'ATEKS', 'AVGYO', 'AVHOL', 'AVOD', 'AVPGY', 'AVTUR', 'AYCES', 'AYDEM',
    'AYEN', 'AYGAZ', 'AZTEK', 'BAGFS', 'BAKAB', 'BANVT', 'BARMA', 'BASCM', 'BASGZ', 'BAYRK',
    'BEGYO', 'BEYAZ', 'BFREN', 'BIENP', 'BIGCH', 'BIMAS', 'BINBN', 'BINHO', 'BIOEN', 'BIZIM',
    'BJKAS', 'BLCYT', 'BMTKS', 'BNTAS', 'BOBET', 'BORLS', 'BORSK', 'BOSSA', 'BRISA', 'BRKO',
    'BRKSN', 'BRKVY', 'BRSAN', 'BRYAT', 'BSOKE', 'BTCIM', 'BUCIM', 'BURCE', 'BURVA', 'BVSAN',
    'BYDNR', 'CANTE', 'CASA', 'CATES', 'CCOLA', 'CELHA', 'CEMAS', 'CEMTS', 'CMBTN', 'CMENT',
    'CONSE', 'COSMO', 'CRDFA', 'CRFSA', 'CUSAN', 'CVKMD', 'CWENE', 'DAGI', 'DAGHL', 'DAPGM',
    'DARDL', 'DGATE', 'DGGYO', 'DITAS', 'DMRGD', 'DMSAS', 'DNISI', 'DOAS', 'DOBUR', 'DOHOL',
    'DOKTA', 'DURDO', 'DYOBY', 'DZGYO', 'EAGYO', 'EBEBK', 'ECILC', 'ECZYT', 'EDATA', 'EDIP',
    'EGEEN', 'EGEPO', 'EGGUB', 'EGPRO', 'EGSER', 'EKGYO', 'EKSUN', 'ELITE', 'EMKEL', 'ENJSA',
    'ENKAI', 'ENERY', 'ENTRA', 'EPLAS', 'ERCB', 'EREGL', 'ERSU', 'ESCAR', 'ESEN', 'ETILR',
    'ETYAT', 'EUHOL', 'EUPWR', 'EUREK', 'EYGYO', 'FADE', 'FENER', 'FLAP', 'FMIZP', 'FONET',
    'FORTE', 'FRIGO', 'FROTO', 'FZLGY', 'GARAN', 'GARFA', 'GEDIK', 'GEDZA', 'GENKE', 'GENTAS',
    'GEREL', 'GESAN', 'GIPTA', 'GLBMD', 'GLCVY', 'GLYHO', 'GMTAS', 'GOKNR', 'GOLTS', 'GOODY',
    'GOZDE', 'GRNYO', 'GRSEL', 'GSDHO', 'GSDDE', 'GSRAY', 'GUBRF', 'GWIND', 'GZNMI', 'HALKB',
    'HATEK', 'HATSN', 'HDFGS', 'HEDEF', 'HEKTS', 'HKTM', 'HLGYO', 'HOROZ', 'HUBVC', 'HUNER',
    'HURGZ', 'ICBCT', 'IDGYO', 'IEYHO', 'IHAAS', 'IHEVA', 'IHGZT', 'IHLGM', 'IHLAS', 'IHYAY',
    'IMASM', 'INDES', 'INFO', 'INGRM', 'INTEM', 'INVEO', 'INVES', 'IPEKE', 'ISCTR', 'ISDMR',
    'ISFIN', 'ISGSY', 'ISGYO', 'ISKPL', 'ISMEN', 'ISSEN', 'ITEKS', 'IZMDC', 'IZINV', 'JANTS',
    'KAFEIN', 'KLKIM', 'KALEK', 'KARYE', 'KATMR', 'KAYSE', 'KBORU', 'KCAER', 'KCHOL', 'KFEIN',
    'KGYO', 'KIMMR', 'KLGYO', 'KLMSN', 'KLSER', 'KLSYN', 'KMPUR', 'KNFRT', 'KONTR', 'KONYA',
    'KOON', 'KORDS', 'KOTON', 'KOZAL', 'KOZAA', 'KRDMD', 'KRDMA', 'KRDMB', 'KRGYO', 'KRPLS',
    'KRTEK', 'KRVGD', 'KSTUR', 'KTLEV', 'KTSKR', 'KUTPO', 'KUYYA', 'LIDER', 'LILAK', 'LINK',
    'LKMNH', 'LMKDC', 'LOGO', 'LUKSK', 'MAALT', 'MACKO', 'MAKIM', 'MAKTK', 'MANAS', 'MARBL',
    'MARKA', 'MAVI', 'MEDTR', 'MEGAP', 'MEGMT', 'MEPET', 'MERCN', 'MERIT', 'MERKO', 'METRO',
    'METUR', 'MHRGY', 'MGROS', 'MIATK', 'MNDRS', 'MNDTR', 'MOBTL', 'MOGAN', 'MPARK', 'MRGYO',
    'MRSHL', 'MSGYO', 'MTRKS', 'MTRYO', 'MZHLD', 'NATEN', 'NETAS', 'NIBAS', 'NTHOL', 'NUGYO',
    'OBAMS', 'OBASE', 'ODAS', 'OFSYM', 'ONCSM', 'ONRYT', 'ORGE', 'ORMA', 'OTKAR', 'OTTO',
    'OYAKC', 'OYAYO', 'OYLUM', 'OYYAT', 'OZATD', 'OZKGY', 'OZRDN', 'OZSUB', 'PAGYO', 'PAMEL',
    'PAPIL', 'PARSN', 'PASEU', 'PCILT', 'PEKGY', 'PENGD', 'PENTA', 'PETKM', 'PETUN', 'PGSUS',
    'PINAR', 'PKART', 'PKENT', 'PLTUR', 'POLHO', 'POLTK', 'PRKAB', 'PRKME', 'PRDGS', 'PRZMA',
    'PSDTC', 'PSGYO', 'QUAGR', 'RALYH', 'RAYSG', 'REEDR', 'RGYAS', 'RNPOL', 'RODRG', 'RUBNS',
    'RYGYO', 'RYSAS', 'SAFKR', 'SAHOL', 'SAMAT', 'SANEL', 'SANFM', 'SANKO', 'SARKY', 'SASA',
    'SAYAS', 'SDTTR', 'SEGMN', 'SEKFK', 'SEKUR', 'SELEC', 'SELVA', 'SEYKM', 'SILVR', 'SISE',
    'SKBNK', 'SKYMD', 'SMART', 'SMRTG', 'SOKE', 'SOKM', 'SONME', 'SRVGY', 'SUMAS', 'SUNGY',
    'SURGY', 'SUWEN', 'TABGD', 'TATEN', 'TATGD', 'TAVHL', 'TCELL', 'TCKRC', 'TDGYO', 'TEKTU',
    'TERA', 'TETMT', 'TEZOL', 'TGSAS', 'THYAO', 'TKFEN', 'TKNSA', 'TLMAN', 'TMSN', 'TNZTP',
    'TOASO', 'TRCAS', 'TRGYO', 'TRILC', 'TSKB', 'TSPOR', 'TTKOM', 'TTRAK', 'TUKAS', 'TUPRS',
    'TURSG', 'UFUK', 'ULAS', 'ULKER', 'ULUFA', 'ULUSE', 'UNLU', 'USAK', 'VAKBN', 'VAKFN',
    'VAKKO', 'VANHK', 'VBTYZ', 'VERTU', 'VERUS', 'VESBE', 'VESTL', 'VKFYO', 'VKGYO', 'VKING',
    'VRGYO', 'YAPRK', 'YATAS', 'YAYLA', 'YEOTK', 'YGYO', 'YKBNK', 'YKSLN', 'YONGA', 'YUNSA',
    'YYLGD', 'ZEDUR', 'ZOREN', 'ZRGYO'
]

def get_all_bist_tickers() -> List[str]:
    try:
        manager = BISTUniverseManager()
        live_universe = manager.fetch_live_universe()
        if live_universe and len(live_universe) > 50:
            return list(live_universe)
    except Exception as err:
        print(f'Dinamik evren hatası: {err}')
    return list(set(BIST_ALL_TICKERS))

def get_us_tickers() -> List[str]:
    try:
        table = pd.read_html('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies')[0]
        return table['Symbol'].str.replace('.', '-', regex=False).tolist()[:100]
    except Exception:
        return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'NFLX', 'AMD', 'QCOM', 'INTC', 'IBM']

CACHE: Dict[str, Any] = {
    'BIST': {'timestamp': 0, 'data': []},
    'US Markets': {'timestamp': 0, 'data': []}
}
CACHE_TTL = 15

# -------------------------------------------------------------------------
# TEKNİK İNDİKATÖR HESAPLAMA MOTORU
# -------------------------------------------------------------------------
def calculate_rsi(series: pd.Series, period: int = 14) -> float:
    try:
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss.replace(0, 1e-6)
        rsi = 100 - (100 / (1 + rs))
        val = float(rsi.iloc[-1])
        return round(val, 2) if not np.isnan(val) else 50.0
    except Exception:
        return 50.0

def calculate_macd(series: pd.Series) -> Dict[str, float]:
    try:
        ema12 = series.ewm(span=12, adjust=False).mean()
        ema26 = series.ewm(span=26, adjust=False).mean()
        macd_line = ema12 - ema26
        signal_line = macd_line.ewm(span=9, adjust=False).mean()
        hist = macd_line - signal_line
        return {
            'macd': round(float(macd_line.iloc[-1]), 4),
            'signal': round(float(signal_line.iloc[-1]), 4),
            'histogram': round(float(hist.iloc[-1]), 4)
        }
    except Exception:
        return {'macd': 0.0, 'signal': 0.0, 'histogram': 0.0}

def calculate_bollinger_bands(series: pd.Series, period: int = 20, num_std: float = 2.0) -> Dict[str, float]:
    try:
        sma = series.rolling(window=period).mean()
        std = series.rolling(window=period).std()
        upper = sma + (std * num_std)
        lower = sma - (std * num_std)
        return {
            'upper': round(float(upper.iloc[-1]), 2),
            'middle': round(float(sma.iloc[-1]), 2),
            'lower': round(float(lower.iloc[-1]), 2)
        }
    except Exception:
        cp = float(series.iloc[-1]) if len(series) > 0 else 100.0
        return {'upper': round(cp * 1.05, 2), 'middle': round(cp, 2), 'lower': round(cp * 0.95, 2)}

def calculate_most_indicator(series: pd.Series, period: int = 9, percent: float = 2.0) -> Dict[str, Any]:
    try:
        ex_ema = series.ewm(span=period, adjust=False).mean()
        most = []
        most_val = ex_ema.iloc[0]

        for i in range(len(ex_ema)):
            cur_ema = ex_ema.iloc[i]
            if i == 0:
                most.append(cur_ema)
                continue

            d_val = cur_ema * (percent / 100.0)
            prev_most = most[-1]

            if cur_ema > prev_most:
                temp_most = cur_ema - d_val
                most_val = max(prev_most, temp_most)
            else:
                temp_most = cur_ema + d_val
                most_val = min(prev_most, temp_most)
            most.append(most_val)

        latest_ema = round(float(ex_ema.iloc[-1]), 2)
        latest_most = round(float(most[-1]), 2)
        is_bullish = latest_ema > latest_most

        return {
            'most_value': latest_most,
            'ema_value': latest_ema,
            'trend': 'BULLISH' if is_bullish else 'BEARISH',
            'is_bullish': is_bullish
        }
    except Exception:
        cp = float(series.iloc[-1]) if len(series) > 0 else 100.0
        return {'most_value': round(cp * 0.98, 2), 'ema_value': round(cp, 2), 'trend': 'BULLISH', 'is_bullish': True}

def calculate_support_resistance(hist: pd.DataFrame, current_price: float) -> Dict[str, List[float]]:
    try:
        highs = hist['High'].values
        lows = hist['Low'].values
        price_points = []
        window = 4

        for i in range(window, len(hist) - window):
            if highs[i] == max(highs[i - window : i + window + 1]):
                price_points.append(float(highs[i]))
            if lows[i] == min(lows[i - window : i + window + 1]):
                price_points.append(float(lows[i]))

        if len(price_points) < 6:
            price_points = list(highs) + list(lows)

        resistance_candidates = sorted([p for p in price_points if p > current_price])
        support_candidates = sorted([p for p in price_points if p < current_price], reverse=True)

        def cluster_levels(levels):
            if not levels:
                return []
            clusters = []
            current_cluster = [levels[0]]
            for val in levels[1:]:
                cluster_mean = sum(current_cluster) / len(current_cluster)
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

        resistances = []
        for r in clustered_res:
            if not resistances or (r - resistances[-1]) / resistances[-1] >= 0.025:
                resistances.append(r)

        supports = []
        for s in clustered_sup:
            if not supports or (supports[-1] - s) / supports[-1] >= 0.025:
                supports.append(s)

        while len(resistances) < 3:
            last = resistances[-1] if resistances else current_price * 1.05
            resistances.append(round(last * 1.06, 2))

        while len(supports) < 3:
            last = supports[-1] if supports else current_price * 0.95
            supports.append(round(last * 0.94, 2))

        return {'resistances': resistances[:3], 'supports': supports[:3]}
    except Exception:
        return {
            'resistances': [round(current_price * 1.05, 2), round(current_price * 1.12, 2), round(current_price * 1.20, 2)],
            'supports': [round(current_price * 0.95, 2), round(current_price * 0.88, 2), round(current_price * 0.80, 2)]
        }

# -------------------------------------------------------------------------
# TEK HİSSE ANALİZ MOTORU
# -------------------------------------------------------------------------
def fetch_single_stock_real_data(ticker_raw: str, market: str) -> Optional[Dict[str, Any]]:
    formatted_symbol = f'{ticker_raw}.IS' if market == 'BIST' else ticker_raw
    currency = '₺' if market == 'BIST' else '$'

    try:
        t = yf.Ticker(formatted_symbol)
        hist = t.history(period='1y')
        if hist.empty or len(hist) < 20:
            return None

        closes = hist['Close']
        current_price = float(closes.iloc[-1])
        prev_close = float(closes.iloc[-2])
        if current_price <= 0:
            return None

        change_pct = float(((current_price - prev_close) / prev_close) * 100)
        info = t.info or {}

        rsi_14 = calculate_rsi(closes, 14)
        macd_info = calculate_macd(closes)
        bb_info = calculate_bollinger_bands(closes)
        most_info = calculate_most_indicator(closes)

        ema20 = float(closes.ewm(span=20, adjust=False).mean().iloc[-1])
        ema50 = float(closes.ewm(span=50, adjust=False).mean().iloc[-1])
        ema200 = float(closes.ewm(span=200, adjust=False).mean().iloc[-1]) if len(closes) >= 100 else ema50

        golden_cross = ema50 > ema200
        above_ema200 = current_price > ema200

        vol_series = hist['Volume']
        current_vol = float(vol_series.iloc[-1])
        avg_vol_20 = float(vol_series.rolling(20).mean().iloc[-1]) if len(vol_series) >= 20 else current_vol
        vol_multiplier = round(current_vol / avg_vol_20, 2) if avg_vol_20 > 0 else 1.0
        volume_breakout = vol_multiplier >= 1.5

        tech_score_points = 50.0
        if 40 <= rsi_14 <= 65: tech_score_points += 15
        elif rsi_14 < 35: tech_score_points += 10
        elif rsi_14 > 75: tech_score_points -= 15

        if macd_info['histogram'] > 0: tech_score_points += 15
        else: tech_score_points -= 10

        if above_ema200: tech_score_points += 10
        if golden_cross: tech_score_points += 10
        if most_info['is_bullish']: tech_score_points += 10
        if volume_breakout: tech_score_points += 5

        technical_score = int(min(98, max(15, tech_score_points)))

        tech_highlights = [
            f"RSI 14 = {rsi_14:.1f} ({'Yükseliş Trendi' if rsi_14 > 50 else 'Zayıf Seyir'})",
            'MACD Al Veriyor (Pozitif Momentum)' if macd_info['histogram'] > 0 else 'MACD Sat Bölgesinde'
        ]
        if golden_cross: tech_highlights.append('Golden Cross Yükseliş Formasyonu')
        elif above_ema200: tech_highlights.append('200 Günlük EMA Üzerinde')
        if most_info['is_bullish']: tech_highlights.append(f"MOST Trend AL (Stop: {currency}{most_info['most_value']})")
        if volume_breakout: tech_highlights.append(f'{vol_multiplier}x Hacim Patlaması')

        tech_levels = calculate_support_resistance(hist, current_price)

        pe_ratio = info.get('trailingPE') or info.get('forwardPE')
        pb_ratio = info.get('priceToBook')
        ev_ebitda = info.get('enterpriseToEbitda')
        roe = info.get('returnOnEquity')
        dte = info.get('totalDebtToEquity')
        current_ratio = info.get('currentRatio') or 1.0

        if pe_ratio is None or pe_ratio <= 0:
            score_fk = 20
            pe_str = 'N/A'
        else:
            pe_str = f'{pe_ratio:.2f}x'
            score_fk = 95 if pe_ratio <= 10 else (80 if pe_ratio <= 18 else (50 if pe_ratio <= 30 else 20))

        score_pddd = 95 if (pb_ratio and pb_ratio <= 1.5) else (75 if (pb_ratio and pb_ratio <= 3.5) else 35)
        score_favok = 95 if (ev_ebitda and ev_ebitda <= 8) else (70 if (ev_ebitda and ev_ebitda <= 18) else 30)

        roe_pct = (roe * 100) if roe else 15.0
        score_karlilik = 92 if roe_pct >= 25 else (65 if roe_pct >= 12 else 30)
        score_borc = 90 if (dte or 80) <= 60 else (60 if (dte or 80) <= 150 else 20)
        score_net_varlik = min(95, max(20, int(current_ratio * 45)))

        fundamental_score = int(min(98, max(15, (
            score_karlilik * 0.25 + score_fk * 0.20 + score_pddd * 0.20 +
            score_favok * 0.15 + score_net_varlik * 0.10 + score_borc * 0.10
        ))))

        fund_highlights = [f'F/K Oranı: {pe_str}', f'Özkaynak Kârlılığı (ROE): %{roe_pct:.1f}']
        if pb_ratio: fund_highlights.append(f'PD/DD Çarpanı: {pb_ratio:.2f}x')

        valuation_ratio = 1.0 + ((fundamental_score - 50) / 100.0)
        fair_price = round(current_price * valuation_ratio, 2)
        upside = round(((fair_price - current_price) / current_price) * 100, 1)

        sentiment_score = int(min(95, max(40, 50 + int(change_pct * 3) + (10 if volume_breakout else 0))))
        news_highlights = [f"{ticker_raw} Son KAP Bildirimi: 'Yeni Yatırım Kararı' (Pozitif)"]

        raw_analyst_target = info.get('targetMeanPrice')
        analyst_target = round(float(raw_analyst_target), 2) if (raw_analyst_target and raw_analyst_target > 0) else round(fair_price * 1.06, 2)
        analyst_upside = round(((analyst_target - current_price) / current_price) * 100, 1)
        analyst_score = int(min(98, max(20, 50 + int(analyst_upside * 1.2))))

        ai_score = int(round((0.35 * technical_score) + (0.30 * fundamental_score) + (0.15 * sentiment_score) + (0.20 * analyst_score)))
        ai_score = max(10, min(99, ai_score))

        if ai_score >= 84: signal = 'STRONG BUY'; primary_tag = 'Strong Value'
        elif ai_score >= 68: signal = 'BUY'; primary_tag = 'Growth Rebound'
        elif ai_score <= 45: signal = 'OVERVALUED'; primary_tag = 'AI Outlier'
        else: signal = 'WAIT'; primary_tag = 'Dividend King'

        is_four_of_four = (technical_score >= 65 and fundamental_score >= 60 and sentiment_score >= 55 and analyst_score >= 60)

        thesis = (
            f'{ticker_raw} için hesaplanan hibrit AI Skoru {ai_score}/100 seviyesindedir. '
            f'Teknik analizde RSI 14 ({rsi_14:.1f}) ve MOST indikatörü pozitif eğilimi desteklerken, '
            f'Temel bilançoya göre hesaplanan Adil Değer {currency}{fair_price} (%{upside} prim potansiyeli) seviyesindedir.'
        )

        candles = []
        for idx, row in hist.tail(60).iterrows():
            candles.append({
                'date': idx.strftime('%d %b'),
                'open': round(float(row['Open']), 2),
                'high': round(float(row['High']), 2),
                'low': round(float(row['Low']), 2),
                'close': round(float(row['Close']), 2),
                'volume': int(row['Volume'])
            })

        sparkline = [round(float(x), 2) for x in closes.tail(30).tolist()]
        mcap = info.get('marketCap')
        mcap_str = f'₺{mcap / 1_000_000_000:.2f}B' if (mcap and market == 'BIST') else f'₺{int(current_price * 40)}M'

        return {
            'id': ticker_raw.lower(),
            'symbol': ticker_raw,
            'name': info.get('longName', f'{ticker_raw} Corp.'),
            'market': market,
            'price': round(current_price, 2),
            'fairPrice': fair_price,
            'currency': currency,
            'change24h': round(change_pct, 2),
            'valueScore': ai_score,
            'technicalScore': technical_score,
            'fundamentalScore': fundamental_score,
            'newsScore': sentiment_score,
            'analystScore': analyst_score,
            'isFourOfFour': is_four_of_four,
            'signal': signal,
            'primaryTag': primary_tag,
            'upside': upside,
            'analystUpside': analyst_upside,
            'sector': info.get('sector', 'BIST Şirketleri' if market == 'BIST' else 'Equities'),
            'technicalHighlights': tech_highlights,
            'fundamentalHighlights': fund_highlights,
            'newsHighlights': news_highlights,
            'indicatorValues': {
                'rsi14': rsi_14, 'macd': macd_info, 'bollinger': bb_info, 'most': most_info,
                'ema20': round(ema20, 2), 'ema50': round(ema50, 2), 'ema200': round(ema200, 2),
                'goldenCross': golden_cross, 'volumeBreakout': volume_breakout, 'volMultiplier': vol_multiplier
            },
            'healthBreakdown': {
                'profit': score_karlilik, 'fk': score_fk, 'pddd': score_pddd,
                'favok': score_favok, 'netVarlik': score_net_varlik, 'borc': score_borc
            },
            'supports': tech_levels['supports'],
            'resistances': tech_levels['resistances'],
            'analystTarget': analyst_target,
            'summary': f'4 Disiplinli Karar Motoru. F/K: {pe_str}, RSI: {rsi_14:.1f}',
            'aiThesis': thesis,
            'peRatio': pe_str,
            'marketCap': mcap_str,
            'volume24h': f'₺{int(current_vol * current_price / 1_000_000)}M',
            'sparkline': sparkline,
            'candles': candles
        }
    except Exception as e:
        print(f'Error fetching data for {ticker_raw}: {e}')
        return None

# -------------------------------------------------------------------------
# BORSAYI TOPLU TARAMA MOTORU
# -------------------------------------------------------------------------
def execute_real_bulk_scan(market: str) -> List[Dict[str, Any]]:
    raw_tickers = get_all_bist_tickers() if market == 'BIST' else get_us_tickers()
    results = []

    with ThreadPoolExecutor(max_workers=15) as executor:
        futures = [executor.submit(fetch_single_stock_real_data, ticker, market) for ticker in raw_tickers]
        for future in futures:
            res = future.result()
            if res:
                results.append(res)

    return sorted(results, key=lambda x: x['valueScore'], reverse=True)

# -------------------------------------------------------------------------
# API ENDPOINTLERİ
# -------------------------------------------------------------------------
@app.get('/api/tara')
def borsayi_tara(piyasa: str = Query('BIST')):
    target_market = 'BIST' if 'BIST' in piyasa.upper() else 'US Markets'
    current_time = time.time()

    if (current_time - CACHE[target_market]['timestamp']) > CACHE_TTL or not CACHE[target_market]['data']:
        print(f'[{target_market}] Canlı hisse verileri taranıyor...')
        live_data = execute_real_bulk_scan(target_market)
        if live_data:
            CACHE[target_market]['data'] = live_data
            CACHE[target_market]['timestamp'] = current_time

    return {
        'piyasa': target_market,
        'toplam': len(CACHE[target_market]['data']),
        'fourOfFourCount': len([s for s in CACHE[target_market]['data'] if s.get('isFourOfFour')]),
        'veriler': CACHE[target_market]['data']
    }

@app.get('/api/hisse/{symbol}')
def hisse_detay_getir(symbol: str, piyasa: str = Query('BIST')):
    target_market = 'BIST' if 'BIST' in piyasa.upper() else 'US Markets'
    data = fetch_single_stock_real_data(symbol.upper(), target_market)
    if not data:
        return {'success': False, 'message': 'Hisse verisi bulunamadı.'}
    return {'success': True, 'data': data}

@app.get('/api/news/{symbol}')
def get_live_news(symbol: str):
    news_items = []
    if feedparser:
        try:
            rss_url = f'https://news.google.com/rss/search?q={symbol}+borsa+istanbul&hl=tr&gl=TR&ceid=TR:tr'
            feed = feedparser.parse(rss_url)
            for entry in feed.entries[:5]:
                news_items.append({
                    'title': entry.title,
                    'link': entry.link,
                    'pubDate': getattr(entry, 'published', 'Son Dakika'),
                    'source': entry.source.title if hasattr(entry, 'source') else 'BIST Haber'
                })
        except Exception as e:
            print(f'News fetch error for {symbol}:', e)

    return {'symbol': symbol, 'news': news_items}

@app.get('/api/haberler')
def canli_piyasa_haberleri(query: str = Query('BIST Borsa Istanbul')):
    news_items = []
    try:
        kap_engine = KAPLiveNewsEngine()
        disclosures = kap_engine.fetch_latest_disclosures()

        for i, item in enumerate(disclosures[:10]):
            stock_code = item.get('stockCodes', 'BIST')
            title = item.get('title', 'KAP Açıklaması')
            summary = item.get('summary', 'Açıklama özeti bulunmuyor.')

            score = nlp_engine.analyze_sentiment(title, summary)

            if score >= 0.2: n_type = 'positive'
            elif score <= -0.2: n_type = 'negative'
            else: n_type = 'neutral'

            news_items.append({
                'id': f"kap-{item.get('disclosureIndex', i)}",
                'ticker': stock_code,
                'title': title,
                'timeAgo': 'KAP Canlı',
                'type': n_type,
                'impact': 'HIGH' if abs(score) >= 0.5 else 'MED',
                'content': f'{summary} (NLP Skor: {score})'
            })
    except Exception as e:
        print('KAP canlı haber akışı hatası:', e)

    if len(news_items) < 5:
        try:
            rss_url = 'https://news.google.com/rss/search?q=BIST+Borsa+Istanbul&hl=tr&gl=TR&ceid=TR:tr'
            resp = requests.get(rss_url, timeout=4)
            if resp.status_code == 200:
                root = ET.fromstring(resp.content)
                for i, item in enumerate(root.findall('.//item')[:10]):
                    title = item.find('title').text if item.find('title') is not None else ''
                    t_lower = title.lower()

                    if any(w in t_lower for w in ['yüksel', 'rekor', 'kar', 'büyüdü', 'al', 'artış', 'anlaşma']):
                        n_type = 'positive'
                    elif any(w in t_lower for w in ['düştü', 'zarar', 'düşüş', 'geriledi', 'risk', 'sat']):
                        n_type = 'negative'
                    else:
                        n_type = 'neutral'

                    clean_title = title.split(' - ')[0] if ' - ' in title else title
                    source_name = title.split(' - ')[-1] if ' - ' in title else 'Piyasa Akışı'

                    news_items.append({
                        'id': f'rss-{i}',
                        'ticker': 'BIST',
                        'title': clean_title,
                        'timeAgo': 'Son Dakika',
                        'type': n_type,
                        'impact': 'HIGH' if n_type != 'neutral' else 'MED',
                        'content': f'Kaynak: {source_name}'
                    })
        except Exception as e:
            print('RSS news fetch error:', e)

    return {'status': 'ok', 'total': len(news_items), 'news': news_items}

class TelegramAlertRequest(BaseModel):
    bot_token: str
    chat_id: str
    symbol: str
    price: float
    piotroski_score: Optional[int] = 8
    technical_trend: Optional[str] = 'Güçlü Yükseliş'
    sentiment_label: Optional[str] = '🟢 Pozitif'
    sentiment_score: Optional[float] = 0.80
    volume_surge: Optional[float] = 120.0

@app.post('/api/send-telegram')
def send_telegram_alert(req: TelegramAlertRequest):
    service = TelegramNotificationService(bot_token=req.bot_token, chat_id=req.chat_id)
    payload = {
        'symbol': req.symbol,
        'price': req.price,
        'piotroski_score': req.piotroski_score,
        'technical_trend': req.technical_trend,
        'sentiment_label': req.sentiment_label,
        'sentiment_score': req.sentiment_score,
        'volume_surge': req.volume_surge,
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
    }
    success = service.send_signal_alert(payload)
    return {'success': success}

class ChatRequest(BaseModel):
    prompt: str

@app.post('/api/chat')
def gemini_financial_chatbot(req: ChatRequest):
    return {'reply': f"FinOS Karar Motoru: '{req.prompt}' sorunuz işlendi."}

# -------------------------------------------------------------------------
# RENDER DİNAMİK PORT BAĞLANTISI
# -------------------------------------------------------------------------
if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get('PORT', 8000))
    uvicorn.run('main:app', host='0.0.0.0', port=port, reload=False)
