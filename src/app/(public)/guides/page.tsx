import KnowledgeHub from '@/components/knowledge-hub';
import { guides } from '@/content/public';

export const metadata = {
  title: 'Knowledge library · categories, heritage and business guides',
  description: 'Explore spirits and wine styles, brand stories, country heritage, responsible-use information, visitor experiences and a state-aware liquor business learning path.',
};

const categoryForGuide: Record<string, string> = {
  'bottle-sizes': 'Styles & production',
  'read-a-label': 'Brands & buying literacy',
  'taste-language': 'Taste & responsible use',
  storage: 'Styles & production',
  'price-sources': 'Bottle & price guides',
};

export default function Guides() {
  const legacyGuides = guides.map((guide) => ({
    slug: guide.slug,
    title: guide.title,
    category: categoryForGuide[guide.slug] ?? 'Bottle & price guides',
    description: guide.description,
    tags: [guide.slug, guide.category],
    readingTime: '3 min',
  }));
  return <KnowledgeHub legacyGuides={legacyGuides} />;
}
