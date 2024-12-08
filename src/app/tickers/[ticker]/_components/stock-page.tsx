"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dayjs from "dayjs";
import { DollarSign, Menu } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SidebarComponent from "@/components/ui/home-sidebar";
import { DividendTimeline } from "./dividend-timeline";
import { StockPageProps } from "@/types/props";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CompanyOverview from "./company-overview";
import CompanyNews from "./company-news";

export default function StockPage({
  ticker,
  companyProfile,
  newsItems,
  dividends,
  candles,
}: StockPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dividendHistory, setDividendHistory] = useState(dividends);

  // Calculate current price and changes
  const currentPrice = candles.c[candles.c.length - 1] || 0;
  const previousPrice = candles.c[candles.c.length - 2] || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

  const totalDividends = dividendHistory.reduce(
    (sum, dividend) => sum + dividend.amount,
    0
  );

  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex h-screen bg-muted w-full">
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto w-full">
        <div className="w-full mx-auto px-8 py-6 space-y-6">
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

          {/* Stock Performance Card */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Stock Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={candles}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="t"
                      tickFormatter={(date) => dayjs(date).format("MMM D")}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        `$${value.toFixed(2)}`,
                        "Price",
                      ]}
                      labelFormatter={(label) =>
                        dayjs(label).format("MMMM D, YYYY")
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="c"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card> */}

          {/* Company Overview */}
          <CompanyOverview {...companyProfile} />

          {/* Company News */}
          <CompanyNews
            newsItems={newsItems}
            companyLogo={companyProfile.logo}
            companyName={companyProfile.name}
          />
        </div>
      </div>

      {/* Right Sidebar - Dividend Timeline */}
      <div className="hidden lg:block w-[400px] border-l bg-muted">
        <DividendTimeline
          dividends={dividendHistory}
          ticker={ticker}
          onDividendsUpdate={setDividendHistory}
          open={true}
          onOpenChange={setSidebarOpen}
        />
      </div>

      {/* Mobile Dividend Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setSidebarOpen(true)}
          size="lg"
          className="rounded-full shadow-lg"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          View Dividends
        </Button>
      </div>

      {/* Mobile Dividend Timeline */}
      <DividendTimeline
        dividends={dividendHistory}
        ticker={ticker}
        onDividendsUpdate={setDividendHistory}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        className="lg:hidden"
      />
    </div>
  );
}
