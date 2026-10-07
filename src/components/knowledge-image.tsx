import Image from 'next/image';
import type { KnowledgePhoto } from '@/content/knowledge-media';

export function KnowledgeImage({
  photo,
  className = '',
  sizes = '(max-width: 700px) 100vw, 420px',
  priority = false,
}: {
  photo: KnowledgePhoto;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <figure className={`knowledge-photo ${className}`}>
      <Image src={photo.src} alt={photo.alt} title={photo.title} fill sizes={sizes} priority={priority} />
      <figcaption className="knowledge-photo-caption">
        <span>{photo.caption}</span>
        <small>
          Photo by <a href={photo.sourceUrl} target="_blank" rel="noreferrer">{photo.author} · source</a>
          {' · '}<a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a>
          {' · web-optimized display'}
        </small>
      </figcaption>
    </figure>
  );
}
