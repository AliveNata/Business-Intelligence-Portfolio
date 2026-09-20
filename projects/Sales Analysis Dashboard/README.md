# Sales Analysis Dashboard

## Problem
Regional ecommerce team needed one dashboard for account managers to track sales performance and target achievement across multiple brand accounts, marketplaces, and currencies, replacing manual spreadsheet reporting.

## Data
BigQuery fact and dimension tables covering daily and hourly order level, product level, and shop level transactions across 8 online marketplaces (Shopee, Tokopedia, Lazada, TikTok, Zalora, Blibli, JD.ID, Bukalapak). Historical trend data spans 2020 to 2024. A single monthly snapshot (used for the exported dashboard in this folder) covers close to 24,000 SKU/week level rows.

## Approach
Built 7 BigQuery queries, each covering a different slice of the reporting:

- `Brand Growth Comparison.sql`: trailing 6 month GMV trend per brand, joined with exchange rate and phasing data for month over month growth comparison.
- `Filter (dim_shop_info).sql`: filters brands and platforms by the logged in account manager's email, powers row level access control so each account manager only sees their own accounts.
- `Hourly Performance.sql`: hourly GMV, order, and item sold metrics per platform and brand, powers the intraday performance charts.
- `Monthly Target.sql`: joins actual monthly sales with target and cumulative phasing to compute percentage achievement.
- `Operation Performance.sql`: order level data with cancellation reason classification (buyer, seller, or system cancelled).
- `Product Performance.sql`: product and SKU level GMV with category mapping, includes fixes for duplicate joins that previously inflated GMV figures (see the changelog comments inside the file).
- `Shop Performance.sql`: shop level target vs actual GMV/NMV, including a calendar join so days with zero sales still show up in the daily gap to target trend.

Handled multi currency conversion (USD/IDR) through an exchange rate dimension, and visualized the result in Looker with drill down from brand, to platform, to category, to SKU level.

## Result
Numbers below are aggregated across all tracked accounts, not tied to any single brand or client. From the exported snapshot (Sep 2024):

- 19+ brand accounts tracked across 8 marketplaces and 20+ product categories in a single view.
- Combined GMV run rate around IDR 70B against an IDR 82B monthly target, 82.6% achievement.
- Cancellation reasons broken down by buyer, seller, and system across all platforms.

## Impact
Account managers could self serve daily performance versus target without waiting on the analytics team. The cancellation reason breakdown helped operations pinpoint whether fulfillment issues came from the platform, the seller, or the buyer, instead of treating every cancellation the same.

## Tools
BigQuery (SQL), Looker, multi currency exchange rate handling.

## Files in this folder
- `Query/`: the 7 BigQuery scripts described above.
- `Dashboard/`: exported PDF snapshot of the live Looker dashboard.
