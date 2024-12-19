"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { div, mul } from "exact-math";
import { useState } from "react";

interface TargetInputsProps {
  onChange: (targetMonthly: number) => void;
}

export function TargetInputs({ onChange }: TargetInputsProps) {
  const [targetDaily, setTargetDaily] = useState(2.47);
  const [targetMonthly, setTargetMonthly] = useState(75);
  const [targetYearly, setTargetYearly] = useState(900);

  const handleTargetChange = (
    value: string,
    type: "daily" | "monthly" | "yearly"
  ) => {
    const numValue = parseFloat(value) || 0;

    switch (type) {
      case "daily":
        setTargetDaily(numValue);
        setTargetMonthly(Number(mul(numValue, 30.44)));
        setTargetYearly(Number(mul(numValue, 365.25)));
        onChange(Number(mul(numValue, 30.44)));
        break;
      case "monthly":
        setTargetMonthly(numValue);
        setTargetDaily(Number(div(numValue, 30.44)));
        setTargetYearly(Number(mul(numValue, 12)));
        onChange(numValue);
        break;
      case "yearly":
        setTargetYearly(numValue);
        setTargetDaily(Number(div(numValue, 365.25)));
        setTargetMonthly(Number(div(numValue, 12)));
        onChange(Number(div(numValue, 12)));
        break;
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg mb-4">I want to make...</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-muted-foreground mb-2">Daily</div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
            <Input
              type="number"
              value={targetDaily.toFixed(2)}
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
            <Input
              type="number"
              value={targetMonthly.toFixed(2)}
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
            <Input
              type="number"
              value={targetYearly.toFixed(2)}
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
  );
}
