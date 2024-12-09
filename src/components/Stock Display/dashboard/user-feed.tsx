"use client";

import { searchTicker } from "@/actions/tickers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import { motion } from "framer-motion";
import {
  BarChart3,
  Eye,
  Flag,
  Heart,
  MessageCircle,
  Search,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";

const stockData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 2780 },
  { name: "May", value: 1890 },
  { name: "Jun", value: 2390 },
  { name: "Jul", value: 3490 },
];

const followedAccounts = [
  { name: "Sarah Johnson", avatar: "/avatar-1.jpg", status: "Online" },
  { name: "Mike Chen", avatar: "/avatar-2.jpg", status: "Creating bundle" },
  {
    name: "Emily Davis",
    avatar: "/avatar-3.jpg",
    status: "in Dividend Lovers",
  },
  { name: "Alex Thompson", avatar: "/avatar-4.jpg", status: "Offline" },
];

const initialNotifications = [
  {
    id: 1,
    title: "New follower",
    description: "John Doe started following you",
  },
  {
    id: 2,
    title: "Bundle update",
    description: 'Your "Tech Giants" bundle has increased by 5%',
  },
  {
    id: 3,
    title: "New comment",
    description: "Sarah left a comment on your post",
  },
  { id: 4, title: "Market alert", description: "NASDAQ is up by 2% today" },
  {
    id: 5,
    title: "Dividend payout",
    description: "You received a dividend payout from AAPL",
  },
];

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: string;
}

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout and abort controller
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (value.length === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Only search if query is at least 2 characters
    if (value.length < 2) return;

    setIsLoading(true);

    // Debounce the search with a timeout
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchTicker(value);
        setResults(searchResults);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResultClick = (symbol: string) => {
    router.push(`/tickers/${symbol}`);
    setQuery("");
    setResults([]);
    setIsFocused(false);
  };

  return (
    <div className="relative w-full" ref={searchBarRef}>
      <div className="relative">
        <Input
          type="search"
          placeholder="Search stocks..."
          className="w-full pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
          value={query}
          onChange={handleSearch}
          onFocus={() => setIsFocused(true)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {(isLoading || isFocused) && query.length > 0 ? (
            <div className="animate-spin h-5 w-5">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Search Results Dropdown with Loading State */}
      {isFocused && query.length > 0 && (results.length > 0 || isLoading) && (
        <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading && results.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>
          ) : (
            results.map((result) => (
              <button
                key={result.symbol}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => handleResultClick(result.symbol)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {result.description} ({result.symbol})
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.type}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function UserFeed() {
  const [activeTab, setActiveTab] = useState("home");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNotificationSheetOpen = (open: boolean) => {
    setIsNotificationSheetOpen(open);
    if (open) {
      setNotifications([]);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 w-full">
      {/* Main Content */}
      <main className="flex-1 p-4 overflow-hidden mr-80">
        {" "}
        {/* Added mr-80 to account for the fixed sidebar width */}
        <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
        <div className="mb-4">
          <SearchBar />
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-4 pr-4">
            {" "}
            {[
              {
                icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
                title: "Market News: Fed Announces Rate Cut",
                content:
                  "The Federal Reserve has announced a 0.25% rate cut. 📉",
              },
              {
                avatar: "/placeholder-avatar.jpg",
                name: "Jane Doe",
                username: "@janedoe",
                content:
                  "Just read an interesting article on the potential impact of AI on the stock market. Thoughts? 🤖📈 #AIStocks #FinTech",
              },
              {
                icon: <Users className="h-8 w-8 text-purple-500" />,
                title: "New Bundle: Emerging Markets Opportunity",
                content:
                  "Your friend Michael just created a new bundle focused on high-growth emerging market stocks. 🌍📊",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-green-500" />,
                title: "Tech Titans Bundle is trending!",
                content: "This bundle has gained 15% in the last 24 hours. 🚀",
              },
              {
                avatar: "/placeholder-avatar-3.jpg",
                name: "Emily Wong",
                username: "@emilywong",
                content:
                  'Just launched my "Green Energy Futures" bundle! Focusing on companies leading the charge in renewable energy. Check it out! 🌿⚡ #GreenInvesting #CleanEnergy',
                image:
                  "https://kundkundtc.com/wp-content/uploads/2022/01/best-green-energy-stocks-in-india.jpg",
              },
              {
                avatar: "/placeholder-avatar-2.jpg",
                name: "Alex Smith",
                username: "@alexsmith",
                content:
                  "My dividend portfolio is up 8% this quarter. Slow and steady wins the race! 🐢💰 #DividendInvesting #FinancialFreedom",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    {item.avatar ? (
                      <>
                        <div className="flex items-center space-x-4 mb-2">
                          <Avatar>
                            <AvatarImage src={item.avatar} alt={item.name} />
                            <AvatarFallback>
                              {item.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-blue-500">
                              {item.username}
                            </p>
                          </div>
                        </div>
                        <p className="mb-2">
                          {item.content.split(" ").map((word, i) =>
                            word.startsWith("#") ? (
                              <span key={i} className="text-blue-500">
                                {word}{" "}
                              </span>
                            ) : (
                              word + " "
                            )
                          )}
                        </p>
                        {item.image && (
                          <img
                            src={item.image}
                            alt="Post image"
                            className="w-[30%] h-auto rounded-lg mb-2 se"
                          />
                        )}
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Heart className="mr-1 h-4 w-4" /> Like
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="mr-1 h-4 w-4" /> Reply
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="mr-1 h-4 w-4" /> Share
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center space-x-4">
                        {item.icon}
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-gray-500">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-white border-l p-4 flex-shrink-0 overflow-y-auto fixed right-0 top-0 h-full">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="font-bold mb-2">AAPL Stock</h2>
              <div className="bg-gray-200 h-40 flex items-center justify-center">
                [Candlestick Chart Placeholder]
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="font-bold mb-2">Top Movers</h2>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>TSLA</span>
                  <span className="text-green-500">+5.67%</span>
                </li>
                <li className="flex justify-between">
                  <span>AMZN</span>
                  <span className="text-red-500">-2.34%</span>
                </li>
                <li className="flex justify-between">
                  <span>GOOGL</span>
                  <span className="text-green-500">+1.23%</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="font-bold mb-2">Suggested Forums</h2>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span className="text-blue-600">Dividend Lovers</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    Visit
                  </Button>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-blue-600">High Yield Kings</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    Visit
                  </Button>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-blue-600">Tech Stock Enthusiasts</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    Visit
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <h2 className="font-bold mb-2">Trending Bundles</h2>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span className="text-green-600">AI Revolution</span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    1.2k saves
                    <Flag className="h-4 w-4" />
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-green-600">Sustainable Energy</span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    3.5k likes
                    <Heart className="h-4 w-4" />
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-green-600">Crypto Innovators</span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    10k views
                    <Eye className="h-4 w-4" />
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </aside>
    </div>
  );
}
