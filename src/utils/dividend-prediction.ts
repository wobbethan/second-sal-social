interface DividendPoint {
  date: string;
  amount: number;
}

export function calculateDividendTrend(dividendHistory: DividendPoint[]): {
  prediction: number;
  trend: "up" | "down" | "neutral";
  confidence: number;
} {
  if (dividendHistory.length < 2) {
    return {
      prediction: dividendHistory[0]?.amount || 0,
      trend: "neutral",
      confidence: 0,
    };
  }

  // Sort dividends by date (newest first)
  const sortedDividends = [...dividendHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Take the most recent 5 dividends for trend calculation
  const recentDividends = sortedDividends.slice(
    0,
    Math.min(5, sortedDividends.length)
  );

  // Calculate dividend changes between consecutive payments
  const dividendChanges = recentDividends.map((d, i) =>
    i < recentDividends.length - 1
      ? d.amount - recentDividends[i + 1].amount
      : 0
  );

  // Weights for different time periods (most recent has highest weight)
  const weights = [0.4, 0.3, 0.2, 0.07, 0.03];

  // Calculate weighted average change
  const weightedChange = dividendChanges.reduce(
    (sum, change, i) => sum + change * (weights[i] || 0),
    0
  );

  // Determine trend direction
  const trend =
    weightedChange > 0 ? "up" : weightedChange < 0 ? "down" : "neutral";

  // Calculate consistency of dividend changes for confidence
  const allMovingSameDirection = dividendChanges
    .slice(0, -1)
    .every((change) =>
      weightedChange > 0
        ? change > 0
        : weightedChange < 0
        ? change < 0
        : change === 0
    );

  // Higher confidence if recent dividend changes are consistent
  const confidence = allMovingSameDirection ? 0.8 : 0.5;

  // Calculate prediction based on most recent dividend and weighted change
  const prediction = recentDividends[0].amount + weightedChange;

  return {
    prediction: Number(Math.max(0, prediction).toFixed(4)), // Ensure non-negative
    trend,
    confidence: Number(confidence.toFixed(2)),
  };
}
