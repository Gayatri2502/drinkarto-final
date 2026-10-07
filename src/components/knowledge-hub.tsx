'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { KnowledgeImage } from '@/components/knowledge-image';
import {
  ArrowRight, ArrowUpRight, BookOpen, Building2, Clock3, Compass,
  Factory, Grape, LayoutDashboard, Map, MapPin, Search, ShieldCheck,
  Sparkles, Wine,
} from 'lucide-react';
import { knowledgeArticles, knowledgeCategories } from '@/content/knowledge';
import { knowledgePhotoFor, knowledgePhotos } from '@/content/knowledge-media';

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

const categoryDescriptions: Record<string, string> = {
  'Styles & production': 'Ingredients, methods and how styles differ.',
  'Brands & buying literacy': 'Read labels and understand brand signals.',
  'Brands & heritage': 'Producer stories, people and milestones.',
  'Places & heritage': 'Regions, protected names and local traditions.',
  'Taste & responsible use': 'Sensory language and adult-first context.',
  'Visits & workshops': 'Find tours, courses and ways to learn in person.',
  'Start a business': 'Map approvals, standards and distribution.',
  'Bottle & price guides': 'Bottle details and how to read price references.',
};

const featuredSlugs = ['spirit-families', 'goa-feni-heritage', 'business-from-scratch'];

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
  const categoryCount = (category: string) => category === 'All topics'
    ? allItems.length
    : allItems.filter((item) => item.category === category).length;
  const featuredItems = featuredSlugs
    .map((slug) => allItems.find((item) => item.slug === slug))
    .filter((item): item is KnowledgeItem => Boolean(item));

  const chooseCategory = (category: string) => {
    setActiveCategory(category);
    document.getElementById('knowledge-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="public-container knowledge-dashboard">
      <aside className="knowledge-sidebar" aria-label="Knowledge navigation">
        <Link href="/guides" className="knowledge-sidebar-brand" aria-label="Drinkarto Knowledge home">
          <span className="knowledge-sidebar-mark"><Sparkles size={18} /></span>
          <span><strong>DRINKARTO</strong><small>KNOWLEDGE DESK</small></span>
        </Link>

        <p className="knowledge-sidebar-label">LEARN</p>
        <nav className="knowledge-side-nav" aria-label="Learning topics">
          <button type="button" className={`knowledge-side-link ${activeCategory === 'All topics' ? 'is-active' : ''}`} aria-pressed={activeCategory === 'All topics'} onClick={() => chooseCategory('All topics')}>
            <LayoutDashboard size={17} /><span>Overview</span><small>{allItems.length}</small>
          </button>
          {knowledgeCategories.filter((category) => category !== 'All topics').map((category) => {
            const Icon = iconByCategory[category] ?? BookOpen;
            return <button type="button" key={category} className={`knowledge-side-link ${activeCategory === category ? 'is-active' : ''}`} aria-pressed={activeCategory === category} onClick={() => chooseCategory(category)}>
              <Icon size={17} /><span>{category}</span><small>{categoryCount(category)}</small>
            </button>;
          })}
        </nav>

        <p className="knowledge-sidebar-label knowledge-sidebar-label-tools">EXPLORE</p>
        <nav className="knowledge-side-nav" aria-label="More Drinkarto guides">
          <Link href="/dictionary" className="knowledge-side-link"><BookOpen size={17} /><span>A–Z dictionary</span><ArrowUpRight size={13} /></Link>
          <Link href="/compare" className="knowledge-side-link"><Sparkles size={17} /><span>Compare styles</span><ArrowUpRight size={13} /></Link>
          <Link href="/business" className="knowledge-side-link"><Building2 size={17} /><span>Business overview</span><ArrowUpRight size={13} /></Link>
        </nav>

        <div className="knowledge-sidebar-note">
          <span className="knowledge-sidebar-note-icon"><ShieldCheck size={16} /></span>
          <strong>Curiosity, with care.</strong>
          <p>Adult learning only. Drinkarto does not sell alcohol.</p>
        </div>
      </aside>

      <div className="knowledge-main">
        <div className="knowledge-topbar">
          <div className="knowledge-breadcrumb"><span>Knowledge</span><span>/</span><strong>{activeCategory === 'All topics' ? 'Overview' : activeCategory}</strong></div>
          <span className="knowledge-topbar-status"><i /> SOURCE-LINKED LEARNING</span>
        </div>

        <section className="knowledge-dashboard-hero" aria-labelledby="knowledge-title">
          <div className="knowledge-dashboard-intro">
            <p className="public-eyebrow"><span className="knowledge-live-dot" /> THE DRINKARTO FIELD GUIDE · FOR ADULTS 18+</p>
            <h1 id="knowledge-title">Every bottle has<br /><em>a story to tell.</em></h1>
            <p className="knowledge-dashboard-lede">Explore the people, places and craft behind wine and spirits. Choose a path, follow a question, and learn from the original sources.</p>
            <label className="knowledge-search knowledge-dashboard-search">
              <Search size={18} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search the knowledge library" placeholder="Search brands, places, styles or business guides…" />
              {query && <button type="button" className="knowledge-clear-search" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
              <span className="knowledge-search-shortcut">SEARCH</span>
            </label>
            <div className="knowledge-dashboard-stats" aria-label="Library details">
              <span><BookOpen size={15} /><strong>{allItems.length}</strong> field notes</span>
              <span><MapPin size={15} /><strong>{knowledgeCategories.length - 1}</strong> learning topics</span>
              <span><ShieldCheck size={15} /><strong>18+</strong> adult reference</span>
            </div>
          </div>

          <div className="knowledge-atlas-card">
            <span className="knowledge-atlas-kicker"><Compass size={14} /> THE ATLAS · START HERE</span>
            <KnowledgeImage photo={knowledgePhotos.agave} className="knowledge-atlas-photo" sizes="(max-width: 620px) 80vw, 260px" priority />
            <Link href="/guides/tequila-origin" className="knowledge-atlas-copy"><small>PLACE & PROVENANCE</small><strong>Discover how a place<br />shapes what’s in the glass.</strong><span>Explore the world atlas <ArrowRight size={15} /></span></Link>
          </div>
        </section>

        <section className="knowledge-topic-section" aria-labelledby="topic-title">
          <div className="knowledge-dashboard-section-head">
            <div><p className="public-eyebrow">YOUR LEARNING PATH</p><h2 id="topic-title">Choose a topic to explore</h2></div>
            <span>{knowledgeCategories.length - 1} curated topics</span>
          </div>
          <div className="knowledge-topic-grid">
            {knowledgeCategories.filter((category) => category !== 'All topics').map((category) => {
              const Icon = iconByCategory[category] ?? BookOpen;
              return <button type="button" key={category} className={`knowledge-topic-tile ${activeCategory === category ? 'is-active' : ''}`} onClick={() => chooseCategory(category)} aria-pressed={activeCategory === category}>
                <span className="knowledge-topic-icon"><Icon size={20} strokeWidth={1.7} /></span>
                <span className="knowledge-topic-copy"><strong>{category}</strong><small>{categoryDescriptions[category]}</small></span>
                <span className="knowledge-topic-count">{categoryCount(category)} <ArrowUpRight size={14} /></span>
              </button>;
            })}
          </div>
        </section>

        <section className="knowledge-picks-section" aria-labelledby="picks-title">
          <div className="knowledge-dashboard-section-head">
            <div><p className="public-eyebrow">EDITOR’S PICKS</p><h2 id="picks-title">Good places to begin</h2></div>
            <button type="button" className="knowledge-see-all" onClick={() => chooseCategory('All topics')}>View all field notes <ArrowRight size={15} /></button>
          </div>
          <div className="knowledge-picks-grid">
            {featuredItems.map((item, index) => {
              const Icon = iconByCategory[item.category] ?? BookOpen;
              const labels = ['START WITH THE BASICS', 'A STORY FROM INDIA', 'FOR FUTURE FOUNDERS'];
              const photo = knowledgePhotoFor(item.slug);
              return <article className={`knowledge-pick-card knowledge-pick-card-${index + 1}`} key={item.slug}>
                {photo && <KnowledgeImage photo={photo} className="knowledge-pick-photo" sizes="(max-width: 700px) 100vw, (max-width: 1100px) 80vw, 30vw" />}
                <Link className="knowledge-pick-link" href={`/guides/${item.slug}`}>
                  <span className="knowledge-pick-top"><span className="knowledge-pick-icon"><Icon size={18} /></span><span>{labels[index] ?? 'FIELD NOTE'}</span><ArrowUpRight size={16} /></span>
                  <span className="knowledge-pick-title">{item.title}</span>
                  <span className="knowledge-pick-description">{item.description}</span>
                  <span className="knowledge-pick-bottom"><span><Clock3 size={13} /> {item.readingTime}</span><span>Read note <ArrowRight size={14} /></span></span>
                </Link>
              </article>;
            })}
          </div>
        </section>

        <section className="knowledge-library knowledge-dashboard-library" id="knowledge-library" aria-labelledby="library-title">
          <div className="knowledge-dashboard-section-head knowledge-library-head">
            <div><p className="public-eyebrow">THE KNOWLEDGE LIBRARY</p><h2 id="library-title">{activeCategory === 'All topics' ? 'All field notes' : activeCategory}</h2><p className="knowledge-section-description">Browse source-linked notes, or narrow the list with a search.</p></div>
            <span className="knowledge-library-count"><strong>{visibleItems.length.toString().padStart(2, '0')}</strong> {visibleItems.length === 1 ? 'NOTE' : 'NOTES'}</span>
          </div>
          <div className="knowledge-results-top"><p role="status">Showing <strong>{visibleItems.length}</strong> {visibleItems.length === 1 ? 'guide' : 'guides'}{query.trim() ? ` for “${query.trim()}”` : ''}</p><Link href="/dictionary">Open the A–Z dictionary <ArrowUpRight size={14} /></Link></div>
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
          <Link href="/guides/business-from-scratch" className="knowledge-feature knowledge-feature-business"><span className="knowledge-feature-kicker"><Factory size={14} /> FIELD NOTES · FOR FOUNDERS</span><strong>Make the first move<br />a well-informed one.</strong><span className="knowledge-feature-desc">From business model to state approvals and channel partnerships.</span><span className="knowledge-feature-link">Open the founder’s path <ArrowUpRight size={15} /></span><span className="knowledge-feature-stamp">BUILD<br />LEGALLY</span></Link>
        </section>
        <p className="knowledge-disclaimer"><ShieldCheck size={15} /> Educational reference. Liquor regulations, access ages, approved activities and venue details vary by place and change over time. Always check current official sources.</p>
      </div>
    </div>
  );
}
