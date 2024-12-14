export interface Stock {
  symbol: string;
  name: string;
  price: number;
  yield: number;
  sector: string;
}

export interface Bundle {
  name: string;
  stocks: {
    symbol: string;
    percent: number;
    shares: number;
  }[];
  targetMonthly: number;
  country: "USA" | "Canada";
}
