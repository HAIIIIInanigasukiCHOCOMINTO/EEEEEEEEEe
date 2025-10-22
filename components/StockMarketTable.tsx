import React from 'react';
import { Stock } from '../types';

export interface StockListData extends Stock {
    price: number;
    changePercent: number;
    volume: number;
    high52w: number;
    low52w: number;
    trendingScore: number;
}

type MarketListType = 'active' | 'trending' | 'gainers' | 'losers' | '52w_high' | '52w_low';

interface StockMarketTableProps {
    listType: MarketListType;
    stocks: StockListData[];
    onSelectStock: (symbol: string) => void;
    searchQuery: string;
}

const formatNum = (num: number, type: 'currency' | 'percent' | 'decimal' | 'integer') => {
    switch(type) {
        case 'currency': return `$${num.toFixed(2)}`;
        case 'percent': return `${(num * 100).toFixed(2)}%`;
        case 'decimal': return num.toFixed(2);
        case 'integer': 
            if (num > 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
            if (num > 1_000) return `${(num / 1_000).toFixed(1)}K`;
            return num.toString();
    }
}

const COLUMNS_CONFIG: Record<MarketListType, { label: string; key: keyof StockListData; format: 'currency' | 'percent' | 'decimal' | 'integer' }[]> = {
    active: [
        { label: 'Volume', key: 'volume', format: 'integer' },
    ],
    trending: [
        { label: 'Trending Score', key: 'trendingScore', format: 'decimal' },
    ],
    gainers: [
        { label: '% Change', key: 'changePercent', format: 'percent' },
    ],
    losers: [
        { label: '% Change', key: 'changePercent', format: 'percent' },
    ],
    '52w_high': [
        { label: '52-Wk High', key: 'high52w', format: 'currency' },
    ],
    '52w_low': [
        { label: '52-Wk Low', key: 'low52w', format: 'currency' },
    ],
};

const StockMarketTable: React.FC<StockMarketTableProps> = ({ listType, stocks, onSelectStock, searchQuery }) => {
    const customColumns = COLUMNS_CONFIG[listType];
    
    return (
        <div>
            <div className="grid grid-cols-12 gap-4 items-center px-4 py-2 border-b border-gray-700 text-xs text-gray-400 font-bold uppercase tracking-wider">
                <div className="col-span-4">Name</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">% Change</div>
                {customColumns.map(col => (
                    <div key={col.key} className="col-span-2 text-right">{col.label}</div>
                ))}
            </div>
            <div>
                {stocks.length > 0 ? (
                    stocks.map(stock => (
                        <div
                            key={stock.symbol}
                            onClick={() => onSelectStock(stock.symbol)}
                            className="grid grid-cols-12 gap-4 items-center px-4 py-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-900/75 cursor-pointer transition-colors duration-150 text-sm"
                        >
                            <div className="col-span-4 truncate">
                                <p className="font-bold text-gray-200">{stock.symbol}</p>
                                <p className="text-xs text-gray-400 truncate">{stock.name}</p>
                            </div>
                            <div className="col-span-2 text-right font-mono text-gray-200">
                                {formatNum(stock.price, 'currency')}
                            </div>
                            <div className={`col-span-2 text-right font-mono font-semibold ${stock.changePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                                {stock.changePercent >= 0 ? '+' : ''}{formatNum(stock.changePercent, 'percent')}
                            </div>
                            {customColumns.map(col => (
                                <div key={col.key} className="col-span-2 text-right font-mono text-gray-300">
                                    {formatNum(stock[col.key] as number, col.format)}
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="text-center p-10 text-gray-500">
                        {searchQuery 
                            ? `No stocks found for "${searchQuery}" in this list.`
                            : `No stocks to display in the "${listType}" category.`}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockMarketTable;
