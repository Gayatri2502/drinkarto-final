import Link from "next/link";
import Image from "next/image";
import ScrollingCards from "@/components/ui/scrolling-cards";
import Reveal from "@/components/ui/reveal";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  GitCompare,
  Layers,
  ShieldCheck,
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
    db.publicPriceSnapshot.findMany(),
    db.publicProduct.count(),
  ]);
  const coverage = [...new Set(snapshots.map((s) => s.state))].sort();
  const countries = coverage.join(" · ");

  return (
    <>
      <section className="editorial-hero public-container">
        <Reveal className="editorial-hero-copy">
          <p className="public-eyebrow">
            THE INDEPENDENT INDIAN DRINKS REFERENCE
          </p>
          <h1>
            Good taste.
            <br />
            <em>Better informed.</em>
          </h1>
          <p className="editorial-deck">
            A bottle is more than its label. Explore its story, understand its
            style, and see how its published price changes across India.
          </p>
          <div className="public-hero-actions">
            <Link href="/prices" className="public-button">
              Explore StateLens <ArrowUpRight size={18} />
            </Link>
            <Link href="/guides" className="editorial-link">
              Find your next read <ArrowRight size={17} />
            </Link>
          </div>
          <div className="editorial-source">
            <ShieldCheck size={17} />
            <span>
              Independent information. Linked sources. No online sales.
            </span>
          </div>
        </Reveal>
        <Reveal className="editorial-still-life" index={1}>
          <span className="still-life-number" aria-hidden="true">
            01 / THE BOTTLE EDIT
          </span>
          <span className="still-life-word" aria-hidden="true">
            spirit.
          </span>
          <Image
            src={featuredBottles[0].image}
            alt={featuredBottles[0].alt}
            width={440}
            height={620}
            priority
            className="still-life-bottle"
          />
          <div className="still-life-caption">
            <span>BOTANICAL / SCOTLAND</span>
            <strong>Hendrick’s Gin</strong>
            <Link href={featuredBottles[0].href}>
              Explore the reference <ArrowUpRight size={15} />
            </Link>
          </div>
          <details className="still-life-credit">
            <summary>Photo credit</summary>
            <p>
              {featuredBottles[0].credit.author} ·{" "}
              <a href={featuredBottles[0].credit.source}>Source</a> ·{" "}
              <a href={featuredBottles[0].credit.licenseUrl}>
                {featuredBottles[0].credit.license}
              </a>
            </p>
          </details>
        </Reveal>
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
            <h2>A different turn. A new discovery.</h2>
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
        <p className="public-source-line">
          Price coverage: {countries || "no state feeds yet"}. Featured
          photography does not confirm local listings or availability.
        </p>
      </section>
      <Reveal>
        <section className="professional-knowledge">
          <div className="public-container public-section">
            <div className="public-section-heading">
              <div>
                <p className="public-eyebrow">KNOWLEDGE LIBRARY</p>
                <h2>Understand what distinguishes a liquor.</h2>
              </div>
              <Link href="/guides" className="public-text-link">
                Browse guides <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="professional-resource-grid">
              {[
                {
                  Icon: BookOpen,
                  title: "Terminology & categories",
                  text: "A concise alphabetical reference to production, ingredients and the terms found on a bottle label.",
                  href: "/dictionary",
                  cta: "Open the dictionary",
                },
                {
                  Icon: Layers,
                  title: "Style & taste profiles",
                  text: "Understand body, sweetness, acidity and common flavour descriptions across wine and spirit styles.",
                  href: "/taste",
                  cta: "Explore taste profiles",
                },
                {
                  Icon: GitCompare,
                  title: "Side-by-side comparisons",
                  text: "Compare characteristics across two styles, with clear descriptions and educational source references.",
                  href: "/compare",
                  cta: "Compare styles",
                },
              ].map(({ Icon, title, text, href, cta }) => (
                <Link key={href} href={href} className="professional-resource">
                  <Icon size={22} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span>
                    {cta}
                    <ArrowUpRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
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
        <ScrollingCards label="places and production">
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
        </ScrollingCards>
      </section>
      <section className="public-container public-section">
        <div className="public-section-heading">
          <div>
            <p className="public-eyebrow">WINE REFERENCE</p>
            <h2>Wine styles at a glance</h2>
            <p>
              Descriptive style references. Individual bottles vary by producer,
              region and vintage.
            </p>
          </div>
          <Link href="/wines" className="public-text-link">
            Wine library <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="professional-wines">
          {profiles
            .filter((p) => ["cabernet", "sauvignon", "rose"].includes(p.id))
            .map((p) => (
              <Link key={p.id} href={"/wines#" + p.id}>
                <span className="wine-category">{p.family}</span>
                <h3>{p.name}</h3>
                <p>{p.notes.slice(0, 2).join(" · ")}</p>
                <div>
                  <span>Body: {p.body}</span>
                  <ArrowUpRight size={17} />
                </div>
              </Link>
            ))}
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
