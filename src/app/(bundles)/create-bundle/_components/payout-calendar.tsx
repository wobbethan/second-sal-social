"use client";

import { DividendData } from "@/types/finnhub";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PayoutCalendarProps {
  stocks: Array<{
    symbol: string;
    shares: number;
    price: number;
    dividendHistory: DividendData[];
    logo: string;
  }>;
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function PayoutCalendar({ stocks }: PayoutCalendarProps) {
  // Get last year's worth of dividends for each stock
  const getMonthlyPayouts = (
    dividendHistory: DividendData[],
    shares: number
  ) => {
    const payouts = new Array(12).fill(0);
    const today = new Date();
    const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1));

    // Filter dividends for last 12 months and sort by date
    const recentDividends = dividendHistory
      .filter((div) => new Date(div.payDate) >= oneYearAgo)
      .sort(
        (a, b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime()
      );

    // Process each dividend payment
    recentDividends.forEach((div) => {
      if (!div.payDate || !div.amount) return;

      const payDate = new Date(div.payDate);
      const monthIndex = payDate.getMonth();

      // Only process if it's within the last 12 months
      if (monthIndex >= 0 && monthIndex < 12) {
        const amount = Number(div.amount) * Number(shares);
        if (Number.isFinite(amount)) {
          payouts[monthIndex] = Math.round(amount * 100) / 100;
        }
      }
    });

    // Add debug logging
    console.log(`Dividend payouts for last 12 months:`, {
      symbol: dividendHistory[0]?.symbol,
      dividendHistory: recentDividends,
      calculatedPayouts: payouts,
      shares,
    });

    return payouts;
  };

  const calculateMonthlyTotal = (monthIndex: number) => {
    const total = stocks.reduce((total, stock) => {
      const payouts = getMonthlyPayouts(stock.dividendHistory, stock.shares);
      return total + (payouts[monthIndex] || 0);
    }, 0);

    return Math.round(total * 100) / 100;
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            {months.map((month) => (
              <TableHead key={month} className="text-right">
                {month}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((stock) => {
            const payouts = getMonthlyPayouts(
              stock.dividendHistory,
              stock.shares
            );
            return (
              <TableRow key={stock.symbol}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <img
                      src={stock.logo}
                      alt={`${stock.symbol} logo`}
                      className="w-6 h-6 rounded"
                    />
                    {stock.symbol}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {stock.shares.toFixed(2)}
                </TableCell>
                {payouts.map((payout, index) => (
                  <TableCell
                    key={index}
                    className={`text-right ${payout > 0 ? "bg-green-100" : ""}`}
                  >
                    {payout > 0 ? `$${payout.toFixed(2)}` : "0"}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell className="font-medium">Dividend advance</TableCell>
            <TableCell className="text-right">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="text-sm text-muted-foreground underline cursor-help">
                    What's this?
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-center whitespace-nowrap">
                      Get your dividend payouts in advance to reinvest and
                      amplify your earnings.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            {months.map((_, index) => {
              const totalAnnualIncome = months.reduce(
                (sum, _, i) => sum + calculateMonthlyTotal(i),
                0
              );
              const monthlyAverage =
                Math.round((totalAnnualIncome / 12) * 100) / 100;
              return (
                <TableCell key={index} className="text-right bg-blue-50">
                  ${monthlyAverage.toFixed(2)}
                </TableCell>
              );
            })}
          </TableRow>
          <TableRow className="font-bold">
            <TableCell>Income</TableCell>
            <TableCell className="text-right"></TableCell>
            {months.map((_, index) => {
              const total = calculateMonthlyTotal(index);
              return (
                <TableCell key={index} className="text-right">
                  {total > 0 ? `$${total.toFixed(2)}` : "0"}
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
