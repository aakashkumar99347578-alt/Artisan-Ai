import fs from 'fs';

// 1. Update visionPrompt in server.ts
let serverCode = fs.readFileSync('Artisan-Ai/server.ts', 'utf8');

const oldVisionCat = `CRITICAL DISCIPLINE-FIRST CATEGORIZATION (DO NOT DEFAULT TO "Home Décor & Accents"):
Every artisan product belongs to its true craftsmanship discipline:
1. "Folk Art & Paintings": For any paintings, canvas art, scrolls, folk art (Madhubani, Warli, Pattachitra, Gond, Pichwai, Tanjore). NEVER classify a painting as Home Décor!
2. "Textiles & Handloom": For sarees, dupattas, shawls, stoles, fabrics, handloom weaves (Banarasi, Chanderi, Katan silk, Khadi). NEVER classify clothing/fabrics as Home Décor!
3. "Metalcraft & Dhokra": For brass, bronze, bell metal, copper, oil diyas, lamps, bells, idols, statues, figurines, Moradabad brassware, Dhokra lost-wax casting.
4. "Pottery & Ceramics": For clay kulhads, terracotta pots, earthenware vessels, studio pottery, Jaipuri blue pottery.
5. "Woodcraft & Lacquer": For carved sheesham, jali boxes, wooden lacquer, teak, walnut carvings.
6. "Handcrafted Jewellery": For Kundan, Meenakari, choker necklaces, jhumkas, bangles, silver jewelry.
7. "Home Décor & Accents": ONLY for items that are strictly home accents/furnishings (e.g. mirrors, clocks, artisanal cushion covers, rugs, planters).
8. "Festive & Corporate Gifts": For festive hampers and corporate celebration gift boxes.`;

const newVisionCat = `CRITICAL DISCIPLINE-FIRST CATEGORIZATION (MATCH EXACT TAXONOMY):
Identify the EXACT craftsmanship category for this artisan product:
1. "Clothing & Apparel": For all clothes and wearable handlooms - Sarees, Kurtas, Kurtis, Shirts, Dupattas, Shawls, Lehengas, Stoles, Dhotis, Gamchas, Fabrics ("clothes wala clothes me").
2. "Paintings & Artworks": For all paintings and canvases - Madhubani, Warli, Pattachitra, Pichwai, Gond, Tanjore, Miniatures, Murals, Canvas Artworks, Sketches ("painting wala painting me").
3. "Home Décor & Utility": Artistic Candles, Candle Sticks, Ethnic Clocks, Wall Clocks, Metal Wares, Mirrors, Paper Mache, Stone Wares, Tapestries & Wall Hangings, Vases, Torans, Wooden Handicrafts, Walking Sticks, Decorative items, Partitions.
4. "Kitchen & Dining": Place Mats, Dish Cloths, Table Napkins, Kitchen Utilities, Table Mats, Copper Bottles, Water Bottles, Cookware, Platters, Drinkware.
5. "Home Furnishings": Bedsheets, Blankets, Throws & Quilts, Pillow Covers, Table Runners, Comforters & Sets, Cushion Covers, Bedspreads, Curtains, Drapes.
6. "Floor Coverings": Carpets, Rugs, Durries & Doormats, Floor Mats.
7. "Handcrafted Jewellery": Kundan, Meenakari, Choker Necklaces, Jhumkas, Earrings, Bangles, Bracelets, Pendants, Silver/Tribal Ornaments.
8. "Lighting & Lamps": Floor Lamps, Lamp Shades, Pendant Lights, Table Lamps, Tea Light Candle Holders, Wall Lamps & Sconces, Chandeliers, Lanterns.
9. "Religious Items & Pooja": Pooja Kalash, Pooja Utility, Tulsi Kanthi Mala, Idols of God, Murtis, Religious Gifts, Tulsi Japa Mala, Brass Diyas, Deepams, Incense.
10. "Musical Instruments": Flute, Tabla, Pungi/Been, Sitar, Tanpura, Dholak, Shehnai, Harmonium.
11. "Accessories & Bags": Travel Bags, Bottle Bags, Keychains, Hand Fans, Tote Bags, Purses, Wallets.
12. "Stationery & Craft": Diaries, Personal Organisers, Calendars, Bookmarks, Pencils, File Folders, Envelopes, Pen Stands, Craft Accessories.
13. "Pottery & Ceramics": Clay Kulhads, Terracotta Pots, Earthenware Vessels, Studio Pottery, Jaipuri Blue Pottery.
14. "Woodcraft & Carving": Carved Sheesham, Jali Boxes, Wooden Lacquer, Teak, Walnut Woodcarvings.
15. "Bath & Wellness": Towels, Gamchas, Yoga Mats, Meditation Items, Natural Wellness.
16. "Sports & Fitness": Skipping Ropes, Bow & Arrow, Massagers, Traditional Wooden Games.`;

serverCode = serverCode.replace(oldVisionCat, newVisionCat);
serverCode = serverCode.replace(
  '"category": "Strictly ONE of the 8 canonical categories listed above"',
  '"category": "Strictly ONE of the 16 canonical categories listed above"'
);

// Update buildArtisanProductFromClues in server.ts
serverCode = serverCode.replace(
  'category = "Textiles & Handloom";',
  'category = "Clothing & Apparel";'
);
serverCode = serverCode.replace(
  'category = "Folk Art & Paintings";',
  'category = "Paintings & Artworks";'
);
serverCode = serverCode.replace(
  'category = "Metalcraft & Dhokra";\n    subcategory = textClues.includes("dhokra") ? "Dhokra Lost-Wax Casting" : "Hand-Cast Brass Specialty Craft";',
  'category = textClues.includes("diya") || textClues.includes("lamp") || textClues.includes("idol") ? "Religious Items & Pooja" : "Home Décor & Utility";\n    subcategory = textClues.includes("dhokra") ? "Dhokra Lost-Wax Casting" : "Hand-Cast Brass Specialty Craft";'
);
serverCode = serverCode.replace(
  'category = "Woodcraft & Lacquer";',
  'category = "Woodcraft & Carving";'
);

fs.writeFileSync('Artisan-Ai/server.ts', serverCode, 'utf8');
console.log('SUCCESS: server.ts visionPrompt & buildArtisanProductFromClues updated');

// 2. Update seedData.ts INITIAL_CATEGORIES
let seedCode = fs.readFileSync('Artisan-Ai/src/data/seedData.ts', 'utf8');

const updatedCategoriesArray = `export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_clothing',
    name: 'Clothing & Apparel',
    slug: 'clothing-apparel',
    icon_name: 'Layers',
    description: 'Handloom Banarasi, Chanderi, Katan silk sarees, kurtas, dupattas, shawls, and handwoven ethnic wear.',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    craft_count: 95,
  },
  {
    id: 'cat_paintings',
    name: 'Paintings & Artworks',
    slug: 'paintings-artworks',
    icon_name: 'Palette',
    description: 'Mural Pattachitra, Madhubani, Warli, Pichwai, and Gond art painted with natural organic pigments.',
    image_url: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=600&q=80',
    craft_count: 58,
  },
  {
    id: 'cat_home_decor',
    name: 'Home Décor & Utility',
    slug: 'home-decor-utility',
    icon_name: 'Home',
    description: 'Artistic candles, ethnic clocks, metal wares, mirrors, paper mache, stone wares, and wooden handicrafts.',
    image_url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80',
    craft_count: 82,
  },
  {
    id: 'cat_kitchen',
    name: 'Kitchen & Dining',
    slug: 'kitchen-dining',
    icon_name: 'Utensils',
    description: 'Handcrafted place mats, copper bottles, table napkins, brass kitchen utilities, and ethnic drinkware.',
    image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80',
    craft_count: 46,
  },
  {
    id: 'cat_furnishings',
    name: 'Home Furnishings',
    slug: 'home-furnishings',
    icon_name: 'Bed',
    description: 'Hand-block printed bedsheets, quilts, comforters, cushion covers, table runners, and curtains.',
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
    craft_count: 52,
  },
  {
    id: 'cat_floor',
    name: 'Floor Coverings',
    slug: 'floor-coverings',
    icon_name: 'Maximize2',
    description: 'Hand-knotted carpets, wool rugs, jute and cotton durries, and natural woven doormats.',
    image_url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80',
    craft_count: 38,
  },
  {
    id: 'cat_jewellery',
    name: 'Handcrafted Jewellery',
    slug: 'jewellery',
    icon_name: 'Gem',
    description: 'Kundan Meenakari, Dokra tribal pendants, terracotta earrings, chokers, and silver filigree adornments.',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    craft_count: 64,
  },
  {
    id: 'cat_lighting',
    name: 'Lighting & Lamps',
    slug: 'lighting',
    icon_name: 'Lamp',
    description: 'Handcrafted floor lamps, pendant lights, hand-perforated brass table lamps, and tea light candle holders.',
    image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
    craft_count: 34,
  },
  {
    id: 'cat_religious',
    name: 'Religious Items & Pooja',
    slug: 'religious-items',
    icon_name: 'Sparkles',
    description: 'Pooja kalash, brass diyas, tulsi kanthi mala, idols of god, japa mala, and sacred artisan gifts.',
    image_url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80',
    craft_count: 48,
  },
  {
    id: 'cat_musical',
    name: 'Musical Instruments',
    slug: 'musical-instruments',
    icon_name: 'Music',
    description: 'Handmade bamboo flutes, classical tabla sets, sitars, dholaks, and indigenous tanpuras.',
    image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80',
    craft_count: 22,
  },
  {
    id: 'cat_accessories',
    name: 'Accessories & Bags',
    slug: 'accessories',
    icon_name: 'ShoppingBag',
    description: 'Artisan travel bags, embroidered bottle bags, handmade fans, and ethnic brass keychains.',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    craft_count: 41,
  },
  {
    id: 'cat_stationery',
    name: 'Stationery & Craft',
    slug: 'stationery',
    icon_name: 'BookOpen',
    description: 'Handmade cotton rag paper diaries, organisers, carved bookmarks, and wooden pen stands.',
    image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
    craft_count: 31,
  },
  {
    id: 'cat_pottery',
    name: 'Pottery & Ceramics',
    slug: 'pottery-ceramics',
    icon_name: 'Sparkles',
    description: 'Wheel-thrown terracotta, glazed studio ceramics, and authentic Jaipuri blue pottery.',
    image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    craft_count: 42,
  },
  {
    id: 'cat_woodcraft',
    name: 'Woodcraft & Carving',
    slug: 'woodcraft',
    icon_name: 'TreePine',
    description: 'Saharanpur carved sheesham, Channapatna natural lacquerware, and Kashmiri walnut woodwork.',
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    craft_count: 36,
  },
  {
    id: 'cat_bath_wellness',
    name: 'Bath & Wellness',
    slug: 'bath-wellness',
    icon_name: 'Heart',
    description: 'Pure cotton towels, handwoven gamchas, organic yoga mats, and herbal wellness accessories.',
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    craft_count: 27,
  },
  {
    id: 'cat_sports',
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    icon_name: 'Activity',
    description: 'Handmade skipping ropes, traditional bow & arrow sets, wooden massagers, and indigenous games.',
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    craft_count: 19,
  },
];`;

const seedStart = seedCode.indexOf('export const INITIAL_CATEGORIES: Category[] = [');
const seedEndMarker = 'export const INITIAL_ARTISANS: Artisan[] = [';
const seedEnd = seedCode.indexOf(seedEndMarker);

if (seedStart !== -1 && seedEnd !== -1) {
  seedCode = seedCode.slice(0, seedStart) + updatedCategoriesArray + '\n\n' + seedCode.slice(seedEnd);
  fs.writeFileSync('Artisan-Ai/src/data/seedData.ts', seedCode, 'utf8');
  console.log('SUCCESS: seedData.ts INITIAL_CATEGORIES updated');
} else {
  console.error('Could not find seedData indices');
}

