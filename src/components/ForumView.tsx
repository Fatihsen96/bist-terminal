import React, { useState } from 'react';
import { ForumPost } from '../types';
import { MessageSquare, ThumbsUp, Plus, TrendingUp, TrendingDown, Send } from 'lucide-react';

interface ForumViewProps {
  posts: ForumPost[];
  onAddPost: (post: Omit<ForumPost, 'id' | 'likes' | 'commentsCount' | 'timeAgo'>) => void;
}

export const ForumView: React.FC<ForumViewProps> = ({ posts, onAddPost }) => {
  const [filterSentiment, setFilterSentiment] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  const [title, setTitle] = useState('');
  const [ticker, setTicker] = useState('THYAO');
  const [sentiment, setSentiment] = useState<'BULLISH' | 'BEARISH' | 'NEUTRAL'>('BULLISH');
  const [content, setContent] = useState('');

  const [likedPosts, setLikedPosts] = useState<Record<string, number>>({});

  const filteredPosts = posts.filter((p) => {
    if (filterSentiment === 'ALL') return true;
    return p.sentiment === filterSentiment;
  });

  const handleLike = (id: string, initialLikes: number) => {
    setLikedPosts((prev) => {
      const current = prev[id] !== undefined ? prev[id] : initialLikes;
      return { ...prev, [id]: current + 1 };
    });
  };

  const handleSubmitNewPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddPost({
      author: 'You (Terminal Trader)',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3QcTL7wU1ef6leUPxx-q3ePdHJf3Y2FTs1J-izSOKRDACFdQOT4ZowuHukggvlTpWCg_KMq_HOw7zOB-USfQ0TT0UStN-XQ2xBTOHPDOz4SWY0rVWlpfugMw7DPC9BX1Bq8RoSJipTvsrcKWn8s9lzrhJSPBYZSXlUniy64DCq3LGEJ4EBhcxbDY5_aC16EgWx79RhyLAFooY4Cg0i2wRg02M3WxlG4z4NburZQgEyzi6E7khS_i3wjSxvlb2KFCPK2J-HjF1tMM',
      ticker: ticker.toUpperCase(),
      title,
      content,
      sentiment,
    });

    setTitle('');
    setContent('');
    setShowNewPostModal(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 custom-scrollbar select-none">
      {/* Header Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 glass-panel p-4 rounded-2xl border border-[#1f1f2e]">
        <div>
          <h2 className="font-headline font-bold text-lg text-[#dee3e8] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#38bdf8]" />
            Trader Community Forum
          </h2>
          <p className="text-xs text-[#94a3b8]">Live market discourse, valuation debates, and catalyst analysis</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Sentiment */}
          <div className="flex gap-1 bg-[#101017] p-1 rounded-lg border border-[#1f1f2e]">
            {(['ALL', 'BULLISH', 'BEARISH'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSentiment(s)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                  filterSentiment === s
                    ? 'bg-[#38bdf8] text-[#001e2c]'
                    : 'text-[#87929a] hover:text-[#dee3e8]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNewPostModal(true)}
            className="px-4 py-2 bg-[#38bdf8] text-[#00354a] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#38bdf8]/15 hover:bg-[#7bd0ff]"
          >
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const currentLikes = likedPosts[post.id] !== undefined ? likedPosts[post.id] : post.likes;
          return (
            <div key={post.id} className="glass-panel p-5 rounded-2xl border border-[#1f1f2e] space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img src={post.avatar} alt={post.author} className="w-9 h-9 rounded-full object-cover border border-[#1f1f2e]" />
                  <div>
                    <span className="font-bold text-xs text-[#dee3e8] block">{post.author}</span>
                    <span className="text-[10px] text-[#87929a] font-mono">{post.timeAgo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#101017] border border-[#1f1f2e] text-xs font-mono font-bold text-[#38bdf8]">
                    ${post.ticker}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      post.sentiment === 'BULLISH'
                        ? 'bg-[#34d399]/20 text-[#34d399]'
                        : post.sentiment === 'BEARISH'
                        ? 'bg-[#fb7185]/20 text-[#fb7185]'
                        : 'bg-[#fbbf24]/20 text-[#fbbf24]'
                    }`}
                  >
                    {post.sentiment}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-headline font-bold text-sm text-[#dee3e8] mb-1">{post.title}</h3>
                <p className="text-xs text-[#bdc8d1] leading-relaxed">{post.content}</p>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-[#1f1f2e]/60 text-xs text-[#87929a] font-mono">
                <button
                  onClick={() => handleLike(post.id, post.likes)}
                  className="flex items-center gap-1.5 hover:text-[#38bdf8] cursor-pointer transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{currentLikes} Likes</span>
                </button>
                <div className="flex items-center gap-1.5 hover:text-[#38bdf8] cursor-pointer">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.commentsCount} Comments</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-[#1f1f2e] p-6 shadow-2xl space-y-4">
            <h3 className="font-headline font-bold text-base text-[#dee3e8] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#38bdf8]" />
              Create Forum Post
            </h3>

            <form onSubmit={handleSubmitNewPost} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[#87929a] uppercase block mb-1">Ticker Symbol</label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="e.g. THYAO, META, BTC..."
                  className="w-full px-3 py-2 bg-[#070709] border border-[#1f1f2e] rounded-lg text-xs text-[#dee3e8] font-mono focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#87929a] uppercase block mb-1">Sentiment</label>
                <div className="grid grid-cols-3 gap-2 bg-[#070709] p-1 rounded-xl border border-[#1f1f2e]">
                  {(['BULLISH', 'NEUTRAL', 'BEARISH'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSentiment(s)}
                      className={`py-1.5 text-xs font-mono font-bold rounded-lg cursor-pointer ${
                        sentiment === s ? 'bg-[#38bdf8] text-[#001e2c]' : 'text-[#87929a]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#87929a] uppercase block mb-1">Post Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Earnings Catalyst Breakdown..."
                  className="w-full px-3 py-2 bg-[#070709] border border-[#1f1f2e] rounded-lg text-xs text-[#dee3e8] focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#87929a] uppercase block mb-1">Analysis Content</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your technical levels, margin thesis, or macro drivers..."
                  className="w-full px-3 py-2 bg-[#070709] border border-[#1f1f2e] rounded-lg text-xs text-[#dee3e8] focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-xs text-[#87929a] hover:text-[#dee3e8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#38bdf8] text-[#00354a] font-bold text-xs rounded-xl hover:bg-[#7bd0ff] cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
