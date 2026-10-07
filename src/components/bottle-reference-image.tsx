import Image from 'next/image';
import { bottleReferencePhotos } from '@/content/knowledge-media';

export function hasBottleReferenceImage(category: string) {
  return Boolean(bottleReferencePhotos[category]);
}

/**
 * Publicly sourced category-level bottle examples. These are deliberately not
 * attached to a product identity because the app has not verified SKU-level
 * packaging for its workbook records.
 */
export function BottleReferenceImage({
  category,
  className = '',
  priority = false,
}: {
  category: string;
  className?: string;
  priority?: boolean;
}) {
  const photo = bottleReferencePhotos[category];
  if (!photo) return null;

  return (
    <figure className={`bottle-reference-photo ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        title={photo.title}
        width={photo.width}
        height={photo.height}
        unoptimized
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
      />
      <figcaption>
        <span>Representative {category.toLowerCase()} bottle · not an exact product match</span>
        <small>
          Photo: <a href={photo.sourceUrl} target="_blank" rel="noreferrer">{photo.author} · source</a>
          {' · '}<a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a>
        </small>
      </figcaption>
    </figure>
  );
}
