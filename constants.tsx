import React from 'react';
import { InvestorStrategy, ComplexInvestorStrategy, HyperComplexInvestorStrategy, NeuralNetworkWeights } from './types';

// Fix: Add a specific type for corporate event configurations to improve type safety.
interface CorporateEventConfig {
  name: string;
  description: string;
  impact: number;
  type: 'positive' | 'negative';
}

type InvestorConfig = {
  id: string;
  name: string;
  isHuman?: boolean;
  strategyName?: string;
  strategy: InvestorStrategy | ComplexInvestorStrategy | HyperComplexInvestorStrategy;
};


export const STOCK_SYMBOLS = [
  { symbol: 'INNV', name: 'Innovate Corp', sector: 'Technology' },
  { symbol: 'TECH', name: 'TechGen Inc.', sector: 'Technology' },
  { symbol: 'HLTH', name: 'HealthSphere', sector: 'Health' },
  { symbol: 'ENRG', name: 'Syner-G', sector: 'Energy' },
  { symbol: 'FINX', name: 'FinEx Solutions', sector: 'Finance' },
  { symbol: 'QUAN', name: 'Quantum Leap', sector: 'Technology' },
  { symbol: 'CYBR', name: 'CyberSec Corp', sector: 'Technology' },
  { symbol: 'BIOF', name: 'BioFuture Labs', sector: 'Health' },
  { symbol: 'SOLR', name: 'Solaris Energy', sector: 'Energy' },
  { symbol: 'DRON', name: 'DroneWorks', sector: 'Technology' },
  { symbol: 'DATA', name: 'DataMine Inc.', sector: 'Technology' },
  { symbol: 'ROBO', name: 'RoboGenix', sector: 'Technology' },
  { symbol: 'AQUA', name: 'AquaPure', sector: 'Industrials' },
  { symbol: 'FUTR', name: 'Futuristics', sector: 'Industrials' },
  { symbol: 'SPCE', name: 'SpaceWarp', sector: 'Industrials' },
  { symbol: 'NANO', name: 'NanoBuild', sector: 'Technology' },
  { symbol: 'VRTX', name: 'Vertex Realty', sector: 'Finance' },
  { symbol: 'GAME', name: 'GameSphere', sector: 'Technology' },
  { symbol: 'MEDI', name: 'MediCare+', sector: 'Health' },
  { symbol: 'AGRI', name: 'AgriGrow', sector: 'Industrials' },
  // Technology Additions
  { symbol: 'EDGE', name: 'Edge AI Systems', sector: 'Technology' },
  { symbol: 'CLD', name: 'CloudCore Inc.', sector: 'Technology' },
  { symbol: 'VR', name: 'Virtual Reality Labs', sector: 'Technology' },
  { symbol: 'IOT', name: 'Internet of Things Co.', sector: 'Technology' },
  { symbol: 'SFTW', name: 'Software Solutions', sector: 'Technology' },
  { symbol: 'LOGI', name: 'LogiCore', sector: 'Technology' },
  // Health Additions
  { symbol: 'GENE', name: 'Genomics PLC', sector: 'Health' },
  { symbol: 'TELE', name: 'TeleHealth Connect', sector: 'Health' },
  { symbol: 'SURG', name: 'Surgical Systems', sector: 'Health' },
  { symbol: 'VITA', name: 'VitaPharm', sector: 'Health' },
  { symbol: 'CARE', name: 'CareBotics', sector: 'Health' },
  { symbol: 'IMMU', name: 'ImmunoTherapeutics', sector: 'Health' },
  // Energy Additions
  { symbol: 'HYDR', name: 'HydroGen Power', sector: 'Energy' },
  { symbol: 'WIND', name: 'Windmill Corp', sector: 'Energy' },
  { symbol: 'NUCL', name: 'Nuclear Fusion Inc.', sector: 'Energy' },
  { symbol: 'BATT', name: 'BatteryTech', sector: 'Energy' },
  { symbol: 'GEO', name: 'GeoThermal Dynamics', sector: 'Energy' },
  { symbol: 'GRID', name: 'SmartGrid Systems', sector: 'Energy' },
  // Finance Additions
  { symbol: 'INSR', name: 'InsuranTech', sector: 'Finance' },
  { symbol: 'PAY', name: 'PaySphere', sector: 'Finance' },
  { symbol: 'LEND', name: 'LendLogic', sector: 'Finance' },
  { symbol: 'BLOK', name: 'BlockChain Ventures', sector: 'Finance' },
  { symbol: 'TRDE', name: 'TradeFlow', sector: 'Finance' },
  { symbol: 'WEAL', name: 'WealthWise', sector: 'Finance' },
  // Industrials Additions
  { symbol: 'AERO', name: 'AeroDynamics', sector: 'Industrials' },
  { symbol: 'SHIP', name: 'Global Shipping', sector: 'Industrials' },
  { symbol: 'BLD', name: 'BuildRight Construction', sector: 'Industrials' },
  { symbol: 'AUTO', name: 'AutoDrive Systems', sector: 'Industrials' },
  { symbol: 'CHEM', name: 'ChemiCorp', sector: 'Industrials' },
  { symbol: 'RAIL', name: 'RailWorks Logistics', sector: 'Industrials' },
];

export const MIN_INITIAL_STOCK_PRICE = 5;
export const MAX_INITIAL_STOCK_PRICE = 10;
export const INITIAL_HISTORY_LENGTH = 200; // Increased to support 200-day MA

export const INITIAL_INVESTOR_CASH = 100;
export const INFLATION_RATE = 0.0005; // Daily inflation rate applied as drift

export const MIN_CORPORATE_ACTION_INTERVAL = 100; // Min days between corporate actions
export const CORPORATE_ACTION_INTERVAL_RANGE = 50; // Random additional days
export const MIN_STOCK_SPLIT_PRICE = 150;
export const MAX_STOCK_SPLIT_PRICE = 300;

export const WASHINGTON_B_AND_O_TAX_RATES_BY_SECTOR: Record<string, number> = {
    // WA B&O "Service and Other Activities" rate is ~1.5%
    'Technology': 0.015,
    'Health': 0.015,
    'Finance': 0.015,
    // WA B&O "Manufacturing/Wholesaling" rate is ~0.484%
    'Energy': 0.00484,
    'Industrials': 0.00484,
};


// --- Dynamic AI Neural Network Generation ---

const NEURON_POOL = [
    'momentum_5d', 'momentum_10d', 'momentum_20d', 'momentum_50d',
    'trend_price_vs_sma_10', 'trend_price_vs_sma_20', 'trend_price_vs_sma_50', 'trend_price_vs_sma_100', 'trend_price_vs_sma_200',
    'trend_sma_crossover_10_20', 'trend_sma_crossover_20_50', 'trend_sma_crossover_50_200',
    'trend_price_vs_ema_10', 'trend_price_vs_ema_20', 'trend_price_vs_ema_50',
    'trend_ema_crossover_10_20', 'trend_ema_crossover_20_50',
    'oscillator_rsi_7_contrarian', 'oscillator_rsi_14_contrarian', 'oscillator_rsi_21_contrarian',
    'oscillator_stochastic_k_14_contrarian', 'oscillator_stochastic_d_14_contrarian',
    'oscillator_cci_20_contrarian', 'oscillator_williams_r_14_contrarian',
    'volatility_bollinger_bandwidth_20', 'volatility_bollinger_percent_b_20',
    'volatility_atr_14', 'volatility_historical_20d',
    'volume_obv_trend_20d', 'volume_cmf_20', 'volume_avg_20d_spike',
    'macd_histogram', 'macd_divergence_10d'
];

const NEURON_PREFIX_MAP: Record<string, string> = {
    'momentum': 'Momentum',
    'trend': 'Trend',
    'oscillator': 'Contrarian',
    'volatility': 'Volatility',
    'volume': 'Volume',
    'macd': 'MACD'
};

const generateStrategyName = (weights: Record<string, number>): string => {
    const sorted = Object.entries(weights).sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));
    if (sorted.length === 0) return 'Passive';
    
    const primaryNeuron = sorted[0][0];
    const primaryPrefix = primaryNeuron.split('_')[0];
    const primaryName = NEURON_PREFIX_MAP[primaryPrefix] || 'Complex';

    if (sorted.length < 2) return `${primaryName} Focused`;

    const secondaryNeuron = sorted[1][0];
    const secondaryPrefix = secondaryNeuron.split('_')[0];
    const secondaryName = NEURON_PREFIX_MAP[secondaryPrefix] || 'Strategy';

    if (primaryName === secondaryName) return `${primaryName} Specialist`;
    return `${primaryName}-${secondaryName} Hybrid`;
}

const generateInvestorAI = (id: string, name: string, minNeurons: number, maxNeurons: number): InvestorConfig => {
    const numNeurons = Math.floor(Math.random() * (maxNeurons - minNeurons + 1)) + minNeurons;
    const shuffledNeurons = [...NEURON_POOL].sort(() => 0.5 - Math.random());
    const selectedNeurons = shuffledNeurons.slice(0, numNeurons);
    
    const weights: Record<string, number> = {};
    selectedNeurons.forEach(name => {
        weights[name] = (Math.random() * 2 - 1) * 1.5; // Random weight between -1.5 and 1.5
    });

    const network: NeuralNetworkWeights = {
        networkType: 'single-layer',
        weights: weights,
    };

    return {
        id,
        name,
        strategyName: generateStrategyName(weights),
        strategy: {
            strategyType: 'hyperComplex',
            network: network,
            riskAversion: 0.8 + Math.random() * 1.7, // Random risk aversion between 0.8 and 2.5
            tradeFrequency: Math.random() * 0.4 + 0.1, // Not used in current model, but good for future use
            learningRate: 0.005 + Math.random() * 0.015, // AI learning speed (0.005 to 0.02)
        }
    }
};

const AI_NAMES = [
    'Nexus Alpha', 'Quantum Blue', 'Momentum Prime', 'Value Core', 
    'Volatility Edge', 'Trend Rider', 'Contrarian Fund', 'Growth Engine', 'Omega Capital',
    'Stellar Ascent', 'Apex Dynamics', 'Momentum Machines', 'Vertex Ventures', 'Orion Capital', 
    'Helios Holdings', 'Zenith Wealth', 'Polaris Partners', 'Crestview Capital', 'Bluechip Bets', 
    'Phoenix Funds', 'Galactic Growth', 'Titan Traders', 'Elysian Equities', 'Vanguard Vision', 
    'Sierra Strategies', 'Neptune Navigators', 'Apollo Analytics', 'Meridian Markets', 'Odyssey Ops', 
    'Cascade Capital', 'Ironclad Investments', 'Summit Seekers', 'Delta Derivatives', 'Alpha Wave', 
    'Beta Builders', 'Gamma Gains', 'Theta Traders', 'Intrinsic Value', 'Market Mavericks',
    'Axiom Arbitrage', 'Cygnus Capital', 'Dragonfly Dynamics', 'Echo Equities', 'Fusion Financial',
    'Griffin Growth', 'Hydra Holdings', 'Infinity Investments', 'Javelin Ventures', 'Kestrel Capital'
];

const HIDDEN_LAYER_SIZE = 5;
// Maintain the original ratio of advanced AIs (5 out of 9) to preserve the simulation's composition.
const ADVANCED_AI_COUNT = Math.round(AI_NAMES.length * (12 / 50));
const EXTRA_NEURONS_FOR_ADVANCED_AI = 10;

export const buildInvestors = (): InvestorConfig[] => {
    const humanPlayer: InvestorConfig = {
        id: 'human-player',
        name: 'You',
        isHuman: true,
        strategy: {
            strategyType: 'simple', priceMomentumWeight: 0, volatilityWeight: 0, riskAversion: 999
        }
    };
    
    let aiInvestors: InvestorConfig[] = AI_NAMES.map((name, index) => {
        const minNeurons = 3 + Math.floor(Math.random() * 5); // 3-7 neurons minimum
        const maxNeurons = minNeurons + 5 + Math.floor(Math.random() * 10); // More varied max neurons
        return generateInvestorAI(`investor-${index + 1}`, name, minNeurons, maxNeurons);
    });

    // --- Upgrade random AIs to a multi-layer network ---
    let shuffledAIs = [...aiInvestors].sort(() => 0.5 - Math.random());
    const selectedForMultiLayer = shuffledAIs.slice(0, ADVANCED_AI_COUNT);

    selectedForMultiLayer.forEach(ai => {
        const strategy = ai.strategy as HyperComplexInvestorStrategy;
        if (strategy.network.networkType === 'single-layer') {
            const currentNeurons = Object.keys(strategy.network.weights);
            
            // Add new neurons
            const availableNewNeurons = NEURON_POOL.filter(n => !currentNeurons.includes(n));
            const extraNeurons = availableNewNeurons.sort(() => 0.5 - Math.random()).slice(0, EXTRA_NEURONS_FOR_ADVANCED_AI);
            const allNeuronNames = [...currentNeurons, ...extraNeurons];

            // Create new multi-layer network
            const weights1: Record<string, number[]> = {};
            allNeuronNames.forEach(neuronName => {
                weights1[neuronName] = Array.from({ length: HIDDEN_LAYER_SIZE }, () => (Math.random() * 2 - 1) * 0.5);
            });

            const weights2: number[] = Array.from({ length: HIDDEN_LAYER_SIZE }, () => (Math.random() * 2 - 1));

            strategy.network = {
                networkType: 'multi-layer',
                weights1: weights1,
                weights2: weights2,
                hiddenLayerSize: HIDDEN_LAYER_SIZE,
            };

            ai.strategyName = `Advanced ${ai.strategyName}`;
        }
    });

    // --- Evolve AI population: create smartness tiers and a super AI ---
    shuffledAIs = [...aiInvestors].sort(() => 0.5 - Math.random());
    
    // Tier 1 "Smarter" AIs (10 investors)
    shuffledAIs.slice(0, 10).forEach(ai => {
        (ai.strategy as HyperComplexInvestorStrategy).learningRate *= 1.2;
    });

    // Tier 2 "Smarter" AIs (5 investors)
    shuffledAIs.slice(10, 15).forEach(ai => {
        (ai.strategy as HyperComplexInvestorStrategy).learningRate *= 1.4;
    });

    // Tier 3 "Smarter" AIs (3 investors)
    shuffledAIs.slice(15, 18).forEach(ai => {
        (ai.strategy as HyperComplexInvestorStrategy).learningRate *= 1.6;
    });
    
    // Tier 4 "Super AI" (1 investor)
    const superInvestor = shuffledAIs[18];
    if (superInvestor) {
        const strategy = superInvestor.strategy as HyperComplexInvestorStrategy;
        
        let currentNeurons: string[] = [];
        if (strategy.network.networkType === 'single-layer') {
            currentNeurons = Object.keys(strategy.network.weights);
        } else if (strategy.network.networkType === 'multi-layer') {
            currentNeurons = Object.keys(strategy.network.weights1);
        }

        // Add 25 new neurons
        const availableNewNeurons = NEURON_POOL.filter(n => !currentNeurons.includes(n));
        const extraNeurons = availableNewNeurons.sort(() => 0.5 - Math.random()).slice(0, 25);
        const allNeuronNames = [...currentNeurons, ...extraNeurons].filter((v, i, a) => a.indexOf(v) === i); // Ensure unique

        const NUM_HIDDEN_LAYERS = 7;
        const HIDDEN_LAYER_NODE_COUNT = 5;
        const layerSizes = [allNeuronNames.length, ...Array(NUM_HIDDEN_LAYERS).fill(HIDDEN_LAYER_NODE_COUNT), 1];
        const layerWeights: (Record<string, number[]> | number[][])[] = [];

        // Layer 0: Input -> H1
        const weights_in_h1: Record<string, number[]> = {};
        allNeuronNames.forEach(neuronName => {
            weights_in_h1[neuronName] = Array.from({ length: layerSizes[1] }, () => (Math.random() * 2 - 1) * 0.5);
        });
        layerWeights.push(weights_in_h1);

        // Hidden layers & Output layer
        for (let i = 1; i < layerSizes.length - 1; i++) {
            const fromSize = layerSizes[i];
            const toSize = layerSizes[i + 1];
            const weights_h_h: number[][] = Array.from({ length: fromSize }, () => 
                Array.from({ length: toSize }, () => (Math.random() * 2 - 1) * 0.5)
            );
            layerWeights.push(weights_h_h);
        }

        strategy.network = {
            networkType: 'deep-layer',
            inputNeuronNames: allNeuronNames,
            layerWeights: layerWeights,
            layerSizes: layerSizes,
        };
        superInvestor.strategyName = `Super AI: ${superInvestor.strategyName}`;
    }

    return [humanPlayer, ...aiInvestors];
};


export const CORPORATE_EVENTS_BY_SECTOR: Record<string, { positive: CorporateEventConfig[], negative: CorporateEventConfig[] }> = {
    'Technology': {
        positive: [
            { name: 'Breakthrough AI Chip', description: 'Unveils a new chip, promising a 200% performance boost.', impact: 1.15, type: 'positive' },
            { name: 'Product Launch Success', description: 'New flagship product receives rave reviews and record pre-orders.', impact: 1.12, type: 'positive' },
            { name: 'Major Acquisition', description: 'Acquires a promising startup, expanding its market reach.', impact: 1.10, type: 'positive' },
        ],
        negative: [
            { name: 'Major Security Breach', description: 'Reports a massive data breach, compromising user data.', impact: 0.85, type: 'negative' },
            { name: 'Key Engineer Departs', description: 'Visionary lead engineer unexpectedly resigns.', impact: 0.92, type: 'negative' },
            { name: 'Product Recall', description: 'A critical flaw forces a recall of its latest product.', impact: 0.88, type: 'negative' },
        ],
    },
    'Health': {
        positive: [
            { name: 'FDA Approval', description: 'Receives full FDA approval for its flagship drug.', impact: 1.20, type: 'positive' },
            { name: 'Breakthrough Research', description: 'Publishes groundbreaking research with huge potential.', impact: 1.13, type: 'positive' },
            { name: 'Joins Major Health Index', description: 'Stock is added to a prestigious healthcare index.', impact: 1.08, type: 'positive' },
        ],
        negative: [
            { name: 'Clinical Trial Failure', description: 'Phase 3 clinical trials for a key drug have failed.', impact: 0.75, type: 'negative' },
            { name: 'Patent Expiration', description: 'Loses patent protection on a best-selling treatment.', impact: 0.90, type: 'negative' },
            { name: 'Unexpected Side Effects', description: 'New reports of severe side effects linked to its product.', impact: 0.87, type: 'negative' },
        ],
    },
    'Energy': {
        positive: [
            { name: 'New Efficiency Record', description: 'Achieves a new world record for energy conversion efficiency.', impact: 1.18, type: 'positive' },
            { name: 'Government Subsidy', description: 'Awarded a major government contract for green energy.', impact: 1.14, type: 'positive' },
            { name: 'Discovery of New Reserve', description: 'Announces the discovery of a massive new energy reserve.', impact: 1.11, type: 'positive' },
        ],
        negative: [
            { name: 'Environmental Accident', description: 'Responsible for a significant environmental incident.', impact: 0.82, type: 'negative' },
            { name: 'Regulatory Changes', description: 'New regulations will significantly increase operational costs.', impact: 0.91, type: 'negative' },
            { name: 'Infrastructure Failure', description: 'A critical piece of infrastructure has failed, halting production.', impact: 0.89, type: 'negative' },
        ],
    },
    'Finance': {
        positive: [
            { name: 'Positive Earnings Report', description: 'Reports quarterly earnings far exceeding expectations.', impact: 1.16, type: 'positive' },
            { name: 'New Fintech Platform', description: 'Launches an innovative new trading platform that goes viral.', impact: 1.12, type: 'positive' },
            { name: 'Interest Rate Hike', description: 'A surprise interest rate hike is expected to boost profits.', impact: 1.09, type: 'positive' },
        ],
        negative: [
            { name: 'Regulatory Fine', description: 'Hit with a massive fine for regulatory non-compliance.', impact: 0.86, type: 'negative' },
            { name: 'Credit Rating Downgrade', description: 'Company\'s credit rating is downgraded by a major agency.', impact: 0.90, type: 'negative' },
            { name: 'Trading System Outage', description: 'A day-long outage costs millions and damages its reputation.', impact: 0.93, type: 'negative' },
        ],
    },
    'Industrials': {
        positive: [
            { name: 'Major Infrastructure Contract', description: 'Wins a multi-billion dollar government infrastructure contract.', impact: 1.17, type: 'positive' },
            { name: 'Robotics Automation Deal', description: 'Signs a deal to automate the factories of a major client.', impact: 1.12, type: 'positive' },
            { name: 'Supply Chain Innovation', description: 'Develops a new logistics system, cutting costs by 30%.', impact: 1.10, type: 'positive' },
        ],
        negative: [
            { name: 'Union Strikes', description: 'Widespread union strikes have halted all production.', impact: 0.88, type: 'negative' },
            { name: 'Factory Accident', description: 'A major factory accident leads to costly repairs and lawsuits.', impact: 0.91, type: 'negative' },
            { name: 'Raw Material Costs Spike', description: 'A global shortage causes a sudden, sharp spike in material costs.', impact: 0.94, type: 'negative' },
        ],
    },
};

export const MACRO_EVENTS = [
    { 
        name: 'Global Recession', 
        description: 'A severe global recession begins, impacting all sectors of the economy.', 
        type: 'negative',
        impact: { default: 0.85, Health: 0.95 },
    },
    { 
        name: 'War Breaks Out', 
        description: 'A major geopolitical conflict erupts, causing market instability and boosting defense-related industries.', 
        type: 'negative',
        impact: { default: 0.90, Industrials: 1.15, Energy: 1.10 },
    },
    { 
        name: 'Widespread Famine', 
        description: 'Global crop failures lead to a widespread famine, disrupting supply chains and consumer spending.', 
        type: 'negative',
        impact: { default: 0.88, Industrials: 0.95 },
    },
    { 
        name: 'Technological Boom', 
        description: 'A wave of innovation sparks a technological boom, lifting markets to new highs.', 
        type: 'positive',
        impact: { default: 1.10, Technology: 1.25, Finance: 1.15 },
    },
    { 
        name: 'Global Pandemic', 
        description: 'A new pandemic sweeps the globe, leading to lockdowns and economic disruption.', 
        type: 'negative',
        impact: { default: 0.80, Health: 1.20, Technology: 1.10 },
    },
    {
        name: 'Peace Treaty Signed',
        description: 'A historic peace treaty is signed, ending a major conflict and boosting global market confidence.',
        type: 'positive',
        impact: { default: 1.10, Industrials: 0.90, Energy: 0.95 },
    }
];


export const SIMULATION_SPEEDS = [
    { label: '0.5x', delay: 1000 },
    { label: '1x', delay: 500 },
    { label: '2x', delay: 250 },
    { label: '5x', delay: 50 },
];

export const TAX_CONSTANTS = {
    LONG_TERM_HOLDING_PERIOD: 365, // days
    FEDERAL_LTCG_RATE: 0.15,
    WASHINGTON_LTCG_RATE: 0.07,
    WASHINGTON_CG_EXEMPTION: 262000, // For tax year 2023. This is the standard deduction.
    FEDERAL_STCG_BRACKETS: [
      { threshold: 1000, rate: 0.10 },
      { threshold: 5000, rate: 0.20 },
      { threshold: Infinity, rate: 0.30 },
    ],
  };

export const ICONS = {
    play: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>,
    pause: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" /></svg>,
    reset: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5m-1 5a9 9 0 110-18 9 9 0 010 18z" /></svg>,
};