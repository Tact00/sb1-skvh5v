export interface StockAnalysis {
    symbol: string;
    name: string;
    currentPrice: number;
    potentialGain: number;
    potentialLoss: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    sixMonthProjection: number;
    riskFactors: string[];
    confidenceScore: number;
    volatilityScore: number;
    technicalIndicators: {
        rsi: number;
        macd: number;
        movingAverage50: number;
        movingAverage200: number;
    };
    fundamentals: {
        peRatio: number;
        marketCap: number;
        dividendYield: number;
    };
}