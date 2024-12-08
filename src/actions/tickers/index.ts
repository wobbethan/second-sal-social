"use server";

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
if (!ALPHA_VANTAGE_API_KEY) {
  throw new Error("Missing ALPHA_VANTAGE_API_KEY in environment variables.");
}

async function fetchData(endpoint: string) {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
}

export async function getTickerData(ticker: string) {
  try {
    const [overview, newsData, timeSeriesDaily, dividendData] =
      await Promise.all([
        fetchData(
          `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
        ),
        fetchData(
          `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
        ),
        fetchData(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
        ),
        fetchData(
          `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
        ),
      ]);

    // Process time series data for the chart
    const timeSeriesData = Object.entries(
      timeSeriesDaily["Time Series (Daily)"] || {}
    )
      .map(([date, values]: [string, any]) => ({
        t: date,
        c: parseFloat(values["4. close"]),
        h: parseFloat(values["2. high"]),
        l: parseFloat(values["3. low"]),
        o: parseFloat(values["1. open"]),
        v: parseFloat(values["5. volume"]),
        vw: parseFloat(values["4. close"]),
      }))
      .sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());

    // Process dividend data from monthly adjusted time series
    const dividendHistory = Object.entries(
      dividendData["Monthly Adjusted Time Series"] || {}
    )
      .map(([date, values]: [string, any]) => {
        const dividendAmount = parseFloat(values["7. dividend amount"]);
        if (dividendAmount > 0) {
          return {
            ex_dividend_date: date,
            declaration_date: date, // API doesn't provide this
            record_date: date, // API doesn't provide this
            payment_date: date, // API doesn't provide this
            amount: dividendAmount.toString(),
          };
        }
        return null;
      })
      .filter((item) => item !== null);

    return {
      ticker: ticker.toUpperCase(),
      dividendData: dividendHistory.length > 0 ? dividendHistory : [],
      tickerDetails: {
        name: overview.Name || ticker.toUpperCase(),
        market_cap: parseFloat(overview.MarketCapitalization || "0"),
        description: overview.Description || "",
        peRatio: parseFloat(overview.PERatio || "0"),
        industry: overview.Industry || "",
        exchange: overview.Exchange || "",
      },
      tickerNews: (newsData.feed || []).slice(0, 3).map((item: any) => ({
        id: Buffer.from(item.title).toString("base64"),
        publisher: {
          name: item.source,
          homepage_url: item.source_domain,
        },
        title: item.title,
        author: item.authors?.[0] || "",
        published_utc: item.published_utc,
        article_url: item.url,
        description: item.summary,
        image_url: item.banner_image || "",
      })),
      aggregateBars: timeSeriesData.slice(-30), // Last 30 days of data
    };
  } catch (error) {
    console.error("Error fetching ticker data:", error);
    return null;
  }
}

export async function searchTicker(query: string) {
  if (!query || query.length < 1) return [];

  try {
    const response = await fetchData(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(
        query
      )}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    // Extract and format the search results
    const results = response.bestMatches || [];
    return results.map((match: any) => ({
      symbol: match["1. symbol"],
      name: match["2. name"],
      type: match["3. type"],
      region: match["4. region"],
      marketOpen: match["5. marketOpen"],
      marketClose: match["6. marketClose"],
      timezone: match["7. timezone"],
      currency: match["8. currency"],
      matchScore: match["9. matchScore"],
    }));
  } catch (error) {
    console.error("Error searching tickers:", error);
    return [];
  }
}
