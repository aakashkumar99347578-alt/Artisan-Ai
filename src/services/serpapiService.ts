import { SERPAPI_SEARCH_LIMITS, DEFAULT_RANKING_WEIGHTS } from "./marketResearchConfig.js";
import { predictDemand, NormalizedMarketProduct, DemandPredictionResult } from "./demandPredictor.js";

export interface MarketResearchInput {
  product: {
    name?: string;
    product_name?: string;
    category?: string;
    material?: string | string[];
    craft?: string;
    style?: string;
    colors?: string | string[];
    features?: string[];
    keywords?: string[];
    estimated_price?: number;
  };
  imageUrl?: string;
  imageBase64?: string;
  voiceTranscript?: string;
}

export interface PriceAnalysis {
  min: number | null;
  max: number | null;
  average: number | null;
  median: number | null;
  currency: string;
  recommendedPrice: number | null;
  confidence: number;
  reasoning: string;
}

export interface MarketResearchResult {
  status: "success" | "insufficient_data" | "error";
  searchedAt: string;
  queries: string[];
  topProducts: NormalizedMarketProduct[];
  priceAnalysis: PriceAnalysis;
  competition: {
    score: number;
    level: "Low" | "Medium" | "High";
  };
  demand: DemandPredictionResult;
  sources: { name: string; url: string; count: number }[];
  error?: string;
}

export class SerpApiService {
  private customApiKey: string | null = null;

  constructor(customKey?: string) {
    if (customKey) {
      this.customApiKey = customKey.trim().replace(/['"]/g, "");
    }
  }

  public getApiKey(customKey?: string): string | null {
    const key = customKey || this.customApiKey || process.env.SERPAPI_KEY;
    if (key && key.trim() !== "" && !key.includes("your_") && !key.includes("placeholder")) {
      return key.trim().replace(/['"]/g, "");
    }
    return null;
  }

  public isConfigured(customKey?: string): boolean {
    return Boolean(this.getApiKey(customKey));
  }

  /**
   * Google Shopping Search
   */
  public async search_google_shopping(query: string): Promise<NormalizedMarketProduct[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("SERPAPI_NOT_CONFIGURED");
    }

    const params = new URLSearchParams({
      engine: "google_shopping",
      q: query,
      location: "India",
      gl: "in",
      hl: "en",
      api_key: apiKey,
    });

    const res = await fetch(`https://serpapi.com/search?${params.toString()}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (res.status === 401) {
      throw new Error("SERPAPI_AUTH_FAILED");
    }
    if (res.status === 429) {
      throw new Error("SERPAPI_RATE_LIMIT");
    }
    if (!res.ok) {
      throw new Error(`SERPAPI_HTTP_ERROR_${res.status}`);
    }

    const data = await res.json();
    if (data.error) {
      if (data.error.includes("Invalid API key") || data.error.includes("authentication")) {
        throw new Error("SERPAPI_AUTH_FAILED");
      }
      throw new Error(data.error);
    }

    const items: NormalizedMarketProduct[] = [];
    const shoppingResults = data.shopping_results || [];

    for (let i = 0; i < shoppingResults.length && i < SERPAPI_SEARCH_LIMITS.maxShoppingResults; i++) {
      const item = shoppingResults[i];
      let price = typeof item.extracted_price === "number" ? item.extracted_price : null;
      if (price === null && typeof item.price === "string") {
        const cleaned = item.price.replace(/[^0-9.]/g, "");
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed) && parsed > 0) price = parsed;
      }

      items.push({
        source: item.source || "Google Shopping Merchant",
        title: item.title || "Artisan Product",
        url: item.product_link || item.link || "https://google.com/shopping",
        price,
        currency: "INR",
        rating: typeof item.rating === "number" ? item.rating : null,
        reviews: typeof item.reviews === "number" ? item.reviews : null,
        position: item.position || i + 1,
        thumbnail: item.thumbnail || null,
        match_type: "shopping",
        availability: item.in_stock ? "in_stock" : "available",
        query,
      });
    }

    return items;
  }

  /**
   * Google Web Organic & Product Search
   */
  public async search_google(query: string): Promise<NormalizedMarketProduct[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("SERPAPI_NOT_CONFIGURED");
    }

    const params = new URLSearchParams({
      engine: "google",
      q: query,
      location: "India",
      gl: "in",
      hl: "en",
      api_key: apiKey,
    });

    const res = await fetch(`https://serpapi.com/search?${params.toString()}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 401) throw new Error("SERPAPI_AUTH_FAILED");
    if (res.status === 429) throw new Error("SERPAPI_RATE_LIMIT");
    if (!res.ok) throw new Error(`SERPAPI_HTTP_ERROR_${res.status}`);

    const data = await res.json();
    const items: NormalizedMarketProduct[] = [];

    // Organic shopping / commercial snippets
    const organic = data.organic_results || [];
    for (let i = 0; i < organic.length && i < SERPAPI_SEARCH_LIMITS.maxGoogleResults; i++) {
      const r = organic[i];
      let price: number | null = null;
      if (r.rich_snippet?.top?.detected_extensions?.price) {
        price = parseFloat(r.rich_snippet.top.detected_extensions.price) || null;
      }

      let source = "Web";
      try {
        if (r.link) source = new URL(r.link).hostname.replace(/^www\./, "");
      } catch {}

      items.push({
        source,
        title: r.title || "Handmade Product",
        url: r.link || "https://google.com",
        price,
        currency: "INR",
        rating: r.rich_snippet?.top?.detected_extensions?.rating || null,
        reviews: r.rich_snippet?.top?.detected_extensions?.reviews || null,
        position: i + 1,
        thumbnail: r.thumbnail || null,
        match_type: "organic",
        availability: "available",
        query,
      });
    }

    return items;
  }

  /**
   * Google Lens Products Search
   */
  public async search_google_lens(imageUrlOrBase64?: string): Promise<NormalizedMarketProduct[]> {
    const apiKey = this.getApiKey();
    if (!apiKey || !imageUrlOrBase64) return [];

    try {
      // If it's a web URL (http:// or https://)
      if (imageUrlOrBase64.startsWith("http://") || imageUrlOrBase64.startsWith("https://")) {
        const params = new URLSearchParams({
          engine: "google_lens",
          url: imageUrlOrBase64,
          type: "products",
          api_key: apiKey,
        });

        const res = await fetch(`https://serpapi.com/search?${params.toString()}`, {
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return [];

        const data = await res.json();
        const results = data.visual_matches || data.products || [];
        return results.map((v: any, idx: number) => {
          let price = typeof v.price?.extracted_value === "number" ? v.price.extracted_value : null;
          if (price === null && typeof v.price === "string") {
            const parsed = parseFloat(v.price.replace(/[^0-9.]/g, ""));
            if (!isNaN(parsed)) price = parsed;
          }

          return {
            source: v.source || "Google Lens Visual Match",
            title: v.title || "Visually Similar Handcrafted Piece",
            url: v.link || v.product_link || "https://google.com",
            price,
            currency: "INR",
            rating: typeof v.rating === "number" ? v.rating : null,
            reviews: typeof v.reviews === "number" ? v.reviews : null,
            position: idx + 1,
            thumbnail: v.thumbnail || null,
            match_type: "visual" as const,
            availability: "available",
            query: "visual_lens_search",
          };
        });
      }
    } catch (e: any) {
      console.warn("Google Lens query note:", e?.message);
    }

    return [];
  }

  /**
   * Deduplicate by URL and normalized Title + Source
   */
  public deduplicate_results(products: NormalizedMarketProduct[]): NormalizedMarketProduct[] {
    const seenUrls = new Set<string>();
    const seenTitleSource = new Set<string>();
    const deduplicated: NormalizedMarketProduct[] = [];

    for (const p of products) {
      if (!p.url && !p.title) continue;

      // URL normalization (strip tracking parameters)
      let cleanUrl = p.url;
      try {
        const parsed = new URL(p.url);
        cleanUrl = `${parsed.origin}${parsed.pathname}`;
      } catch {}

      const titleKey = `${p.source.toLowerCase()}_${p.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30)}`;

      if (cleanUrl && seenUrls.has(cleanUrl)) continue;
      if (seenTitleSource.has(titleKey)) continue;

      if (cleanUrl) seenUrls.add(cleanUrl);
      seenTitleSource.add(titleKey);
      deduplicated.push(p);
    }

    return deduplicated;
  }

  /**
   * Rank results by relevance to the artisan's specific product
   */
  public rank_results(
    products: NormalizedMarketProduct[],
    product: { name?: string; category?: string; material?: string | string[]; craft?: string }
  ): NormalizedMarketProduct[] {
    const targetTerms = [
      product.name || "",
      product.craft || "",
      product.category || "",
      Array.isArray(product.material) ? product.material.join(" ") : product.material || "",
    ]
      .join(" ")
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    return products
      .map((p) => {
        let score = 50; // base score
        const lowerTitle = p.title.toLowerCase();

        // Title match & keyword density
        let matchCount = 0;
        for (const term of targetTerms) {
          if (lowerTitle.includes(term)) matchCount++;
        }
        score += Math.min(30, matchCount * 10);

        // Visual match bonus
        if (p.match_type === "visual") score += 15;

        // Rating bonus
        if (p.rating && p.rating >= 4.0) score += 10;

        // Has valid price bonus
        if (typeof p.price === "number" && p.price > 0) score += 10;

        return { ...p, match_score: score };
      })
      .sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  }

  /**
   * Calculate market price statistics and recommended artisan price
   */
  public calculate_price_statistics(
    products: NormalizedMarketProduct[],
    artisanEstimatedPrice?: number | null
  ): PriceAnalysis {
    // Filter out missing, near-zero or absurdly high price extremes
    const prices = products
      .map((p) => p.price)
      .filter((p): p is number => typeof p === "number" && p >= 90 && p <= 150000)
      .sort((a, b) => a - b);

    if (prices.length === 0) {
      return {
        min: null,
        max: null,
        average: null,
        median: null,
        currency: "INR",
        recommendedPrice: artisanEstimatedPrice || null,
        confidence: 0.5,
        reasoning: "Live competitor prices were not disclosed in current search results. Retaining artisan cost-plus baseline.",
      };
    }

    const min = prices[0];
    const max = prices[prices.length - 1];
    const sum = prices.reduce((acc, val) => acc + val, 0);
    const average = Math.round(sum / prices.length);
    const median = prices[Math.floor(prices.length / 2)];

    // Pricing formula based on observed market data + artisan differentiation:
    // recommended = median adjusted with artisan premium factor
    let recommended = median;
    if (artisanEstimatedPrice && artisanEstimatedPrice > 0) {
      // Balance artisan fair wage with market sweet spot
      if (artisanEstimatedPrice >= min && artisanEstimatedPrice <= max) {
        recommended = Math.round(artisanEstimatedPrice * 0.4 + median * 0.6);
      } else if (artisanEstimatedPrice < min) {
        // Boost artisan above minimum to ensure fair value
        recommended = Math.max(Math.round(min * 1.05), Math.round(median * 0.85));
      } else {
        // High artisan labor cost - position at upper quartile
        recommended = Math.round(median * 1.15);
      }
    }

    return {
      min,
      max,
      average,
      median,
      currency: "INR",
      recommendedPrice: recommended,
      confidence: Math.min(0.92, 0.6 + prices.length * 0.05),
      reasoning: `Based on ${prices.length} observed competitor listings (range ₹${min} – ₹${max}, median ₹${median}), ensuring artisan fair living margin with market competitive conversion.`,
    };
  }

  /**
   * Master Market Research Pipeline
   */
  public async search_market(input: MarketResearchInput): Promise<MarketResearchResult> {
    const productName = input.product.name || input.product.product_name || "Indian Handicraft";
    const category = input.product.category || "";
    const craft = input.product.craft || "";
    const material = Array.isArray(input.product.material)
      ? input.product.material.join(" ")
      : input.product.material || "";

    const allProducts: NormalizedMarketProduct[] = [];
    const executedQueries: string[] = [];

    // 1. Google Lens Search (if image provided)
    if (input.imageUrl) {
      try {
        const lensProducts = await this.search_google_lens(input.imageUrl);
        allProducts.push(...lensProducts);
        executedQueries.push("Google Lens Visual Search");
      } catch (e: any) {
        console.warn("Lens search notice:", e?.message);
      }
    }

    // 2. Generate 2 to 4 high-value targeted queries calibrated for all Indian craft products
    const candidateQueries: string[] = [];

    // Extract core commercial product terms (stripping verbose prefixes & trailing prepositions)
    const cleanTitle = productName
      .replace(/^(Handmade|Handcrafted|Authentic|Traditional|Original|Exquisite)\s+/i, "")
      .replace(/\s+(on\s+Paper|on\s+Canvas|for\s+Decor|for\s+Gifting)$/i, "")
      .trim();

    // Query A: Clean concise product name (under 5 words for best Google Shopping match)
    const conciseTitle = cleanTitle.split(/\s+/).slice(0, 5).join(" ");
    if (conciseTitle) {
      candidateQueries.push(conciseTitle);
    }

    // Query B: Specific craft / style targeted query
    if (craft && !conciseTitle.toLowerCase().includes(craft.toLowerCase())) {
      candidateQueries.push(`${craft} ${conciseTitle}`.trim());
    } else if (category && !conciseTitle.toLowerCase().includes(category.toLowerCase())) {
      candidateQueries.push(`${conciseTitle} ${category}`.trim());
    }

    // Query C: Craft handmade India shopping query
    const q3 = `${conciseTitle} handmade India`.trim();
    if (q3 && !candidateQueries.includes(q3)) {
      candidateQueries.push(q3);
    }

    // Limit to max configured queries (e.g. 2-3 to protect user's quota)
    const targetQueries = candidateQueries.slice(0, SERPAPI_SEARCH_LIMITS.maxQueriesPerAnalysis);

    for (const q of targetQueries) {
      if (executedQueries.includes(q)) continue;
      executedQueries.push(q);

      try {
        // Search Google Shopping
        const shoppingResults = await this.search_google_shopping(q);
        allProducts.push(...shoppingResults);
      } catch (err: any) {
        if (err.message === "SERPAPI_AUTH_FAILED" || err.message === "SERPAPI_RATE_LIMIT") {
          throw err; // bubble critical errors up immediately
        }
        console.warn(`Shopping search for "${q}" note:`, err.message);
      }

      // If we already found verified merchant products, stop early to ensure instant response (<3s) and protect quota
      if (allProducts.length >= 2) {
        break;
      }

      // If we don't have enough results yet, supplement with general search
      if (allProducts.length === 0) {
        try {
          const webResults = await this.search_google(q);
          allProducts.push(...webResults);
        } catch (err: any) {
          console.warn(`Google organic search for "${q}" note:`, err.message);
        }
      }
    }

    // 3. Normalize & Deduplicate
    const deduplicated = this.deduplicate_results(allProducts);

    // 4. Rank Results
    const ranked = this.rank_results(deduplicated, {
      name: productName,
      category,
      material,
      craft,
    });

    const topProducts = ranked.slice(0, SERPAPI_SEARCH_LIMITS.maxTopCompetitors);

    // 5. Price Statistics
    const priceAnalysis = this.calculate_price_statistics(
      topProducts,
      input.product.estimated_price
    );

    // 6. Demand Prediction
    const demand = predictDemand(topProducts, {
      category,
      craft,
      estimatedPrice: input.product.estimated_price || priceAnalysis.recommendedPrice,
    });

    // 7. Aggregate Verified Sources
    const sourceMap = new Map<string, { count: number; url: string }>();
    for (const p of topProducts) {
      const existing = sourceMap.get(p.source) || { count: 0, url: p.url };
      existing.count++;
      sourceMap.set(p.source, existing);
    }
    const sources = Array.from(sourceMap.entries()).map(([name, data]) => ({
      name,
      url: data.url,
      count: data.count,
    }));

    return {
      status: "success",
      searchedAt: new Date().toISOString(),
      queries: executedQueries,
      topProducts,
      priceAnalysis,
      competition: {
        score: demand.subScores.competition,
        level: demand.competitionLevel,
      },
      demand,
      sources,
    };
  }
}

export const serpapiService = new SerpApiService();
