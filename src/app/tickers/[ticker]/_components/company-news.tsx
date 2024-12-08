import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsItem } from "@/types/finnhub";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CompanyNewsProps {
  newsItems: NewsItem[];
  companyLogo?: string;
  companyName: string;
}

function formatDateTime(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
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
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {newsItems.map((article, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/3">
                  <div className="h-full border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col h-full"
                    >
                      {article.image && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={article.image}
                            alt={article.headline}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
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
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12" />
            <CarouselNext className="hidden md:flex -right-12" />
          </Carousel>
        </div>
      </CardContent>
    </Card>
  );
}
