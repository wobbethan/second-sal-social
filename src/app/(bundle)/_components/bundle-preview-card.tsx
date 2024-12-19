"use client";

import { Card } from "@/components/ui/card";
import { ArrowRightCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { div, mul, round } from "exact-math";

interface SecurityData {
  symbol: string;
  percent: number;
  yield: number;
  score: number;
  logo: string;
}

interface BundlePreviewCardProps {
  bundle: {
    id: string;
    name: string;
    securities: any;
    creator: {
      username: string;
      image: string | null;
    };
    country: "US" | "TO";
  };
  targetMonthly: number;
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

export function BundlePreviewCard({
  bundle,
  targetMonthly,
}: BundlePreviewCardProps) {
  // Parse securities data properly
  const securities = Array.isArray(bundle.securities)
    ? bundle.securities
    : (JSON.parse(bundle.securities as string) as SecurityData[]);

  // Calculate average yield using the same method as bundle creator
  const averageYield = calculateAverageValue(
    securities.map((sec) => ({
      value: Number(sec.yield) || 0,
      percentage: Number(sec.percent) || 0,
    }))
  );

  // Calculate bundle score using the same method
  const bundleScore = calculateAverageValue(
    securities.map((sec) => ({
      value: Number(sec.score) || 0,
      percentage: Number(sec.percent) || 0,
    }))
  );

  // Calculate cost using the same formula as bundle creator
  const annualIncome = mul(targetMonthly, 12);
  const costToGet = getBundlePriceForDesiredIncome(annualIncome, averageYield);

  return (
    <Link href={`/bundles/${bundle.id}`}>
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-medium">{bundle.name}</h3>
            <p className="text-sm text-muted-foreground">
              {securities.length} stocks
              {bundle.creator.username && (
                <span className="text-muted-foreground">
                  {" "}
                  · by {bundle.creator.username}
                </span>
              )}
            </p>
          </div>
          <ArrowRightCircle className="h-6 w-6 text-primary" />
        </div>

        <div className="border-t border-border pt-6 mb-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-3xl font-bold text-primary">
                {averageYield.toFixed(2)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Avg. Dividend Yield
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">
                {bundleScore.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Bundle score</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-3">
            {securities.slice(0, 4).map((security) => (
              <div
                key={security.symbol}
                className="w-8 h-8 rounded-full border-2 border-background relative overflow-hidden bg-primary/10"
              >
                <Image
                  src={security.logo}
                  alt={security.symbol}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <div className="flex-1" />
          <div className="text-right">
            <p className="text-lg font-semibold">
              ${Math.round(costToGet).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Cost to get ${targetMonthly.toFixed(2)} monthly
            </p>
          </div>
          <div className="relative w-6 h-6 overflow-hidden">
            <Image
              src={
                bundle.country === "US"
                  ? "https://cdn.britannica.com/80/4480-004-83C31275/flag-Stars-and-Stripes-July-4-1818.jpg"
                  : "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/800px-Flag_of_Canada_%28Pantone%29.svg.png"
              }
              alt={bundle.country}
              fill
              className="rounded-full object-cover"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
