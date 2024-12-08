import { notFound } from "next/navigation";
import { StockPageComponent } from "./_components/stock-page";
import { getTickerData } from "@/actions/tickers";

export default async function TickerPage({
  params,
}: {
  params: { ticker: string };
}) {
  const { ticker } = await params;

  const tickerData = await getTickerData(ticker);

  if (!tickerData) {
    notFound();
  }

  return <StockPageComponent {...tickerData} />;
}
