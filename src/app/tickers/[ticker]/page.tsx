import { notFound } from "next/navigation";
import { getTickerData } from "@/actions/tickers";
import StockPage from "./_components/stock-page";
import { DividendTimeline } from "./_components/dividend-timeline";

interface PageProps {
  params: Promise<{
    ticker: string;
  }>;
}

export default async function TickerPage({ params }: PageProps) {
  const resolvedParams = await params;
  const tickerData = await getTickerData(resolvedParams.ticker);

  if (!tickerData) {
    notFound();
  }

  return (
    <div className="flex-1 flex w-full">
      {/* Main Content Area */}
      <StockPage {...tickerData} />

      {/* Right Sidebar - Dividend Timeline */}
      <div className="sticky top-0 right-0 h-screen">
        <DividendTimeline
          dividends={tickerData.dividends}
          ticker={resolvedParams.ticker}
        />
      </div>
    </div>
  );
}
