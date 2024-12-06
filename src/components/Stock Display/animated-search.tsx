//@ts-ignore
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

// Reduced number of sample items for better readability
const searchResults = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  image: `/placeholder.svg?height=40&width=40`,
}));

export function AnimatedSearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState(searchResults);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const itemWidth = 200;
  const itemHeight = 60;
  const padding = 20;
  const searchBarRadius = 150; // Increased to create more space around the search bar

  useEffect(() => {
    const filtered = searchResults.filter((result) =>
      result.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResults(positionResults(filtered));
  }, [searchTerm]);

  const handleResultClick = (name: string) => {
    router.push(`${encodeURIComponent(name)}`);
  };

  const positionResults = (results: typeof searchResults) => {
    if (!containerRef.current) return results;

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    return results.map((result, index) => {
      let x: number, y: number;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        // Use polar coordinates for more even distribution
        const angle = (index / results.length) * 2 * Math.PI;
        const radius =
          1.5 *
          (Math.min(containerWidth, containerHeight) / 2 - itemWidth - padding);
        x = centerX + radius * Math.cos(angle) - itemWidth / 2;
        y = centerY + radius * Math.sin(angle) - itemHeight / 2;
        attempts++;

        // Ensure item is not too close to the search bar
        const distanceToCenter = Math.sqrt(
          Math.pow(x + itemWidth / 2 - centerX, 2) +
            Math.pow(y + itemHeight / 2 - centerY, 2)
        );
        if (distanceToCenter < searchBarRadius) continue;

        // Check overlap with other items
        const overlap = results.some((r, i) => {
          if (i >= index) return false;
          return !(
            x + itemWidth + padding < r.x ||
            x > r.x + itemWidth + padding ||
            y + itemHeight + padding < r.y ||
            y > r.y + itemHeight + padding
          );
        });

        if (!overlap || attempts > maxAttempts) break;
      } while (true);

      return { ...result, x, y };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center p-8">
      <div
        ref={containerRef}
        className="w-full max-w-[1200px] h-[800px] relative"
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-md">
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 text-lg rounded-lg shadow-lg focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <AnimatePresence>
          {filteredResults.map((result) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: result.x,
                y: result.y,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="absolute cursor-pointer"
              onClick={() => handleResultClick(result.name)}
              style={{
                width: itemWidth,
                height: itemHeight,
              }}
            >
              <div className="bg-white rounded-lg shadow-sm p-2 flex items-center space-x-3 hover:shadow-md transition-shadow">
                <span className="text-sm font-medium text-gray-700">
                  {result.name}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
