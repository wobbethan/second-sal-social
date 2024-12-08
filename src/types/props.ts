import { CandleData, CompanyProfile, DividendData, NewsItem } from "./finnhub";

// Main stock page props type
export interface StockPageProps {
  ticker: string;
  companyProfile: CompanyProfile;
  newsItems: NewsItem[];
  dividends: DividendData[];
  candles: CandleData;
}
