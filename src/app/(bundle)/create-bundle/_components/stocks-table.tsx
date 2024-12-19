import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";
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

  const handlePercentChange = (symbol: string, value: string) => {
    const newPercent = Math.floor(parseFloat(value));
    if (!isNaN(newPercent) && newPercent >= 0 && newPercent <= 100) {
      const currentTotal = stocks.reduce(
        (sum, s) => sum + (s.symbol === symbol ? 0 : s.percent),
        0
      );

      if (currentTotal + newPercent <= 100) {
        onUpdatePercent(symbol, newPercent);
      }
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg border">
      <Table className="bg-background">
        <TableHeader>
          <TableRow className="bg-[#F1F5F9] hover:bg-[#F1F5F9]">
            <TableHead className="h-11 px-4 text-slate-600">Symbol</TableHead>
            <TableHead className="h-11 px-4 text-right text-slate-600">
              Percent
            </TableHead>
            <TableHead className="h-11 px-4 text-right text-slate-600">
              Yield
            </TableHead>
            <TableHead className="h-11 px-4 text-right text-slate-600">
              Shares
            </TableHead>
            <TableHead className="h-11 px-4 text-right text-slate-600">
              Price
            </TableHead>
            {!readOnly && (
              <TableHead className="h-11 w-16 px-4 text-slate-600" />
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((stock) => (
            <TableRow key={stock.symbol}>
              <TableCell className="px-4">
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
              </TableCell>
              <TableCell className="px-4">
                <div className="flex items-center justify-end gap-2">
                  {readOnly ? (
                    <span>{stock.percent}%</span>
                  ) : (
                    <Input
                      type="number"
                      value={stock.percent}
                      onChange={(e) =>
                        handlePercentChange(stock.symbol, e.target.value)
                      }
                      className="w-20 text-right"
                      min="0"
                      max={
                        100 -
                        stocks.reduce(
                          (sum, s) =>
                            sum + (s.symbol === stock.symbol ? 0 : s.percent),
                          0
                        )
                      }
                      step="1"
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right px-4">
                {typeof stock.yield === "number" && !isNaN(stock.yield)
                  ? `${stock.yield.toFixed(2)}%`
                  : "0.00%"}
              </TableCell>
              <TableCell className="text-right px-4">
                {stock.shares.toFixed(2)}
              </TableCell>
              <TableCell className="text-right px-4">
                ${stock.price.toFixed(2)}
              </TableCell>
              {!readOnly && (
                <TableCell className="px-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveStock(stock.symbol)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
