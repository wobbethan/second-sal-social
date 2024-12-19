"use client";

import { createBundle } from "@/actions/bundles";
import { getBundleStockData } from "@/actions/tickers";
import { getAllStocks } from "@/actions/tickers/search";
import { getUserPreferences, updateUserPreferences } from "@/actions/user";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DividendData } from "@/types/finnhub";
import { SearchResult } from "@/types/search";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { div, mul, round } from "exact-math";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CountrySelector } from "./country-selector";
import PayoutCalendar from "./payout-calendar";
import { StocksTable } from "./stocks-table";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Stock {
  symbol: string;
  logo: string;
  percent: number;
  yield: number;
  shares: number;
  price: number;
  dividendGrowth: number;
  dividendHistory: DividendData[];
  industry: string;
}

// Add form schema
const bundleSchema = z.object({
  name: z.string().min(1, "Bundle name is required"),
  country: z.enum(["US", "TO"]),
  securities: z
    .array(
      z.object({
        symbol: z.string(),
        percent: z.number().min(0).max(100),
        logo: z.string(),
      })
    )
    .refine((stocks) => {
      const total = stocks.reduce((sum, stock) => sum + stock.percent, 0);
      return total === 100;
    }, "Stock allocations must total 100%"),
});

export const getBundlePriceForDesiredIncome = (
  annualIncome: number,
  averageDividendYield: number
) => {
  if (averageDividendYield === 0 || !annualIncome) {
    return 0;
  }
  // Matches exactly with the original formula
  return round(div(annualIncome, div(averageDividendYield, 100)), -2);
};

type BundleFormData = z.infer<typeof bundleSchema>;

const calculateAverageValue = (
  securities: Array<{ value: number; percentage: number }>
): number => {
  if (securities.length === 0) return 0;

  const weightedSum = securities.reduce(
    (sum, sec) => sum + (sec.value * sec.percentage) / 100,
    0
  );

  return Number(weightedSum.toFixed(2));
};

const calculateWeightedAverage = (
  securities: Array<{ value: number; percentage: number }>
): number => {
  if (!securities || securities.length === 0) return 0;

  try {
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

    // Normalize the result based on valid percentages
    const result = (validSum * 100) / validPercentageTotal;
    return Math.round(result * 100) / 100;
  } catch (error) {
    console.error("Error calculating weighted average:", error);
    return 0;
  }
};

const calculateDividendGrowth = (dividendData: DividendData[]): number => {
  try {
    if (!dividendData || dividendData.length < 4) return 0;

    // Sort dividends by date in descending order
    const sortedDividends = [...dividendData].sort(
      (a, b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime()
    );

    // Get the most recent 4 quarters and oldest 4 quarters
    const recentYear = sortedDividends.slice(0, 4);
    const oldestYear = sortedDividends.slice(-4);

    if (recentYear.length < 4 || oldestYear.length < 4) return 0;

    // Calculate total dividends for each period
    const recentTotal = recentYear.reduce((sum, div) => sum + div.amount, 0);
    const oldestTotal = oldestYear.reduce((sum, div) => sum + div.amount, 0);

    if (oldestTotal <= 0 || recentTotal <= 0) return 0;

    // Calculate years between periods
    const yearsDiff =
      (new Date(recentYear[0].payDate).getTime() -
        new Date(oldestYear[oldestYear.length - 1].payDate).getTime()) /
      (365 * 24 * 60 * 60 * 1000);

    if (yearsDiff < 1) return 0;

    // Calculate CAGR
    const growthRate = recentTotal / oldestTotal;
    const power = 1 / yearsDiff;
    const cagr = (Math.pow(growthRate, power) - 1) * 100;

    // Round to 2 decimal places
    const roundedCagr = Math.round(cagr * 100) / 100;

    // Add debug logging

    if (
      isNaN(roundedCagr) ||
      !isFinite(roundedCagr) ||
      roundedCagr < -100 ||
      roundedCagr > 100
    ) {
      return 0;
    }

    return roundedCagr;
  } catch (error) {
    console.error("Error calculating dividend growth:", error);
    return 0;
  }
};

export const getSecuritySharesForBundle = ({
  bundlePrice,
  totalPercent,
  securityPercentage,
  securityPrice,
}: {
  bundlePrice: number;
  totalPercent: number;
  securityPercentage: number;
  securityPrice: number;
}) => {
  // Matches exactly with the original formula
  const price = mul(div(bundlePrice, totalPercent), securityPercentage);
  return round(div(price, securityPrice), -2);
};

const calculateBundleScore = (stocks: Stock[]): number => {
  const totalWeight = 0.5 + 0.3 + 0.2;

  // Calculate weighted average yield
  const averageYield = calculateAverageValue(
    stocks.map((s) => ({
      value: Number(s.yield) || 0,
      percentage: s.percent,
    }))
  );

  // Calculate safety score based on dividend growth and history
  const safetyScores = stocks.map((stock) => {
    const hasConsistentDividends = stock.dividendHistory.length >= 4;
    const hasPositiveGrowth = stock.dividendGrowth > 0;
    const isEstablished = stock.price > 5;

    // Score from 0-100 based on safety factors
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

  // Use a simplified expense ratio since we don't have actual expense ratios
  const averageExpenseRatio = calculateAverageValue(
    stocks.map((s) => ({
      value: 0.1, // Assume a standard expense ratio for now
      percentage: s.percent,
    }))
  );

  // Calculate final score (0-100 initially)
  const score =
    (averageYield * 0.5 +
      averageSafetyScore * 0.3 -
      averageExpenseRatio * 0.2) /
    totalWeight;

  // Convert 0-100 score to 0-10 scale and round to 2 decimal places
  return Math.round(Math.min(Math.max(score / 10, 0), 10) * 100) / 100;
};

const calculateDividendYield = (
  annualDividend: number | null | undefined,
  price: number | null | undefined
): number => {
  if (!annualDividend || !price || price === 0) {
    return 0;
  }

  // Matches exactly with getDividendYield formula
  const result = round(mul(div(annualDividend, price), 100), -2);
  return Number.isNaN(result) || result < 0 ? 0 : result;
};

export default function BundleBuilder() {
  const [selectedCountry, setSelectedCountry] = useState<"US" | "TO">("US");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [bundleName, setBundleName] = useState("");
  const [targetDaily, setTargetDaily] = useState(2.47);
  const [targetMonthly, setTargetMonthly] = useState(75);
  const [targetYearly, setTargetYearly] = useState(900);
  const [allStocks, setAllStocks] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const { user } = useUser();
  const [isPreferenceBased, setIsPreferenceBased] = useState(true);

  const router = useRouter();

  const { handleSubmit, setValue } = useForm<BundleFormData>({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      country: "US",
      securities: [],
    },
  });

  // Add form submission handler
  const onSubmit = async (data: BundleFormData) => {
    try {
      // Validation checks
      if (!bundleName.trim()) {
        alert("Please enter a bundle name");
        return;
      }

      if (totalPercent !== 100) {
        alert("Total allocation must be 100%");
        return;
      }

      if (hasZeroPercentStocks) {
        alert("Please remove stocks with 0% allocation");
        return;
      }

      const formData = new FormData();
      formData.append("name", bundleName);

      const securitiesData = stocks.map((s) => ({
        symbol: s.symbol,
        percent: s.percent,
        shares: s.shares,
        logo: s.logo,
      }));

      formData.append("securities", JSON.stringify(securitiesData));
      formData.append("currency", selectedCountry === "US" ? "USD" : "CAD");
      formData.append("country", selectedCountry);

      const result = await createBundle(formData);

      if (result.success) {
        alert("Bundle created successfully!");
      } else {
        throw new Error(result.error || "Failed to create bundle");
      }
    } catch (error) {
      console.error("Failed to create bundle:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create bundle. Please try again."
      );
    }
  };

  const handleCountryChange = useCallback(
    async (country: string, updatePreference: boolean) => {
      setSelectedCountry(country as "US" | "TO");
      setValue("country", country as "US" | "TO");
      setStocks([]);
      setSearchQuery("");
      setFilteredResults([]);
      setIsPreferenceBased(false);

      if (updatePreference) {
        try {
          await updateUserPreferences({ country: country as "US" | "TO" });
          setIsPreferenceBased(true);
        } catch (error) {
          console.error("Failed to update preferences:", error);
          alert("Failed to update preferences");
        }
      }
    },
    [setValue]
  );

  // Get user's preferred country on mount
  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const userPreferences = await getUserPreferences();
        if (userPreferences.success && userPreferences.preferences?.country) {
          setSelectedCountry(userPreferences.preferences.country);
          setValue("country", userPreferences.preferences.country);
          setIsPreferenceBased(true);
        }
      } catch (error) {
        console.error("Failed to fetch user preferences:", error);
      }
    };

    fetchUserCountry();
  }, [setValue]);

  // Fetch all stocks on component mount
  useEffect(() => {
    const fetchStocks = async () => {
      const stocks = await getAllStocks(selectedCountry === "US" ? "US" : "TO");
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
            stock.description.toUpperCase().includes(value) ||
            stock.symbol.includes(value)
        )
        .slice(0, 8);

      setFilteredResults(results);
    },
    [allStocks]
  );

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
  const sectors = new Set(stocks.map((stock) => stock.symbol.slice(0, 2))).size;

  const handleRemoveStock = (symbol: string) => {
    setStocks(stocks.filter((stock) => stock.symbol !== symbol));
  };

  const handleUpdatePercent = (symbol: string, percent: number) => {
    setStocks((currentStocks) =>
      currentStocks.map((stock) => {
        if (stock.symbol === symbol) {
          const shares = getSecuritySharesForBundle({
            bundlePrice: totalCost,
            totalPercent: 100,
            securityPercentage: percent,
            securityPrice: stock.price,
          });
          return { ...stock, percent, shares };
        }
        return stock;
      })
    );
  };

  const hasZeroPercentStocks = stocks.some((stock) => stock.percent === 0);

  const handleTargetChange = (
    value: string,
    type: "daily" | "monthly" | "yearly"
  ) => {
    // Parse value and ensure 2 decimal places
    const numValue = parseFloat(value) || 0;
    const roundedValue = Math.round(numValue * 100) / 100;

    switch (type) {
      case "daily":
        setTargetDaily(roundedValue);
        setTargetMonthly(Math.round(roundedValue * 30.44 * 100) / 100);
        setTargetYearly(Math.round(roundedValue * 365.25 * 100) / 100);
        break;
      case "monthly":
        setTargetMonthly(roundedValue);
        setTargetDaily(Math.round((roundedValue / 30.44) * 100) / 100);
        setTargetYearly(Math.round(roundedValue * 12 * 100) / 100);
        break;
      case "yearly":
        setTargetYearly(roundedValue);
        setTargetDaily(Math.round((roundedValue / 365.25) * 100) / 100);
        setTargetMonthly(Math.round((roundedValue / 12) * 100) / 100);
        break;
    }
  };

  const handleAddStock = async (stock: SearchResult) => {
    if (stocks.some((s) => s.symbol === stock.symbol)) {
      return;
    }

    try {
      const stockData = await getBundleStockData(stock.symbol);
      if (!stockData) {
        throw new Error("Failed to fetch stock data");
      }

      const stockInfo = {
        symbol: stock.symbol,
        logo: stockData.logo,
        price: stockData.price,
        yield: stockData.dividendYield,
        dividendHistory: stockData.dividendHistory,
        industry: stockData.industry,
        dividendGrowth: calculateDividendGrowth(stockData.dividendHistory),
      };

      setStocks((currentStocks) => {
        const totalPercent = currentStocks.reduce(
          (sum, s) => sum + s.percent,
          0
        );
        const remainingPercent = 100 - totalPercent;

        if (currentStocks.length === 0) {
          const shares = getSecuritySharesForBundle({
            bundlePrice: totalCost,
            totalPercent: 100,
            securityPercentage: 100,
            securityPrice: stockData.price,
          });
          return [{ ...stockInfo, percent: 100, shares }];
        }

        if (remainingPercent > 0) {
          const shares = getSecuritySharesForBundle({
            bundlePrice: totalCost,
            totalPercent: 100,
            securityPercentage: remainingPercent,
            securityPrice: stockData.price,
          });
          return [
            ...currentStocks,
            { ...stockInfo, percent: remainingPercent, shares },
          ];
        }

        const lastStock = currentStocks[currentStocks.length - 1];
        const splitPercent = Math.floor(lastStock.percent / 2);

        const newShares = getSecuritySharesForBundle({
          bundlePrice: totalCost,
          totalPercent: 100,
          securityPercentage: splitPercent,
          securityPrice: stockData.price,
        });

        const lastStockShares = getSecuritySharesForBundle({
          bundlePrice: totalCost,
          totalPercent: 100,
          securityPercentage: splitPercent,
          securityPrice: lastStock.price,
        });

        return [
          ...currentStocks.slice(0, -1),
          { ...lastStock, percent: splitPercent, shares: lastStockShares },
          { ...stockInfo, percent: splitPercent, shares: newShares },
        ];
      });

      setSearchQuery("");
      setFilteredResults([]);
    } catch (error) {
      console.error("Error adding stock:", error);
      alert("Failed to add stock. Please try again.");
    }
  };

  useEffect(() => {
    if (totalCost > 0) {
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
    }
  }, [totalCost]);

  const bundleScore = stocks.length > 0 ? calculateBundleScore(stocks) : 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!bundleName.trim()) {
          alert("Please enter a bundle name");
          return;
        }
        onSubmit({
          name: bundleName,
          securities: stocks.map((s) => ({
            symbol: s.symbol,
            percent: s.percent,
            logo: s.logo,
          })),
          country: selectedCountry,
        });
      }}
      className="max-w-6xl mx-auto p-4 space-y-8 justify-center"
    >
      <Link
        href="/bundles"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to overview
      </Link>

      <h1 className="text-2xl font-bold">Build a bundle</h1>

      {/* Target amounts */}
      <Card className="p-6">
        <h2 className="text-lg mb-4">I want to make...</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Daily</div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                $
              </span>
              <Input
                type="number"
                value={targetDaily}
                onChange={(e) => handleTargetChange(e.target.value, "daily")}
                className="pl-6"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Monthly</div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                $
              </span>
              <Input
                type="number"
                value={targetMonthly}
                onChange={(e) => handleTargetChange(e.target.value, "monthly")}
                className="pl-6"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Yearly</div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                $
              </span>
              <Input
                type="number"
                value={targetYearly}
                onChange={(e) => handleTargetChange(e.target.value, "yearly")}
                className="pl-6"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-6">
          {/* Country Selection */}
          <div className="flex items-center space-x-2">
            <Label className="text-sm">
              Country:
              {selectedCountry === "US" ? " United States" : " Canada"}
              <span className="text-muted-foreground ml-1">
                (
                {isPreferenceBased
                  ? "based on profile preferences"
                  : "one-time selection"}
                )
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
                  defaultCountry={selectedCountry}
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
                        type="button"
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
            type="submit"
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
                  {new Set(stocks.map((stock) => stock.industry)).size > 0 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <div className="text-sm text-muted-foreground">
                              Sectors
                            </div>
                            <div className="text-xl font-bold">
                              {
                                new Set(stocks.map((stock) => stock.industry))
                                  .size
                              }
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="w-64">
                          <div className="space-y-1">
                            {stocks.map((stock) => (
                              <div
                                key={stock.symbol}
                                className="flex justify-between text-sm"
                              >
                                <span>{stock.symbol}</span>
                                <span className="text-muted-foreground">
                                  {stock.industry}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground">
                        Sectors
                      </div>
                      <div className="text-xl font-bold">0</div>
                    </>
                  )}
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
      {stocks.length > 0 && (
        <PayoutCalendar
          stocks={stocks.map((stock) => ({
            symbol: stock.symbol,
            shares: stock.shares,
            price: stock.price,
            dividendHistory: stock.dividendHistory,
            logo: stock.logo,
          }))}
        />
      )}
    </form>
  );
}
