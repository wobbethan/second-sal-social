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

interface StockPageProps {
  ticker: string;
  dividendData: {
    ex_dividend_date: string;
    declaration_date: string;
    record_date: string;
    payment_date: string;
    amount: string;
  }[];
  tickerDetails: {
    name: string;
    market_cap: number;
    description: string;
    peRatio: number;
    industry: string;
    exchange: string;
  };
  tickerNews: {
    id: string;
    publisher: {
      name: string;
      homepage_url: string;
    };
    title: string;
    author: string;
    published_utc: string;
    article_url: string;
    description: string;
    image_url: string;
  }[];
  aggregateBars: Array<{
    t: string; // date string instead of timestamp
    c: number; // close
    h: number; // high
    l: number; // low
    o: number; // open
    v: number; // volume
  }>;
}

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

export function StockPageComponent({
  ticker,
  dividendData: initialDividendData,
  tickerDetails,
  tickerNews,
  aggregateBars,
}: StockPageProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dividendData, setDividendData] = useState(() => {
    // Initialize with timeline field
    const sortedData = [...initialDividendData].sort(
      (a, b) => dayjs(b.payment_date).unix() - dayjs(a.payment_date).unix()
    );
    return sortedData;
  });

  const handleAddToBundle = async () => {
    try {
      const mappedData = dividendData.map((d) => ({
        date: d.payment_date,
        amount: parseFloat(d.amount),
      }));
      const updatedData = await predictNextDividend(mappedData);

      // Convert back to the original format
      const newDividendData = updatedData.map((d) => ({
        payment_date: d.date,
        amount: d.amount.toString(),
        ex_dividend_date: d.date,
        declaration_date: d.date,
        record_date: d.date,
        isNew: true,
      }));

      setDividendData(newDividendData);
      setDividendData((data) => data.map((d) => ({ ...d, isNew: false })));
    } catch (error) {
      console.error("Failed to predict next dividend:", error);
    }
  };

  // Calculate current price and changes from aggregate bars
  const currentPrice = aggregateBars[aggregateBars.length - 1]?.c || 0;
  const previousPrice =
    aggregateBars[aggregateBars.length - 2]?.c || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

  // Calculate next predicted payment (3 months after most recent)

  const totalDividends = dividendData.reduce(
    (sum, dividend) => sum + parseFloat(dividend.amount),
    0
  );

  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row h-full">
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

      <ScrollArea className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {tickerDetails.name} ({ticker})
            <span className="ml-2 text-muted-foreground">
              {tickerDetails.exchange}
            </span>
          </h1>
          <div className="flex items-center mt-2">
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Stock Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregateBars}>
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

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Company Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Key Statistics</h3>
                    <ul className="space-y-2">
                      <li>
                        <span className="font-medium">Market Cap:</span> $
                        {tickerDetails.market_cap.toLocaleString()}
                      </li>
                      <li>
                        <span className="font-medium">P/E Ratio:</span>{" "}
                        {tickerDetails.peRatio}
                      </li>
                      <li>
                        <span className="font-medium">Dividend Yield:</span>{" "}
                        {((totalDividends / currentPrice) * 100).toFixed(2)}%
                      </li>
                      <li>
                        <span className="font-medium">52 Week Range:</span> $
                        {Math.min(...aggregateBars.map((bar) => bar.l)).toFixed(
                          2
                        )}{" "}
                        - $
                        {Math.max(...aggregateBars.map((bar) => bar.h)).toFixed(
                          2
                        )}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      About {tickerDetails.name}
                    </h3>
                    <p>{tickerDetails.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle>Latest News</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tickerNews.slice(0, 3).map((article, index) => (
                    <div
                      key={index}
                      className="border rounded-md overflow-hidden"
                    >
                      <a href={article.article_url} className="block">
                        <div className="p-2">
                          <h3 className="font-semibold">{article.title}</h3>
                        </div>
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-48 object-contain"
                        />
                        <div className="flex justify-between p-2 text-sm text-muted-foreground">
                          <span>{article.publisher.name}</span>
                          <span>
                            {new Date(
                              article.published_utc
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
              {dividendData
                .sort(
                  (a, b) =>
                    dayjs(b.payment_date).unix() - dayjs(a.payment_date).unix()
                )
                .map((dividend, index) => (
                  <DividendTimelineItem
                    key={index}
                    date={dividend.payment_date}
                    amount={dividend.amount}
                    exDate={dividend.ex_dividend_date}
                    status={
                      dayjs(dividend.payment_date).isAfter(dayjs())
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
            onClick={handleAddToBundle}
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
                    {dividendData
                      .sort(
                        (a, b) =>
                          dayjs(b.payment_date).unix() -
                          dayjs(a.payment_date).unix()
                      )
                      .map((dividend, index) => (
                        <DividendTimelineItem
                          key={index}
                          date={dividend.payment_date}
                          amount={dividend.amount}
                          exDate={dividend.ex_dividend_date}
                          status={
                            dayjs(dividend.payment_date).isAfter(dayjs())
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
                  onClick={handleAddToBundle}
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
        dividendData={dividendData}
      />
    </div>
  );
}
