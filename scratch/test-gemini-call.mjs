import 'dotenv/config';
import { serpapiService } from '../src/services/serpapiService.js';

async function test() {
  console.log('SerpApi configured:', serpapiService.isConfigured());
  const query = 'Madhubani Folk Art Painting';
  const shopping = await serpapiService.search_google_shopping(query);
  console.log('Shopping Results Count:', shopping.length);
  for (let i = 0; i < Math.min(5, shopping.length); i++) {
    const p = shopping[i];
    console.log(`[${i+1}] ${p.source} | ${p.title} | Rs.${p.price}`);
  }
  const stats = serpapiService.calculate_price_statistics(shopping);
  console.log('Price stats:', stats);
}

test().catch(console.error);

