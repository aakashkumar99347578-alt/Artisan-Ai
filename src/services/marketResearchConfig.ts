/**
 * Market Research & Demand Predictor Configuration
 * Centralized weight configuration for demand score, match ranking, and price recommendation.
 * Keeping weights in one module prevents scattering throughout the codebase.
 */

export interface DemandModelWeights {
  marketVisibility: number;       // 20%
  competitivePrice: number;       // 20%
  reviewRatingSignal: number;     // 15%
  searchDemandSignal: number;     // 15%
  competition: number;            // 15%
  productDifferentiation: number; // 10%
  seasonality: number;            // 5%
}

export const DEFAULT_DEMAND_WEIGHTS: DemandModelWeights = {
  marketVisibility: 0.20,
  competitivePrice: 0.20,
  reviewRatingSignal: 0.15,
  searchDemandSignal: 0.15,
  competition: 0.15,
  productDifferentiation: 0.10,
  seasonality: 0.05,
};

export interface RankingWeights {
  visualSimilarity: number;  // 30%
  titleMatch: number;        // 25%
  craftMaterialMatch: number;// 15%
  categoryMatch: number;     // 10%
  rating: number;            // 10%
  reviewCount: number;       // 5%
  priceRelevance: number;    // 5%
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  visualSimilarity: 0.30,
  titleMatch: 0.25,
  craftMaterialMatch: 0.15,
  categoryMatch: 0.10,
  rating: 0.10,
  reviewCount: 0.05,
  priceRelevance: 0.05,
};

export const SERPAPI_SEARCH_LIMITS = {
  maxLensMatches: 8,
  maxShoppingResults: 12,
  maxGoogleResults: 8,
  maxTopCompetitors: 8,
  maxQueriesPerAnalysis: 4,
};
