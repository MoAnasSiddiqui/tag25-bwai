// fetchNews.js
const { generateSearchQuery } = require("../utils/query-generator"); // Adjusted to use the new function name
const webSearch = require("../utils/web-search");

const state = {
  user_prompt: "Pakistan",
  search_queries: [],
  news_links: [],
};

async function fetchNews(region = "Pakistan") {
  state.user_prompt = region;

  // Generate the search query dynamically using the new function structure
  const search_queries = await generateSearchQuery(
    region,
    state.search_queries
  ); // Adjusted to match the new flow

  // The search queries are returned as an array, so you can use the last query
  state.search_queries = search_queries;

  // Fetch news links using the generated query (the last query in the array)
  const { news_links } = await webSearch(
    search_queries.at(-1),
    state.news_links
  );
  state.news_links = news_links;

  return state.news_links;
}

module.exports = { fetchNews };
