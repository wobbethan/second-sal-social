"use client";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface TargetIncomeInputsProps {
  initialDaily?: number;
  initialMonthly?: number;
  initialYearly?: number;
  onChange?: (values: {
    daily: number;
    monthly: number;
    yearly: number;
  }) => void;
}

export function TargetIncomeInputs({
  initialDaily = 2.47,
  initialMonthly = 75,
  initialYearly = 900,
  onChange,
}: TargetIncomeInputsProps) {
  const [targetDaily, setTargetDaily] = useState(initialDaily);
  const [targetMonthly, setTargetMonthly] = useState(initialMonthly);
  const [targetYearly, setTargetYearly] = useState(initialYearly);

  const handleTargetChange = (
    value: string,
    type: "daily" | "monthly" | "yearly"
  ) => {
    const numValue = parseFloat(value) || 0;
    const roundedValue = Math.round(numValue * 100) / 100;

    switch (type) {
      case "daily":
        setTargetDaily(roundedValue);
        setTargetMonthly(Math.round(roundedValue * 30.44 * 100) / 100);
        setTargetYearly(Math.round(roundedValue * 365.25 * 100) / 100);
        onChange?.({
          daily: roundedValue,
          monthly: Math.round(roundedValue * 30.44 * 100) / 100,
          yearly: Math.round(roundedValue * 365.25 * 100) / 100,
        });
        break;
      case "monthly":
        setTargetMonthly(roundedValue);
        setTargetDaily(Math.round((roundedValue / 30.44) * 100) / 100);
        setTargetYearly(Math.round(roundedValue * 12 * 100) / 100);
        onChange?.({
          daily: Math.round((roundedValue / 30.44) * 100) / 100,
          monthly: roundedValue,
          yearly: Math.round(roundedValue * 12 * 100) / 100,
        });
        break;
      case "yearly":
        setTargetYearly(roundedValue);
        setTargetDaily(Math.round((roundedValue / 365.25) * 100) / 100);
        setTargetMonthly(Math.round((roundedValue / 12) * 100) / 100);
        onChange?.({
          daily: Math.round((roundedValue / 365.25) * 100) / 100,
          monthly: Math.round((roundedValue / 12) * 100) / 100,
          yearly: roundedValue,
        });
        break;
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-medium mb-4">I want to make...</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-muted-foreground mb-2">Daily</div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              value={targetDaily}
              onChange={(e) => handleTargetChange(e.target.value, "daily")}
              className="pl-7"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-2">Monthly</div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              value={targetMonthly}
              onChange={(e) => handleTargetChange(e.target.value, "monthly")}
              className="pl-7"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-2">Yearly</div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              value={targetYearly}
              onChange={(e) => handleTargetChange(e.target.value, "yearly")}
              className="pl-7"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
