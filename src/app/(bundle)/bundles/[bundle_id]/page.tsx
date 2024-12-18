import { getBundle } from "@/actions/bundles";
import { getBundleStockData } from "@/actions/tickers";
import { notFound } from "next/navigation";
import { BundleView } from "./_components/bundle-view";
import { calculateDividendGrowth } from "@/lib/dividend-utils";

interface PageProps {
  params: { bundle_id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function BundlePage(props: PageProps) {
  const params = await Promise.resolve(props.params);
  const result = await getBundle(params.bundle_id);

  if (!result.success || !result.bundle) {
    notFound();
  }

  const bundle = result.bundle;
  const securities = bundle.securities as any[];

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

  return (
    <div className="min-h-screen w-full p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <BundleView initialStocks={stocks} bundle={bundle} />
      </div>
    </div>
  );
}
