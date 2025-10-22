import { SimulationState, Stock, Investor, SimplePriceDataPoint, PortfolioItem, ShareLot, ActiveEvent, HyperComplexInvestorStrategy, NeuralNetworkWeights, TrackedCorporateAction, OHLCDataPoint, RecentTrade } from '../types';
import { STOCK_SYMBOLS, MIN_INITIAL_STOCK_PRICE, MAX_INITIAL_STOCK_PRICE, INITIAL_HISTORY_LENGTH, INITIAL_INVESTOR_CASH, buildInvestors, INFLATION_RATE, TAX_CONSTANTS, CORPORATE_EVENTS_BY_SECTOR, MACRO_EVENTS, WASHINGTON_B_AND_O_TAX_RATES_BY_SECTOR, MIN_CORPORATE_ACTION_INTERVAL, CORPORATE_ACTION_INTERVAL_RANGE, MIN_STOCK_SPLIT_PRICE, MAX_STOCK_SPLIT_PRICE } from '../constants';
import { getImageForEvent } from './imageService';
import { generateNewsArticle } from './newsGenerationService';

// Helper to generate a random price/volume walk with OHLC data
const generateInitialHistory = (length: number, initialPrice: number): OHLCDataPoint[] => {
  const history: OHLCDataPoint[] = [];
  let lastClose = initialPrice;

  for (let i = 0; i < length; i++) {
    const open = lastClose;
    const volume = 100000 + Math.random() * 900000;
    
    const priceChangePercent = (Math.random() - 0.49) * 0.05;
    const close = Math.max(0.01, open * (1 + priceChangePercent));
    
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    
    history.push({ day: i + 1, open, high, low, close, volume: Math.round(volume) });
    lastClose = close;
  }
  return history;
};

const CORPORATE_NEURONS = [
    'self_momentum_50d', 'self_volatility_atr_14', 'price_vs_ath',
    'market_momentum_50d', 'sector_momentum_50d', 'opportunity_score'
];

const generateCorporateAIWeights = (): { split: Record<string, number>, alliance: Record<string, number>, acquisition: Record<string, number> } => {
    const weights: { split: Record<string, number>, alliance: Record<string, number>, acquisition: Record<string, number> } = {
        split: {}, alliance: {}, acquisition: {}
    };
    CORPORATE_NEURONS.forEach(neuron => {
        if (Math.random() > 0.4) weights.split[neuron] = (Math.random() * 2 - 1);
        if (Math.random() > 0.4) weights.alliance[neuron] = (Math.random() * 2 - 1);
        if (Math.random() > 0.4) weights.acquisition[neuron] = (Math.random() * 2 - 1);
    });
    return weights;
};

export const initializeState = (): SimulationState => {
  const startDate = new Date('2024-01-01T09:30:00Z');
  const stocks: Stock[] = STOCK_SYMBOLS.map(s => {
    const initialPrice = MIN_INITIAL_STOCK_PRICE + Math.random() * (MAX_INITIAL_STOCK_PRICE - MIN_INITIAL_STOCK_PRICE);
    const history = generateInitialHistory(INITIAL_HISTORY_LENGTH, initialPrice);
    return {
      ...s,
      history,
      corporateAI: {
          nextCorporateActionDay: INITIAL_HISTORY_LENGTH + MIN_CORPORATE_ACTION_INTERVAL + Math.floor(Math.random() * CORPORATE_ACTION_INTERVAL_RANGE),
          weights: generateCorporateAIWeights(),
          learningRate: 0.01 + Math.random() * 0.04, // Corporate learning rate
      },
      isDelisted: false,
      sharesOutstanding: 50_000_000 + Math.random() * 150_000_000,
      eps: 1.0 + Math.random() * 4.0,
    };
  });
  
  const INVESTORS_CONFIG = buildInvestors();
  const investors: Investor[] = INVESTORS_CONFIG.map(config => ({
    ...config,
    cash: INITIAL_INVESTOR_CASH,
    portfolio: [],
    portfolioHistory: [{day: INITIAL_HISTORY_LENGTH, value: INITIAL_INVESTOR_CASH}],
    taxLossCarryforward: 0,
    totalTaxesPaid: 0,
    waAnnualNetLTCG: 0,
    recentTrades: [],
  }));
  
  const day = INITIAL_HISTORY_LENGTH;

  // Initialize market index history
  const marketIndexHistory: SimplePriceDataPoint[] = [];
  for(let i = 0; i < INITIAL_HISTORY_LENGTH; i++) {
      const avgPrice = stocks.reduce((sum, stock) => sum + stock.history[i].close, 0) / stocks.length;
      marketIndexHistory.push({day: i + 1, price: avgPrice});
  }

  const initialTime = new Date(startDate.getTime());
  initialTime.setDate(initialTime.getDate() + day);

  return {
    day,
    time: initialTime.toISOString(),
    startDate: startDate.toISOString(),
    stocks,
    investors,
    activeEvent: null,
    eventHistory: [],
    marketIndexHistory,
    nextCorporateEventDay: day + 50 + Math.floor(Math.random() * 50),
    nextMacroEventDay: day + 200 + Math.floor(Math.random() * 165),
    trackedCorporateActions: [],
  };
};

// --- Technical Indicator Calculations ---

const calculateIndicators = (stock: Stock): Record<string, number> => {
    const indicators: Record<string, number> = {};
    const prices = stock.history.map(p => p.close);
    const volumes = stock.history.map(v => v.volume);
    if (prices.length < 2) return {};

    const currentPrice = prices[prices.length - 1];
    const prevPrice = prices[prices.length - 2];

    // Momentum
    [5, 10, 20, 50].forEach(p => {
        if(prices.length > p) indicators[`momentum_${p}d`] = (currentPrice / prices[prices.length - 1 - p]) - 1;
    });

    // SMA
    const smas: Record<string, number> = {};
    [10, 20, 50, 100, 200].forEach(p => {
        if (prices.length >= p) {
            const sma = prices.slice(-p).reduce((s, v) => s + v, 0) / p;
            smas[p] = sma;
            indicators[`trend_price_vs_sma_${p}`] = (currentPrice - sma) / sma;
        }
    });

    // SMA Crossovers
    if(smas[10] && smas[20]) indicators['trend_sma_crossover_10_20'] = (smas[10] - smas[20]) / smas[20];
    if(smas[20] && smas[50]) indicators['trend_sma_crossover_20_50'] = (smas[20] - smas[50]) / smas[50];
    if(smas[50] && smas[200]) indicators['trend_sma_crossover_50_200'] = (smas[50] - smas[200]) / smas[200];
    
    // EMA & Crossovers
    const calculateEMA = (data: number[], period: number) => {
        if(data.length < period) return null;
        const k = 2 / (period + 1);
        let ema = data.slice(0, period).reduce((s, v) => s + v, 0) / period;
        for (let i = period; i < data.length; i++) {
            ema = data[i] * k + ema * (1 - k);
        }
        return ema;
    };
    const emas: Record<string, number> = {};
    [10, 20, 50].forEach(p => {
        const ema = calculateEMA(prices, p);
        if(ema) {
            emas[p] = ema;
            indicators[`trend_price_vs_ema_${p}`] = (currentPrice - ema) / ema;
        }
    });
    if(emas[10] && emas[20]) indicators['trend_ema_crossover_10_20'] = (emas[10] - emas[20]) / emas[20];
    if(emas[20] && emas[50]) indicators['trend_ema_crossover_20_50'] = (emas[20] - emas[50]) / emas[50];

    // RSI
    [7, 14, 21].forEach(p => {
        if(prices.length > p) {
            const slice = prices.slice(-p-1);
            let gains = 0, losses = 0;
            for(let i = 1; i < slice.length; i++) {
                const change = slice[i] - slice[i-1];
                if(change > 0) gains += change;
                else losses += Math.abs(change);
            }
            const avgGain = gains / p;
            const avgLoss = losses / p;
            if (avgLoss > 0) {
                const rs = avgGain / avgLoss;
                const rsi = 100 - (100 / (1 + rs));
                indicators[`oscillator_rsi_${p}_contrarian`] = (50 - rsi) / 50; // Normalize to -1 to 1 range
            } else {
                 indicators[`oscillator_rsi_${p}_contrarian`] = 0;
            }
        }
    });
    
    // Stochastic Oscillator
    const stochPeriod = 14;
    if(prices.length >= stochPeriod) {
        const slice = prices.slice(-stochPeriod);
        const L14 = Math.min(...slice);
        const H14 = Math.max(...slice);
        const K = H14 > L14 ? 100 * (currentPrice - L14) / (H14 - L14) : 50;
        indicators['oscillator_stochastic_k_14_contrarian'] = (50 - K) / 50;
    }

    // Bollinger Bands
    const bbPeriod = 20;
    if(smas[bbPeriod]) {
        const stdDev = Math.sqrt(prices.slice(-bbPeriod).map(p => Math.pow(p - smas[bbPeriod], 2)).reduce((a, b) => a + b) / bbPeriod);
        const upper = smas[bbPeriod] + (stdDev * 2);
        const lower = smas[bbPeriod] - (stdDev * 2);
        indicators['volatility_bollinger_bandwidth_20'] = (upper - lower) / smas[bbPeriod];
        if(upper > lower) indicators['volatility_bollinger_percent_b_20'] = (currentPrice - lower) / (upper - lower);
    }
    
    // MACD
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    if(ema12 && ema26) {
        indicators['macd_histogram'] = (ema12 - ema26) / ema26;
    }
    
    // Volume
    const volPeriod = 20;
    if(volumes.length >= volPeriod) {
        const avgVol = volumes.slice(-volPeriod).reduce((s, v) => s + v, 0) / volPeriod;
        indicators['volume_avg_20d_spike'] = (volumes[volumes.length - 1] - avgVol) / avgVol;
    }

    // OBV (On-Balance Volume) trend
    const obvPeriod = 20;
    if (prices.length >= obvPeriod && volumes.length >= obvPeriod) {
        let obv = 0;
        const obvValues = [];
        for(let i = prices.length - obvPeriod; i < prices.length; i++) {
            if(prices[i] > prices[i-1]) obv += volumes[i];
            else if(prices[i] < prices[i-1]) obv -= volumes[i];
            obvValues.push(obv);
        }
        const obvSma = obvValues.reduce((s,v) => s+v, 0) / obvPeriod;
        if(obvSma !== 0) indicators['volume_obv_trend_20d'] = (obv - obvSma) / Math.abs(obvSma);
    }

    // CMF (Chaikin Money Flow)
    const cmfPeriod = 20;
    if (prices.length >= cmfPeriod && volumes.length >= cmfPeriod) {
        let mfvs = 0;
        let volSum = 0;
        for (let i = prices.length - cmfPeriod; i < prices.length; i++) {
            const mfm = (prices[i] - prevPrice) > 0 ? 1 : -1;
            mfvs += mfm * volumes[i];
            volSum += volumes[i];
        }
        if(volSum > 0) indicators['volume_cmf_20'] = mfvs / volSum;
    }

    // ATR (Average True Range) approximation
    const atrPeriod = 14;
    if (prices.length > atrPeriod) {
        const trs = [];
        for (let i = prices.length - atrPeriod; i < prices.length; i++) {
            trs.push(Math.abs(prices[i] - prices[i-1]));
        }
        const atr = trs.reduce((s,v) => s+v, 0) / atrPeriod;
        if (currentPrice > 0) indicators['volatility_atr_14'] = atr / currentPrice; // Normalized
    }

    return indicators;
};

// --- Main Simulation Logic ---
const getSharesOwned = (item: PortfolioItem | undefined): number => {
    if (!item) return 0;
    return item.lots.reduce((sum, lot) => sum + lot.shares, 0);
};

const calculateWashingtonTax = (investor: Investor): number => {
    if (investor.waAnnualNetLTCG <= TAX_CONSTANTS.WASHINGTON_CG_EXEMPTION) {
        return 0;
    }
    const taxableGain = investor.waAnnualNetLTCG - TAX_CONSTANTS.WASHINGTON_CG_EXEMPTION;
    return taxableGain * TAX_CONSTANTS.WASHINGTON_LTCG_RATE;
};

// --- Neural Network Forward Pass ---
const runForwardPass = (indicators: Record<string, number>, network: NeuralNetworkWeights): { score: number, allActivations?: (number[] | Record<string, number>)[] } => {
    if (network.networkType === 'single-layer') {
        let score = 0;
        for (const neuron in network.weights) {
            if (indicators[neuron] !== undefined) {
                score += indicators[neuron] * network.weights[neuron];
            }
        }
        return { score, allActivations: [indicators] };
    } else if (network.networkType === 'multi-layer') {
        const hiddenOutputs: number[] = new Array(network.hiddenLayerSize).fill(0);
        for (let i = 0; i < network.hiddenLayerSize; i++) {
            let hiddenInput = 0;
            for (const neuronName in network.weights1) {
                const indicatorValue = indicators[neuronName] || 0;
                hiddenInput += indicatorValue * network.weights1[neuronName][i];
            }
            hiddenOutputs[i] = Math.tanh(hiddenInput); // tanh activation function
        }
        
        let score = 0;
        for (let i = 0; i < network.hiddenLayerSize; i++) {
            score += hiddenOutputs[i] * network.weights2[i];
        }
        return { score, allActivations: [indicators, hiddenOutputs, [score]] };
    } else if (network.networkType === 'deep-layer') {
        const allActivations: (number[] | Record<string, number>)[] = [indicators];
        let currentLayerActivations: number[] = [];

        // Layer 0: Input -> H1
        const inputWeights = network.layerWeights[0] as Record<string, number[]>;
        const h1Size = network.layerSizes[1];
        const h1Activations = new Array(h1Size).fill(0);
        for(let i=0; i < h1Size; i++) {
            let hiddenInput = 0;
            for (const neuronName of network.inputNeuronNames) {
                const indicatorValue = indicators[neuronName] || 0;
                if (inputWeights[neuronName]) {
                    hiddenInput += indicatorValue * inputWeights[neuronName][i];
                }
            }
            h1Activations[i] = Math.tanh(hiddenInput);
        }
        allActivations.push(h1Activations);
        currentLayerActivations = h1Activations;

        // Loop through hidden layers (H1 -> H_last)
        for (let l = 1; l < network.layerWeights.length - 1; l++) {
            const prevLayerActivations = currentLayerActivations;
            const weights = network.layerWeights[l] as number[][];
            const nextLayerSize = network.layerSizes[l+1];
            const nextLayerActivations = new Array(nextLayerSize).fill(0);
            
            for (let j = 0; j < nextLayerSize; j++) {
                let hiddenInput = 0;
                for (let i = 0; i < prevLayerActivations.length; i++) {
                    hiddenInput += prevLayerActivations[i] * weights[i][j];
                }
                nextLayerActivations[j] = Math.tanh(hiddenInput);
            }
            allActivations.push(nextLayerActivations);
            currentLayerActivations = nextLayerActivations;
        }

        // Final layer: H_last -> Output (linear activation)
        const lastHiddenActivations = currentLayerActivations;
        const outputWeights = network.layerWeights[network.layerWeights.length - 1] as number[][];
        let score = 0;
        for (let i = 0; i < lastHiddenActivations.length; i++) {
            score += lastHiddenActivations[i] * outputWeights[i][0];
        }

        allActivations.push([score]);
        return { score, allActivations };
    }
    return { score: 0 };
};


// --- Simulated Backpropagation for AI Learning ---
const evaluateTradesAndLearn = (investor: Investor, stocks: Stock[]) => {
    const strategy = investor.strategy as HyperComplexInvestorStrategy;
    const learningRate = strategy.learningRate;
    
    // Filter to trades ready for evaluation and keep the rest
    const tradesToEvaluate = investor.recentTrades.filter(t => t.outcomeEvaluationDay <= stocks[0].history.slice(-1)[0].day);
    investor.recentTrades = investor.recentTrades.filter(t => t.outcomeEvaluationDay > stocks[0].history.slice(-1)[0].day);

    if (tradesToEvaluate.length === 0) return;

    tradesToEvaluate.forEach(trade => {
        const stock = stocks.find(s => s.symbol === trade.symbol);
        if (!stock) return;

        const currentPrice = stock.history.slice(-1)[0].close;
        const actualReturn = (currentPrice / trade.price) - 1;
        
        let expectedReturn = 0.01; // AI expects a modest 1% gain for a buy
        let error = 0;

        if (trade.type === 'buy') {
            error = actualReturn - expectedReturn; // Positive error = good, negative = bad
        } else { // 'sell'
            error = (expectedReturn * -1) - actualReturn; // Positive error = good (stock went down), negative = bad (stock went up)
        }

        // Backpropagation Simulation
        const network = strategy.network;
        const { activationsAtTrade } = trade;
        if (!activationsAtTrade) return;

        if (network.networkType === 'single-layer') {
            const inputs = activationsAtTrade[0] as Record<string, number>;
            for (const neuron in network.weights) {
                const inputVal = inputs[neuron] || 0;
                // Gradient descent update: weight -= learning_rate * error * input
                // We flip the sign of error because a positive error means we want to reinforce
                network.weights[neuron] += learningRate * error * inputVal;
            }
        } 
        else if (network.networkType === 'multi-layer' && activationsAtTrade.length >= 3) {
            const inputs = activationsAtTrade[0] as Record<string, number>;
            const hiddenOutputs = activationsAtTrade[1] as number[];
            
            // Update output layer weights (weights2)
            for (let i = 0; i < network.hiddenLayerSize; i++) {
                network.weights2[i] += learningRate * error * hiddenOutputs[i];
            }

            // Update hidden layer weights (weights1)
            for (let i = 0; i < network.hiddenLayerSize; i++) {
                // tanh derivative is 1 - tanh^2(x)
                const hiddenDerivative = 1 - Math.pow(hiddenOutputs[i], 2);
                const hiddenError = error * network.weights2[i] * hiddenDerivative;
                for(const neuronName in network.weights1) {
                    const inputVal = inputs[neuronName] || 0;
                    network.weights1[neuronName][i] += learningRate * hiddenError * inputVal;
                }
            }
        }
        // Simplified deep network backprop, focusing on input/output layers for stability
        else if (network.networkType === 'deep-layer' && activationsAtTrade.length > 2) {
             const inputs = activationsAtTrade[0] as Record<string, number>;
             const lastHiddenActivations = activationsAtTrade[activationsAtTrade.length - 2] as number[];
             const outputWeights = network.layerWeights[network.layerWeights.length - 1] as number[][];
             const inputWeights = network.layerWeights[0] as Record<string, number[]>;

             // Update last hidden layer to output weights
             for(let i=0; i < lastHiddenActivations.length; i++) {
                 outputWeights[i][0] += learningRate * error * lastHiddenActivations[i];
             }
             
             // Propagate a simplified error back to the first layer
             const simplifiedErrorForInput = error / lastHiddenActivations.length;
             network.inputNeuronNames.forEach(neuronName => {
                const inputVal = inputs[neuronName] || 0;
                if(inputWeights[neuronName]) {
                    for(let i=0; i<inputWeights[neuronName].length; i++) {
                        inputWeights[neuronName][i] += learningRate * simplifiedErrorForInput * inputVal;
                    }
                }
             });
        }
    });
};

const runEndOfDayLogic = (state: SimulationState): SimulationState => {
  const nextDay = state.day + 1;
  state.day = nextDay;
  state.activeEvent = null; // Clear last event

  const createEvent = (eventData: Omit<ActiveEvent, 'id' | 'day' | 'imageUrl' | 'headline' | 'summary' | 'fullText'>, keywords: (string | null)[]): ActiveEvent => {
      // Construct a temporary event object to pass to the article and image generators
      const tempEventForGen = { ...eventData, day: nextDay, id: 'temp' } as ActiveEvent;
      const article = generateNewsArticle(tempEventForGen);
      
      const imageUrl = getImageForEvent(
          article.headline, // Use generated headline for better context
          ...keywords.filter(k => k !== null) as string[]
      );
      
      const newEvent: ActiveEvent = {
          ...eventData,
          ...article,
          id: `${nextDay}-${Math.random()}`,
          day: nextDay,
          imageUrl,
      };
      state.activeEvent = newEvent;
      state.eventHistory.unshift(newEvent);
      if (state.eventHistory.length > 50) {
          state.eventHistory.pop();
      }
      return newEvent;
  };

  // 1. Event Generation
  if (nextDay >= state.nextMacroEventDay) {
      const eventConfig = MACRO_EVENTS[Math.floor(Math.random() * MACRO_EVENTS.length)];
      createEvent({
          stockSymbol: null,
          stockName: null,
          eventName: eventConfig.name,
          description: eventConfig.description,
          type: eventConfig.type as 'positive' | 'negative',
          impact: eventConfig.impact,
      }, ['macro', eventConfig.type]);
      state.nextMacroEventDay = nextDay + 150 + Math.floor(Math.random() * 150);
  }

  const dailyTradeVolumes: Record<string, number> = {};

  // 2. Apply End-of-Day Price Changes
  state.stocks.forEach(stock => {
    if(stock.isDelisted) return;
    dailyTradeVolumes[stock.symbol] = 0;
    
    let currentPrice = stock.history[stock.history.length - 1].close;
    
    const boDrag = (WASHINGTON_B_AND_O_TAX_RATES_BY_SECTOR[stock.sector] || 0) / 365;
    currentPrice *= (1 - boDrag + INFLATION_RATE);

    if (state.activeEvent) {
        if (state.activeEvent.stockSymbol === stock.symbol && typeof state.activeEvent.impact === 'number') {
            currentPrice *= state.activeEvent.impact;
        } else if (state.activeEvent.stockSymbol === null && typeof state.activeEvent.impact === 'object') {
            const impact = state.activeEvent.impact[stock.sector] || state.activeEvent.impact['default'] || 1;
            currentPrice *= impact;
        }
    }

    if (!state.activeEvent && Math.random() < 0.005) {
        const events = CORPORATE_EVENTS_BY_SECTOR[stock.sector];
        const eventType = Math.random() > 0.5 ? 'positive' : 'negative';
        const eventConfig = events[eventType][Math.floor(Math.random() * events[eventType].length)];
        createEvent({
            stockSymbol: stock.symbol,
            stockName: stock.name,
            eventName: eventConfig.name,
            description: eventConfig.description,
            type: eventConfig.type,
            impact: eventConfig.impact,
        }, [stock.sector, stock.name, eventConfig.type]);
        if(typeof eventConfig.impact === 'number') currentPrice *= eventConfig.impact;
    }

    stock.history[stock.history.length - 1].close = Math.max(0.01, currentPrice);
  });


  // 3. Investor Actions
  state.investors.forEach(investor => {
      if (investor.isHuman) return;

      const strategy = investor.strategy as HyperComplexInvestorStrategy;
      evaluateTradesAndLearn(investor, state.stocks);
      
      state.stocks.forEach(stock => {
          if (stock.isDelisted) return;

          const indicators = calculateIndicators(stock);
          const { score, allActivations } = runForwardPass(indicators, strategy.network);
          const currentPrice = stock.history[stock.history.length - 1].close;
          const portfolioItem = investor.portfolio.find(p => p.symbol === stock.symbol);
          const sharesOwned = getSharesOwned(portfolioItem);

          if (score > strategy.riskAversion) {
              const maxSpend = investor.cash * 0.2;
              const sharesToBuy = Math.floor(maxSpend / currentPrice);
              if (sharesToBuy > 0) {
                  investor.cash -= sharesToBuy * currentPrice;
                  let item = portfolioItem;
                  if (!item) {
                      item = { symbol: stock.symbol, lots: [] };
                      investor.portfolio.push(item);
                  }
                  item.lots.push({ purchaseTime: state.time, purchasePrice: currentPrice, shares: sharesToBuy, purchaseIndicators: indicators });
                  dailyTradeVolumes[stock.symbol] = (dailyTradeVolumes[stock.symbol] || 0) + sharesToBuy;
                  
                  const trade: RecentTrade = {
                    symbol: stock.symbol, day: nextDay, type: 'buy', shares: sharesToBuy, price: currentPrice,
                    indicatorsAtTrade: indicators, activationsAtTrade: allActivations, outcomeEvaluationDay: nextDay + 5,
                  };
                  investor.recentTrades.push(trade);
              }
          }
          else if (score < -strategy.riskAversion && sharesOwned > 0) {
              const sharesToSell = Math.floor(sharesOwned * 0.5);
              if (sharesToSell > 0) {
                  investor.cash += sharesToSell * currentPrice;
                  dailyTradeVolumes[stock.symbol] = (dailyTradeVolumes[stock.symbol] || 0) + sharesToSell;
                  
                  let soldAmount = sharesToSell;
                  portfolioItem!.lots.sort((a, b) => new Date(a.purchaseTime).getTime() - new Date(b.purchaseTime).getTime());
                  
                  const trade: RecentTrade = {
                      symbol: stock.symbol, day: nextDay, type: 'sell', shares: sharesToSell, price: currentPrice,
                      indicatorsAtTrade: indicators, activationsAtTrade: allActivations, outcomeEvaluationDay: nextDay + 5,
                  };
                  investor.recentTrades.push(trade);

                  const remainingLots = portfolioItem!.lots.filter(lot => {
                      if (soldAmount <= 0) return true;
                      
                      const holdingPeriod = (new Date(state.time).getTime() - new Date(lot.purchaseTime).getTime()) / (1000 * 3600 * 24);
                      const gainOrLoss = (currentPrice - lot.purchasePrice) * Math.min(lot.shares, soldAmount);
                      if (holdingPeriod > TAX_CONSTANTS.LONG_TERM_HOLDING_PERIOD) {
                          investor.waAnnualNetLTCG += gainOrLoss;
                      }

                      if (lot.shares <= soldAmount) {
                          soldAmount -= lot.shares;
                          return false;
                      } else {
                          lot.shares -= soldAmount;
                          soldAmount = 0;
                          return true;
                      }
                  });
                  
                  if(remainingLots.length > 0) {
                    portfolioItem!.lots = remainingLots;
                  } else {
                    investor.portfolio = investor.portfolio.filter(p => p.symbol !== stock.symbol);
                  }
              }
          }
      });
  });

  // 4. Daily Wrap-up
  state.stocks.forEach(stock => {
    if(stock.history.length > 0 && !stock.isDelisted) {
        stock.history[stock.history.length - 1].volume = Math.round((dailyTradeVolumes[stock.symbol] || 0) + (Math.random() * 50000));
    }
  });

  state.investors.forEach(investor => {
      const portfolioValue = investor.portfolio.reduce((sum, item) => {
          const stock = state.stocks.find(s => s.symbol === item.symbol);
          const price = stock ? stock.history[stock.history.length - 1].close : 0;
          return sum + getSharesOwned(item) * price;
      }, 0);
      const totalValue = investor.cash + portfolioValue;
      investor.portfolioHistory.push({ day: nextDay, value: totalValue });
      if (investor.portfolioHistory.length > 200) {
          investor.portfolioHistory.shift();
      }
  });

  const activeStocks = state.stocks.filter(s => !s.isDelisted);
  const avgPrice = activeStocks.reduce((sum, s) => sum + s.history[s.history.length - 1].close, 0) / activeStocks.length;
  state.marketIndexHistory.push({day: nextDay, price: avgPrice});
  if(state.marketIndexHistory.length > INITIAL_HISTORY_LENGTH + 50) {
    state.marketIndexHistory.shift();
  }

  if (nextDay % 365 === 0) {
      state.investors.forEach(investor => {
          if (investor.isHuman) return;
          const taxDue = calculateWashingtonTax(investor);
          if (taxDue > 0) {
              investor.totalTaxesPaid += taxDue;
              investor.cash -= taxDue;
          }
          investor.waAnnualNetLTCG = 0;
      });
  }

  // Set up for next day
   state.stocks.forEach(stock => {
    if (stock.isDelisted) return;
    const lastHistory = stock.history[stock.history.length - 1];
    stock.history.push({ day: nextDay, open: lastHistory.close, high: lastHistory.close, low: lastHistory.close, close: lastHistory.close, volume: 0 });
    if (stock.history.length > INITIAL_HISTORY_LENGTH + 50) {
        stock.history.shift();
    }
  });


  return state;
}

export const advanceTime = (prevState: SimulationState, secondsToAdvance: number): SimulationState => {
  let state = structuredClone(prevState);
  let currentTime = new Date(state.time);

  const endDate = new Date(currentTime.getTime() + secondsToAdvance * 1000);
  let nextDayBoundary = new Date(currentTime);
  nextDayBoundary.setUTCHours(0, 0, 0, 0);
  nextDayBoundary.setUTCDate(nextDayBoundary.getUTCDate() + 1);

  while (currentTime < endDate) {
      const remainingTime = (endDate.getTime() - currentTime.getTime()) / 1000;
      const timeToNextDay = (nextDayBoundary.getTime() - currentTime.getTime()) / 1000;
      
      const stepSeconds = Math.min(remainingTime, timeToNextDay);

      currentTime = new Date(currentTime.getTime() + stepSeconds * 1000);

      const secondsInDay = 86400;
      const volatility = (Math.sqrt(stepSeconds) * 0.03) / Math.sqrt(secondsInDay);

      state.stocks.forEach(stock => {
          if(stock.isDelisted) return;
          const lastHistory = stock.history[stock.history.length - 1];
          let newPrice = lastHistory.close * (1 + (Math.random() - 0.5) * volatility);
          newPrice = Math.max(0.01, newPrice);
          lastHistory.close = newPrice;
          lastHistory.high = Math.max(lastHistory.high, newPrice);
          lastHistory.low = Math.min(lastHistory.low, newPrice);
      });

      if (currentTime >= nextDayBoundary) {
          state = runEndOfDayLogic(state);
          nextDayBoundary.setUTCDate(nextDayBoundary.getUTCDate() + 1);
      }
  }

  state.time = currentTime.toISOString();
  return state;
};

export const playerBuyStock = (prevState: SimulationState, playerId: string, symbol: string, shares: number): SimulationState => {
  const state = JSON.parse(JSON.stringify(prevState));
  const player = state.investors.find((inv: Investor) => inv.id === playerId);
  const stock = state.stocks.find((s: Stock) => s.symbol === symbol);

  if (!player || !stock || shares <= 0) {
    return state;
  }

  const currentPrice = stock.history[stock.history.length - 1].close;
  const totalCost = currentPrice * shares;

  if (player.cash >= totalCost) {
    player.cash -= totalCost;
    let portfolioItem = player.portfolio.find((item: PortfolioItem) => item.symbol === symbol);
    if (!portfolioItem) {
      portfolioItem = { symbol, lots: [] };
      player.portfolio.push(portfolioItem);
    }
    const newLot: ShareLot = {
      purchaseTime: state.time,
      purchasePrice: currentPrice,
      shares: shares,
      purchaseIndicators: {},
    };
    portfolioItem.lots.push(newLot);
  }

  return state;
};

export const playerSellStock = (prevState: SimulationState, playerId: string, symbol: string, sharesToSell: number): SimulationState => {
  const state = JSON.parse(JSON.stringify(prevState));
  const player = state.investors.find((inv: Investor) => inv.id === playerId);
  const stock = state.stocks.find((s: Stock) => s.symbol === symbol);

  if (!player || !stock || sharesToSell <= 0) {
    return state;
  }
  
  const portfolioItem = player.portfolio.find((item: PortfolioItem) => item.symbol === symbol);
  if (!portfolioItem) {
    return state;
  }

  const totalSharesOwned = portfolioItem.lots.reduce((sum: number, lot: ShareLot) => sum + lot.shares, 0);
  if (totalSharesOwned < sharesToSell) {
    return state; // Not enough shares
  }

  const currentPrice = stock.history[stock.history.length - 1].close;
  player.cash += sharesToSell * currentPrice;

  let soldAmount = sharesToSell;
  // FIFO: sort by purchase time
  portfolioItem.lots.sort((a, b) => new Date(a.purchaseTime).getTime() - new Date(b.purchaseTime).getTime());
  
  const remainingLots = portfolioItem.lots.filter((lot: ShareLot) => {
    if (soldAmount <= 0) return true; // Keep lot
    if (lot.shares <= soldAmount) {
      soldAmount -= lot.shares;
      return false; // Lot completely sold, remove it
    } else {
      lot.shares -= soldAmount;
      soldAmount = 0;
      return true; // Lot partially sold, keep it
    }
  });

  if (remainingLots.length > 0) {
    portfolioItem.lots = remainingLots;
  } else {
    // If all lots are sold, remove the portfolio item entirely
    player.portfolio = player.portfolio.filter((item: PortfolioItem) => item.symbol !== symbol);
  }

  return state;
};
