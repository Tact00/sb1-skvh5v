import { Observable } from '@nativescript/core';
import { StockAnalysis } from '../../models/stock-analysis.model';
import { StockAnalyzerService } from '../../services/stock-analyzer.service';

export class StockListViewModel extends Observable {
    private _stocks: StockAnalysis[] = [];
    private stockAnalyzer: StockAnalyzerService;

    constructor() {
        super();
        this.stockAnalyzer = new StockAnalyzerService();
        this.loadStocks();
    }

    get stocks(): StockAnalysis[] {
        return this._stocks;
    }

    set stocks(value: StockAnalysis[]) {
        if (this._stocks !== value) {
            this._stocks = value;
            this.notifyPropertyChange('stocks', value);
        }
    }

    async loadStocks() {
        try {
            const analyzedStocks = await this.stockAnalyzer.analyzeStocks();
            this.stocks = analyzedStocks.slice(0, 10); // Limit to 10 stocks
        } catch (error) {
            console.error('Error loading stocks:', error);
        }
    }
}