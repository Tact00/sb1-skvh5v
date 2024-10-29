import { Observable } from '@nativescript/core';
import { StockAnalysis } from '../models/stock-analysis.model';

export class AnalysisEngineService extends Observable {
    calculateVolatility(prices: number[]): number {
        const returns = prices.slice(1).map((price, i) => 
            (price - prices[i]) / prices[i]
        );
        const mean = returns.reduce((a, b) => a + b) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        return Math.sqrt(variance * 252) * 100; // Annualized volatility
    }

    calculateRiskLevel(volatility: number, peRatio: number, marketCap: number): 'Low' | 'Medium' | 'High' {
        const volatilityScore = volatility > 30 ? 3 : volatility > 20 ? 2 : 1;
        const peScore = peRatio > 30 ? 3 : peRatio > 20 ? 2 : 1;
        const marketCapScore = marketCap < 1e9 ? 3 : marketCap < 1e10 ? 2 : 1;
        
        const totalScore = volatilityScore + peScore + marketCapScore;
        return totalScore > 7 ? 'High' : totalScore > 5 ? 'Medium' : 'Low';
    }

    projectSixMonthPrice(currentPrice: number, historicalPrices: number[]): number {
        const trend = this.calculatePriceTrend(historicalPrices);
        const volatility = this.calculateVolatility(historicalPrices);
        return currentPrice * (1 + trend) * (1 + volatility * 0.1);
    }

    private calculatePriceTrend(prices: number[]): number {
        const periods = prices.length;
        const x = Array.from({length: periods}, (_, i) => i);
        const y = prices;
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((a, i) => a + i * y[i], 0);
        const sumXX = x.reduce((a, b) => a + b * b, 0);
        
        const slope = (periods * sumXY - sumX * sumY) / (periods * sumXX - sumX * sumX);
        return slope / prices[0]; // Normalized trend
    }
}