import fs from 'fs';

let code = fs.readFileSync('Artisan-Ai/src/lib/aiServices.ts', 'utf8');
code = code.replace(/prodCategory = 'Folk Art & Paintings';/g, "prodCategory = 'Paintings & Artworks';");
code = code.replace(/prodCategory = 'Textiles & Handloom';/g, "prodCategory = 'Clothing & Apparel';");
code = code.replace(/prodCategory = 'Metalcraft & Dhokra';/g, "prodCategory = 'Religious Items & Pooja';");
code = code.replace(/prodCategory = 'Woodcraft & Lacquer';/g, "prodCategory = 'Woodcraft & Carving';");
fs.writeFileSync('Artisan-Ai/src/lib/aiServices.ts', code, 'utf8');
console.log('SUCCESS: aiServices.ts updated with new category names');

