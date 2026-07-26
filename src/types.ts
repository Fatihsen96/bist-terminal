export type MarketCategory = 'BIST' | 'US Markets' | 'Crypto' | 'Forex';

export type SignalType = 'STRONG BUY' | 'BUY' | 'WAIT' | 'OVERVALUED' | 'SELL';

export interface HealthMetrics {
  profit: number;    // 0-100
  debt: number;      // 0-100
  value: number;     // 0-100
  flow: number;      // 0-100
  momentum: number;  // 0-100
  sentiment: number; // 0-100
}

export interface StockItem {
  id: string;
  symbol: string;
  name: string;
  market: MarketCategory;
  price: number;
  currency: string;
  change24h: number;
  healthDots: number; // 1 to 5
  valueScore: number; // 0 to 100
  signal: SignalType;
  upside: number;     // e.g. +28.4 or -12.8
  sector: 'Tech' | 'Energy' | 'Healthcare' | 'Finance' | 'Industrials' | 'Consumer' | 'Crypto' | 'Commodity';
  primaryTag?: 'Strong Value' | 'Dividend King' | 'Growth Rebound' | 'High Momentum' | 'Low Beta' | 'AI Outlier';
  healthBreakdown: HealthMetrics;
  summary: string;
  aiThesis: string;
  peRatio?: number;
  marketCap?: string;
  volume24h?: string;
  high52w?: number;
  low52w?: number;
  sparkline: number[];
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
