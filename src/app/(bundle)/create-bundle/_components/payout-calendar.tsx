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
    <div className="relative w-full overflow-hidden rounded-lg border">
      <Table className="bg-background">
        <TableHeader>
          <TableRow className="bg-[#F1F5F9] hover:bg-[#F1F5F9]">
            <TableHead className="text-center h-11 px-4 text-slate-600">
              Stock
            </TableHead>
            <TableHead className="text-center h-11 px-4 text-slate-600">
              Shares
            </TableHead>
            {months.map((month) => (
              <TableHead
                key={month}
                className="text-center h-11 px-4 text-slate-600"
              >
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
                <TableCell className="font-medium text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <img
                      src={stock.logo}
                      alt={`${stock.symbol} logo`}
                      className="w-6 h-6 rounded"
                    />
                    {stock.symbol}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {stock.shares.toFixed(2)}
                </TableCell>
                {payouts.map((payout, index) => (
                  <TableCell
                    key={index}
                    className={`text-center ${
                      payout > 0 ? "bg-green-100" : ""
                    }`}
                  >
                    {payout > 0 ? `$${payout.toFixed(2)}` : "0"}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell className="font-medium text-center">
              Dividend advance
            </TableCell>
            <TableCell className="text-center">
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
                <TableCell key={index} className="text-center bg-blue-50">
                  ${monthlyAverage.toFixed(2)}
                </TableCell>
              );
            })}
          </TableRow>
          <TableRow className="font-bold">
            <TableCell className="text-center">Income</TableCell>
            <TableCell className="text-center bg-orange-100">
              $
              {months
                .reduce((sum, _, i) => sum + calculateMonthlyTotal(i), 0)
                .toFixed(2)}
            </TableCell>
            {months.map((_, index) => {
              const total = calculateMonthlyTotal(index);
              return (
                <TableCell key={index} className="text-center">
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
