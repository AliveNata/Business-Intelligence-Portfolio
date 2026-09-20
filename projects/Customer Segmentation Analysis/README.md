# Customer Segmentation Analysis

## Problem
Regional customer service team across 6 countries (Indonesia, Thailand, Vietnam, Singapore, Philippines, Malaysia) needed one dashboard to monitor chat response performance, conversion from chat to sales, and review handling, broken down by venture, platform, and shop. Before this, each market tracked its own numbers separately with no consistent view across the region.

## Data
BigQuery fact and dimension tables combining 3 data sources: platform seller center exports (Shopee, Lazada), an internal chat tool log (PowerSell Pro), and manually uploaded daily chat logs for platforms without an API (Tokopedia, TikTok, Tiki). Covers chat volume, response time, conversion, and review data across all 6 ventures and 5 marketplaces, refreshed daily.

## Approach
Built 11 BigQuery queries on top of the raw fact tables, most sharing the same pattern:

- Row level access control on every query through an email based account role table, so each account manager only sees the shops assigned to them.
- `CSAT & iUC.sql`: internal unique chat volume with multiple brand mapping fallbacks (join by shop id first, fall back to a manual mapping sheet when shop id is missing).
- `New Logic CRT.sql` and `New Logic ACHT Details.sql`: chat response time and average handling time per agent, joined against shop and account role dimensions.
- `fact_chat_service_daily.sql`: daily chat response rate and follower growth per shop, with campaign calendar joined in.
- `fact_cx_chat_sc.sql`, `fact_cx_crt_pwp.sql`, `fact_cx_review_sc.sql`, `fact_reviews.sql`: platform social commerce chat, post purchase chat, and product/seller reviews, each filtered by venture and platform.
- `fact_cx_daily_upload*.sql`: manually uploaded chat logs for platforms with no seller center API, with unique customer deduplication logic that was revised several times as edge cases showed up (see changelog comments in each file).
- `fact_cx_manpower_data.sql`: agent staffing data used to compute productivity per active agent.

Data model went through multiple rounds of fixes over roughly 2 years, tracked in changelog comments inside each query, including brand mapping logic changes and dedup fixes.

## Result
Numbers below are region wide aggregates, not tied to any single brand or shop:

- Tracks chat and conversion performance across 6 ventures and 5 marketplaces in one dashboard.
- One weekly snapshot: 135K+ external chats received, 100% chat response rate, average response time under 4 minutes.
- Chat driven conversion in the same snapshot: 17K+ guided buyers, 19.6K+ guided orders.
- Review handling: 60.2K orders generated 76.4K reviews region wide, with 74.2% replied.
- Grand total conversion rate (CCR) of 9.8% across all ventures for the period shown.

## Impact
Regional and country level CS leads could see chat performance and chat to sales conversion in one place instead of pulling numbers separately per market. The response time and conversion breakdown by venture and platform made it possible to spot which markets or platforms needed more agent coverage rather than treating the whole region as one number.

## Tools
BigQuery (SQL), Looker, multi source data blending (seller center exports, internal tool logs, manual uploads).

## Files in this folder
- `Query/`: the 11 BigQuery scripts described above.
- `Dashboard/`: exported PDF snapshot of the live Looker dashboard.
