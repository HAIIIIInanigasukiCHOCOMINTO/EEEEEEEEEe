import React, { useState, useMemo } from 'react';
import { Stock } from '../types';
import StockMarketTable, { StockListData } from '../components/StockMarketTable';

type MarketListType = 'active' | 'trending' | 'gainers' | 'losers' | '52w_high' | '52w_low';

const MarketTab: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2
            ${active 
                ? 'text-accent border-accent' 
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-500'
            }`}
    >
        {label}
    </button>
);

const MarketsPage: React.FC<{
    stocks: Stock[];
    onSelectStock: (symbol: string) => void;
    searchQuery: string;
}> = ({ stocks, onSelectStock, searchQuery }) => {
    const [activeTab, setActiveTab] = useState<MarketListType>('active');

    const marketData = useMemo(() => {
        const data: Record<MarketListType, StockListData[]> = {
            active: [],
            trending: [],
            gainers: [],
            losers: [],
            '52w_high': [],
            '52w_low': [],
        };

        const stocksWithMetrics = stocks.map(stock => {
            const history = stock.history;
            const current = history[history.length - 1];
            const prev = history[history.length - 2];
            if (!current || !prev) return null;

            const changePercent = (current.close - prev.close) / prev.close;
            
            const history52w = history.slice(-252);
            const high52w = Math.max(...history52w.map(h => h.high));
            const low52w = Math.min(...history52w.map(h => h.low));

            // Trending metric: recent volatility * recent volume change
            const history5d = history.slice(-5);
            const prices5d = history5d.map(h => h.close);
            const avgPrice5d = prices5d.reduce((a, b) => a + b, 0) / prices5d.length;
            const volatility5d = Math.sqrt(prices5d.map(p => Math.pow(p - avgPrice5d, 2)).reduce((a,b)=>a+b,0) / prices5d.length) / avgPrice5d;
            
            const volumes5d = history5d.map(h => h.volume);
            const avgVolume5d = volumes5d.reduce((a, b) => a + b, 0) / volumes5d.length;
            const volumeSpike = current.volume / avgVolume5d;

            const trendingScore = volatility5d * volumeSpike;

            return {
                ...stock,
                price: current.close,
                changePercent,
                volume: current.volume,
                high52w,
                low52w,
                trendingScore,
            };
        }).filter(Boolean) as (Stock & StockListData)[];

        // Most Active
        data.active = [...stocksWithMetrics].sort((a, b) => b.volume - a.volume);
        
        // Trending
        data.trending = [...stocksWithMetrics].sort((a, b) => b.trendingScore - a.trendingScore);

        // Gainers & Losers
        const sortedByChange = [...stocksWithMetrics].sort((a, b) => b.changePercent - a.changePercent);
        data.gainers = sortedByChange.slice(0, 25);
        data.losers = sortedByChange.slice(-25).reverse();
        
        // 52 Week Highs & Lows
        data['52w_high'] = [...stocksWithMetrics].sort((a, b) => (b.price / b.high52w) - (a.price / a.high52w));
        data['52w_low'] = [...stocksWithMetrics].sort((a, b) => (a.price / a.low52w) - (b.price / b.low52w));

        return data;
    }, [stocks]);
    
    const filteredData = useMemo(() => {
        if (!searchQuery) return marketData[activeTab];
        const lowercasedQuery = searchQuery.toLowerCase();
        return marketData[activeTab].filter(stock =>
            stock.name.toLowerCase().includes(lowercasedQuery) ||
            stock.symbol.toLowerCase().includes(lowercasedQuery)
        );
    }, [marketData, activeTab, searchQuery]);

    const TABS: { key: MarketListType; label: string }[] = [
        { key: 'active', label: 'Most Active' },
        { key: 'trending', label: 'Trending' },
        { key: 'gainers', label: 'Top Gainers' },
        { key: 'losers', label: 'Top Losers' },
        { key: '52w_high', label: '52-Week Highs' },
        { key: '52w_low', label: '52-Week Lows' },
    ];
    
    const pageTitle = TABS.find(t => t.key === activeTab)?.label || "Markets";
    
    return (
        <div>
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-200">{pageTitle}</h1>
                <p className="text-gray-400">Explore market data from different perspectives.</p>
            </div>

            <div className="border-b border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                    {TABS.map(tab => (
                        <MarketTab
                            key={tab.key}
                            label={tab.label}
                            active={activeTab === tab.key}
                            onClick={() => setActiveTab(tab.key)}
                        />
                    ))}
                </nav>
            </div>
            
             <div className="bg-gray-800 rounded-md border border-gray-700">
                <StockMarketTable
                    listType={activeTab}
                    stocks={filteredData}
                    onSelectStock={onSelectStock}
                    searchQuery={searchQuery}
                />
             </div>
        </div>
    );
};

export default MarketsPage;
