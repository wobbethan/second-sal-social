"use client";

import { DividendData } from "@/types/finnhub";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DollarSign,
  Loader2,
  MessageCircle,
  Send,
  ChevronDown,
  Plus,
} from "lucide-react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { predictNextDividend, analyzeDividends } from "@/actions/dividends";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TimelineItemProps {
  date: string;
  amount: number;
  exDate: string;
  status: "confirmed" | "most recent" | "predicted";
  isFirst?: boolean;
  isNew?: boolean;
}

function TimelineItem({
  date,
  amount,
  exDate,
  status,
  isFirst = false,
  isNew = false,
}: TimelineItemProps) {
  const statusColors = {
    confirmed: "bg-blue-700",
    "most recent": "bg-green-500",
    predicted: "bg-orange-500",
  };

  const pulseColors = {
    confirmed: "bg-blue-700/40",
    "most recent": "bg-green-500/40",
    predicted: "bg-orange-500/40",
  };

  const lineClasses = isNew
    ? "animate-draw-line absolute left-[7px] top-0 bottom-0 w-[2px] bg-gray-200 last:hidden origin-top"
    : "absolute left-[7px] top-0 bottom-0 w-[2px] bg-gray-200 last:hidden";

  return (
    <div
      className={`relative pl-8 pb-6 last:pb-0 ${
        isNew ? "animate-fade-in" : ""
      }`}
    >
      <div className={lineClasses} />
      <div
        className={`absolute left-0 top-0 w-4 h-4 rounded-full ${statusColors[status]}`}
      >
        {isFirst && (
          <span
            className="absolute inset-[2px] animate-[ping_3s_ease-in-out_infinite] rounded-full"
            style={{ backgroundColor: `${pulseColors[status]}` }}
          />
        )}
      </div>
      <div className="space-y-0">
        <div className="text-base font-medium">
          {dayjs(date).format("MMMM D, YYYY")}
        </div>
        <div className="text-sm text-muted-foreground">
          Ex-Dividend: {dayjs(exDate).format("MMM D, YYYY")}
        </div>
        <div className="text-sm font-semibold text-foreground">
          ${amount.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

interface DividendTimelineProps {
  dividends: DividendData[];
  ticker: string;
  onDividendsUpdate?: (dividends: DividendData[]) => void;
  className?: string;
}

export function DividendTimeline({
  dividends,
  ticker,
  onDividendsUpdate,
  className,
}: DividendTimelineProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm Sal, your dividend analysis assistant. I can help you understand ${ticker}'s dividend history and predict future payments. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [dividendHistory, setDividendHistory] = useState(() => {
    const sortedData = [...dividends].sort(
      (a, b) => dayjs(b.payDate).unix() - dayjs(a.payDate).unix()
    );
    return sortedData.map((d, index) => ({
      ...d,
      timeline: index === 0 ? "most recent" : "confirmed",
    }));
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollDown(false);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollDown(isScrolledUp);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Predict Next Dividend Function
  const handlePrediction = async () => {
    try {
      setIsLoading(true);
      const mappedData = dividendHistory.map((d) => ({
        ...d,
        timeline: d.timeline as "confirmed" | "most recent" | "predicted",
      }));

      const updatedData = await predictNextDividend(mappedData);

      const newDividendData = updatedData
        .sort((a, b) => dayjs(b.payDate).unix() - dayjs(a.payDate).unix())
        .map((d) => ({
          ...d,
          timeline: (d.timeline === "predicted"
            ? "predicted"
            : d.timeline === "most recent"
            ? "most recent"
            : "confirmed") as "confirmed" | "most recent" | "predicted",
        }));

      setDividendHistory(newDividendData);
      onDividendsUpdate?.(newDividendData);
    } catch (error) {
      console.error("Failed to predict next dividend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chat Message Function
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const mappedHistory = dividendHistory.map((d) => ({
        ...d,
        timeline: d.timeline as
          | "confirmed"
          | "most recent"
          | "predicted"
          | undefined,
      }));

      const response = await analyzeDividends(input, mappedHistory, ticker, 0);

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.analysis || "I couldn't analyze that.",
        },
      ]);

      // If there are predictions, update the timeline
      if (response.predictions && response.predictions.length > 0) {
        // Find the most recent confirmed dividend
        const mostRecentConfirmed = dividendHistory.find(
          (d) => d.timeline === "most recent"
        );

        const newDividendData = [
          ...response.predictions.map((d) => ({
            ...d,
            timeline: "predicted" as const,
          })),
          ...dividendHistory
            .filter((d) => d !== mostRecentConfirmed)
            .map((d) => ({
              ...d,
              timeline: "confirmed" as const,
            })),
          ...(mostRecentConfirmed
            ? [
                {
                  ...mostRecentConfirmed,
                  timeline: "most recent" as const,
                },
              ]
            : []),
        ].sort((a, b) => dayjs(b.payDate).unix() - dayjs(a.payDate).unix());

        setDividendHistory(newDividendData);
        onDividendsUpdate?.(newDividendData);
      }
    } catch (error) {
      console.error("Failed to analyze dividend data:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error analyzing the data.",
        },
      ]);
    }
  };

  // Sort dividends for display
  const sortedDividends = [...dividendHistory].sort(
    (a, b) => dayjs(b.payDate).unix() - dayjs(a.payDate).unix()
  );

  const TypingIndicator = () => (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-lg px-4 py-2">
        <div className="flex space-x-2">
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "bg-muted border-l w-[300px] flex flex-col h-full",
          className
        )}
      >
        <div className="flex-none px-6 py-4 border-b space-y-2">
          <h2 className="text-xl font-semibold text-center">
            Dividend Timeline
          </h2>
          <div className="flex items-center justify-between flex-col">
            <p className="text-sm text-muted-foreground text-center">
              Historical and predicted dividend payments
            </p>
            <div className="flex w-full justify-center items-center flex-row">
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 ml-2"
                onClick={() => {}}
              >
                <span className="px-3 py-1 text-xs font-medium bg-blue-700 text-white rounded-full flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  Add to Bundle
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 ml-2"
                onClick={() => setChatOpen(true)}
              >
                <span className="px-3 py-1 text-xs font-medium bg-green-500 text-white rounded-full flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Ask Sal
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="px-6 py-4">
              <div className="space-y-4">
                {sortedDividends.map((dividend, index) => (
                  <TimelineItem
                    key={`${dividend.payDate}-${dividend.timeline}`}
                    date={dividend.payDate}
                    amount={dividend.amount}
                    exDate={dividend.date}
                    status={
                      dividend.timeline as
                        | "confirmed"
                        | "most recent"
                        | "predicted"
                    }
                    isFirst={index === 0}
                    isNew={dividend.timeline === "predicted"}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-none px-6 py-4 border-t">
          <button
            onClick={handlePrediction}
            disabled={isLoading}
            className={cn(
              "w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
            {isLoading ? "Predicting..." : "Predict next dividend"}
          </button>
        </div>
      </div>

      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle>Chat with Sal about {ticker} Dividends</DialogTitle>
          </DialogHeader>

          {/* Messages Container */}
          <div className="flex-1 min-h-0 relative">
            <ScrollArea className="h-full" onScrollCapture={handleScroll}>
              <div className="px-4">
                <div className="space-y-4 py-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2 max-w-[80%]",
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100"
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </ScrollArea>

            {/* Scroll to bottom button */}
            {showScrollDown && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition-opacity opacity-90 hover:opacity-100"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Input Form */}
          <div className="flex-none border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about dividend history..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
