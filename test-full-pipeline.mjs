import fs from 'fs';

const imgBuffer = fs.readFileSync('Artisan-Ai/public/sample-crafts/madhubani.png');
const base64 = `data:image/png;base64,${imgBuffer.toString('base64')}`;

console.log('Sending test request to http://localhost:3000/api/ai/image-analyze...');

try {
  const startTime = Date.now();
  const res = await fetch('http://localhost:3000/api/ai/image-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: base64,
      fileName: 'madhubani.png',
      contextHint: '',
      voiceTranscript: ''
    })
  });

  console.log(`Status: ${res.status} (took ${((Date.now() - startTime)/1000).toFixed(1)}s)`);
  const data = await res.json();

  console.log('\n--- AI ANALYSIS RESULT ---');
  console.log('Is Fallback:', data.isFallback || false);
  console.log('Product Title:', data.analysis?.product_name || data.catalog?.title);
  console.log('Category:', data.analysis?.category || data.catalog?.category);
  console.log('Short Description:', data.analysis?.short_description || data.catalog?.shortDescription);
  console.log('Tags (count):', data.analysis?.tags?.length || data.catalog?.tags?.length);
  console.log('Keywords (count):', data.seo?.secondaryKeywords?.length || data.analysis?.keywords?.length);
  
  console.log('\n--- PRICING & MARKET BENCHMARKS (SerpApi) ---');
  console.log('Estimated/Recommended Price: ₹' + (data.pricing?.estimated_price || data.pricing?.basePrice));
  console.log('Price Range: ₹' + (data.pricing?.minimum_fair_price || data.pricing?.minPrice) + ' - ₹' + (data.pricing?.maximum_fair_price || data.pricing?.maxPrice));
  console.log('Market Benchmark:', data.pricing?.marketBenchmark?.sourceSummary || 'None');
  if (data.pricing?.marketBenchmark?.topCompetitors) {
    console.log('Top Competitors found:', data.pricing.marketBenchmark.topCompetitors.length);
    data.pricing.marketBenchmark.topCompetitors.slice(0, 3).forEach((c, i) => {
      console.log(`  ${i+1}. [${c.source}] ${c.title.slice(0, 50)}... -> ₹${c.price}`);
    });
  }

  console.log('\n--- DEMAND PREDICTION ---');
  console.log('Demand Score:', data.demand?.demandScore);
  console.log('Demand Level:', data.demand?.demandLevel);
  console.log('Explanation:', data.demand?.explanation);
} catch (err) {
  console.error('Fetch error:', err);
}

