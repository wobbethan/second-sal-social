import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface CountrySelectorProps {
  selectedCountry: "USA" | "Canada";
  onSelectCountry: (country: "USA" | "Canada") => void;
}

export function CountrySelector({
  selectedCountry,
  onSelectCountry,
}: CountrySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card
        className={`cursor-pointer ${
          selectedCountry === "USA" ? "border-green-500" : ""
        }`}
        onClick={() => onSelectCountry("USA")}
      >
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Image
              src="/placeholder.svg?height=40&width=60"
              alt="USA Flag"
              width={60}
              height={40}
              className="mx-auto mb-2"
            />
            <span className="font-medium">USA (NYSE)</span>
          </div>
        </CardContent>
      </Card>
      <Card
        className={`cursor-pointer ${
          selectedCountry === "Canada" ? "border-green-500" : ""
        }`}
        onClick={() => onSelectCountry("Canada")}
      >
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Image
              src="/placeholder.svg?height=40&width=60"
              alt="Canada Flag"
              width={60}
              height={40}
              className="mx-auto mb-2"
            />
            <span className="font-medium">Canada (TSX)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
