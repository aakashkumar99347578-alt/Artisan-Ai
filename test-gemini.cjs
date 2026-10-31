const fs = require('fs');
const path = require('path');
const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
let key = '';
env.split('\n').forEach(l => {
  if (l.startsWith('GEMINI_API_KEY=')) key = l.replace('GEMINI_API_KEY=', '').trim();
});
console.log('Key prefix:', key ? key.slice(0, 8) + '...' : 'NONE');

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: key });

async function run() {
  const models = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];
  for (const m of models) {
    try {
      const res = await ai.models.generateContent({
        model: m,
        contents: 'Answer in one single word: Hello'
      });
      console.log('Model', m, 'SUCCESS:', res.text ? res.text.trim() : 'NO_TEXT');
    } catch(err) {
      console.log('Model', m, 'FAILED:', err.status || err.code, err.message ? err.message.slice(0, 150) : err);
    }
  }
}
run();
