import { notFound } from "next/navigation";
import { getTickerData } from "@/actions/tickers";
import StockPage from "./_components/stock-page";

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

  return <StockPage {...tickerData} />;
}
