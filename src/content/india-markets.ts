/** Geographic coverage is complete; verification and price coverage are separate facts. */
export type MarketModel =
  | "government-retail"
  | "government-wholesale"
  | "licensed-retail"
  | "prohibition"
  | "restricted"
  | "verification-pending";
export type IndiaMarket = {
  name: string;
  kind: "State" | "Union territory";
  model: MarketModel;
  authority: string;
  source: string;
  note: string;
  taxGuide: "kerala" | "odisha" | "mrp-only" | "pending" | "restricted";
  policySource?: string;
  importNote?: string;
};
export const marketLabels: Record<MarketModel, string> = {
  "government-retail": "Government retail reference",
  "government-wholesale": "Government wholesale / licensed retail",
  "licensed-retail": "Licensed retail",
  prohibition: "Prohibition / permit exceptions",
  restricted: "Restricted / special regime",
  "verification-pending": "2026 market model not verified",
};
const pending =
  "2026 retail/wholesale model, import conditions and tax notification require source verification. No nationwide tax rate is assumed.";
const stateEntries: [string, string][] = [
  ["Andhra Pradesh", "https://cpe.ap.gov.in/"],
  [
    "Arunachal Pradesh",
    "https://eabkari.arunachal.gov.in/Portal_new_default.aspx",
  ],
  [
    "Assam",
    "https://stateexcise.assam.gov.in/index.php/PriceList/priceListView",
  ],
  ["Bihar", "https://state.bihar.gov.in/excise/CitizenHome.html"],
  [
    "Chhattisgarh",
    "https://excise.cg.nic.in/CSMCL/RetailServices/reports/PriceListForApp.aspx",
  ],
  ["Goa", "https://goaexcise.gov.in/"],
  ["Gujarat", "https://prohibition-excise.gujarat.gov.in/"],
  ["Haryana", "https://haryanatax.gov.in/"],
  [
    "Himachal Pradesh",
    "https://egovef.hptax.gov.in/central/excisepolicies/Excise%20Announcement%202026-27.pdf",
  ],
  ["Jharkhand", "https://excise.jharkhand.gov.in/"],
  ["Karnataka", "https://ksbcl.karnataka.gov.in/en"],
  ["Kerala", "https://bevco.in/price-list-2/"],
  ["Madhya Pradesh", "https://excise.mp.gov.in/"],
  [
    "Maharashtra",
    "https://stateexcise.maharashtra.gov.in/1246/Excise-Duty-and-Fee-Structure",
  ],
  ["Manipur", "https://eabkari.mn.gov.in/"],
  ["Meghalaya", "https://excise.meghalaya.gov.in/"],
  ["Mizoram", "https://excise.mizoram.gov.in/"],
  ["Nagaland", "https://excise.nagaland.gov.in/"],
  ["Odisha", "https://osbc.co.in/Home.aspx"],
  ["Punjab", "https://excise.punjab.gov.in/"],
  [
    "Rajasthan",
    "https://excise.rajasthan.gov.in/RSBCL-Price-List-BrandWise.aspx",
  ],
  ["Sikkim", "https://excise.sikkim.gov.in/"],
  ["Tamil Nadu", "https://tasmac.tn.gov.in/brands"],
  ["Telangana", "https://excise.telangana.gov.in/"],
  ["Tripura", "https://excise.tripura.gov.in/"],
  ["Uttar Pradesh", "https://excise.up.gov.in/"],
  ["Uttarakhand", "https://excise.uk.gov.in/"],
  ["West Bengal", "https://excise.wb.gov.in/"],
];
const unionEntries: [string, string][] = [
  ["Andaman and Nicobar Islands", "https://andaman.gov.in/"],
  ["Chandigarh", "https://etdut.gov.in/"],
  ["Dadra and Nagar Haveli and Daman and Diu", "https://ddnexcise.gov.in/"],
  ["Delhi", "https://excise.delhi.gov.in/"],
  ["Jammu and Kashmir", "https://jkexcise.nic.in/"],
  ["Ladakh", "https://ladakh.gov.in/"],
  ["Lakshadweep", "https://lakshadweep.gov.in/documents/"],
  ["Puducherry", "https://excise.py.gov.in/"],
];
const overrides: Record<string, Partial<IndiaMarket>> = {
  Kerala: {
    model: "government-retail",
    authority: "Kerala State Beverages Corporation (BEVCO)",
    taxGuide: "kerala",
    note: "The BEVCO source distinguishes warehouse case prices and FL-1 shop bottle prices. A landed cost is not a manufacturer’s ex-distillery price.",
    policySource: "https://bevco.in/price-list-2/",
  },
  "Tamil Nadu": {
    model: "government-retail",
    authority: "TASMAC published brand MRP",
    taxGuide: "mrp-only",
    note: "The connected TASMAC brand feed publishes bottle MRP. It does not supply item-level ex-distillery cost, excise, VAT or margins. The category describes the TASMAC source channel, not a guarantee about every 2026 outlet arrangement.",
  },
  Odisha: {
    model: "government-wholesale",
    authority: "Odisha State Beverages Corporation (OSBCL)",
    taxGuide: "odisha",
    note: "OSBCL publishes MRP and describes depot sales to licensed retailers. Tax and margin bases depend on category and the current policy.",
    policySource:
      "https://osbc.co.in/NewIncludes/UploadFiles/New/InfoId_20260326170900.pdf",
    importNote:
      "OSBCL publishes a process for import/transport passes. Approval and brand registration remain necessary.",
  },
  "Arunachal Pradesh": {
    model: "licensed-retail",
    authority: "Department of Tax, Excise and Narcotics",
    note: "The official e-Abkari portal administers licences, brand registration and import/transport permissions.",
    importNote:
      "The official portal offers import and transport permit services. This is not a finding that importing is easy or unrestricted.",
  },
  "Himachal Pradesh": {
    model: "licensed-retail",
    authority: "Excise and Taxation Department",
    note: "The 2026–27 excise announcement describes auction/allotment of retail excise vends. Category-specific tax rates still require verification.",
  },
  Karnataka: {
    authority: "Karnataka State Beverages Corporation (KSBCL)",
    taxGuide: "mrp-only",
    note: "The connected adapter reads the official supplier/item price document. Wholesale price columns are not interchangeable with bottle MRP; the current market model and full tax formula need separate policy verification.",
  },
  Chhattisgarh: {
    authority: "CSMCL published retail price portal",
    taxGuide: "mrp-only",
    note: "The connected CSMCL portal publishes retail bottle references. Itemised tax components and the current outlet-ownership model are not supplied by that feed.",
  },
  Assam: {
    authority: "Assam Excise public price-list portal",
    taxGuide: "mrp-only",
    note: "The public list distinguishes market channels and validity dates. Defence/export rates are excluded; no item-level tax breakdown is supplied.",
  },
  Bihar: {
    model: "prohibition",
    taxGuide: "restricted",
    authority: "Prohibition, Excise and Registration Department",
    note: "General liquor price comparison is unavailable. Prohibition applies; do not interpret directory inclusion as permission to possess, import, buy or sell.",
  },
  Gujarat: {
    model: "prohibition",
    taxGuide: "restricted",
    authority: "Prohibition and Excise Department",
    note: "No general-market price comparison is supplied. Prohibition has permit/category/location exceptions; check the authority for the exact eligibility and permit conditions.",
    policySource:
      "https://www.indiacode.nic.in/bitstream/123456789/6165/1/prohibition1949.pdf",
  },
  Nagaland: {
    model: "prohibition",
    taxGuide: "restricted",
    authority: "Department of Excise",
    note: "General-market prices are unavailable under the prohibition regime. Statutory exceptions require official verification.",
  },
  Mizoram: {
    model: "restricted",
    taxGuide: "restricted",
    authority: "Excise and Narcotics Department",
    note: "The department publishes a 2026 wine MRP notice and rules under the prohibition framework. This is a category-specific exception, not general permission for spirits or unrestricted retail.",
  },
  Manipur: {
    model: "restricted",
    taxGuide: "restricted",
    authority: "Department of Excise",
    note: "Restrictions are area-specific. The official portal references the Manipur Liquor Prohibition Act; check the current notified area and licence before making any eligibility assumption.",
  },
  Lakshadweep: {
    model: "restricted",
    taxGuide: "restricted",
    authority: "Lakshadweep Administration",
    note: "The 2026 Excise Regulation has a commencement-by-notification clause. Current commencement, island, property and licence permissions must be verified; general price comparison is unavailable.",
    policySource:
      "https://www.legislative.gov.in/static/uploads/2026/05/ccb147cfb44faaaf0c53ccf168158c91.pdf",
  },
};
export const indiaMarkets: IndiaMarket[] = [
  ...stateEntries.map(([name, source]) => ({
    name,
    source,
    kind: "State" as const,
  })),
  ...unionEntries.map(([name, source]) => ({
    name,
    source,
    kind: "Union territory" as const,
  })),
]
  .map((entry) => ({
    ...entry,
    model: "verification-pending" as MarketModel,
    authority: `${entry.name} government / excise source`,
    note: pending,
    taxGuide: "pending" as IndiaMarket["taxGuide"],
    ...overrides[entry.name],
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
export function marketFor(name: string) {
  return indiaMarkets.find((market) => market.name === name);
}
export function generalPriceUnavailable(name: string) {
  const market = marketFor(name);
  return market?.model === "prohibition" || market?.taxGuide === "restricted";
}
export function taxExplanation(name: string) {
  const market = marketFor(name);
  switch (market?.taxGuide) {
    case "kerala":
      return {
        status: "Published-column explanation",
        formula:
          "FL-1 price before tax + published tax + applicable bottle cess + derived reconciliation difference = FL-1 selling price",
        detail:
          "Use the same row and bottle size. Warehouse landed cost, duty, import fee and case prices are separate columns; they must not be added again to the retail before-tax price. Individual corporation and retailer margins are not separately supplied by this list.",
      };
    case "odisha":
      return {
        status: "2026–29 policy structure; item inputs required",
        formula:
          "Landing cost (offer price + import fee) + excise duty + AROED + de-addiction cess + OSBCL margin + VAT + retailer margin = MRP",
        detail:
          "The OSBCL-linked 2026–29 policy sets category-dependent bases, rates and margins. The public bottle MRP feed does not disclose every item input, so Drinkarto does not reverse-calculate those values or apply this expression as a universal flat-rate calculator.",
      };
    case "mrp-only":
      return {
        status: "Itemised formula not available from the connected feed",
        formula:
          "Official published bottle MRP / retail price — already includes the levies applicable to that published price",
        detail:
          "Manufacturer cost, taxable bases, excise duty, VAT/sales tax, corporation margin and retailer margin cannot be recovered reliably from MRP alone. No additional tax is added to this displayed retail reference.",
      };
    case "restricted":
      return {
        status: "No general-market tax calculator",
        formula: "General liquor prices unavailable for this directory entry",
        detail: market.note,
      };
    default:
      return {
        status: "State tax formula awaiting source verification",
        formula: "No verified 2026 formula published in Drinkarto",
        detail:
          "A state-specific formula needs the beverage category, strength, pack size, taxable base, valid notification and applicable fees/margins. Blank inputs mean not published or not verified; they do not mean zero tax.",
      };
  }
}
