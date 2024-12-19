import { getBundle } from "@/actions/bundles";
import { getBundleStockData } from "@/actions/tickers";
import { notFound } from "next/navigation";
import { BundleView } from "./_components/bundle-view";

// Add this function near the top of the file, before the BundlePage component
function calculateDividendGrowth(dividendHistory: any[]): number {
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

export default async function BundlePage({
  params,
}: {
  params: { bundle_id: string };
}) {
  const result = await getBundle(params.bundle_id);

  if (!result.success) {
    notFound();
  }

  const { bundle } = result;
  const securities = bundle?.securities as any[];

  // Fetch current stock data for each security
  const stocksPromises = securities.map(async (security) => {
    const stockData = await getBundleStockData(security.symbol);
    if (!stockData)
      throw new Error(`Failed to fetch data for ${security.symbol}`);
    return {
      ...security,
      yield: stockData.dividendYield,
      price: stockData.price,
      dividendHistory: stockData.dividendHistory,
      industry: stockData.industry,
      dividendGrowth: calculateDividendGrowth(stockData.dividendHistory),
    };
  });

  const stocks = await Promise.all(stocksPromises);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{bundle?.name}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <img
            src={bundle?.creator?.image || "/default-avatar.png"}
            alt={`${bundle?.creator?.username}'s profile`}
            className="w-6 h-6 rounded-full"
          />
          Created by {bundle?.creator?.username}
        </div>
      </div>

      <BundleView initialStocks={stocks} />
    </div>
  );
}
