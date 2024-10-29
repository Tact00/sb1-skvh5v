import { Observable } from '@nativescript/core';
import { StockAnalysis } from '../models/stock-analysis.model';
import { MarketDataService } from './market-data.service';
import { AnalysisEngineService } from './analysis-engine.service';

export class StockAnalyzerService extends Observable {
    private marketData: MarketDataService;
    private analysisEngine: AnalysisEngineService;
    
    constructor() {
        super();
        this.marketData = new MarketDataService();
        this.analysisEngine = new AnalysisEngineService();
    }

    private topStocks = [
        "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
        "META", "BRK.B", "JPM", "V", "JNJ"
    ];

    async analyzeStocks(): Promise<StockAnalysis[]> {
        try {
            const analyses: StockAnalysis[] = [];
            
            for (const symbol of this.topStocks) {
                const stockData = await this.marketData.fetchStockData(symbol);
                const historicalData = await this.marketData.fetchHistoricalData(symbol);
                
                const currentPrice = parseFloat(stockData['Global Quote']['05. price']);
                const historicalPrices = Object.values(historicalData['Time Series (Daily)'])
                    .map(day => parseFloat(day['4. close']))
                    .slice(0, 180); // 6 months of data

                const volatility = this.analysisEngine.calculateVolatility(historicalPrices);
                const sixMonthProjection = this.analysisEngine.projectSixMonthPrice(
                    currentPrice,
                    historicalPrices
                );

                const potentialGain = ((sixMonthProjection - currentPrice) / currentPrice) * 100;
                const potentialLoss = -volatility * 0.5; // Estimated maximum loss based on volatility

                analyses.push({
                    symbol,
                    name: this.getCompanyName(symbol),
                    currentPrice,
                    potentialGain,
                    potentialLoss,
                    riskLevel: this.analysisEngine.calculateRiskLevel(
                        volatility,
                        stockData['Global Quote']['PE'],
                        stockData['Global Quote']['MarketCap']
                    ),
                    sixMonthProjection,
                    riskFactors: this.calculateRiskFactors(volatility, historicalPrices),
                    confidenceScore: this.calculateConfidenceScore(volatility, historicalPrices),
                    volatilityScore: volatility,
                    technicalIndicators: {
                        rsi: this.calculateRSI(historicalPrices),
                        macd: this.calculateMACD(historicalPrices),
                        movingAverage50: this.calculateMA(historicalPrices, 50),
                        movingAverage200: this.calculateMA(historicalPrices, 200)
                    },
                    fundamentals: {
                        peRatio: parseFloat(stockData['Global Quote']['PE']),
                        marketCap: parseFloat(stockData['Global Quote']['MarketCap']),
                        dividendYield: parseFloat(stockData['Global Quote']['DividendYield'])
                    }
                });
            }

            return analyses.sort((a, b) => b.potentialGain - a.potentialGain).slice(0, 10);
        } catch (error) {
            console.error('Error analyzing stocks:', error);
            throw error;
        }
    }

    private getCompanyName(symbol: string): string {
        const companies = {
            'AAPL': 'Apple Inc.',
            'MSFT': 'Microsoft Corporation',
            'GOOGL': 'Alphabet Inc.',
            'AMZN': 'Amazon.com Inc.',
            'NVDA': 'NVIDIA Corporation',
            'META': 'Meta Platforms Inc.',
            'BRK.B': 'Berkshire Hathaway Inc.',
            'JPM': 'JPMorgan Chase & Co.',
            'V': 'Visa Inc.',
            'JNJ': 'Johnson & Johnson'
        };
        return companies[symbol] || symbol;
    }

    private calculateRiskFactors(volatility: number, prices: number[]): string[] {
        const factors = [];
        if (volatility > 30) factors.push('High Volatility');
        if (this.calculateMA(prices, 50) < this.calculateMA(prices, 200)) {
            factors.push('Bearish Trend');
        }
        if (this.calculateRSI(prices) > 70) factors.push('Overbought');
        if (this.calculateRSI(prices) < 30) factors.push('Oversold');
        return factors;
    }

    private calculateConfidenceScore(volatility: number, prices: number[]): number {
        const trend = Math.abs(this.calculateMA(prices, 50) - this.calculateMA(prices, 200));
        const rsi = this.calculateRSI(prices);
        const score = 100 - (volatility * 0.5) + (trend * 10) + (rsi < 30 || rsi > 70 ? -10 : 0);
        return Math.min(Math.max(score, 0), 100);
    }

    private calculateRSI(prices: number[], periods = 14): number {
        // Simplified RSI calculation
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < prices.length; i++) {
            const difference = prices[i] - prices[i - 1];
            gains.push(Math.max(difference, 0));
            losses.push(Math.max(-difference, 0));
        }
        
        const avgGain = gains.slice(0, periods).reduce((a, b) => a + b) / periods;
        const avgLoss = losses.slice(0, periods).reduce((a, b) => a + b) / periods;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    private calculateMACD(prices: number[]): number {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        return ema12 - ema26;
    }

    private calculateMA(prices: number[], period: number): number {
        return prices.slice(0, period).reduce((a, b) => a + b) / period;
    }

    private calculateEMA(prices: number[], period: number): number {
        const k = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = prices[i] * k + ema * (1 - k);
        }
        
        return ema;
    }
}