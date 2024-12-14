"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { getStockPrice } from "@/actions/tickers/search";
import { StocksTable } from "./stocks-table";
import { CountrySelector } from "./country-selector";

// Example stock data
const initialStocks = [
  {
    symbol: "AAPL",
    logo: "/placeholder.svg?height=24&width=24",
    percent: 20,
    yield: 0.4,
    shares: 19,
    price: 247.96,
  },
  {
    symbol: "FMNB",
    logo: "/placeholder.svg?height=24&width=24",
    percent: 20,
    yield: 3.3,
    shares: 304.59,
    price: 15.47,
  },
  {
    symbol: "TSCO",
    logo: "/placeholder.svg?height=24&width=24",
    percent: 20,
    yield: 1.93,
    shares: 132.14,
    price: 285.27,
  },
  {
    symbol: "MSFT",
    logo: "/placeholder.svg?height=24&width=24",
    percent: 20,
    yield: 0.8,
    shares: 50,
    price: 334.69,
  },
  {
    symbol: "AMZN",
    logo: "/placeholder.svg?height=24&width=24",
    percent: 20,
    yield: 0,
    shares: 25,
    price: 129.33,
  },
];

export default function BundleBuilder() {
  const [selectedCountry, setSelectedCountry] = useState<"USA" | "Canada">(
    "USA"
  );
  const [stocks, setStocks] = useState(initialStocks);
  const [bundleName, setBundleName] = useState("");
  const [targetDaily, setTargetDaily] = useState(2.47);
  const [targetMonthly, setTargetMonthly] = useState(75);
  const [targetYearly, setTargetYearly] = useState(900);

  const totalPercent = stocks.reduce((sum, stock) => sum + stock.percent, 0);
  const totalCost = stocks.reduce(
    (sum, stock) => sum + stock.shares * stock.price,
    0
  );
  const averageYield = stocks.reduce(
    (sum, stock) => sum + stock.yield * (stock.percent / 100),
    0
  );
  const averageGrowth = 11.9;
  const sectors = new Set(stocks.map((stock) => stock.symbol.slice(0, 2))).size;

  useEffect(() => {
    // Update stock prices periodically
    const updatePrices = async () => {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => ({
          ...stock,
          price: await getStockPrice(stock.symbol),
        }))
      );
      setStocks(updatedStocks);
    };

    const interval = setInterval(updatePrices, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [stocks]);

  const handleRemoveStock = (symbol: string) => {
    setStocks(stocks.filter((stock) => stock.symbol !== symbol));
  };

  const handleUpdatePercent = (symbol: string, percent: number) => {
    setStocks(
      stocks.map((stock) =>
        stock.symbol === symbol ? { ...stock, percent } : stock
      )
    );
  };

  const hasZeroPercentStocks = stocks.some((stock) => stock.percent === 0);

  const handleTargetChange = (
    value: number,
    type: "daily" | "monthly" | "yearly"
  ) => {
    switch (type) {
      case "daily":
        setTargetDaily(value);
        setTargetMonthly(value * 30.44); // Average days in a month
        setTargetYearly(value * 365.25); // Average days in a year
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

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 justify-center">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" className="space-x-2">
          <span>←</span>
          <span>Back to overview</span>
        </Button>
      </div>

      <h1 className="text-2xl font-bold">Build a bundle</h1>

      {/* Target amounts */}
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
          {/* Country Selection */}
          <div className="flex items-center space-x-2">
            <Label className="text-sm">
              Country and Exchange:{" "}
              {selectedCountry === "USA" ? "USA (NYSE)" : "Canada (TSX)"}
              <span className="text-muted-foreground ml-1">
                (based on profile preferences)
              </span>
            </Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="text-sm p-0 h-auto">
                  Change
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Country and Exchange</DialogTitle>
                </DialogHeader>
                <CountrySelector
                  selectedCountry={selectedCountry}
                  onSelectCountry={(country: string) =>
                    setSelectedCountry(country as "USA" | "Canada")
                  }
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stock Search */}
          <div>
            <h3 className="text-sm mb-2">Add Stocks</h3>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search stock" className="pl-9" />
            </div>
            <Button variant="link" className="text-sm p-0 h-auto mt-2">
              Most popular stocks
            </Button>
          </div>

          {/* Stocks Table */}
          {stocks.length > 0 && (
            <StocksTable
              stocks={stocks}
              onRemoveStock={handleRemoveStock}
              onUpdatePercent={handleUpdatePercent}
            />
          )}

          {/* Bundle Capacity */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Bundle capacity</span>
              <span
                className={
                  totalPercent === 100 ? "text-green-500" : "text-yellow-500"
                }
              >
                {totalPercent}% / 100%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  totalPercent === 100 ? "bg-green-500" : "bg-yellow-500"
                }`}
                style={{ width: `${totalPercent}%` }}
              />
            </div>
          </div>

          {/* Bundle Name */}
          <div>
            <h3 className="text-sm mb-2">Bundle name</h3>
            <Input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="My bundle name"
            />
          </div>

          <Button
            className="w-full"
            variant="default"
            disabled={totalPercent !== 100 || hasZeroPercentStocks}
          >
            {hasZeroPercentStocks
              ? "Remove stocks with 0% allocation"
              : totalPercent !== 100
              ? "Adjust allocation to 100%"
              : "Save my bundle"}
          </Button>
        </div>

        {/* Statistics */}
        <div className="md:sticky md:top-4 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Cost to get ${targetMonthly.toFixed(2)} monthly
                </div>
                <div className="text-2xl font-bold">
                  ${totalCost.toFixed(2)}
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
                  <div className="text-xl font-bold">—</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
