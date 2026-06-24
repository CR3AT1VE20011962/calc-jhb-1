# CRA Joburg tariff calculator

A static, publish-ready calculator for the City of Johannesburg tariff increases effective 1 July 2026.

The result workspace compares the estimated monthly cost before the increase with the estimated cost from 1 July 2026, including monthly and annual rand impact, effective household increase, exact service-level changes and proportional contribution bars.

This edition is residential-only. The property category is locked to Residential because commercial electricity, water, sanitation and refuse accounts use different tariff structures. Approved average increases appear in one integrated table, and every copied estimate includes the live page URL for sharing.

Water consumption, the demand management levy and sanitation are presented in one section and combined before 15% VAT is calculated. Refuse is presented separately with its own 15% VAT calculation; property rates are VAT-exempt and shown at 0%. The result panel discloses the VAT amount included. Prepaid City Power usage is included even when a municipal bill shows R0 because the user buys tokens separately. Electricity fixed, service, capacity and network charges are deliberately excluded and disclosed. A caution note explains that the City Power model may not accurately reflect Eskom Direct tariffs.

The Water & Sanitation section includes an optional demand management levy field with no default. Users enter the current levy before VAT from their own account and the exact Step 1 water quantity charged at R0. Sanitation accepts the exact ERF size and automatically maps it to the applicable tariff band. Residential refuse is a fixed monthly charge chosen from the property-value band, with 15% VAT added separately.

The interface uses a documented CRA civic-finance design system. See `DESIGN-SYSTEM.md` for colour, type, spacing, responsive layout, motion and accessibility rules.

## Publish it

Upload this entire folder to any static host. The simplest options are Netlify Drop, GitHub Pages, Cloudflare Pages or an existing CRA website. No build command or server is required; `index.html` is the entry point.

## Method

The City of Johannesburg's approved average 2026/27 increases are applied to its published FY2025/26 tariff categories and values. The interface labels the result as an estimate because the City's indexed, line-by-line 2026/27 consolidated schedule was not available when this version was produced.

## Update later

When the final 2026/27 consolidated schedule is published, replace the constants at the top of `app.js` with the exact approved values and set the relevant multipliers in `INCREASE` to `1`.
