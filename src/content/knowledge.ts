export type KnowledgeSource = { label: string; url: string };
export type KnowledgeSection = { heading: string; body: string };
export type KnowledgeArticle = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  readingTime: string;
  tags: string[];
  sections: KnowledgeSection[];
  sources: KnowledgeSource[];
  note?: string;
};

const source = {
  spirits: { label: 'WSET · Spirits education', url: 'https://www.wsetglobal.com/qualifications/wset-level-1-award-in-spirits' },
  wine: { label: 'WSET · Wine styles', url: 'https://www.wsetglobal.com/knowledge-centre/blog/2023/october/03/how-many-wine-types-and-styles-are-there/' },
  tasting: { label: 'WSET · Tasting skills', url: 'https://www.wsetglobal.com/knowledge-centre/blog/2019/november/how-to-build-your-wine-tasting-skills/' },
  scotch: { label: 'Scotch Whisky Association · Story of Scotch', url: 'https://www.scotch-whisky.org.uk/discover-scotch/story-of-scotch/' },
  suntory: { label: 'The House of Suntory · Heritage', url: 'https://house.suntory.com/heritage' },
  tequila: { label: 'Consejo Regulador del Tequila · Denomination of Origin', url: 'https://www.crt.org.mx/tequila-denominacion-de-origen/' },
  cognac: { label: 'BNIC · Official Cognac appellation site', url: 'https://www.cognac.fr/en/' },
  champagne: { label: 'Comité Champagne · The designation', url: 'https://www.champagne.fr/en/about-champagne/a-great-blended-wine/champagne-designation' },
  port: { label: 'Instituto dos Vinhos do Douro e do Porto', url: 'https://www.ivdp.pt/en' },
  feni: { label: 'IP India · Registered Feni GI', url: 'https://search.ipindia.gov.in/GIRPublicSearch/Application/Details/120' },
  sula: { label: 'Sula Vineyards · Visit and tastings', url: 'https://sulavineyards.com/visit-us.php' },
  glendronach: { label: 'The GlenDronach · Distillery visits', url: 'https://www.glendronachdistillery.com/our-distillery/' },
  nsws: { label: 'Government of India · National Single Window System', url: 'https://www.nsws.gov.in/' },
  nswsFaq: { label: 'NSWS · Approval guidance and limits', url: 'https://www.nsws.gov.in/faqs' },
  goa: { label: 'Goa Excise · Licence services', url: 'https://excise.goa.gov.in/licences_services.aspx' },
  goaProcess: { label: 'Goa Excise · Application procedures', url: 'https://excise.goa.gov.in/Procedure.aspx' },
  fssai: { label: 'FSSAI · Alcoholic beverages standards', url: 'https://fssai.gov.in/standards/product-standards?pr=1' },
  fssaiNotices: { label: 'FSSAI · Current regulations and amendments', url: 'https://fssai.gov.in/food-law/notifications?notification=ordinary-notification' },
  who: { label: 'WHO · Alcohol fact sheet', url: 'https://www.who.int/en/news-room/fact-sheets/detail/alcohol' },
  priceSources: { label: 'Drinkarto · State price source directory', url: '/prices' },
} satisfies Record<string, KnowledgeSource>;

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    slug: 'spirit-families', title: 'A field guide to spirit families', category: 'Styles & production', summary: 'Start with the raw material and method. Learn what separates whisky, rum, gin, vodka, brandy and agave spirits.', readingTime: '5 min', tags: ['category', 'whisky', 'rum', 'gin', 'vodka', 'brandy', 'tequila', 'production'],
    sections: [
      { heading: 'Begin with what is fermented', body: 'Whisky starts from grain; rum from sugar-cane materials; brandy from wine or other fermented fruit; and agave spirits from agave. Gin is defined by juniper-led botanical character. Vodka is generally made for a more restrained flavour profile. Product rules and names vary by place, so the category on the label matters.' },
      { heading: 'Distillation is only one part of the story', body: 'Raw materials, fermentation, still design, blending, filtration, maturation and local rules all shape a finished bottle. An unaged spirit and an aged expression from the same family can feel very different.' },
      { heading: 'Use the label as your starting point', body: 'Check category, origin, producer, volume and alcohol strength before comparing bottles. Brand names can cover several different categories and recipes.' },
    ], sources: [source.spirits, source.scotch, source.tequila],
  },
  {
    slug: 'wine-styles-map', title: 'Wine styles: still, sparkling, rosé and fortified', category: 'Styles & production', summary: 'A clear map of wine styles, grapes and sweetness terms—without treating colour as a taste guarantee.', readingTime: '4 min', tags: ['wine', 'category', 'grapes', 'sweetness', 'sparkling', 'rosé'],
    sections: [
      { heading: 'Style is broader than colour', body: 'Still, sparkling and fortified describe different production or structure cues. Red, white and rosé describe appearance. Within each, the grape, climate, winemaking choices and producer create a wide range of expressions.' },
      { heading: 'A grape is not a fixed flavour', body: 'Cabernet Sauvignon, Pinot Noir, Chardonnay and Riesling are useful starting points, not guarantees. Climate, harvest, fermentation, maturation and vintage can change the result.' },
      { heading: 'Sweetness is a separate question', body: 'A wine can smell of ripe fruit yet taste dry. Look for a specific sweetness term and use the producer’s information where available.' },
    ], sources: [source.wine, source.tasting],
  },
  {
    slug: 'premium-bottle', title: 'What “premium” can—and cannot—tell you', category: 'Brands & buying literacy', summary: 'Price, age statements, packaging and awards are signals to investigate, not a universal quality score.', readingTime: '4 min', tags: ['premium', 'brands', 'price', 'age', 'labels', 'quality'],
    sections: [
      { heading: 'Premium is not one global grade', body: 'The word is used differently by producers, retailers and markets. A higher price may reflect production time, scarce materials, packaging, tax, import costs or brand positioning. It does not by itself prove that a bottle will suit your taste.' },
      { heading: 'Compare like with like', body: 'Compare the same category, size, strength, market and release. Check the label for an age statement, origin claim, batch or edition information and any official certification.' },
      { heading: 'Treat awards and stories as clues', body: 'Read who gave an award, in which year and for which exact product. For protected names such as Champagne, Cognac, Scotch whisky or Tequila, verify the claim with the relevant official body.' },
    ], sources: [source.priceSources, source.scotch, source.cognac, source.champagne, source.tequila],
  },
  {
    slug: 'scotch-heritage', title: 'Scotch whisky: a record is not an inventor', category: 'Places & heritage', summary: 'The 1494 Scottish record names Friar John Cor, but it does not mean one person invented whisky.', readingTime: '4 min', tags: ['Scotland', 'Scotch', 'whisky', 'heritage', 'history', 'brands'],
    sections: [
      { heading: 'What the historic record says', body: 'The Scotch Whisky Association describes a 1494 entry in Scotland’s Exchequer Rolls: malt was supplied to Friar John Cor to make aqua vitae. It is an early documented record of distilling in Scotland—not proof that Cor invented whisky or that distilling began then.' },
      { heading: 'Place shapes the story', body: 'Scotch is a protected place-linked category with defined production requirements. The producer, maturation choices and regional context all matter; a region name is not a simple flavour guarantee.' },
      { heading: 'How to read the family tree', body: 'Single malt, single grain, blended malt, blended grain and blended Scotch are category terms with specific meanings. Read the official category definitions before using them to compare bottles.' },
    ], sources: [source.scotch],
  },
  {
    slug: 'japanese-whisky-heritage', title: 'Japan: Yamazaki and the early whisky chapter', category: 'Brands & heritage', summary: 'A brand-led history of Suntory, Shinjiro Torii and the Yamazaki distillery near Kyoto.', readingTime: '4 min', tags: ['Japan', 'Japanese whisky', 'Suntory', 'Yamazaki', 'brand', 'heritage'],
    sections: [
      { heading: 'A documented beginning', body: 'The House of Suntory dates the start of Yamazaki distillery construction to 1923 and credits founder Shinjiro Torii with pursuing a whisky shaped by Japanese ingredients, water, climate and taste.' },
      { heading: 'A brand is one window into a country', body: 'Yamazaki is one important producer story, not the whole history of Japanese whisky. Compare distilleries, blending approaches and the label’s origin statement rather than assuming all bottles share one style.' },
      { heading: 'Follow the maker’s own record', body: 'Company timelines are useful primary sources for a brand’s milestones. Pair them with independent category rules and the exact bottle label when researching what is in a bottle.' },
    ], sources: [source.suntory],
  },
  {
    slug: 'tequila-origin', title: 'Mexico: Tequila is a protected place name', category: 'Places & heritage', summary: 'Learn why agave spirit, Tequila and other agave categories are not interchangeable terms.', readingTime: '4 min', tags: ['Mexico', 'Tequila', 'agave', 'origin', 'heritage', 'category'],
    sections: [
      { heading: 'Origin is part of the definition', body: 'The Tequila Regulatory Council describes the protected designation and the Mexican states within its defined production territory. The name is tied to specified geography, raw material and production rules.' },
      { heading: 'Agave spirits are a wider family', body: '“Agave spirit” is a broad description. Tequila is a particular regulated category; other agave spirits may have different names, traditions and production requirements.' },
      { heading: 'Check what the bottle actually claims', body: 'Look for the official category, producer details and applicable certification marks. Avoid assuming that every bottle made from agave qualifies as Tequila.' },
    ], sources: [source.tequila],
  },
  {
    slug: 'france-cognac-champagne', title: 'France: Cognac and Champagne, two protected origins', category: 'Places & heritage', summary: 'One country, two distinct appellations: a grape spirit from Charente and a sparkling wine from a defined region.', readingTime: '5 min', tags: ['France', 'Cognac', 'Champagne', 'wine', 'brandy', 'origin', 'heritage'],
    sections: [
      { heading: 'Cognac is a place-linked spirit', body: 'The BNIC describes Cognac as a controlled designation of origin. Its name is linked to a delimited region and production specifications; “brandy” is a broader family term.' },
      { heading: 'Champagne is not a synonym for sparkling wine', body: 'The Comité Champagne explains that the Champagne designation protects a defined geographical area and its production rules. Other sparkling wines are not Champagne simply because they use bubbles or a similar method.' },
      { heading: 'Why origin rules matter', body: 'Protected designations connect a product name to place and specifications. When a label uses a famous place name, check the relevant official body rather than relying on packaging or price.' },
    ], sources: [source.cognac, source.champagne],
  },
  {
    slug: 'port-douro', title: 'Portugal: Port and the Douro Valley', category: 'Places & heritage', summary: 'Follow a fortified wine name back to the Douro, a landscape and regulated wine region in Portugal.', readingTime: '3 min', tags: ['Portugal', 'Port', 'Douro', 'fortified wine', 'origin', 'heritage'],
    sections: [
      { heading: 'A name grounded in a region', body: 'The Instituto dos Vinhos do Douro e do Porto describes Port as a protected designation of origin produced in the Douro Demarcated Region.' },
      { heading: 'Fortified does not mean one sweetness level', body: 'Port is a family of styles. The colour, age designation and producer’s style provide more useful clues than assuming every fortified wine is alike.' },
      { heading: 'Explore the place behind the bottle', body: 'A regional wine story includes landscape, grapes, producers and the rules governing the name. Origin is a useful starting point, not a complete tasting note.' },
    ], sources: [source.port, source.wine],
  },
  {
    slug: 'goa-feni-heritage', title: 'India: Feni and Goa’s registered heritage', category: 'Places & heritage', summary: 'Explore Feni through its registered geographical indication and the place attached to the name.', readingTime: '4 min', tags: ['India', 'Goa', 'Feni', 'heritage', 'country', 'origin'],
    sections: [
      { heading: 'A registered geographical indication', body: 'IP India’s public register lists Feni as a registered GI with Goa as its geographical area. The register is the place to confirm the status and the registered specification.' },
      { heading: 'Cashew and coconut expressions', body: 'Goa has separate registered entries for Cashew Feni and Goan Coconut Feni. Read the exact product name and producer details rather than treating all local spirits as the same style.' },
      { heading: 'Heritage with a legal dimension', body: 'A geographical indication connects a product to a place and defined specifications. It does not mean every bottle using a similar informal name has the same status.' },
    ], sources: [source.feni, { label: 'IP India · Goan Coconut Feni GI', url: 'https://search.ipindia.gov.in/GIRPublicSearch/Application/Details/615' }],
  },
  {
    slug: 'sula-nashik-brand-story', title: 'Sula and Nashik: an Indian wine brand story', category: 'Brands & heritage', summary: 'A look at one producer’s Nashik beginnings, visitor programme and wine education offerings.', readingTime: '4 min', tags: ['India', 'Nashik', 'Sula', 'wine', 'brand', 'visit', 'workshop'],
    sections: [
      { heading: 'A brand story rooted in place', body: 'Sula’s own company history describes founder Rajeev Samant’s move to develop wine grapes in Nashik in the 1990s. Treat this as the producer’s account and pair it with broader information about Indian wine regions.' },
      { heading: 'Learn through a guided visit', body: 'Sula currently publishes winery tours and tasting information for its visitor locations. These are guided, venue-based experiences; age, availability, timings and prices can change, so check the live booking page before travel.' },
      { heading: 'Formal study is a separate path', body: 'Sula also lists WSET wine courses. Confirm the course calendar and provider status directly with the venue before booking.' },
    ], sources: [source.sula, { label: 'Sula · Wine courses', url: 'https://sulavineyards.com/wine-courses.php' }, { label: 'Sula · Company story', url: 'https://sulavineyards.com/visittours.aspx' }],
  },
  {
    slug: 'brand-story-method', title: 'How to research a liquor brand well', category: 'Brands & buying literacy', summary: 'Trace the producer, place, date, product variant and source behind a brand story.', readingTime: '3 min', tags: ['brands', 'producer', 'heritage', 'research', 'label'],
    sections: [
      { heading: 'Start with the exact bottle', body: 'Write down the full brand and variant name, category, producer, bottler, origin, volume, alcohol strength and edition. Different expressions can share a master brand name.' },
      { heading: 'Separate history from marketing', body: 'A founding date, family story or award is a claim to verify. Look for company archives, official appellation bodies or government registers. Record whether a source is a producer, regulator or independent educator.' },
      { heading: 'Keep a citation trail', body: 'Save the URL and the date you checked it. For changing visitor offerings, prices or availability, link to the live provider page instead of copying a static amount.' },
    ], sources: [source.suntory, source.scotch, source.feni],
  },
  {
    slug: 'sensory-tasting-framework', title: 'A thoughtful way to describe taste', category: 'Taste & responsible use', summary: 'Use appearance, aroma, flavour, texture and finish as descriptive prompts—not ratings.', readingTime: '4 min', tags: ['taste', 'aroma', 'tasting', 'consumption', 'sensory', 'notes'],
    sections: [
      { heading: 'Describe before you judge', body: 'Notice appearance, aroma, flavour, texture and finish. Use simple words—citrus, spice, floral, dry, creamy, light or lingering—and allow your impression to differ from a tasting card.' },
      { heading: 'Keep aroma separate from sweetness', body: 'A drink that smells of fruit is not necessarily sweet. Body, acidity, tannin, alcohol warmth and perceived sweetness are different observations.' },
      { heading: 'Compare conditions fairly', body: 'For learning, compare one variable at a time: same category, similar serving conditions and clearly measured samples. Tasting is optional; reading labels and aroma descriptions can be a non-alcoholic learning activity.' },
    ], sources: [source.tasting, source.spirits],
    note: 'Alcohol carries health risks. This is a sensory vocabulary guide, not a recommendation to drink or a safe-consumption limit.',
  },
  {
    slug: 'responsible-use-learning', title: 'Responsible use belongs in the story', category: 'Taste & responsible use', summary: 'Understand risk, keep learning content adult-focused and choose alcohol-free participation when appropriate.', readingTime: '3 min', tags: ['responsible', 'health', 'consumption', 'safety', '18+', 'zero-proof'],
    sections: [
      { heading: 'No health benefit is promised here', body: 'The World Health Organization states that no form of alcohol consumption is risk-free. Drinkarto does not present alcohol as a health product or prescribe a safe amount.' },
      { heading: 'Some situations call for no alcohol', body: 'Do not drink and drive or operate machinery. People who are pregnant, taking medication, managing a health condition or unsure about personal risk should avoid alcohol and seek qualified health advice.' },
      { heading: 'Learning can be alcohol-free', body: 'Explore production, history, labels, glassware and aroma vocabulary without drinking. Our recipe library also includes zero-proof options.' },
    ], sources: [source.who],
    note: 'Drinkarto is an educational reference for adults. Access age, possession and service rules vary by jurisdiction; follow local law.',
  },
  {
    slug: 'visits-and-workshops', title: 'Where to learn in person: tours, tastings and workshops', category: 'Visits & workshops', summary: 'Find supervised visitor experiences—from winery tours to distillery education—and verify age and booking rules.', readingTime: '4 min', tags: ['visit', 'tour', 'workshop', 'India', 'Nashik', 'Scotland', 'distillery', 'winery', 'course'],
    sections: [
      { heading: 'India: winery tours and wine education', body: 'Sula publishes guided tours, tastings and wine-course information for Nashik and other venues. Check dates, age conditions, current format and booking details on the provider’s live pages.' },
      { heading: 'Scotland: production tours and masterclasses', body: 'The GlenDronach visitor centre lists distillery tours, tasting experiences and a cocktail masterclass. Its visitor page sets the current age and reservation conditions; offerings can change.' },
      { heading: 'What a responsible workshop looks like', body: 'Choose an authorized venue with clear supervision, a published curriculum and transparent age requirements. Learn blending, sensory language, fermentation or history in a legal facility. Do not attempt unlicensed distillation at home.' },
    ], sources: [source.sula, source.glendronach],
    note: 'Examples are official provider pages checked while preparing this guide. Confirm availability, legal-age requirements, travel conditions and prices directly before booking.',
  },
  {
    slug: 'business-from-scratch', title: 'Start a liquor business: map the route before spending', category: 'Start a business', summary: 'A practical first map for founders. Choose a business model, market and approvals path before signing a lease or buying equipment.', readingTime: '7 min', tags: ['business', 'startup', 'manufacturing', 'distillery', 'license', 'licence', 'founder', 'India'],
    sections: [
      { heading: '1. Choose the activity and the market', body: 'Decide whether the business will manufacture, bottle, own a brand and contract manufacture, import, distribute, wholesale, retail or serve on-premise. List every state or union territory where the activity will happen; a permission in one place is not a nationwide authorization.' },
      { heading: '2. Check approvals before committing capital', body: 'Use the National Single Window System’s Know Your Approvals journey where available, then confirm each requirement with the relevant state or union-territory excise authority. NSWS describes KYA as indicative guidance and says the issuing authority makes the final decision.' },
      { heading: '3. Validate premises and product rules', body: 'Depending on the business, investigate excise permissions, food-safety standards, product and label approvals, land use, fire safety, pollution/environmental clearances, bonded storage, movement permits, tax registrations and local trade permissions. Which ones apply—and in what order—depends on the activity and location.' },
      { heading: '4. Build a compliant operating plan', body: 'Model licence costs and renewals, duty and tax, traceability, records, authorized sourcing, storage, age-restricted sales, transport and marketing restrictions. Have an India-qualified liquor-regulatory lawyer and accountant review the plan before financial commitments.' },
    ], sources: [source.nsws, source.nswsFaq, source.fssai, source.goa],
    note: 'This is a learning map, not legal, tax or investment advice and not an exhaustive checklist. Laws, policies, application windows and fees change by jurisdiction. Confirm current requirements with the competent authority and professional advisers.',
  },
  {
    slug: 'license-pathways-india', title: 'Licences in India: why the state and activity come first', category: 'Start a business', summary: 'Manufacturing, wholesale, retail, import and on-premise service can follow different excise pathways.', readingTime: '6 min', tags: ['license', 'licence', 'state', 'excise', 'government', 'India', 'permit', 'wholesale', 'retail'],
    sections: [
      { heading: 'The route depends on what you do', body: 'For example, Goa Excise publishes separate licence categories covering manufacturing, wholesale, packaged retail, on-premise retail, bonded storage and movement of excisable goods. Other states use their own Acts, rules, product categories, fee structures and application windows.' },
      { heading: 'Start with official approval discovery', body: 'The Government of India’s National Single Window System can help identify central and participating state approvals. Its KYA results depend on user input and are guidance; the responsible government department remains the approval authority.' },
      { heading: 'Confirm requirements in writing', body: 'Ask the relevant excise department which licence applies to your exact activity, premises, product, ownership arrangement and territory. Confirm fees, security deposits, eligibility, documents, public notices, timelines, renewals, label registrations and transfer or change-of-control rules.' },
      { heading: 'Food standards are another layer', body: 'FSSAI publishes alcoholic-beverage standards and amendments. Check the latest regulations and the relevant licensing route alongside—not in place of—state excise approvals.' },
    ], sources: [source.nsws, source.nswsFaq, source.goa, source.goaProcess, source.fssai, source.fssaiNotices],
    note: 'Do not rely on an old checklist, another state’s licence names or a third-party summary. Verify the latest notification and seek qualified local legal advice.',
  },
  {
    slug: 'become-distributor-partner', title: 'Become a brand partner or distributor', category: 'Start a business', summary: 'Build a credible pitch, confirm authority and territory, and make sure every distribution step is licensed.', readingTime: '6 min', tags: ['partner', 'distributor', 'distribution', 'brand', 'wholesale', 'business', 'license', 'licence'],
    sections: [
      { heading: 'Prepare a market case', body: 'Describe your territory, channel relationships, storage and transport capability, proposed portfolio, sales plan, financial capacity and compliance experience. Ask the brand owner which entities are authorized to appoint local partners.' },
      { heading: 'Verify the commercial agreement', body: 'Document territory, exclusivity, products, minimum orders, pricing, marketing rights, stock ownership, payment terms, targets, recalls, regulatory costs, data access, renewals and termination. Get independent advice before signing.' },
      { heading: 'Licensing remains separate from the contract', body: 'A brand appointment does not itself grant permission to import, warehouse, move, wholesale, retail or sell alcoholic beverages. Confirm the exact excise and other approvals required in each operating jurisdiction.' },
      { heading: 'Use official portals to check your path', body: 'Start with NSWS KYA where supported and then work directly with the state excise department. The government portal itself says that approval requirements depend on the information entered and the issuing authority decides the application.' },
    ], sources: [source.nsws, source.nswsFaq, source.goa, source.fssai],
    note: 'Drinkarto is not a licensing intermediary and does not certify distributors, brands or business opportunities.',
  },
  {
    slug: 'fssai-and-product-labels', title: 'Product standards and labels: the FSSAI layer', category: 'Start a business', summary: 'Food-safety rules for alcoholic beverages sit alongside state excise and market-entry requirements.', readingTime: '5 min', tags: ['FSSAI', 'labels', 'standards', 'business', 'license', 'licence', 'India', 'compliance'],
    sections: [
      { heading: 'Read the current primary text', body: 'FSSAI publishes the Alcoholic Beverages Regulations and an amendments feed. Review the original regulations and all later Gazette notifications for your product, label and market before production or import.' },
      { heading: 'Check the exact product and claim', body: 'Category names, ingredients, alcohol declaration, warnings, product claims and packaging requirements can differ. Do not reuse a label from another product or rely on an old template.' },
      { heading: 'Coordinate central and state checks', body: 'FSSAI food standards do not replace state excise permissions, local brand or label registration, duties, import permits or movement controls. Build a compliance matrix for each product and each sales territory.' },
    ], sources: [source.fssai, source.fssaiNotices, source.nswsFaq],
    note: 'Confirm current rules with FSSAI, the state excise authority and a qualified regulatory professional. This overview is not a legal opinion.',
  },
];

export const knowledgeCategories = [
  'All topics',
  'Styles & production',
  'Brands & buying literacy',
  'Brands & heritage',
  'Places & heritage',
  'Taste & responsible use',
  'Visits & workshops',
  'Start a business',
] as const;
