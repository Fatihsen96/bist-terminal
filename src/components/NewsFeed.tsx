import React, { useState, useEffect } from 'react';
import { SignalNews } from '../types';
import { TrendingUp, AlertTriangle, Info, BarChart2, Radio, ExternalLink } from 'lucide-react';

interface NewsFeedProps {
  newsItems?: SignalNews[];
  onSelectTicker?: (ticker: string) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ newsItems = [], onSelectTicker }) => {
  const [liveNews, setLiveNews] = useState<SignalNews[]>(newsItems);
  const [loading, setLoading] = useState<boolean>(true);

  // Üst bileşenden haber gelirse günceller
  useEffect(() => {
    if (newsItems && newsItems.length > 0) {
      setLiveNews(newsItems);
      setLoading(false);
    }
  }, [newsItems]);

  // --- 15 SANİYEDE BİR CANLI KAP & NLP HABER AKIŞI DÖNGÜSÜ ---
  useEffect(() => {
    const fetchLiveNews = async () => {
      try {
        const response = await fetch('/api/haberler');
        if (response.ok) {
          const data = await response.json();
          if (data && data.news && Array.isArray(data.news) && data.news.length > 0) {
            setLiveNews(data.news);
          }
        }
      } catch (error) {
        console.error('Canlı haber akışı çekilemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    // İlk açılışta canlı verileri çek
    fetchLiveNews();

    // Her 15 saniyede bir arka planda sessizce haberleri güncelle
    const intervalId = setInterval(fetchLiveNews, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const getIcon = (type: SignalNews['type']) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-[#34d399]" />;
      case 'negative':
        return <AlertTriangle className="w-4 h-4 text-[#fb7185]" />;
      case 'neutral':
        return <Info className="w-4 h-4 text-[#38bdf8]" />;
      case 'stats':
      default:
        return <BarChart2 className="w-4 h-4 text-[#bdc8d1]" />;
    }
  };

  const getContainerClass = (type: SignalNews['type']) => {
    switch (type) {
      case 'positive':
        return 'bg-[#34d399]/10 text-[#34d399]';
      case 'negative':
        return 'bg-[#fb7185]/10 text-[#fb7185]';
      case 'neutral':
        return 'bg-[#38bdf8]/10 text-[#38bdf8]';
      case 'stats':
      default:
        return 'bg-[#1f1f2e] text-[#bdc8d1]';
    }
  };

  const handleNewsClick = (item: SignalNews) => {
    const newsUrl = (item as any).url || (item as any).link;
    if (newsUrl) {
      window.open(newsUrl, '_blank', 'noopener,noreferrer');
    } else {
      if (onSelectTicker && item.ticker) {
        onSelectTicker(item.ticker);
      } else {
        alert(`${item.title}\n\n${item.content || 'Detaylı özet bulunmuyor.'}`);
      }
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full border border-[#1f1f2e] select-none">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#dee3e8] flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-[#38bdf8] animate-pulse" />
          Signal News Feed
        </h3>
        <span className="text-[10px] font-mono text-[#38bdf8] px-1.5 py-0.5 rounded bg-[#38bdf8]/10 border border-[#38bdf8]/30">
          LIVE STREAM
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {loading && liveNews.length === 0 ? (
          <div className="text-slate-500 font-mono text-xs text-center py-6">
            Canlı KAP ve NLP Akışı Yükleniyor...
          </div>
        ) : liveNews.length > 0 ? (
          liveNews.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNewsClick(item)}
              className="flex gap-3 items-start border-b border-[#1f1f2e]/60 pb-3 hover:bg-[#171c20]/80 p-1.5 rounded transition-all cursor-pointer group"
            >
              <div className={`p-2 rounded-lg shrink-0 ${getContainerClass(item.type)}`}>
                {getIcon(item.type)}
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-mono font-bold text-[#38bdf8] group-hover:underline flex items-center gap-1">
                    ${item.ticker}
                    <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="text-[10px] text-[#87929a] font-mono">{item.timeAgo}</span>
                </div>
                <p className="text-xs text-[#dee3e8] font-medium leading-tight mt-0.5 group-hover:text-[#38bdf8] transition-colors">
                  {item.title}
                </p>
                {item.content && (
                  <p className="text-[11px] text-[#94a3b8] mt-1 line-clamp-2 leading-relaxed font-sans">
                    {item.content}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-slate-500 font-mono text-xs text-center py-6">
            Henüz canlı bildirim bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
};
