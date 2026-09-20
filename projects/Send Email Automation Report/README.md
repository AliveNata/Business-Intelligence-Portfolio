# Send Email Automation Report

## Problem
Brand and account teams needed performance reports delivered straight to their inbox on a schedule or on request, without a BI analyst manually exporting a spreadsheet and emailing it every time.

## Data
Google Sheets as the source (order data, pivot tables, and month to date brand achievement figures), exported and emailed through Google Apps Script.

## Approach
Two automation patterns for two different needs, both included in this folder:

- `No HTML/`: an on demand script that copies 2 sheets (order data and pivot data) into a new spreadsheet, exports it as a real xlsx file through the Sheets export API, and emails it as a plain text attachment. Used for ad hoc report requests.
- `Using HTML/`: a fully scheduled daily report. A time based trigger fires every day at 9 AM Asia/Jakarta, reads recipient, subject, and filename from a config sheet, renders an HTML email table from a template with per brand month to date achievement figures, hides every other sheet before exporting to xlsx so only the report table is visible in the attachment, sends through Gmail, then writes the last sent timestamp back to the config sheet as an audit trail. Wrapped in a try and catch block that logs failures instead of failing silently.

## Result
- Replaced manual export and send work for 2 separate recurring report needs.
- The scheduled variant sends a month to date achievement report covering 18 brand accounts in one email, automatically, every day, over 30 sends a month with no manual step.
- The config sheet controls recipient and subject, so non technical stakeholders can update those without touching the script.
- Exported file only contains the report tab, other internal sheets stay hidden during export.

## Impact
The BI team stopped manually generating and sending the same recurring report by hand. Because recipient and subject live in a config sheet instead of the code, changing who receives the report did not need a script change. The last sent timestamp made it easy to confirm the automation actually ran that day instead of assuming it did.

## Tools
Google Apps Script (JavaScript), Google Sheets, Gmail API, HTML email templating.

## Files in this folder
- `No HTML/`: on demand export and email script, plus a sample output screenshot.
- `Using HTML/`: scheduled daily HTML report script, plus a sample output screenshot.
