import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface CountrySelectorProps {
  selectedCountry: "US" | "CA";
  onSelectCountry: (country: "US" | "CA") => void;
}

export function CountrySelector({
  selectedCountry,
  onSelectCountry,
}: CountrySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card
        className={`cursor-pointer ${
          selectedCountry === "US" ? "border-green-500" : ""
        }`}
        onClick={() => onSelectCountry("US")}
      >
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Image
              src="/placeholder.svg?height=40&width=60"
              alt="US Flag"
              width={60}
              height={40}
              className="mx-auto mb-2"
            />
            <span className="font-medium">US (NYSE)</span>
          </div>
        </CardContent>
      </Card>
      <Card
        className={`cursor-pointer ${
          selectedCountry === "CA" ? "border-green-500" : ""
        }`}
        onClick={() => onSelectCountry("CA")}
      >
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Image
              src="/placeholder.svg?height=40&width=60"
              alt="CA Flag"
              width={60}
              height={40}
              className="mx-auto mb-2"
            />
            <span className="font-medium">CA (TSX)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
