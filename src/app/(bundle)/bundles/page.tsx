import { getCommunityBundles, getUserBundles } from "@/actions/bundles";
import { BundlesList } from "../_components/bundles-list";

export default async function BundlesPage() {
  try {
    const [communityResult, userResult] = await Promise.all([
      getCommunityBundles(),
      getUserBundles(),
    ]);

    const hasUserBundles =
      userResult.success &&
      Array.isArray(userResult.bundles) &&
      userResult.bundles.length > 0;
    const hasCommunityBundles =
      communityResult.success &&
      Array.isArray(communityResult.bundles) &&
      communityResult.bundles.length > 0;

    return (
      <BundlesList
        userBundles={userResult.success && userResult.bundles ? userResult.bundles : []}
        communityBundles={communityResult.success && communityResult.bundles ? communityResult.bundles : []}
        hasUserBundles={hasUserBundles}
        hasCommunityBundles={hasCommunityBundles}
      />
    );
  } catch (error) {
    console.error("Error fetching bundles:", error);
    // Handle error appropriately, e.g., return an error component or message
    return <div>Error loading bundles.</div>;
  }
}
