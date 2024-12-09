import { NextResponse } from "next/server";
import { finnhubClient } from "@/lib/finnhub";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toUpperCase();

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const results = await finnhubClient.symbolSearch(query);

    // Filter and transform results immediately to reduce payload size
    const filteredResults = results.result
      .filter(
        (item) =>
          item.symbol &&
          item.description &&
          // Only include US stocks for faster results
          item.type === "Common Stock" &&
          item.symbol.includes(query)
      )
      .map((item) => ({
        symbol: item.symbol,
        description: item.description,
        type: item.type,
      }))
      .slice(0, 8); // Limit to 8 results for better performance

    return NextResponse.json(filteredResults);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json([]);
  }
}
