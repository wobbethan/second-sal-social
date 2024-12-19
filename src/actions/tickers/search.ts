// actions/tickers/search.ts
"use server";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let stocksCacheUS: any[] = [];
let stocksCacheTO: any[] = [];
let lastFetchTimeUS = 0;
let lastFetchTimeTO = 0;

export async function getAllStocks(exchange: string) {
  try {
    // Check appropriate cache based on country
    const cache = exchange === "US" ? stocksCacheUS : stocksCacheTO;
    const lastFetch = exchange === "US" ? lastFetchTimeUS : lastFetchTimeTO;

    if (cache.length && Date.now() - lastFetch < CACHE_DURATION) {
      return cache;
    }

    // Use TO for Toronto Stock Exchange
    const exchangeCode = exchange === "US" ? "US" : "TO";

    const response = await fetch(
      `https://finnhub.io/api/v1/stock/symbol?exchange=${exchangeCode}&token=${process.env.FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch stocks");
    }

    const data = await response.json();

    const processedData = data
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

    // Update appropriate cache
    if (exchange === "US") {
      stocksCacheUS = processedData;
      lastFetchTimeUS = Date.now();
    } else {
      stocksCacheTO = processedData;
      lastFetchTimeTO = Date.now();
    }

    return processedData;
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
