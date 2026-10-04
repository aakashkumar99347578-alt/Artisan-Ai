import { DEFAULT_DEMAND_WEIGHTS, DemandModelWeights } from "./marketResearchConfig.js";

export interface NormalizedMarketProduct {
  source: string;
  title: string;
  url: string;
  price: number | null;
  currency: string;
  rating: number | null;
  reviews: number | null;
  position: number;
  thumbnail: string | null;
  match_type: "visual" | "shopping" | "organic";
  availability: string | null;
  query: string;
  match_score?: number;
}

export interface DemandPredictionResult {
  score: number;
  level: "Low" | "Medium" | "High" | "Very High";
  trend: "Increasing" | "Stable" | "Decreasing";
  confidence: number;
  competitionLevel: "Low" | "Medium" | "High";
  explanation: string;
  subScores: {
    marketVisibility: number;
    competitivePrice: number;
    reviewRatingSignal: number;
    searchDemandSignal: number;
    competition: number;
    productDifferentiation: number;
    seasonality: number;
  };
}

export function predictDemand(
  products: NormalizedMarketProduct[],
  productContext: {
    category?: string;
    craft?: string;
    estimatedPrice?: number | null;
  },
  weights: DemandModelWeights = DEFAULT_DEMAND_WEIGHTS
): DemandPredictionResult {
  const count = products.length;

  // 1. Market visibility (0-100): based on number and diversity of verified listings
  const uniqueSources = new Set(products.map((p) => p.source.toLowerCase())).size;
  const marketVisibility = Math.min(100, Math.round(count * 8 + uniqueSources * 6));

  // 2. Review and Rating signal (0-100)
  const productsWithRatings = products.filter((p) => typeof p.rating === "number" && p.rating > 0);
  const avgRating = productsWithRatings.length > 0
    ? productsWithRatings.reduce((sum, p) => sum + (p.rating || 0), 0) / productsWithRatings.length
    : 4.2;
  const productsWithReviews = products.filter((p) => typeof p.reviews === "number" && p.reviews > 0);
  const totalReviews = productsWithReviews.reduce((sum, p) => sum + (p.reviews || 0), 0);
  const reviewScore = Math.min(100, Math.round((avgRating / 5) * 50 + Math.min(50, totalReviews / 10)));

  // 3. Price competitiveness (0-100)
  const validPrices = products
    .map((p) => p.price)
    .filter((p): p is number => typeof p === "number" && p > 50 && p < 100000);
  let competitivePriceScore = 75;
  if (validPrices.length > 0 && productContext.estimatedPrice) {
    const sorted = [...validPrices].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const ratio = productContext.estimatedPrice / median;
    if (ratio >= 0.7 && ratio <= 1.25) {
      competitivePriceScore = 90;
    } else if (ratio < 0.7) {
      competitivePriceScore = 85; // highly competitive price
    } else if (ratio <= 1.5) {
      competitivePriceScore = 70; // premium artisan positioning
    } else {
      competitivePriceScore = 55;
    }
  }

  // 4. Search Demand Signal (0-100)
  const searchDemandSignal = Math.min(100, Math.max(45, Math.round(count * 7 + (productsWithReviews.length > 2 ? 25 : 10))));

  // 5. Competition Level & Score (0-100 where higher means better opportunity)
  let competitionLevel: "Low" | "Medium" | "High" = "Medium";
  let competitionOpportunity = 70;
  if (count > 15 && totalReviews > 500) {
    competitionLevel = "High";
    competitionOpportunity = 50;
  } else if (count < 5) {
    competitionLevel = "Low";
    competitionOpportunity = 85;
  } else {
    competitionLevel = "Medium";
    competitionOpportunity = 72;
  }

  // 6. Product differentiation (handcrafted, artisan, authentic craft)
  const craftOrCategory = `${productContext.craft || ""} ${productContext.category || ""}`.toLowerCase();
  let productDifferentiation = 80;
  if (craftOrCategory.includes("madhubani") || craftOrCategory.includes("dhokra") || craftOrCategory.includes("silk") || craftOrCategory.includes("chanderi") || craftOrCategory.includes("pattachitra")) {
    productDifferentiation = 92;
  }

  // 7. Seasonality (festive, wedding, home decor surge)
  let seasonality = 85;
  if (craftOrCategory.includes("diya") || craftOrCategory.includes("lamp") || craftOrCategory.includes("puja") || craftOrCategory.includes("festive")) {
    seasonality = 95;
  }

  // Calculate weighted score
  const finalScore = Math.min(
    98,
    Math.max(
      35,
      Math.round(
        marketVisibility * weights.marketVisibility +
        competitivePriceScore * weights.competitivePrice +
        reviewScore * weights.reviewRatingSignal +
        searchDemandSignal * weights.searchDemandSignal +
        competitionOpportunity * weights.competition +
        productDifferentiation * weights.productDifferentiation +
        seasonality * weights.seasonality
      )
    )
  );

  let level: "Low" | "Medium" | "High" | "Very High" = "Medium";
  if (finalScore >= 82) level = "Very High";
  else if (finalScore >= 70) level = "High";
  else if (finalScore >= 50) level = "Medium";
  else level = "Low";

  const trend: "Increasing" | "Stable" | "Decreasing" = finalScore >= 68 ? "Increasing" : "Stable";
  const confidence = Math.min(92, Math.max(60, Math.round(50 + count * 4 + (validPrices.length > 2 ? 15 : 5))));

  return {
    score: finalScore,
    level,
    trend,
    confidence,
    competitionLevel,
    explanation: `Observed ${count} active market listings across ${uniqueSources} verified channels with healthy buyer search signals and steady demand.`,
    subScores: {
      marketVisibility,
      competitivePrice: competitivePriceScore,
      reviewRatingSignal: reviewScore,
      searchDemandSignal,
      competition: competitionOpportunity,
      productDifferentiation,
      seasonality,
    },
  };
}
