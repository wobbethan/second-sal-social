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
import { predictNextDividend } from "@/actions/dividends";
import { DividendChatDialog } from "./dividend-chat-dialog";
import { StockPageProps } from "@/types/props";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CompanyOverview from "./company-overview";
import CompanyNews from "./company-news";

function DividendTimelineItem({
  date,
  amount,
  exDate,
  status = "past",
  isFirst = false,
  isNew = false,
}: {
  date: string;
  amount: string;
  exDate: string;
  status?: "past" | "recent" | "predicted";
  isFirst?: boolean;
  isNew?: boolean;
}) {
  const statusColors = {
    past: "bg-gray-400",
    recent: "bg-green-500",
    predicted: "bg-blue-400",
  };

  const lineClasses = isNew
    ? "animate-draw-line absolute left-[7px] top-3 bottom-0 w-[2px] bg-gray-200 last:hidden origin-top"
    : "absolute left-[7px] top-3 bottom-0 w-[2px] bg-gray-200 last:hidden";

  return (
    <div
      className={`relative pl-8 pb-8 last:pb-0 ${
        isNew ? "animate-fade-in" : ""
      }`}
    >
      {/* Timeline vertical line */}
      <div className={lineClasses} />

      {/* Timeline dot */}
      <div
        className={`absolute left-0 top-1 w-4 h-4 rounded-full ${statusColors[status]}`}
      >
        {status === "recent" && (
          <span className="absolute inset-[2px] animate-[ping_3s_ease-in-out_infinite] rounded-full bg-green-500/40" />
        )}
      </div>

      {/* Content */}
      <div className="space-y-1 pt-0.5">
        <div className="text-sm font-medium">
          {dayjs(date).format("MMMM D, YYYY")}
        </div>
        <div className="text-sm text-muted-foreground">
          ${parseFloat(amount).toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground">
          Ex-Dividend Date: {dayjs(exDate).format("MMM D, YYYY")}
        </div>
      </div>
    </div>
  );
}

export default function StockPage({
  ticker,
  companyProfile,
  newsItems,
  dividends,
  candles,
}: StockPageProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dividendHistory, setDividendHistory] = useState(() => {
    // Initialize with timeline field
    const sortedData = [...dividends].sort(
      (a, b) => dayjs(b.payDate).unix() - dayjs(a.payDate).unix()
    );
    return sortedData;
  });

  const handlePrediction = async () => {
    try {
      const mappedData = dividendHistory.map((d) => ({
        date: d.payDate,
        amount: d.amount,
      }));
      const updatedData = await predictNextDividend(mappedData);

      // Convert back to the original format
      const newDividendData = updatedData.map((d) => ({
        symbol: ticker,
        date: d.date,
        amount: d.amount,
        payDate: d.date,
        recordDate: d.date,
        currency: "USD",
        adjustedAmount: d.amount,
      }));

      setDividendHistory(newDividendData);
    } catch (error) {
      console.error("Failed to predict next dividend:", error);
    }
  };

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
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="lg:hidden p-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SidebarComponent />
          </SheetContent>
        </Sheet>
      </div>

      <ScrollArea className="flex-1 p-6 w-full">
        <div className="mb-6">
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
        </div>

        <Card className="mb-6">
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
        </Card>

        <CompanyOverview {...companyProfile} />

        <CompanyNews
          newsItems={newsItems}
          companyLogo={companyProfile.logo}
          companyName={companyProfile.name}
        />
      </ScrollArea>

      {/* Right sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-80 border-l bg-muted/40 flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-2">Dividend Timeline</h2>
          <p className="text-sm text-muted-foreground">
            Historical and predicted dividend payments
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="space-y-0">
              {dividendHistory
                .sort(
                  (a, b) => dayjs(b.payDate).unix() - dayjs(a.payDate).unix()
                )
                .map((dividend, index) => (
                  <DividendTimelineItem
                    key={index}
                    date={dividend.payDate}
                    amount={dividend.amount.toString()}
                    exDate={dividend.date}
                    status={
                      dayjs(dividend.payDate).isAfter(dayjs())
                        ? "predicted"
                        : index === 0
                        ? "recent"
                        : "past"
                    }
                    isFirst={index === 0}
                    isNew={dividend.isNew}
                  />
                ))}
            </div>
          </div>
        </ScrollArea>
        <div className="p-4 border-t w-full">
          <button
            onClick={handlePrediction}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2 w-full"
          >
            <DollarSign className="h-4 w-4" />
            <h1>Predict next dividend date</h1>
          </button>
        </div>
      </aside>

      {/* Mobile Dividend Timeline Button - Only visible on small screens */}
      <div className="lg:hidden fixed bottom-4 right-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <DollarSign className="mr-2 h-4 w-4" />
              View Dividends
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold mb-2">
                  Dividend Timeline
                </h2>
                <p className="text-sm text-muted-foreground">
                  Historical and predicted dividend payments
                </p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <div className="space-y-0">
                    {dividendHistory
                      .sort(
                        (a, b) =>
                          dayjs(b.payDate).unix() - dayjs(a.payDate).unix()
                      )
                      .map((dividend, index) => (
                        <DividendTimelineItem
                          key={index}
                          date={dividend.payDate}
                          amount={dividend.amount.toString()}
                          exDate={dividend.date}
                          status={
                            dayjs(dividend.payDate).isAfter(dayjs())
                              ? "predicted"
                              : index === 0
                              ? "recent"
                              : "past"
                          }
                          isFirst={index === 0}
                          isNew={dividend.isNew}
                        />
                      ))}
                  </div>
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <button
                  onClick={handlePrediction}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 w-full"
                >
                  <DollarSign className="h-4 w-4" />
                  Predict next dividend date
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <DividendChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        dividendData={dividendHistory}
      />
    </div>
  );
}
