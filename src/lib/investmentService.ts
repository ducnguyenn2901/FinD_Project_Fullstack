// lib/investmentService.ts
import axios from 'axios'
import api from './api'

// Các API keys (lưu trong .env)
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY
// Base URLs
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'
const NEWS_API_BASE_URL = 'https://newsapi.org/v2'

export interface StockQuote {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    currency: string
    marketCap?: number
    volume?: number
    dayHigh?: number
    dayLow?: number
    yearHigh?: number
    yearLow?: number
}

export interface CryptoQuote {
    id: string
    symbol: string
    name: string
    current_price: number
    price_change_24h: number
    price_change_percentage_24h: number
    market_cap: number
    market_cap_rank?: number
    high_24h?: number
    low_24h?: number
}

export interface ETFQuote {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    currency?: string
    expenseRatio?: number
    assets?: number
    dividendYield?: number
}

export interface HistoricalData {
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
}

export interface InvestmentNews {
    title: string
    description: string
    url: string
    source: string
    publishedAt: string
    imageUrl?: string
}

export interface ValidationResult {
    isValid: boolean
    symbol: string
    name: string
    type: 'stock' | 'crypto' | 'etf' | 'bond' | 'other'
    currentPrice?: number
    currency?: string
    error?: string
}

export class InvestmentService {
    static async searchSymbols(query: string): Promise<Array<{ symbol: string; name: string; exchange: string; type: string }>> {
        try {
            const resp = await api.get('/market/search', { params: { q: query } })
            return Array.isArray(resp.data) ? resp.data : []
        } catch (error) {
            console.error('Error searching symbols:', error)
            return []
        }
    }
    // Validation từ CSV
    static async validateCSVRow(row: any): Promise<ValidationResult> {
        try {
            const symbol = row.symbol?.trim().toUpperCase()
            const type = row.type?.toLowerCase() || 'stock'

            if (!symbol) {
                return {
                    isValid: false,
                    symbol: '',
                    name: '',
                    type: 'other',
                    error: 'Missing symbol'
                }
            }

            let validationResult: ValidationResult = {
                isValid: false,
                symbol,
                name: symbol,
                type: type as any
            }

            switch (type) {
                case 'stock':
                    const stock = await this.validateStock(symbol)
                    if (stock) {
                        validationResult = {
                            isValid: true,
                            symbol,
                            name: stock.name,
                            type: 'stock',
                            currentPrice: stock.price,
                            currency: stock.currency
                        }
                    }
                    break

                case 'crypto':
                    const crypto = await this.validateCrypto(symbol)
                    if (crypto) {
                        validationResult = {
                            isValid: true,
                            symbol: crypto.symbol,
                            name: crypto.name,
                            type: 'crypto',
                            currentPrice: crypto.current_price,
                            currency: 'USD'
                        }
                    }
                    break

                case 'etf':
                    const etf = await this.validateETF(symbol)
                    if (etf) {
                        validationResult = {
                            isValid: true,
                            symbol,
                            name: etf.name,
                            type: 'etf',
                            currentPrice: etf.price,
                            currency: 'USD'
                        }
                    }
                    break

                case 'bond':
                case 'other':
                    validationResult.isValid = true
                    break
            }

            return validationResult
        } catch (error) {
            return {
                isValid: false,
                symbol: row.symbol || '',
                name: '',
                type: 'other',
                error: 'Validation failed'
            }
        }
    }

    // Batch validation cho CSV import
    static async validateCSVBatch(rows: any[]): Promise<{
        validRows: any[]
        invalidRows: any[]
        validationResults: ValidationResult[]
    }> {
        const validationResults = await Promise.all(
            rows.map(row => this.validateCSVRow(row))
        )

        const validRows: any[] = []
        const invalidRows: any[] = []

        rows.forEach((row, index) => {
            const result = validationResults[index]
            if (result.isValid) {
                validRows.push({
                    ...row,
                    validatedSymbol: result.symbol,
                    validatedName: result.name,
                    validatedType: result.type,
                    currentPrice: result.currentPrice
                })
            } else {
                invalidRows.push({
                    ...row,
                    error: result.error
                })
            }
        })

        return { validRows, invalidRows, validationResults }
    }

    // Lấy historical data (30 ngày)
    static async getHistoricalData(
        symbol: string,
        type: 'stock' | 'crypto' | 'etf',
        days: number = 30
    ): Promise<HistoricalData[]> {
        try {
            if (type === 'crypto') {
                const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${symbol}/market_chart`, {
                    params: {
                        vs_currency: 'usd',
                        days: days,
                        interval: 'daily'
                    }
                })

                return response.data.prices.map(([timestamp, price]: [number, number], index: number) => ({
                    date: new Date(timestamp).toISOString().split('T')[0],
                    open: price,
                    high: response.data.highs?.[index]?.[1] || price,
                    low: response.data.lows?.[index]?.[1] || price,
                    close: price,
                    volume: response.data.total_volumes?.[index]?.[1] || 0
                }))
            } else {
                const resp = await api.get(`/market/historical/${symbol}`, { params: { days } })
                return Array.isArray(resp.data) ? resp.data : []
            }
        } catch (error) {
            console.error('Error fetching historical data:', error)
            return []
        }
    }

    // Lấy news cho investment
    static async getInvestmentNews(
        symbol: string,
        type: 'stock' | 'crypto' | 'etf',
        limit: number = 5
    ): Promise<InvestmentNews[]> {
        try {
            if (!NEWS_API_KEY) {
                console.warn('News API key not configured')
                return []
            }

            let query = symbol
            if (type === 'crypto') {
                query = `${symbol} cryptocurrency`
            } else if (type === 'etf') {
                query = `${symbol} ETF`
            }

            const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
                params: {
                    q: query,
                    apiKey: NEWS_API_KEY,
                    pageSize: limit,
                    sortBy: 'publishedAt',
                    language: 'en'
                }
            })

            return response.data.articles.map((article: any) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt,
                imageUrl: article.urlToImage
            }))
        } catch (error) {
            console.error('Error fetching news:', error)
            return []
        }
    }

    // Kiểm tra giá có đạt ngưỡng alert không
    static async checkPriceAlerts(
        symbol: string,
        type: 'stock' | 'crypto' | 'etf',
        alerts: Array<{ type: 'above' | 'below'; price: number }>
    ): Promise<Array<{ type: 'above' | 'below'; price: number; triggered: boolean; currentPrice: number }>> {
        try {
            let currentPrice = 0

            switch (type) {
                case 'stock': {
                    const stock = await this.validateStock(symbol)
                    currentPrice = stock?.price || 0
                    break
                }
                case 'crypto': {
                    const crypto = await this.validateCrypto(symbol)
                    currentPrice = crypto?.current_price || 0
                    break
                }
                case 'etf': {
                    const etf = await this.validateETF(symbol)
                    currentPrice = etf?.price || 0
                    break
                }
            }

            return alerts.map(alert => ({
                ...alert,
                triggered: alert.type === 'above'
                    ? currentPrice >= alert.price
                    : currentPrice <= alert.price,
                currentPrice
            }))
        } catch (error) {
            console.error('Error checking price alerts:', error)
            return []
        }
    }

    // Portfolio rebalancing calculator
    static calculateRebalancing(
        currentAllocation: Record<string, number>,
        targetAllocation: Record<string, number>,
        totalValue: number
    ): Record<string, { currentValue: number; targetValue: number; difference: number; action: 'buy' | 'sell' | 'hold'; percentageDiff: number }> {
        const result: Record<string, { currentValue: number; targetValue: number; difference: number; action: 'buy' | 'sell' | 'hold'; percentageDiff: number }> = {}

        Object.keys(targetAllocation).forEach(category => {
            const currentValue = currentAllocation[category] || 0
            const targetValue = totalValue * (targetAllocation[category] / 100)
            const difference = targetValue - currentValue
            const percentageDiff = currentValue > 0 ? (difference / currentValue) * 100 : (targetValue > 0 ? 100 : 0)

            result[category] = {
                currentValue,
                targetValue,
                difference: Math.abs(difference),
                action: Math.abs(percentageDiff) < 5 ? 'hold' : difference > 0 ? 'buy' : 'sell',
                percentageDiff
            }
        })

        return result
    }

    // Tax calculation (đơn giản)
    static calculateTax(
        purchasePrice: number,
        salePrice: number,
        quantity: number,
        holdingPeriodDays: number,
        taxRate: number = 0.15 // 15% cho long-term capital gains
    ): { gain: number; tax: number; netProceeds: number } {
        const totalGain = (salePrice - purchasePrice) * quantity
        const isLongTerm = holdingPeriodDays > 365
        const applicableTaxRate = isLongTerm ? taxRate : taxRate * 1.5 // Short-term taxed higher
        const tax = totalGain > 0 ? totalGain * applicableTaxRate : 0
        const netProceeds = (salePrice * quantity) - tax

        return {
            gain: totalGain,
            tax,
            netProceeds
        }
    }

    // Parse CSV file
    static parseCSV(csvText: string): any[] {
        const lines = csvText.split('\n')
        const headers = lines[0].split(',').map(h => h.trim())

        return lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',').map(v => v.trim())
            const row: any = {}
            headers.forEach((header, index) => {
                row[header.toLowerCase()] = values[index] || ''
            })
            return row
        })
    }

    // Generate CSV for export
    static generateCSV(investments: any[]): string {
        const headers = ['Symbol', 'Name', 'Type', 'Quantity', 'Avg Price', 'Currency', 'Purchase Date', 'Notes']
        const rows = investments.map(inv => [
            inv.symbol,
            inv.name,
            inv.type,
            inv.quantity,
            inv.avg_price,
            inv.currency,
            inv.purchase_date,
            inv.notes || ''
        ])

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    }

    // Các hàm validate cũ (giữ nguyên)
    static async validateStock(symbol: string): Promise<StockQuote | null> {
        try {
            const cleanSymbol = symbol.toUpperCase().split('.')[0]
            const resp = await api.get(`/market/quote/${cleanSymbol}`)
            const q = resp.data
            if (!q || !q.symbol) return null
            return {
                symbol: q.symbol,
                name: q.name,
                price: q.price,
                change: q.change,
                changePercent: q.changePercent,
                currency: q.currency,
                marketCap: undefined,
                volume: undefined
            }
        } catch (error) {
            console.error('Error validating stock:', error)
            return null
        }
    }

    // Kiểm tra cryptocurrency hợp lệ
    static async validateCrypto(symbol: string): Promise<CryptoQuote | null> {
        try {
            const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
                params: {
                    vs_currency: 'usd',
                    ids: symbol.toLowerCase(),
                    order: 'market_cap_desc',
                    per_page: 1,
                    page: 1,
                    sparkline: false
                }
            })

            if (response.data.length === 0) {
                // Try searching by symbol
                const searchResponse = await axios.get(`${COINGECKO_BASE_URL}/coins/list`)
                const coin = searchResponse.data.find((c: any) =>
                    c.symbol.toLowerCase() === symbol.toLowerCase()
                )

                if (!coin) return null

                const priceResponse = await axios.get(`${COINGECKO_BASE_URL}/coins/${coin.id}`, {
                    params: {
                        localization: false,
                        tickers: false,
                        market_data: true,
                        community_data: false,
                        developer_data: false
                    }
                })

                const marketData = priceResponse.data.market_data

                return {
                    id: coin.id,
                    symbol: coin.symbol.toUpperCase(),
                    name: coin.name,
                    current_price: marketData.current_price.usd,
                    price_change_24h: marketData.price_change_24h,
                    price_change_percentage_24h: marketData.price_change_percentage_24h,
                    market_cap: marketData.market_cap.usd
                }
            }

            const data = response.data[0]

            return {
                id: data.id,
                symbol: data.symbol.toUpperCase(),
                name: data.name,
                current_price: data.current_price,
                price_change_24h: data.price_change_24h,
                price_change_percentage_24h: data.price_change_percentage_24h,
                market_cap: data.market_cap
            }
        } catch (error) {
            console.error('Error validating crypto:', error)
            return null
        }
    }

    // Kiểm tra ETF hợp lệ
    static async validateETF(symbol: string): Promise<ETFQuote | null> {
        try {
            const stockData = await this.validateStock(symbol)
            if (!stockData) return null
            return {
                symbol: stockData.symbol,
                name: stockData.name,
                price: stockData.price,
                change: stockData.change,
                changePercent: stockData.changePercent,
                currency: stockData.currency,
                expenseRatio: undefined,
                assets: stockData.marketCap
            }
        } catch (error) {
            console.error('Error validating ETF:', error)
            return null
        }
    }

    // Lấy tỷ giá USD/VND
    static async getExchangeRate(): Promise<number> {
        try {
            const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD')
            return response.data.rates.VND || 23000
        } catch (error) {
            console.error('Error getting exchange rate:', error)
            return 23000 // Fallback rate
        }
    }

    // Tìm kiếm investment theo symbol
    static async searchInvestment(symbol: string, type: 'stock' | 'crypto' | 'etf') {
        switch (type) {
            case 'stock':
                return await this.validateStock(symbol)
            case 'crypto':
                return await this.validateCrypto(symbol)
            case 'etf':
                return await this.validateETF(symbol)
            default:
                return null
        }
    }
}
