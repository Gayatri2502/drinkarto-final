import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Building2, Clock3,
  Compass, Factory, Grape, List, Map, MapPin, Search, ShieldCheck, Sparkles, Wine,
} from 'lucide-react';
import { KnowledgeImage } from '@/components/knowledge-image';
import { guides, educationSources } from '@/content/public';
import { knowledgeArticles } from '@/content/knowledge';
import { knowledgePhotoFor } from '@/content/knowledge-media';

export function generateStaticParams() {
  return [...guides.map((guide) => ({ slug: guide.slug })), ...knowledgeArticles.map((article) => ({ slug: article.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = knowledgeArticles.find((item) => item.slug === slug);
  const guide = guides.find((item) => item.slug === slug);
  const title = article?.title ?? guide?.title ?? 'Guide not found';
  const description = article?.summary ?? guide?.description ?? 'Read source-linked Drinkarto educational guides for adults.';
  return { title, description };
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
  const photo = knowledgePhotoFor(slug);
  const related = article
    ? knowledgeArticles.filter((item) => item.category === article.category && item.slug !== article.slug).slice(0, 3)
    : knowledgeArticles.slice(0, 3);
  const Icon = categoryIcon[category] ?? BookOpen;

  return <div className="public-container public-page"><div className="desk-shell"><aside className="desk-sidebar"><Link href="/guides">← Knowledge</Link><h2>In this guide</h2>{sections.map((section,i)=><a key={section.heading} href={"#section-"+(i+1)}>{section.heading}</a>)}<Link href="/dictionary">Drinks A–Z ↗</Link></aside><article className="desk-main guide-compact"><header className="desk-feature"><span className="desk-label">{category} · {readingTime}</span><h1>{title}</h1><p>{summary}</p></header>{sections.map((section,i)=><section id={"section-"+(i+1)} key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}{article?.note&&<aside className="guide-note">{article.note}</aside>}<section><h2>Sources</h2>{sources.map(source=><p key={source.url}><a href={source.url} target={source.url.startsWith("/")?undefined:"_blank"} rel="noreferrer">{source.label} ↗</a></p>)}</section></article></div></div>;
}
