export type MarketCategory = 'BIST' | 'US Markets' | 'Crypto' | 'Forex';

export type SignalType = 'STRONG BUY' | 'BUY' | 'WAIT' | 'OVERVALUED' | 'SELL';

export interface HealthBreakdown {
  profit: number;
  fk: number;
  pddd: number;
  favok: number;
  netVarlik: number;
  borc: number;
}

export interface IndicatorValues {
  rsi14: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  most: {
    most_value: number;
    ema_value: number;
    trend: 'BULLISH' | 'BEARISH';
    is_bullish: boolean;
  };
  ema20: number;
  ema50: number;
  ema200: number;
  goldenCross: boolean;
  volumeBreakout: boolean;
  volMultiplier: number;
}

export interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface StockItem {
  id: string;
  symbol: string;
  name: string;
  market: MarketCategory;
  price: number;
  fairPrice?: number; // ADİL DEĞER KOLONU
  currency: string;
  change24h: number;
  
  // PRD v2.0 4-Pillar Scores
  healthDots?: number;
  valueScore: number;       // Nihai Hibrit AI Skoru (0-100)
  technicalScore?: number;  // %35 Ağırlık
  fundamentalScore?: number;// %30 Ağırlık
  newsScore?: number;       // %15 Ağırlık
  analystScore?: number;    // %20 Ağırlık
  isFourOfFour?: boolean;   // 4/4 Sinyal Uyum Bayrağı
  
  signal: SignalType;
  primaryTag?: 'Strong Value' | 'Dividend King' | 'Growth Rebound' | 'High Momentum' | 'Low Beta' | 'AI Outlier' | string;
  upside: number;           // Adil Değer Prim Potansiyeli %
  analystUpside?: number;   // Analist Hedef Fiyat Prim Potansiyeli %
  analystTarget?: number;   // Aracı Kurum Ortalama Hedef Fiyatı
  
  sector: string;
  healthBreakdown: HealthBreakdown | any;
  technicalHighlights?: string[];
  fundamentalHighlights?: string[];
  newsHighlights?: string[];
  indicatorValues?: IndicatorValues;
  supports?: number[];
  resistances?: number[];
  
  summary: string;
  aiThesis: string;
  peRatio?: number | string;
  marketCap?: string;
  volume24h?: string;
  high52w?: number;
  low52w?: number;
  sparkline: number[];
  candles?: CandleData[];
}

export interface SignalNews {
  id: string;
  ticker: string;
  title: string;
  timeAgo: string;
  type: 'positive' | 'negative' | 'neutral' | 'stats';
  impact: 'HIGH' | 'MED' | 'LOW';
  content?: string;
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  market: MarketCategory;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  currency: string;
}

export interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  timeAgo: string;
  ticker: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}