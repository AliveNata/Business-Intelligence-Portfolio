# NBA Player Stats Data Analysis 2023-2024

## Problem
Practice project using a public per game stats dataset to demonstrate a full data analysis workflow end to end, from messy multi source data to statistical testing and forecasting. Originally built as a take home technical exercise.

## Data
11 separately scraped per game stat snapshots covering November 2023 to January 2024 (Nov 13 to Jan 26), combined into one dataset spanning the first 3 months of the season.

## Approach
- Combined 11 CSV snapshots into one dataset, tagged each with its scrape date, rebuilt a proper date column, and sorted chronologically.
- Cleaned the data: filled missing values, checked and removed duplicates, detected file encoding with chardet, and normalized player names from accented characters to plain ASCII (for example Nikola Jokic instead of Nikola Jokic with the accent) so names matched consistently across files.
- Built an interactive player lookup with ipywidgets: pick any player from a dropdown, see their monthly average points, assists, rebounds, field goal, 3 point, and free throw percentage, plus month over month percentage change, plotted automatically.
- Ran a one way ANOVA per player to test whether their points per game differ significantly across November, December, and January.
- Fit a linear regression per player on monthly points to forecast next month's scoring average.
- Built a second dropdown view: pick a month, see the top 5 scorers with a combo chart, bar for points and line for games played.
- Static breakdown views: top 10 players by combined scoring, assists, and rebounds, top 10 players by shooting percentage, and average points by age and position.

## Result
- One combined, cleaned dataset spanning 3 months of the season instead of 11 disconnected snapshots.
- Statistical testing (ANOVA) applied per player, not just a visual guess at whether performance changed month to month.
- Working regression forecast for next month's scoring average, per player.

## Impact
Turned 11 disconnected snapshot files into 1 clean, chronologically ordered dataset covering 3 months and 6 performance metrics per player. Demonstrates the workflow a data analyst runs in practice: combine messy multi source files, clean and normalize them, then move past charts into actual statistical testing and a simple forecast for whichever player is selected, wrapped in an interactive tool a non technical user could click through without touching code.

## Tools
Python (pandas, numpy), matplotlib, seaborn, scipy (ANOVA), scikit-learn (linear regression), ipywidgets, chardet.

## Files in this folder
- `NBA Key Insights from Player Performance Data.ipynb`: the full analysis notebook.
- `NBA Key Insights from Player Performance Data.pdf`: exported PDF of the notebook and its charts.
