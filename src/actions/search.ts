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
