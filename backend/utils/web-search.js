const axios = require("axios");

async function webSearch(latestQuery, prevNewsLinks = []) {
  try {
    const res = await axios.post(
      "https://api.tavily.com/search",
      {
        query: latestQuery,
        max_results: process.env.MAX_ARTICLES || 2,
        include_raw_content: true,
        search_depth: "advanced",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      news_links: [...prevNewsLinks, ...res.data.results],
    };
  } catch (err) {
    console.error("Tavily Search Failed:", err.message);
    return { news_links: prevNewsLinks };
  }
}

module.exports = webSearch;
