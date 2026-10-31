import fs from 'fs';

// 1. Update server.ts
let serverCode = fs.readFileSync('Artisan-Ai/server.ts', 'utf8');

// Update KALASETU_CATEGORIES in server.ts
const oldCatList = `export const KALASETU_CATEGORIES = [
  { id: "cat_clothing", name: "Clothing & Apparel", slug: "clothing-apparel" },
  { id: "cat_paintings", name: "Paintings & Artworks", slug: "paintings-artworks" },
  { id: "cat_home_decor", name: "Home Décor & Utility", slug: "home-decor-utility" },
  { id: "cat_kitchen", name: "Kitchen & Dining", slug: "kitchen-dining" },
  { id: "cat_furnishings", name: "Home Furnishings", slug: "home-furnishings" },
  { id: "cat_floor", name: "Floor Coverings", slug: "floor-coverings" },
  { id: "cat_jewellery", name: "Handcrafted Jewellery", slug: "jewellery" },
  { id: "cat_lighting", name: "Lighting & Lamps", slug: "lighting" },
  { id: "cat_religious", name: "Religious Items & Pooja", slug: "religious-items" },
  { id: "cat_musical", name: "Musical Instruments", slug: "musical-instruments" },
  { id: "cat_accessories", name: "Accessories & Bags", slug: "accessories" },
  { id: "cat_stationery", name: "Stationery & Craft", slug: "stationery" },
  { id: "cat_pottery", name: "Pottery & Ceramics", slug: "pottery-ceramics" },
  { id: "cat_woodcraft", name: "Woodcraft & Carving", slug: "woodcraft" },
  { id: "cat_bath_wellness", name: "Bath & Wellness", slug: "bath-wellness" },
  { id: "cat_sports", name: "Sports & Fitness", slug: "sports-fitness" },
] as const;`;

const newCatList = `export const KALASETU_CATEGORIES = [
  { id: "cat_footwear", name: "Footwear & Leathercraft", slug: "footwear-leathercraft" },
  { id: "cat_clothing", name: "Clothing & Apparel", slug: "clothing-apparel" },
  { id: "cat_paintings", name: "Paintings & Artworks", slug: "paintings-artworks" },
  { id: "cat_home_decor", name: "Home Décor & Utility", slug: "home-decor-utility" },
  { id: "cat_kitchen", name: "Kitchen & Dining", slug: "kitchen-dining" },
  { id: "cat_furnishings", name: "Home Furnishings", slug: "home-furnishings" },
  { id: "cat_floor", name: "Floor Coverings", slug: "floor-coverings" },
  { id: "cat_jewellery", name: "Handcrafted Jewellery", slug: "jewellery" },
  { id: "cat_lighting", name: "Lighting & Lamps", slug: "lighting" },
  { id: "cat_religious", name: "Religious Items & Pooja", slug: "religious-items" },
  { id: "cat_musical", name: "Musical Instruments", slug: "musical-instruments" },
  { id: "cat_accessories", name: "Accessories & Bags", slug: "accessories" },
  { id: "cat_stationery", name: "Stationery & Craft", slug: "stationery" },
  { id: "cat_pottery", name: "Pottery & Ceramics", slug: "pottery-ceramics" },
  { id: "cat_woodcraft", name: "Woodcraft & Carving", slug: "woodcraft" },
  { id: "cat_bath_wellness", name: "Bath & Wellness", slug: "bath-wellness" },
  { id: "cat_sports", name: "Sports & Fitness", slug: "sports-fitness" },
] as const;`;

serverCode = serverCode.replace(oldCatList, newCatList);

// Add Footwear check at the very top of normalizeKalaSetuCategory
const oldNormalizeTop = `export function normalizeKalaSetuCategory(raw?: string, clues?: string): { id: string; name: string; slug: string } {
  const text = \`\${raw || ""} \${clues || ""}\`.toLowerCase();

  // 1. CLOTHING & APPAREL ("clothes wala clothes me")`;

const newNormalizeTop = `export function normalizeKalaSetuCategory(raw?: string, clues?: string): { id: string; name: string; slug: string } {
  const text = \`\${raw || ""} \${clues || ""}\`.toLowerCase();

  // 0. FOOTWEAR & LEATHERCRAFT (Sandals, Kolhapuri, Juttis, Mojaris, Shoes, Leather Slippers)
  if (
    text.includes("sandal") ||
    text.includes("chappal") ||
    text.includes("kolhapuri") ||
    text.includes("mojari") ||
    text.includes("jutti") ||
    text.includes("shoe") ||
    text.includes("footwear") ||
    text.includes("slipper") ||
    text.includes("slip-on") ||
    text.includes("mule") ||
    text.includes("boot") ||
    text.includes("toe ring sandal") ||
    text.includes("shantiniketan leather") ||
    (text.includes("leather") && (text.includes("sole") || text.includes("strap") || text.includes("buckle") || text.includes("wear")))
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_footwear")!;
  }

  // 1. CLOTHING & APPAREL ("clothes wala clothes me")`;

serverCode = serverCode.replace(oldNormalizeTop, newNormalizeTop);

// Update visionPrompt in server.ts to explicitly include Footwear & Leathercraft
const oldVisionPromptCat = `CRITICAL DISCIPLINE-FIRST CATEGORIZATION (MATCH EXACT TAXONOMY):
Identify the EXACT craftsmanship category for this artisan product:
1. "Clothing & Apparel": For all clothes and wearable handlooms - Sarees, Kurtas, Kurtis, Shirts, Dupattas, Shawls, Lehengas, Stoles, Dhotis, Gamchas, Fabrics ("clothes wala clothes me").`;

const newVisionPromptCat = `CRITICAL DISCIPLINE-FIRST CATEGORIZATION (MATCH EXACT TAXONOMY):
Identify the EXACT craftsmanship category for this artisan product:
1. "Footwear & Leathercraft": For all footwear, sandals, Kolhapuri chappals, mojaris, juttis, slippers, shoes, hand-stitched leathercraft. NEVER classify footwear or sandals as Home Décor!
2. "Clothing & Apparel": For all clothes and wearable handlooms - Sarees, Kurtas, Kurtis, Shirts, Dupattas, Shawls, Lehengas, Stoles, Dhotis, Gamchas, Fabrics ("clothes wala clothes me").`;

serverCode = serverCode.replace(oldVisionPromptCat, newVisionPromptCat);
serverCode = serverCode.replace(
  '"category": "Strictly ONE of the 16 canonical categories listed above"',
  '"category": "Strictly ONE of the 17 canonical categories listed above"'
);

// Update pricing baseline in server.ts
const oldPricingCheck = `  } else if (cat.includes("jewel") || cat.includes("silver") || cat.includes("kundan") || cat.includes("bead")) {
    baseRetail = 1750;
    baseB2B = 1150;
    baseBulk = 980;
    laborDays = 3;`;

const newPricingCheck = `  } else if (cat.includes("footwear") || cat.includes("sandal") || cat.includes("chappal") || cat.includes("kolhapuri") || cat.includes("mojari") || cat.includes("jutti")) {
    baseRetail = 1550;
    baseB2B = 1050;
    baseBulk = 890;
    laborDays = 3;
  } else if (cat.includes("jewel") || cat.includes("silver") || cat.includes("kundan") || cat.includes("bead")) {
    baseRetail = 1750;
    baseB2B = 1150;
    baseBulk = 980;
    laborDays = 3;`;

serverCode = serverCode.replace(oldPricingCheck, newPricingCheck);

fs.writeFileSync('Artisan-Ai/server.ts', serverCode, 'utf8');
console.log('SUCCESS: server.ts updated with Footwear & Leathercraft');

// 2. Update seedData.ts
let seedCode = fs.readFileSync('Artisan-Ai/src/data/seedData.ts', 'utf8');
const footwearSeedCategory = `  {
    id: 'cat_footwear',
    name: 'Footwear & Leathercraft',
    slug: 'footwear-leathercraft',
    icon_name: 'Footprints',
    description: 'Genuine leather Kolhapuri sandals, handcrafted mojaris, Jaipuri juttis, and hand-stitched artisan footwear.',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    craft_count: 39,
  },
`;

if (!seedCode.includes('cat_footwear')) {
  seedCode = seedCode.replace(
    'export const INITIAL_CATEGORIES: Category[] = [\n',
    'export const INITIAL_CATEGORIES: Category[] = [\n' + footwearSeedCategory
  );
  fs.writeFileSync('Artisan-Ai/src/data/seedData.ts', seedCode, 'utf8');
  console.log('SUCCESS: seedData.ts updated with Footwear & Leathercraft');
}

// 3. Update AiProductCreationStudio.tsx dropdowns
let studioCode = fs.readFileSync('Artisan-Ai/src/components/AiProductCreationStudio.tsx', 'utf8');
const footwearOption = `<option value="Footwear & Leathercraft">Footwear & Leathercraft (जूते, चप्पल व सैंडल)</option>\n                    `;

if (!studioCode.includes('value="Footwear & Leathercraft"')) {
  studioCode = studioCode.replaceAll(
    '<option value="Clothing & Apparel">',
    footwearOption + '<option value="Clothing & Apparel">'
  );
  fs.writeFileSync('Artisan-Ai/src/components/AiProductCreationStudio.tsx', studioCode, 'utf8');
  console.log('SUCCESS: AiProductCreationStudio.tsx dropdowns updated with Footwear & Leathercraft');
}

// 4. Update aiServices.ts
let aiServicesCode = fs.readFileSync('Artisan-Ai/src/lib/aiServices.ts', 'utf8');
if (!aiServicesCode.includes('Footwear & Leathercraft')) {
  aiServicesCode = aiServicesCode.replace(
    `if (hint.includes('paint')`,
    `if (hint.includes('sandal') || hint.includes('chappal') || hint.includes('kolhapuri') || hint.includes('mojari') || hint.includes('jutti') || hint.includes('shoe') || hint.includes('footwear')) {
      prodTitle = 'Genuine Leather Tan Brown Kolhapuri Sandal with Metal Buckle and Hand-Stitched Sole';
      prodCategory = 'Footwear & Leathercraft';
      prodSubcategory = 'Kolhapuri Sandals & Chappals';
      prodMaterial = 'Vegetable-Tanned Genuine Leather & Brass Buckle';
      prodColor = 'Tan Brown & Antique Brass';
      retailPrice = 1450;
    } else if (hint.includes('paint')`
  );
  fs.writeFileSync('Artisan-Ai/src/lib/aiServices.ts', aiServicesCode, 'utf8');
  console.log('SUCCESS: aiServices.ts updated with Footwear & Leathercraft fallback');
}

