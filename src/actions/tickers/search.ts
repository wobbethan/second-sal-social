// actions/tickers/search.ts
"use server";

let stocksCache: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getAllStocks(exchange: string = "US") {
  try {
    // Return cached data if available and fresh
    if (stocksCache && Date.now() - lastFetchTime < CACHE_DURATION) {
      return stocksCache;
    }

    const response = await fetch(
      `https://finnhub.io/api/v1/stock/symbol?exchange=${exchange}&token=${process.env.FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch stocks");
    }

    const data = await response.json();

    // Filter and transform the data
    stocksCache = data
      .filter(
        (item: any) =>
          item.type === "Common Stock" && item.displaySymbol && item.description
      )
      .map((item: any) => ({
        symbol: item.displaySymbol,
        description: item.description,
        type: item.type,
        currency: item.currency,
      }));

    lastFetchTime = Date.now();
    return stocksCache;
  } catch (error) {
    console.error("Failed to fetch stocks:", error);
    return [];
  }
}
export async function getStockPrice(symbol: string) {
  const response = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch stock price");
  }

  const data = await response.json();
  return data.c;
}
