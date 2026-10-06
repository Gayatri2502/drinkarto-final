# Public catalogue provenance

Checked 5 October 2026. This is a dated reference snapshot, not a live nationwide rate feed. Prices use INR per bottle. States without imported records show no results and official links where available. Exact producer, size and variant should be checked before using a reference.

## Kerala

4,395 records from BEVCO’s official IMFL/beer/wine list published 23 September 2026, effective 11 May 2026. The imported retail field is the final **FL1 Shop After Tax** bottle-price column; warehouse and case columns are excluded. Product codes are retained. Blank continuation names inherit the preceding named product. Beer/wine source section headings govern their categories. Rows outside the supported bottle-size range or numeric schema are excluded.

Official source: https://bevco.in/price-list-2/

## Tamil Nadu

2,129 unique bottle references from the public catalogue used by https://tasmac.tn.gov.in/brands, obtained through its public get-productList endpoint. Prices are `mrpPerBottle`, sizes are parsed from `unitName`, and product IDs are retained. TASMAC supplied no publication/effective date, so the UI explicitly leaves those unknown. Where the source category conflicts with an explicit product-name word such as “Beer”, the name determines the display category. Names use display capitalization; no prices are inferred.

## Karnataka

34,395 unique source-code/product-size rows from the Karnataka State Beverages Corporation Ltd. supplier-wise item-wise pricing PDF published 31 August 2026. For each item and size, the latest listed MRP effective on or before that publication date is kept. Product identities and per-item effective dates are retained; old prices are not represented as current if a later effective item entry exists.

Official source: https://ksbcl.karnataka.gov.in/en

## Chhattisgarh

1,124 public retail references from CSMCL’s category-wise price cards. The public portal does not publish a list date or effective date. The importer keeps its product categories distinct and labels the snapshot date rather than implying an official effective date.

Official source: https://excise.cg.nic.in/CSMCL/RetailServices/reports/PriceListForApp.aspx

## Assam

150 current civilian whisky MRP references from the AERMS 2026–27 public price list, checked 5 October 2026. For repeated item/size rows, only the latest currently valid civilian price is kept. Export and defence-purpose entries, zero-price rows and expired rates are excluded. This feed currently covers whisky only.

Official source: https://stateexcise.assam.gov.in/index.php/PriceList/priceListView

## Educational material

Definitions and 12 style profiles are concise original summaries with WSET or Scotch Whisky Association links. Eight wine profiles are familiar grapes/styles, not an unsupported popularity ranking. Body, sweetness, acidity and tannin are qualitative descriptions; spirit and wine measures are not interchangeable. No bottle-specific ABV, tasting score, health claim or state legal age is invented.

## Refreshing

Live snapshots are stored in PostgreSQL `PublicPriceSnapshot`, updated by the separate three-hour backend worker. `src/content/prices.json` remains the original bootstrap fixture and is never used as a fallback when the database is unavailable. See [price job](PRICE-JOB.md) for discovery, validation, locks, failure retention, events and deployment. Public data never reads organization catalogues, inventory, retailers or orders.
