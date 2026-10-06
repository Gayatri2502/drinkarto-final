import { notFound } from 'next/navigation';
import Link from 'next/link';
import { guides, educationSources } from '@/content/public';
import { knowledgeArticles } from '@/content/knowledge';

export function generateStaticParams() {
  return [...guides.map((guide) => ({ slug: guide.slug })), ...knowledgeArticles.map((article) => ({ slug: article.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const knowledgeArticle = knowledgeArticles.find((article) => article.slug === slug);
  const guide = guides.find((item) => item.slug === slug);
  return { title: knowledgeArticle?.title ?? guide?.title ?? 'Guide not found' };
}

export default async function Guide({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = knowledgeArticles.find((item) => item.slug === slug);
  const guide = guides.find((item) => item.slug === slug);
  if (!article && !guide) notFound();

  if (article) {
    return <article className="public-container public-page public-article knowledge-article">
      <Link href="/guides" className="public-back">← Knowledge library</Link>
      <p className="public-eyebrow">{article.category} <span>·</span> {article.readingTime} read</p>
      <h1>{article.title}</h1>
      <p className="public-intro">{article.summary}</p>
      <div className="knowledge-article-contents"><p className="public-eyebrow">IN THIS FIELD NOTE</p>{article.sections.map((section, index) => <a key={section.heading} href={`#section-${index + 1}`}><span>0{index + 1}</span>{section.heading}</a>)}</div>
      {article.sections.map((section, index) => <section id={`section-${index + 1}`} key={section.heading}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{section.heading}</h2><p>{section.body}</p></div></section>)}
      {article.note && <aside className="knowledge-article-note"><p className="public-eyebrow">PLEASE KEEP IN MIND</p><p>{article.note}</p></aside>}
      <div className="knowledge-sources"><div><p className="public-eyebrow">GO TO THE ORIGINAL SOURCES</p><h2>Keep reading from the source.</h2><p>These references informed this field note. Check live pages for current rules, booking details or amendments.</p></div><div className="knowledge-source-links">{article.sources.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{item.label}<span>↗</span></a>)}</div></div>
      <div className="knowledge-article-next"><Link href="/guides">← Back to all topics</Link><Link href="/dictionary">Explore the A–Z dictionary ↗</Link></div>
    </article>;
  }

  return <article className="public-container public-page public-article">
    <Link href="/guides" className="public-back">← Knowledge library</Link><p className="public-eyebrow">{guide!.category}</p><h1>{guide!.title}</h1><p className="public-intro">{guide!.description}</p>
    {guide!.sections.map(([heading, body], index) => <section key={heading}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{heading}</h2><p>{body}</p></div></section>)}
    <div className="article-source">Further reference: {guide!.slug === 'price-sources' ? <Link href="/prices">Official state source directory ↗</Link> : <a href={educationSources[guide!.source]} target="_blank" rel="noreferrer">WSET educational resources ↗</a>}<p>Educational overview. Check the exact bottle label and producer’s instructions.</p></div><Link href="/dictionary" className="public-button">Explore the dictionary ↗</Link>
  </article>;
}
