import { notFound } from "next/navigation";
import { StockPageComponent } from "./_components/stock-page";
import { getTickerData } from "@/actions/tickers";

export default async function DividendPage({
  params,
}: {
  params: { ticker: string };
}) {
  const { ticker } = params;
  const tickerData = await getTickerData(ticker);

  if (!tickerData || !tickerData.tickerDetails.name) {
    notFound();
  }

  if (!tickerData.aggregateBars || tickerData.aggregateBars.length === 0) {
    notFound();
  }

  return <StockPageComponent {...tickerData} />;
}
