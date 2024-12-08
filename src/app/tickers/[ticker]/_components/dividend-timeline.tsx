"use client";

import { DividendData } from "@/types/finnhub";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Loader2 } from "lucide-react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { predictNextDividend } from "@/actions/dividends";
import { useState } from "react";

interface TimelineItemProps {
  date: string;
  amount: number;
  exDate: string;
  status: "confirmed" | "most recent" | "predicted";
  isFirst?: boolean;
  isNew?: boolean;
}

function TimelineItem({
  date,
  amount,
  exDate,
  status,
  isFirst = false,
  isNew = false,
}: TimelineItemProps) {
  const statusColors = {
    confirmed: "bg-blue-700",
    "most recent": "bg-green-500",
    predicted: "bg-orange-500",
  };

  const pulseColors = {
    confirmed: "bg-blue-700/40",
    "most recent": "bg-green-500/40",
    predicted: "bg-orange-500/40",
  };

  const lineClasses = isNew
    ? "animate-draw-line absolute left-[7px] top-0 bottom-0 w-[2px] bg-gray-200 last:hidden origin-top"
    : "absolute left-[7px] top-0 bottom-0 w-[2px] bg-gray-200 last:hidden";

  return (
    <div
      className={`relative pl-8 pb-6 last:pb-0 ${
        isNew ? "animate-fade-in" : ""
      }`}
    >
      <div className={lineClasses} />
      <div
        className={`absolute left-0 top-0 w-4 h-4 rounded-full ${statusColors[status]}`}
      >
        {isFirst && (
          <span
            className="absolute inset-[2px] animate-[ping_3s_ease-in-out_infinite] rounded-full"
            style={{ backgroundColor: `${pulseColors[status]}` }}
          />
        )}
      </div>
      <div className="space-y-0">
        <div className="text-base font-medium">
          {dayjs(date).format("MMMM D, YYYY")}
        </div>
        <div className="text-sm text-muted-foreground">
          Ex-Dividend: {dayjs(exDate).format("MMM D, YYYY")}
        </div>
        <div className="text-sm font-semibold text-foreground">
          ${amount.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

interface DividendTimelineProps {
  dividends: DividendData[];
  ticker: string;
  onDividendsUpdate?: (dividends: DividendData[]) => void;
  className?: string;
}

export function DividendTimeline({
  dividends,
  ticker,
  onDividendsUpdate,
  className,
}: DividendTimelineProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dividendHistory, setDividendHistory] = useState(() => {
    // Initialize with timeline field
    const sortedData = [...dividends].sort(
      (a, b) => dayjs(b.payDate).unix() - dayjs(a.payDate).unix()
    );
    return sortedData.map((d, index) => ({
      ...d,
      timeline: index === 0 ? "most recent" : "confirmed",
    }));
  });

  const handlePrediction = async () => {
    try {
      setIsLoading(true);
      const mappedData = dividendHistory.map((d) => ({
        ...d,
        timeline: d.timeline as "confirmed" | "most recent" | "predicted",
      }));

      const updatedData = await predictNextDividend(mappedData);

      // Sort and update timeline values
      const newDividendData = updatedData
        .sort((a, b) => dayjs(b.payDate).unix() - dayjs(a.payDate).unix())
        .map((d, index) => ({
          ...d,
          timeline:
            d.timeline === "predicted"
              ? "predicted"
              : d.timeline === "most recent"
              ? "most recent"
              : "confirmed",
        }));

      setDividendHistory(newDividendData);
      onDividendsUpdate?.(newDividendData as DividendData[]);
    } catch (error) {
      console.error("Failed to predict next dividend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort dividends for display
  const sortedDividends = [...dividendHistory].sort(
    (a, b) => dayjs(b.payDate).unix() - dayjs(a.payDate).unix()
  );

  return (
    <div
      className={cn(
        "bg-muted border-l w-[300px] flex flex-col h-full",
        className
      )}
    >
      <div className="flex-none px-6 py-4 border-b">
        <h2 className="text-xl font-semibold mb-2">Dividend Timeline</h2>
        <p className="text-sm text-muted-foreground">
          Historical and predicted dividend payments
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="px-6 py-4">
            <div className="space-y-4">
              {sortedDividends.map((dividend, index) => (
                <TimelineItem
                  key={`${dividend.payDate}-${dividend.timeline}`}
                  date={dividend.payDate}
                  amount={dividend.amount}
                  exDate={dividend.date}
                  status={
                    dividend.timeline as
                      | "confirmed"
                      | "most recent"
                      | "predicted"
                  }
                  isFirst={index === 0}
                  isNew={dividend.timeline === "predicted"}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="flex-none px-6 py-4 border-t">
        <button
          onClick={handlePrediction}
          disabled={isLoading}
          className={cn(
            "w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <DollarSign className="h-4 w-4" />
          )}
          {isLoading ? "Predicting..." : "Predict next dividend"}
        </button>
      </div>
    </div>
  );
}
