import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Building2, Clock3,
  Compass, Factory, Grape, List, Map, MapPin, Search, ShieldCheck, Sparkles, Wine,
} from 'lucide-react';
import { guides, educationSources } from '@/content/public';
import { knowledgeArticles } from '@/content/knowledge';

export function generateStaticParams() {
  return [...guides.map((guide) => ({ slug: guide.slug })), ...knowledgeArticles.map((article) => ({ slug: article.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = knowledgeArticles.find((item) => item.slug === slug);
  const guide = guides.find((item) => item.slug === slug);
  return { title: article?.title ?? guide?.title ?? 'Guide not found' };
}

const categoryIcon: Record<string, typeof BookOpen> = {
  'Styles & production': Wine,
  'Brands & buying literacy': Sparkles,
  'Brands & heritage': BookOpen,
  'Places & heritage': Map,
  'Taste & responsible use': ShieldCheck,
  'Visits & workshops': Compass,
  'Start a business': Building2,
  'Bottle & price guides': Grape,
};

const quickLinks = [
  { href: '/guides', label: 'Knowledge overview', icon: BookOpen },
  { href: '/dictionary', label: 'A–Z dictionary', icon: Search },
  { href: '/compare', label: 'Compare styles', icon: Sparkles },
  { href: '/business', label: 'Business hub', icon: Factory },
];

export default async function Guide({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = knowledgeArticles.find((item) => item.slug === slug);
  const guide = guides.find((item) => item.slug === slug);
  if (!article && !guide) notFound();

  const title = article?.title ?? guide!.title;
  const category = article?.category ?? guide!.category;
  const summary = article?.summary ?? guide!.description;
  const readingTime = article?.readingTime ?? '3 min';
  const sections = article?.sections ?? guide!.sections.map(([heading, body]) => ({ heading, body }));
  const sources = article?.sources ?? (guide!.slug === 'price-sources'
    ? [{ label: 'Drinkarto · State price source directory', url: '/prices' }]
    : [{ label: 'WSET · Educational resources', url: educationSources[guide!.source] }]);
  const related = article
    ? knowledgeArticles.filter((item) => item.category === article.category && item.slug !== article.slug).slice(0, 3)
    : knowledgeArticles.slice(0, 3);
  const Icon = categoryIcon[category] ?? BookOpen;

  return (
    <div className="public-container knowledge-reader-shell">
      <aside className="knowledge-reader-sidebar" aria-label="Knowledge navigation">
        <Link href="/guides" className="knowledge-reader-brand">
          <span className="knowledge-reader-brand-mark"><Sparkles size={17} /></span>
          <span><strong>DRINKARTO</strong><small>KNOWLEDGE DESK</small></span>
        </Link>

        <Link href="/guides" className="knowledge-reader-back"><ArrowLeft size={15} /> All field notes</Link>

        <p className="knowledge-reader-label">EXPLORE</p>
        <nav className="knowledge-reader-nav">
          {quickLinks.map(({ href, label, icon: LinkIcon }) => (
            <Link href={href} key={href} className="knowledge-reader-nav-link">
              <LinkIcon size={17} /><span>{label}</span><ArrowUpRight size={13} />
            </Link>
          ))}
        </nav>

        <div className="knowledge-reader-current">
          <span className="knowledge-reader-current-icon"><Icon size={17} /></span>
          <span><small>YOU’RE READING</small><strong>{category}</strong></span>
        </div>

        <div className="knowledge-reader-care">
          <ShieldCheck size={17} />
          <strong>Learn with context</strong>
          <p>Adult education only. Rules and access ages differ by location.</p>
        </div>
      </aside>

      <main className="knowledge-reader-main">
        <nav className="knowledge-reader-breadcrumb" aria-label="Breadcrumb">
          <Link href="/guides">Knowledge</Link><span>/</span><span>{category}</span>
        </nav>

        <header className="knowledge-reader-hero">
          <div className="knowledge-reader-hero-copy">
            <span className="knowledge-reader-kicker"><Icon size={15} /> {category.toUpperCase()}</span>
            <h1>{title}</h1>
            <p>{summary}</p>
            <div className="knowledge-reader-meta">
              <span><Clock3 size={15} /> {readingTime} read</span>
              <span><BookOpen size={15} /> Field note {String(Math.max(1, knowledgeArticles.findIndex((item) => item.slug === slug) + 1)).padStart(2, '0')}</span>
              <span><ShieldCheck size={15} /> Source-linked</span>
            </div>
          </div>
          <div className={`knowledge-reader-art knowledge-reader-art-${article?.category === 'Start a business' ? 'business' : article?.category === 'Places & heritage' ? 'place' : article?.category === 'Taste & responsible use' ? 'taste' : 'craft'}`} aria-hidden="true">
            <span className="knowledge-reader-orbit knowledge-reader-orbit-one" />
            <span className="knowledge-reader-orbit knowledge-reader-orbit-two" />
            <span className="knowledge-reader-art-dot knowledge-reader-art-dot-one" />
            <span className="knowledge-reader-art-dot knowledge-reader-art-dot-two" />
            <span className="knowledge-reader-art-icon"><Icon size={43} strokeWidth={1.25} /></span>
            <span className="knowledge-reader-art-index">FIELD GUIDE<br />NO. {String(Math.max(1, knowledgeArticles.findIndex((item) => item.slug === slug) + 1)).padStart(2, '0')}</span>
            <span className="knowledge-reader-art-caption">DRINKARTO<br />REFERENCE ATLAS</span>
          </div>
          <div className="knowledge-reader-hero-foot"><span><MapPin size={14} /> KNOWLEDGE FOR CURIOUS ADULTS</span><span>READ · REFLECT · VERIFY</span></div>
        </header>

        <div className="knowledge-reading-layout">
          <article className="knowledge-reading-body">
            {sections.map((section, index) => (
              <section className="knowledge-reading-section" id={`section-${index + 1}`} key={section.heading}>
                <div className="knowledge-reading-section-index"><span>{String(index + 1).padStart(2, '0')}</span><i /></div>
                <div>
                  <p className="knowledge-reading-overline">CHAPTER {String(index + 1).padStart(2, '0')}</p>
                  <h2>{section.heading}</h2>
                  <p>{section.body}</p>
                </div>
              </section>
            ))}

            {article?.note && (
              <aside className="knowledge-reader-note">
                <ShieldCheck size={19} />
                <div><p className="knowledge-reading-overline">A NOTE ON RESPONSIBILITY</p><p>{article.note}</p></div>
              </aside>
            )}

            <section className="knowledge-reader-sources" aria-labelledby="source-title">
              <div className="knowledge-reader-sources-heading">
                <span><BookOpen size={17} /></span>
                <div><p className="knowledge-reading-overline">FOLLOW THE EVIDENCE</p><h2 id="source-title">Original sources</h2><p>Use these primary references to check current details and continue learning.</p></div>
              </div>
              <div className="knowledge-reader-source-list">
                {sources.map((source) => (
                  <a key={source.url} href={source.url} target={source.url.startsWith('/') ? undefined : '_blank'} rel={source.url.startsWith('/') ? undefined : 'noreferrer'}>
                    <span>{source.label}</span><ArrowUpRight size={16} />
                  </a>
                ))}
              </div>
            </section>
          </article>

          <aside className="knowledge-reader-toc" aria-label="In this field note">
            <div className="knowledge-reader-toc-head"><List size={15} /><span>IN THIS FIELD NOTE</span></div>
            <nav>
              {sections.map((section, index) => (
                <a key={section.heading} href={`#section-${index + 1}`}><span>{String(index + 1).padStart(2, '0')}</span>{section.heading}</a>
              ))}
            </nav>
            <div className="knowledge-reader-toc-foot"><Clock3 size={14} /> About {readingTime}</div>
          </aside>
        </div>

        <section className="knowledge-reader-related" aria-labelledby="related-title">
          <div className="knowledge-reader-related-heading">
            <div><p className="knowledge-reading-overline">KEEP EXPLORING</p><h2 id="related-title">More from this collection</h2></div>
            <Link href="/guides">Browse all notes <ArrowRight size={15} /></Link>
          </div>
          <div className="knowledge-reader-related-grid">
            {related.map((item) => {
              const RelatedIcon = categoryIcon[item.category] ?? BookOpen;
              return <Link href={`/guides/${item.slug}`} className="knowledge-reader-related-card" key={item.slug}>
                <span className="knowledge-reader-related-icon"><RelatedIcon size={18} /></span>
                <span className="knowledge-reader-related-category">{item.category}</span>
                <strong>{item.title}</strong>
                <span className="knowledge-reader-related-link">Read field note <ArrowUpRight size={14} /></span>
              </Link>;
            })}
          </div>
        </section>

        <div className="knowledge-reader-end-nav">
          <Link href="/guides"><ArrowLeft size={15} /> Knowledge overview</Link>
          <Link href="/dictionary">Open the A–Z dictionary <ArrowRight size={15} /></Link>
        </div>
      </main>
    </div>
  );
}
