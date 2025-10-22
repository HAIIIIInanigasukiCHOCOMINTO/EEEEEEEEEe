import React from 'react';
// A simple data point for charts that only need a single value over time (e.g., market index, portfolio value).
export interface SimplePriceDataPoint {
  day: number;
  price: number;
}

// A comprehensive data point for stock history, including Open, High, Low, Close, and Volume.
export interface OHLCDataPoint {
    day: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface CorporateAI {
    nextCorporateActionDay: number;
    weights: {
        split: Record<string, number>;
        alliance: Record<string, number>;
        acquisition: Record<string, number>;
    };
    learningRate: number;
}

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  history: OHLCDataPoint[];
  corporateAI: CorporateAI;
  isDelisted?: boolean;
  sharesOutstanding: number;
  eps: number; // Earnings Per Share
}

export interface ShareLot {
  purchaseTime: string; // Changed from purchaseDay to be more precise
  purchasePrice: number;
  shares: number;
  purchaseIndicators: Record<string, number>;
}

export interface PortfolioItem {
  symbol: string;
  lots: ShareLot[];
}

// Tier 1 AI: Simple, reactive model
export interface InvestorStrategy {
  strategyType: 'simple';
  priceMomentumWeight: number;
  volatilityWeight: number;
  riskAversion: number;
}

// Tier 2 AI: More complex, uses technical indicators
export interface ComplexInvestorStrategy {
    strategyType: 'complex';
    weights: {
        growth: number; // Short-term momentum
        value: number;  // RSI-based, contrarian
        trend: number;  // Moving average crossovers
        safety: number; // Low volatility preference
    };
    riskAversion: number;
    tradeFrequency: number;
}

// Definition for the AI's neural network structure
export type NeuralNetworkWeights = 
  { networkType: 'single-layer', weights: Record<string, number> } |
  { networkType: 'multi-layer', weights1: Record<string, number[]>, weights2: number[], hiddenLayerSize: number } |
  { networkType: 'deep-layer', 
    inputNeuronNames: string[],
    // layerWeights[0] is Record<string, number[]> for input->h1
    // layerWeights[1...n] are number[][] for hidden->hidden and hidden->output
    layerWeights: (Record<string, number[]> | number[][])[], 
    layerSizes: number[] 
  };


// Tier 3 AI: Hyper-complex, uses many advanced indicators
export interface HyperComplexInvestorStrategy {
    strategyType: 'hyperComplex';
    network: NeuralNetworkWeights;
    riskAversion: number;
    tradeFrequency: number;
    learningRate: number;
}


export interface PortfolioValueHistoryPoint {
    day: number;
    value: number;
}

export interface RecentTrade {
    symbol: string;
    day: number;
    type: 'buy' | 'sell';
    shares: number;
    price: number;
    indicatorsAtTrade: Record<string, number>;
    activationsAtTrade?: (number[] | Record<string, number>)[]; // For multi/deep networks
    outcomeEvaluationDay: number;
}

export interface Investor {
  id: string;
  name: string;
  cash: number;
  portfolio: PortfolioItem[];
  strategy: InvestorStrategy | ComplexInvestorStrategy | HyperComplexInvestorStrategy;
  strategyName?: string;
  portfolioHistory: PortfolioValueHistoryPoint[];
  taxLossCarryforward: number;
  totalTaxesPaid: number;
  waAnnualNetLTCG: number;
  isHuman?: boolean;
  recentTrades: RecentTrade[];
}

export interface ActiveEvent {
    id: string; // Unique ID for each event
    day: number;
    stockSymbol: string | null;
    stockName: string | null;
    eventName: string; // The raw event name, e.g., "FDA Approval"
    description: string; // The raw event description
    headline: string; // The generated, catchy headline
    summary: string; // A short, generated summary for cards
    fullText: string; // The full, generated article text
    type: 'positive' | 'negative' | 'neutral' | 'split' | 'alliance' | 'merger';
    impact: number | Record<string, number>;
    imageUrl?: string;
    splitDetails?: { symbol: string; ratio: number; };
    allianceDetails?: { partners: [string, string]; };
    mergerDetails?: { acquiring: string; acquired: string; };
}

export interface TrackedCorporateAction {
    startDay: number;
    evaluationDay: number;
    stockSymbol: string;
    actionType: 'alliance' | 'acquisition';
    neuronValuesAtAction: Record<string, number>;
    startingStockPrice: number;
    startingMarketIndex: number;
}

export interface SimulationState {
  day: number;
  time: string; // Authoritative clock for the simulation
  startDate: string; // ISO string for the start date of the simulation
  stocks: Stock[];
  investors: Investor[];
  activeEvent: ActiveEvent | null;
  eventHistory: ActiveEvent[];
  marketIndexHistory: SimplePriceDataPoint[];
  nextCorporateEventDay: number;
  nextMacroEventDay: number;
  trackedCorporateActions: TrackedCorporateAction[];
}

export type Page = 'home' | 'portfolio' | 'markets' | 'aii';

// Data structure for the enhanced markets page table
export interface StockListData extends Stock {
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    peRatio: number;
    high52w: number;
    low52w: number;
    trendingScore: number;
}
