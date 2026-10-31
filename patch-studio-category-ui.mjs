import fs from 'fs';

let studio = fs.readFileSync('Artisan-Ai/src/components/AiProductCreationStudio.tsx', 'utf8');

// 1. Add auto-advance to Step 3 after image analysis succeeds
const oldNoticeBlock = `        if ((res as any).isFallback) {
          setVisionGeneratedNotice(\`✨ Analyzed with Artisan AI Engine: "\${newTitle}"! Catalog, SEO, Fair Pricing & Demand ready.\`);
        } else {
          setVisionGeneratedNotice(\`✨ Gemini Vision Analyzed: "\${newTitle}"! Complete Catalog, SEO, Fair Price & Market Demand ready.\`);
        }`;

const newNoticeBlock = `        if ((res as any).isFallback) {
          setVisionGeneratedNotice(\`✨ Analyzed with Artisan AI Engine: "\${newTitle}"! Category: \${newCategory}. Catalog, SEO, Fair Pricing & Demand ready.\`);
        } else {
          setVisionGeneratedNotice(\`✨ Gemini Vision Analyzed: "\${newTitle}"! Auto-categorized as: \${newCategory}. Details ready.\`);
        }

        // Auto-advance to Step 3 so artisan sees the auto-detected category & details immediately
        setTimeout(() => {
          setCurrentStep(3);
        }, 1200);`;

studio = studio.replace(oldNoticeBlock, newNoticeBlock);

// 2. Enhance Recognition Summary Card in Step 2
const oldRecognitionCard = `                  {/* Recognition Summary Card */}
                  {catalog.title && (
                    <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Identified: {catalog.title}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                          {catalog.category}
                        </span>
                      </div>
                      <p className="text-stone-700 line-clamp-2">{catalog.shortDescription}</p>
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                        >
                          <span>Review Title, Description & SEO</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}`;

const newRecognitionCard = `                  {/* Prominent Auto-Categorization Card in Step 2 */}
                  {catalog.title && (
                    <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 p-4 rounded-2xl border-2 border-emerald-500/50 space-y-3 text-xs shadow-sm animate-fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-emerald-700" />
                          <span className="font-bold text-emerald-950 uppercase tracking-wide text-[11px]">
                            AI Auto-Categorized (श्रेणी पहचान):
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-700 text-white font-bold text-xs shadow-xs">
                          {catalog.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/90 p-2 rounded-xl border border-emerald-200">
                          <span className="text-[10px] text-stone-500 block">Category (श्रेणी)</span>
                          <span className="font-bold text-stone-900 text-xs">{catalog.category}</span>
                        </div>
                        <div className="bg-white/90 p-2 rounded-xl border border-emerald-200">
                          <span className="text-[10px] text-stone-500 block">Subcategory (उप-श्रेणी)</span>
                          <span className="font-bold text-stone-900 text-xs">{catalog.subcategory || 'Handcrafted Specialty'}</span>
                        </div>
                      </div>

                      <p className="text-stone-700 line-clamp-2">
                        <strong>Title:</strong> {catalog.title}
                      </p>

                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <span>Review Title, Description & SEO (विवरण देखें)</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}`;

studio = studio.replace(oldRecognitionCard, newRecognitionCard);

// 3. Add prominent Auto-Detected Category Header Banner at top of Step 3
const oldStep3Header = `          {/* ========================================================================= */}
          {/* STEP 3: TITLE, DESCRIPTION, SEO & TAGS (CLEAN & UNCLUTTERED) */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Step 3 of 5: Product Details & Multi-Point SEO (शीर्षक व विवरण)</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                    Authentic E-Commerce Title & Storytelling
                  </h3>
                </div>`;

const newStep3Header = `          {/* ========================================================================= */}
          {/* STEP 3: TITLE, DESCRIPTION, SEO & TAGS (CLEAN & UNCLUTTERED) */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Prominent Auto-Detected Category Banner */}
              <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 border-2 border-amber-300/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-800 text-amber-200 flex items-center justify-center shadow-xs">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                      AI Auto-Detected Category (फोटो से पहचानी गई श्रेणी)
                    </span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-lg font-serif font-bold text-stone-900">
                        {catalog.category}
                      </span>
                      {catalog.subcategory && (
                        <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold">
                          {catalog.subcategory}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-stone-600 font-semibold">Change Category:</span>
                  <select
                    value={catalog.category}
                    onChange={(e) => setCatalog((prev) => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-1.5 bg-white border border-amber-400 rounded-xl text-xs font-bold text-amber-900 shadow-xs focus:ring-2 focus:ring-amber-600 cursor-pointer"
                  >
                    <option value="Clothing & Apparel">Clothing & Apparel (कपड़े व वस्त्र)</option>
                    <option value="Paintings & Artworks">Paintings & Artworks (चित्रकला व पेंटिंग्स)</option>
                    <option value="Home Décor & Utility">Home Décor & Utility (होम डेकोर व उपयोगी)</option>
                    <option value="Kitchen & Dining">Kitchen & Dining (रसोई व डाइनिंग)</option>
                    <option value="Home Furnishings">Home Furnishings (होम फर्निशिंग्स)</option>
                    <option value="Floor Coverings">Floor Coverings (कालीन व दरियां)</option>
                    <option value="Handcrafted Jewellery">Handcrafted Jewellery (आभूषण व गहने)</option>
                    <option value="Lighting & Lamps">Lighting & Lamps (लैंप व लाइटिंग)</option>
                    <option value="Religious Items & Pooja">Religious Items & Pooja (पूजा व धार्मिक सामग्री)</option>
                    <option value="Musical Instruments">Musical Instruments (वाद्य यंत्र)</option>
                    <option value="Accessories & Bags">Accessories & Bags (बैग्स व एक्सेसरीज)</option>
                    <option value="Stationery & Craft">Stationery & Craft (स्टेशनरी व डायरी)</option>
                    <option value="Pottery & Ceramics">Pottery & Ceramics (मिट्टी के बर्तन)</option>
                    <option value="Woodcraft & Carving">Woodcraft & Carving (काष्ठ कला)</option>
                    <option value="Bath & Wellness">Bath & Wellness (तौलिया व वैलनेस)</option>
                    <option value="Sports & Fitness">Sports & Fitness (खेल व फिटनेस)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Step 3 of 5: Product Details & Multi-Point SEO (शीर्षक व विवरण)</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                    Authentic E-Commerce Title & Storytelling
                  </h3>
                </div>`;

studio = studio.replace(oldStep3Header, newStep3Header);

fs.writeFileSync('Artisan-Ai/src/components/AiProductCreationStudio.tsx', studio, 'utf8');
console.log('SUCCESS: AiProductCreationStudio.tsx updated with prominent category display and auto-advance!');

