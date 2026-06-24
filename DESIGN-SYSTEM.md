# CRA Johannesburg Tariff Impact — visual system

## Art direction

The interface is a civic-finance workspace rather than a campaign page or municipal portal. A black institutional header and footer establish CRA authority, warm neutral surfaces reduce anxiety, and controlled CRA red and orange identify impact without turning the product into an alarm screen. Data, not decoration, provides the visual energy.

The reading order is fixed: new monthly estimate, extra monthly cost, annual impact, effective increase, contributing services, assumptions and limitations.

## Colour tokens

| Role | Token | Value |
|---|---|---|
| Header and footer | `--color-black` | `#11100f` |
| Page background | `--color-bg` | `#f6f1eb` |
| Primary surface | `--surface-primary` | `#fffdfa` |
| Secondary surface | `--surface-secondary` | `#f3ece5` |
| Elevated result | `--surface-elevated` | `#ffffff` |
| New-value surface | `--surface-result` | `#2c2524` |
| Limitation surface | `--surface-warning` | `#fff3df` |
| Primary text | `--text-primary` | `#282321` |
| Secondary text | `--text-secondary` | `#5f5753` |
| Muted text | `--text-muted` | `#7c716b` |
| CRA red | `--cra-red` | `#c9253d` |
| CRA orange | `--cra-orange` | `#f06b38` |
| Increase highlight | `--increase` | `#d94a2f` |
| Focus | `--focus` | `#d4462d` |
| Positive/success | `--positive` | `#39745d` |

Service identifiers are restrained and consistent: electricity `#c84332`, rates `#89655d`, water `#267f89`, sanitation `#ad7131`, and refuse `#65725d`. Colour always appears with a label and position; it never carries meaning alone.

## Typography

- Calibri is used throughout, with Candara, Segoe UI, Arial and sans-serif fallbacks.
- Currency, percentage and consumption values use tabular lining numerals.
- The page title is compact and product-like; working figures are large enough to scan but remain controlled.
- Labels stay visible at all times. Helper text never substitutes for labels.

## Spacing, depth and radii

The system follows an 8px base with 4, 8, 12, 16, 24, 32, 48 and 64px tokens. Field groups use 16–20px gaps; card padding is 28px on desktop and 18–22px on mobile. Radii are limited to 6, 10 and 16px. Tonal surfaces and warm-grey borders provide most separation; shadows are reserved for the live result panel.

## Grid and composition

Desktop uses a 1,180px workspace with a flexible input column and a 470px sticky result column. The result remains visible while residents adjust inputs. The tariff strip establishes context without competing with the calculator.

Below 900px, the input sections remain first and the result follows them. Below 680px, controls become single-column and the service table simplifies. This preserves the natural task sequence: enter household information first, then review the estimate.

## Components

- Header: full-width black institutional surface for reliable CRA logo contrast, compact product lockup and year badge.
- Intro: factual headline, one-sentence instruction and pale-amber planning notice.
- Input cards: one purpose per card, thin line icon, section number, consistent 48px controls and explicit helper text.
- Residential category: a locked read-only field, with no non-residential calculation path exposed.
- Approved averages: one integrated, lightly ruled table rather than separate metric cards.
- Excluded services: related fields reduce in opacity and become inactive while the re-enable control remains readable.
- Result panel: neutral “before” tile, charcoal “after” tile and orange-red monthly impact card.
- Tax treatment: property rates show VAT at 0%/exempt; water and sanitation share one combined VAT calculation, while refuse has a separate VAT calculation. The result discloses the total VAT amount.
- Electricity guidance: prepaid token usage remains in the household estimate, tariff eligibility and Eskom Direct limitations are explained, and excluded fixed or account charges are disclosed explicitly.
- Service comparison: right-aligned currency columns, exact rand change, service identifier and truthful contribution bar.
- Methodology: pale-amber limitation callout, collapsed assumptions and visible primary-source links.
- Copy state: CRA-red action near the main result summary with a compact green confirmation. Copied text always includes the live calculator URL.

## Iconography and charts

Icons are 1.7px monoline SVGs with round caps and joins. They support scanning and are never decorative. The only visualisations are proportional contribution bars based on calculated rand changes; no gauge, curve or ornamental chart is used.

## Motion

State changes use 160–220ms ease-out transitions. Results receive a brief border highlight, contribution bars resize smoothly, switches move directly, and the copy confirmation fades into place. There are no loops or theatrical effects. Reduced-motion preferences collapse all transitions to effectively instant changes.

## Accessibility

- Visible skip link and keyboard focus ring.
- Minimum 48px control height and large mobile targets.
- Strong foreground/background contrast and readable warning surfaces.
- Native labelled form controls; no placeholder-only fields.
- Disabled states remain legible and reversible.
- Financial meaning is communicated with labels, position and weight in addition to colour.
- Mobile table values remain aligned, and less essential change columns collapse only on very narrow screens.

## Consistency rules

Future components must use the existing tokens, radius scale, monoline icon weight and 8px spacing system. New service colours require an accompanying text label. New shadows require a clear elevation reason. New result metrics belong in the result panel only if they help answer household impact; methodology or legal detail belongs in the lower explanation area.
