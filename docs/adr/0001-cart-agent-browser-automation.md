# Cart agent uses Playwright browser automation against walmart.com

Walmart has no public cart API, so the "Shop for me" agent drives a headless browser via Playwright to search items, add them to a guest cart, and extract the cart URL. The session runs as a background job because automation over a full shopping list takes 30–60 seconds — too slow for a synchronous API response. The UI polls for CartSession status until it reaches `resolved` or `failed`.
