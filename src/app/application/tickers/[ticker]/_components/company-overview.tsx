import {
  Building2,
  Globe,
  Phone,
  Calendar,
  DollarSign,
  BarChart3,
  Building,
  Landmark,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyProfile } from "@/types/finnhub";

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000000) {
    // Trillion
    return `$${(marketCap / 1000000).toFixed(2)} trillion`;
  } else if (marketCap >= 1000) {
    // Billion
    return `$${(marketCap / 1000).toFixed(2)} billion`;
  } else {
    // Million
    return `$${marketCap.toFixed(2)} million`;
  }
}

function formatDate(dateStr: string): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [year, month, day] = dateStr.split("-").map(Number);
  return `${months[month - 1]} ${day}, ${year}`;
}

export default function CompanyOverview({
  country,
  currency,
  exchange,
  ipo,
  marketCapitalization,
  name,
  phone,
  shareOutstanding,
  ticker,
  weburl,
  logo,
  finnhubIndustry,
  description,
}: CompanyProfile) {
  return (
    <Card className="mb-6 w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Company Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="font-medium truncate">
                  {formatMarketCap(marketCapitalization)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-medium truncate">{finnhubIndustry}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Exchange</p>
                <p className="font-medium truncate">{exchange}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="font-medium truncate">{currency}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">IPO Date</p>
                <p className="font-medium truncate">{formatDate(ipo)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  Shares Outstanding
                </p>
                <p className="font-medium truncate">
                  {shareOutstanding.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium truncate">{country}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 col-span-1 sm:col-span-2 lg:col-span-1">
              <Globe className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Website</p>
                <a
                  href={weburl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline truncate block"
                >
                  {weburl}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium truncate">{phone}</p>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
