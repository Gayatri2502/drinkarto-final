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
  ginTonic: {
    src: '/images/editorial/gin-tonic.jpg',
    title: 'Gin and tonic with ingredients',
    alt: 'A glass of gin and tonic with a lime wedge, with citrus and bottles softly out of focus behind it.',
    caption: 'Gin and tonic · serving example',
    author: 'NotFromUtrecht',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gin_and_Tonic_with_ingredients.jpg',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  whiskyHighball: {
    src: '/images/editorial/whisky-highball.jpg',
    title: 'Whisky soda highball',
    alt: 'A whisky soda highball served over ice with a lemon wedge.',
    caption: 'Whisky soda · serving example',
    author: 'uka0310',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Whisky_soda_high_ball_by_uca0310_2013.jpg',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
  },
  wineGrapes: {
    src: '/images/editorial/wine-grapes-baja.jpg',
    title: 'Wine grapes in Guadalupe Valley, Baja California',
    alt: 'Green and purple wine grapes growing among leaves in Guadalupe Valley, Baja California.',
    caption: 'Wine grapes in Guadalupe Valley, Baja California',
    author: 'Tomás Castelazo',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wine_grapes_baja.jpg',
    license: 'CC BY-SA 2.5',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.5/',
  },
  wineBottling: {
    src: '/images/editorial/wine-bottling-line.jpg',
    title: 'Wine bottles on a winery bottling line',
    alt: 'Wine bottles moving along a bottling line inside a winery.',
    caption: 'Wine bottling line · production context',
    author: 'David Herrera',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wine_bottling_line_at_Chateau_Ste._Michelle_Winery.jpg',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
  },
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
    alt: 'Rows of wooden casks maturing at The Glenmorangie Distillery in Scotland.',
    caption: 'Casks maturing at The Glenmorangie Distillery',
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
    caption: 'Copper pot stills at ASW Distillery',
    author: 'Thechadwix',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:ASW_Distillery%27s_copper_pot_stills,_manufactured_by_Vendome_Copper_%26_Brass_Works.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
} satisfies Record<string, KnowledgePhoto>;

const photoBySlug: Record<string, keyof typeof knowledgePhotos> = {
  'spirit-families': 'stills',
  'wine-styles-map': 'wineGrapes',
  'scotch-heritage': 'casks',
  'tequila-origin': 'agave',
  'goa-feni-heritage': 'feni',
};

export function knowledgePhotoFor(slug: string): KnowledgePhoto | undefined {
  const photoKey = photoBySlug[slug];
  return photoKey ? knowledgePhotos[photoKey] : undefined;
}
