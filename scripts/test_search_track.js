const queries = ["dango", "だんご", "団子", "Cherryblossom", "cherry blossom", "sakura", "桜"];

async function runTests() {
  for (const query of queries) {
    console.log(`Testing query: ${query}`);
    try {
      const res = await fetch("http://localhost:3000/api/search/track", {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "test-bot" },
        body: JSON.stringify({
          query,
          normalizedQuery: query.toLowerCase().trim(),
          languageGuess: query.match(/[^\x01-\x7E]/) ? 'ja' : 'en',
          matchedAssetCount: 0,
          hasResults: false,
          sourcePage: '/search',
        })
      });
      const data = await res.json();
      console.log(`Response for ${query}:`, data);
    } catch (e) {
      console.error(`Error for ${query}:`, e);
    }
  }
}

runTests();
