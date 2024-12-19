"use client";

import { Button } from "@/components/ui/button";
import { updateUserPreferences } from "@/actions/user";
import { useState } from "react";

interface CountrySelectorProps {
  selectedCountry: "US" | "TO";
  onSelectCountry: (country: string, updatePreference: boolean) => void;
  defaultCountry?: "US" | "TO";
}

export function CountrySelector({
  selectedCountry,
  onSelectCountry,
  defaultCountry,
}: CountrySelectorProps) {
  const [updatePreference, setUpdatePreference] = useState(false);

  const handleSelect = async (country: "US" | "TO") => {
    onSelectCountry(country, updatePreference);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={selectedCountry === "US" ? "default" : "outline"}
          onClick={() => handleSelect("US")}
        >
          United States
        </Button>
        <Button
          variant={selectedCountry === "TO" ? "default" : "outline"}
          onClick={() => handleSelect("TO")}
        >
          Toronto
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="updatePreference"
          checked={updatePreference}
          onChange={(e) => setUpdatePreference(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="updatePreference" className="text-sm">
          Set as default country in profile preferences
        </label>
      </div>
    </div>
  );
}
