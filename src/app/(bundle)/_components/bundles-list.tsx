"use client";

import { BundlePreviewCard } from "./bundle-preview-card";
import { TargetInputs } from "./target-inputs";
import Link from "next/link";
import { useState } from "react";
import { Bundle } from "@prisma/client";

interface BundlesListProps {
  userBundles: (Bundle & {
    creator: {
      username: string;
      image: string | null;
    };
  })[];
  communityBundles: (Bundle & {
    creator: {
      username: string;
      image: string | null;
    };
  })[];
  hasUserBundles: boolean;
  hasCommunityBundles: boolean;
}

export function BundlesList({
  userBundles,
  communityBundles,
  hasUserBundles,
  hasCommunityBundles,
}: BundlesListProps) {
  const [targetMonthly, setTargetMonthly] = useState(75);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <TargetInputs onChange={setTargetMonthly} />

      {hasUserBundles && (
        <div>
          <h2 className="text-2xl font-bold mb-4">My bundles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userBundles.map((bundle) => (
              <BundlePreviewCard
                key={bundle.id}
                bundle={bundle}
                targetMonthly={targetMonthly}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Community bundles</h2>
          <p className="text-sm text-muted-foreground">
            generated by community in{" "}
            <Link
              href="/create-bundle"
              className="text-primary hover:underline"
            >
              bundle creator
            </Link>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!hasCommunityBundles ? (
            <p className="col-span-full text-center text-muted-foreground">
              No community bundles yet. Be the first to create one!
            </p>
          ) : (
            communityBundles.map((bundle) => (
              <BundlePreviewCard
                key={bundle.id}
                bundle={bundle}
                targetMonthly={targetMonthly}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
