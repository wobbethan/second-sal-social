"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserContext } from "@/context/UserContext";

const exchanges = {
  usa: [
    { id: "nyse", name: "New York Stock Exchange (NYSE)" },
    { id: "nasdaq", name: "NASDAQ" },
    { id: "amex", name: "American Stock Exchange (AMEX)" },
  ],
  CA: [
    { id: "tsx", name: "Toronto Stock Exchange (TSX)" },
    { id: "tsxv", name: "TSX Venture Exchange (TSXV)" },
    { id: "cse", name: "Canadian Securities Exchange (CSE)" },
  ],
};

export default function ApplicationSettingsPage() {
  const clerkUser = useUserContext(); // Get the Clerk user

  return (
    <div className="space-y-6 w-full">
      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Application Settings</CardTitle>
          <CardDescription className="text-gray-500">
            Configure your regional preferences and trading settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Country</Label>
            <RadioGroup
              defaultValue={clerkUser?.country || "usa"}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="usa" id="usa" className="peer sr-only" />
                <Label
                  htmlFor="usa"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600 cursor-pointer"
                >
                  <span>United States</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="CA" id="CA" className="peer sr-only" />
                <Label
                  htmlFor="CA"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600 cursor-pointer"
                >
                  <span>CA</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exchange">Preferred Stock Exchange</Label>
            <Select>
              <SelectTrigger
                id="exchange"
                className="border-gray-200 bg-white text-gray-900"
              >
                <SelectValue
                  placeholder={
                    clerkUser?.preferredExchange || "Select exchange"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {Object.entries(exchanges).map(([country, items]) =>
                  items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="bg-blue-500 hover:bg-blue-600">
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
