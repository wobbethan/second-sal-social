import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Menu } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StockPageProps } from "@/types/props";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CompanyOverview from "./company-overview";
import CompanyNews from "./company-news";
import StockCandlestick from "./stock-candlestick";
import { SearchBar } from "@/components/Stock Display/dashboard/user-feed";

export default function StockPage({
  ticker,
  companyProfile,
  newsItems,
  candles,
}: Omit<StockPageProps, "dividends">) {
  // Calculate current price and changes
  const currentPrice = candles.c[candles.c.length - 1] || 0;
  const previousPrice = candles.c[candles.c.length - 2] || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

  return (
    <div className="flex-1 min-h-0 overflow-hidden w-full">
      {/* Container for consistent width */}
      <div className="mx-auto w-full px-4">
        {/* Search Bar */}
        <div className="pt-4">
          <SearchBar className="w-full px-4" />
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="h-[calc(100vh-7rem)] px-6">
          <div className="py-6 space-y-6">
            {/* Company Header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={companyProfile.logo}
                    alt={companyProfile.name}
                  />
                  <AvatarFallback>{ticker.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <a
                  href={companyProfile.weburl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 hover:underline"
                >
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    {companyProfile.name} ({ticker})
                  </h1>
                </a>
                <span className="text-lg text-muted-foreground font-normal">
                  {companyProfile.exchange}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-semibold">
                  ${currentPrice.toFixed(2)}
                </span>
                <span
                  className={`ml-2 ${
                    priceChange >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {priceChange >= 0 ? "+" : ""}
                  {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Candle Chart */}
            <StockCandlestick candles={candles} />

            {/* Company Overview */}
            <CompanyOverview {...companyProfile} />

            {/* Company News */}
            <CompanyNews
              newsItems={newsItems}
              companyLogo={companyProfile.logo}
              companyName={companyProfile.name}
            />
          </div>
        </ScrollArea>

        {/* Footer */}
        <footer className="h-12 flex items-center justify-between text-sm text-muted-foreground border-t">
          <div>
            © {new Date().getFullYear()} Second Salary. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-foreground">
              Terms of Service
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
