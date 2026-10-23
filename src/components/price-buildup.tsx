import type { PriceRow } from "@/content/public";
import { marketFor, taxExplanation } from "@/content/india-markets";
const rupees = (value: number) =>
  "₹" +
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
export default function PriceBuildUp({ row }: { row: PriceRow }) {
  const breakdown = row.breakdown;
  const guide = taxExplanation(row.state);
  const market = marketFor(row.state);
  const line = (
    label: string,
    value: number | undefined,
    unit = " / bottle",
  ) => (
    <div key={label}>
      <dt>{label}</dt>
      <dd className={value === undefined ? "price-missing" : ""}>
        {value === undefined ? "Not published" : rupees(value) + unit}
      </dd>
    </div>
  );
  return (
    <details className="price-buildup">
      <summary>
        Tax, base price & margins · {row.sizeMl.toLocaleString("en-IN")} ml
      </summary>
      <p>
        Source code {row.sourceCode}
        {row.market ? ` · ${row.market}` : ""}. Amounts below belong to this
        source record and bottle size.
      </p>
      <dl>
        {line("Manufacturer / ex-distillery base price", undefined)}
        {line("Retail price before published tax", breakdown?.retailBeforeTax)}
        {line(
          "Published retail tax (source label: Tax*)",
          breakdown?.retailTax,
        )}
        {line("Applicable bottle cess", breakdown?.retailCess)}
        {breakdown &&
          Math.abs(breakdown.retailAdjustment) > 0.001 &&
          line(
            "Reconciliation difference (derived)",
            breakdown.retailAdjustment,
          )}
        {line("Corporation margin, itemised", undefined)}
        {line("Retail margin, itemised", undefined)}
        <div className="price-total">
          <dt>Official final retail / MRP</dt>
          <dd>{rupees(row.price)} / bottle</dd>
        </div>
      </dl>
      <p>
        {breakdown
          ? "The published bottle-level before-tax amount, tax, cess and the derived reconciliation difference sum to the final retail price. Case-level duty below is already within the supply chain; it is not added again."
          : "This feed supplies a final retail reference only. Missing components are undisclosed, not zero. Tax amounts and margins cannot be inferred by subtracting an assumed percentage from MRP."}
      </p>
      {breakdown && (
        <details className="price-case">
          <summary>
            Published case columns · {breakdown.bottlesPerCase} bottles per case
          </summary>
          <dl>
            {line(
              "Landed cost (not manufacturer base price)",
              breakdown.landedCostPerCase,
              " / case",
            )}
            {line("Excise duty", breakdown.exciseDutyPerCase, " / case")}
            {line("Import fee", breakdown.importFeePerCase, " / case")}
            {line(
              "Warehouse price before tax",
              breakdown.warehouseBeforeTaxPerCase,
              " / case",
            )}
            {line("Warehouse tax", breakdown.warehouseTaxPerCase, " / case")}
            {line(
              "Warehouse selling price after tax",
              breakdown.warehouseAfterTaxPerCase,
              " / case",
            )}
          </dl>
          <p>
            Case figures are preserved as published. They are not combined with
            the bottle-level retail figures above.
          </p>
        </details>
      )}
      <h5>{row.state}: pricing method</h5>
      <p>{guide.formula}</p>
      <p>{guide.detail}</p>
      {market && (
        <a
          href={market.policySource ?? market.source}
          target="_blank"
          rel="noreferrer"
        >
          State policy / official source ↗
        </a>
      )}
    </details>
  );
}
