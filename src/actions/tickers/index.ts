"use server";

import axios from "axios";
import {
  CandleData,
  CompanyProfile,
  NewsItem,
  DividendData,
} from "@/types/finnhub";
import { StockPageProps } from "@/types/props";
import { calculateDividendYield } from "@/actions/dividends";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// Create configured axios instance for Finnhub
export const finnhub = axios.create({
  baseURL: "https://finnhub.io/api/v1",
  params: {
    token: FINNHUB_API_KEY,
  },
});

// Helper function to fetch candle data
export async function fetchCandleData(ticker: string): Promise<CandleData> {
  const endDate = Math.floor(Date.now() / 1000);
  const startDate = endDate - 365 * 24 * 60 * 60; // 1 years ago

  try {
    const response = await finnhub.get(`/stock/candle`, {
      params: {
        symbol: ticker,
        resolution: "D",
        from: startDate,
        to: endDate,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching candle data:", error);
    throw error;
  }
}

// Helper function to fetch company profile
export async function fetchCompanyProfile(
  ticker: string
): Promise<CompanyProfile> {
  try {
    const response = await finnhub.get(`/stock/profile2`, {
      params: {
        symbol: ticker,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching company profile:", error);
    throw error;
  }
}

// Helper function to fetch news
export async function fetchCompanyNews(ticker: string): Promise<NewsItem[]> {
  try {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const response = await finnhub.get(`/company-news`, {
      params: {
        symbol: ticker,
        from: startDate,
        to: endDate,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching company news:", error);
    throw error;
  }
}

// Helper function to fetch dividend data
export async function fetchDividendData(
  ticker: string
): Promise<DividendData[]> {
  try {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 365 * 30 * 24 * 60 * 60 * 1000) // 30 years ago
      .toISOString()
      .split("T")[0];

    const response = await finnhub.get(`/stock/dividend`, {
      params: {
        symbol: ticker,
        from: startDate,
        to: endDate,
      },
    });

    // Sort dividends by date in descending order and add timeline
    const sortedDividends = response.data.sort(
      (a: DividendData, b: DividendData) =>
        new Date(b.payDate).getTime() - new Date(a.payDate).getTime()
    );

    // Add timeline field to each dividend
    return sortedDividends.map((dividend: DividendData, index: number) => ({
      ...dividend,
      timeline: index === 0 ? "most recent" : "confirmed",
    }));
  } catch (error) {
    console.error("Error fetching dividend data:", error);
    throw error;
  }
}

export async function getTickerData(
  ticker: string
): Promise<StockPageProps | null> {
  // Convert ticker to uppercase immediately
  ticker = ticker.toUpperCase();

  try {
    // Fetch all data in parallel
    const [candleData, companyProfile, newsData, dividendData] =
      await Promise.all([
        fetchCandleData(ticker),
        fetchCompanyProfile(ticker),
        fetchCompanyNews(ticker),
        fetchDividendData(ticker),
      ]);

    // Process candle data for the chart
    const timeSeriesData = candleData.t.map(
      (timestamp: number, index: number) => ({
        t: new Date(timestamp * 1000).toISOString().split("T")[0],
        c: candleData.c[index],
        h: candleData.h[index],
        l: candleData.l[index],
        o: candleData.o[index],
        v: candleData.v[index],
        vw: candleData.c[index],
      })
    );

    return {
      ticker: ticker.toUpperCase(),
      companyProfile: companyProfile,
      newsItems: newsData.slice(newsData.length - 3, newsData.length), // Take the 3 most recent
      dividends: dividendData,
      candles: candleData,
    };
  } catch (error) {
    console.error("Error in getTickerData:", error);
    return null;
  }
}

// Add this interface for the search response
export interface TickerSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
  exchange?: string;
}

// Add the search function
export async function searchTicker(
  query: string
): Promise<TickerSearchResult[]> {
  try {
    if (query.length < 2) return []; // Don't search for very short queries

    const response = await finnhub.get(`/search`, {
      params: {
        q: query.toUpperCase(), // Convert to uppercase for better matches
      },
    });

    // Filter and process results immediately
    return response.data.result
      .filter(
        (item: TickerSearchResult) =>
          item.type === "Common Stock" &&
          !item.symbol.includes(".") &&
          (item.symbol.startsWith(query.toUpperCase()) ||
            item.description.toUpperCase().includes(query.toUpperCase()))
      )
      .slice(0, 8); // Limit to top 8 results for better performance
  } catch (error) {
    console.error("Error searching tickers:", error);
    return [];
  }
}

export async function getBundleStockData(symbol: string): Promise<{
  symbol: string;
  logo: string;
  price: number;
  dividendHistory: DividendData[];
  dividendYield: number;
  industry: string;
} | null> {
  try {
    symbol = symbol.toUpperCase();

    const [companyProfile, dividendHistory, candleData, dividendYield] =
      await Promise.all([
        fetchCompanyProfile(symbol),
        fetchDividendData(symbol),
        fetchCandleData(symbol),
        calculateDividendYield(symbol),
      ]);

    const currentPrice = candleData.c[candleData.c.length - 1];

    return {
      symbol,
      logo: companyProfile.logo || "/placeholder.svg",
      price: currentPrice,
      dividendHistory,
      dividendYield,
      industry: companyProfile.finnhubIndustry || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching bundle stock data:", error);
    return null;
  }
}
