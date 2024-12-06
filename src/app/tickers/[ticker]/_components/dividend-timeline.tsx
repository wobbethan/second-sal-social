"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

type Dividend = {
  cashAmount: number;
  declarationDate: string;
  dividendType: string;
  exDividendDate: string;
  frequency: number;
  payDate: string;
  recordDate: string;
};

export function DividendTimeline({ dividendData }: { dividendData: any }) {
  // Sort dividends by pay date
  const sortedDividends = [...dividendData.dividends].sort(
    (a, b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime()
  );

  // Calculate next predicted payment (3 months after most recent)
  const mostRecentPayment = sortedDividends[0];
  const predictedPayment = {
    cashAmount: mostRecentPayment.cashAmount,
    payDate: dayjs(mostRecentPayment.payDate)
      .add(3, "month")
      .format("YYYY-MM-DD"),
    predicted: true,
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{dividendData.ticker} Dividend Timeline</CardTitle>
        <CardDescription>
          Historical and predicted dividend payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full max-w-2xl mx-auto h-[200px]">
          <div className="relative ml-4">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-border" />

            {/* Timeline items */}
            <div className="space-y-8">
              {/* Predicted Payment */}
              <div className="relative pl-8">
                <div className="absolute left-0 w-4 h-4 rounded-full bg-orange-500" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Predicted Payment</div>
                  <div className="text-sm text-muted-foreground">
                    ${predictedPayment.cashAmount.toFixed(2)} on{" "}
                    {dayjs(predictedPayment.payDate).format("MMMM D, YYYY")}
                  </div>
                </div>
              </div>

              {/* Most Recent Payment */}
              <div className="relative pl-8">
                <div className="absolute left-0 w-4 h-4 rounded-full bg-green-500" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Most Recent Payment</div>
                  <div className="text-sm text-muted-foreground">
                    ${mostRecentPayment.cashAmount.toFixed(2)} on{" "}
                    {dayjs(mostRecentPayment.payDate).format("MMMM D, YYYY")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ex-Dividend:{" "}
                    {dayjs(mostRecentPayment.exDividendDate).format(
                      "MMM D, YYYY"
                    )}
                  </div>
                </div>
              </div>

              {/* Previous Payments */}
              {sortedDividends.slice(1).map((dividend, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-0 w-4 h-4 rounded-full bg-blue-500" />
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Previous Payment</div>
                    <div className="text-sm text-muted-foreground">
                      ${dividend.cashAmount.toFixed(2)} on{" "}
                      {dayjs(dividend.payDate).format("MMMM D, YYYY")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ex-Dividend:{" "}
                      {dayjs(dividend.exDividendDate).format("MMM D, YYYY")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
