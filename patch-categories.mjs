import fs from 'fs';

let serverCode = fs.readFileSync('Artisan-Ai/server.ts', 'utf8');

// 1. Update KALASETU_CATEGORIES list
const oldCategoriesDef = `export const KALASETU_CATEGORIES = [
  { id: "cat_paintings", name: "Folk Art & Paintings", slug: "folk-art" },
  { id: "cat_pottery", name: "Pottery & Ceramics", slug: "pottery" },
  { id: "cat_textiles", name: "Textiles & Handloom", slug: "textiles" },
  { id: "cat_metalcraft", name: "Metalcraft & Dhokra", slug: "metalcraft" },
  { id: "cat_woodcraft", name: "Woodcraft & Lacquer", slug: "woodcraft" },
  { id: "cat_jewellery", name: "Handcrafted Jewellery", slug: "jewellery" },
  { id: "cat_home_decor", name: "Home Décor & Accents", slug: "home-decor" },
  { id: "cat_festive", name: "Festive & Corporate Gifts", slug: "festive-gifts" },
] as const;`;

const newCategoriesDef = `export const KALASETU_CATEGORIES = [
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

// 2. Comprehensive normalization matching the user's screenshot taxonomy + explicit rules
const oldNormalizeFunction = `export function normalizeKalaSetuCategory(raw?: string, clues?: string): { id: string; name: string; slug: string } {`;

const newNormalizeFull = `export function normalizeKalaSetuCategory(raw?: string, clues?: string): { id: string; name: string; slug: string } {
  const text = \`\${raw || ""} \${clues || ""}\`.toLowerCase();

  // 1. CLOTHING & APPAREL ("clothes wala clothes me")
  if (
    text.includes("saree") ||
    text.includes("sari") ||
    text.includes("kurta") ||
    text.includes("kurti") ||
    text.includes("shirt") ||
    text.includes("dupatta") ||
    text.includes("shawl") ||
    text.includes("stole") ||
    text.includes("cloth") ||
    text.includes("clothes") ||
    text.includes("clothing") ||
    text.includes("apparel") ||
    text.includes("garment") ||
    text.includes("lehenga") ||
    text.includes("dhoti") ||
    text.includes("lungi") ||
    text.includes("chanderi") ||
    text.includes("banarasi") ||
    text.includes("katan") ||
    text.includes("tussar") ||
    text.includes("organza") ||
    text.includes("khadi") ||
    text.includes("ajrakh") ||
    text.includes("ikat") ||
    text.includes("bandhani") ||
    text.includes("chikankari") ||
    text.includes("kantha") ||
    text.includes("phulkari") ||
    text.includes("handloom weave") ||
    text.includes("wearable")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_clothing")!;
  }

  // 2. PAINTINGS & ARTWORKS ("painting wala painting me")
  if (
    text.includes("paint") ||
    text.includes("canvas") ||
    text.includes("madhubani") ||
    text.includes("mithila") ||
    text.includes("warli") ||
    text.includes("pattachitra") ||
    text.includes("pichwai") ||
    text.includes("gond") ||
    text.includes("tanjore") ||
    text.includes("phad") ||
    text.includes("kalamkari art") ||
    text.includes("folk art") ||
    text.includes("miniature painting") ||
    text.includes("mural") ||
    text.includes("artwork") ||
    text.includes("artworks") ||
    text.includes("illustration") ||
    text.includes("sketch") ||
    text.includes("drawing")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_paintings")!;
  }

  // 3. RELIGIOUS ITEMS & POOJA (screenshot: Religious Item)
  if (
    text.includes("pooja") ||
    text.includes("puja") ||
    text.includes("mandir") ||
    text.includes("kalash") ||
    text.includes("tulsi kanthi") ||
    text.includes("tulsi japa") ||
    text.includes("kanthi mala") ||
    text.includes("japa mala") ||
    text.includes("idols of god") ||
    text.includes("idol") ||
    text.includes("murti") ||
    text.includes("god statue") ||
    text.includes("religious gift") ||
    text.includes("diya") ||
    text.includes("deepam") ||
    text.includes("vilakku") ||
    text.includes("incense") ||
    text.includes("agarbatti") ||
    text.includes("dhoop") ||
    text.includes("havan")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_religious")!;
  }

  // 4. LIGHTING & LAMPS (screenshot: Lighting)
  if (
    text.includes("lighting") ||
    text.includes("floor lamp") ||
    text.includes("lamp shade") ||
    text.includes("pendant light") ||
    text.includes("table lamp") ||
    text.includes("tea light") ||
    text.includes("candle holder") ||
    text.includes("wall lamp") ||
    text.includes("sconce") ||
    text.includes("chandelier") ||
    text.includes("lantern") ||
    (text.includes("lamp") && !text.includes("clay"))
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_lighting")!;
  }

  // 5. KITCHEN & DINING (screenshot: Kitchen and Dining)
  if (
    text.includes("kitchen") ||
    text.includes("dining") ||
    text.includes("place mat") ||
    text.includes("dish cloth") ||
    text.includes("table napkin") ||
    text.includes("napkin") ||
    text.includes("kitchen utilit") ||
    text.includes("table mat") ||
    text.includes("copper bottle") ||
    text.includes("water bottle") ||
    text.includes("bottle") ||
    text.includes("cookware") ||
    text.includes("brass utensil") ||
    text.includes("culinary") ||
    text.includes("platter")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_kitchen")!;
  }

  // 6. HOME FURNISHINGS (screenshot: Home Furnishings)
  if (
    text.includes("bedsheet") ||
    text.includes("bed cover") ||
    text.includes("blanket") ||
    text.includes("throw") ||
    text.includes("quilt") ||
    text.includes("pillow cover") ||
    text.includes("pillow") ||
    text.includes("table runner") ||
    text.includes("comforter") ||
    text.includes("cushion cover") ||
    text.includes("cushion") ||
    text.includes("bedspread") ||
    text.includes("curtain") ||
    text.includes("curtains") ||
    text.includes("drapes")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_furnishings")!;
  }

  // 7. FLOOR COVERINGS (screenshot: Floor Coverings)
  if (
    text.includes("carpet") ||
    text.includes("rug") ||
    text.includes("rugs") ||
    text.includes("durrie") ||
    text.includes("durries") ||
    text.includes("doormat") ||
    text.includes("floor mat")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_floor")!;
  }

  // 8. MUSICAL INSTRUMENTS (screenshot: Musical Instruments)
  if (
    text.includes("flute") ||
    text.includes("tabla") ||
    text.includes("pungi") ||
    text.includes("been") ||
    text.includes("sitar") ||
    text.includes("tanpura") ||
    text.includes("dholak") ||
    text.includes("musical instrument") ||
    text.includes("shehnai") ||
    text.includes("harmonium") ||
    text.includes("veena")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_musical")!;
  }

  // 9. ACCESSORIES & BAGS (screenshot: Accessories)
  if (
    text.includes("travel bag") ||
    text.includes("bottle bag") ||
    text.includes("hand fan") ||
    text.includes("keychain") ||
    text.includes("tote bag") ||
    text.includes("purse") ||
    text.includes("wallet") ||
    text.includes("clutch") ||
    (text.includes("bag") && !text.includes("tea"))
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_accessories")!;
  }

  // 10. STATIONERY & CRAFT (screenshot: Stationery)
  if (
    text.includes("diar") ||
    text.includes("notebook") ||
    text.includes("personal organiser") ||
    text.includes("calendar") ||
    text.includes("bookmark") ||
    text.includes("pencil") ||
    text.includes("file folder") ||
    text.includes("envelop") ||
    text.includes("pen stand") ||
    text.includes("stationery") ||
    text.includes("craft accessor")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_stationery")!;
  }

  // 11. BATH & WELLNESS (screenshot: Bath & Wellness)
  if (
    text.includes("towel") ||
    text.includes("gamcha") ||
    text.includes("bath") ||
    text.includes("wellness") ||
    text.includes("meditation") ||
    text.includes("ayur")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_bath_wellness")!;
  }

  // 12. SPORTS & FITNESS (screenshot: Sports & Fitness)
  if (
    text.includes("skipping rope") ||
    text.includes("bow & arrow") ||
    text.includes("bow and arrow") ||
    text.includes("massager") ||
    text.includes("traditional game") ||
    text.includes("puzzle") ||
    (text.includes("game") && !text.includes("video"))
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_sports")!;
  }

  // 13. HANDCRAFTED JEWELLERY
  if (
    text.includes("jewel") ||
    text.includes("jhumka") ||
    text.includes("earring") ||
    text.includes("necklace") ||
    text.includes("choker") ||
    text.includes("bangle") ||
    text.includes("bracelet") ||
    text.includes("pendant") ||
    text.includes("kundan") ||
    text.includes("meenakari") ||
    text.includes("filigree") ||
    text.includes("anklet")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_jewellery")!;
  }

  // 14. POTTERY & CERAMICS
  if (
    text.includes("potter") ||
    text.includes("ceramic") ||
    text.includes("terracotta") ||
    text.includes("clay") ||
    text.includes("kulhad") ||
    text.includes("matka") ||
    text.includes("blue pottery")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_pottery")!;
  }

  // 15. WOODCRAFT & CARVING
  if (
    text.includes("woodcraft") ||
    text.includes("woodcarv") ||
    text.includes("sheesham") ||
    text.includes("channapatna") ||
    text.includes("walnut wood") ||
    text.includes("jali box") ||
    text.includes("wooden handicraft")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_woodcraft")!;
  }

  // 16. HOME DÉCOR & UTILITY (screenshot: Home Décor and Utility items)
  if (
    text.includes("candle") ||
    text.includes("clock") ||
    text.includes("mirror") ||
    text.includes("tapestry") ||
    text.includes("wall hanging") ||
    text.includes("vase") ||
    text.includes("toran") ||
    text.includes("paper mache") ||
    text.includes("stone ware") ||
    text.includes("walking stick") ||
    text.includes("partition") ||
    text.includes("hanger") ||
    text.includes("decor") ||
    text.includes("metal ware")
  ) {
    return KALASETU_CATEGORIES.find(c => c.id === "cat_home_decor")!;
  }

  return KALASETU_CATEGORIES.find(c => c.id === "cat_home_decor")!;
}`;

// Replace KALASETU_CATEGORIES and normalizeKalaSetuCategory in server.ts
// Find the whole block from "export const KALASETU_CATEGORIES = [" up to end of normalizeKalaSetuCategory function
const startIdx = serverCode.indexOf('export const KALASETU_CATEGORIES = [');
const endFuncMarker = '// Helper to construct complete downstream packages (Catalog, SEO, Pricing & Demand)';
const endIdx = serverCode.indexOf(endFuncMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `${newCategoriesDef}\n\n${newNormalizeFull}\n\n`;
  serverCode = serverCode.slice(0, startIdx) + replacement + serverCode.slice(endIdx);
  fs.writeFileSync('Artisan-Ai/server.ts', serverCode, 'utf8');
  console.log('SUCCESS: server.ts categories and normalizeKalaSetuCategory updated!');
} else {
  console.error('Could not find start/end indices in server.ts');
  process.exit(1);
}

