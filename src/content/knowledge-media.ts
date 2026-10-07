export type KnowledgePhoto = {
  src: string;
  title: string;
  alt: string;
  caption: string;
  author: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
};

export const knowledgePhotos = {
  agave: {
    src: '/images/knowledge/agave-fields.jpg',
    title: 'Agave fields in Tequila, Jalisco',
    alt: 'Rows of blue agave plants across a sunlit field in Tequila, Jalisco.',
    caption: 'The landscape behind Tequila',
    author: 'Javier Salazar Villagomez',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Campos_de_Agave,_Tequila,_Jalisco_y_su_ancestral_bebida_tradicional.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  casks: {
    src: '/images/knowledge/whisky-casks.jpg',
    title: 'Casks maturing at The Glenmorangie Distillery',
    alt: 'Rows of wooden casks resting in a whisky maturation warehouse.',
    caption: 'Time and oak in a maturation warehouse',
    author: 'Glenmorangie',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Casks_maturing_at_The_Glenmorangie_Distillery.jpg',
    license: 'Public domain',
    licenseUrl: 'https://commons.wikimedia.org/wiki/File:Casks_maturing_at_The_Glenmorangie_Distillery.jpg#Licensing',
  },
  feni: {
    src: '/images/knowledge/goa-feni-distilling.jpg',
    title: 'Distilling cashew fenny in Goa',
    alt: 'A traditional outdoor cashew feni distillation setup in Goa.',
    caption: 'A traditional cashew feni still in Goa',
    author: 'abcdz2000',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Distilling_cashew_fenny.jpg',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
  },
  grapes: {
    src: '/images/knowledge/kerala-grape-garden.jpg',
    title: 'Grape garden in Kerala',
    alt: 'Grapevines growing on trellises in a garden in Kerala, India.',
    caption: 'Vines and fruit in an Indian grape garden',
    author: 'Ashlyak',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Grape_Garden.JPG',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  stills: {
    src: '/images/knowledge/copper-stills.jpg',
    title: 'Copper pot stills at ASW Distillery',
    alt: 'Copper pot stills used for spirit production inside a distillery.',
    caption: 'Copper stills used in spirit production',
    author: 'Thechadwix',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:ASW_Distillery%27s_copper_pot_stills,_manufactured_by_Vendome_Copper_%26_Brass_Works.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
} satisfies Record<string, KnowledgePhoto>;

const photoBySlug: Record<string, keyof typeof knowledgePhotos> = {
  'spirit-families': 'casks',
  'wine-styles-map': 'grapes',
  'premium-bottle': 'casks',
  'scotch-heritage': 'casks',
  'japanese-whisky-heritage': 'casks',
  'tequila-origin': 'agave',
  'france-cognac-champagne': 'grapes',
  'port-douro': 'grapes',
  'goa-feni-heritage': 'feni',
  'sula-nashik-brand-story': 'grapes',
  'sensory-tasting-framework': 'grapes',
  'visits-and-workshops': 'stills',
  'business-from-scratch': 'stills',
  'license-pathways-india': 'stills',
  'become-distributor-partner': 'stills',
  'fssai-and-product-labels': 'stills',
  'taste-language': 'grapes',
  storage: 'casks',
};

export function knowledgePhotoFor(slug: string): KnowledgePhoto | undefined {
  const photoKey = photoBySlug[slug];
  return photoKey ? knowledgePhotos[photoKey] : undefined;
}
