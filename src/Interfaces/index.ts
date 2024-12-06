// Define the structure for Company Overview
export interface CompanyOverview {
  Symbol: string;
  Name: string;
  Description: string;
  MarketCapitalization: string;
  PERatio: string;
  DividendYield: string;
  "52WeekHigh": string;
  "52WeekLow": string;
  Industry: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  EPS: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  Sector: string;
  Exchange: string;
}

// Define the structure for Stock Quote
export interface StockQuote {
  "01. symbol": string;
  "02. open": string;
  "03. high": string;
  "04. low": string;
  "05. price": string;
  "06. volume": string;
  "07. latest trading day": string;
  "08. previous close": string;
  "09. change": string;
  "10. change percent": string;
}

// Define the structure for News Item
export interface NewsItem {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image?: string;
  source: string;
  category_within_source: string;
  source_domain: string;
}
