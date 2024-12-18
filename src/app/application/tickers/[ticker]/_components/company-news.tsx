import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsItem } from "@/types/finnhub";

interface CompanyNewsProps {
  newsItems: NewsItem[];
  companyLogo?: string;
  companyName: string;
}

function formatDateTime(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function CompanyNews({
  newsItems,
  companyLogo,
  companyName,
}: CompanyNewsProps) {
  if (newsItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={`${companyName} logo`}
              className="w-24 h-24 object-contain mb-4 opacity-50"
            />
          ) : (
            <div className="w-24 h-24 bg-muted rounded-full mb-4" />
          )}
          <p className="text-muted-foreground text-center">
            No recent news available for {companyName}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {newsItems.map((article, index) => (
            <div
              key={index}
              className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col h-full"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image || companyLogo}
                    alt={article.headline}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <h3 className="font-semibold line-clamp-2 mb-2">
                    {article.headline}
                  </h3>
                  <div className="flex justify-between items-center mt-auto text-sm text-muted-foreground">
                    <span>{article.source}</span>
                    <span>{formatDateTime(article.datetime)}</span>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
