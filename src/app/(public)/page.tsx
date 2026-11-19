import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  GitCompare,
  Layers,
} from "lucide-react";
import { WorksWheel } from "@/components/ui/works-wheel";
import { featuredBottles } from "@/content/featured-bottles";
import { profiles } from "@/content/public";
import { db } from "@/lib/db";
import { KnowledgeImage } from "@/components/knowledge-image";
import { knowledgePhotos } from "@/content/knowledge-media";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Indian liquor price references, wine and spirit guides",
  description:
    "Compare dated state liquor price references by brand and bottle size, and explore source-linked wine, spirit and responsible-use guides.",
};

export default async function Home() {
  const [snapshots, productCount] = await Promise.all([
    db.publicPriceSnapshot.findMany({select:{state:true}}),
    db.publicProduct.count(),
  ]);
  const coverage = [...new Set(snapshots.map((s) => s.state))].sort();
  const countries = coverage.join(" · ");

  return (
    <>
      <section className="editorial-hero public-container">
        <div className="editorial-hero-copy">
          <p className="public-eyebrow">
            THE INDEPENDENT INDIAN DRINKS REFERENCE
          </p>
          <h1>
            Know the bottle.
            <br />
            <em>Understand the price.</em>
          </h1>
          <p className="editorial-deck">
            Look up published bottle prices across India, compare styles, and read the stories behind the labels.
          </p>
          <div className="public-hero-actions">
            <Link href="/prices" className="public-button">
              Check bottle prices <ArrowUpRight size={18} />
            </Link>
            <Link href="/guides" className="editorial-link">
              Find your next read <ArrowRight size={17} />
            </Link>
          </div>

        </div>
        <div className="editorial-still-life discovery-art">
          <svg viewBox="0 0 520 580" role="img" aria-labelledby="reference-art-title reference-art-desc">
            <title id="reference-art-title">A world of references, brought together</title>
            <desc id="reference-art-desc">An original illustration of floating source records, a flavour compass and a recipe notebook connected by fine lines. Decorative documents contain no price data.</desc>
            <defs><linearGradient id="paper-light" x2="1" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#d9e7f4"/></linearGradient><pattern id="reference-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#ffffff" strokeOpacity=".07"/></pattern></defs>
            <rect width="520" height="580" fill="url(#reference-grid)"/>
            <circle cx="260" cy="284" r="166" fill="none" stroke="#93b9ed" strokeOpacity=".2"/>
            <circle cx="260" cy="284" r="116" fill="none" stroke="#93b9ed" strokeOpacity=".3" strokeDasharray="3 9"/>
            <path d="M110 180Q330 110 406 357M125 414Q147 224 379 188" fill="none" stroke="#b2cced" strokeWidth="1.5" strokeDasharray="5 7"/>
            <g transform="translate(61 109) rotate(-10 90 95)">
              <rect x="8" y="9" width="174" height="190" rx="18" fill="#071a35" opacity=".25"/>
              <rect width="174" height="190" rx="18" fill="url(#paper-light)"/>
              <text x="20" y="33" fill="#375675" fontSize="10" letterSpacing="2">THE PRICE RECORD</text>
              <path d="M20 52H154" stroke="#a3b5c9"/>
              <rect x="20" y="75" width="56" height="7" rx="3" fill="#264e7d"/>
              <path d="M20 103H144M20 128H144M20 153H110" stroke="#96abc3" strokeWidth="5" strokeLinecap="round"/>
              <circle cx="139" cy="153" r="12" fill="#b7342c"/>
              <path d="m134 153 4 4 7-9" fill="none" stroke="white" strokeWidth="2"/>
            </g>
            <g transform="translate(294 286) rotate(12 80 90)">
              <rect x="7" y="8" width="161" height="186" rx="17" fill="#071a35" opacity=".25"/>
              <rect width="161" height="186" rx="17" fill="#b6cdef"/>
              <path d="M21 0V186" stroke="#7c9dcb"/>
              <text x="38" y="32" fill="#18365e" fontSize="10" letterSpacing="2">FIELD NOTES</text>
              <circle cx="91" cy="90" r="33" fill="none" stroke="#456b99"/>
              <path d="M91 57V123M58 90H124M68 67 114 113M68 113 114 67" stroke="#456b99"/>
              <circle cx="91" cy="90" r="9" fill="#b7342c"/>
              <path d="M39 145H132M39 157H110" stroke="#7899c4" strokeWidth="4" strokeLinecap="round"/>
            </g>
            <g transform="translate(193 234)">
              <circle cx="67" cy="67" r="70" fill="#091c37" opacity=".25"/>
              <circle cx="67" cy="60" r="62" fill="#f4f6f8"/>
              <circle cx="67" cy="60" r="48" fill="none" stroke="#c4cfdb"/>
              <path d="m67 21 13 39-13 39-13-39Z" fill="#183d69"/>
              <path d="m67 21 13 39H67Z" fill="#bc3930"/>
              <circle cx="67" cy="60" r="5" fill="#fff"/>
            </g>
            <circle cx="393" cy="159" r="7" fill="#bf3b32"/><circle cx="124" cy="407" r="6" fill="#accbf3"/>
            <text x="260" y="529" textAnchor="middle" fill="#c5d7f0" fontSize="11" letterSpacing="3">CURIOSITY. WITH A SOURCE.</text>
          </svg>
        </div>
      </section>
      <div
        className="reference-ledger public-container"
        aria-label="Reference coverage"
      >
        <div>
          <span>01 / STATE PRICES</span>
          <strong>{coverage.length} states with imported references</strong>
        </div>
        <div>
          <span>02 / THE LIBRARY</span>
          <strong>
            {productCount.toLocaleString("en-IN")} reference identities
          </strong>
        </div>
        <div>
          <span>03 / OUR APPROACH</span>
          <Link href="/guides/price-sources">
            Sources you can follow <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <section
        className="public-container public-section home-bottle-edit"
        id="prices"
      >
        <div className="public-section-heading">
          <div>
            <p className="public-eyebrow">THE BOTTLE EDIT</p>
            <h2>The bottle collection</h2>
            <p>
              Turn the collection to explore photographed bottles. Find their
              published references in StateLens.
            </p>
          </div>
          <Link href="/prices" className="public-text-link">
            Compare state prices <ArrowUpRight size={16} />
          </Link>
        </div>
        <WorksWheel
          items={featuredBottles}
          label="The bottle edit."
          action="Explore references"
        />

      </section>
      <section
        className="public-container editorial-gallery-section"
        aria-labelledby="editorial-gallery-heading"
      >
        <div className="public-section-heading">
          <div>
            <p className="public-eyebrow">PHOTOGRAPHED CONTEXT</p>
            <h2 id="editorial-gallery-heading">
              Places, ingredients and production
            </h2>
            <p>
              Each photograph identifies its own source and depicts the named
              place or process—not every brand or bottle in a category.
            </p>
          </div>
          <Link href="/guides" className="public-text-link">
            Explore the knowledge library <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="press-feature-grid">
          <article className="editorial-gallery-item">
            <KnowledgeImage
              photo={knowledgePhotos.wineGrapes}
              className="editorial-gallery-photo"
              sizes="(max-width: 700px) 100vw, 33vw"
            />
            <div>
              <h3>Wine grapes in Baja California</h3>
              <Link href="/guides/wine-styles-map">
                Explore wine styles <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>
          <article className="editorial-gallery-item">
            <KnowledgeImage
              photo={knowledgePhotos.casks}
              className="editorial-gallery-photo"
              sizes="(max-width: 700px) 100vw, 33vw"
            />
            <div>
              <h3>The Glenmorangie Distillery maturation warehouse</h3>
              <Link href="/guides/scotch-heritage">
                Read the Scotch heritage guide <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>
          <article className="editorial-gallery-item">
            <KnowledgeImage
              photo={knowledgePhotos.feni}
              className="editorial-gallery-photo"
              sizes="(max-width: 700px) 100vw, 33vw"
            />
            <div>
              <h3>Traditional cashew feni distillation in Goa</h3>
              <Link href="/guides/goa-feni-heritage">
                Learn about Goa Feni <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>
        </div>
      </section>
      <section className="public-business-strip public-container">
        <div>
          <p className="public-eyebrow">DRINKARTO FOR BUSINESS</p>
          <h3>
            Inventory, orders and reporting.
            <br />
            One operational workspace.
          </h3>
          <p>Tools for beverage distribution teams.</p>
        </div>
        <div className="business-actions">
          <Link href="/business" className="public-button">
            Explore business tools <ArrowUpRight size={16} />
          </Link>
          <Link href="/pricing" className="public-text-link">
            View proposed pricing
          </Link>
        </div>
      </section>
    </>
  );
}
