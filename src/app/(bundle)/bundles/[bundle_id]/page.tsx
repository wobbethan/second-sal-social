import { getBundle } from "@/actions/bundles";
import { getBundleStockData } from "@/actions/tickers";
import { notFound } from "next/navigation";
import { BundleView } from "./_components/bundle-view";
import { calculateDividendGrowth } from "@/lib/dividend-utils";

export default async function BundlePage({
  params,
}: {
  params: Promise<{ bundle_id: string }> | { bundle_id: string };
}) {
  const resolvedParams = "then" in params ? await params : params;
  const result = await getBundle(resolvedParams.bundle_id);

  if (!result.success || !result.bundle) {
    notFound();
  }

  const bundle = result.bundle;
  const securities = bundle.securities as any[];

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
      shares: 0,
    };
  });

  const stocks = await Promise.all(stocksPromises);

  return <div className="w-full flex items-center justify-center"><BundleView initialStocks={stocks} bundle={bundle} /></div>;
}
