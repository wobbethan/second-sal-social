import { SearchResult } from "@/types/search";

export async function searchTicker(query: string): Promise<SearchResult[]> {
  try {
    // Add AbortController to cancel pending requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Search failed");
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Search request cancelled");
    } else {
      console.error("Search error:", error);
    }
    return [];
  }
}

export async function getStockPrice(symbol: string): Promise<number> {
  // In a real implementation, this would call your stock price API
  // For demo purposes, we'll return mock prices
  const mockPrices: Record<string, number> = {
    "AAPL": 247.96,
    "FMNB": 15.47,
    "TSCO": 285.27,
  };

  return mockPrices[symbol] || 0;
}
