"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandleData } from "@/types/finnhub";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic<any>(() => import("react-apexcharts"), { ssr: false });

interface StockCandlestickProps {
  candles: CandleData;
}

export default function StockCandlestick({ candles }: StockCandlestickProps) {
  // Format the data for ApexCharts
  const seriesData = candles.t.map((timestamp, index) => ({
    x: new Date(timestamp * 1000), // Convert Unix timestamp to Date
    y: [
      candles.o[index], // Open
      candles.h[index], // High
      candles.l[index], // Low
      candles.c[index], // Close
    ],
  }));

  const options: ApexOptions = {
    chart: {
      type: "candlestick",
      height: 400,
      background: "transparent",
      animations: {
        enabled: false,
      },
    },
    title: {
      text: "Stock Price Movement",
      align: "left",
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        formatter: (value) => `$${value.toFixed(2)}`,
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#22c55e",
          downward: "#ef4444",
        },
        wick: {
          useFillColor: true,
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      x: {
        format: "MMM dd HH:mm",
      },
    },
  };

  const series = [
    {
      data: seriesData,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Price Movement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <Chart
            options={options}
            series={series}
            type="candlestick"
            height={400}
          />
        </div>
      </CardContent>
    </Card>
  );
}
