'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Building2, Clock3,
  Compass, Factory, Grape, Map, Search, ShieldCheck, Sparkles, Wine,
} from 'lucide-react';
import { knowledgeArticles, knowledgeCategories } from '@/content/knowledge';

type KnowledgeItem = {
  slug: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  readingTime: string;
};

const iconByCategory: Record<string, typeof BookOpen> = {
  'Styles & production': Wine,
  'Brands & buying literacy': Sparkles,
  'Brands & heritage': BookOpen,
  'Places & heritage': Map,
  'Taste & responsible use': ShieldCheck,
  'Visits & workshops': Compass,
  'Start a business': Building2,
  'Bottle & price guides': Grape,
};

const journeys = [
  { title: 'Understand the styles', detail: 'Begin with categories, raw materials and wine styles.', category: 'Styles & production', icon: Wine },
  { title: 'Follow a place or brand', detail: 'Explore heritage, protected names and producer stories.', category: 'Places & heritage', icon: Map },
  { title: 'Learn responsibly', detail: 'Taste language, context and alcohol-free ways to explore.', category: 'Taste & responsible use', icon: ShieldCheck },
  { title: 'Build a business', detail: 'Map licensing, standards and a route to market.', category: 'Start a business', icon: Factory },
];

export default function KnowledgeHub({ legacyGuides }: { legacyGuides: KnowledgeItem[] }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All topics');
  const allItems = useMemo<KnowledgeItem[]>(() => [
    ...knowledgeArticles.map((article) => ({
      slug: article.slug,
      title: article.title,
      category: article.category,
      description: article.summary,
      tags: article.tags,
      readingTime: article.readingTime,
    })),
    ...legacyGuides,
  ], [legacyGuides]);
  const visibleItems = allItems.filter((item) => {
    const categoryMatches = activeCategory === 'All topics' || item.category === activeCategory;
    const needle = query.trim().toLowerCase();
    const searchable = [item.title, item.category, item.description, ...item.tags].join(' ').toLowerCase();
    return categoryMatches && (!needle || searchable.includes(needle));
  });
  const categoryCount = (category: string) => allItems.filter((item) => item.category === category).length;

  return (
    <div className="public-container knowledge-hub">
      <section className="knowledge-hero" aria-labelledby="knowledge-title">
        <div className="knowledge-hero-copy">
          <p className="public-eyebrow"><span className="knowledge-live-dot" /> DRINKARTO KNOWLEDGE · AN ADULT LEARNING LIBRARY</p>
          <h1 id="knowledge-title">A world of spirits,<br /><em>with context.</em></h1>
          <p className="knowledge-lede">Explore the people, places, production and business behind the bottle. Follow a curiosity, compare ideas and keep the original sources close.</p>
          <a className="knowledge-scroll-link" href="#knowledge-explore">Find your path <ArrowDownRight size={16} /></a>
          <div className="knowledge-hero-meta"><span><BookOpen size={15} /> {allItems.length} field notes</span><span><ShieldCheck size={15} /> Source-linked learning</span><span><span className="adult-mark">18+</span> Adult reference</span></div>
        </div>
        <div className="knowledge-hero-art" aria-label="Illustrated map of global drinks heritage" role="img">
          <div className="knowledge-art-topline"><span>THE DRINKARTO ATLAS</span><span>FIELD NOTES · VOL. 01</span></div>
          <div className="knowledge-globe"><span className="knowledge-globe-ring ring-one" /><span className="knowledge-globe-ring ring-two" /><span className="knowledge-globe-core" /><span className="map-pin pin-scotland"><i />Scotland</span><span className="map-pin pin-france"><i />France</span><span className="map-pin pin-india"><i />India</span><span className="map-pin pin-mexico"><i />Mexico</span><span className="knowledge-globe-label">place<br />makes<br />character</span></div>
          <div className="knowledge-art-caption"><span>01 / PROVENANCE</span><strong>Where a drink begins<br />is part of its story.</strong><ArrowUpRight size={17} /></div>
          <span className="knowledge-art-coordinate">19°59′ N &nbsp; 73°47′ E</span>
        </div>
      </section>

      <section className="knowledge-journeys" id="knowledge-explore" aria-labelledby="journey-title">
        <div className="knowledge-section-head"><div><p className="public-eyebrow">CHOOSE YOUR CURIOSITY</p><h2 id="journey-title">Where would you like to begin?</h2></div><p>Four easy paths into a big subject.<br />Pick one and keep exploring.</p></div>
        <div className="knowledge-journey-grid">
          {journeys.map(({ title, detail, category, icon: Icon }, i) => (
            <button className="knowledge-journey" key={title} onClick={() => { setActiveCategory(category); document.getElementById('knowledge-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
              <span className="knowledge-journey-no">0{i + 1}</span><span className="knowledge-journey-icon"><Icon size={19} strokeWidth={1.7} /></span><span className="knowledge-journey-text"><strong>{title}</strong><small>{detail}</small></span><ArrowRight className="knowledge-journey-arrow" size={17} />
            </button>
          ))}
        </div>
      </section>

      <section className="knowledge-library" id="knowledge-library" aria-labelledby="library-title">
        <div className="knowledge-section-head knowledge-library-head"><div><p className="public-eyebrow">THE KNOWLEDGE LIBRARY</p><h2 id="library-title">Follow the thread.</h2><p className="knowledge-section-description">Browse by topic or search across categories, countries, styles and business questions.</p></div><div className="knowledge-count"><span>{visibleItems.length.toString().padStart(2, '0')}</span><small>NOTES<br />TO EXPLORE</small></div></div>
        <label className="knowledge-search"><Search size={18} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search the knowledge library" placeholder="Try “Tequila”, “Nashik”, “distributor” or “premium”…" /><span className="knowledge-search-shortcut">SEARCH</span>{query && <button type="button" className="knowledge-clear-search" onClick={() => setQuery('')} aria-label="Clear search">×</button>}</label>
        <div className="knowledge-filters" role="group" aria-label="Filter knowledge by topic">
          {knowledgeCategories.map((category) => <button type="button" key={category} className={activeCategory === category ? 'is-active' : ''} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}<span>{category === 'All topics' ? allItems.length : categoryCount(category)}</span></button>)}
        </div>
        <div className="knowledge-results-top"><p role="status">Showing <strong>{visibleItems.length}</strong> {visibleItems.length === 1 ? 'guide' : 'guides'}{activeCategory !== 'All topics' ? ` in ${activeCategory}` : ''}{query.trim() ? ` for “${query.trim()}”` : ''}</p><Link href="/dictionary">Open the A–Z dictionary <ArrowUpRight size={14} /></Link></div>
        {visibleItems.length > 0 ? <div className="knowledge-card-grid">{visibleItems.map((item, index) => {
          const Icon = iconByCategory[item.category] ?? BookOpen;
          return <Link className="knowledge-card" key={item.slug} href={`/guides/${item.slug}`}>
            <span className="knowledge-card-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="knowledge-card-icon"><Icon size={18} strokeWidth={1.7} /></span>
            <span className="knowledge-card-category">{item.category}</span>
            <h3>{item.title}</h3><p>{item.description}</p>
            <span className="knowledge-card-bottom"><span><Clock3 size={13} /> {item.readingTime}</span><span>Explore <ArrowUpRight size={14} /></span></span>
          </Link>;
        })}</div> : <div className="knowledge-empty"><BookOpen size={23} /><h3>No matching notes yet</h3><p>Try a broader word or clear your topic filter to see the full library.</p><button type="button" onClick={() => { setActiveCategory('All topics'); setQuery(''); }}>Show everything</button></div>}
      </section>

      <section className="knowledge-feature-row" aria-label="Featured learning collections">
        <Link href="/guides/visits-and-workshops" className="knowledge-feature knowledge-feature-visit"><span className="knowledge-feature-kicker"><Compass size={14} /> FIELD NOTES · VISIT & LEARN</span><strong>See how craft happens.</strong><span className="knowledge-feature-desc">Guided winery and distillery experiences, courses and workshops.</span><span className="knowledge-feature-link">Explore experiences <ArrowUpRight size={15} /></span><span className="knowledge-feature-stamp">ON<br />LOCATION</span></Link>
        <Link href="/guides/business-from-scratch" className="knowledge-feature knowledge-feature-business"><span className="knowledge-feature-kicker"><Building2 size={14} /> FIELD NOTES · FOR FOUNDERS</span><strong>Make the first move<br />a well-informed one.</strong><span className="knowledge-feature-desc">From business model to state approvals and channel partnerships.</span><span className="knowledge-feature-link">Open the founder’s path <ArrowUpRight size={15} /></span><span className="knowledge-feature-stamp">BUILD<br />LEGALLY</span></Link>
      </section>
      <p className="knowledge-disclaimer"><ShieldCheck size={15} /> Educational reference. Liquor regulations, access ages, approved activities and venue details vary by place and change over time. Always check current official sources.</p>
    </div>
  );
}
