"use client";

import { getAllStocks, getStockPrice } from "@/actions/tickers/search";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useUserContext } from "@/context/UserContext";
import { SearchResult } from "@/types/search";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CountrySelector } from "./country-selector";
import { StocksTable } from "./stocks-table";
import { calculateDividendYield } from "@/actions/dividends";

interface Stock {
  symbol: string;
  logo: string;
  percent: number;
  yield: number;
  shares: number;
  price: number;
}

export default function BundleBuilder() {
  const [selectedCountry, setSelectedCountry] = useState<"US" | "CA">("US");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [bundleName, setBundleName] = useState("");
  const [targetDaily, setTargetDaily] = useState(2.47);
  const [targetMonthly, setTargetMonthly] = useState(75);
  const [targetYearly, setTargetYearly] = useState(900);
  const [allStocks, setAllStocks] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);

  const handleCountryChange = useCallback((country: string) => {
    setSelectedCountry(country as "US" | "CA");
    setStocks([]); // Clear stocks when country changes
    setSearchQuery(""); // Clear search
    setFilteredResults([]); // Clear results
  }, []);

  // Fetch all stocks on component mount
  useEffect(() => {
    const fetchStocks = async () => {
      const stocks = await getAllStocks(selectedCountry === "US" ? "US" : "CA");
      setAllStocks(stocks);
    };
    fetchStocks();
  }, [selectedCountry]);

  // Handle search with client-side filtering
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      setSearchQuery(value);

      if (value.length < 2) {
        setFilteredResults([]);
        return;
      }

      // Filter stocks based on search query
      const results = allStocks
        .filter(
          (stock) =>
            (stock.description.toUpperCase().includes(value) ||
              stock.symbol.includes(value)) &&
            stock.currency === (selectedCountry === "US" ? "USD" : "CAD")
        )
        .slice(0, 8);

      setFilteredResults(results);
    },
    [allStocks, selectedCountry]
  );

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

  const handleAddStock = async (stock: SearchResult) => {
    if (stocks.some((s) => s.symbol === stock.symbol)) {
      return; // Stock already exists in bundle
    }

    // Fetch the stock price and dividend yield
    const [price, dividendYield] = await Promise.all([
      getStockPrice(stock.symbol),
      calculateDividendYield(stock.symbol),
    ]);

    setStocks((currentStocks) => {
      const totalPercent = currentStocks.reduce((sum, s) => sum + s.percent, 0);
      const remainingPercent = 100 - totalPercent;

      if (currentStocks.length === 0) {
        // First stock gets 100%
        return [
          {
            symbol: stock.symbol,
            logo: "/placeholder.svg?height=24&width=24",
            percent: 100,
            yield: dividendYield,
            shares: 0,
            price: price,
          },
        ];
      } else if (remainingPercent > 0) {
        // If there's remaining percentage, use that
        return [
          ...currentStocks,
          {
            symbol: stock.symbol,
            logo: "/placeholder.svg?height=24&width=24",
            percent: remainingPercent,
            yield: dividendYield,
            shares: 0,
            price: price,
          },
        ];
      } else {
        // If at 100%, split the last stock's percentage
        const lastStock = currentStocks[currentStocks.length - 1];
        const splitPercent = lastStock.percent / 2;

        return [
          ...currentStocks.slice(0, -1),
          { ...lastStock, percent: splitPercent },
          {
            symbol: stock.symbol,
            logo: "/placeholder.svg?height=24&width=24",
            percent: splitPercent,
            yield: dividendYield,
            shares: 0,
            price: price,
          },
        ];
      }
    });

    setSearchQuery("");
    setFilteredResults([]);
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
              {selectedCountry === "US" ? "USA (NYSE)" : "CA (TSX)"}
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
                  onSelectCountry={handleCountryChange}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stock Search */}
          <div>
            <h3 className="text-sm mb-2">Add Stocks</h3>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stock"
                className="pl-9"
                value={searchQuery}
                onChange={handleSearch}
              />

              {/* Search Results Dropdown */}
              {searchQuery.length > 1 && (
                <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {!allStocks.length ? (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Loading available stocks...
                    </div>
                  ) : filteredResults.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No matches found
                    </div>
                  ) : (
                    filteredResults.map((result) => (
                      <button
                        key={result.symbol}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleAddStock(result)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium text-gray-700">
                              {result.description}
                            </div>
                          </div>
                          <div className="ml-4 text-sm font-mono text-blue-600">
                            {result.symbol}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
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
            <Progress value={totalPercent} />
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
            disabled={
              totalPercent !== 100 || hasZeroPercentStocks || !bundleName.trim()
            }
          >
            {hasZeroPercentStocks
              ? "Remove stocks with 0% allocation"
              : totalPercent !== 100
              ? "Adjust allocation to 100%"
              : !bundleName.trim()
              ? "Enter a bundle name"
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
