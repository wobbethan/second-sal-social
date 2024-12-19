import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Stock {
  symbol: string;
  logo: string;
  percent: number;
  yield: number;
  shares: number;
  price: number;
}

interface StocksTableProps {
  stocks: Stock[];
  onRemoveStock: (symbol: string) => void;
  onUpdatePercent: (symbol: string, percent: number) => void;
  readOnly?: boolean;
}

export function StocksTable({
  stocks,
  onRemoveStock,
  onUpdatePercent,
  readOnly,
}: StocksTableProps) {
  const [stockToDelete, setStockToDelete] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (stockToDelete) {
      onRemoveStock(stockToDelete);
      setStockToDelete(null);
    }
  };

  return (
    <div className="rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Symbol</th>
              <th className="text-right p-3">Percent</th>
              <th className="text-right p-3">Yield</th>
              <th className="text-right p-3">Shares</th>
              <th className="text-right p-3">Price</th>
              <th className="w-16 p-3"></th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.symbol} className="border-t">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={stock.logo}
                      alt={`${stock.symbol} logo`}
                      className="w-6 h-6 rounded"
                    />
                    {stock.symbol}
                    {stock.percent === 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Stock allocation cannot be 0%. Please allocate a
                              percentage or remove the stock.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
                <td className="p-3 flex items-center justify-end gap-2">
                  {readOnly ? (
                    <span>{stock.percent.toFixed(2)}%</span>
                  ) : (
                    <Input
                      type="number"
                      value={stock.percent}
                      onChange={(e) =>
                        onUpdatePercent(
                          stock.symbol,
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-20 text-right"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {typeof stock.yield === "number" && !isNaN(stock.yield)
                    ? `${stock.yield.toFixed(2)}%`
                    : "0.00%"}
                </td>
                <td className="text-right p-3">{stock.shares.toFixed(2)}</td>
                <td className="text-right p-3">${stock.price.toFixed(2)}</td>
                {!readOnly && (
                  <td className="p-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveStock(stock.symbol)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!stockToDelete}
        onClose={() => setStockToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Stock"
        description="Are you sure you want to remove this stock from your bundle?"
      />
    </div>
  );
}
