export function calculateDividendGrowth(dividendHistory: any[]): number {
  try {
    if (!dividendHistory || dividendHistory.length < 4) return 0;

    const sortedDividends = [...dividendHistory].sort(
      (a, b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime()
    );

    const recentYear = sortedDividends.slice(0, 4);
    const oldestYear = sortedDividends.slice(-4);

    if (recentYear.length < 4 || oldestYear.length < 4) return 0;

    const recentTotal = recentYear.reduce((sum, div) => sum + div.amount, 0);
    const oldestTotal = oldestYear.reduce((sum, div) => sum + div.amount, 0);

    if (oldestTotal <= 0 || recentTotal <= 0) return 0;

    const yearsDiff =
      (new Date(recentYear[0].payDate).getTime() -
        new Date(oldestYear[oldestYear.length - 1].payDate).getTime()) /
      (365 * 24 * 60 * 60 * 1000);

    if (yearsDiff < 1) return 0;

    const growthRate = recentTotal / oldestTotal;
    const power = 1 / yearsDiff;
    const cagr = (Math.pow(growthRate, power) - 1) * 100;

    const roundedCagr = Math.round(cagr * 100) / 100;

    if (
      isNaN(roundedCagr) ||
      !isFinite(roundedCagr) ||
      roundedCagr < -100 ||
      roundedCagr > 100
    ) {
      return 0;
    }

    return roundedCagr;
  } catch (error) {
    console.error("Error calculating dividend growth:", error);
    return 0;
  }
}
