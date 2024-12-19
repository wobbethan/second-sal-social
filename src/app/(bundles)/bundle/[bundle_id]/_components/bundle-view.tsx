"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { StocksTable } from "../../../create-bundle/_components/stocks-table";
import PayoutCalendar from "../../../create-bundle/_components/payout-calendar";
import { div, round } from "exact-math";

interface Stock {
  symbol: string;
  logo: string;
  percent: number;
  yield: number;
  shares: number;
  price: number;
  dividendGrowth: number;
  dividendHistory: any[];
  industry: string;
}

export function BundleView({ initialStocks }: { initialStocks: Stock[] }) {
  const [targetDaily, setTargetDaily] = useState(2.47);
  const [targetMonthly, setTargetMonthly] = useState(75);
  const [targetYearly, setTargetYearly] = useState(900);
  const [stocks, setStocks] = useState(initialStocks);

  const handleTargetChange = (
    value: number,
    type: "daily" | "monthly" | "yearly"
  ) => {
    switch (type) {
      case "daily":
        setTargetDaily(value);
        setTargetMonthly(value * 30.44);
        setTargetYearly(value * 365.25);
        break;
      case "monthly":
        setTargetMonthly(value);
        setTargetDaily(value / 30.44);
        setTargetYearly(value * 12);
        break;
      case "yearly":
        setTargetYearly(value);
        setTargetDaily(value / 365.25);
        setTargetMonthly(value / 12);
        break;
    }
  };

  const totalPercent = stocks.reduce((sum, stock) => sum + stock.percent, 0);
  const averageYield = calculateAverageValue(
    stocks.map((stock) => ({
      value: Number(stock.yield) || 0,
      percentage: Number(stock.percent) || 0,
    }))
  );
  const totalCost = getBundlePriceForDesiredIncome(targetYearly, averageYield);
  const averageGrowth = calculateWeightedAverage(
    stocks.map((stock) => ({
      value: stock.dividendGrowth,
      percentage: stock.percent,
    }))
  );
  const sectors = new Set(stocks.map((stock) => stock.industry)).size;
  const bundleScore = calculateBundleScore(stocks);

  useEffect(() => {
    setStocks((currentStocks) =>
      currentStocks.map((stock) => ({
        ...stock,
        shares: getSecuritySharesForBundle({
          bundlePrice: totalCost,
          totalPercent: 100,
          securityPercentage: stock.percent,
          securityPrice: stock.price,
        }),
      }))
    );
  }, [totalCost]);

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-lg mb-4">I want to make...</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Daily</div>
            <Input
              type="number"
              value={targetDaily.toFixed(2)}
              onChange={(e) =>
                handleTargetChange(parseFloat(e.target.value), "daily")
              }
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Monthly</div>
            <Input
              type="number"
              value={targetMonthly.toFixed(2)}
              onChange={(e) =>
                handleTargetChange(parseFloat(e.target.value), "monthly")
              }
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Yearly</div>
            <Input
              type="number"
              value={targetYearly.toFixed(2)}
              onChange={(e) =>
                handleTargetChange(parseFloat(e.target.value), "yearly")
              }
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-6">
          <StocksTable
            stocks={stocks}
            onRemoveStock={() => {}}
            onUpdatePercent={() => {}}
            readOnly
          />
        </div>

        <div
          className="md:sticky md:top-4"
          style={{ maxHeight: "calc(100vh - 2rem)" }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Cost to get ${targetMonthly.toFixed(2)} monthly
                </div>
                <div className="text-2xl font-bold">
                  $
                  {totalCost.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    Dividend yield
                  </div>
                  <div className="text-xl font-bold">
                    {averageYield.toFixed(2)}%
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    Average growth
                  </div>
                  <div className="text-xl font-bold">{averageGrowth}%</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Sectors</div>
                  <div className="text-xl font-bold">{sectors}</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    Bundle score
                  </div>
                  <div className="text-xl font-bold">
                    {bundleScore > 0 ? bundleScore.toFixed(2) : "—"}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <PayoutCalendar
        stocks={stocks.map((stock) => ({
          symbol: stock.symbol,
          shares: stock.shares,
          price: stock.price,
          dividendHistory: stock.dividendHistory,
          logo: stock.logo,
        }))}
      />
    </div>
  );
}

function calculateAverageValue(
  securities: Array<{ value: number; percentage: number }>
): number {
  if (securities.length === 0) return 0;
  const weightedSum = securities.reduce(
    (sum, sec) => sum + (sec.value * sec.percentage) / 100,
    0
  );
  return Number(weightedSum.toFixed(2));
}

function getBundlePriceForDesiredIncome(
  annualIncome: number,
  averageDividendYield: number
) {
  if (averageDividendYield === 0 || !annualIncome) return 0;
  return round(div(annualIncome, div(averageDividendYield, 100)), -2);
}

function calculateWeightedAverage(
  securities: Array<{ value: number; percentage: number }>
): number {
  if (!securities || securities.length === 0) return 0;

  let validSum = 0;
  let validPercentageTotal = 0;

  securities.forEach((sec) => {
    if (
      typeof sec.value === "number" &&
      typeof sec.percentage === "number" &&
      !isNaN(sec.value) &&
      !isNaN(sec.percentage) &&
      sec.percentage > 0
    ) {
      validSum += (sec.value * sec.percentage) / 100;
      validPercentageTotal += sec.percentage;
    }
  });

  if (validPercentageTotal === 0) return 0;

  const result = (validSum * 100) / validPercentageTotal;
  return Math.round(result * 100) / 100;
}

function calculateBundleScore(stocks: Stock[]): number {
  const totalWeight = 0.5 + 0.3 + 0.2;

  const averageYield = calculateAverageValue(
    stocks.map((s) => ({
      value: Number(s.yield) || 0,
      percentage: s.percent,
    }))
  );

  const safetyScores = stocks.map((stock) => {
    const hasConsistentDividends = stock.dividendHistory.length >= 4;
    const hasPositiveGrowth = stock.dividendGrowth > 0;
    const isEstablished = stock.price > 5;

    let score = 0;
    if (hasConsistentDividends) score += 40;
    if (hasPositiveGrowth) score += 40;
    if (isEstablished) score += 20;

    return score;
  });

  const averageSafetyScore = calculateAverageValue(
    stocks.map((s, i) => ({
      value: safetyScores[i],
      percentage: s.percent,
    }))
  );

  const averageExpenseRatio = calculateAverageValue(
    stocks.map((s) => ({
      value: 0.1,
      percentage: s.percent,
    }))
  );

  const score =
    (averageYield * 0.5 +
      averageSafetyScore * 0.3 -
      averageExpenseRatio * 0.2) /
    totalWeight;

  return Math.round(Math.min(Math.max(score / 10, 0), 10) * 100) / 100;
}

function getSecuritySharesForBundle({
  bundlePrice,
  totalPercent,
  securityPercentage,
  securityPrice,
}: {
  bundlePrice: number;
  totalPercent: number;
  securityPercentage: number;
  securityPrice: number;
}) {
  const price = (bundlePrice / totalPercent) * securityPercentage;
  return round(price / securityPrice, -2);
}