import { z } from "zod";
export const priceBreakdownSchema = z.object({
  source: z.literal("bevco-published-columns"),
  bottlesPerCase: z.number().int().positive().max(200),
  landedCostPerCase: z.number().nonnegative(),
  exciseDutyPerCase: z.number().nonnegative(),
  importFeePerCase: z.number().nonnegative(),
  warehouseBeforeTaxPerCase: z.number().nonnegative(),
  warehouseTaxPerCase: z.number().nonnegative(),
  warehouseAfterTaxPerCase: z.number().nonnegative(),
  retailBeforeTax: z.number().nonnegative(),
  retailTax: z.number().nonnegative(),
  retailCess: z.number().nonnegative(),
  retailAdjustment: z.number().min(-10).max(10),
});
export type PriceBreakdown = z.infer<typeof priceBreakdownSchema>;
export function reconcilesRetail(price: number, breakdown: PriceBreakdown) {
  return (
    Math.abs(
      price -
        breakdown.retailBeforeTax -
        breakdown.retailTax -
        breakdown.retailCess -
        breakdown.retailAdjustment,
    ) < 0.025
  );
}
