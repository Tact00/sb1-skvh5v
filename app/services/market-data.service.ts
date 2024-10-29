import { Observable } from '@nativescript/core';
import axios from 'axios';

export class MarketDataService extends Observable {
    private readonly API_KEY = 'demo'; // Replace with actual API key in production

    async fetchStockData(symbol: string) {
        try {
            const response = await axios.get(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.API_KEY}`
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            throw error;
        }
    }

    async fetchHistoricalData(symbol: string) {
        try {
            const response = await axios.get(
                `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.API_KEY}`
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching historical data for ${symbol}:`, error);
            throw error;
        }
    }
}